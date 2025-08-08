// Risk assessment levels and their corresponding colors
export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export const RISK_COLORS = {
  [RiskLevel.LOW]: "#4ade80", // Green
  [RiskLevel.MEDIUM]: "#facc15", // Yellow
  [RiskLevel.HIGH]: "#f97316", // Orange
  [RiskLevel.CRITICAL]: "#ef4444", // Red
}

// Risk category types for different assessments
export type RiskCategory = 
  | "drugInteraction" 
  | "adverseReaction" 
  | "adherence" 
  | "viralLoad" 
  | "cd4Count" 
  | "liverFunction"
  | "renalFunction"
  | "comorbidity";

export type RiskAssessment = {
  category: RiskCategory;
  level: RiskLevel;
  description: string;
  recommendation?: string;
}

export type PatientRiskProfile = {
  overallRisk: RiskLevel;
  assessments: RiskAssessment[];
  lastUpdated: Date;
}

// Thresholds for medical test values
const THRESHOLDS = {
  CD4_COUNT: {
    [RiskLevel.CRITICAL]: 200,
    [RiskLevel.HIGH]: 350,
    [RiskLevel.MEDIUM]: 500,
  },
  VIRAL_LOAD: {
    [RiskLevel.CRITICAL]: 100000,
    [RiskLevel.HIGH]: 10000,
    [RiskLevel.MEDIUM]: 1000,
  },
  ALT: {
    [RiskLevel.CRITICAL]: 200,
    [RiskLevel.HIGH]: 120,
    [RiskLevel.MEDIUM]: 70,
  },
  AST: {
    [RiskLevel.CRITICAL]: 200,
    [RiskLevel.HIGH]: 120,
    [RiskLevel.MEDIUM]: 70,
  },
  CREATININE: {
    [RiskLevel.CRITICAL]: 2.0,
    [RiskLevel.HIGH]: 1.5,
    [RiskLevel.MEDIUM]: 1.2,
  }
};

// Assess CD4 count risk
function assessCd4Risk(cd4Count: number): RiskAssessment {
  let level = RiskLevel.LOW;
  
  if (cd4Count <= THRESHOLDS.CD4_COUNT[RiskLevel.CRITICAL]) {
    level = RiskLevel.CRITICAL;
  } else if (cd4Count <= THRESHOLDS.CD4_COUNT[RiskLevel.HIGH]) {
    level = RiskLevel.HIGH;
  } else if (cd4Count <= THRESHOLDS.CD4_COUNT[RiskLevel.MEDIUM]) {
    level = RiskLevel.MEDIUM;
  }
  
  const descriptions = {
    [RiskLevel.LOW]: "CD4 count within normal range.",
    [RiskLevel.MEDIUM]: "CD4 count moderately reduced.",
    [RiskLevel.HIGH]: "Low CD4 count indicates compromised immune function.",
    [RiskLevel.CRITICAL]: "Critically low CD4 count; high risk of opportunistic infections."
  };
  
  const recommendations = {
    [RiskLevel.LOW]: "Continue current treatment regimen.",
    [RiskLevel.MEDIUM]: "Monitor closely, consider immune support.",
    [RiskLevel.HIGH]: "Evaluate for treatment failure, consider regimen change.",
    [RiskLevel.CRITICAL]: "Urgent intervention required. Assess for opportunistic infections."
  };
  
  return {
    category: "cd4Count",
    level,
    description: descriptions[level],
    recommendation: recommendations[level]
  };
}

// Assess viral load risk
function assessViralLoadRisk(viralLoad: number): RiskAssessment {
  let level = RiskLevel.LOW;
  
  if (viralLoad >= THRESHOLDS.VIRAL_LOAD[RiskLevel.CRITICAL]) {
    level = RiskLevel.CRITICAL;
  } else if (viralLoad >= THRESHOLDS.VIRAL_LOAD[RiskLevel.HIGH]) {
    level = RiskLevel.HIGH;
  } else if (viralLoad >= THRESHOLDS.VIRAL_LOAD[RiskLevel.MEDIUM]) {
    level = RiskLevel.MEDIUM;
  }
  
  const descriptions = {
    [RiskLevel.LOW]: "Viral load suppressed, indicating effective treatment.",
    [RiskLevel.MEDIUM]: "Detectable viral load, may indicate adherence issues.",
    [RiskLevel.HIGH]: "High viral load, suggests treatment failure.",
    [RiskLevel.CRITICAL]: "Very high viral load, urgent intervention needed."
  };
  
  const recommendations = {
    [RiskLevel.LOW]: "Continue current treatment regimen.",
    [RiskLevel.MEDIUM]: "Assess adherence and consider repeat test in 1 month.",
    [RiskLevel.HIGH]: "Evaluate for treatment failure and drug resistance.",
    [RiskLevel.CRITICAL]: "Urgent regimen switch with resistance testing if available."
  };
  
  return {
    category: "viralLoad",
    level,
    description: descriptions[level],
    recommendation: recommendations[level]
  };
}

