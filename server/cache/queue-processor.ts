import Queue, { Job } from 'bull';
import { FallbackQueue, FallbackBullAdapter } from './fallback-queue';
import { cacheManager } from './cache-manager';

// Try to import Redis, but gracefully fall back if not available
let redis: any = null;
let redisAvailable = false;

try {
  const redisModule = require('./redis-client');
  redis = redisModule.redis;
  redisAvailable = true;
} catch (error) {
  console.log('Redis not available for queues, using fallback queue system');
  redisAvailable = false;
}

// Define job types for healthcare operations
export interface HealthcareJob {
  type: 'patient_analysis' | 'clinical_rules' | 'alert_processing' | 'data_sync' | 'report_generation';
  patientId?: number;
  facilityId?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: any;
}

// Create queues for different healthcare operations
let patientAnalysisQueue: any;
let clinicalRulesQueue: any;
let alertProcessingQueue: any;

if (redisAvailable && redis) {
  // Use Redis-based Bull queues
  try {
    patientAnalysisQueue = new Queue('patient analysis', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    clinicalRulesQueue = new Queue('clinical rules', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 10,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      },
    });

    alertProcessingQueue = new Queue('alert processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  } catch (error) {
    console.log('Failed to create Redis queues, falling back to in-memory queues');
    redisAvailable = false;
  }
}

if (!redisAvailable) {
  // Use fallback in-memory queues
  patientAnalysisQueue = new FallbackQueue('patient analysis', {
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 5,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  });

  clinicalRulesQueue = new FallbackQueue('clinical rules', {
    defaultJobOptions: {
      removeOnComplete: 20,
      removeOnFail: 10,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    },
  });

  alertProcessingQueue = new FallbackQueue('alert processing', {
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 20,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  });
}

export { patientAnalysisQueue, clinicalRulesQueue, alertProcessingQueue };

// Patient Analysis Job Processor
patientAnalysisQueue.process(async (job: any) => {
  const { patientId, type, metadata } = job.data as HealthcareJob;
  
  console.log(`Processing patient analysis job for patient ${patientId}`);
  
  try {
    // Cache key for patient analysis results
    const cacheKey = `patient:analysis:${patientId}`;
    
    // Check if analysis already exists in cache
    const existingAnalysis = await cacheManager.get(cacheKey);
    if (existingAnalysis) {
      console.log(`Patient analysis cache hit for ${patientId}`);
      return existingAnalysis;
    }

    // Simulate comprehensive patient analysis
    const analysisResult = {
      patientId,
      analysisDate: new Date().toISOString(),
      riskFactors: await analyzeRiskFactors(patientId),
      clinicalAlerts: await generateClinicalAlerts(patientId),
      recommendations: await generateRecommendations(patientId),
      metadata
    };

    // Cache the results for 30 minutes
    await cacheManager.set(cacheKey, analysisResult, {
      ttl: 1800,
      tags: [`patient:${patientId}`, 'analysis'],
      compress: true
    });

    console.log(`Patient analysis completed for ${patientId}`);
    return analysisResult;
    
  } catch (error) {
    console.error(`Patient analysis failed for ${patientId}:`, error);
    throw error;
  }
});

// Clinical Rules Job Processor
clinicalRulesQueue.process(async (job: any) => {
  const { patientId, facilityId, metadata } = job.data as HealthcareJob;
  
  console.log(`Processing clinical rules for patient ${patientId} at facility ${facilityId}`);
  
  try {
    const rulesResult = {
      patientId,
      facilityId,
      rulesExecuted: await executeClinicalRules(patientId, facilityId),
      recommendations: await generateClinicalRecommendations(patientId),
      alerts: await checkClinicalAlerts(patientId),
      processedAt: new Date().toISOString(),
      metadata
    };

    // Cache clinical rules results
    const cacheKey = `clinical:rules:${patientId}:${facilityId}`;
    await cacheManager.set(cacheKey, rulesResult, {
      ttl: 3600,
      tags: [`patient:${patientId}`, `facility:${facilityId}`, 'clinical-rules']
    });

    return rulesResult;
    
  } catch (error) {
    console.error(`Clinical rules processing failed:`, error);
    throw error;
  }
});

// Alert Processing Job Processor
alertProcessingQueue.process(async (job: any) => {
  const { patientId, priority = 'normal', metadata } = job.data as HealthcareJob;
  
  console.log(`Processing alerts for patient ${patientId} with priority ${priority}`);
  
  try {
    const alertsResult = {
      patientId,
      priority,
      alerts: await processPatientAlerts(patientId, priority),
      notifications: await generateNotifications(patientId, priority),
      processedAt: new Date().toISOString(),
      metadata
    };

    // Cache alert results with shorter TTL for high priority
    const ttl = priority === 'critical' ? 300 : priority === 'high' ? 900 : 1800;
    const cacheKey = `alerts:${patientId}:${priority}`;
    
    await cacheManager.set(cacheKey, alertsResult, {
      ttl,
      tags: [`patient:${patientId}`, 'alerts', `priority:${priority}`]
    });

    return alertsResult;
    
  } catch (error) {
    console.error(`Alert processing failed:`, error);
    throw error;
  }
});

// Helper functions for healthcare processing
async function analyzeRiskFactors(patientId: number) {
  // Simulate risk factor analysis
  return {
    cardiovascular: 'low',
    diabetes: 'moderate',
    hypertension: 'high',
    infectious: 'low',
    obstetric: 'moderate'
  };
}

