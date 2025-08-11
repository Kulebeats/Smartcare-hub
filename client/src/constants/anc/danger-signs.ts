/**
 * Danger Signs Constants and Types
 * Based on Zambian ANC Guidelines 2022
 */

export type DangerSign =
  | 'Vaginal bleeding'
  | 'Draining'
  | 'Imminent delivery'
  | 'Labour'
  | 'Convulsing'
  | 'Severe headache'
  | 'Visual disturbance'
  | 'Unconscious'
  | 'Fever'
  | 'Looks very ill'
  | 'Severe vomiting'
  | 'Severe abdominal pain'
  | 'Other';

export type DangerSignSeverity = 'critical' | 'urgent' | 'warning';

export interface DangerSignMetadata {
  id: DangerSign;
  label: string;
  severity: DangerSignSeverity;
  urgency: 'immediate' | 'same_day' | 'next_visit';
  description: string;
  managementProtocol: string;
  guidelineReference: {
    source: string;
    version: string;
    pageReference?: string;
  };
}

// Frozen, immutable list of danger signs
export const DANGER_SIGNS_LIST: Readonly<DangerSign[]> = Object.freeze([
  'Vaginal bleeding',
  'Draining',
  'Imminent delivery',
  'Labour',
  'Convulsing',
  'Severe headache',
  'Visual disturbance',
  'Unconscious',
  'Fever',
  'Looks very ill',
  'Severe vomiting',
  'Severe abdominal pain',
  'Other'
] as const);

// Zambian ANC Guidelines 2022 danger sign descriptions
export const DANGER_SIGN_DESCRIPTIONS: Readonly<Record<DangerSign, string>> = Object.freeze({
  'Vaginal bleeding': 'Any amount of vaginal bleeding during pregnancy may indicate placental abruption, placenta previa, cervical issues, or threatened abortion. According to the guidelines, bleeding can occur anytime from conception to birth, and all bleeding must be treated as serious and be immediately attended to. Bleeding in the 2nd and 3rd trimester is a possible sign of problems. Assess amount, color, and associated pain. Always requires immediate evaluation.',
  
  'Draining': 'Amniotic fluid leak or rupture of membranes (PROM/PPROM) may be a gush or a slow, steady trickle of clear, straw-colored, or greenish fluid from the vagina. It indicates the protective barrier around the fetus is broken, increasing the risk of infection (chorioamnionitis) and preterm labor. If the baby\'s head is not engaged, there is a risk of umbilical cord prolapse, which is a medical emergency.',
  
  'Imminent delivery': 'This refers to signs that birth is about to happen immediately. Key indicators include an overwhelming urge to bear down or push, strong and frequent contractions (less than 2 minutes apart), the mother grunting with contractions, or the baby\'s head being visible at the vaginal opening (crowning). This requires immediate preparation for a safe birth, regardless of location.',
  
  'Labour': 'This is defined as regular, painful uterine contractions that cause progressive changes to the cervix (effacement and dilation). When this occurs before 37 completed weeks of gestation, it is preterm labor, a significant danger sign that can lead to premature birth. The guidelines define preterm labor as labor that occurs after 20 weeks but before 37 weeks of pregnancy. Infants born before 37 weeks are at an increased risk for health problems.',
  
  'Convulsing': 'Also known as an eclamptic seizure, this is a life-threatening emergency. It involves tonic-clonic (shaking and stiffening) movements and loss of consciousness. It is a sign of eclampsia, a severe complication of high blood pressure in pregnancy. The priority is to manage the patient\'s airway, prevent injury, and administer magnesium sulfate to control the seizure.',
  
  'Severe headache': 'A new-onset, persistent, and often throbbing headache that is not relieved by usual painkillers like paracetamol. It is a hallmark symptom of pre-eclampsia, a condition which the guidelines identify as a serious medical condition. Severe headaches are listed as a key symptom.',
  
  'Visual disturbance': 'New vision problems such as seeing flashing lights or spots (scotomata), double vision, or temporary loss of vision. Like a severe headache, this is a key sign of severe pre-eclampsia or impending eclampsia. The guidelines list "blurred vision" as a symptom of pre-eclampsia.',
  
  'Unconscious': 'A state of unresponsiveness where the patient cannot be roused. This is a critical emergency with many potential causes in pregnancy, including eclampsia, severe blood loss (hypovolemic shock), septic shock, or diabetic coma. Immediate assessment of airway, breathing, and circulation (ABC) is vital.',
  
  'Fever': 'A body temperature ≥38°C (100.4°F) with chills or rigors. It often signals a serious infection, such as chorioamnionitis (infection of the amniotic sac), pyelonephritis (kidney infection), or sepsis. Fever significantly increases the metabolic demands on both the mother and fetus and requires urgent investigation to find and treat the source.',
  
  'Looks very ill': 'This is a crucial clinical sign based on professional judgment. The patient may appear lethargic, confused, pale, or have cool, clammy skin. It often signifies the onset of sepsis or shock before vital signs dramatically change. Trusting this "gut feeling" can lead to earlier life-saving interventions.',
  
  'Severe vomiting': 'Persistent vomiting that prevents the patient from keeping down any food or fluids. The guidelines recognize "Nausea and Vomiting" as a physiological complication of pregnancy. While many women experience this in the first trimester, some may experience it beyond 20 weeks, and pharmacological treatments may be required for distressing symptoms. Severe cases can lead to dehydration, electrolyte imbalances, and nutritional deficiencies (ketosis), which can harm both mother and fetus.',
  
  'Severe abdominal pain': 'Intense, non-contraction pain in the abdomen. The guidelines recognize "Lower Back and Pelvic Pain" as a common physiological symptom in pregnancy. The location of severe pain can provide clues: upper right abdomen pain may suggest HELLP syndrome (a severe form of pre-eclampsia); sharp, constant pain could indicate placental abruption; generalized tenderness with fever may suggest infection.',
  
  'Other': 'Any other concerning symptoms or signs not listed above that require clinical assessment.'
});

