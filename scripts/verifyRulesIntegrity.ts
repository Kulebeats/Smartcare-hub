/**
 * Rule Integrity Verification Service
 * Validates clinical decision rules for completeness and compliance
 */

import { db } from '../server/db';
import { clinicalDecisionRules } from '../shared/schema';
import { and, eq, isNull, or } from 'drizzle-orm';

interface IntegrityIssue {
  ruleId: number;
  ruleCode: string;
  field: string;
  issue: string;
  severity: 'error' | 'warning';
}

interface IntegrityReport {
  success: boolean;
  message: string;
  totalRules: number;
  validRules: number;
  issuesFound: number;
  issues: IntegrityIssue[];
  summary: {
    missingDakReference: number;
    missingDecisionMessage: number;
    missingModuleCode: number;
    invalidEvidenceQuality: number;
    invalidModuleFormat: number;
    incompleteRules: number;
  };
}

export async function checkRuleIntegrity(): Promise<IntegrityReport> {
  console.log('Starting rule integrity verification...');

  const report: IntegrityReport = {
    success: false,
    message: '',
    totalRules: 0,
    validRules: 0,
    issuesFound: 0,
    issues: [],
    summary: {
      missingDakReference: 0,
      missingDecisionMessage: 0,
      missingModuleCode: 0,
      invalidEvidenceQuality: 0,
      invalidModuleFormat: 0,
      incompleteRules: 0
    }
  };

  try {
    // Get all active rules
    const activeRules = await db
      .select()
      .from(clinicalDecisionRules)
      .where(eq(clinicalDecisionRules.isActive, true));

    report.totalRules = activeRules.length;

    for (const rule of activeRules) {
      const ruleIssues: IntegrityIssue[] = [];

      // Check for missing DAK reference
      if (!rule.dakReference || rule.dakReference.trim() === '') {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'dakReference',
          issue: 'Missing DAK reference - rule not traceable to source',
          severity: 'error'
        });
        report.summary.missingDakReference++;
      }

      // Check for missing decision support message
      if (!rule.decisionSupportMessage || rule.decisionSupportMessage.trim() === '') {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'decisionSupportMessage',
          issue: 'Missing decision support message for health workers',
          severity: 'error'
        });
        report.summary.missingDecisionMessage++;
      }

      // Check for missing module code
      if (!rule.moduleCode || rule.moduleCode.trim() === '') {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'moduleCode',
          issue: 'Missing module code',
          severity: 'error'
        });
        report.summary.missingModuleCode++;
      } else {
        // Check module code format
        if (!/^[A-Z0-9_]+$/.test(rule.moduleCode)) {
          ruleIssues.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            field: 'moduleCode',
            issue: `Invalid module code format '${rule.moduleCode}'. Must contain only uppercase letters, numbers, and underscores`,
            severity: 'error'
          });
          report.summary.invalidModuleFormat++;
        }
      }

      // Check evidence quality if provided
      if (rule.evidenceQuality && !['A', 'B', 'C', 'D'].includes(rule.evidenceQuality)) {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'evidenceQuality',
          issue: `Invalid evidence quality '${rule.evidenceQuality}'. Must be A, B, C, or D`,
          severity: 'error'
        });
        report.summary.invalidEvidenceQuality++;
      }

      // Check for missing guideline version (warning)
      if (!rule.guidelineVersion || rule.guidelineVersion.trim() === '') {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'guidelineVersion',
          issue: 'Missing guideline version - recommend adding for version tracking',
          severity: 'warning'
        });
      }

      // Check for missing WHO guideline reference (warning)
      if (!rule.whoGuidelineReference || rule.whoGuidelineReference.trim() === '') {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'whoGuidelineReference',
          issue: 'Missing WHO guideline reference - recommend adding for compliance',
          severity: 'warning'
        });
      }

      // Check for empty trigger conditions
      if (!rule.triggerConditions || Object.keys(rule.triggerConditions as any).length === 0) {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'triggerConditions',
          issue: 'Empty trigger conditions - rule will never activate',
          severity: 'error'
        });
      }

      // Check for empty recommendations
      if (!rule.recommendations || !Array.isArray(rule.recommendations) || (rule.recommendations as any).length === 0) {
        ruleIssues.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          field: 'recommendations',
          issue: 'Empty recommendations - no guidance provided to health workers',
          severity: 'error'
        });
      }

      // Count rules with any errors as incomplete
      const hasErrors = ruleIssues.some(issue => issue.severity === 'error');
      if (hasErrors) {
        report.summary.incompleteRules++;
      } else {
        report.validRules++;
      }

      report.issues.push(...ruleIssues);
    }

    report.issuesFound = report.issues.length;
    report.success = report.summary.incompleteRules === 0;
    
    if (report.success) {
      report.message = `All ${report.totalRules} active rules passed integrity check.`;
    } else {
      const errorCount = report.issues.filter(i => i.severity === 'error').length;
      const warningCount = report.issues.filter(i => i.severity === 'warning').length;
      report.message = `Found ${errorCount} errors and ${warningCount} warnings across ${report.summary.incompleteRules} rules.`;
    }

  } catch (error: any) {
    report.message = `Integrity check failed: ${error.message}`;
    console.error('Rule integrity check error:', error);
  }

  return report;
}

export async function getComplianceReport() {
  const integrityReport = await checkRuleIntegrity();
  
  const compliance = {
    dakTraceability: ((integrityReport.totalRules - integrityReport.summary.missingDakReference) / integrityReport.totalRules * 100).toFixed(1),
    decisionSupport: ((integrityReport.totalRules - integrityReport.summary.missingDecisionMessage) / integrityReport.totalRules * 100).toFixed(1),
    moduleCompliance: ((integrityReport.totalRules - integrityReport.summary.missingModuleCode - integrityReport.summary.invalidModuleFormat) / integrityReport.totalRules * 100).toFixed(1),
    overallCompliance: (integrityReport.validRules / integrityReport.totalRules * 100).toFixed(1)
  };

  return {
    ...integrityReport,
    compliance
  };
}

export default {
  checkRuleIntegrity,
  getComplianceReport
};