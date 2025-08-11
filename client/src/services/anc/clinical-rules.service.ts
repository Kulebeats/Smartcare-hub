/**
 * Clinical Rules Engine for ANC
 * Evidence-based clinical decision support
 */

import { VitalSigns, MaternalAssessment, FetalAssessment, GestationalAge } from '@/types/anc';
import { DangerSign } from '@/constants/anc/danger-signs';

export interface ClinicalRule {
  id: string;
  category: 'danger' | 'warning' | 'info' | 'action';
  condition: (data: any) => boolean;
  message: string;
  actions: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  reference?: string;
}

export interface ClinicalAlert {
  id: string;
  timestamp: Date;
  rule: ClinicalRule;
  triggered: boolean;
  data?: any;
}

// ============= Pre-eclampsia Rules =============
const preEclampsiaRules: ClinicalRule[] = [
  {
    id: 'severe_preeclampsia',
    category: 'danger',
    condition: (data: { vitalSigns?: VitalSigns }) => {
      const bp = data.vitalSigns?.bloodPressure;
      return bp ? (bp.systolic >= 160 || bp.diastolic >= 110) : false;
    },
    message: 'SEVERE PRE-ECLAMPSIA: Blood pressure ≥160/110 mmHg',
    actions: [
      'Immediate hospitalization required',
      'Start antihypertensive therapy',
      'Magnesium sulfate for seizure prophylaxis',
      'Consider delivery timing'
    ],
    severity: 'critical',
    reference: 'Zambian ANC Guidelines 2022, p.45'
  },
  {
    id: 'mild_preeclampsia',
    category: 'warning',
    condition: (data: { vitalSigns?: VitalSigns; urinalysis?: any }) => {
      const bp = data.vitalSigns?.bloodPressure;
      const hasHypertension = bp ? (bp.systolic >= 140 || bp.diastolic >= 90) : false;
      const hasProteinuria = data.urinalysis?.protein && data.urinalysis.protein !== 'negative';
      return hasHypertension && hasProteinuria;
    },
    message: 'Pre-eclampsia suspected: Hypertension with proteinuria',
    actions: [
      'Monitor BP every 4 hours',
      'Check for danger signs',
      'Weekly antenatal visits',
      'Consider low-dose aspirin'
    ],
    severity: 'high',
    reference: 'WHO Recommendations on Antenatal Care 2016'
  }
];

// ============= Anemia Rules =============
const anemiaRules: ClinicalRule[] = [
  {
    id: 'severe_anemia',
    category: 'danger',
    condition: (data: { labResults?: any }) => {
      const hb = data.labResults?.hemoglobin;
      return hb && hb < 7;
    },
    message: 'SEVERE ANEMIA: Hemoglobin <7 g/dL',
    actions: [
      'Urgent referral for blood transfusion',
      'Investigate cause (malaria, hookworm, HIV)',
      'High-dose iron supplementation',
      'Folate supplementation'
    ],
    severity: 'critical',
    reference: 'Zambian ANC Guidelines 2022, p.62'
  },
  {
    id: 'moderate_anemia',
    category: 'warning',
    condition: (data: { labResults?: any }) => {
      const hb = data.labResults?.hemoglobin;
      return hb && hb >= 7 && hb < 11;
    },
    message: 'Moderate anemia: Hemoglobin 7-11 g/dL',
    actions: [
      'Iron supplementation 120mg daily',
      'Folic acid 5mg daily',
      'Deworming if not done',
      'Recheck Hb in 4 weeks'
    ],
    severity: 'medium',
    reference: 'WHO Guidelines on Anemia Management 2020'
  }
];

