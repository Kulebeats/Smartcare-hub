/**
 * PrEP Service
 * Handles Pre-Exposure Prophylaxis risk assessment and eligibility
 */

export interface PrEPRiskFactor {
  category: 'behavioral' | 'partner' | 'pregnancy';
  id: string;
  label: string;
  points: number;
  present: boolean;
}

export interface PrEPRiskAssessment {
  score: number;
  level: 'Low' | 'Moderate' | 'High';
  factors: PrEPRiskFactor[];
  recommendations: string[];
  eligibility: 'eligible' | 'ineligible' | 'conditional' | 'pending';
  contraindications: string[];
}

export interface PrEPPrescription {
  regimen: 'TDF/FTC' | 'TAF/FTC' | 'TDF/3TC';
  startDate: string;
  duration: number; // days
  adherenceCounseling: boolean;
  nextVisitDate: string;
}

// Risk scoring thresholds
const RISK_THRESHOLDS = {
  HIGH: 10,
  MODERATE: 5,
  LOW: 0
};

// Risk factors with scoring weights
export const PREP_RISK_FACTORS = {
  behavioral: [
    { id: 'inconsistent_condom', label: 'Inconsistent condom use', points: 3 },
    { id: 'multiple_partners', label: 'Multiple sexual partners (≥2 in last 6 months)', points: 3 },
    { id: 'recent_sti', label: 'Recent STI diagnosis (within 6 months)', points: 2 },
    { id: 'sex_work', label: 'Engages in transactional sex', points: 4 },
    { id: 'substance_use', label: 'Substance use during sex', points: 2 },
    { id: 'partner_change', label: 'Recent change in sexual partner', points: 1 }
  ],
  partner: [
    { id: 'partner_hiv_positive', label: 'Partner is HIV positive', points: 5 },
    { id: 'partner_unknown_status', label: 'Partner HIV status unknown', points: 2 },
    { id: 'partner_high_risk', label: 'Partner has high-risk behaviors', points: 3 },
    { id: 'partner_not_on_art', label: 'HIV+ partner not on ART', points: 4 },
    { id: 'partner_detectable_vl', label: 'Partner has detectable viral load', points: 4 },
    { id: 'partner_injection_drugs', label: 'Partner injects drugs', points: 3 }
  ],
  pregnancy: [
    { id: 'trying_conceive_hiv', label: 'Trying to conceive with HIV+ partner', points: 5 },
    { id: 'pregnant_high_risk', label: 'Pregnant with ongoing risk exposure', points: 4 },
    { id: 'breastfeeding_risk', label: 'Breastfeeding with ongoing risk exposure', points: 3 },
    { id: 'pregnancy_discordant', label: 'Pregnant in serodiscordant relationship', points: 4 }
  ]
};

/**
 * Calculate PrEP risk score based on present risk factors
 */
export function calculatePrEPRiskScore(factors: PrEPRiskFactor[]): number {
  return factors
    .filter(f => f.present)
    .reduce((sum, factor) => sum + factor.points, 0);
}

/**
 * Determine risk level based on score
 */
export function determinePrEPRiskLevel(score: number): 'Low' | 'Moderate' | 'High' {
  if (score >= RISK_THRESHOLDS.HIGH) return 'High';
  if (score >= RISK_THRESHOLDS.MODERATE) return 'Moderate';
  return 'Low';
}

/**
 * Generate PrEP recommendations based on risk assessment
 */
