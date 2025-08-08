/**
 * Fetal Movement Assessment - Clinical Decision Support
 * 
 * Implements WHO guidelines for fetal movement assessment with Given-When-Then business rules
 * Based on clinical evidence and maternal-fetal medicine protocols
 */

export interface FetalMovementAssessment {
  movementStatus: string;
  gestationalAge: number;
  timeOfDay?: string;
  maternalPosition?: string;
  lastMovementTime?: string;
  movementCount?: number;
  maternalConcern?: boolean;
  additionalSymptoms?: string[];
}

export interface FetalMovementDecision {
  riskLevel: 'normal' | 'concern' | 'urgent' | 'emergency';
  alertTitle: string;
  alertMessage: string;
  recommendations: string[];
  safetyConsiderations: string[];
  referralRequired: boolean;
  urgentAction: boolean;
  followUpRequired: boolean;
}

/**
 * Fetal Movement Business Rules - Given-When-Then Format
 */
export const fetalMovementBusinessRules = {
  // Rule 1: Normal Movement Pattern
  normalMovement: {
    given: "Gestational age >= 20 weeks AND Normal fetal movement reported",
    when: "Mother reports regular, consistent fetal movements",
    then: "Continue routine monitoring, reassure mother, document normal findings"
  },
  
  // Rule 2: Reduced Movement Concern
  reducedMovement: {
    given: "Gestational age >= 28 weeks AND Reduced fetal movement reported",
    when: "Mother notices decreased movement pattern from normal",
    then: "Initiate kick counting protocol, schedule follow-up within 24 hours, provide safety counseling"
  },
  
  // Rule 3: No Movement Emergency
  noMovement: {
    given: "Gestational age >= 20 weeks AND No fetal movement for >2 hours",
    when: "Mother reports complete absence of fetal movement",
    then: "URGENT referral for immediate fetal assessment, arrange emergency transport, monitor maternal vital signs"
  },
  
  // Rule 4: Early Pregnancy Movement
  earlyMovement: {
    given: "Gestational age 16-20 weeks",
    when: "Mother asks about fetal movement",
    then: "Educate about expected movement patterns, reassure about normal variation, schedule routine follow-up"
  },
  
  // Rule 5: Kick Counting Protocol
  kickCounting: {
    given: "Gestational age >= 28 weeks AND Movement concern expressed",
    when: "Structured fetal movement counting is initiated",
    then: "Document 10 movements in 2 hours as normal, refer if <10 movements, provide clear instructions"
  }
};

