// Using native fetch instead of axios for better compatibility
const fetch = globalThis.fetch || require('node-fetch');

/**
 * Danger Signs Integration Service
 * Connects SmartCare PRO ANC system with the enterprise danger signs backend
 */

const DANGER_SIGNS_SERVICE_URL = process.env.DANGER_SIGNS_SERVICE_URL || 'http://localhost:3001';

interface DangerSignsRequest {
  patientId: string;
  field: string;
  value: any;
  context?: Record<string, any>;
  metadata?: {
    gestationalAge?: string;
    providerId?: string;
    facilityId?: string;
  };
}

interface BulkDangerSignsRequest {
  patientId: string;
  symptoms: Record<string, any>;
  metadata?: {
    gestationalAge?: string;
    providerId?: string;
    facilityId?: string;
  };
}

interface DangerSignsAlert {
  severity: 'Red' | 'Orange' | 'Yellow';
  message: string;
  recommendations: string[];
  referralRequired: boolean;
  urgency: string;
  ruleId: string;
  category: string;
  priority: number;
  timestamp: string;
  patientId: string;
}

interface DangerSignsResponse {
  success: boolean;
  alertCount: number;
  alerts: DangerSignsAlert[];
  metadata: {
    evaluatedAt: string;
    rulesEvaluated: number;
    patientId: string;
  };
}

interface BulkDangerSignsResponse extends DangerSignsResponse {
  riskScore: number;
  groupedBySeverity: Record<string, DangerSignsAlert[]>;
  summary: {
    red: number;
    orange: number;
    yellow: number;
  };
}

class DangerSignsIntegration {
  private baseURL: string;

  constructor() {
    this.baseURL = DANGER_SIGNS_SERVICE_URL;
  }

  /**
   * Evaluate a single clinical finding for danger signs
   */
  async evaluateSingleField(request: DangerSignsRequest): Promise<DangerSignsResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/alerts/danger-signs`, request, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error evaluating danger signs:', error);
      throw new Error('Failed to evaluate danger signs');
    }
  }

  /**
   * Evaluate multiple symptoms for comprehensive danger signs assessment
   */
  async evaluateBulkSymptoms(request: BulkDangerSignsRequest): Promise<BulkDangerSignsResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/alerts/danger-signs/bulk`, request, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error evaluating bulk danger signs:', error);
      throw new Error('Failed to evaluate bulk danger signs');
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 3000
      });
      
      return response.data;
    } catch (error) {
      console.error('Danger signs service health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Get available danger sign categories
   */
  async getCategories(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/danger-signs/categories`, {
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching danger sign categories:', error);
      throw new Error('Failed to fetch danger sign categories');
    }
  }

  /**
   * Convert ANC vital signs to danger signs format
   */
  convertANCVitalSigns(ancData: any): Record<string, any> {
    const dangerSignsData: Record<string, any> = {};

    // Blood pressure conversion
    if (ancData.systolicBP) dangerSignsData.systolicBP = parseInt(ancData.systolicBP);
    if (ancData.diastolicBP) dangerSignsData.diastolicBP = parseInt(ancData.diastolicBP);

    // Oxygen saturation
    if (ancData.oxygenSaturation) dangerSignsData.oxygenSaturation = parseInt(ancData.oxygenSaturation);

    // Hemoglobin
    if (ancData.hemoglobin) dangerSignsData.hemoglobin = parseFloat(ancData.hemoglobin);

    // Fetal heart rate
    if (ancData.fetalHeartRate) dangerSignsData.fetalHeartRate = parseInt(ancData.fetalHeartRate);

    // Symptoms
    if (ancData.severePersistentHeadache) dangerSignsData.severePersistentHeadache = ancData.severePersistentHeadache === 'yes';
    if (ancData.bleedingPerVaginam) dangerSignsData.bleedingPerVaginam = ancData.bleedingPerVaginam === 'yes';
    if (ancData.dyspnoea) dangerSignsData.dyspnoea = ancData.dyspnoea === 'yes';

    // Laboratory results
    if (ancData.syphilisResult) dangerSignsData.syphilisResult = ancData.syphilisResult;
    if (ancData.urineProtein) dangerSignsData.urineProtein = ancData.urineProtein;

    // Physical examination
    if (ancData.pallor) dangerSignsData.pallor = ancData.pallor;

    return dangerSignsData;
  }

  /**
   * Evaluate ANC data for danger signs
   */
  async evaluateANCData(patientId: string, ancData: any, gestationalAge?: string): Promise<BulkDangerSignsResponse> {
    const symptoms = this.convertANCVitalSigns(ancData);
    
    const request: BulkDangerSignsRequest = {
      patientId,
      symptoms,
      metadata: {
        gestationalAge,
        providerId: ancData.createdBy?.toString(),
        facilityId: ancData.facilityId?.toString()
      }
    };

    return this.evaluateBulkSymptoms(request);
  }
}

// Export singleton instance
export const dangerSignsService = new DangerSignsIntegration();

// Export types for use in other files
export type {
  DangerSignsRequest,
  BulkDangerSignsRequest,
  DangerSignsAlert,
  DangerSignsResponse,
  BulkDangerSignsResponse
};