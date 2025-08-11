/**
 * Referral Management Service
 * Handles the three-card referral system
 */

import { DangerSign } from '@/constants/anc/danger-signs';
import { ClinicalAlert } from './clinical-rules.service';

export interface ReferralData {
  id: string;
  patientId: string;
  encounterId: string;
  referralDate: Date;
  referralType: 'emergency' | 'routine' | 'specialist';
  
  // Card 1 - Source facility
  sourceCard: {
    facilityId: string;
    facilityName: string;
    providerId: string;
    providerName: string;
    referralReasons: string[];
    clinicalSummary: string;
    vitalSigns?: any;
    dangerSigns?: DangerSign[];
    treatmentGiven?: string[];
    timestamp: Date;
  };
  
  // Card 2 - Transport
  transportCard?: {
    mode: 'ambulance' | 'private' | 'public' | 'walking';
    departureTime?: Date;
    arrivalTime?: Date;
    accompaniedBy?: string;
    condition: 'stable' | 'unstable' | 'critical';
    treatmentDuringTransport?: string[];
    notes?: string;
  };
  
  // Card 3 - Receiving facility
  receivingCard?: {
    facilityId: string;
    facilityName: string;
    receivedBy?: string;
    receivedAt?: Date;
    initialAssessment?: string;
    admissionStatus?: 'admitted' | 'treated_discharged' | 'referred_further' | 'died';
    ward?: string;
    feedback?: string;
  };
  
  status: 'initiated' | 'in_transit' | 'received' | 'completed' | 'cancelled';
  urgency: 'immediate' | 'urgent' | 'scheduled';
  category: 'obstetric_emergency' | 'medical' | 'surgical' | 'diagnostic' | 'specialist_consultation';
}

export interface ReferralChecklistItem {
  id: string;
  category: string;
  item: string;
  required: boolean;
  completed?: boolean;
}

// Referral checklists based on type
const EMERGENCY_CHECKLIST: ReferralChecklistItem[] = [
  { id: 'vitals', category: 'Assessment', item: 'Vital signs recorded', required: true },
  { id: 'iv_access', category: 'Treatment', item: 'IV access established', required: true },
  { id: 'oxygen', category: 'Treatment', item: 'Oxygen if needed', required: false },
  { id: 'medications', category: 'Treatment', item: 'Emergency medications given', required: false },
  { id: 'blood_samples', category: 'Investigations', item: 'Blood samples taken', required: false },
  { id: 'catheter', category: 'Treatment', item: 'Urinary catheter if needed', required: false },
  { id: 'accompany', category: 'Transport', item: 'Healthcare worker to accompany', required: true },
  { id: 'notes', category: 'Documentation', item: 'Referral notes completed', required: true },
  { id: 'partograph', category: 'Documentation', item: 'Partograph if in labor', required: false },
  { id: 'contact', category: 'Communication', item: 'Receiving facility contacted', required: true }
];

const ROUTINE_CHECKLIST: ReferralChecklistItem[] = [
  { id: 'appointment', category: 'Scheduling', item: 'Appointment arranged', required: true },
  { id: 'records', category: 'Documentation', item: 'Medical records prepared', required: true },
  { id: 'labs', category: 'Investigations', item: 'Recent lab results included', required: false },
  { id: 'medications', category: 'Treatment', item: 'Current medications listed', required: true },
  { id: 'transport', category: 'Transport', item: 'Transport arrangements confirmed', required: false },
  { id: 'education', category: 'Patient', item: 'Patient educated about referral', required: true }
];

// Referral facility mapping (example for Zambian facilities)
export const REFERRAL_FACILITIES = {
  // Level 1 - Health posts
  health_post: {
    canRefer: true,
    canReceive: false,
    referTo: ['health_center', 'district_hospital'],
    services: ['basic_anc', 'health_education']
  },
  
  // Level 2 - Health centers
  health_center: {
    canRefer: true,
    canReceive: true,
    referTo: ['district_hospital', 'provincial_hospital'],
    services: ['anc', 'normal_delivery', 'basic_emergency']
  },
  
  // Level 3 - District hospitals
  district_hospital: {
    canRefer: true,
    canReceive: true,
    referTo: ['provincial_hospital', 'uth'],
    services: ['comprehensive_anc', 'cesarean', 'blood_transfusion', 'nicu_basic']
  },
  
  // Level 4 - Provincial hospitals
  provincial_hospital: {
    canRefer: true,
    canReceive: true,
    referTo: ['uth', 'specialized'],
    services: ['specialized_care', 'icu', 'nicu_advanced', 'complex_surgery']
  },
  
  // Level 5 - Teaching hospitals
  uth: {
    canRefer: false,
    canReceive: true,
    referTo: [],
    services: ['tertiary_care', 'all_specialties', 'teaching', 'research']
  }
};

/**
 * Create a new referral
 */
export const createReferral = (
  patientId: string,
  encounterId: string,
  reasons: string[],
  type: 'emergency' | 'routine' | 'specialist',
  dangerSigns?: DangerSign[],
  clinicalAlerts?: ClinicalAlert[]
): ReferralData => {
  const urgency = determineUrgency(type, dangerSigns, clinicalAlerts);
  const category = determineCategory(reasons, dangerSigns);
  
  return {
    id: `REF-${Date.now()}`,
    patientId,
    encounterId,
    referralDate: new Date(),
    referralType: type,
    sourceCard: {
      facilityId: '', // To be filled
      facilityName: '', // To be filled
      providerId: '', // To be filled
      providerName: '', // To be filled
      referralReasons: reasons,
      clinicalSummary: generateClinicalSummary(reasons, dangerSigns, clinicalAlerts),
      dangerSigns,
      timestamp: new Date()
    },
    status: 'initiated',
    urgency,
    category
  };
};

