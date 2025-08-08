/**
 * Medical History Clinical Decision Support System (CDSS)
 * Implements ANC.DT.12 Behaviour counselling required business rules
 */

export interface ClientProfileData {
  daily_caffeine_intake?: string;
  tobacco_use_smoking?: string;
  tobacco_use_sniffing?: string;
  recently_quit_tobacco?: string;
  anyone_smokes_in_household?: string;
  uses_alcohol_substances?: string[];
  intimate_partner_violence?: string;
}

// Form data mapping interface for trigger detection
export interface SubstanceUseFormData {
  substanceAssessment?: 'no_assessment' | 'assessment_needed';
  caffeineIntake?: string[];
  tobaccoSmoking?: 'yes' | 'no' | 'recently_quit';
  tobaccoSniffing?: 'yes' | 'no' | 'recently_quit';
  householdSmoking?: 'yes' | 'no';
  clinicalEnquiry?: 'yes' | 'no';
  substanceUse?: string[];
}

export interface CDSSAlert {
  id: string;
  type: 'caffeine' | 'tobacco' | 'secondhand_smoke' | 'alcohol_substance' | 'ipv';
  title: string;
  message: string;
  counsellingGuidance: string;
  triggerCondition: string;
  severity: 'warning' | 'important' | 'critical';
  requiresAcknowledgment: boolean;
}

export interface BehavioralCounsellingTriggers {
  caffeineRequired: boolean;
  tobaccoRequired: boolean;
  secondhandSmokeRequired: boolean;
  alcoholSubstanceRequired: boolean;
  ipvRequired: boolean;
  alerts: CDSSAlert[];
}

/**
 * Evaluates client profile data against ANC.DT.12 business rules
 * to determine required behavioral counselling
 */