export function generatePrEPRecommendations(assessment: PrEPRiskAssessment): string[] {
  const recommendations: string[] = [];

  // Risk level-based recommendations
  switch (assessment.level) {
    case 'High':
      recommendations.push('Strongly recommend immediate PrEP initiation');
      recommendations.push('Provide intensive adherence counseling');
      recommendations.push('Schedule monthly follow-up visits');
      recommendations.push('Offer HIV self-testing kits for partner');
      break;
    case 'Moderate':
      recommendations.push('Recommend PrEP initiation');
      recommendations.push('Provide standard adherence counseling');
      recommendations.push('Schedule quarterly follow-up visits');
      recommendations.push('Discuss risk reduction strategies');
      break;
    case 'Low':
      recommendations.push('PrEP may be considered based on patient preference');
      recommendations.push('Focus on risk reduction counseling');
      recommendations.push('Regular HIV testing every 6 months');
      break;
  }

  // Factor-specific recommendations
  const factorIds = assessment.factors.filter(f => f.present).map(f => f.id);
  
  if (factorIds.includes('partner_hiv_positive')) {
    recommendations.push('Ensure partner is on ART with viral suppression');
    recommendations.push('Consider couples counseling and testing');
  }
  
  if (factorIds.includes('trying_conceive_hiv')) {
    recommendations.push('Provide conception counseling for serodiscordant couples');
    recommendations.push('Coordinate with fertility services if needed');
  }
  
  if (factorIds.includes('recent_sti')) {
    recommendations.push('Complete STI treatment before PrEP initiation');
    recommendations.push('Regular STI screening every 3 months');
  }
  
  if (factorIds.includes('substance_use')) {
    recommendations.push('Offer substance use counseling and support');
    recommendations.push('Consider harm reduction services');
  }

  // Always include these
  recommendations.push('Provide condoms and lubricants');
  recommendations.push('Educate on PrEP effectiveness and limitations');

  return recommendations;
}

/**
 * Check for PrEP contraindications
 */
export function checkPrEPContraindications(data: {
  hivStatus: string;
  acuteHivSymptoms: string[];
  creatinineClearance?: number;
  allergies?: string[];
  hepatitisB?: string;
}): string[] {
  const contraindications: string[] = [];

  // Absolute contraindications
  if (data.hivStatus === 'positive') {
    contraindications.push('HIV positive status - refer for ART initiation');
  }

  if (data.acuteHivSymptoms.length > 0) {
    contraindications.push(`Acute HIV symptoms present: ${data.acuteHivSymptoms.join(', ')}`);
  }

  // Relative contraindications
  if (data.creatinineClearance && data.creatinineClearance < 60) {
    contraindications.push('Renal impairment (CrCl < 60 mL/min)');
  }

  if (data.allergies?.includes('tenofovir') || data.allergies?.includes('emtricitabine')) {
    contraindications.push('Allergy to PrEP medication components');
  }

  if (data.hepatitisB === 'reactive') {
    contraindications.push('Active Hepatitis B infection - requires specialist consultation');
  }

  return contraindications;
}

/**
 * Determine PrEP eligibility based on risk and contraindications
 */
export function determinePrEPEligibility(
  riskLevel: 'Low' | 'Moderate' | 'High',
  contraindications: string[]
): 'eligible' | 'ineligible' | 'conditional' | 'pending' {
  
  // Check for absolute contraindications
  const hasAbsoluteContraindication = contraindications.some(c => 
    c.includes('HIV positive') || c.includes('Acute HIV symptoms')
  );
  
  if (hasAbsoluteContraindication) {
    return 'ineligible';
  }
  
  // Check for relative contraindications
  const hasRelativeContraindication = contraindications.some(c => 
    c.includes('Renal impairment') || c.includes('Hepatitis B')
  );
  
  if (hasRelativeContraindication) {
    return 'conditional'; // Requires specialist review
  }
  
  // Risk-based eligibility
  if (riskLevel === 'High' || riskLevel === 'Moderate') {
    return 'eligible';
  }
  
  // Low risk - eligibility based on patient preference
  return 'conditional';
}

/**
 * Generate PrEP prescription recommendations
 */
export function generatePrEPPrescription(
  eligibility: string,
  isPregnant: boolean,
  hasRenalImpairment: boolean
): Partial<PrEPPrescription> | null {
  
  if (eligibility !== 'eligible' && eligibility !== 'conditional') {
    return null;
  }
  
  const prescription: Partial<PrEPPrescription> = {};
  
  // Regimen selection
  if (hasRenalImpairment) {
    prescription.regimen = 'TAF/FTC'; // Safer for kidneys
  } else if (isPregnant) {
    prescription.regimen = 'TDF/FTC'; // Preferred in pregnancy
  } else {
    prescription.regimen = 'TDF/FTC'; // Standard first-line
  }
  
  // Duration based on risk and circumstances
  prescription.duration = 30; // Start with 1 month supply for new users
  prescription.adherenceCounseling = true;
  
  // Calculate next visit date (1 month for initial, then quarterly)
  const nextVisit = new Date();
  nextVisit.setMonth(nextVisit.getMonth() + 1);
  prescription.nextVisitDate = nextVisit.toISOString().split('T')[0];
  
  return prescription;
}

