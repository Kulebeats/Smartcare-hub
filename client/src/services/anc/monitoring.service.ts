/**
 * Real-time Monitoring Service for ANC
 * Tracks vitals, alerts, and clinical changes
 */

import { VitalSigns, MaternalAssessment, FetalAssessment } from '@/types/anc';
import { evaluateClinicalRules, ClinicalAlert } from './clinical-rules.service';
import { safeLog } from '@/utils/anc/safe-logger';

export interface MonitoringData {
  patientId: string;
  encounterId: string;
  timestamp: Date;
  vitalSigns?: VitalSigns;
  maternalAssessment?: MaternalAssessment;
  fetalAssessment?: FetalAssessment;
  alerts: ClinicalAlert[];
}

export interface MonitoringTrend {
  parameter: string;
  values: { timestamp: Date; value: number }[];
  trend: 'stable' | 'improving' | 'deteriorating';
  changeRate?: number;
}

export interface MonitoringSession {
  id: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  dataPoints: MonitoringData[];
  trends: MonitoringTrend[];
  criticalEvents: ClinicalAlert[];
  status: 'active' | 'paused' | 'completed';
}

class RealTimeMonitoringService {
  private sessions: Map<string, MonitoringSession> = new Map();
  private alertThresholds = {
    bloodPressure: {
      systolic: { min: 90, max: 140, critical_max: 160 },
      diastolic: { min: 60, max: 90, critical_max: 110 }
    },
    heartRate: { min: 60, max: 100, critical_min: 50, critical_max: 120 },
    temperature: { min: 36, max: 37.5, critical_max: 38.5 },
    fetalHeartRate: { min: 110, max: 160, critical_min: 100, critical_max: 180 },
    respiratoryRate: { min: 12, max: 20, critical_max: 30 }
  };
  
  /**
   * Start a new monitoring session
   */
  startSession(patientId: string, encounterId: string): string {
    const sessionId = `MON-${Date.now()}`;
    const session: MonitoringSession = {
      id: sessionId,
      patientId,
      startTime: new Date(),
      dataPoints: [],
      trends: [],
      criticalEvents: [],
      status: 'active'
    };
    
    this.sessions.set(sessionId, session);
    
    safeLog.clinical('Monitoring session started', {
      sessionId,
      patientId,
      encounterId
    });
    
    return sessionId;
  }
  
  /**
   * Add monitoring data point
   */
  addDataPoint(
    sessionId: string,
    data: Partial<MonitoringData>
  ): { success: boolean; alerts?: ClinicalAlert[] } {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return { success: false };
    }
    
    // Evaluate clinical rules
    const alerts = evaluateClinicalRules(data);
    
    // Create monitoring data point
    const dataPoint: MonitoringData = {
      patientId: session.patientId,
      encounterId: data.encounterId || '',
      timestamp: new Date(),
      vitalSigns: data.vitalSigns,
      maternalAssessment: data.maternalAssessment,
      fetalAssessment: data.fetalAssessment,
      alerts
    };
    
    session.dataPoints.push(dataPoint);
    
    // Track critical events
    const criticalAlerts = alerts.filter(a => a.rule.severity === 'critical');
    session.criticalEvents.push(...criticalAlerts);
    
    // Update trends
    this.updateTrends(session);
    
    // Check for immediate action needed
    if (criticalAlerts.length > 0) {
      this.triggerImmediateAlert(session, criticalAlerts);
    }
    
