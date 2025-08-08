/**
 * DAK CSV Processor - Streaming, Batching, and Transaction Support
 * Handles large CSV files with clinical decision rules and DAK traceability
 */

import fs from 'fs';
import { parse, Parser } from 'csv-parse';
import { Readable } from 'stream';
import { db } from '../server/db';
import { clinicalDecisionRules } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface DakRecordCsv {
  rule_identifier?: string;
  dak_source_id?: string;
  guideline_doc_version?: string;
  evidence_rating?: string;
  display_to_health_worker?: string;
  applicable_module?: string;
  is_rule_active?: string;
  rule_name?: string;
  rule_description?: string;
  alert_severity?: string;
  alert_title?: string;
  alert_message?: string;
  recommendations?: string;
  trigger_conditions?: string;
  who_guideline_ref?: string;
  clinical_thresholds?: string;
  version?: string;
  [key: string]: any;
}

export interface ProcessingResult {
  success: boolean;
  message: string;
  processedCount: number;
  updatedCount: number;
  errorCount: number;
  errors: string[];
}

const BATCH_SIZE = 100;

// Basic sanitization for string inputs
function sanitizeString(input: string | undefined | null): string | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  return input.trim();
}

// Parse JSON fields safely
function parseJsonField(input: string | undefined): any {
  if (!input || input.trim() === '') return undefined;
  try {
    return JSON.parse(input.trim());
  } catch (error) {
    console.warn(`Failed to parse JSON field: ${input}`);
    return undefined;
  }
}

// Validate CSV headers
function validateCsvHeaders(headers: string[]): { valid: boolean; missingHeaders: string[] } {
  const requiredHeaders = [
    'rule_identifier',
    'display_to_health_worker',
    'applicable_module'
  ];
  
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  return {
    valid: missingHeaders.length === 0,
    missingHeaders
  };
}

export async function processDakCsvFileStream(filePath: string): Promise<ProcessingResult> {
  console.log(`Streaming and processing DAK CSV file: ${filePath}`);
  
  const result: ProcessingResult = {
    success: false,
    message: '',
    processedCount: 0,
    updatedCount: 0,
    errorCount: 0,
    errors: []
  };

  if (!fs.existsSync(filePath)) {
    result.message = `File not found: ${filePath}`;
    result.errors.push(result.message);
    return result;
  }

  let recordsBatch: Partial<typeof clinicalDecisionRules.$inferInsert>[] = [];
  let isFirstRow = true;

  try {
    const parser: Parser = fs.createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true, 
        trim: true,
        cast: true
      }));

    for await (const rawRecord of parser) {
      // Validate headers on first row
      if (isFirstRow) {
        const headers = Object.keys(rawRecord);
        const validation = validateCsvHeaders(headers);
        if (!validation.valid) {
          result.message = `Missing required headers: ${validation.missingHeaders.join(', ')}`;
          result.errors.push(result.message);
          return result;
        }
        isFirstRow = false;
      }

      result.processedCount++;
      const record = rawRecord as DakRecordCsv;

      const ruleCode = sanitizeString(record.rule_identifier);
      const decisionSupportMessage = sanitizeString(record.display_to_health_worker);
      const moduleCode = sanitizeString(record.applicable_module)?.toUpperCase();

      if (!ruleCode || !decisionSupportMessage || !moduleCode) {
        const error = `Row ${result.processedCount}: Missing required fields (rule_identifier, display_to_health_worker, applicable_module)`;
        result.errors.push(error);
        result.errorCount++;
        continue;
      }

      const isActive = record.is_rule_active ? record.is_rule_active.toLowerCase() === 'true' : true;
      const evidenceQuality = sanitizeString(record.evidence_rating)?.charAt(0).toUpperCase();

      // Validate evidence quality if provided
      if (evidenceQuality && !['A', 'B', 'C', 'D'].includes(evidenceQuality)) {
        const error = `Row ${result.processedCount}: Invalid evidence_rating '${record.evidence_rating}'. Must be A, B, C, or D`;
        result.errors.push(error);
        result.errorCount++;
        continue;
      }

      // Validate module code format
      if (!/^[A-Z0-9_]+$/.test(moduleCode)) {
        const error = `Row ${result.processedCount}: Invalid module_code format '${moduleCode}'. Must contain only uppercase letters, numbers, and underscores`;
        result.errors.push(error);
        result.errorCount++;
        continue;
      }

      const ruleData: Partial<typeof clinicalDecisionRules.$inferInsert> = {
        ruleCode: ruleCode,
        ruleName: sanitizeString(record.rule_name) || ruleCode,
        ruleDescription: sanitizeString(record.rule_description),
        dakReference: sanitizeString(record.dak_source_id),
        guidelineVersion: sanitizeString(record.guideline_doc_version),
        evidenceQuality: evidenceQuality,
        decisionSupportMessage: decisionSupportMessage,
        moduleCode: moduleCode,
        module: moduleCode, // Keep compatibility with existing field
        whoGuidelineReference: sanitizeString(record.who_guideline_ref),
        alertSeverity: sanitizeString(record.alert_severity) || 'yellow',
        alertTitle: sanitizeString(record.alert_title) || ruleCode,
        alertMessage: sanitizeString(record.alert_message) || decisionSupportMessage,
        recommendations: parseJsonField(record.recommendations) || [],
        triggerConditions: parseJsonField(record.trigger_conditions) || {},
        clinicalThresholds: parseJsonField(record.clinical_thresholds),
        isActive: isActive,
        version: sanitizeString(record.version) || '1.0',
        createdBy: 1 // System user - this should be updated to actual user
      };

      recordsBatch.push(ruleData);

      if (recordsBatch.length >= BATCH_SIZE) {
        await processBatchWithTransaction(recordsBatch, result);
        recordsBatch = [];
      }
    }

    // Process remaining records
    if (recordsBatch.length > 0) {
      await processBatchWithTransaction(recordsBatch, result);
    }

    result.success = result.errorCount === 0;
    result.message = result.success 
      ? `Successfully processed ${result.processedCount} records with ${result.updatedCount} updates`
      : `Processed ${result.processedCount} records with ${result.errorCount} errors`;

  } catch (streamError: any) {
    const errorMessage = `Stream processing error: ${streamError.message}`;
    console.error(errorMessage);
    result.errors.push(errorMessage);
    result.errorCount++;
  }

  return result;
}