export function evaluateBehavioralCounsellingRequirements(
  clientProfile: ClientProfileData,
  contactNumber: number = 1,
  persistentBehaviors: string[] = []
): BehavioralCounsellingTriggers {
  const alerts: CDSSAlert[] = [];
  let caffeineRequired = false;
  let tobaccoRequired = false;
  let secondhandSmokeRequired = false;
  let alcoholSubstanceRequired = false;
  let ipvRequired = false;

  // Caffeine counselling evaluation
  const caffeineIntake = clientProfile.daily_caffeine_intake;
  const highCaffeineIntakes = [
    'More than 2 cups (200 ml) of filtered or commercially brewed coffee',
    'More than 4 cups of tea',
    'More than one bottle of cola or caffeine energy drink',
    'More than 3 cups (300 ml) of instant coffee',
    'More than 48 pieces (squares) of chocolate'
  ];

  if (caffeineIntake && (
    highCaffeineIntakes.includes(caffeineIntake) ||
    caffeineIntake === 'None of the above daily caffeine intake' ||
    persistentBehaviors.includes('High caffeine intake')
  )) {
    caffeineRequired = true;
    const counsellingType = caffeineIntake?.includes('chocolate') ? 'reduction' : 'avoidance';
    
    alerts.push({
      id: 'caffeine_counselling',
      type: 'caffeine',
      title: `Caffeine ${counsellingType} counseling required`,
      message: `Client reports: ${caffeineIntake}`,
      counsellingGuidance: `Health care providers should counsel clients to avoid caffeine completely until they deliver. Lowering daily caffeine intake during pregnancy is recommended to reduce the risk of pregnancy loss and low-birth-weight neonates.\n\nThis includes any product, beverage or food containing caffeine (e.g. brewed coffee, tea, cola-type soft drinks, caffeinated energy drinks, chocolate, caffeine tablets). Caffeine-containing teas (black tea and green tea) and soft drinks (colas and iced tea) usually contain less than 50 mg per 250 ml serving.`,
      triggerCondition: `Daily caffeine intake: ${caffeineIntake}`,
      severity: 'warning',
      requiresAcknowledgment: true
    });
  }

  // Tobacco counselling evaluation
  if (clientProfile.tobacco_use_smoking === 'yes' || 
      clientProfile.tobacco_use_sniffing === 'yes' ||
      clientProfile.recently_quit_tobacco === 'yes' ||
      persistentBehaviors.includes('Current tobacco use or recently quit')) {
    
    tobaccoRequired = true;
    const tobaccoStatus = clientProfile.recently_quit_tobacco === 'yes' ? 'recently quit' : 'current use';
    
    alerts.push({
      id: 'tobacco_counselling',
      type: 'tobacco',
      title: 'Tobacco cessation counseling required',
      message: `Client reports tobacco ${tobaccoStatus}`,
      counsellingGuidance: 'Healthcare providers should routinely offer advice and psycho-social interventions for tobacco cessation to all pregnant women who are either current tobacco users or recent tobacco quitters.',
      triggerCondition: `Tobacco use: ${tobaccoStatus}`,
      severity: 'important',
      requiresAcknowledgment: true
    });
  }

  // Second-hand smoke counselling evaluation
  if (clientProfile.anyone_smokes_in_household === 'yes' ||
      persistentBehaviors.includes('Does anyone in the household smoke?')) {
    
    secondhandSmokeRequired = true;
    
    alerts.push({
      id: 'secondhand_smoke_counselling',
      type: 'secondhand_smoke',
      title: 'Second-hand smoke counseling required',
      message: 'Household member(s) smoke',
      counsellingGuidance: 'Provide pregnant women, their partners and other household members with advice and information about the risks of second-hand smoke (SHS) exposure from all forms of smoked tobacco, as well as strategies to reduce SHS in the home.',
      triggerCondition: 'Anyone in household smokes: Yes',
      severity: 'important',
      requiresAcknowledgment: true
    });
  }

  // Alcohol/substance counselling evaluation
  const substanceUse = clientProfile.uses_alcohol_substances || [];
  const riskSubstances = ['alcohol', 'marijuana', 'cocaine', 'crack', 'injectable_drugs'];
  const hasRiskSubstances = substanceUse.some(substance => 
    riskSubstances.includes(substance.toLowerCase())
  );

  if (hasRiskSubstances ||
      persistentBehaviors.includes('Alcohol use') ||
      persistentBehaviors.includes('Substance use')) {
    
    alcoholSubstanceRequired = true;
    const substanceTypes = substanceUse.filter(s => riskSubstances.includes(s.toLowerCase()));
    
    alerts.push({
      id: 'alcohol_substance_counselling',
      type: 'alcohol_substance',
      title: 'Alcohol / substance use counseling required',
      message: `Client reports: ${substanceTypes.join(', ')}`,
      counsellingGuidance: 'Healthcare providers should at the earliest opportunity advise pregnant women dependent on alcohol or drugs to cease their alcohol or drug use and offer, or refer them to, detoxification services under medical supervision, where necessary and applicable.',
      triggerCondition: `Substance use: ${substanceTypes.join(', ')}`,
      severity: 'critical',
      requiresAcknowledgment: true
    });
  }

  // IPV/GBV counselling evaluation
  if (clientProfile.intimate_partner_violence === 'yes' ||
      clientProfile.intimate_partner_violence === 'suspected') {
    
    ipvRequired = true;
    
    alerts.push({
      id: 'ipv_counselling',
      type: 'ipv',
      title: 'IPV/GBV counseling required',
      message: 'Intimate partner violence indicators present',
      counsellingGuidance: 'Healthcare providers should ask pregnant women about physical or emotional abuse and violence with their current or previous partner. Should also examine the woman for signs of IPV/GBV.',
      triggerCondition: 'IPV/GBV indicators detected',
      severity: 'critical',
      requiresAcknowledgment: true
    });
  }

  return {
    caffeineRequired,
    tobaccoRequired,
    secondhandSmokeRequired,
    alcoholSubstanceRequired,
    ipvRequired,
    alerts
  };
}

/**
 * Gets the color scheme for different alert types
 */
