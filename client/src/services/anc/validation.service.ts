/**
 * Validation Service for ANC Forms
 * Handles clinical data validation and range checking
 */

import { VitalSigns, MaternalAssessment, FetalAssessment, GestationalAge } from '@/types/anc';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  field?: string;
}

export interface ValidationRule {
  field: string;
  min?: number;
  max?: number;
  required?: boolean;
  pattern?: RegExp;
  custom?: (value: any, context?: any) => boolean;
  message: string;
}

// Vital signs normal ranges
const VITAL_SIGNS_RANGES = {
  temperature: { min: 35.5, max: 37.5, warning_min: 36, warning_max: 37.8, unit: '°C' },
  pulseRate: { min: 60, max: 100, warning_min: 50, warning_max: 110, unit: 'bpm' },
  respiratoryRate: { min: 12, max: 20, warning_max: 24, unit: '/min' },
  bloodPressure: {
    systolic: { min: 90, max: 140, warning_max: 150, critical_max: 160, unit: 'mmHg' },
    diastolic: { min: 60, max: 90, warning_max: 95, critical_max: 110, unit: 'mmHg' }
  },
  weight: { min: 30, max: 200, unit: 'kg' },
  height: { min: 100, max: 250, unit: 'cm' }
};

// Fetal assessment normal ranges
const FETAL_RANGES = {
  fetalHeartRate: { 
    firstTrimester: { min: 110, max: 170 },
    secondTrimester: { min: 110, max: 160 },
    thirdTrimester: { min: 110, max: 160 }
  },
  symphysisFundalHeight: {
    // SFH should be +/- 3cm of gestational age after 20 weeks
    tolerance: 3
  }
};

/**
 * Validate vital signs
 */
