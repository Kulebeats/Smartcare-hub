/**
 * ANC Reducer for Complex State Management
 * Manages danger signs, referrals, EDD, and assessment data
 */

import { DangerSign } from '@/constants/anc/danger-signs';
import { GestationalAge, EDDCalculation, VitalSigns, MaternalAssessment, FetalAssessment } from '@/types/anc';

// ============= State Types =============
export interface ANCState {
  // Patient context
  patientId: string | null;
  encounterId: string | null;
  
  // Danger signs
  dangerSigns: DangerSign[];
  dangerSignsConfirmed: boolean;
  
  // Referral
  referralReasons: string[];
  referralType: 'emergency' | 'routine' | 'specialist' | null;
  referralNotes: string;
  
  // EDD and GA
  edd: EDDCalculation | null;
  gestationalAge: GestationalAge | null;
  lmpDate: Date | null;
  
  // Assessments
  vitalSigns: Partial<VitalSigns>;
  maternalAssessment: Partial<MaternalAssessment>;
  fetalAssessment: Partial<FetalAssessment>;
  
  // UI State
  activeTab: string;
  unsavedChanges: boolean;
  validationErrors: Record<string, string>;
  
  // Sync state
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

// ============= Action Types =============
export type ANCAction =
  | { type: 'SET_PATIENT_CONTEXT'; payload: { patientId: string; encounterId?: string } }
  | { type: 'CLEAR_PATIENT_CONTEXT' }
  
  // Danger signs actions
  | { type: 'ADD_DANGER_SIGN'; payload: DangerSign }
  | { type: 'REMOVE_DANGER_SIGN'; payload: DangerSign }
  | { type: 'SET_DANGER_SIGNS'; payload: DangerSign[] }
  | { type: 'CONFIRM_DANGER_SIGNS' }
  | { type: 'CLEAR_DANGER_SIGNS' }
  
  // Referral actions
  | { type: 'ADD_REFERRAL_REASON'; payload: string }
  | { type: 'REMOVE_REFERRAL_REASON'; payload: string }
  | { type: 'SET_REFERRAL_TYPE'; payload: 'emergency' | 'routine' | 'specialist' }
  | { type: 'SET_REFERRAL_NOTES'; payload: string }
  | { type: 'CLEAR_REFERRAL' }
  
  // EDD actions
  | { type: 'SET_LMP_DATE'; payload: Date }
  | { type: 'SET_EDD'; payload: EDDCalculation }
  | { type: 'SET_GESTATIONAL_AGE'; payload: GestationalAge }
  | { type: 'CLEAR_EDD' }
  
  // Assessment actions
  | { type: 'UPDATE_VITAL_SIGNS'; payload: Partial<VitalSigns> }
  | { type: 'UPDATE_MATERNAL_ASSESSMENT'; payload: Partial<MaternalAssessment> }
  | { type: 'UPDATE_FETAL_ASSESSMENT'; payload: Partial<FetalAssessment> }
  | { type: 'CLEAR_ASSESSMENTS' }
  
  // UI actions
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  
  // Sync actions
  | { type: 'SYNC_FROM_SERVER'; payload: Partial<ANCState> }
  | { type: 'SET_SYNC_STATUS'; payload: 'idle' | 'syncing' | 'success' | 'error' }
  | { type: 'UPDATE_SYNC_TIME' }
  
