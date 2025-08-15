/**
 * Dynamic Emergency Referral Checklist Mapping
 * Maps danger signs to prioritized checklist items based on clinical protocols
 */

export interface ChecklistItem {
  id: string;
  label: string;
  section: 'communication' | 'procedures' | 'medications' | 'vitals' | 'special' | 'final';
  required: boolean;
}

export interface PriorityMapping {
  clinicalFocus: string;
  priorities: {
    critical: string[];
    secondary: string[];
    standard: string[];
  };
}

export interface DangerSignMapping {
  [key: string]: PriorityMapping;
}

// Master checklist items organized by section
export const MASTER_CHECKLIST_ITEMS: { [section: string]: ChecklistItem[] } = {
  communication: [
    { id: 'facility_contacted', label: 'Receiving facility contacted', section: 'communication', required: true },
    { id: 'reason_communicated', label: 'Reason for referral communicated', section: 'communication', required: true },
    { id: 'patient_condition_discussed', label: 'Patient condition discussed with receiving team', section: 'communication', required: true }
  ],
  procedures: [
    { id: 'iv_access_secured', label: 'IV access secured', section: 'procedures', required: true },
    { id: 'urinary_catheter', label: 'Urinary catheter inserted', section: 'procedures', required: false },
    { id: 'blood_samples', label: 'Blood samples collected', section: 'procedures', required: false },
    { id: 'clotting_test', label: 'Bedside clotting test done', section: 'procedures', required: false },
    { id: 'urinalysis', label: 'Urinalysis done', section: 'procedures', required: false }
  ],
  medications: [
    { id: 'iv_fluids', label: 'IV fluids administered', section: 'medications', required: false },
    { id: 'appropriate_drugs', label: 'Appropriate drugs given', section: 'medications', required: false },
    { id: 'magnesium_sulfate', label: 'Magnesium sulfate administered (if indicated)', section: 'medications', required: false },
    { id: 'antibiotics', label: 'Antibiotics administered (if indicated)', section: 'medications', required: false }
  ],
  vitals: [
    { id: 'bp_monitored', label: 'Blood pressure monitored', section: 'vitals', required: true },
    { id: 'pulse_monitored', label: 'Pulse monitored', section: 'vitals', required: true },
    { id: 'temp_monitored', label: 'Temperature monitored', section: 'vitals', required: true },
    { id: 'rr_monitored', label: 'Respiratory rate monitored', section: 'vitals', required: true }
  ],
  special: [
    { id: 'blood_loss_estimated', label: 'Estimated blood loss documented', section: 'special', required: false },
    { id: 'anti_shock_garment', label: 'Anti-shock garment/UBT applied', section: 'special', required: false },
    { id: 'patient_positioned', label: 'Patient positioned appropriately', section: 'special', required: false },
    { id: 'oxygen_administered', label: 'Oxygen administered (if indicated)', section: 'special', required: false }
  ],
  final: [
    { id: 'family_discussion', label: 'Details discussed with patient/family', section: 'final', required: true },
    { id: 'referral_form', label: 'Referral form completed', section: 'final', required: true },
    { id: 'referral_register', label: 'Referral register updated', section: 'final', required: true },
    { id: 'handover_notes', label: 'Handover notes prepared', section: 'final', required: true }
  ]
};