// ============= Fetal Distress Rules =============
const fetalDistressRules: ClinicalRule[] = [
  {
    id: 'fetal_bradycardia',
    category: 'danger',
    condition: (data: { fetalAssessment?: FetalAssessment }) => {
      const fhr = data.fetalAssessment?.fetalHeartRate;
      return fhr ? fhr < 110 : false;
    },
    message: 'FETAL BRADYCARDIA: Heart rate <110 bpm',
    actions: [
      'Immediate obstetric review',
      'Continuous CTG monitoring',
      'Consider emergency delivery',
      'Prepare for neonatal resuscitation'
    ],
    severity: 'critical',
    reference: 'FIGO Intrapartum Fetal Monitoring Guidelines 2015'
  },
  {
    id: 'fetal_tachycardia',
    category: 'warning',
    condition: (data: { fetalAssessment?: FetalAssessment }) => {
      const fhr = data.fetalAssessment?.fetalHeartRate;
      return fhr ? fhr > 160 : false;
    },
    message: 'Fetal tachycardia: Heart rate >160 bpm',
    actions: [
      'Check maternal temperature',
      'Rule out maternal dehydration',
      'Consider infection',
      'CTG monitoring for 30 minutes'
    ],
    severity: 'high',
    reference: 'NICE Intrapartum Care Guidelines 2017'
  },
  {
    id: 'reduced_fetal_movement',
    category: 'danger',
    condition: (data: { fetalAssessment?: FetalAssessment }) => {
      return data.fetalAssessment?.fetalMovement === 'absent' || 
             data.fetalAssessment?.fetalMovement === 'reduced';
    },
    message: 'Reduced or absent fetal movements',
    actions: [
      'Immediate CTG monitoring',
      'Ultrasound for biophysical profile',
      'Consider delivery if term',
      'Educate on kick counting'
    ],
    severity: 'high',
    reference: 'RCOG Green-top Guideline No. 57'
  }
];

// ============= Gestational Diabetes Rules =============
const gdmRules: ClinicalRule[] = [
  {
    id: 'gdm_screening_due',
    category: 'action',
    condition: (data: { gestationalAge?: GestationalAge; labResults?: any }) => {
      const ga = data.gestationalAge;
      const hasOGTT = data.labResults?.ogtt;
      return ga && ga.weeks >= 24 && ga.weeks <= 28 && !hasOGTT;
    },
    message: 'GDM screening due (24-28 weeks)',
    actions: [
      'Order 75g oral glucose tolerance test',
      'Fast overnight before test',
      'Check fasting, 1-hour, and 2-hour glucose'
    ],
    severity: 'medium',
    reference: 'IADPSG Criteria 2010'
  },
  {
    id: 'gdm_diagnosed',
    category: 'warning',
    condition: (data: { labResults?: any }) => {
      const ogtt = data.labResults?.ogtt;
      if (!ogtt) return false;
      return (ogtt.fasting >= 92) || (ogtt.oneHour >= 180) || (ogtt.twoHour >= 153);
    },
    message: 'Gestational diabetes diagnosed',
    actions: [
      'Start dietary counseling',
      'Blood glucose monitoring QID',
      'Consider metformin or insulin',
      'Increased fetal surveillance'
    ],
    severity: 'high',
    reference: 'ADA Standards of Medical Care 2023'
  }
];

// ============= HIV/PMTCT Rules =============
const pmtctRules: ClinicalRule[] = [
  {
    id: 'hiv_positive_untreated',
    category: 'danger',
    condition: (data: { labResults?: any; medications?: any[] }) => {
      const hivPositive = data.labResults?.hiv === 'positive';
      const onART = data.medications?.some(med => 
        med.category === 'ART' && med.status === 'active'
      );
      return hivPositive && !onART;
    },
    message: 'HIV+ not on ART - HIGH TRANSMISSION RISK',
    actions: [
      'Start ART immediately (same day)',
      'TDF + 3TC + EFV as first line',
      'Partner testing and counseling',
      'Infant prophylaxis planning'
    ],
    severity: 'critical',
    reference: 'Zambian PMTCT Guidelines 2020'
  },
  {
    id: 'viral_load_monitoring',
    category: 'action',
    condition: (data: { labResults?: any; gestationalAge?: GestationalAge }) => {
      const hivPositive = data.labResults?.hiv === 'positive';
      const ga = data.gestationalAge;
      const lastVL = data.labResults?.viralLoadDate;
      const monthsSinceVL = lastVL ? 
        (new Date().getTime() - new Date(lastVL).getTime()) / (1000 * 60 * 60 * 24 * 30) : 999;
      
      return hivPositive && ga && ga.weeks >= 36 && monthsSinceVL > 3;
    },
    message: 'Viral load monitoring due before delivery',
    actions: [
      'Check viral load urgently',
      'Ensure adherence to ART',
      'Plan delivery based on VL results',
      'Prepare infant prophylaxis'
    ],
    severity: 'high',
    reference: 'WHO Consolidated Guidelines on HIV 2021'
  }
];

