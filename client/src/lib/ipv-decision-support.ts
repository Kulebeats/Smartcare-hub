/**
 * IPV Clinical Decision Support Engine
 * 
 * Implements WHO guidelines for IPV screening and response protocols
 * with safety-first approach and risk stratification
 */

export interface IPVRiskAssessment {
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'immediate_danger';
  recommendations: string[];
  safetyConsiderations: string[];
  referralRequired: boolean;
  urgentAction: boolean;
  alertSeverity: 'blue' | 'yellow' | 'orange' | 'red';
  alertTitle: string;
  alertMessage: string;
}

export interface IPVDecisionRule {
  id: string;
  ruleCode: string;
  ruleName: string;
  businessRule: string;
  trigger: string[];
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'immediate_danger';
  alertSeverity: 'blue' | 'yellow' | 'orange' | 'red';
  alertTitle: string;
  alertMessage: string;
  recommendations: string[];
  safetyConsiderations: string[];
  whoGuidelineReference: string;
  referralRequired: boolean;
  urgentAction: boolean;
}

// WHO-compliant IPV Clinical Decision Rules
export const ipvDecisionRules: IPVDecisionRule[] = [
  {
    id: "IPV.01",
    ruleCode: "IPV_NO_SIGNS", 
    ruleName: "No IPV Signs Detected",
    businessRule: "When no IPV signs are present, continue routine care with general safety information",
    trigger: ["No presenting signs or symptoms indicative of IPV"],
    riskLevel: "none",
    alertSeverity: "blue",
    alertTitle: "No IPV Risk Indicators",
    alertMessage: "No current signs of IPV detected. Continue routine care.",
    recommendations: [
      "Continue standard antenatal care",
      "Provide general information about healthy relationships",
      "Ensure patient knows IPV resources are available if needed"
    ],
    safetyConsiderations: [
      "IPV can develop or escalate during pregnancy",
      "Maintain open, non-judgmental communication"
    ],
    whoGuidelineReference: "WHO Health care for women subjected to intimate partner violence or sexual violence - Clinical handbook",
    referralRequired: false,
    urgentAction: false
  },
  
  {
    id: "IPV.02",
    ruleCode: "IPV_BEHAVIORAL_SIGNS",
    ruleName: "Behavioral IPV Indicators", 
    businessRule: "Behavioral signs may indicate early or low-level IPV requiring enhanced support",
    trigger: [
      "Woman's partner or husband is intrusive during consultations",
      "Woman often misses her own or her children's health-care appointments",
      "Children have emotional and behavioural problems"
    ],
    riskLevel: "low",
    alertSeverity: "yellow",
    alertTitle: "Behavioral IPV Risk Indicators",
    alertMessage: "Behavioral patterns suggest possible IPV. Enhanced assessment and support recommended.",
    recommendations: [
      "Conduct private consultation when safe to do so",
      "Provide IPV information and resources discretely",
      "Assess patient's safety concerns and support needs",
      "Document observations professionally and confidentially"
    ],
    safetyConsiderations: [
      "Ensure partner cannot access patient records",
      "Do not confront partner about behavior",
      "Respect patient's choices about disclosure"
    ],
    whoGuidelineReference: "WHO Health care for women subjected to intimate partner violence or sexual violence - Clinical handbook",
    referralRequired: false,
    urgentAction: false
  },
  
  {
    id: "IPV.03",
    ruleCode: "IPV_PSYCHOLOGICAL_IMPACT",
    ruleName: "Psychological IPV Impact",
    businessRule: "Psychological symptoms often indicate ongoing IPV requiring specialized support", 
    trigger: [
      "Ongoing stress",
      "Ongoing anxiety",
      "Ongoing depression", 
      "Unspecified ongoing emotional health issues",
      "Misuse of alcohol",
      "Misuse of drugs",
      "Unspecified harmful behaviours",
      "Thoughts of self-harm or (attempted) suicide",
      "Plans of self-harm or (attempt) suicide"
    ],
    riskLevel: "medium",
    alertSeverity: "orange",
    alertTitle: "Psychological IPV Impact Detected",
    alertMessage: "Signs suggest psychological impact of IPV. Mental health support and safety assessment needed.",
    recommendations: [
      "Conduct comprehensive mental health screening",
      "Provide specialized IPV counseling referral",
      "Develop safety plan with patient",
      "Consider psychosocial support services",
      "Schedule more frequent follow-up appointments"
    ],
    safetyConsiderations: [
      "Risk of suicide may be elevated",
      "Patient may minimize danger due to psychological impact",
      "Ensure immediate mental health support is available"
    ],
    whoGuidelineReference: "WHO Health care for women subjected to intimate partner violence or sexual violence - Clinical handbook",
    referralRequired: true,
    urgentAction: false
  },
  
  {
    id: "IPV.04", 
    ruleCode: "IPV_PHYSICAL_INDICATORS",
    ruleName: "Physical IPV Indicators",
    businessRule: "Physical symptoms and care patterns suggest active IPV requiring immediate intervention",
    trigger: [
      "Repeated sexually transmitted infections (STIs)",
      "Unwanted pregnancies", 
      "Unexplained chronic pain",
      "Unexplained chronic gastrointestinal symptoms",
      "Unexplained genitourinary symptoms",
      "Adverse reproductive outcomes",
      "Unexplained reproductive symptoms",
      "Repeated vaginal bleeding",
      "Injury to abdomen",
      "Injury other (specify)",
      "Problems with central nervous system",
      "Repeated health consultations with no clear diagnosis"
    ],
    riskLevel: "high",
    alertSeverity: "orange",
    alertTitle: "Physical IPV Indicators Present",
    alertMessage: "Physical signs and care patterns suggest active IPV. Immediate assessment and intervention required.",
    recommendations: [
      "Conduct thorough physical examination when safe",
      "Document injuries with photos if consented and safe",
      "Provide immediate IPV specialist referral",
      "Develop comprehensive safety plan",
      "Consider emergency accommodation if needed",
      "Coordinate with social services and legal support"
    ],
    safetyConsiderations: [
      "Patient safety is paramount - do not increase risk",
      "Violence may escalate if partner suspects disclosure",
      "Have emergency contact information readily available"
    ],
    whoGuidelineReference: "WHO Health care for women subjected to intimate partner violence or sexual violence - Clinical handbook",
    referralRequired: true,
    urgentAction: true
  },
  
  {
    id: "IPV.05",
    ruleCode: "IPV_MULTIPLE_INDICATORS",
    ruleName: "Multiple IPV Risk Factors",
    businessRule: "Multiple IPV indicators suggest high risk requiring comprehensive intervention",
    trigger: [], // Will be triggered by combination logic
    riskLevel: "high",
    alertSeverity: "red",
    alertTitle: "Multiple IPV Risk Factors Detected",
    alertMessage: "Multiple signs indicate high IPV risk. Comprehensive safety assessment and immediate intervention required.",
    recommendations: [
      "Conduct immediate comprehensive safety assessment",
      "Activate multi-disciplinary IPV response team",
      "Develop detailed safety plan with patient",
      "Provide emergency contact numbers and resources",
      "Consider emergency shelter referral if safe and desired",
      "Coordinate with police and legal services if appropriate",
      "Schedule urgent follow-up within 24-48 hours"
    ],
    safetyConsiderations: [
      "High risk of escalation - prioritize immediate safety",
      "Multiple exit strategies should be discussed",
      "Emergency services should be readily accessible"
    ],
    whoGuidelineReference: "WHO Health care for women subjected to intimate partner violence or sexual violence - Clinical handbook",
    referralRequired: true,
    urgentAction: true
  }
];

