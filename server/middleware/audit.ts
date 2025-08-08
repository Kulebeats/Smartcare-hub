/**
 * SmartCare PRO Audit and Compliance Middleware
 * 
 * Comprehensive audit logging system with cryptographic integrity verification
 * Complies with WHO guidelines and Ministry of Health data governance requirements
 */

import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { db } from '../db';
import { auditEvents, auditIntegrityCheck } from '@shared/schema';
import { eq, desc, max } from 'drizzle-orm';
import type { InsertAuditEvent, AuditEventType } from '@shared/schema';

// Risk assessment configuration
const RISK_FACTORS = {
  PATIENT_DATA_ACCESS: 2,
  BULK_EXPORT: 5,
  ADMIN_ACTION: 3,
  FAILED_LOGIN: 4,
  AFTER_HOURS: 2,
  SENSITIVE_ENDPOINT: 3,
  MULTIPLE_FAILURES: 6,
  PRIVILEGED_USER: 1,
  EXTERNAL_IP: 3,
} as const;

const SENSITIVE_ENDPOINTS = [
  '/api/patients',
  '/api/admin',
  '/api/export',
  '/api/backup',
  '/api/users',
];

const CLINICAL_MODULES = {
  '/api/patients': 'PATIENT_REGISTRY',
  '/api/anc': 'ANC',
  '/api/art': 'ART',
  '/api/prep': 'PREP',
  '/api/prescriptions': 'PRESCRIPTIONS',
  '/api/transfers': 'TRANSFERS',
} as const;

// Request data sanitizer - removes sensitive information
function sanitizeRequestData(data: any, endpoint: string): any {
  if (!data) return null;
  
  const sanitized = { ...data };
  
  // Remove password fields
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.currentPassword) sanitized.currentPassword = '[REDACTED]';
  if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
  
  // Limit size for large payloads
  const jsonString = JSON.stringify(sanitized);
  if (jsonString.length > 10000) {
    return {
      _meta: 'Large payload truncated',
      size: jsonString.length,
      keys: Object.keys(sanitized),
    };
  }
  
  return sanitized;
}

// Risk score calculator
function calculateRiskScore(req: Request, eventType: AuditEventType, responseStatus: number): {
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];
  
  // Base risk by event type
  switch (eventType) {
    case 'DELETE':
      score += 3;
      factors.push('DELETE_OPERATION');
      break;
    case 'FAILED_LOGIN':
      score += RISK_FACTORS.FAILED_LOGIN;
      factors.push('FAILED_LOGIN');
      break;
    case 'CREATE':
    case 'UPDATE':
      score += 1;
      factors.push('DATA_MODIFICATION');
      break;
  }
  
  // Sensitive endpoint access
  const isSensitive = SENSITIVE_ENDPOINTS.some(endpoint => 
    req.path.startsWith(endpoint)
  );
  if (isSensitive) {
    score += RISK_FACTORS.SENSITIVE_ENDPOINT;
    factors.push('SENSITIVE_ENDPOINT');
  }
  
  // After hours access (outside 6 AM - 10 PM)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    score += RISK_FACTORS.AFTER_HOURS;
    factors.push('AFTER_HOURS');
  }
  
  // Error responses
  if (responseStatus >= 400) {
    score += 2;
    factors.push('ERROR_RESPONSE');
  }
  
  // Admin user actions
  if (req.user?.isAdmin || req.user?.role === 'SystemAdministrator') {
    score += RISK_FACTORS.PRIVILEGED_USER;
    factors.push('PRIVILEGED_USER');
  }
  
  // Bulk operations (indicated by query parameters)
  if (req.query.limit && parseInt(req.query.limit as string) > 100) {
    score += RISK_FACTORS.BULK_EXPORT;
    factors.push('BULK_OPERATION');
  }
  
  return { score: Math.min(score, 10), factors }; // Cap at 10
}

// Extract clinical module from endpoint
function getClinicalModule(endpoint: string): string | null {
  for (const [path, module] of Object.entries(CLINICAL_MODULES)) {
    if (endpoint.startsWith(path)) {
      return module;
    }
  }
  return null;
}

// Generate cryptographic hash for event
function generateEventHash(eventData: Partial<InsertAuditEvent>, previousHash: string | null): string {
  const hashInput = JSON.stringify({
    eventType: eventData.eventType,
    entityType: eventData.entityType,
    entityId: eventData.entityId,
    userId: eventData.userId,
    endpoint: eventData.endpoint,
    httpMethod: eventData.httpMethod,
    timestamp: new Date().toISOString(),
    previousHash,
  });
  
  return createHash('sha256').update(hashInput).digest('hex');
}