    return { success: true, alerts };
  }
  
  /**
   * Update monitoring trends
   */
  private updateTrends(session: MonitoringSession): void {
    const parameters = [
      { key: 'systolic', path: 'vitalSigns.bloodPressure.systolic' },
      { key: 'diastolic', path: 'vitalSigns.bloodPressure.diastolic' },
      { key: 'heartRate', path: 'vitalSigns.pulseRate' },
      { key: 'temperature', path: 'vitalSigns.temperature' },
      { key: 'fetalHeartRate', path: 'fetalAssessment.fetalHeartRate' }
    ];
    
    parameters.forEach(param => {
      const values = this.extractParameterValues(session.dataPoints, param.path);
      if (values.length >= 2) {
        const trend = this.calculateTrend(values);
        
        // Update or add trend
        const existingTrendIndex = session.trends.findIndex(t => t.parameter === param.key);
        if (existingTrendIndex >= 0) {
          session.trends[existingTrendIndex] = trend;
        } else {
          session.trends.push(trend);
        }
      }
    });
  }
  
  /**
   * Extract parameter values from data points
   */
  private extractParameterValues(
    dataPoints: MonitoringData[],
    path: string
  ): { timestamp: Date; value: number }[] {
    const values: { timestamp: Date; value: number }[] = [];
    
    dataPoints.forEach(point => {
      const value = this.getNestedValue(point, path);
      if (value !== undefined && typeof value === 'number') {
        values.push({
          timestamp: point.timestamp,
          value
        });
      }
    });
    
    return values;
  }
  
  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  /**
   * Calculate trend from values
   */
  private calculateTrend(
    values: { timestamp: Date; value: number }[]
  ): MonitoringTrend {
    if (values.length < 2) {
      return {
        parameter: '',
        values,
        trend: 'stable',
        changeRate: 0
      };
    }
    
    // Calculate linear regression for trend
    const n = values.length;
    const times = values.map((v, i) => i);
    const vals = values.map(v => v.value);
    
    const sumX = times.reduce((a, b) => a + b, 0);
    const sumY = vals.reduce((a, b) => a + b, 0);
    const sumXY = times.reduce((sum, x, i) => sum + x * vals[i], 0);
    const sumX2 = times.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Determine trend based on slope
    let trend: 'stable' | 'improving' | 'deteriorating' = 'stable';
    
    if (Math.abs(slope) < 0.5) {
      trend = 'stable';
    } else if (slope > 0) {
      // For some parameters, increasing is deteriorating (BP, temp)
      // For others, it might be improving
      trend = 'deteriorating'; // Simplified - should be parameter-specific
    } else {
      trend = 'improving'; // Simplified - should be parameter-specific
    }
    
    return {
      parameter: '',
      values,
      trend,
      changeRate: slope
    };
  }
  
  /**
   * Trigger immediate alert for critical conditions
   */
  private triggerImmediateAlert(
    session: MonitoringSession,
    alerts: ClinicalAlert[]
  ): void {
    safeLog.clinical('CRITICAL ALERT', {
      sessionId: session.id,
      patientId: session.patientId,
      alerts: alerts.map(a => ({
        message: a.rule.message,
        actions: a.rule.actions
      }))
    });
    
    // In a real implementation, this would:
    // - Send notifications to healthcare providers
    // - Trigger audio/visual alerts
    // - Update patient status board
    // - Initiate emergency protocols
  }
  
  /**
   * Get current monitoring status
   */
  getSessionStatus(sessionId: string): {
    active: boolean;
    duration: number;
    dataPointCount: number;
    criticalEventCount: number;
    trends: MonitoringTrend[];
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    const duration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();
    
    return {
      active: session.status === 'active',
      duration: Math.floor(duration / 1000), // seconds
      dataPointCount: session.dataPoints.length,
      criticalEventCount: session.criticalEvents.length,
      trends: session.trends
    };
  }
  
  /**
   * Get monitoring summary
   */
  getSessionSummary(sessionId: string): {
    startTime: Date;
    endTime?: Date;
    duration: string;
    totalAlerts: number;
    criticalAlerts: number;
    parameterRanges: Record<string, { min: number; max: number; avg: number }>;
    recommendations: string[];
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    const duration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();
    
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    
    // Calculate parameter ranges
    const parameterRanges: Record<string, { min: number; max: number; avg: number }> = {};
    
    session.trends.forEach(trend => {
      if (trend.values.length > 0) {
        const values = trend.values.map(v => v.value);
        parameterRanges[trend.parameter] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length
        };
      }
    });
    
    // Generate recommendations based on trends and events
    const recommendations: string[] = [];
    
    if (session.criticalEvents.length > 0) {
      recommendations.push('Immediate medical review required due to critical events');
    }
    
    session.trends.forEach(trend => {
      if (trend.trend === 'deteriorating') {
        recommendations.push(`Monitor ${trend.parameter} closely - deteriorating trend`);
      }
    });
    
    return {
      startTime: session.startTime,
      endTime: session.endTime,
      duration: `${hours}h ${minutes}m`,
      totalAlerts: session.dataPoints.reduce((sum, dp) => sum + dp.alerts.length, 0),
      criticalAlerts: session.criticalEvents.length,
      parameterRanges,
      recommendations
    };
  }
  
  /**
   * End monitoring session
   */
  endSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.endTime = new Date();
    session.status = 'completed';
    
    safeLog.clinical('Monitoring session ended', {
      sessionId,
      duration: session.endTime.getTime() - session.startTime.getTime(),
      dataPoints: session.dataPoints.length,
      criticalEvents: session.criticalEvents.length
    });
    
    return true;
  }
  
  /**
   * Export session data for analysis
   */
  exportSessionData(sessionId: string): MonitoringSession | null {
    return this.sessions.get(sessionId) || null;
  }
}

// Export singleton instance
export const monitoringService = new RealTimeMonitoringService();