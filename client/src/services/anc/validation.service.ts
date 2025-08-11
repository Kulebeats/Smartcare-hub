/**
 * ANC Validation Service
 * Clinical data validation with Zod schemas
 */

import { z } from 'zod';
import { DangerSign, isDangerSign } from '@/constants/anc/danger-signs';
import { VitalSignsSchema, GestationalAgeSchema } from '@/types/anc';

// ============= Validation Schemas =============

/**
 * LMP Date validation
 */
export const LMPDateSchema = z.date().refine(
  (date) => {
    const today = new Date();
    const maxDaysPregnant = 44 * 7; // 44 weeks max
    const daysSince = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return date <= today && daysSince >= 0 && daysSince <= maxDaysPregnant;
  },
  { message: 'LMP date must be within the last 44 weeks' }
);

/**
 * Blood Pressure validation
 */
export const BloodPressureSchema = z.object({
  systolic: z.number()
    .min(70, 'Systolic BP too low - verify reading')
    .max(250, 'Systolic BP critically high - immediate action required'),
  diastolic: z.number()
    .min(40, 'Diastolic BP too low - verify reading')
    .max(150, 'Diastolic BP critically high - immediate action required')
}).refine(
  (data) => data.systolic > data.diastolic,
  { message: 'Systolic must be greater than diastolic' }
);

/**
 * Fetal Heart Rate validation
 */
export const FetalHeartRateSchema = z.number()
  .min(100, 'Bradycardia detected - investigate cause')
  .max(180, 'Tachycardia detected - investigate cause');

/**
 * BMI validation for pregnancy
 */
export const PregnancyBMISchema = z.number()
  .min(15, 'Severely underweight - nutritional assessment required')
  .max(50, 'BMI requires specialist consultation');

/**
 * Danger Signs validation
 */
export const DangerSignsSchema = z.array(z.string()).refine(
  (signs) => signs.every(sign => isDangerSign(sign)),
  { message: 'Invalid danger sign selected' }
);

/**
 * Referral validation
 */
export const ReferralSchema = z.object({
  type: z.enum(['emergency', 'routine', 'specialist']),
  reasons: z.array(z.string()).min(1, 'At least one referral reason required'),
  facility: z.string().min(1, 'Referral facility required'),
  urgency: z.enum(['immediate', 'urgent', 'scheduled']),
  transportArranged: z.boolean().optional(),
  notes: z.string().optional()
});

/**
 * Complete ANC Encounter validation
 */
export const ANCEncounterSchema = z.object({
  patientId: z.string().min(1),
  facilityId: z.string().min(1),
  providerId: z.string().min(1),
  visitNumber: z.number().min(1).max(20),
  visitType: z.enum(['initial', 'followup', 'emergency']),
  encounterDate: z.date(),
  
  // Optional clinical data
  dangerSigns: DangerSignsSchema.optional(),
  vitalSigns: VitalSignsSchema.optional(),
  gestationalAge: GestationalAgeSchema.optional(),
  
  status: z.enum(['in-progress', 'completed', 'cancelled']),
  nextAppointment: z.date().optional()
});

// ============= Validation Functions =============

/**
 * Validate vital signs with clinical rules
 */