// Danger sign categories and their clinical priorities
export const DANGER_SIGN_CHECKLIST_MAPPING: DangerSignMapping = {
  "Bleeding & Delivery": {
    clinicalFocus: "Volume replacement, shock management, and preparation for obstetric intervention",
    priorities: {
      critical: [
        'blood_loss_estimated',
        'anti_shock_garment',
        'iv_fluids',
        'appropriate_drugs',
        'bp_monitored',
        'pulse_monitored'
      ],
      secondary: [
        'iv_access_secured',
        'blood_samples',
        'clotting_test',
        'urinary_catheter',
        'patient_positioned'
      ],
      standard: [
        'facility_contacted',
        'reason_communicated',
        'patient_condition_discussed',
        'temp_monitored',
        'rr_monitored',
        'family_discussion',
        'referral_form',
        'referral_register',
        'handover_notes'
      ]
    }
  },
  
  "Neurological": {
    clinicalFocus: "Seizure control, airway protection (ABCs), and managing severe hypertension",
    priorities: {
      critical: [
        'patient_positioned',
        'oxygen_administered',
        'magnesium_sulfate',
        'iv_fluids',
        'bp_monitored',
        'rr_monitored'
      ],
      secondary: [
        'iv_access_secured',
        'urinary_catheter',
        'urinalysis',
        'appropriate_drugs',
        'pulse_monitored',
        'temp_monitored'
      ],
      standard: [
        'facility_contacted',
        'reason_communicated',
        'patient_condition_discussed',
        'family_discussion',
        'referral_form',
        'referral_register',
        'handover_notes'
      ]
    }
  },

  "Hypertensive": {
    clinicalFocus: "Assessment and prevention of eclampsia, blood pressure management",
    priorities: {
      critical: [
        'bp_monitored',
        'urinalysis',
        'iv_access_secured',
        'magnesium_sulfate'
      ],
      secondary: [
        'iv_fluids',
        'appropriate_drugs',
        'pulse_monitored',
        'temp_monitored',
        'rr_monitored',
        'patient_positioned'
      ],
      standard: [
        'facility_contacted',
        'reason_communicated',
        'patient_condition_discussed',
        'family_discussion',
        'referral_form',
        'referral_register',
        'handover_notes'
      ]
    }
  },

  "Systemic": {
    clinicalFocus: "Infection control, fluid resuscitation, and sepsis management",
    priorities: {
      critical: [
        'iv_fluids',
        'antibiotics',
        'temp_monitored',
        'bp_monitored',
        'pulse_monitored'
      ],
      secondary: [
        'iv_access_secured',
        'blood_samples',
        'urinalysis',
        'appropriate_drugs',
        'rr_monitored'
      ],
      standard: [
        'facility_contacted',
        'reason_communicated',
        'patient_condition_discussed',
        'family_discussion',
        'referral_form',
        'referral_register',
        'handover_notes'
      ]
    }
  }
};

// Map specific danger signs to categories
export const DANGER_SIGN_CATEGORIES: { [dangerSign: string]: keyof typeof DANGER_SIGN_CHECKLIST_MAPPING } = {
  'Vaginal bleeding': 'Bleeding & Delivery',
  'Draining': 'Bleeding & Delivery', 
  'Imminent delivery': 'Bleeding & Delivery',
  'Labour': 'Bleeding & Delivery',
  
  'Convulsing': 'Neurological',
  'Unconscious': 'Neurological',
  
  'Severe headache': 'Hypertensive',
  'Visual disturbance': 'Hypertensive',
  
  'Fever': 'Systemic',
  'Looks very ill': 'Systemic',
  'Severe vomiting': 'Systemic',
  'Severe abdominal pain': 'Systemic'
};

// Helper functions
export class EmergencyChecklistPrioritizer {
  
  static getPriorityMapping(dangerSigns: string[]): PriorityMapping | null {
    if (!dangerSigns || dangerSigns.length === 0) return null;
    
    // Get categories for all danger signs
    const categories = dangerSigns
      .map(sign => DANGER_SIGN_CATEGORIES[sign])
      .filter(Boolean);
    
    if (categories.length === 0) return null;
    
    // If multiple categories, prioritize based on clinical severity
    const categoryPriority = ['Neurological', 'Bleeding & Delivery', 'Hypertensive', 'Systemic'] as const;
    const primaryCategory = categories.reduce((prev, curr) => {
      const prevIndex = categoryPriority.indexOf(prev as any);
      const currIndex = categoryPriority.indexOf(curr as any);
      return currIndex < prevIndex ? curr : prev;
    });
    
    return DANGER_SIGN_CHECKLIST_MAPPING[primaryCategory];
  }
  
  static organizeChecklistItems(dangerSigns: string[]): {
    critical: ChecklistItem[];
    secondary: ChecklistItem[];
    standard: ChecklistItem[];
    clinicalFocus?: string;
  } {
    const mapping = this.getPriorityMapping(dangerSigns);
    
    if (!mapping) {
      // Return all items as standard if no mapping found
      const allItems = Object.values(MASTER_CHECKLIST_ITEMS).flat();
      return {
        critical: [],
        secondary: [],
        standard: allItems
      };
    }
    
    // Create lookup map for all items
    const itemsById: { [key: string]: ChecklistItem } = Object.values(MASTER_CHECKLIST_ITEMS)
      .flat()
      .reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
    
    return {
      critical: mapping.priorities.critical
        .map(id => itemsById[id])
        .filter(Boolean),
      secondary: mapping.priorities.secondary
        .map(id => itemsById[id])
        .filter(Boolean),
      standard: mapping.priorities.standard
        .map(id => itemsById[id])
        .filter(Boolean),
      clinicalFocus: mapping.clinicalFocus
    };
  }
  
  static getAllChecklistItems(): ChecklistItem[] {
    return Object.values(MASTER_CHECKLIST_ITEMS).flat();
  }
}