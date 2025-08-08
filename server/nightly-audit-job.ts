/**
 * SmartCare PRO Nightly Audit Job
 * 
 * Automated hash-chain integrity verification and maintenance tasks
 * Runs daily to ensure audit trail compliance and data integrity
 */

import cron from 'node-cron';
import { verifyHashChainIntegrity } from './middleware/audit';
import { archiveAuditEvents, purgeExpiredAuditEvents, generateRetentionReport, initializeDefaultRetentionPolicies } from './audit-retention';

// Nightly audit maintenance job
export function startNightlyAuditJob(): void {
  console.log('Starting nightly audit job scheduler...');
  
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting nightly audit maintenance job...');
    const startTime = Date.now();
    
    try {
      // 1. Verify hash chain integrity
      console.log('Step 1: Verifying hash chain integrity...');
      const integrityResult = await verifyHashChainIntegrity();
      
      if (!integrityResult.isValid) {
        console.error(`CRITICAL: Hash chain integrity compromised! ${integrityResult.corruptedEvents.length} corrupted events found.`);
        // In production, this would trigger immediate alerts to administrators
      } else {
        console.log(`Hash chain integrity verified: ${integrityResult.totalEvents} events validated`);
      }
      
      // 2. Archive old events
      console.log('Step 2: Archiving old audit events...');
      const archiveResult = await archiveAuditEvents();
      
      if (archiveResult.errors.length > 0) {
        console.error('Archive errors:', archiveResult.errors);
      } else {
        console.log(`Archival completed: ${archiveResult.archivedCount} events processed`);
      }
      
      // 3. Purge expired events (based on retention policies)
      console.log('Step 3: Purging expired audit events...');
      const purgeResult = await purgeExpiredAuditEvents();
      
      if (purgeResult.errors.length > 0) {
        console.error('Purge errors:', purgeResult.errors);
      } else {
        console.log(`Purge completed: ${purgeResult.purgedCount} events would be purged`);
      }
      
      // 4. Generate retention compliance report
      console.log('Step 4: Generating retention compliance report...');
      const report = await generateRetentionReport();
      console.log(`Compliance report generated: ${report.totalEvents} total events, status: ${report.complianceStatus}`);
      
      const duration = Date.now() - startTime;
      console.log(`Nightly audit job completed successfully in ${duration}ms`);
      
    } catch (error) {
      console.error('Nightly audit job failed:', error);
      // In production, this would trigger alerts to system administrators
    }
  });
  
  // Initialize retention policies on startup
  initializeDefaultRetentionPolicies();
  
  console.log('Nightly audit job scheduled for 2:00 AM daily');
}

// Manual trigger for testing purposes
export async function runAuditMaintenanceManually(): Promise<{
  integrityCheck: any;
  archiveResult: any;
  purgeResult: any;
  report: any;
}> {
  console.log('Running audit maintenance manually...');
  
  const integrityCheck = await verifyHashChainIntegrity();
  const archiveResult = await archiveAuditEvents();
  const purgeResult = await purgeExpiredAuditEvents();
  const report = await generateRetentionReport();
  
  return {
    integrityCheck,
    archiveResult,
    purgeResult,
    report,
  };
}