export const validateVitalSigns = (vitalSigns: Partial<VitalSigns>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Temperature validation
  if (vitalSigns.temperature !== undefined) {
    const temp = vitalSigns.temperature;
    const range = VITAL_SIGNS_RANGES.temperature;
    
    if (temp < range.min || temp > range.max * 1.1) {
      errors.push(`Temperature ${temp}°C is outside acceptable range (${range.min}-${range.max * 1.1}°C)`);
    } else if (temp < range.warning_min || temp > range.warning_max) {
      warnings.push(`Temperature ${temp}°C is abnormal (normal: ${range.min}-${range.max}°C)`);
    }
  }
  
  // Pulse rate validation
  if (vitalSigns.pulseRate !== undefined) {
    const pulse = vitalSigns.pulseRate;
    const range = VITAL_SIGNS_RANGES.pulseRate;
    
    if (pulse < 40 || pulse > 200) {
      errors.push(`Pulse rate ${pulse} bpm is outside acceptable range (40-200 bpm)`);
    } else if (pulse < range.warning_min || pulse > range.warning_max) {
      warnings.push(`Pulse rate ${pulse} bpm is abnormal (normal: ${range.min}-${range.max} bpm)`);
    }
  }
  
  // Respiratory rate validation
  if (vitalSigns.respiratoryRate !== undefined) {
    const resp = vitalSigns.respiratoryRate;
    const range = VITAL_SIGNS_RANGES.respiratoryRate;
    
    if (resp < 8 || resp > 40) {
      errors.push(`Respiratory rate ${resp}/min is outside acceptable range (8-40/min)`);
    } else if (resp > range.warning_max) {
      warnings.push(`Respiratory rate ${resp}/min is elevated (normal: ${range.min}-${range.max}/min)`);
    }
  }
  
  // Blood pressure validation
  if (vitalSigns.bloodPressure) {
    const bp = vitalSigns.bloodPressure;
    const sysRange = VITAL_SIGNS_RANGES.bloodPressure.systolic;
    const diaRange = VITAL_SIGNS_RANGES.bloodPressure.diastolic;
    
    // Systolic validation
    if (bp.systolic < 70 || bp.systolic > 250) {
      errors.push(`Systolic BP ${bp.systolic} mmHg is outside acceptable range (70-250 mmHg)`);
    } else if (bp.systolic >= sysRange.critical_max) {
      warnings.push(`CRITICAL: Systolic BP ${bp.systolic} mmHg indicates severe hypertension (≥${sysRange.critical_max} mmHg)`);
    } else if (bp.systolic >= sysRange.warning_max) {
      warnings.push(`Systolic BP ${bp.systolic} mmHg is elevated (normal: ${sysRange.min}-${sysRange.max} mmHg)`);
    } else if (bp.systolic < sysRange.min) {
      warnings.push(`Systolic BP ${bp.systolic} mmHg is low (normal: ${sysRange.min}-${sysRange.max} mmHg)`);
    }
    
    // Diastolic validation
    if (bp.diastolic < 40 || bp.diastolic > 150) {
      errors.push(`Diastolic BP ${bp.diastolic} mmHg is outside acceptable range (40-150 mmHg)`);
    } else if (bp.diastolic >= diaRange.critical_max) {
      warnings.push(`CRITICAL: Diastolic BP ${bp.diastolic} mmHg indicates severe hypertension (≥${diaRange.critical_max} mmHg)`);
    } else if (bp.diastolic >= diaRange.warning_max) {
      warnings.push(`Diastolic BP ${bp.diastolic} mmHg is elevated (normal: ${diaRange.min}-${diaRange.max} mmHg)`);
    } else if (bp.diastolic < diaRange.min) {
      warnings.push(`Diastolic BP ${bp.diastolic} mmHg is low (normal: ${diaRange.min}-${diaRange.max} mmHg)`);
    }
    
    // Pulse pressure check
    const pulsePressure = bp.systolic - bp.diastolic;
    if (pulsePressure < 20) {
      warnings.push(`Narrow pulse pressure (${pulsePressure} mmHg) - check for measurement error`);
    } else if (pulsePressure > 100) {
      warnings.push(`Wide pulse pressure (${pulsePressure} mmHg) - evaluate for cardiac issues`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate maternal assessment
 */
export const validateMaternalAssessment = (
  assessment: Partial<MaternalAssessment>,
  gestationalAge?: GestationalAge
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Symphysis-fundal height validation
  if (assessment.symphysisFundalHeight && gestationalAge && gestationalAge.weeks >= 20) {
    const sfh = assessment.symphysisFundalHeight;
    const expectedSFH = gestationalAge.weeks;
    const tolerance = FETAL_RANGES.symphysisFundalHeight.tolerance;
    
    if (Math.abs(sfh - expectedSFH) > tolerance) {
      if (sfh < expectedSFH - tolerance) {
        warnings.push(`SFH ${sfh}cm is small for GA ${expectedSFH} weeks (expected: ${expectedSFH}±${tolerance}cm) - consider IUGR`);
      } else {
        warnings.push(`SFH ${sfh}cm is large for GA ${expectedSFH} weeks (expected: ${expectedSFH}±${tolerance}cm) - consider polyhydramnios, multiple pregnancy, or macrosomia`);
      }
    }
  }
  
  // Oedema validation
  if (assessment.oedema && assessment.oedema !== 'none') {
    if (assessment.oedema === 'generalised') {
      warnings.push('Generalised oedema present - evaluate for pre-eclampsia');
    } else if (assessment.oedemaGrade && assessment.oedemaGrade >= 3) {
      warnings.push(`Significant oedema (Grade ${assessment.oedemaGrade}) - monitor for pre-eclampsia`);
    }
  }
  
  // Pallor validation
  if (assessment.pallor === 'severe') {
    warnings.push('Severe pallor - check hemoglobin urgently');
  } else if (assessment.pallor === 'moderate') {
    warnings.push('Moderate pallor - consider anemia evaluation');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate fetal assessment
 */
export const validateFetalAssessment = (
  assessment: Partial<FetalAssessment>,
  gestationalAge?: GestationalAge
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Fetal heart rate validation
  if (assessment.fetalHeartRate && gestationalAge) {
    const fhr = assessment.fetalHeartRate;
    let range;
    
    if (gestationalAge.weeks < 14) {
      range = FETAL_RANGES.fetalHeartRate.firstTrimester;
    } else if (gestationalAge.weeks < 28) {
      range = FETAL_RANGES.fetalHeartRate.secondTrimester;
    } else {
      range = FETAL_RANGES.fetalHeartRate.thirdTrimester;
    }
    
    if (fhr < 100 || fhr > 200) {
      errors.push(`Fetal heart rate ${fhr} bpm is outside acceptable range (100-200 bpm)`);
    } else if (fhr < range.min) {
      warnings.push(`CRITICAL: Fetal bradycardia (${fhr} bpm) - immediate assessment needed`);
    } else if (fhr > range.max) {
      warnings.push(`Fetal tachycardia (${fhr} bpm) - evaluate for fetal distress`);
    }
  }
  
  // Fetal movement validation
  if (assessment.fetalMovement === 'absent') {
    warnings.push('CRITICAL: Absent fetal movements - immediate CTG and ultrasound required');
  } else if (assessment.fetalMovement === 'reduced') {
    warnings.push('Reduced fetal movements - perform kick count and consider CTG');
  }
  
  // Amniotic fluid validation
  if (assessment.amnioticFluidVolume === 'oligohydramnios') {
    warnings.push('Oligohydramnios detected - monitor for fetal compromise');
  } else if (assessment.amnioticFluidVolume === 'polyhydramnios') {
    warnings.push('Polyhydramnios detected - evaluate for GDM and fetal anomalies');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate lab results
 */
export const validateLabResults = (labResults: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Hemoglobin validation
  if (labResults.hemoglobin !== undefined) {
    const hb = parseFloat(labResults.hemoglobin);
    if (hb < 5 || hb > 20) {
      errors.push(`Hemoglobin ${hb} g/dL is outside acceptable range (5-20 g/dL)`);
    } else if (hb < 7) {
      warnings.push(`CRITICAL: Severe anemia (Hb ${hb} g/dL) - urgent transfusion may be needed`);
    } else if (hb < 11) {
      warnings.push(`Anemia detected (Hb ${hb} g/dL) - iron supplementation required`);
    }
  }
  
  // Glucose validation
  if (labResults.glucose !== undefined) {
    const glucose = parseFloat(labResults.glucose);
    if (glucose < 30 || glucose > 600) {
      errors.push(`Glucose ${glucose} mg/dL is outside acceptable range (30-600 mg/dL)`);
    } else if (glucose < 70) {
      warnings.push(`Hypoglycemia (${glucose} mg/dL) - immediate intervention needed`);
    } else if (glucose > 200) {
      warnings.push(`Hyperglycemia (${glucose} mg/dL) - evaluate for diabetes`);
    } else if (glucose > 140) {
      warnings.push(`Elevated glucose (${glucose} mg/dL) - consider OGTT`);
    }
  }
  
  // Proteinuria validation
  if (labResults.urineProtein) {
    const protein = labResults.urineProtein;
    if (protein === '2+' || protein === '3+' || protein === '4+') {
      warnings.push(`Significant proteinuria (${protein}) - evaluate for pre-eclampsia`);
    } else if (protein === '1+' || protein === 'trace') {
      warnings.push(`Trace proteinuria detected - monitor blood pressure`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate required fields for form submission
 */
export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): ValidationResult => {
  const errors: string[] = [];
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    const value = getNestedValue(data, field);
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
};

/**
 * Get nested object value by path
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Validate date ranges
 */
export const validateDateRange = (
  startDate: Date | string,
  endDate: Date | string,
  maxDays?: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    errors.push('Invalid start date');
  }
  
  if (isNaN(end.getTime())) {
    errors.push('Invalid end date');
  }
  
  if (start > end) {
    errors.push('Start date cannot be after end date');
  }
  
  if (maxDays) {
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > maxDays) {
      warnings.push(`Date range exceeds ${maxDays} days`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate gestational age
 */
export const validateGestationalAge = (
  lmp?: Date | string,
  edd?: Date | string,
  currentDate: Date = new Date()
): { valid: boolean; gestationalAge?: GestationalAge; errors: string[] } => {
  const errors: string[] = [];
  
  if (!lmp && !edd) {
    errors.push('Either LMP or EDD is required to calculate gestational age');
    return { valid: false, errors };
  }
  
  let lmpDate: Date;
  
  if (lmp) {
    lmpDate = new Date(lmp);
  } else if (edd) {
    // Calculate LMP from EDD (EDD = LMP + 280 days)
    const eddDate = new Date(edd);
    lmpDate = new Date(eddDate.getTime() - (280 * 24 * 60 * 60 * 1000));
  } else {
    return { valid: false, errors: ['Invalid dates provided'] };
  }
  
  if (isNaN(lmpDate.getTime())) {
    errors.push('Invalid LMP date');
    return { valid: false, errors };
  }
  
  // Calculate gestational age
  const diffMs = currentDate.getTime() - lmpDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    errors.push('LMP cannot be in the future');
    return { valid: false, errors };
  }
  
  if (diffDays > 315) { // 45 weeks
    errors.push('Gestational age exceeds 45 weeks - please verify dates');
    return { valid: false, errors };
  }
  
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  
  return {
    valid: true,
    gestationalAge: { weeks, days },
    errors: []
  };
};