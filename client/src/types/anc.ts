/**
 * ANC Module Type Definitions
 * Comprehensive types for all ANC-related data structures
 */

import { z } from 'zod';
import { DangerSign } from '@/constants/anc/danger-signs';

// ============= Core Patient Types =============
export interface PatientData {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age?: number;
  nrc?: string;
  phoneNumber?: string;
  address?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  facilityId: string;
}

// ============= Gestational Age Types =============
export interface GestationalAge {
  weeks: number;
  days: number;
  confidence: 'high' | 'medium' | 'low';
  method: 'lmp' | 'ultrasound' | 'clinical' | 'sfh';
  calculatedDate: Date;
  discrepancy?: {
    method: string;
    difference: number;
  };
}

export interface EDDCalculation {
  edd: Date;
  method: 'lmp' | 'ultrasound' | 'clinical';
  gestationalAge: GestationalAge;
  trimester: 1 | 2 | 3;
  daysToEDD: number;
  isOverdue: boolean;
}

// ============= Vital Signs Types =============
export interface VitalSigns {
  id?: string;
  encounterId: string;
  patientId: string;
  recordedAt: Date;
  
  // Basic vitals
  temperature?: number;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  pulseRate?: number;
  respiratoryRate?: number;
  
  // Blood pressure
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    position?: 'sitting' | 'standing' | 'lying';
  };
  
  // Anthropometric measurements
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  height?: number;
  heightUnit?: 'cm' | 'inches';
  bmi?: number;
  muac?: number; // Mid-upper arm circumference
  
  // Pregnancy specific
  fundalHeight?: number;
  fundalHeightUnit?: 'cm' | 'weeks';
  fetalHeartRate?: number;
  fetalMovement?: boolean;
  
  // Clinical observations
  oxygenSaturation?: number;
  pallor?: 'absent' | 'mild' | 'moderate' | 'severe';
  edema?: 'absent' | 'mild' | 'moderate' | 'severe';
  edemaLocation?: string[];
}

// ============= ANC Encounter Types =============
export interface ANCEncounter {
  id: string;
  patientId: string;
  facilityId: string;
  providerId: string;
  visitNumber: number;
  visitType: 'initial' | 'followup' | 'emergency';
  encounterDate: Date;
  
  // Clinical data
  gestationalAge?: GestationalAge;
  edd?: EDDCalculation;
  vitalSigns?: VitalSigns;
  dangerSigns?: DangerSign[];
  
  // Assessments
  maternalAssessment?: MaternalAssessment;
  fetalAssessment?: FetalAssessment;
  labResults?: LabResult[];
  
  // Interventions
  medications?: Medication[];
  counselling?: CounsellingRecord;
  referral?: ReferralRecord;
  
  // Status
  status: 'in-progress' | 'completed' | 'cancelled';
  nextAppointment?: Date;
}

// ============= Assessment Types =============
export interface MaternalAssessment {
  id?: string;
  encounterId: string;
  
  // Physical examination
  pallor: 'absent' | 'present';
  respiratoryExam: 'normal' | 'abnormal';
  respiratoryAbnormalities?: string[];
  cardiacExam: 'normal' | 'abnormal';
  cardiacAbnormalities?: string[];
  breastExam: 'normal' | 'abnormal';
  breastAbnormalities?: string[];
  abdominalExam: 'normal' | 'abnormal';
  abdominalAbnormalities?: string[];
  
  // Obstetric examination
  uterineSize?: number;
  lie?: 'longitudinal' | 'transverse' | 'oblique';
  presentation?: 'cephalic' | 'breech' | 'shoulder';
  position?: string;
  engagement?: 'engaged' | 'not engaged';
  
  // Clinical notes
  clinicalNotes?: string;
  assessedBy: string;
  assessedAt: Date;
}

export interface FetalAssessment {
  id?: string;
  encounterId: string;
  
  fetalHeartRate: number;
  fetalHeartRhythm: 'regular' | 'irregular';
  fetalMovement: 'present' | 'reduced' | 'absent';
  estimatedFetalWeight?: number;
  amnioticFluidVolume?: 'normal' | 'increased' | 'decreased';
  placentalPosition?: string;
  
  multiplePregnancy: boolean;
  numberOfFetuses?: number;
  
  assessedBy: string;
  assessedAt: Date;
}

// ============= Laboratory Types =============
export interface LabResult {
  id: string;
  encounterId: string;
  testName: string;
  testCode?: string;
  category: 'hematology' | 'biochemistry' | 'serology' | 'microbiology' | 'urinalysis';
  
  result: string | number;
  unit?: string;
  referenceRange?: string;
  interpretation?: 'normal' | 'abnormal-low' | 'abnormal-high' | 'critical';
  
  orderedDate: Date;
  collectedDate?: Date;
  resultDate?: Date;
  
  performedBy?: string;
  verifiedBy?: string;
  comments?: string;
}

// ============= Medication Types =============
export interface Medication {
  id: string;
  encounterId: string;
  name: string;
  genericName?: string;
  
  dosage: string;
  frequency: string;
  route: 'oral' | 'iv' | 'im' | 'sc' | 'topical' | 'other';
  duration: string;
  