export const validateVitalSigns = (vitalSigns: any): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    VitalSignsSchema.parse(vitalSigns);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
  }
  
  // Clinical warnings
  if (vitalSigns.temperature) {
    if (vitalSigns.temperature >= 38) {
      warnings.push('Fever present - investigate for infection');
    }
    if (vitalSigns.temperature < 36) {
      warnings.push('Hypothermia - check for shock');
    }
  }
  
  if (vitalSigns.bloodPressure) {
    const { systolic, diastolic } = vitalSigns.bloodPressure;
    if (systolic >= 140 || diastolic >= 90) {
      warnings.push('Hypertension detected - assess for pre-eclampsia');
    }
    if (systolic < 90 || diastolic < 60) {
      warnings.push('Hypotension - assess for hemorrhage or dehydration');
    }
  }
  
  if (vitalSigns.pulseRate) {
    if (vitalSigns.pulseRate > 100) {
      warnings.push('Tachycardia - investigate cause');
    }
    if (vitalSigns.pulseRate < 60) {
      warnings.push('Bradycardia - verify and investigate');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate gestational age consistency
 */
export const validateGestationalAgeConsistency = (
  lmpGA?: { weeks: number; days: number },
  ultrasoundGA?: { weeks: number; days: number },
  sfhGA?: { weeks: number; days: number }
): {
  consistent: boolean;
  discrepancies: string[];
} => {
  const discrepancies: string[] = [];
  
  if (lmpGA && ultrasoundGA) {
    const lmpTotal = lmpGA.weeks * 7 + lmpGA.days;
    const usTotal = ultrasoundGA.weeks * 7 + ultrasoundGA.days;
    const diff = Math.abs(lmpTotal - usTotal);
    
    if (diff > 14) {
      discrepancies.push(`LMP and ultrasound differ by ${diff} days`);
    }
  }
  
  if (sfhGA && ultrasoundGA) {
    const sfhTotal = sfhGA.weeks * 7 + sfhGA.days;
    const usTotal = ultrasoundGA.weeks * 7 + ultrasoundGA.days;
    const diff = Math.abs(sfhTotal - usTotal);
    
    if (diff > 21) {
      discrepancies.push(`SFH and ultrasound differ by ${diff} days - possible IUGR or macrosomia`);
    }
  }
  
  return {
    consistent: discrepancies.length === 0,
    discrepancies
  };
};

/**
 * Validate danger sign combinations
 */
export const validateDangerSignCombinations = (signs: DangerSign[]): {
  valid: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for illogical combinations
  if (signs.includes('Unconscious')) {
    if (signs.includes('Severe headache')) {
      issues.push('Unconscious patient cannot report headache');
    }
    if (signs.includes('Visual disturbance')) {
      issues.push('Unconscious patient cannot report visual symptoms');
    }
    recommendations.push('Focus on objective signs for unconscious patient');
  }
  
  // Check for related signs that should be investigated together
  if (signs.includes('Severe headache') && !signs.includes('Visual disturbance')) {
    recommendations.push('Check for visual disturbances with severe headache (pre-eclampsia screen)');
  }
  
  if (signs.includes('Fever') && !signs.includes('Looks very ill')) {
    recommendations.push('Assess general appearance with fever');
  }
  
  if (signs.includes('Vaginal bleeding') && signs.includes('Severe abdominal pain')) {
    recommendations.push('URGENT: Possible placental abruption - immediate assessment required');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Validate required fields for encounter completion
 */
export const validateEncounterCompletion = (encounter: any): {
  complete: boolean;
  missingFields: string[];
} => {
  const requiredFields = [
    'patientId',
    'facilityId',
    'providerId',
    'visitNumber',
    'visitType',
    'encounterDate'
  ];
  
  const missingFields = requiredFields.filter(field => !encounter[field]);
  
  // Additional validation for first visit
  if (encounter.visitNumber === 1) {
    if (!encounter.lmpDate && !encounter.ultrasoundDate) {
      missingFields.push('LMP or ultrasound date required for first visit');
    }
    if (!encounter.vitalSigns?.weight) {
      missingFields.push('Baseline weight required for first visit');
    }
    if (!encounter.vitalSigns?.height) {
      missingFields.push('Height required for first visit');
    }
  }
  
  return {
    complete: missingFields.length === 0,
    missingFields
  };
};

/**
 * Validate medication dosages
 */
export const validateMedicationDosage = (
  medication: string,
  dosage: string
): {
  valid: boolean;
  warning?: string;
} => {
  const pregnancyMedications: Record<string, { min: number; max: number; unit: string }> = {
    'folic acid': { min: 0.4, max: 5, unit: 'mg' },
    'iron': { min: 30, max: 120, unit: 'mg' },
    'calcium': { min: 1000, max: 2500, unit: 'mg' },
    'vitamin d': { min: 600, max: 4000, unit: 'IU' }
  };
  
  const med = medication.toLowerCase();
  if (pregnancyMedications[med]) {
    const { min, max, unit } = pregnancyMedications[med];
    const doseValue = parseFloat(dosage);
    
    if (isNaN(doseValue)) {
      return { valid: false, warning: 'Invalid dosage format' };
    }
    
    if (doseValue < min) {
      return { valid: false, warning: `Dosage below recommended minimum of ${min}${unit}` };
    }
    
    if (doseValue > max) {
      return { valid: false, warning: `Dosage exceeds maximum safe dose of ${max}${unit}` };
    }
  }
  
  return { valid: true };
};