/**
 * useAncEncounter Hook
 * Combines ANC reducer with React Query for comprehensive state management
 */

import { useReducer, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ancReducer, initialANCState, ANCState, ANCAction, selectors } from '@/stores/anc/anc-reducer';
import { useEncounterData, useUpdateEncounter, useSaveDangerSigns } from './useEncounterData';
import { usePatientData } from './usePatientData';
import { useFeatureFlag } from '@/config/feature-flags';
import { DangerSign } from '@/constants/anc/danger-signs';
import { assessDangerSigns } from '@/services/anc/danger-signs.service';
import { safeLog } from '@/utils/anc/safe-logger';

interface UseAncEncounterOptions {
  patientId: string | null;
  encounterId?: string | null;
  autoSync?: boolean;
}

export const useAncEncounter = ({
  patientId,
  encounterId,
  autoSync = true
}: UseAncEncounterOptions) => {
  const queryClient = useQueryClient();
  const useNewFlow = useFeatureFlag('NEW_DANGER_SIGNS_FLOW');
  
  // State management
  const [state, dispatch] = useReducer(ancReducer, {
    ...initialANCState,
    patientId,
    encounterId: encounterId || null
  });
  
  // React Query hooks
  const { data: patient, isLoading: patientLoading } = usePatientData(patientId);
  const { data: encounter, isLoading: encounterLoading } = useEncounterData(encounterId || null);
  const updateEncounterMutation = useUpdateEncounter();
  const saveDangerSignsMutation = useSaveDangerSigns(encounterId || '');
  
  // Sync from server when encounter data changes
  useEffect(() => {
    if (encounter && autoSync) {
      dispatch({
        type: 'SYNC_FROM_SERVER',
        payload: {
          dangerSigns: encounter.dangerSigns || [],
          vitalSigns: encounter.vitalSigns || {},
          maternalAssessment: encounter.maternalAssessment || {},
          fetalAssessment: encounter.fetalAssessment || {},
          edd: encounter.edd || null,
          gestationalAge: encounter.gestationalAge || null
        }
      });
      dispatch({ type: 'UPDATE_SYNC_TIME' });
    }
  }, [encounter, autoSync]);
  
  // ============= Danger Signs Management =============
  
  const toggleDangerSign = useCallback((sign: DangerSign) => {
    const isPresent = state.dangerSigns.includes(sign);
    dispatch({
      type: isPresent ? 'REMOVE_DANGER_SIGN' : 'ADD_DANGER_SIGN',
      payload: sign
    });
    
    safeLog.clinical('Danger sign toggled', {
      sign,
      action: isPresent ? 'removed' : 'added',
      patientId
    });
  }, [state.dangerSigns, patientId]);
  
  const confirmDangerSigns = useCallback(async () => {
    dispatch({ type: 'CONFIRM_DANGER_SIGNS' });
    
    // Assess danger signs for recommendations
    const assessment = assessDangerSigns(state.dangerSigns);
    
    // Auto-populate referral reasons if critical signs present
    if (assessment.requiresImmediateReferral) {
      assessment.referralReasons.forEach(reason => {
        dispatch({ type: 'ADD_REFERRAL_REASON', payload: reason });
      });
      dispatch({ type: 'SET_REFERRAL_TYPE', payload: 'emergency' });
    }
    
    // Save to server if using new flow
    if (useNewFlow && encounterId) {
      try {
        await saveDangerSignsMutation.mutateAsync(state.dangerSigns);
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });
      } catch (error) {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
        safeLog.error('Failed to save danger signs', error);
      }
    }
    
    return assessment;
  }, [state.dangerSigns, useNewFlow, encounterId, saveDangerSignsMutation]);
  
  // ============= Referral Management =============
  
  const updateReferral = useCallback((
    type: 'add' | 'remove',
    reason: string
  ) => {
    dispatch({
      type: type === 'add' ? 'ADD_REFERRAL_REASON' : 'REMOVE_REFERRAL_REASON',
      payload: reason
    });
  }, []);
  
  const setReferralType = useCallback((
    type: 'emergency' | 'routine' | 'specialist'
  ) => {
    dispatch({ type: 'SET_REFERRAL_TYPE', payload: type });
  }, []);
  
  // ============= Save Encounter =============
  
  const saveEncounter = useCallback(async () => {
    if (!encounterId) {
      safeLog.warn('Cannot save: no encounter ID');
      return { success: false, error: 'No encounter ID' };
    }
    
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
    
    try {
      const updates = {
        dangerSigns: state.dangerSigns,
        vitalSigns: state.vitalSigns,
        maternalAssessment: state.maternalAssessment,
        fetalAssessment: state.fetalAssessment,
        edd: state.edd,
        gestationalAge: state.gestationalAge,
        referral: state.referralReasons.length > 0 ? {
          reasons: state.referralReasons,
          type: state.referralType,
          notes: state.referralNotes
        } : undefined
      };
      
      await updateEncounterMutation.mutateAsync({
        id: encounterId,
        updates
      });
      
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
      dispatch({ type: 'UPDATE_SYNC_TIME' });
      
      safeLog.clinical('Encounter saved', {
        encounterId,
        patientId,
        hasChanges: state.unsavedChanges
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      safeLog.error('Failed to save encounter', error);
      return { success: false, error };
    }
  }, [encounterId, state, updateEncounterMutation, patientId]);
  
  // ============= Navigation =============
  
  const canNavigate = useCallback((targetTab: string): boolean => {
    // Check if current tab has required fields
    if (state.activeTab === 'rapidAssessment' && targetTab !== 'rapidAssessment') {
      if (state.dangerSigns.length > 0 && !state.dangerSignsConfirmed) {
        return false; // Must confirm danger signs before proceeding
      }
    }
    
    return true;
  }, [state.activeTab, state.dangerSigns, state.dangerSignsConfirmed]);
  
  const navigateToTab = useCallback((tab: string) => {
    if (canNavigate(tab)) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
      return true;
    }
    return false;
  }, [canNavigate]);
  
  // ============= Computed Values =============
  
  const computedValues = {
    hasUnsavedChanges: selectors.hasUnsavedChanges(state),
    hasDangerSigns: selectors.hasDangerSigns(state),
    hasCriticalDangerSigns: selectors.hasCriticalDangerSigns(state),
    isReferralRequired: selectors.isReferralRequired(state),
    isFormValid: selectors.isFormValid(state),
    currentTrimester: selectors.getCurrentTrimester(state),
    isLoading: patientLoading || encounterLoading,
    isSaving: updateEncounterMutation.isPending || saveDangerSignsMutation.isPending
  };
  
  return {
    // State
    state,
    dispatch,
    
    // Data
    patient,
    encounter,
    
    // Danger signs actions
    toggleDangerSign,
    confirmDangerSigns,
    
    // Referral actions
    updateReferral,
    setReferralType,
    
    // Save action
    saveEncounter,
    
    // Navigation
    navigateToTab,
    canNavigate,
    
    // Computed values
    ...computedValues
  };
};