async function generateClinicalAlerts(patientId: number) {
  // Simulate clinical alert generation
  return [
    {
      type: 'medication_interaction',
      severity: 'medium',
      message: 'Potential drug interaction detected'
    },
    {
      type: 'vital_signs',
      severity: 'high',
      message: 'Blood pressure reading requires attention'
    }
  ];
}

async function generateRecommendations(patientId: number) {
  // Simulate recommendation generation
  return [
    'Schedule follow-up appointment within 2 weeks',
    'Monitor blood pressure daily',
    'Review current medications'
  ];
}

async function executeClinicalRules(patientId: number, facilityId: string) {
  // Simulate clinical rules execution
  return {
    rulesCount: 15,
    triggeredRules: 3,
    executionTime: '250ms'
  };
}

async function generateClinicalRecommendations(patientId: number) {
  // Simulate clinical recommendations
  return [
    'Consider medication adjustment',
    'Order additional lab tests',
    'Refer to specialist if symptoms persist'
  ];
}

async function checkClinicalAlerts(patientId: number) {
  // Simulate clinical alerts checking
  return [
    {
      alert: 'medication_due',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

async function processPatientAlerts(patientId: number, priority: string) {
  // Simulate patient alert processing
  return {
    totalAlerts: 5,
    priorityAlerts: priority === 'critical' ? 2 : priority === 'high' ? 1 : 0,
    processedCount: 5
  };
}

async function generateNotifications(patientId: number, priority: string) {
  // Simulate notification generation
  return {
    sms: priority === 'critical' || priority === 'high',
    email: true,
    dashboard: true
  };
}

// Queue management utilities
export class QueueManager {
  static async addPatientAnalysis(patientId: number, priority: 'low' | 'normal' | 'high' = 'normal') {
    const jobData: HealthcareJob = {
      type: 'patient_analysis',
      patientId,
      priority,
      metadata: { requestedAt: new Date().toISOString() }
    };

    const jobOptions = {
      priority: priority === 'high' ? 1 : priority === 'normal' ? 5 : 10,
      delay: priority === 'high' ? 0 : 1000
    };

    return await patientAnalysisQueue.add(jobData, jobOptions);
  }

  static async addClinicalRulesProcessing(patientId: number, facilityId: string) {
    const jobData: HealthcareJob = {
      type: 'clinical_rules',
      patientId,
      facilityId,
      metadata: { requestedAt: new Date().toISOString() }
    };

    return await clinicalRulesQueue.add(jobData);
  }

  static async addAlertProcessing(patientId: number, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal') {
    const jobData: HealthcareJob = {
      type: 'alert_processing',
      patientId,
      priority,
      metadata: { requestedAt: new Date().toISOString() }
    };

    const jobOptions = {
      priority: priority === 'critical' ? 1 : priority === 'high' ? 3 : priority === 'normal' ? 5 : 10,
      delay: priority === 'critical' ? 0 : priority === 'high' ? 500 : 2000
    };

    return await alertProcessingQueue.add(jobData, jobOptions);
  }

  static async getQueueStats() {
    try {
      const [patientWaiting, patientActive, patientCompleted, patientFailed] = await Promise.all([
        patientAnalysisQueue.getWaiting(),
        patientAnalysisQueue.getActive(),
        patientAnalysisQueue.getCompleted(),
        patientAnalysisQueue.getFailed()
      ]);

      const [rulesWaiting, rulesActive, rulesCompleted, rulesFailed] = await Promise.all([
        clinicalRulesQueue.getWaiting(),
        clinicalRulesQueue.getActive(),
        clinicalRulesQueue.getCompleted(),
        clinicalRulesQueue.getFailed()
      ]);

      const [alertsWaiting, alertsActive, alertsCompleted, alertsFailed] = await Promise.all([
        alertProcessingQueue.getWaiting(),
        alertProcessingQueue.getActive(),
        alertProcessingQueue.getCompleted(),
        alertProcessingQueue.getFailed()
      ]);

      return {
        patientAnalysis: {
          waiting: patientWaiting.length,
          active: patientActive.length,
          completed: patientCompleted.length,
          failed: patientFailed.length
        },
        clinicalRules: {
          waiting: rulesWaiting.length,
          active: rulesActive.length,
          completed: rulesCompleted.length,
          failed: rulesFailed.length
        },
        alertProcessing: {
          waiting: alertsWaiting.length,
          active: alertsActive.length,
          completed: alertsCompleted.length,
          failed: alertsFailed.length
        }
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      // Return fallback stats when queues are not available
      return {
        patientAnalysis: { waiting: 0, active: 0, completed: 0, failed: 0 },
        clinicalRules: { waiting: 0, active: 0, completed: 0, failed: 0 },
        alertProcessing: { waiting: 0, active: 0, completed: 0, failed: 0 }
      };
    }
  }

  static async clearAllQueues() {
    await Promise.all([
      patientAnalysisQueue.clean(0, 'completed'),
      patientAnalysisQueue.clean(0, 'failed'),
      clinicalRulesQueue.clean(0, 'completed'),
      clinicalRulesQueue.clean(0, 'failed'),
      alertProcessingQueue.clean(0, 'completed'),
      alertProcessingQueue.clean(0, 'failed')
    ]);
  }
}

// Queues are already exported above