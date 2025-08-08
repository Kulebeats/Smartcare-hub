/**
 * ANC Clinical Decision Support API
 * Real-time WHO-compliant alert generation for ANC forms
 */

import { db } from './db';
import { ancRecords, clinicalDecisionRules, clinicalAlerts } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface ANCFormData {
  patientId: number;
  visitType: 'initial' | 'routine';
  gestationalAge?: number;
  
  // Vital Signs
  bpSystolic1?: number;
  bpDiastolic1?: number;
  oxygenSaturation?: number;
  respiratoryRateFirst?: number;
  pulseRateFirst?: number;
  temperatureFirst?: number;
  
  // Fetal Assessment
  fetalHeartRateFirst?: number;
  symphysialFundalHeight?: number;
  
  // Laboratory
  hemoglobinLevel?: number;
  syphilisTest?: string;
  urineProtein?: string;
  
  // Examinations
  cardiacExam?: string;
  respiratoryExam?: string;
  pallorExam?: string;
  cervicalDilation?: number;
}

export interface ClinicalAlert {
  severity: 'red' | 'purple' | 'orange' | 'yellow' | 'blue';
  title: string;
  message: string;
  recommendations: string[];
  ruleCode: string;
  triggerData: Record<string, any>;
}

/**
 * Evaluates ANC form data against WHO-compliant clinical decision rules
 */
export async function evaluateANCData(formData: ANCFormData): Promise<ClinicalAlert[]> {
  const alerts: ClinicalAlert[] = [];
  
  // Get active ANC clinical decision rules
  const rules = await db
    .select()
    .from(clinicalDecisionRules)
    .where(and(
      eq(clinicalDecisionRules.module, 'ANC'),
      eq(clinicalDecisionRules.isActive, true)
    ));

  // Evaluate each rule against the form data
  for (const rule of rules) {
    const triggerConditions = rule.triggerConditions as any;
    const recommendations = rule.recommendations as string[];
    
    if (evaluateConditions(triggerConditions, formData)) {
      alerts.push({
        severity: rule.alertSeverity as any,
        title: rule.alertTitle,
        message: rule.alertMessage,
        recommendations,
        ruleCode: rule.ruleCode,
        triggerData: extractTriggerData(triggerConditions, formData)
      });
    }
  }
  
  // Sort alerts by severity priority (red > purple > orange > yellow > blue)
  const severityOrder = { red: 1, purple: 2, orange: 3, yellow: 4, blue: 5 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  return alerts;
}

/**
 * Evaluates trigger conditions against form data
 */
function evaluateConditions(conditions: any, formData: ANCFormData): boolean {
  if (!conditions || !conditions.conditions) return false;
  
  const { operator, conditions: conditionList } = conditions;
  
  if (operator === 'AND') {
    return conditionList.every((condition: any) => evaluateSingleCondition(condition, formData));
  } else if (operator === 'OR') {
    return conditionList.some((condition: any) => evaluateSingleCondition(condition, formData));
  }
  
  return false;
}

/**
 * Evaluates a single condition against form data
 */
function evaluateSingleCondition(condition: any, formData: ANCFormData): boolean {
  const { field, operator, value } = condition;
  const fieldValue = (formData as any)[field];
  
  if (fieldValue === undefined || fieldValue === null) return false;
  
  switch (operator) {
    case '<':
      return Number(fieldValue) < Number(value);
    case '>':
      return Number(fieldValue) > Number(value);
    case '<=':
      return Number(fieldValue) <= Number(value);
    case '>=':
      return Number(fieldValue) >= Number(value);
    case '==':
      return String(fieldValue) === String(value);
    case '!=':
      return String(fieldValue) !== String(value);
    default:
      return false;
  }
}

/**
 * Extracts the specific data that triggered the alert
 */
function extractTriggerData(conditions: any, formData: ANCFormData): Record<string, any> {
  const triggerData: Record<string, any> = {};
  
  if (conditions.conditions) {
    conditions.conditions.forEach((condition: any) => {
      const { field } = condition;
      const fieldValue = (formData as any)[field];
      if (fieldValue !== undefined) {
        triggerData[field] = fieldValue;
      }
    });
  }
  
  return triggerData;
}

/**
 * Saves ANC record and generates clinical alerts
 */
export async function saveANCRecord(formData: ANCFormData, userId: number): Promise<{
  recordId: number;
  alerts: ClinicalAlert[];
}> {
  // Save ANC record to database
  const [ancRecord] = await db
    .insert(ancRecords)
    .values({
      patientId: formData.patientId,
      visitType: formData.visitType,
      gestationalAge: formData.gestationalAge,
      bpSystolic1: formData.bpSystolic1,
      bpDiastolic1: formData.bpDiastolic1,
      oxygenSaturation: formData.oxygenSaturation,
      respiratoryRateFirst: formData.respiratoryRateFirst,
      pulseRateFirst: formData.pulseRateFirst,
      temperatureFirst: formData.temperatureFirst,
      fetalHeartRateFirst: formData.fetalHeartRateFirst,
      symphysialFundalHeight: formData.symphysialFundalHeight,
      hemoglobinLevel: formData.hemoglobinLevel,
      syphilisTest: formData.syphilisTest,
      urineProtein: formData.urineProtein,
      cardiacExam: formData.cardiacExam,
      respiratoryExam: formData.respiratoryExam,
      pallorExam: formData.pallorExam,
      cervicalDilation: formData.cervicalDilation,
      createdBy: userId
    })
    .returning();

  // Generate clinical alerts
  const alerts = await evaluateANCData(formData);
  
  // Save alerts to database
  for (const alert of alerts) {
    const rule = await db
      .select()
      .from(clinicalDecisionRules)
      .where(eq(clinicalDecisionRules.ruleCode, alert.ruleCode))
      .limit(1);
    
    if (rule.length > 0) {
      await db.insert(clinicalAlerts).values({
        patientId: formData.patientId,
        recordId: ancRecord.id,
        recordType: 'ANC',
        ruleId: rule[0].id,
        alertSeverity: alert.severity,
        alertTitle: alert.title,
        alertMessage: alert.message,
        recommendations: alert.recommendations,
        triggerData: alert.triggerData,
        clinicalContext: `ANC ${formData.visitType} visit - GA: ${formData.gestationalAge || 'unknown'} weeks`
      });
    }
  }
  
  return {
    recordId: ancRecord.id,
    alerts
  };
}

/**
 * Gets active alerts for a patient
 */
export async function getPatientAlerts(patientId: number): Promise<ClinicalAlert[]> {
  const alerts = await db
    .select()
    .from(clinicalAlerts)
    .where(and(
      eq(clinicalAlerts.patientId, patientId),
      eq(clinicalAlerts.isAcknowledged, false)
    ));
  
  return alerts.map(alert => ({
    severity: alert.alertSeverity as any,
    title: alert.alertTitle,
    message: alert.alertMessage,
    recommendations: alert.recommendations as string[],
    ruleCode: '', // Would need join to get this
    triggerData: alert.triggerData as Record<string, any>
  }));
}