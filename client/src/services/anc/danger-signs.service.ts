/**
 * Danger Signs Service
 * Clinical decision support for danger sign assessment
 */

import { 
  DangerSign, 
  DANGER_SIGN_METADATA,
  prioritizeDangerSigns,
  getCriticalDangerSigns,
  requiresImmediateAction
} from '@/constants/anc/danger-signs';
import { ANCEncounter, DecisionAudit } from '@/types/anc';

export interface DangerSignAssessment {
  signs: DangerSign[];
  criticalSigns: DangerSign[];
  requiresImmediateReferral: boolean;
  prioritizedSigns: DangerSign[];
  recommendations: string[];
  referralReasons: string[];
}

/**
 * Assess danger signs and provide clinical recommendations
 */
export const assessDangerSigns = (signs: DangerSign[]): DangerSignAssessment => {
  if (!signs || signs.length === 0) {
    return {
      signs: [],
      criticalSigns: [],
      requiresImmediateReferral: false,
      prioritizedSigns: [],
      recommendations: [],
      referralReasons: []
    };
  }

  const criticalSigns = getCriticalDangerSigns(signs);
  const prioritizedSigns = prioritizeDangerSigns(signs);
  const requiresImmediate = requiresImmediateAction(signs);

  const recommendations = generateRecommendations(prioritizedSigns);
  const referralReasons = generateReferralReasons(prioritizedSigns);

  return {
    signs,
    criticalSigns,
    requiresImmediateReferral: requiresImmediate,
    prioritizedSigns,
    recommendations,
    referralReasons
  };
};

/**
 * Generate clinical recommendations based on danger signs
 */
const generateRecommendations = (signs: DangerSign[]): string[] => {
  const recommendations: string[] = [];
  
  for (const sign of signs) {
    const metadata = DANGER_SIGN_METADATA[sign];
    if (metadata) {
      recommendations.push(metadata.managementProtocol);
    }
  }

  // Add general emergency management if critical signs present
  const hasCritical = signs.some(sign => 
    DANGER_SIGN_METADATA[sign]?.severity === 'critical'
  );
  
  if (hasCritical) {
    recommendations.unshift('EMERGENCY: Stabilize patient immediately and arrange urgent transfer');
  }

  return [...new Set(recommendations)]; // Remove duplicates
};

/**
 * Generate referral reasons from danger signs
 */
const generateReferralReasons = (signs: DangerSign[]): string[] => {
  const reasons: string[] = [];
  
  for (const sign of signs) {
    const metadata = DANGER_SIGN_METADATA[sign];
    if (metadata && metadata.urgency === 'immediate') {
      reasons.push(`${sign} - ${metadata.urgency} referral required`);
    }
  }

  return reasons;
};

/**
 * Evaluate if combination of signs indicates specific conditions
 */
export const evaluateClinicalSyndromes = (signs: DangerSign[]): string[] => {
  const syndromes: string[] = [];

  // Pre-eclampsia/Eclampsia
  if (signs.includes('Severe headache') || signs.includes('Visual disturbance')) {
    if (signs.includes('Convulsing')) {
      syndromes.push('Eclampsia - Medical Emergency');
    } else {
      syndromes.push('Possible severe pre-eclampsia');
    }
  }

  // Hemorrhage
  if (signs.includes('Vaginal bleeding')) {
    if (signs.includes('Unconscious') || signs.includes('Looks very ill')) {
      syndromes.push('Severe hemorrhage with shock - Emergency');
    } else {
      syndromes.push('Antepartum hemorrhage');
    }
  }

  // Sepsis
  if (signs.includes('Fever')) {
    if (signs.includes('Looks very ill') || signs.includes('Unconscious')) {
      syndromes.push('Possible sepsis/septic shock');
    } else {
      syndromes.push('Infection requiring investigation');
    }
  }

  // Labor complications
  if (signs.includes('Labour') || signs.includes('Imminent delivery')) {
    if (signs.includes('Vaginal bleeding')) {
      syndromes.push('Complicated labor - possible placental abruption');
    }
    if (signs.includes('Draining')) {
      syndromes.push('Labor with ruptured membranes');
    }
  }

  return syndromes;
};

/**
 * Create audit record for danger sign assessment
 */
export const createDangerSignAudit = (
  patientId: string,
  encounterId: string,
  assessment: DangerSignAssessment,
  userId: string,
  actionTaken: 'accepted' | 'modified' | 'dismissed'
): DecisionAudit => {
  return {
    id: `audit-${Date.now()}`,
    ruleId: 'danger-sign-assessment',
    patientId,
    encounterId,
    triggeredAt: new Date(),
    triggeredBy: userId,
    recommendation: assessment.recommendations.join('; '),
    actionTaken,
    notes: `Danger signs identified: ${assessment.signs.join(', ')}`
  };
};

/**
 * Validate danger sign selection consistency
 */
export const validateDangerSignConsistency = (signs: DangerSign[]): {
  valid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check for contradictory selections
  if (signs.includes('Unconscious') && signs.includes('Severe headache')) {
    issues.push('Patient cannot report severe headache if unconscious');
  }

  // Labor and imminent delivery should not both be selected
  if (signs.includes('Labour') && signs.includes('Imminent delivery')) {
    issues.push('Select either "Labour" or "Imminent delivery", not both');
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Get danger sign history for trend analysis
 */
export const analyzeDangerSignTrends = (
  encounters: ANCEncounter[]
): {
  recurringSigns: DangerSign[];
  newSigns: DangerSign[];
  resolvedSigns: DangerSign[];
} => {
  if (encounters.length < 2) {
    return {
      recurringSigns: [],
      newSigns: encounters[0]?.dangerSigns || [],
      resolvedSigns: []
    };
  }

  const currentSigns = new Set(encounters[0].dangerSigns || []);
  const previousSigns = new Set(encounters[1].dangerSigns || []);

  const recurringSigns = [...currentSigns].filter(sign => previousSigns.has(sign));
  const newSigns = [...currentSigns].filter(sign => !previousSigns.has(sign));
  const resolvedSigns = [...previousSigns].filter(sign => !currentSigns.has(sign));

  return {
    recurringSigns,
    newSigns,
    resolvedSigns
  };
};

/**
 * Generate danger sign summary for clinical notes
 */
export const generateDangerSignSummary = (assessment: DangerSignAssessment): string => {
  if (assessment.signs.length === 0) {
    return 'No danger signs identified';
  }

  let summary = `Danger signs present: ${assessment.signs.join(', ')}. `;
  
  if (assessment.criticalSigns.length > 0) {
    summary += `CRITICAL: ${assessment.criticalSigns.join(', ')}. `;
  }
  
  if (assessment.requiresImmediateReferral) {
    summary += 'Immediate referral required. ';
  }

  const syndromes = evaluateClinicalSyndromes(assessment.signs);
  if (syndromes.length > 0) {
    summary += `Clinical impression: ${syndromes.join('; ')}. `;
  }

  return summary;
};