// Get next hash chain index
async function getNextHashChainIndex(): Promise<{ index: number; previousHash: string | null }> {
  try {
    const lastEvent = await db
      .select({
        hashChainIndex: auditEvents.hashChainIndex,
        eventHash: auditEvents.eventHash,
      })
      .from(auditEvents)
      .orderBy(desc(auditEvents.hashChainIndex))
      .limit(1);
    
    if (lastEvent.length === 0) {
      return { index: 1, previousHash: null };
    }
    
    return {
      index: lastEvent[0].hashChainIndex + 1,
      previousHash: lastEvent[0].eventHash,
    };
  } catch (error) {
    console.error('Error getting hash chain index:', error);
    return { index: 1, previousHash: null };
  }
}

// Extract patient NRC from request
function extractPatientNrc(req: Request): string | null {
  // From URL parameters
  if (req.params.nrc) return req.params.nrc;
  
  // From request body
  if (req.body?.nrc) return req.body.nrc;
  if (req.body?.patient?.nrc) return req.body.patient.nrc;
  
  // From query parameters
  if (req.query.nrc) return req.query.nrc as string;
  
  return null;
}

// Main audit logging function
export async function logAuditEvent(
  req: Request,
  res: Response,
  eventType: AuditEventType,
  entityType?: string,
  entityId?: string,
  processingTime?: number
): Promise<void> {
  try {
    const { index, previousHash } = await getNextHashChainIndex();
    const { score, factors } = calculateRiskScore(req, eventType, res.statusCode);
    
    const auditData: InsertAuditEvent = {
      eventType,
      entityType: entityType || null,
      entityId: entityId || null,
      userId: req.user?.id || null,
      username: req.user?.username || 'ANONYMOUS',
      facilityCode: req.user?.facilityCode || null,
      ipAddress: req.ip || req.connection.remoteAddress || null,
      userAgent: req.get('User-Agent') || null,
      sessionId: req.sessionID || null,
      endpoint: req.path,
      httpMethod: req.method,
      requestData: sanitizeRequestData(req.body, req.path),
      responseStatus: res.statusCode,
      patientNrc: extractPatientNrc(req),
      clinicalModule: getClinicalModule(req.path),
      riskScore: score,
      riskFactors: factors,
      alertTriggered: score >= 7, // High risk threshold
      processingTime: processingTime || null,
      errorDetails: res.statusCode >= 400 ? { status: res.statusCode, message: res.statusMessage } : null,
      complianceFlags: ['WHO_COMPLIANT', 'MOH_ZAMBIA'],
      eventHash: '', // Will be set below
      previousHash,
      hashChainIndex: index,
    };
    
    // Generate hash with the prepared data
    auditData.eventHash = generateEventHash(auditData, previousHash);
    
    // Insert audit event asynchronously to avoid blocking the response
    setImmediate(async () => {
      try {
        await db.insert(auditEvents).values(auditData);
        
        // Trigger alert if high risk
        if (auditData.alertTriggered) {
          console.warn(`HIGH RISK AUDIT EVENT: ${eventType} by ${auditData.username} - Risk Score: ${score}`);
          // In production, this would trigger real-time alerts
        }
      } catch (error) {
        console.error('Failed to insert audit event:', error);
      }
    });
    
  } catch (error) {
    console.error('Error in audit logging:', error);
  }
}

// Middleware function for automatic audit logging
export function auditMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Track if response has been sent
    let responseSent = false;
    
    // Override response methods to capture when response is sent
    res.send = function(body: any) {
      if (!responseSent) {
        responseSent = true;
        const processingTime = Date.now() - startTime;
        
        // Determine event type based on method and response
        let eventType: AuditEventType;
        if (req.method === 'POST') eventType = 'CREATE';
        else if (req.method === 'PUT' || req.method === 'PATCH') eventType = 'UPDATE';
        else if (req.method === 'DELETE') eventType = 'DELETE';
        else if (req.method === 'GET') eventType = 'READ';
        else eventType = 'SYSTEM_ACCESS';
        
        // Special cases
        if (req.path.includes('/login') && res.statusCode === 200) eventType = 'LOGIN';
        if (req.path.includes('/logout')) eventType = 'LOGOUT';
        if (req.path.includes('/login') && res.statusCode >= 400) eventType = 'FAILED_LOGIN';
        
        // Extract entity information
        let entityType: string | undefined;
        let entityId: string | undefined;
        
        if (req.path.includes('/patients')) {
          entityType = 'patients';
          entityId = req.params.id || extractPatientNrc(req) || undefined;
        } else if (req.path.includes('/users')) {
          entityType = 'users';
          entityId = req.params.id || undefined;
        } else if (req.path.includes('/prescriptions')) {
          entityType = 'prescriptions';
          entityId = req.params.id || undefined;
        }
        
        // Log the audit event
        logAuditEvent(req, res, eventType, entityType, entityId, processingTime);
      }
      
      return originalSend.call(this, body);
    };
    
    res.json = function(obj: any) {
      if (!responseSent) {
        responseSent = true;
        const processingTime = Date.now() - startTime;
        
        // Same logic as above for JSON responses
        let eventType: AuditEventType;
        if (req.method === 'POST') eventType = 'CREATE';
        else if (req.method === 'PUT' || req.method === 'PATCH') eventType = 'UPDATE';
        else if (req.method === 'DELETE') eventType = 'DELETE';
        else if (req.method === 'GET') eventType = 'read';
        else eventType = 'SYSTEM_ACCESS';
        
        if (req.path.includes('/login') && res.statusCode === 200) eventType = 'LOGIN';
        if (req.path.includes('/logout')) eventType = 'LOGOUT';
        if (req.path.includes('/login') && res.statusCode >= 400) eventType = 'FAILED_LOGIN';
        
        let entityType: string | undefined;
        let entityId: string | undefined;
        
        if (req.path.includes('/patients')) {
          entityType = 'patients';
          entityId = req.params.id || extractPatientNrc(req) || undefined;
        } else if (req.path.includes('/users')) {
          entityType = 'users';
          entityId = req.params.id || undefined;
        } else if (req.path.includes('/prescriptions')) {
          entityType = 'prescriptions';
          entityId = req.params.id || undefined;
        }
        
        logAuditEvent(req, res, eventType, entityType, entityId, processingTime);
      }
      
      return originalJson.call(this, obj);
    };
    
    next();
  };
}