// Enhanced metadata with severity and management protocols
export const DANGER_SIGN_METADATA: Readonly<Record<DangerSign, DangerSignMetadata>> = Object.freeze({
  'Vaginal bleeding': {
    id: 'Vaginal bleeding',
    label: 'Vaginal bleeding',
    severity: 'critical',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Vaginal bleeding'],
    managementProtocol: 'Immediate assessment, IV access, cross-match blood, monitor vitals, prepare for possible transfusion',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.2'
    }
  },
  'Draining': {
    id: 'Draining',
    label: 'Draining',
    severity: 'urgent',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Draining'],
    managementProtocol: 'Confirm PROM/PPROM, assess for cord prolapse, start antibiotics if indicated, prepare for delivery',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.3'
    }
  },
  'Imminent delivery': {
    id: 'Imminent delivery',
    label: 'Imminent delivery',
    severity: 'critical',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Imminent delivery'],
    managementProtocol: 'Prepare for immediate delivery, ensure clean delivery kit, call skilled birth attendant',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.4'
    }
  },
  'Labour': {
    id: 'Labour',
    label: 'Labour',
    severity: 'urgent',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Labour'],
    managementProtocol: 'Assess gestational age, evaluate cervical changes, consider tocolytics if preterm, prepare for delivery',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.5'
    }
  },
  'Convulsing': {
    id: 'Convulsing',
    label: 'Convulsing',
    severity: 'critical',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Convulsing'],
    managementProtocol: 'Protect airway, administer magnesium sulfate, control BP, prepare for emergency delivery',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.6'
    }
  },
  'Severe headache': {
    id: 'Severe headache',
    label: 'Severe headache',
    severity: 'urgent',
    urgency: 'same_day',
    description: DANGER_SIGN_DESCRIPTIONS['Severe headache'],
    managementProtocol: 'Check BP, assess for pre-eclampsia signs, test urine for protein, consider antihypertensives',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.7'
    }
  },
  'Visual disturbance': {
    id: 'Visual disturbance',
    label: 'Visual disturbance',
    severity: 'urgent',
    urgency: 'same_day',
    description: DANGER_SIGN_DESCRIPTIONS['Visual disturbance'],
    managementProtocol: 'Urgent BP check, assess for pre-eclampsia/eclampsia, prepare for possible magnesium sulfate',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.7'
    }
  },
  'Unconscious': {
    id: 'Unconscious',
    label: 'Unconscious',
    severity: 'critical',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Unconscious'],
    managementProtocol: 'ABC assessment, check glucose, assess for eclampsia/shock, immediate resuscitation',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.8'
    }
  },
  'Fever': {
    id: 'Fever',
    label: 'Fever',
    severity: 'urgent',
    urgency: 'same_day',
    description: DANGER_SIGN_DESCRIPTIONS['Fever'],
    managementProtocol: 'Identify infection source, blood cultures, start antibiotics, monitor fetal wellbeing',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.9'
    }
  },
  'Looks very ill': {
    id: 'Looks very ill',
    label: 'Looks very ill',
    severity: 'urgent',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Looks very ill'],
    managementProtocol: 'Full assessment, vital signs, investigate for sepsis/shock, early intervention',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.10'
    }
  },
  'Severe vomiting': {
    id: 'Severe vomiting',
    label: 'Severe vomiting',
    severity: 'warning',
    urgency: 'same_day',
    description: DANGER_SIGN_DESCRIPTIONS['Severe vomiting'],
    managementProtocol: 'Assess hydration, check ketones, IV fluids, antiemetics, monitor electrolytes',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.11'
    }
  },
  'Severe abdominal pain': {
    id: 'Severe abdominal pain',
    label: 'Severe abdominal pain',
    severity: 'urgent',
    urgency: 'immediate',
    description: DANGER_SIGN_DESCRIPTIONS['Severe abdominal pain'],
    managementProtocol: 'Assess for abruption, HELLP, appendicitis, monitor fetal heart rate, prepare for intervention',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022',
      pageReference: 'Section 3.12'
    }
  },
  'Other': {
    id: 'Other',
    label: 'Other',
    severity: 'warning',
    urgency: 'same_day',
    description: DANGER_SIGN_DESCRIPTIONS['Other'],
    managementProtocol: 'Clinical assessment based on specific symptoms',
    guidelineReference: {
      source: 'Zambian ANC Guidelines',
      version: '2022'
    }
  }
});

// Helper functions
export const isDangerSign = (value: string): value is DangerSign => {
  return DANGER_SIGNS_LIST.includes(value as DangerSign);
};

export const getDangerSignSeverity = (sign: DangerSign): DangerSignSeverity => {
  return DANGER_SIGN_METADATA[sign].severity;
};

export const prioritizeDangerSigns = (signs: DangerSign[]): DangerSign[] => {
  const severityOrder: Record<DangerSignSeverity, number> = {
    critical: 0,
    urgent: 1,
    warning: 2
  };
  
  return [...signs].sort((a, b) => {
    const severityA = severityOrder[getDangerSignSeverity(a)];
    const severityB = severityOrder[getDangerSignSeverity(b)];
    return severityA - severityB;
  });
};

export const getCriticalDangerSigns = (signs: DangerSign[]): DangerSign[] => {
  return signs.filter(sign => getDangerSignSeverity(sign) === 'critical');
};

export const requiresImmediateAction = (signs: DangerSign[]): boolean => {
  return signs.some(sign => DANGER_SIGN_METADATA[sign].urgency === 'immediate');
};