/**
 * Evaluates IPV screening responses and determines risk level and recommendations
 */
export function evaluateIPVRisk(selectedSigns: string[]): IPVRiskAssessment {
  // Handle no signs or "No presenting signs" selected
  if (!selectedSigns || selectedSigns.length === 0 || 
      (selectedSigns.length === 1 && selectedSigns[0] === 'No presenting signs or symptoms indicative of IPV')) {
    const rule = ipvDecisionRules.find(r => r.ruleCode === 'IPV_NO_SIGNS')!;
    return {
      riskLevel: rule.riskLevel,
      recommendations: rule.recommendations,
      safetyConsiderations: rule.safetyConsiderations,
      referralRequired: rule.referralRequired,
      urgentAction: rule.urgentAction,
      alertSeverity: rule.alertSeverity,
      alertTitle: rule.alertTitle,
      alertMessage: rule.alertMessage
    };
  }

  // Filter out "No presenting signs" and automatic disclosure if other signs are selected
  const activeSigns = selectedSigns.filter(sign => 
    sign !== 'No presenting signs or symptoms indicative of IPV' && 
    sign !== 'Woman discloses or is suspected to be subjected to intimate partner violence'
  );
  
  // Check for multiple indicators (3 or more signs)
  if (activeSigns.length >= 3) {
    const rule = ipvDecisionRules.find(r => r.ruleCode === 'IPV_MULTIPLE_INDICATORS')!;
    return {
      riskLevel: rule.riskLevel,
      recommendations: rule.recommendations,
      safetyConsiderations: rule.safetyConsiderations,
      referralRequired: rule.referralRequired,
      urgentAction: rule.urgentAction,
      alertSeverity: rule.alertSeverity,
      alertTitle: rule.alertTitle,
      alertMessage: rule.alertMessage
    };
  }

  // Find the highest priority rule that matches
  let matchedRule: IPVDecisionRule | null = null;
  let highestPriority = 0;

  for (const rule of ipvDecisionRules) {
    if (rule.trigger.length === 0) continue; // Skip combination rules
    
    const hasMatchingSign = rule.trigger.some(trigger => activeSigns.includes(trigger));
    if (hasMatchingSign) {
      const priority = rule.riskLevel === 'high' ? 4 : 
                     rule.riskLevel === 'medium' ? 3 : 
                     rule.riskLevel === 'low' ? 2 : 1;
      
      if (priority > highestPriority) {
        highestPriority = priority;
        matchedRule = rule;
      }
    }
  }

  // Use matched rule or default to behavioral indicators
  const rule = matchedRule || ipvDecisionRules.find(r => r.ruleCode === 'IPV_BEHAVIORAL_SIGNS')!;
  
  return {
    riskLevel: rule.riskLevel,
    recommendations: rule.recommendations,
    safetyConsiderations: rule.safetyConsiderations,
    referralRequired: rule.referralRequired,
    urgentAction: rule.urgentAction,
    alertSeverity: rule.alertSeverity,
    alertTitle: rule.alertTitle,
    alertMessage: rule.alertMessage
  };
}