async function processBatchWithTransaction(
  batch: Partial<typeof clinicalDecisionRules.$inferInsert>[], 
  result: ProcessingResult
) {
  try {
    await db.transaction(async (tx) => {
      for (const ruleData of batch) {
        try {
          await tx.insert(clinicalDecisionRules)
            .values(ruleData as typeof clinicalDecisionRules.$inferInsert)
            .onConflictDoUpdate({
              target: clinicalDecisionRules.ruleCode,
              set: {
                ruleName: ruleData.ruleName,
                ruleDescription: ruleData.ruleDescription,
                dakReference: ruleData.dakReference,
                guidelineVersion: ruleData.guidelineVersion,
                evidenceQuality: ruleData.evidenceQuality,
                decisionSupportMessage: ruleData.decisionSupportMessage,
                moduleCode: ruleData.moduleCode,
                whoGuidelineReference: ruleData.whoGuidelineReference,
                alertSeverity: ruleData.alertSeverity,
                alertTitle: ruleData.alertTitle,
                alertMessage: ruleData.alertMessage,
                recommendations: ruleData.recommendations,
                triggerConditions: ruleData.triggerConditions,
                clinicalThresholds: ruleData.clinicalThresholds,
                isActive: ruleData.isActive,
                version: ruleData.version,
                updatedAt: new Date()
              }
            });
          result.updatedCount++;
        } catch (itemError: any) {
          const errMsg = `Error processing rule ${ruleData.ruleCode} in batch: ${itemError.message}`;
          console.error(errMsg);
          result.errors.push(errMsg);
          result.errorCount++;
          throw new Error(`Rollback batch due to error in rule: ${ruleData.ruleCode}`);
        }
      }
    });
  } catch (batchError: any) {
    const errMsg = `Batch transaction failed: ${batchError.message}. All items in this batch were rolled back.`;
    console.error(errMsg);
    result.errors.push(errMsg);
    result.errorCount += batch.length;
    result.updatedCount = Math.max(0, result.updatedCount - batch.length);
  }
}