  indication?: string;
  startDate: Date;
  endDate?: Date;
  
  prescribedBy: string;
  dispensed: boolean;
  dispensedDate?: Date;
  dispensedBy?: string;
}

// ============= Counselling Types =============
export interface CounsellingRecord {
  id: string;
  encounterId: string;
  
  topics: CounsellingTopic[];
  nutritionalCounselling?: boolean;
  birthPreparedness?: boolean;
  dangerSignsEducation?: boolean;
  familyPlanning?: boolean;
  breastfeedingEducation?: boolean;
  
  behavioralFactors?: {
    caffeine?: boolean;
    tobacco?: boolean;
    alcohol?: boolean;
    substanceUse?: boolean;
    ipv?: boolean;
  };
  
  counselledBy: string;
  counselledAt: Date;
  notes?: string;
}

export type CounsellingTopic = 
  | 'nutrition'
  | 'exercise'
  | 'rest'
  | 'hygiene'
  | 'sexual-health'
  | 'mental-health'
  | 'substance-use'
  | 'domestic-violence'
  | 'birth-plan'
  | 'emergency-preparedness'
  | 'newborn-care'
  | 'immunization'
  | 'family-planning';

// ============= Referral Types =============
export interface ReferralRecord {
  id: string;
  encounterId: string;
  referralType: 'emergency' | 'routine' | 'specialist';
  
  referralReasons: string[];
  dangerSigns?: DangerSign[];
  clinicalFindings?: string;
  
  referredTo: string;
  referredToFacility?: string;
  referralDate: Date;
  
  urgency: 'immediate' | 'urgent' | 'scheduled';
  transportArranged?: boolean;
  accompaniedBy?: string;
  
  referredBy: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  feedback?: string;
  feedbackDate?: Date;
}

// ============= Clinical Rules Types =============
export interface ClinicalRule {
  id: string;
  name: string;
  description: string;
  category: 'danger-sign' | 'risk-assessment' | 'intervention' | 'referral';
  
  condition: (data: ANCEncounter) => boolean;
  recommendation: string;
  urgency: 'immediate' | 'same_day' | 'next_visit';
  
  evidence: {
    guideline: string;
    version: string;
    pageReference?: string;
  };
  
  active: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

// ============= Decision Audit Types =============
export interface DecisionAudit {
  id: string;
  ruleId: string;
  patientId: string;
  encounterId: string;
  
  triggeredAt: Date;
  triggeredBy: string;
  
  recommendation: string;
  actionTaken: 'accepted' | 'modified' | 'dismissed';
  
  overridden?: {
    reason: string;
    approvedBy: string;
    approvedAt: Date;
  };
  
  outcome?: string;
  notes?: string;
}

// ============= Validation Schemas =============
export const VitalSignsSchema = z.object({
  temperature: z.number().min(35).max(42).optional(),
  pulseRate: z.number().min(40).max(200).optional(),
  respiratoryRate: z.number().min(8).max(40).optional(),
  bloodPressure: z.object({
    systolic: z.number().min(70).max(250),
    diastolic: z.number().min(40).max(150)
  }).optional(),
  weight: z.number().min(30).max(200).optional(),
  height: z.number().min(100).max(250).optional(),
  fundalHeight: z.number().min(10).max(50).optional(),
  fetalHeartRate: z.number().min(100).max(180).optional()
});

export const GestationalAgeSchema = z.object({
  weeks: z.number().min(0).max(44),
  days: z.number().min(0).max(6),
  confidence: z.enum(['high', 'medium', 'low']),
  method: z.enum(['lmp', 'ultrasound', 'clinical', 'sfh'])
});

// ============= Type Guards =============
export const isValidDangerSign = (value: unknown): value is DangerSign => {
  return typeof value === 'string' && 
    ['Vaginal bleeding', 'Draining', 'Imminent delivery', 'Labour', 
     'Convulsing', 'Severe headache', 'Visual disturbance', 'Unconscious',
     'Fever', 'Looks very ill', 'Severe vomiting', 'Severe abdominal pain', 
     'Other'].includes(value);
};

export const hasHighRiskFactors = (encounter: ANCEncounter): boolean => {
  const criticalSigns = ['Vaginal bleeding', 'Convulsing', 'Unconscious', 'Imminent delivery'];
  return encounter.dangerSigns?.some(sign => criticalSigns.includes(sign)) || false;
};

// ============= Telemetry Types =============
export interface TelemetryEvent {
  eventName: string;
  timestamp: Date;
  userId: string;
  patientId?: string;
  payload: Record<string, any>;
}

export interface DangerSignsConfirmedEvent extends TelemetryEvent {
  eventName: 'danger_signs_confirmed';
  payload: {
    count: number;
    signs: DangerSign[];
    timeToConfirmMs: number;
  };
}

export interface EDDMethodSelectedEvent extends TelemetryEvent {
  eventName: 'edd_method_selected';
  payload: {
    method: 'lmp' | 'ultrasound' | 'clinical';
    gaWeeks: number;
    gaDays: number;
  };
}

export interface ErrorSaveFailedEvent extends TelemetryEvent {
  eventName: 'error_save_failed';
  payload: {
    module: string;
    code?: string;
    message: string;
  };
}