/**
 * SmartCare PRO Audit Retention Management
 * 
 * Configurable data retention and purge policies for compliance
 * Supports WHO and Ministry of Health data governance requirements
 */

import { db } from './db';
import { auditEvents, auditRetention } from '@shared/schema';
import { eq, lt, and, desc } from 'drizzle-orm';
import type { InsertAuditRetention } from '@shared/schema';

// Default retention policies for Zambian healthcare compliance
export const DEFAULT_RETENTION_POLICIES: InsertAuditRetention[] = [
  {
    retentionRule: 'High Risk Events',
    eventTypes: ['FAILED_LOGIN', 'DELETE', 'EXPORT'],
    riskScoreThreshold: 7,
    retentionPeriodDays: 2555, // 7 years - legal requirement
    archiveAfterDays: 365, // Archive after 1 year
    complianceRequirement: 'MOH_ZAMBIA_SECURITY',
    isActive: true,
    createdBy: null,
  },
  {
    retentionRule: 'Patient Data Access',
    eventTypes: ['READ', 'CREATE', 'UPDATE'],
    riskScoreThreshold: 0,
    retentionPeriodDays: 3650, // 10 years - patient record requirement
    archiveAfterDays: 1095, // Archive after 3 years
    complianceRequirement: 'WHO_PATIENT_RECORDS',
    isActive: true,
    createdBy: null,
  },
  {
    retentionRule: 'Clinical Module Access',
    eventTypes: ['READ', 'CREATE', 'UPDATE'],
    riskScoreThreshold: 2,
    retentionPeriodDays: 1825, // 5 years - clinical audit requirement
    archiveAfterDays: 730, // Archive after 2 years
    complianceRequirement: 'WHO_CLINICAL_AUDIT',
    isActive: true,
    createdBy: null,
  },
  {
    retentionRule: 'Administrative Actions',
    eventTypes: ['CREATE', 'UPDATE', 'DELETE'],
    riskScoreThreshold: 3,
    retentionPeriodDays: 2190, // 6 years - administrative requirement
    archiveAfterDays: 365,
    complianceRequirement: 'MOH_ZAMBIA_ADMIN',
    isActive: true,
    createdBy: null,
  },
  {
    retentionRule: 'System Access Logs',
    eventTypes: ['LOGIN', 'LOGOUT', 'SYSTEM_ACCESS'],
    riskScoreThreshold: 0,
    retentionPeriodDays: 90, // 3 months - operational logs
    archiveAfterDays: 30, // Archive after 1 month
    complianceRequirement: 'OPERATIONAL',
    isActive: true,
    createdBy: null,
  },
  {
    retentionRule: 'Transfer and Referral Events',
    eventTypes: ['TRANSFER'],
    riskScoreThreshold: 0,
    retentionPeriodDays: 1825, // 5 years - continuity of care
    archiveAfterDays: 365,
    complianceRequirement: 'WHO_CONTINUITY_CARE',
    isActive: true,
    createdBy: null,
  },
];

// Initialize default retention policies
export async function initializeDefaultRetentionPolicies(): Promise<void> {
  console.log('Initializing default audit retention policies...');
  
  try {
    // Check if policies already exist
    const existingPolicies = await db.select().from(auditRetention).limit(1);
    
    if (existingPolicies.length === 0) {
      // Insert default policies
      await db.insert(auditRetention).values(DEFAULT_RETENTION_POLICIES);
      console.log(`Initialized ${DEFAULT_RETENTION_POLICIES.length} default retention policies`);
    } else {
      console.log('Retention policies already exist, skipping initialization');
    }
  } catch (error) {
    console.error('Failed to initialize retention policies:', error);
  }
}