/**
 * Determine referral urgency
 */
const determineUrgency = (
  type: string,
  dangerSigns?: DangerSign[],
  alerts?: ClinicalAlert[]
): 'immediate' | 'urgent' | 'scheduled' => {
  // Critical danger signs require immediate referral
  const criticalSigns: DangerSign[] = [
    'Vaginal bleeding',
    'Convulsing',
    'Unconscious',
    'Imminent delivery'
  ];
  
  if (dangerSigns?.some(sign => criticalSigns.includes(sign))) {
    return 'immediate';
  }
  
  if (alerts?.some(alert => alert.rule.severity === 'critical')) {
    return 'immediate';
  }
  
  if (type === 'emergency') {
    return 'immediate';
  }
  
  if (type === 'routine') {
    return 'scheduled';
  }
  
  return 'urgent';
};

/**
 * Determine referral category
 */
const determineCategory = (
  reasons: string[],
  dangerSigns?: DangerSign[]
): ReferralData['category'] => {
  const obstetricKeywords = ['bleeding', 'labor', 'eclampsia', 'pregnancy', 'delivery', 'fetal'];
  const hasObstetric = reasons.some(reason => 
    obstetricKeywords.some(keyword => reason.toLowerCase().includes(keyword))
  );
  
  if (hasObstetric || dangerSigns?.length) {
    return 'obstetric_emergency';
  }
  
  if (reasons.some(r => r.toLowerCase().includes('specialist'))) {
    return 'specialist_consultation';
  }
  
  if (reasons.some(r => r.toLowerCase().includes('surgery'))) {
    return 'surgical';
  }
  
  if (reasons.some(r => r.toLowerCase().includes('test') || r.toLowerCase().includes('scan'))) {
    return 'diagnostic';
  }
  
  return 'medical';
};

/**
 * Generate clinical summary for referral
 */
const generateClinicalSummary = (
  reasons: string[],
  dangerSigns?: DangerSign[],
  alerts?: ClinicalAlert[]
): string => {
  const parts: string[] = [];
  
  // Add main reasons
  parts.push(`Referral for: ${reasons.join(', ')}`);
  
  // Add danger signs if present
  if (dangerSigns && dangerSigns.length > 0) {
    parts.push(`Danger signs: ${dangerSigns.join(', ')}`);
  }
  
  // Add critical alerts
  const criticalAlerts = alerts?.filter(a => a.rule.severity === 'critical');
  if (criticalAlerts && criticalAlerts.length > 0) {
    parts.push(`Critical alerts: ${criticalAlerts.map(a => a.rule.message).join('; ')}`);
  }
  
  return parts.join('\n');
};

/**
 * Get referral checklist based on type
 */
export const getReferralChecklist = (
  referralType: 'emergency' | 'routine' | 'specialist'
): ReferralChecklistItem[] => {
  if (referralType === 'emergency') {
    return EMERGENCY_CHECKLIST;
  }
  return ROUTINE_CHECKLIST;
};

/**
 * Validate referral readiness
 */
export const validateReferralReadiness = (
  checklist: ReferralChecklistItem[]
): { ready: boolean; missing: string[] } => {
  const requiredItems = checklist.filter(item => item.required);
  const missingItems = requiredItems
    .filter(item => !item.completed)
    .map(item => item.item);
  
  return {
    ready: missingItems.length === 0,
    missing: missingItems
  };
};

/**
 * Get appropriate referral facility
 */
export const getAppropriateReferralFacility = (
  currentFacilityType: string,
  requiredServices: string[]
): string[] => {
  const facility = REFERRAL_FACILITIES[currentFacilityType as keyof typeof REFERRAL_FACILITIES];
  if (!facility || !facility.canRefer) {
    return [];
  }
  
  // Find facilities that can provide required services
  const appropriateFacilities: string[] = [];
  
  for (const referralOption of facility.referTo) {
    const targetFacility = REFERRAL_FACILITIES[referralOption as keyof typeof REFERRAL_FACILITIES];
    if (targetFacility) {
      const hasRequiredServices = requiredServices.every(service => 
        targetFacility.services.includes(service)
      );
      if (hasRequiredServices) {
        appropriateFacilities.push(referralOption);
      }
    }
  }
  
  return appropriateFacilities;
};

/**
 * Generate referral letter
 */
export const generateReferralLetter = (referral: ReferralData): string => {
  const date = new Date(referral.referralDate).toLocaleDateString();
  const time = new Date(referral.referralDate).toLocaleTimeString();
  
  return `
REFERRAL LETTER

Date: ${date}
Time: ${time}
Referral ID: ${referral.id}

TO: ${referral.receivingCard?.facilityName || '[Receiving Facility]'}
FROM: ${referral.sourceCard.facilityName}

PATIENT ID: ${referral.patientId}
URGENCY: ${referral.urgency.toUpperCase()}
TYPE: ${referral.referralType.toUpperCase()}

REASON FOR REFERRAL:
${referral.sourceCard.referralReasons.map(r => `• ${r}`).join('\n')}

CLINICAL SUMMARY:
${referral.sourceCard.clinicalSummary}

${referral.sourceCard.dangerSigns?.length ? `
DANGER SIGNS PRESENT:
${referral.sourceCard.dangerSigns.map(s => `• ${s}`).join('\n')}
` : ''}

${referral.sourceCard.treatmentGiven?.length ? `
TREATMENT GIVEN:
${referral.sourceCard.treatmentGiven.map(t => `• ${t}`).join('\n')}
` : ''}

Referring Provider: ${referral.sourceCard.providerName}
Provider ID: ${referral.sourceCard.providerId}

Please provide feedback on this referral.
Thank you for your assistance in caring for this patient.
  `.trim();
};