  // Reset
  | { type: 'RESET_STATE' };

// ============= Initial State =============
export const initialANCState: ANCState = {
  patientId: null,
  encounterId: null,
  
  dangerSigns: [],
  dangerSignsConfirmed: false,
  
  referralReasons: [],
  referralType: null,
  referralNotes: '',
  
  edd: null,
  gestationalAge: null,
  lmpDate: null,
  
  vitalSigns: {},
  maternalAssessment: {},
  fetalAssessment: {},
  
  activeTab: 'rapidAssessment',
  unsavedChanges: false,
  validationErrors: {},
  
  lastSyncTime: null,
  syncStatus: 'idle'
};

// ============= Reducer =============
export const ancReducer = (state: ANCState, action: ANCAction): ANCState => {
  switch (action.type) {
    // Patient context
    case 'SET_PATIENT_CONTEXT':
      return {
        ...state,
        patientId: action.payload.patientId,
        encounterId: action.payload.encounterId || null
      };
    
    case 'CLEAR_PATIENT_CONTEXT':
      return {
        ...state,
        patientId: null,
        encounterId: null
      };
    
    // Danger signs
    case 'ADD_DANGER_SIGN':
      return {
        ...state,
        dangerSigns: [...new Set([...state.dangerSigns, action.payload])],
        unsavedChanges: true
      };
    
    case 'REMOVE_DANGER_SIGN':
      return {
        ...state,
        dangerSigns: state.dangerSigns.filter(sign => sign !== action.payload),
        unsavedChanges: true
      };
    
    case 'SET_DANGER_SIGNS':
      return {
        ...state,
        dangerSigns: action.payload,
        unsavedChanges: true
      };
    
    case 'CONFIRM_DANGER_SIGNS':
      return {
        ...state,
        dangerSignsConfirmed: true
      };
    
    case 'CLEAR_DANGER_SIGNS':
      return {
        ...state,
        dangerSigns: [],
        dangerSignsConfirmed: false
      };
    
    // Referral
    case 'ADD_REFERRAL_REASON':
      return {
        ...state,
        referralReasons: [...new Set([...state.referralReasons, action.payload])],
        unsavedChanges: true
      };
    
    case 'REMOVE_REFERRAL_REASON':
      return {
        ...state,
        referralReasons: state.referralReasons.filter(reason => reason !== action.payload),
        unsavedChanges: true
      };
    
    case 'SET_REFERRAL_TYPE':
      return {
        ...state,
        referralType: action.payload,
        unsavedChanges: true
      };
    
    case 'SET_REFERRAL_NOTES':
      return {
        ...state,
        referralNotes: action.payload,
        unsavedChanges: true
      };
    
    case 'CLEAR_REFERRAL':
      return {
        ...state,
        referralReasons: [],
        referralType: null,
        referralNotes: ''
      };
    
    // EDD
    case 'SET_LMP_DATE':
      return {
        ...state,
        lmpDate: action.payload,
        unsavedChanges: true
      };
    
    case 'SET_EDD':
      return {
        ...state,
        edd: action.payload,
        gestationalAge: action.payload.gestationalAge,
        unsavedChanges: true
      };
    
    case 'SET_GESTATIONAL_AGE':
      return {
        ...state,
        gestationalAge: action.payload,
        unsavedChanges: true
      };
    
    case 'CLEAR_EDD':
      return {
        ...state,
        edd: null,
        gestationalAge: null,
        lmpDate: null
      };
    
    // Assessments
    case 'UPDATE_VITAL_SIGNS':
      return {
        ...state,
        vitalSigns: { ...state.vitalSigns, ...action.payload },
        unsavedChanges: true
      };
    
    case 'UPDATE_MATERNAL_ASSESSMENT':
      return {
        ...state,
        maternalAssessment: { ...state.maternalAssessment, ...action.payload },
        unsavedChanges: true
      };
    
    case 'UPDATE_FETAL_ASSESSMENT':
      return {
        ...state,
        fetalAssessment: { ...state.fetalAssessment, ...action.payload },
        unsavedChanges: true
      };
    
    case 'CLEAR_ASSESSMENTS':
      return {
        ...state,
        vitalSigns: {},
        maternalAssessment: {},
        fetalAssessment: {}
      };
    
    // UI
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload
      };
    
    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        unsavedChanges: action.payload
      };
    
    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.payload.field]: action.payload.error
        }
      };
    
    case 'CLEAR_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: {}
      };
    
    // Sync
    case 'SYNC_FROM_SERVER':
      return {
        ...state,
        ...action.payload,
        unsavedChanges: false
      };
    
    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload
      };
    
    case 'UPDATE_SYNC_TIME':
      return {
        ...state,
        lastSyncTime: new Date()
      };
    
    // Reset
    case 'RESET_STATE':
      return initialANCState;
    
    default:
      return state;
  }
};

// ============= Selectors =============
export const selectors = {
  hasUnsavedChanges: (state: ANCState): boolean => state.unsavedChanges,
  
  hasDangerSigns: (state: ANCState): boolean => state.dangerSigns.length > 0,
  
  hasCriticalDangerSigns: (state: ANCState): boolean => {
    const criticalSigns: DangerSign[] = ['Vaginal bleeding', 'Convulsing', 'Unconscious', 'Imminent delivery'];
    return state.dangerSigns.some(sign => criticalSigns.includes(sign));
  },
  
  isReferralRequired: (state: ANCState): boolean => {
    return state.dangerSigns.length > 0 || state.referralReasons.length > 0;
  },
  
  isFormValid: (state: ANCState): boolean => {
    return Object.keys(state.validationErrors).length === 0;
  },
  
  getCurrentTrimester: (state: ANCState): 1 | 2 | 3 | null => {
    if (!state.gestationalAge) return null;
    const weeks = state.gestationalAge.weeks;
    if (weeks < 14) return 1;
    if (weeks < 28) return 2;
    return 3;
  }
};