// Process CSV data from memory buffer (for file uploads)
async function processDakCsvFromBuffer(csvData: string): Promise<ProcessingResult> {
  console.log(`Processing DAK CSV data from memory buffer`);
  
  const result: ProcessingResult = {
    success: false,
    message: '',
    processedCount: 0,
    updatedCount: 0,
    errorCount: 0,
    errors: []
  };

  if (!csvData || csvData.trim().length === 0) {
    result.message = 'CSV data is empty';
    result.errors.push(result.message);
    return result;
  }

  let recordsBatch: Partial<typeof clinicalDecisionRules.$inferInsert>[] = [];
  let isFirstRow = true;

  try {
    // Create a readable stream from the CSV string
    const readable = Readable.from([csvData]);
    const parser: Parser = readable.pipe(parse({ 
      columns: true, 
      skip_empty_lines: true, 
      trim: true,
      cast: true
    }));

    for await (const rawRecord of parser) {
      // Validate headers on first row
      if (isFirstRow) {
        const headers = Object.keys(rawRecord);
        const validation = validateCsvHeaders(headers);
        if (!validation.valid) {
          result.message = `Missing required headers: ${validation.missingHeaders.join(', ')}`;
          result.errors.push(result.message);
          return result;
        }
        isFirstRow = false;
      }

      result.processedCount++;
      const record = rawRecord as DakRecordCsv;

      const ruleCode = sanitizeString(record.rule_identifier);
      const decisionSupportMessage = sanitizeString(record.display_to_health_worker);
      const moduleCode = sanitizeString(record.applicable_module)?.toUpperCase();

      if (!ruleCode || !decisionSupportMessage || !moduleCode) {
        const error = `Row ${result.processedCount}: Missing required fields (rule_identifier, display_to_health_worker, applicable_module)`;
        result.errors.push(error);
        result.errorCount++;
        continue;
      }

      const isActive = record.is_rule_active ? record.is_rule_active.toLowerCase() === 'true' : true;
      const evidenceQuality = sanitizeString(record.evidence_rating)?.charAt(0).toUpperCase();

      // Validate evidence quality if provided
      if (evidenceQuality && !['A', 'B', 'C', 'D'].includes(evidenceQuality)) {
        const error = `Row ${result.processedCount}: Invalid evidence_rating '${record.evidence_rating}'. Must be A, B, C, or D`;
        result.errors.push(error);
        result.errorCount++;
        continue;
      }

      // Validate module code format
      if (!/^[A-Z0-9_]+$/.test(moduleCode)) {
        const error = `Row ${result.processedCount}: Invalid module_code format '${moduleCode}'. Must contain only uppercase letters, numbers, and underscores`;
        result.errors.push(error);
        result.errorCount++;
        continue;
      }

      const ruleData: Partial<typeof clinicalDecisionRules.$inferInsert> = {
        ruleCode: ruleCode,
        ruleName: sanitizeString(record.rule_name) || ruleCode,
        ruleDescription: sanitizeString(record.rule_description),
        dakReference: sanitizeString(record.dak_source_id),
        guidelineVersion: sanitizeString(record.guideline_doc_version),
        evidenceQuality: evidenceQuality,
        decisionSupportMessage: decisionSupportMessage,
        moduleCode: moduleCode,
        module: moduleCode, // Keep compatibility with existing field
        whoGuidelineReference: sanitizeString(record.who_guideline_ref),
        alertSeverity: sanitizeString(record.alert_severity) || 'yellow',
        alertTitle: sanitizeString(record.alert_title) || ruleCode,
        alertMessage: sanitizeString(record.alert_message) || decisionSupportMessage,
        recommendations: parseJsonField(record.recommendations) || [],
        triggerConditions: parseJsonField(record.trigger_conditions) || {},
        clinicalThresholds: parseJsonField(record.clinical_thresholds),
        isActive: isActive,
        version: sanitizeString(record.version) || '1.0',
        createdBy: 1 // System user - this should be updated to actual user
      };

      recordsBatch.push(ruleData);

      if (recordsBatch.length >= BATCH_SIZE) {
        await processBatchWithTransaction(recordsBatch, result);
        recordsBatch = [];
      }
    }

    // Process remaining records
    if (recordsBatch.length > 0) {
      await processBatchWithTransaction(recordsBatch, result);
    }

    result.success = result.errorCount === 0;
    result.message = result.success 
      ? `Successfully processed ${result.processedCount} records with ${result.updatedCount} updates`
      : `Processed ${result.processedCount} records with ${result.errorCount} errors`;

  } catch (streamError: any) {
    const errorMessage = `Stream processing error: ${streamError.message}`;
    console.error(errorMessage);
    result.errors.push(errorMessage);
    result.errorCount++;
  }

  return result;
}

export default {
  processDakCsvFileStream,
  processDakCsvFromBuffer
};