/**
 * Calculate follow-up schedule based on PrEP status
 */
export function calculatePrEPFollowUpSchedule(
  isNewUser: boolean,
  riskLevel: string,
  hasComplications: boolean
): {
  interval: number; // days
  tests: string[];
  counseling: string[];
} {
  let interval = 90; // Default quarterly
  const tests: string[] = ['HIV test'];
  const counseling: string[] = ['Adherence assessment'];
  
  if (isNewUser) {
    interval = 30; // Monthly for first 3 months
    tests.push('Creatinine', 'Urinalysis');
    counseling.push('Side effects review', 'Risk reduction counseling');
  } else if (riskLevel === 'High' || hasComplications) {
    interval = 30; // Monthly for high risk
    tests.push('STI screening', 'Creatinine');
  } else {
    // Standard quarterly follow-up
    tests.push('STI screening');
    counseling.push('Risk reassessment');
  }
  
  // Annual tests
  tests.push('Hepatitis B (annually)', 'Hepatitis C (annually)');
  
  return { interval, tests, counseling };
}

/**
 * Validate PrEP assessment completeness
 */
export function validatePrEPAssessment(data: any): {
  isComplete: boolean;
  missingFields: string[];
} {
  const requiredFields = [
    'hivTestDate',
    'hivTestResult',
    'riskAssessmentComplete',
    'eligibilityDetermined'
  ];
  
  const missingFields = requiredFields.filter(field => !data[field]);
  
  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}

/**
 * Generate PrEP clinical alert based on assessment
 */
export function generatePrEPAlert(assessment: PrEPRiskAssessment): {
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  actions: string[];
} | null {
  
  // Critical alerts
  if (assessment.contraindications.some(c => c.includes('HIV positive'))) {
    return {
      type: 'critical',
      title: 'HIV Positive - PrEP Contraindicated',
      message: 'Patient is HIV positive. PrEP is not appropriate.',
      actions: ['Initiate ART immediately', 'Provide post-test counseling', 'Link to HIV care']
    };
  }
  
  if (assessment.contraindications.some(c => c.includes('Acute HIV'))) {
    return {
      type: 'critical',
      title: 'Acute HIV Infection Suspected',
      message: 'Patient has symptoms consistent with acute HIV infection.',
      actions: ['Order HIV RNA test', 'Defer PrEP', 'Retest in 2-4 weeks']
    };
  }
  
  // Warning alerts
  if (assessment.level === 'High' && assessment.eligibility === 'eligible') {
    return {
      type: 'warning',
      title: 'High Risk - Immediate PrEP Indicated',
      message: `Patient has high HIV risk (score: ${assessment.score}). Immediate PrEP initiation recommended.`,
      actions: ['Initiate PrEP today', 'Provide adherence counseling', 'Schedule follow-up in 1 month']
    };
  }
  
  if (assessment.eligibility === 'conditional') {
    return {
      type: 'warning',
      title: 'Conditional PrEP Eligibility',
      message: 'Patient may be eligible for PrEP but requires additional evaluation.',
      actions: ['Review contraindications', 'Consider specialist referral', 'Address barriers']
    };
  }
  
  // Info alerts
  if (assessment.level === 'Moderate' && assessment.eligibility === 'eligible') {
    return {
      type: 'info',
      title: 'Moderate Risk - PrEP Recommended',
      message: 'Patient has moderate HIV risk. PrEP is recommended.',
      actions: ['Discuss PrEP benefits', 'Address concerns', 'Initiate if patient agrees']
    };
  }
  
  return null;
}