/**
 * React Query hooks for ANC patient data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/api/anc.api';
import { PatientData } from '@/types/anc';
import { useFeatureFlag } from '@/config/feature-flags';

/**
 * Fetch patient data
 */
export const usePatientData = (patientId: string | null) => {
  const useReactQuery = useFeatureFlag('REACT_QUERY_DATA');
  
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientId ? patientApi.fetchPatient(patientId) : Promise.reject('No patient ID'),
    enabled: !!patientId && useReactQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (error?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

/**
 * Update patient data
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PatientData> }) => 
      patientApi.updatePatient(id, updates),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(['patient', variables.id], data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['encounters', variables.id] });
    },
    onError: (error) => {
      console.error('Failed to update patient:', error);
    }
  });
};

/**
 * Search patients
 */
export const useSearchPatients = (searchQuery: string, enabled = true) => {
  const useReactQuery = useFeatureFlag('REACT_QUERY_DATA');
  
  return useQuery({
    queryKey: ['patients', 'search', searchQuery],
    queryFn: () => patientApi.searchPatients(searchQuery),
    enabled: enabled && searchQuery.length >= 3 && useReactQuery,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Prefetch patient data
 */
export const usePrefetchPatient = () => {
  const queryClient = useQueryClient();
  const useReactQuery = useFeatureFlag('REACT_QUERY_DATA');
  
  return async (patientId: string) => {
    if (!useReactQuery) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['patient', patientId],
      queryFn: () => patientApi.fetchPatient(patientId),
      staleTime: 5 * 60 * 1000
    });
  };
};