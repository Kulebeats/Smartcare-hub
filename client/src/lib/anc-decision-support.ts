/**
 * ANC Decision Support Engine
 * 
 * This file contains the business logic for the ANC decision support system
 * based on clinical guidelines and protocols.
 */

export interface DecisionRule {
  id: string;
  businessRule: string;
  trigger: string;
  inputs: any;
  output: any;
  action: string;
  annotations: string;
}

// Decision rules for ANC Danger Signs assessment
export const ancDangerSignsRules: DecisionRule[] = [
  {
    id: "ANC.DT.01",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'No danger signs'",
    output: "'Danger signs' = 'No danger signs'",
    action: "ANC.B. ANC Contact",
    annotations: "If no danger signs are present, the health worker can continue with the normal ANC contact."
  },
  {
    id: "ANC.DT.02",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Vaginal bleeding'",
    output: "'Danger signs' = 'Vaginal bleeding'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.03",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Convulsing'",
    output: "'Danger signs' = 'Convulsing'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.04",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Fever'",
    output: "'Danger signs' = 'Fever'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.05",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Severe headache'",
    output: "'Danger signs' = 'Severe headache'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.06",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Visual disturbance'",
    output: "'Danger signs' = 'Visual disturbance'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.07",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Imminent delivery'",
    output: "'Danger signs' = 'Imminent delivery'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.08",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Looks very ill'",
    output: "'Danger signs' = 'Looks very ill'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.09",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Severe vomiting'",
    output: "'Danger signs' = 'Severe vomiting'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.10",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Severe abdominal pain'",
    output: "'Danger signs' = 'Severe abdominal pain'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  },
  {
    id: "ANC.DT.11",
    businessRule: "Before each contact, the health worker should check whether the woman has any of the danger signs listed here. If yes, she should refer to the hospital urgently. If no, she should continue to the normal contact.",
    trigger: "ANC.BS_Quick check",
    inputs: "'Danger signs' = 'Unconscious'",
    output: "'Danger signs' = 'Unconscious'",
    action: "ANC.C. Referral",
    annotations: "This is a danger sign that indicates that the woman needs urgent referral to a hospital."
  }
];

/**
 * Evaluates danger signs and returns the appropriate action
 * 
 * @param dangerSigns Array of selected danger signs
 * @returns The appropriate action and annotation
 */
export function evaluateDangerSigns(dangerSigns: string[]): { action: string; annotation: string } {
  if (!dangerSigns || dangerSigns.length === 0 || (dangerSigns.length === 1 && dangerSigns[0] === 'None')) {
    // No danger signs or "None" selected
    const rule = ancDangerSignsRules.find(r => r.id === "ANC.DT.01");
    return {
      action: rule?.action || "ANC.B. ANC Contact",
      annotation: rule?.annotations || "No danger signs detected."
    };
  }

  // Filter out "None" if other danger signs are selected
  const filteredSigns = dangerSigns.filter(sign => sign !== 'None');

  // If there are any danger signs, find the first matching rule
  for (const sign of filteredSigns) {
    const rule = ancDangerSignsRules.find(r => {
      // Safely check if inputs and output are strings before using includes
      const inputsStr = typeof r.inputs === 'string' ? r.inputs : JSON.stringify(r.inputs);
      const outputStr = typeof r.output === 'string' ? r.output : JSON.stringify(r.output);

      return inputsStr.includes(sign) || outputStr.includes(sign);
    });

    if (rule) {
      return {
        action: rule.action,
        annotation: rule.annotations
      };
    }
  }

  // Default fallback if no specific rule is found
  return {
    action: "ANC.C. Referral",
    annotation: "Danger sign detected. Please refer the patient to a hospital."
  };
}

/**
 * Generates a recommendation based on the evaluation of danger signs
 * 
 * @param dangerSigns Array of selected danger signs
 * @returns A formatted recommendation string
 */
export function generateRecommendation(dangerSigns: string[]): string {
  const { action, annotation } = evaluateDangerSigns(dangerSigns);

  if (action === "ANC.B. ANC Contact") {
    return "RECOMMENDATION: Continue with normal ANC contact. No danger signs requiring urgent attention were detected.";
  } else if (action === "ANC.C. Referral") {
    const signs = dangerSigns.filter(sign => sign !== 'None').join(", ");
    return `URGENT RECOMMENDATION: Immediate referral required. Danger sign(s) detected: ${signs}. ${annotation}`;
  }

  return "RECOMMENDATION: Please consult with a supervisor for guidance on next steps.";
}

/**
 * Assesses obstetric risk based on patient's history.
 * 
 * @param obstetricHistory - An object containing the patient's obstetric history.
 * @returns An object containing risk level, identified risk factors, and recommendations.
 */
export const assessObstetricRisk = (obstetricHistory: any) => {
  const riskFactors = [];
  const recommendations = [];

  // Parity-based risk stratification
  const para = obstetricHistory.para || 0;
  const gravida = obstetricHistory.gravida || 0;

  if (gravida >= 5) {
    riskFactors.push('Grand multiparity (≥5 pregnancies)');
    recommendations.push('Enhanced monitoring for uterine rupture risk');
    recommendations.push('Consider delivery at higher-level facility');
  } else if (para >= 2 && para <= 4) {
    // Multipara (2-4 previous live births) - Standard monitoring with specific considerations
    recommendations.push('Standard ANC monitoring with obstetric history review');

    // Check for previous complications in multipara
    if (obstetricHistory.previousComplications?.includes('cesarean_section')) {
      riskFactors.push('Previous cesarean section');
      recommendations.push('Monitor for VBAC eligibility and uterine scar integrity');
    }

    if (obstetricHistory.previousComplications?.includes('preeclampsia')) {
      riskFactors.push('Previous pre-eclampsia');
      recommendations.push('Enhanced BP monitoring and early pre-eclampsia screening');
    }

    if (obstetricHistory.previousComplications?.includes('gestational_diabetes')) {
      riskFactors.push('Previous gestational diabetes');
      recommendations.push('Early glucose tolerance testing at 12-16 weeks');
    }

    if (obstetricHistory.previousComplications?.includes('preterm_labor')) {
      riskFactors.push('Previous preterm labor');
      recommendations.push('Cervical length monitoring and preterm prevention counseling');
    }

    if (obstetricHistory.previousComplications?.includes('postpartum_hemorrhage')) {
      riskFactors.push('Previous postpartum hemorrhage');
      recommendations.push('Active management of third stage of labor and blood availability');
    }
  }

  // Multipara-specific monitoring protocols
  if (para >= 2 && para <= 4 && riskFactors.length === 0) {
    recommendations.push('Standard ANC visit schedule: 12, 20, 26, 30, 34, 36, 38, 40 weeks');
    recommendations.push('Routine screening: FBC, blood group, syphilis, HIV at booking');
    recommendations.push('Fetal movement monitoring education');
    recommendations.push('Birth preparedness and complication readiness counseling');
  }

  // Risk level determination for multipara
  let riskLevel = 'low';
  if (riskFactors.length > 2 || (para >= 2 && para <= 4 && riskFactors.length > 1)) {
    riskLevel = 'high';
  } else if (riskFactors.length > 0) {
    riskLevel = 'moderate';
  }

  return {
    riskLevel,
    riskFactors,
    recommendations,
    parityCategory: para === 0 ? 'nullipara' : 
                   para === 1 ? 'primipara' : 
                   para >= 2 && para <= 4 ? 'multipara' : 
                   'grand_multipara',
    monitoringIntensity: riskLevel === 'high' ? 'enhanced' : 'standard'
  };
};