// Manual audit logging for specific events
export async function auditLogin(req: Request, success: boolean, username?: string): Promise<void> {
  const mockRes = { statusCode: success ? 200 : 401, statusMessage: success ? 'OK' : 'Unauthorized' } as Response;
  await logAuditEvent(req, mockRes, success ? 'LOGIN' : 'FAILED_LOGIN', 'users', username);
}

export async function auditLogout(req: Request, username?: string): Promise<void> {
  const mockRes = { statusCode: 200, statusMessage: 'OK' } as Response;
  await logAuditEvent(req, mockRes, 'LOGOUT', 'users', username);
}

export async function auditDataExport(req: Request, exportType: string, recordCount: number): Promise<void> {
  const mockRes = { statusCode: 200, statusMessage: 'OK' } as Response;
  await logAuditEvent(req, mockRes, 'EXPORT', exportType, `${recordCount}_records`);
}

// Hash chain integrity verification
export async function verifyHashChainIntegrity(): Promise<{
  isValid: boolean;
  totalEvents: number;
  lastValidIndex: number;
  corruptedEvents: number[];
}> {
  console.log('Starting hash chain integrity verification...');
  const startTime = Date.now();
  
  try {
    const events = await db
      .select({
        id: auditEvents.id,
        hashChainIndex: auditEvents.hashChainIndex,
        eventHash: auditEvents.eventHash,
        previousHash: auditEvents.previousHash,
        eventType: auditEvents.eventType,
        entityType: auditEvents.entityType,
        entityId: auditEvents.entityId,
        userId: auditEvents.userId,
        endpoint: auditEvents.endpoint,
        httpMethod: auditEvents.httpMethod,
        timestamp: auditEvents.timestamp,
      })
      .from(auditEvents)
      .orderBy(auditEvents.hashChainIndex);
    
    const corruptedEvents: number[] = [];
    let lastValidIndex = 0;
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const expectedPreviousHash = i === 0 ? null : events[i - 1].eventHash;
      
      // Verify previous hash linkage
      if (event.previousHash !== expectedPreviousHash) {
        corruptedEvents.push(event.id);
        continue;
      }
      
      // Verify event hash
      const expectedHash = generateEventHash(event, expectedPreviousHash);
      if (event.eventHash !== expectedHash) {
        corruptedEvents.push(event.id);
        continue;
      }
      
      lastValidIndex = event.hashChainIndex;
    }
    
    const isValid = corruptedEvents.length === 0;
    const duration = Date.now() - startTime;
    
    // Log integrity check result
    await db.insert(auditIntegrityCheck).values({
      totalEvents: events.length,
      lastValidIndex,
      hashChainValid: isValid,
      corruptedEvents,
      repairActions: isValid ? [] : ['MANUAL_REVIEW_REQUIRED'],
      checkDurationMs: duration,
      performedBy: 'SYSTEM_NIGHTLY_JOB',
    });
    
    if (!isValid) {
      console.error(`Hash chain integrity compromised! ${corruptedEvents.length} corrupted events found.`);
    } else {
      console.log(`Hash chain integrity verified: ${events.length} events validated in ${duration}ms`);
    }
    
    return {
      isValid,
      totalEvents: events.length,
      lastValidIndex,
      corruptedEvents,
    };
  } catch (error) {
    console.error('Hash chain verification failed:', error);
    return {
      isValid: false,
      totalEvents: 0,
      lastValidIndex: 0,
      corruptedEvents: [],
    };
  }
}