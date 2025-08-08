/**
 * Clinical Decision Support Engine
 * Comprehensive WHO guideline-compliant clinical decision support system
 */

import { db } from "./db";
import { clinicalDecisionRules, clinicalAlerts, whoGuidelines } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Clinical Alert Severity Levels
export const ALERT_SEVERITY = {
  YELLOW: 'yellow',    // Monitoring recommendations
  ORANGE: 'orange',    // Immediate interventions
  RED: 'red',         // Urgent referral required
  PURPLE: 'purple',   // Labor evaluation
  BLUE: 'blue'        // Informational guidance
} as const;

// Clinical Modules
export const CLINICAL_MODULES = {
  ANC: 'ANC',
  ART: 'ART',
  PHARMACOVIGILANCE: 'PHARMACOVIGILANCE',
  PREP: 'PREP'
} as const;

// WHO Clinical Thresholds for ANC Module
export const WHO_ANC_THRESHOLDS = {
  // Vital Signs
  respiratoryRate: { normal: { min: 12, max: 20 } },
  oxygenSaturation: { critical: 92, normal: 95 },
  fetalHeartRate: { normal: { min: 110, max: 160 } },
  bloodPressure: {
    normal: { systolic: 120, diastolic: 80 },
    hypertension: { systolic: 140, diastolic: 90 },
    severeHypertension: { systolic: 160, diastolic: 110 },
    followUpTiming: { minMinutes: 10, maxMinutes: 15 }
  },
  temperature: { normal: { min: 36.0, max: 37.5 }, fever: 38.0 },
  pulseRate: { normal: { min: 60, max: 100 } },
  
  // Laboratory Values
  hemoglobin: { 
    normal: { min: 11.0 }, 
    mildAnemia: { min: 10.0, max: 10.9 },
    moderateAnemia: { min: 7.0, max: 9.9 },
    severeAnemia: { max: 6.9 }
  },
  
  // Fetal Assessment
  symphysialFundalHeight: { 
    gestationalAge: (weeks: number) => ({ min: weeks - 3, max: weeks + 3 })
  },
  
  // Cervical Assessment
  cervicalDilation: {
    preterm: { threshold: 2, gestationalAgeLimit: 37 },
    term: { laborActive: 4 }
  }
};