/**
 * Generates safety-focused recommendations based on IPV risk assessment
 */
export function generateIPVRecommendations(selectedSigns: string[]): string {
  const assessment = evaluateIPVRisk(selectedSigns);
  
  let recommendation = `IPV RISK ASSESSMENT: ${assessment.riskLevel.toUpperCase()}\n\n`;
  recommendation += `${assessment.alertMessage}\n\n`;
  
  if (assessment.recommendations.length > 0) {
    recommendation += "CLINICAL RECOMMENDATIONS:\n";
    assessment.recommendations.forEach((rec, index) => {
      recommendation += `${index + 1}. ${rec}\n`;
    });
    recommendation += "\n";
  }
  
  if (assessment.safetyConsiderations.length > 0) {
    recommendation += "SAFETY CONSIDERATIONS:\n";
    assessment.safetyConsiderations.forEach((safety, index) => {
      recommendation += `• ${safety}\n`;
    });
    recommendation += "\n";
  }
  
  if (assessment.urgentAction) {
    recommendation += "⚠️ URGENT ACTION REQUIRED - Implement immediately\n";
  } else if (assessment.referralRequired) {
    recommendation += "📋 REFERRAL RECOMMENDED - Coordinate specialized support\n";
  }
  
  return recommendation;
}

/**
 * Determines if immediate safety intervention is needed
 */
export function requiresImmediateIntervention(selectedSigns: string[]): boolean {
  const assessment = evaluateIPVRisk(selectedSigns);
  return assessment.urgentAction || assessment.riskLevel === 'high' || assessment.riskLevel === 'immediate_danger';
}

/**
 * Gets appropriate alert styling based on risk level
 */
export function getIPVAlertStyling(selectedSigns: string[]): {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
} {
  const assessment = evaluateIPVRisk(selectedSigns);
  
  switch (assessment.alertSeverity) {
    case 'red':
      return {
        backgroundColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-800',
        iconColor: 'text-red-600'
      };
    case 'orange':
      return {
        backgroundColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600'
      };
    case 'yellow':
      return {
        backgroundColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600'
      };
    default:
      return {
        backgroundColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600'
      };
  }
}