// Get applicable retention policy for an event
export async function getRetentionPolicy(
  eventType: string,
  riskScore: number
): Promise<InsertAuditRetention | null> {
  try {
    const policies = await db
      .select()
      .from(auditRetention)
      .where(
        and(
          eq(auditRetention.isActive, true),
          lt(auditRetention.riskScoreThreshold, riskScore + 1)
        )
      )
      .orderBy(desc(auditRetention.riskScoreThreshold));
    
    // Find the most specific policy that applies
    for (const policy of policies) {
      if (policy.eventTypes.includes(eventType)) {
        return policy;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting retention policy:', error);
    return null;
  }
}

// Archive old audit events (move to archive table or external storage)
export async function archiveAuditEvents(): Promise<{
  archivedCount: number;
  errors: string[];
}> {
  console.log('Starting audit event archival process...');
  const startTime = Date.now();
  let archivedCount = 0;
  const errors: string[] = [];
  
  try {
    const activePolicies = await db
      .select()
      .from(auditRetention)
      .where(eq(auditRetention.isActive, true));
    
    for (const policy of activePolicies) {
      if (!policy.archiveAfterDays) continue;
      
      try {
        const archiveDate = new Date();
        archiveDate.setDate(archiveDate.getDate() - policy.archiveAfterDays);
        
        // In a full implementation, you would:
        // 1. Select events to archive
        // 2. Copy them to archive storage (S3, etc.)
        // 3. Mark them as archived in the main table
        // 4. Verify archive integrity
        
        // For now, we'll just count what would be archived
        const eventsToArchive = await db
          .select({ count: auditEvents.id })
          .from(auditEvents)
          .where(
            and(
              lt(auditEvents.timestamp, archiveDate),
              // Add condition to check if not already archived
            )
          );
        
        console.log(`Policy "${policy.retentionRule}": ${eventsToArchive.length} events eligible for archival`);
        archivedCount += eventsToArchive.length;
        
      } catch (policyError) {
        const error = `Failed to archive events for policy "${policy.retentionRule}": ${policyError}`;
        errors.push(error);
        console.error(error);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`Archival process completed: ${archivedCount} events processed in ${duration}ms`);
    
    return { archivedCount, errors };
    
  } catch (error) {
    const errorMsg = `Archival process failed: ${error}`;
    console.error(errorMsg);
    return { archivedCount: 0, errors: [errorMsg] };
  }
}

// Purge expired audit events
export async function purgeExpiredAuditEvents(): Promise<{
  purgedCount: number;
  errors: string[];
}> {
  console.log('Starting audit event purge process...');
  const startTime = Date.now();
  let purgedCount = 0;
  const errors: string[] = [];
  
  try {
    const activePolicies = await db
      .select()
      .from(auditRetention)
      .where(eq(auditRetention.isActive, true));
    
    for (const policy of activePolicies) {
      try {
        const purgeDate = new Date();
        purgeDate.setDate(purgeDate.getDate() - policy.retentionPeriodDays);
        
        // Count events to be purged first
        const eventsToPurge = await db
          .select({ id: auditEvents.id })
          .from(auditEvents)
          .where(
            and(
              lt(auditEvents.timestamp, purgeDate),
              // Add conditions based on policy
            )
          );
        
        if (eventsToPurge.length > 0) {
          // In production, implement actual purge with backup verification
          console.log(`Would purge ${eventsToPurge.length} events for policy "${policy.retentionRule}"`);
          // await db.delete(auditEvents).where(/* conditions */);
          purgedCount += eventsToPurge.length;
        }
        
      } catch (policyError) {
        const error = `Failed to purge events for policy "${policy.retentionRule}": ${policyError}`;
        errors.push(error);
        console.error(error);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`Purge process completed: ${purgedCount} events would be purged in ${duration}ms`);
    
    return { purgedCount, errors };
    
  } catch (error) {
    const errorMsg = `Purge process failed: ${error}`;
    console.error(errorMsg);
    return { purgedCount: 0, errors: [errorMsg] };
  }
}

// Generate retention compliance report
export async function generateRetentionReport(): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  retentionPolicies: any[];
  complianceStatus: string;
}> {
  try {
    // Get total events count
    const totalEvents = await db
      .select({ count: auditEvents.id })
      .from(auditEvents);
    
    // Get events by type (simplified - in production would be more detailed)
    const eventsByType: Record<string, number> = {};
    
    // Get active retention policies
    const retentionPolicies = await db
      .select()
      .from(auditRetention)
      .where(eq(auditRetention.isActive, true))
      .orderBy(desc(auditRetention.retentionPeriodDays));
    
    return {
      totalEvents: totalEvents.length,
      eventsByType,
      retentionPolicies,
      complianceStatus: 'COMPLIANT', // Would be calculated based on actual compliance checks
    };
    
  } catch (error) {
    console.error('Failed to generate retention report:', error);
    return {
      totalEvents: 0,
      eventsByType: {},
      retentionPolicies: [],
      complianceStatus: 'ERROR',
    };
  }
}

// Create custom retention policy
export async function createRetentionPolicy(
  policy: InsertAuditRetention,
  createdById: number
): Promise<void> {
  try {
    await db.insert(auditRetention).values({
      ...policy,
      createdBy: createdById,
    });
    
    console.log(`Created new retention policy: ${policy.retentionRule}`);
  } catch (error) {
    console.error('Failed to create retention policy:', error);
    throw error;
  }
}

// Update retention policy
export async function updateRetentionPolicy(
  policyId: number,
  updates: Partial<InsertAuditRetention>
): Promise<void> {
  try {
    await db
      .update(auditRetention)
      .set({
        ...updates,
        lastModified: new Date(),
      })
      .where(eq(auditRetention.id, policyId));
    
    console.log(`Updated retention policy ID: ${policyId}`);
  } catch (error) {
    console.error('Failed to update retention policy:', error);
    throw error;
  }
}

// Deactivate retention policy
export async function deactivateRetentionPolicy(policyId: number): Promise<void> {
  try {
    await db
      .update(auditRetention)
      .set({
        isActive: false,
        lastModified: new Date(),
      })
      .where(eq(auditRetention.id, policyId));
    
    console.log(`Deactivated retention policy ID: ${policyId}`);
  } catch (error) {
    console.error('Failed to deactivate retention policy:', error);
    throw error;
  }
}