// Clinical Decision Rules for ANC Module
export const ANC_DECISION_RULES = [
  {
    ruleCode: 'ANC_RESP_ABNORMAL',
    ruleName: 'Abnormal Respiratory Rate Detection',
    module: 'ANC',
    triggerConditions: {
      operator: 'OR',
      conditions: [
        { field: 'respiratoryRateFirst', operator: '<', value: 12 },
        { field: 'respiratoryRateFirst', operator: '>', value: 20 }
      ]
    },
    alertSeverity: 'orange',
    alertTitle: 'Abnormal Respiratory Rate Detected',
    alertMessage: 'Respiratory rate outside normal range (12-20 breaths/minute). Second reading required after 5-minute rest period.',
    recommendations: [
      'Position patient comfortably and ensure rest for 5 minutes',
      'Take second respiratory rate reading',
      'Monitor for signs of respiratory distress',
      'Document both readings in patient record'
    ],
    whoGuidelineReference: 'WHO ANC Guidelines - Vital Signs Assessment',
    clinicalThresholds: WHO_ANC_THRESHOLDS.respiratoryRate
  },
  
  {
    ruleCode: 'ANC_HYPOXEMIA_CRITICAL',
    ruleName: 'Critical Hypoxemia Detection',
    module: 'ANC',
    triggerConditions: {
      operator: 'AND',
      conditions: [
        { field: 'oxygenSaturation', operator: '<', value: 92 }
      ]
    },
    alertSeverity: 'red',
    alertTitle: 'Critical Hypoxemia - Urgent Action Required',
    alertMessage: 'Oxygen saturation below 92% indicates severe hypoxemia requiring immediate intervention.',
    recommendations: [
      'Administer oxygen therapy immediately',
      'Position patient in semi-Fowler position',
      'Prepare for urgent hospital referral',
      'Monitor vital signs continuously',
      'Consider underlying respiratory or cardiac causes'
    ],
    whoGuidelineReference: 'WHO Emergency Care Guidelines - Respiratory Management',
    clinicalThresholds: WHO_ANC_THRESHOLDS.oxygenSaturation
  },
  
  {
    ruleCode: 'ANC_FHR_ABNORMAL',
    ruleName: 'Abnormal Fetal Heart Rate',
    module: 'ANC',
    triggerConditions: {
      operator: 'OR',
      conditions: [
        { field: 'fetalHeartRateFirst', operator: '<', value: 110 },
        { field: 'fetalHeartRateFirst', operator: '>', value: 160 }
      ]
    },
    alertSeverity: 'orange',
    alertTitle: 'Abnormal Fetal Heart Rate',
    alertMessage: 'Fetal heart rate outside normal range (110-160 bpm). Position mother and reassess.',
    recommendations: [
      'Position mother in left lateral position',
      'Allow 5-10 minutes for fetal repositioning',
      'Take second fetal heart rate reading',
      'If FHR remains abnormal, prepare for hospital referral',
      'Monitor fetal movements'
    ],
    whoGuidelineReference: 'WHO ANC Guidelines - Fetal Assessment',
    clinicalThresholds: WHO_ANC_THRESHOLDS.fetalHeartRate
  },
  
  {
    ruleCode: 'ANC_BP_HYPERTENSION',
    ruleName: 'Hypertension Detection',
    module: 'ANC',
    triggerConditions: {
      operator: 'OR',
      conditions: [
        { 
          operator: 'AND',
          conditions: [
            { field: 'bloodPressureSystolic1', operator: '>=', value: 140 },
            { field: 'bloodPressureDiastolic1', operator: '>=', value: 90 }
          ]
        }
      ]
    },
    alertSeverity: 'orange',
    alertTitle: 'Hypertension Detected',
    alertMessage: 'Blood pressure ≥140/90 mmHg indicates hypertension. Second reading required.',
    recommendations: [
      'Allow patient to rest for 10-15 minutes',
      'Take second blood pressure reading',
      'Assess for pre-eclampsia symptoms',
      'Check urine for proteinuria',
      'Consider antihypertensive medication if indicated'
    ],
    whoGuidelineReference: 'WHO ANC Guidelines - Hypertension Management',
    clinicalThresholds: WHO_ANC_THRESHOLDS.bloodPressure
  },
  
  {
    ruleCode: 'ANC_BP_SEVERE_HYPERTENSION',
    ruleName: 'Severe Hypertension Detection',
    module: 'ANC',
    triggerConditions: {
      operator: 'OR',
      conditions: [
        { field: 'bloodPressureSystolic1', operator: '>=', value: 160 },
        { field: 'bloodPressureDiastolic1', operator: '>=', value: 110 }
      ]
    },
    alertSeverity: 'red',
    alertTitle: 'Severe Hypertension - Urgent Referral Required',
    alertMessage: 'Blood pressure ≥160/110 mmHg indicates severe hypertension requiring urgent management.',
    recommendations: [
      'Initiate antihypertensive therapy immediately',
      'Assess for severe pre-eclampsia symptoms',
      'Prepare for urgent hospital referral',
      'Monitor for eclampsia warning signs',
      'Consider magnesium sulfate if indicated'
    ],
    whoGuidelineReference: 'WHO Emergency Obstetric Care Guidelines',
    clinicalThresholds: WHO_ANC_THRESHOLDS.bloodPressure
  },
  
  {
    ruleCode: 'ANC_PREECLAMPSIA',
    ruleName: 'Pre-eclampsia Detection',
    module: 'ANC',
    triggerConditions: {
      operator: 'AND',
      conditions: [
        {
          operator: 'OR',
          conditions: [
            { field: 'bloodPressureSystolic1', operator: '>=', value: 140 },
            { field: 'bloodPressureDiastolic1', operator: '>=', value: 90 }
          ]
        },
        { field: 'urineProtein', operator: 'IN', value: ['2+', '3+', '4+'] }
      ]
    },
    alertSeverity: 'red',
    alertTitle: 'Pre-eclampsia Detected',
    alertMessage: 'Hypertension with significant proteinuria indicates pre-eclampsia.',
    recommendations: [
      'Assess for severe pre-eclampsia symptoms',
      'Monitor for visual disturbances, headache, epigastric pain',
      'Prepare for urgent hospital referral',
      'Consider corticosteroids for fetal lung maturity',
      'Plan delivery timing based on severity'
    ],
    whoGuidelineReference: 'WHO Pre-eclampsia Prevention Guidelines',
    clinicalThresholds: WHO_ANC_THRESHOLDS.bloodPressure
  },
  
  {
    ruleCode: 'ANC_ANEMIA_SEVERE',
    ruleName: 'Severe Anemia Detection',
    module: 'ANC',
    triggerConditions: {
      operator: 'AND',
      conditions: [
        { field: 'hemoglobinLevel', operator: '<', value: 70 } // 7.0 g/dL * 10
      ]
    },
    alertSeverity: 'red',
    alertTitle: 'Severe Anemia - Urgent Treatment Required',
    alertMessage: 'Hemoglobin below 7.0 g/dL indicates severe anemia requiring urgent intervention.',
    recommendations: [
      'Consider blood transfusion if Hb <7.0 g/dL',
      'Investigate underlying cause of anemia',
      'Start high-dose iron supplementation',
      'Assess for signs of cardiac failure',
      'Plan for hospital delivery'
    ],
    whoGuidelineReference: 'WHO Anemia Guidelines for Pregnancy',
    clinicalThresholds: WHO_ANC_THRESHOLDS.hemoglobin
  },
  
  {
    ruleCode: 'ANC_CERVICAL_PRETERM',
    ruleName: 'Preterm Cervical Dilation',
    module: 'ANC',
    triggerConditions: {
      operator: 'AND',
      conditions: [
        { field: 'cervicalDilation', operator: '>=', value: 2 },
        { field: 'gestationalAge', operator: '<', value: 37 }
      ]
    },
    alertSeverity: 'purple',
    alertTitle: 'Preterm Cervical Dilation Detected',
    alertMessage: 'Cervical dilation ≥2cm before 37 weeks gestation indicates risk of preterm labor.',
    recommendations: [
      'Assess for signs of preterm labor',
      'Consider tocolytic therapy if appropriate',
      'Administer corticosteroids for fetal lung maturity',
      'Prepare for potential preterm delivery',
      'Urgent obstetric consultation required'
    ],
    whoGuidelineReference: 'WHO Preterm Birth Prevention Guidelines',
    clinicalThresholds: WHO_ANC_THRESHOLDS.cervicalDilation
  },
  
  {
    ruleCode: 'ANC_CARDIAC_ABNORMAL',
    ruleName: 'Abnormal Cardiac Findings',
    module: 'ANC',
    triggerConditions: {
      operator: 'AND',
      conditions: [
        { field: 'cardiacExam', operator: '=', value: 'abnormal' }
      ]
    },
    alertSeverity: 'red',
    alertTitle: 'Abnormal Cardiac Findings - Urgent Referral',
    alertMessage: 'Abnormal cardiac examination requires urgent cardiology evaluation.',
    recommendations: [
      'Urgent cardiology consultation required',
      'Perform ECG if available',
      'Assess functional capacity',
      'Consider echocardiography',
      'Plan multidisciplinary care approach'
    ],
    whoGuidelineReference: 'WHO Cardiac Disease in Pregnancy Guidelines',
    clinicalThresholds: {}
  },
  
  {
    ruleCode: 'ANC_SYPHILIS_REACTIVE',
    ruleName: 'Reactive Syphilis Test',
    module: 'ANC',
    triggerConditions: {
      operator: 'AND',
      conditions: [
        { field: 'syphilisTest', operator: '=', value: 'reactive' }
      ]
    },
    alertSeverity: 'orange',
    alertTitle: 'Reactive Syphilis Test - Treatment Required',
    alertMessage: 'Reactive syphilis test requires immediate treatment to prevent congenital syphilis.',
    recommendations: [
      'Start benzathine penicillin G treatment immediately',
      'Treat partner(s) simultaneously',
      'Follow-up with repeat testing',
      'Counsel on prevention of reinfection',
      'Monitor for treatment response'
    ],
    whoGuidelineReference: 'WHO STI Treatment Guidelines',
    clinicalThresholds: {}
  }
];