// Assess liver function risk based on ALT and AST
function assessLiverFunctionRisk(alt: number, ast: number): RiskAssessment {
  // Take the highest risk level between ALT and AST
  let altLevel = RiskLevel.LOW;
  let astLevel = RiskLevel.LOW;
  
  if (alt >= THRESHOLDS.ALT[RiskLevel.CRITICAL]) {
    altLevel = RiskLevel.CRITICAL;
  } else if (alt >= THRESHOLDS.ALT[RiskLevel.HIGH]) {
    altLevel = RiskLevel.HIGH;
  } else if (alt >= THRESHOLDS.ALT[RiskLevel.MEDIUM]) {
    altLevel = RiskLevel.MEDIUM;
  }
  
  if (ast >= THRESHOLDS.AST[RiskLevel.CRITICAL]) {
    astLevel = RiskLevel.CRITICAL;
  } else if (ast >= THRESHOLDS.AST[RiskLevel.HIGH]) {
    astLevel = RiskLevel.HIGH;
  } else if (ast >= THRESHOLDS.AST[RiskLevel.MEDIUM]) {
    astLevel = RiskLevel.MEDIUM;
  }
  
  // Determine the highest risk level
  const levelValues = {
    [RiskLevel.LOW]: 0,
    [RiskLevel.MEDIUM]: 1,
    [RiskLevel.HIGH]: 2,
    [RiskLevel.CRITICAL]: 3
  };
  
  const level = levelValues[altLevel] > levelValues[astLevel] ? altLevel : astLevel;
  
  const descriptions = {
    [RiskLevel.LOW]: "Liver function tests within normal range.",
    [RiskLevel.MEDIUM]: "Mildly elevated liver enzymes, monitor closely.",
    [RiskLevel.HIGH]: "Significantly elevated liver enzymes, possible hepatotoxicity.",
    [RiskLevel.CRITICAL]: "Severely elevated liver enzymes, urgent intervention required."
  };
  
  const recommendations = {
    [RiskLevel.LOW]: "Continue current treatment regimen.",
    [RiskLevel.MEDIUM]: "Monitor liver function tests monthly.",
    [RiskLevel.HIGH]: "Consider drug toxicity, evaluate for regimen change.",
    [RiskLevel.CRITICAL]: "Discontinue hepatotoxic drugs immediately and refer to specialist."
  };
  
  return {
    category: "liverFunction",
    level,
    description: descriptions[level],
    recommendation: recommendations[level]
  };
}

// Assess renal function risk based on creatinine
function assessRenalFunctionRisk(creatinine: number): RiskAssessment {
  let level = RiskLevel.LOW;
  
  if (creatinine >= THRESHOLDS.CREATININE[RiskLevel.CRITICAL]) {
    level = RiskLevel.CRITICAL;
  } else if (creatinine >= THRESHOLDS.CREATININE[RiskLevel.HIGH]) {
    level = RiskLevel.HIGH;
  } else if (creatinine >= THRESHOLDS.CREATININE[RiskLevel.MEDIUM]) {
    level = RiskLevel.MEDIUM;
  }
  
  const descriptions = {
    [RiskLevel.LOW]: "Renal function within normal range.",
    [RiskLevel.MEDIUM]: "Mildly elevated creatinine, monitor renal function.",
    [RiskLevel.HIGH]: "Significant renal impairment, adjust medication dosing.",
    [RiskLevel.CRITICAL]: "Severe renal impairment, urgent intervention required."
  };
  
  const recommendations = {
    [RiskLevel.LOW]: "Continue current treatment regimen.",
    [RiskLevel.MEDIUM]: "Monitor renal function monthly, ensure adequate hydration.",
    [RiskLevel.HIGH]: "Adjust dosing of renally cleared medications, consider nephrology consult.",
    [RiskLevel.CRITICAL]: "Discontinue nephrotoxic drugs, immediate nephrology referral."
  };
  
  return {
    category: "renalFunction",
    level,
    description: descriptions[level],
    recommendation: recommendations[level]
  };
}

