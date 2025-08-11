/**
 * React Query hooks for ANC encounter data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encounterApi, vitalSignsApi, dangerSignsApi } from '@/api/anc.api';
import { ANCEncounter, VitalSigns } from '@/types/anc';
import { useFeatureFlag } from '@/config/feature-flags';
import { DangerSign } from '@/constants/anc/danger-signs';
import { MockPatientService } from '@/services/anc/mock-patient.service';

/**
 * Fetch single encounter
 */
export const useEncounterData = (encounterId: string | null) => {
  const useReactQuery = useFeatureFlag('REACT_QUERY_DATA');
  
  return useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: async () => {
      if (!encounterId) return Promise.reject('No encounter ID');
      
      // Use mock data in development
      if (MockPatientService.isMockMode()) {
        return await MockPatientService.getEncounter(encounterId);
      }
      
      return await encounterApi.fetchEncounter(encounterId);
    },
    enabled: !!encounterId && useReactQuery,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000 // Refetch every 2 minutes
  });
};

/**
 * Fetch patient's encounters
 */
export const usePatientEncounters = (patientId: string | null) => {
  const useReactQuery = useFeatureFlag('REACT_QUERY_DATA');
  
  return useQuery({
    queryKey: ['encounters', patientId],
    queryFn: () => patientId ? encounterApi.fetchPatientEncounters(patientId) : Promise.reject('No patient ID'),
    enabled: !!patientId && useReactQuery,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Create new encounter
 */
export const useCreateEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (encounter: Omit<ANCEncounter, 'id'>) => 
      encounterApi.createEncounter(encounter),
    onSuccess: (data) => {
      // Add to cache
      queryClient.setQueryData(['encounter', data.id], data);
      // Invalidate patient encounters list
      queryClient.invalidateQueries({ queryKey: ['encounters', data.patientId] });
    }
  });
};

/**
 * Update encounter
 */
export const useUpdateEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ANCEncounter> }) => 
      encounterApi.updateEncounter(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['encounter', id] });
      
      // Get current data
      const previousEncounter = queryClient.getQueryData<ANCEncounter>(['encounter', id]);
      
      // Optimistically update
      if (previousEncounter) {
        queryClient.setQueryData(['encounter', id], {
          ...previousEncounter,
          ...updates
        });
      }
      
      return { previousEncounter };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEncounter) {
        queryClient.setQueryData(['encounter', variables.id], context.previousEncounter);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['encounter', variables.id] });
    }
  });
};

/**
 * Save vital signs
 */
export const useSaveVitalSigns = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (vitalSigns: Omit<VitalSigns, 'id'>) => 
      vitalSignsApi.saveVitalSigns(vitalSigns),
    onSuccess: (data) => {
      // Invalidate encounter to refresh with new vital signs
      queryClient.invalidateQueries({ queryKey: ['encounter', data.encounterId] });
    }
  });
};

/**
 * Save danger signs with optimistic update
 */
export const useSaveDangerSigns = (encounterId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (signs: DangerSign[]) => 
      dangerSignsApi.saveDangerSigns(encounterId, signs),
    onMutate: async (newSigns) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['encounter', encounterId] });
      
      // Get current encounter
      const previousEncounter = queryClient.getQueryData<ANCEncounter>(['encounter', encounterId]);
      
      // Optimistically update
      if (previousEncounter) {
        queryClient.setQueryData(['encounter', encounterId], {
          ...previousEncounter,
          dangerSigns: newSigns
        });
      }
      
      return { previousEncounter };
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousEncounter) {
        queryClient.setQueryData(['encounter', encounterId], context.previousEncounter);
      }
    },
    onSettled: () => {
      // Refetch
      queryClient.invalidateQueries({ queryKey: ['encounter', encounterId] });
    }
  });
};