/**
 * Clinical Decision Support Engine Class
 */
export class ClinicalDecisionEngine {
  /**
   * Initialize the decision support engine with WHO guidelines and rules
   */
  static async initialize() {
    try {
      // Insert WHO Guidelines
      await this.insertWHOGuidelines();
      
      // Insert Clinical Decision Rules
      await this.insertClinicalRules();
      
      console.log('Clinical Decision Support Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Clinical Decision Support Engine:', error);
      throw error;
    }
  }
  
  /**
   * Insert WHO Guidelines into database
   */
  static async insertWHOGuidelines() {
    const guidelines = [
      {
        guidelineCode: 'WHO_ANC_VITAL_SIGNS',
        guidelineName: 'WHO ANC Guidelines - Vital Signs Assessment',
        module: 'ANC',
        guidelineDescription: 'Evidence-based guidelines for vital signs assessment during antenatal care',
        clinicalArea: 'maternal_health',
        targetPopulation: 'pregnant_women',
        normalRanges: WHO_ANC_THRESHOLDS,
        alertThresholds: {
          respiratoryRate: { min: 12, max: 20 },
          oxygenSaturation: { critical: 92 },
          fetalHeartRate: { min: 110, max: 160 }
        },
        interventionCriteria: {
          respiratoryRate: 'Second reading required if outside 12-20 range',
          oxygenSaturation: 'Oxygen therapy if <92%',
          fetalHeartRate: 'Positioning and reassessment if abnormal'
        },
        whoDocumentUrl: 'https://www.who.int/publications/i/item/9789241549912',
        version: '2016',
        isActive: true
      },
      {
        guidelineCode: 'WHO_PREECLAMPSIA_MGMT',
        guidelineName: 'WHO Pre-eclampsia Prevention and Management',
        module: 'ANC',
        guidelineDescription: 'Guidelines for prevention, early detection and management of pre-eclampsia',
        clinicalArea: 'maternal_health',
        targetPopulation: 'pregnant_women',
        normalRanges: WHO_ANC_THRESHOLDS.bloodPressure,
        alertThresholds: {
          bloodPressure: { hypertension: '140/90', severe: '160/110' },
          proteinuria: { significant: '2+' }
        },
        interventionCriteria: {
          hypertension: 'Antihypertensive therapy for severe hypertension',
          preeclampsia: 'Delivery planning based on severity and gestational age'
        },
        whoDocumentUrl: 'https://www.who.int/publications/i/item/WHO-RHR-18.11',
        version: '2018',
        isActive: true
      }
    ];
    
    for (const guideline of guidelines) {
      await db.insert(whoGuidelines)
        .values({
          ...guideline,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoNothing();
    }
  }
  
  /**
   * Insert Clinical Decision Rules into database
   */
  static async insertClinicalRules() {
    for (const rule of ANC_DECISION_RULES) {
      await db.insert(clinicalDecisionRules)
        .values({
          ...rule,
          createdBy: 1, // System user
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoNothing();
    }
  }
  
  /**
   * Evaluate clinical data against decision rules
   */
  static async evaluatePatientData(patientData: any, module: string = 'ANC'): Promise<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = [];
    
    // Get active rules for the module
    const rules = await db.select()
      .from(clinicalDecisionRules)
      .where(and(
        eq(clinicalDecisionRules.module, module),
        eq(clinicalDecisionRules.isActive, true)
      ));
    
    // Evaluate each rule
    for (const rule of rules) {
      const isTriggered = this.evaluateRule(rule.triggerConditions as any, patientData);
      
      if (isTriggered) {
        const alert: ClinicalAlert = {
          ruleId: rule.id,
          alertSeverity: rule.alertSeverity,
          alertTitle: rule.alertTitle,
          alertMessage: rule.alertMessage,
          recommendations: rule.recommendations as string[],
          triggerData: this.extractTriggerData(rule.triggerConditions as any, patientData),
          whoGuidelineReference: rule.whoGuidelineReference || '',
          clinicalThresholds: rule.clinicalThresholds || {}
        };
        
        alerts.push(alert);
      }
    }
    
    return alerts.sort((a, b) => this.getSeverityWeight(a.alertSeverity) - this.getSeverityWeight(b.alertSeverity));
  }
  
  /**
   * Evaluate a single rule against patient data
   */
  static evaluateRule(triggerConditions: any, patientData: any): boolean {
    if (!triggerConditions || !patientData) return false;
    
    const { operator, conditions } = triggerConditions;
    
    if (operator === 'AND') {
      return conditions.every((condition: any) => this.evaluateCondition(condition, patientData));
    } else if (operator === 'OR') {
      return conditions.some((condition: any) => this.evaluateCondition(condition, patientData));
    }
    
    return this.evaluateCondition(triggerConditions, patientData);
  }
  
  /**
   * Evaluate a single condition
   */
  static evaluateCondition(condition: any, patientData: any): boolean {
    const { field, operator, value } = condition;
    const fieldValue = patientData[field];
    
    if (fieldValue === null || fieldValue === undefined) return false;
    
    switch (operator) {
      case '<':
        return Number(fieldValue) < Number(value);
      case '<=':
        return Number(fieldValue) <= Number(value);
      case '>':
        return Number(fieldValue) > Number(value);
      case '>=':
        return Number(fieldValue) >= Number(value);
      case '=':
        return fieldValue === value;
      case '!=':
        return fieldValue !== value;
      case 'IN':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'NOT_IN':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }
  
  /**
   * Extract trigger data for alert context
   */
  static extractTriggerData(triggerConditions: any, patientData: any): any {
    const triggerData: any = {};
    
    const extractFields = (conditions: any) => {
      if (Array.isArray(conditions)) {
        conditions.forEach(extractFields);
      } else if (conditions.field) {
        triggerData[conditions.field] = patientData[conditions.field];
      } else if (conditions.conditions) {
        extractFields(conditions.conditions);
      }
    };
    
    extractFields(triggerConditions);
    return triggerData;
  }
  
  /**
   * Get severity weight for sorting alerts
   */
  static getSeverityWeight(severity: string): number {
    const weights = {
      red: 1,
      purple: 2,
      orange: 3,
      yellow: 4,
      blue: 5
    };
    return weights[severity as keyof typeof weights] || 6;
  }
  
  /**
   * Save clinical alerts to database
   */
  static async saveAlerts(alerts: ClinicalAlert[], patientId: number, recordId: number, recordType: string): Promise<void> {
    for (const alert of alerts) {
      await db.insert(clinicalAlerts)
        .values({
          patientId,
          recordId,
          recordType,
          ruleId: alert.ruleId,
          alertSeverity: alert.alertSeverity,
          alertTitle: alert.alertTitle,
          alertMessage: alert.alertMessage,
          recommendations: alert.recommendations,
          triggerData: alert.triggerData,
          clinicalContext: `WHO Guideline: ${alert.whoGuidelineReference}`,
          referralRequired: ['red', 'purple'].includes(alert.alertSeverity),
          createdAt: new Date()
        });
    }
  }
}

// Clinical Alert Interface
export interface ClinicalAlert {
  ruleId: number;
  alertSeverity: string;
  alertTitle: string;
  alertMessage: string;
  recommendations: string[];
  triggerData: any;
  whoGuidelineReference: string;
  clinicalThresholds: any;
}

// Export decision support engine for use in API routes
export default ClinicalDecisionEngine;