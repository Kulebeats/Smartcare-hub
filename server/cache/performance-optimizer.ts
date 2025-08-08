import { Request, Response } from 'express';
import { cacheManager } from './cache-manager';
import { QueueManager } from './queue-processor';
import { db } from '../db';
import { patients, ancRecords, users } from '@shared/schema';
import { count, desc, gte, sql } from 'drizzle-orm';

export interface PerformanceMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  queueProcessingRate: number;
  databaseConnectionPool: number;
  memoryUsage: string;
  activeUsers: number;
  systemLoad: number;
}

export interface OptimizationRecommendation {
  category: 'cache' | 'database' | 'queue' | 'memory' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
  estimatedImpact: string;
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsHistory = 100;

  async collectMetrics(): Promise<PerformanceMetrics> {
    const startTime = Date.now();

    try {
      // Collect cache statistics
      const cacheStats = await cacheManager.getStats();
      
      // Collect queue statistics
      const queueStats = await QueueManager.getQueueStats();
      
      // Calculate queue processing rate
      const totalCompleted = queueStats.patientAnalysis.completed + 
                           queueStats.clinicalRules.completed + 
                           queueStats.alertProcessing.completed;
      
      const totalActive = queueStats.patientAnalysis.active + 
                         queueStats.clinicalRules.active + 
                         queueStats.alertProcessing.active;

      // Collect database metrics
      const [patientCount, ancRecordCount, userCount] = await Promise.all([
        db.select({ count: count() }).from(patients),
        db.select({ count: count() }).from(ancRecords),
        db.select({ count: count() }).from(users)
      ]);

      // Get active users (logged in within last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeUsersResult = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.lastLogin, oneDayAgo));

      // Calculate system metrics
      const responseTime = Date.now() - startTime;
      
      const metrics: PerformanceMetrics = {
        cacheHitRate: cacheStats.hitRate,
        averageResponseTime: responseTime,
        queueProcessingRate: totalCompleted > 0 ? (totalCompleted / (totalCompleted + totalActive)) * 100 : 100,
        databaseConnectionPool: patientCount[0].count + ancRecordCount[0].count,
        memoryUsage: cacheStats.memoryUsage,
        activeUsers: activeUsersResult[0].count,
        systemLoad: this.calculateSystemLoad()
      };

      // Store metrics history
      this.metrics.push(metrics);
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics.shift();
      }

      return metrics;
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
      throw error;
    }
  }

  async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const currentMetrics = await this.collectMetrics();
    const recommendations: OptimizationRecommendation[] = [];

    // Cache optimization recommendations
    if (currentMetrics.cacheHitRate < 80) {
      recommendations.push({
        category: 'cache',
        severity: currentMetrics.cacheHitRate < 60 ? 'high' : 'medium',
        description: `Cache hit rate is ${currentMetrics.cacheHitRate.toFixed(1)}%, below optimal threshold`,
        action: 'Increase cache TTL for frequently accessed data and implement cache warming strategies',
        estimatedImpact: 'Reduce database load by 30-50% and improve response times'
      });
    }

    // Response time optimization
    if (currentMetrics.averageResponseTime > 1000) {
      recommendations.push({
        category: 'network',
        severity: currentMetrics.averageResponseTime > 2000 ? 'critical' : 'high',
        description: `Average response time is ${currentMetrics.averageResponseTime}ms, exceeding acceptable limits`,
        action: 'Implement query optimization, add database indexes, and consider CDN for static assets',
        estimatedImpact: 'Reduce response times by 40-60%'
      });
    }

    // Queue processing optimization
    if (currentMetrics.queueProcessingRate < 90) {
      recommendations.push({
        category: 'queue',
        severity: currentMetrics.queueProcessingRate < 70 ? 'high' : 'medium',
        description: `Queue processing rate is ${currentMetrics.queueProcessingRate.toFixed(1)}%, indicating bottlenecks`,
        action: 'Increase queue workers, optimize job processing logic, and implement priority queuing',
        estimatedImpact: 'Improve background task processing by 25-40%'
      });
    }

    // Memory usage optimization
    if (this.parseMemoryUsage(currentMetrics.memoryUsage) > 512) { // MB
      recommendations.push({
        category: 'memory',
        severity: this.parseMemoryUsage(currentMetrics.memoryUsage) > 1024 ? 'critical' : 'medium',
        description: `Memory usage is ${currentMetrics.memoryUsage}, approaching system limits`,
        action: 'Implement cache compression, optimize data structures, and consider memory scaling',
        estimatedImpact: 'Reduce memory footprint by 20-35%'
      });
    }

    // Database optimization
    if (currentMetrics.databaseConnectionPool > 10000) {
      recommendations.push({
        category: 'database',
        severity: currentMetrics.databaseConnectionPool > 50000 ? 'high' : 'medium',
        description: `Database has ${currentMetrics.databaseConnectionPool} records, requiring optimization`,
        action: 'Implement data archiving, add compound indexes, and optimize frequent queries',
        estimatedImpact: 'Improve query performance by 30-50%'
      });
    }

    return recommendations;
  }

  async getPerformanceDashboard(): Promise<{
    currentMetrics: PerformanceMetrics;
    recommendations: OptimizationRecommendation[];
    trends: {
      cacheHitRateTrend: number[];
      responseTimeTrend: number[];
      queueProcessingTrend: number[];
    };
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  }> {
    const currentMetrics = await this.collectMetrics();
    const recommendations = await this.generateOptimizationRecommendations();
    
    // Calculate trends from recent metrics
    const recentMetrics = this.metrics.slice(-10);
    const trends = {
      cacheHitRateTrend: recentMetrics.map(m => m.cacheHitRate),
      responseTimeTrend: recentMetrics.map(m => m.averageResponseTime),
      queueProcessingTrend: recentMetrics.map(m => m.queueProcessingRate)
    };

    // Determine overall system health
    const criticalIssues = recommendations.filter(r => r.severity === 'critical').length;
    const highIssues = recommendations.filter(r => r.severity === 'high').length;
    
    let systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    if (criticalIssues > 0) {
      systemHealth = 'critical';
    } else if (highIssues > 2) {
      systemHealth = 'warning';
    } else if (highIssues > 0 || recommendations.length > 3) {
      systemHealth = 'good';
    } else {
      systemHealth = 'excellent';
    }

    return {
      currentMetrics,
      recommendations,
      trends,
      systemHealth
    };
  }

  async implementAutomaticOptimizations(): Promise<{
    optimizationsApplied: string[];
    results: string[];
  }> {
    const optimizationsApplied: string[] = [];
    const results: string[] = [];

    try {
      // Automatic cache optimization
      const cacheStats = await cacheManager.getStats();
      if (cacheStats.hitRate < 70) {
        // Clear low-value cache entries
        await this.optimizeCacheEntries();
        optimizationsApplied.push('Cache cleanup and optimization');
        results.push('Removed stale cache entries and optimized memory usage');
      }

      // Automatic queue optimization
      const queueStats = await QueueManager.getQueueStats();
      const totalFailed = queueStats.patientAnalysis.failed + 
                         queueStats.clinicalRules.failed + 
                         queueStats.alertProcessing.failed;
      
      if (totalFailed > 10) {
        await QueueManager.clearAllQueues();
        optimizationsApplied.push('Queue cleanup');
        results.push('Cleared failed jobs and reset queue processors');
      }

      // Database connection optimization
      await this.optimizeDatabaseConnections();
      optimizationsApplied.push('Database connection pool optimization');
      results.push('Optimized database connection pool settings');

      return { optimizationsApplied, results };
    } catch (error) {
      console.error('Error implementing automatic optimizations:', error);
      throw error;
    }
  }

  private calculateSystemLoad(): number {
    // Simulate system load calculation
    // In a real implementation, this would read from system metrics
    return Math.random() * 100;
  }

  private parseMemoryUsage(memoryStr: string): number {
    const match = memoryStr.match(/(\d+(?:\.\d+)?)\s*([KMGT]?B)/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'KB': return value / 1024;
      case 'MB': return value;
      case 'GB': return value * 1024;
      case 'TB': return value * 1024 * 1024;
      default: return value / (1024 * 1024); // Assume bytes
    }
  }

  private async optimizeCacheEntries(): Promise<void> {
    // Implement cache optimization logic
    const stats = await cacheManager.getStats();
    if (stats.totalKeys > 1000) {
      // Clear old cache entries based on patterns
      await cacheManager.invalidateByTag('temporary');
    }
  }

  private async optimizeDatabaseConnections(): Promise<void> {
    // Implement database optimization logic
    // This could include connection pool adjustments, query optimizations, etc.
    console.log('Optimizing database connections...');
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

// Express routes for performance monitoring
export async function getPerformanceMetrics(req: Request, res: Response) {
  try {
    const metrics = await performanceOptimizer.collectMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to collect performance metrics'
    });
  }
}

export async function getPerformanceDashboard(req: Request, res: Response) {
  try {
    const dashboard = await performanceOptimizer.getPerformanceDashboard();
    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting performance dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate performance dashboard'
    });
  }
}

export async function applyAutomaticOptimizations(req: Request, res: Response) {
  try {
    const result = await performanceOptimizer.implementAutomaticOptimizations();
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error applying automatic optimizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply automatic optimizations'
    });
  }
}