export const assessFetalMovement = (assessment: FetalMovementAssessment): FetalMovementDecision => {
  const { movementStatus, gestationalAge, maternalConcern, additionalSymptoms = [] } = assessment;

  // Business Rule 1: No Movement Emergency
  if (movementStatus === 'No fetal movement' && gestationalAge >= 20) {
    return {
      riskLevel: 'emergency',
      alertTitle: 'EMERGENCY: No Fetal Movement Detected',
      alertMessage: 'Immediate fetal assessment required - potential fetal compromise',
      recommendations: [
        'IMMEDIATE referral for fetal heart rate monitoring',
        'Arrange emergency obstetric consultation',
        'Prepare for potential emergency delivery',
        'Monitor maternal vital signs closely',
        'Document time of last felt movement'
      ],
      safetyConsiderations: [
        'Time is critical - do not delay referral',
        'Ensure emergency transport is available',
        'Inform receiving facility of urgent referral',
        'Stay with patient until transfer complete'
      ],
      referralRequired: true,
      urgentAction: true,
      followUpRequired: true
    };
  }

  // Business Rule 2: Reduced Movement Concern
  if (movementStatus === 'Reduced or poor fetal movement' && gestationalAge >= 28) {
    return {
      riskLevel: 'urgent',
      alertTitle: 'Reduced Fetal Movement - Assessment Required',
      alertMessage: 'Decreased fetal activity may indicate fetal compromise',
      recommendations: [
        'Initiate kick counting protocol (10 movements in 2 hours)',
        'Position mother on left side for optimal blood flow',
        'Offer light snack or cold drink to stimulate movement',
        'Schedule fetal heart rate assessment within 24 hours',
        'Educate mother on when to seek immediate care'
      ],
      safetyConsiderations: [
        'If no movement felt after kick counting, refer immediately',
        'Provide clear instructions for home monitoring',
        'Ensure mother understands warning signs',
        'Schedule follow-up within 48 hours'
      ],
      referralRequired: false,
      urgentAction: false,
      followUpRequired: true
    };
  }

  // Business Rule 3: Reduced Movement in Late Pregnancy (>36 weeks)
  if (movementStatus === 'Reduced or poor fetal movement' && gestationalAge >= 36) {
    return {
      riskLevel: 'urgent',
      alertTitle: 'Late Pregnancy: Reduced Movement Concern',
      alertMessage: 'Reduced movement in late pregnancy requires immediate assessment',
      recommendations: [
        'URGENT referral for fetal heart rate monitoring',
        'Biophysical profile assessment if available',
        'Consider delivery planning if gestational age >37 weeks',
        'Monitor for signs of labor onset',
        'Continuous fetal monitoring recommended'
      ],
      safetyConsiderations: [
        'Late pregnancy movement changes require prompt evaluation',
        'Be prepared for potential delivery',
        'Monitor for additional danger signs',
        'Ensure obstetric care availability'
      ],
      referralRequired: true,
      urgentAction: false,
      followUpRequired: true
    };
  }

  // Business Rule 4: Early Pregnancy Movement Assessment
  if (gestationalAge < 20) {
    return {
      riskLevel: 'normal',
      alertTitle: 'Early Pregnancy - Movement Assessment',
      alertMessage: 'First movements typically felt between 16-25 weeks',
      recommendations: [
        'Educate about expected timing of first movements',
        'Reassure about normal variation in movement onset',
        'Schedule routine follow-up at 24-28 weeks',
        'Provide information about fetal development'
      ],
      safetyConsiderations: [
        'First-time mothers may not feel movement until 25 weeks',
        'Previous pregnancies may feel movement earlier',
        'No intervention required at this stage'
      ],
      referralRequired: false,
      urgentAction: false,
      followUpRequired: false
    };
  }

  // Business Rule 5: Normal Movement with Maternal Concern
  if (movementStatus === 'Normal fetal movement' && maternalConcern) {
    return {
      riskLevel: 'concern',
      alertTitle: 'Normal Movement with Maternal Concern',
      alertMessage: 'Provide reassurance and education about normal movement patterns',
      recommendations: [
        'Reassure mother about normal fetal activity',
        'Educate about daily movement patterns',
        'Teach kick counting technique for peace of mind',
        'Schedule routine follow-up appointment',
        'Provide written information about fetal movement'
      ],
      safetyConsiderations: [
        'Maternal anxiety about movement is common',
        'Provide clear guidance on when to seek care',
        'Document concerns and reassurance provided'
      ],
      referralRequired: false,
      urgentAction: false,
      followUpRequired: false
    };
  }

  // Business Rule 6: Additional Concerning Symptoms
  if (additionalSymptoms.length > 0) {
    const concerningSymptoms = ['bleeding', 'cramping', 'fluid_leakage', 'severe_pain'];
    const hasConcerningSymptoms = additionalSymptoms.some(symptom => 
      concerningSymptoms.includes(symptom)
    );

    if (hasConcerningSymptoms) {
      return {
        riskLevel: 'urgent',
        alertTitle: 'Fetal Movement Changes with Additional Symptoms',
        alertMessage: 'Movement changes combined with other symptoms require assessment',
        recommendations: [
          'URGENT obstetric evaluation required',
          'Assess for signs of preterm labor',
          'Monitor for placental abruption signs',
          'Continuous fetal monitoring recommended',
          'Prepare for potential emergency intervention'
        ],
        safetyConsiderations: [
          'Multiple symptoms increase risk level',
          'Do not delay evaluation',
          'Monitor maternal vital signs',
          'Ensure emergency care availability'
        ],
        referralRequired: true,
        urgentAction: true,
        followUpRequired: true
      };
    }
  }

  // Default: Normal Movement
  return {
    riskLevel: 'normal',
    alertTitle: 'Normal Fetal Movement',
    alertMessage: 'Fetal activity is within normal range for gestational age',
    recommendations: [
      'Continue routine monitoring',
      'Maintain healthy lifestyle',
      'Schedule regular antenatal appointments',
      'Contact healthcare provider with any concerns'
    ],
    safetyConsiderations: [
      'Normal movement patterns vary between pregnancies',
      'Encourage continued self-monitoring',
      'Provide education about danger signs'
    ],
    referralRequired: false,
    urgentAction: false,
    followUpRequired: false
  };
};

/**
 * Kick Counting Protocol Implementation
 */
export const kickCountingProtocol = {
  instructions: [
    "Choose a time when baby is usually active (often after meals)",
    "Lie on your left side in a quiet room",
    "Count distinct movements (kicks, rolls, jabs)",
    "Normal: 10 movements within 2 hours",
    "Contact healthcare provider if <10 movements in 2 hours"
  ],
  timing: "Start counting at the same time each day",
  documentation: "Record time started, time of 10th movement, total time taken",
  whenToSeekCare: [
    "No movements felt after 2 hours of counting",
    "Significant decrease from normal pattern",
    "Complete absence of movement for >6 hours",
    "Any concerns about baby's wellbeing"
  ]
};

/**
 * Fetal Movement Education Materials
 */
export const fetalMovementEducation = {
  normalPatterns: {
    "16-20 weeks": "First movements (quickening) - flutter-like sensations",
    "20-24 weeks": "More regular movements, becoming stronger",
    "24-28 weeks": "Established pattern, usually most active evening/night",
    "28-32 weeks": "Peak activity period, strong movements",
    "32-36 weeks": "Less space, movements feel different but should remain regular",
    "36+ weeks": "Less frequent but should still be regular and strong"
  },
  factors: [
    "Maternal activity level affects perception",
    "Baby's sleep-wake cycles influence movement",
    "Maternal position can affect movement sensation",
    "Time of day affects activity levels",
    "Maternal blood sugar levels can influence activity"
  ],
  warningSigns: [
    "Complete absence of movement for >12 hours after 28 weeks",
    "Significant decrease from established pattern",
    "No response to stimulation (food, drink, position change)",
    "Concerning change in movement quality or strength"
  ]
};