// Assess comorbidity risk
function assessComorbidityRisk(comorbidities: Record<string, boolean>): RiskAssessment {
  // Count the number of active comorbidities
  const activeComorbiditiesCount = Object.values(comorbidities).filter(Boolean).length;
  
  let level = RiskLevel.LOW;
  
  if (activeComorbiditiesCount >= 3) {
    level = RiskLevel.CRITICAL;
  } else if (activeComorbiditiesCount === 2) {
    level = RiskLevel.HIGH;
  } else if (activeComorbiditiesCount === 1) {
    level = RiskLevel.MEDIUM;
  }
  
  const descriptions = {
    [RiskLevel.LOW]: "No significant comorbidities identified.",
    [RiskLevel.MEDIUM]: "One comorbidity present, monitor for interactions.",
    [RiskLevel.HIGH]: "Multiple comorbidities present, complex management required.",
    [RiskLevel.CRITICAL]: "Multiple severe comorbidities, high risk of complications."
  };
  
  const recommendations = {
    [RiskLevel.LOW]: "Standard management approach appropriate.",
    [RiskLevel.MEDIUM]: "Consider impact of comorbidity on HIV management.",
    [RiskLevel.HIGH]: "Implement integrated care approach for multiple conditions.",
    [RiskLevel.CRITICAL]: "Multidisciplinary team approach required, consider specialist referral."
  };
  
  return {
    category: "comorbidity",
    level,
    description: descriptions[level],
    recommendation: recommendations[level]
  };
}

// Generate a comprehensive risk profile for a patient
export function generatePatientRiskProfile(patientData: any): PatientRiskProfile {
  const assessments: RiskAssessment[] = [];
  
  // Generate individual risk assessments
  if (patientData.medicalTests?.cd4Count) {
    assessments.push(assessCd4Risk(patientData.medicalTests.cd4Count));
  }
  
  if (patientData.medicalTests?.viralLoad) {
    assessments.push(assessViralLoadRisk(patientData.medicalTests.viralLoad));
  }
  
  if (patientData.medicalTests?.alt && patientData.medicalTests?.ast) {
    assessments.push(assessLiverFunctionRisk(
      patientData.medicalTests.alt,
      patientData.medicalTests.ast
    ));
  }
  
  if (patientData.medicalTests?.creatinine) {
    assessments.push(assessRenalFunctionRisk(patientData.medicalTests.creatinine));
  }
  
  if (patientData.coMorbidities) {
    assessments.push(assessComorbidityRisk(patientData.coMorbidities));
  }
  
  // Calculate overall risk level (take the highest risk from all assessments)
  const riskLevelValues = {
    [RiskLevel.LOW]: 0,
    [RiskLevel.MEDIUM]: 1,
    [RiskLevel.HIGH]: 2,
    [RiskLevel.CRITICAL]: 3
  };
  
  const highestRiskValue = Math.max(...assessments.map(a => riskLevelValues[a.level]));
  const overallRisk = Object.keys(riskLevelValues).find(
    key => riskLevelValues[key as RiskLevel] === highestRiskValue
  ) as RiskLevel;
  
  return {
    overallRisk,
    assessments,
    lastUpdated: new Date()
  };
}

// Get a color value for a specific risk level
export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level] || RISK_COLORS[RiskLevel.LOW];
}

// Get icon type based on risk category
export function getRiskCategoryIcon(category: RiskCategory): string {
  const icons: Record<RiskCategory, string> = {
    drugInteraction: "pill",
    adverseReaction: "alert-circle",
    adherence: "calendar-check",
    viralLoad: "activity",
    cd4Count: "shield",
    liverFunction: "filter",
    renalFunction: "droplet",
    comorbidity: "layers",
  };
  
  return icons[category] || "help-circle";
}