export function getAlertColorScheme(type: CDSSAlert['type'], severity: CDSSAlert['severity']) {
  const baseColors = {
    caffeine: 'orange',
    tobacco: 'red',
    secondhand_smoke: 'purple',
    alcohol_substance: 'red',
    ipv: 'red'
  };

  const intensities = {
    warning: '50',
    important: '100',
    critical: '200'
  };

  const color = baseColors[type];
  const intensity = intensities[severity];

  return {
    background: `bg-${color}-${intensity}`,
    border: `border-${color}-300`,
    text: `text-${color}-800`,
    button: `bg-${color}-500 hover:bg-${color}-600`
  };
}

/**
 * Maps CDSS alert types to behavioral counselling data fields
 */
export function mapAlertToCounsellingField(alertType: CDSSAlert['type']): string {
  const mapping = {
    caffeine: 'caffeine_counselling',
    tobacco: 'tobacco_counselling',
    secondhand_smoke: 'second_hand_smoking',
    alcohol_substance: 'alcohol_substance_counselling',
    ipv: 'ipv_counselling' // This would need to be added to schema if not present
  };

  return mapping[alertType];
}

// New function to evaluate form-based triggers and generate modal alerts
export function evaluateFormTriggers(formData: SubstanceUseFormData): CDSSAlert[] {
  const alerts: CDSSAlert[] = [];
  
  // Only evaluate if assessment is needed
  if (formData.substanceAssessment !== 'assessment_needed') {
    return alerts;
  }

  // Map form data to client profile structure for existing evaluation logic
  const clientProfile: ClientProfileData = {};
  
  // Map caffeine intake
  if (formData.caffeineIntake?.includes('more_than_2_cups_coffee') || 
      formData.caffeineIntake?.includes('more_than_4_cups_tea') ||
      formData.caffeineIntake?.includes('energy_drinks')) {
    clientProfile.daily_caffeine_intake = 'high';
  }
  
  // Map tobacco use
  if (formData.tobaccoSmoking === 'yes' || formData.tobaccoSmoking === 'recently_quit') {
    clientProfile.tobacco_use_smoking = formData.tobaccoSmoking;
  }
  
  if (formData.tobaccoSniffing === 'yes' || formData.tobaccoSniffing === 'recently_quit') {
    clientProfile.tobacco_use_sniffing = formData.tobaccoSniffing;
  }
  
  // Map household smoking
  if (formData.householdSmoking === 'yes') {
    clientProfile.anyone_smokes_in_household = 'yes';
  }
  
  // Map substance use
  if (formData.substanceUse && formData.substanceUse.length > 0 && !formData.substanceUse.includes('none')) {
    clientProfile.uses_alcohol_substances = formData.substanceUse;
  }

  // Use existing evaluation logic
  const evaluation = evaluateBehavioralCounsellingRequirements(clientProfile);
  
  // Return the generated alerts
  return evaluation.alerts;
}

// Helper function to detect if form changes should trigger CDSS modals
export function shouldTriggerCDSSModal(
  fieldName: string, 
  value: string | string[], 
  formData: SubstanceUseFormData
): boolean {
  // Only trigger if assessment is needed
  if (formData.substanceAssessment !== 'assessment_needed') {
    return false;
  }

  // Define triggering conditions
  const triggerConditions = {
    // Caffeine triggers
    caffeineIntake: [
      'more_than_2_cups_coffee',
      'more_than_4_cups_tea', 
      'energy_drinks'
    ],
    // Tobacco triggers
    tobaccoSmoking: ['yes', 'recently_quit'],
    tobaccoSniffing: ['yes', 'recently_quit'],
    // Household smoking trigger
    householdSmoking: ['yes'],
    // Clinical enquiry trigger
    clinicalEnquiry: ['yes'],
    // Substance use triggers
    substanceUse: ['alcohol', 'marijuana', 'cocaine', 'injectable_drugs']
  };

  // Check if the field and value combination should trigger CDSS
  if (fieldName in triggerConditions) {
    const triggers = triggerConditions[fieldName as keyof typeof triggerConditions];
    
    if (Array.isArray(value)) {
      // For checkbox arrays, check if any selected value is a trigger
      return value.some(v => triggers.includes(v));
    } else {
      // For single values, check if it's a trigger
      return triggers.includes(value);
    }
  }

  return false;
}