// ============= Preterm Labor Rules =============
const pretermLaborRules: ClinicalRule[] = [
  {
    id: 'preterm_labor_risk',
    category: 'warning',
    condition: (data: { gestationalAge?: GestationalAge; symptoms?: string[] }) => {
      const ga = data.gestationalAge;
      const hasContractions = data.symptoms?.includes('contractions');
      return ga && ga.weeks < 37 && hasContractions;
    },
    message: 'Preterm labor risk - GA <37 weeks with contractions',
    actions: [
      'Cervical assessment',
      'Fetal fibronectin test if available',
      'Corticosteroids for lung maturity',
      'Tocolytics if appropriate',
      'Prepare NICU'
    ],
    severity: 'high',
    reference: 'ACOG Practice Bulletin No. 171'
  }
];

// ============= Combined Rules Engine =============
const ALL_RULES: ClinicalRule[] = [
  ...preEclampsiaRules,
  ...anemiaRules,
  ...fetalDistressRules,
  ...gdmRules,
  ...pmtctRules,
  ...pretermLaborRules
];

/**
 * Evaluate clinical rules against patient data
 */
export const evaluateClinicalRules = (
  patientData: any,
  ruleCategories?: string[]
): ClinicalAlert[] => {
  const alerts: ClinicalAlert[] = [];
  const rulesToEvaluate = ruleCategories 
    ? ALL_RULES.filter(rule => ruleCategories.includes(rule.category))
    : ALL_RULES;
  
  for (const rule of rulesToEvaluate) {
    try {
      const triggered = rule.condition(patientData);
      
      if (triggered) {
        alerts.push({
          id: `${rule.id}_${Date.now()}`,
          timestamp: new Date(),
          rule,
          triggered: true,
          data: patientData
        });
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
    }
  }
  
  // Sort by severity
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.rule.severity] - severityOrder[b.rule.severity];
  });
};

/**
 * Get recommended actions based on clinical data
 */
export const getRecommendedActions = (
  patientData: any
): string[] => {
  const alerts = evaluateClinicalRules(patientData);
  const actions = new Set<string>();
  
  // Collect unique actions from triggered rules
  alerts.forEach(alert => {
    alert.rule.actions.forEach(action => actions.add(action));
  });
  
  return Array.from(actions);
};

/**
 * Check if immediate referral is needed
 */
export const requiresImmediateReferral = (
  patientData: any
): { required: boolean; reasons: string[] } => {
  const alerts = evaluateClinicalRules(patientData, ['danger']);
  
  if (alerts.length === 0) {
    return { required: false, reasons: [] };
  }
  
  return {
    required: true,
    reasons: alerts.map(alert => alert.rule.message)
  };
};

/**
 * Generate clinical summary
 */
export const generateClinicalSummary = (
  patientData: any
): {
  criticalAlerts: number;
  warnings: number;
  actions: number;
  topPriority?: string;
} => {
  const alerts = evaluateClinicalRules(patientData);
  
  const criticalAlerts = alerts.filter(a => a.rule.severity === 'critical').length;
  const warnings = alerts.filter(a => a.rule.severity === 'high' || a.rule.severity === 'medium').length;
  const actions = alerts.filter(a => a.rule.category === 'action').length;
  
  const topPriority = alerts.find(a => a.rule.severity === 'critical')?.rule.message;
  
  return {
    criticalAlerts,
    warnings,
    actions,
    topPriority
  };
};