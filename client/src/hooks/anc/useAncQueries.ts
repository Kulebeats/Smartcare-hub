/**
 * Optimized React Query hooks for ANC module
 * Implements caching, prefetching, and lazy loading
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AncEncounter, VitalSigns, MaternalAssessment, FetalAssessment } from '@/types/anc';

// Query keys
export const ancQueryKeys = {
  all: ['anc'] as const,
  encounters: (patientId: string) => ['anc', 'encounters', patientId] as const,
  encounter: (encounterId: string) => ['anc', 'encounter', encounterId] as const,
  vitalSigns: (encounterId: string) => ['anc', 'vitals', encounterId] as const,
  labResults: (encounterId: string) => ['anc', 'labs', encounterId] as const,
  clinicalAlerts: (patientId: string) => ['anc', 'alerts', patientId] as const,
  referrals: (patientId: string) => ['anc', 'referrals', patientId] as const,
  statistics: (facilityId: string) => ['anc', 'stats', facilityId] as const
};

// Cache configurations
const CACHE_TIMES = {
  encounters: 5 * 60 * 1000, // 5 minutes
  vitalSigns: 2 * 60 * 1000, // 2 minutes for real-time data
  labResults: 10 * 60 * 1000, // 10 minutes
  statistics: 15 * 60 * 1000, // 15 minutes
};

/**
 * Hook to fetch ANC encounters for a patient
 */
export const useAncEncounters = (patientId: string, options?: any) => {
  return useQuery({
    queryKey: ancQueryKeys.encounters(patientId),
    queryFn: () => apiRequest(`/api/anc/encounters/${patientId}`),
    staleTime: CACHE_TIMES.encounters,
    cacheTime: CACHE_TIMES.encounters * 2,
    enabled: !!patientId,
    ...options
  });
};

/**
 * Hook to fetch a specific ANC encounter
 */
export const useAncEncounter = (encounterId: string, options?: any) => {
  return useQuery({
    queryKey: ancQueryKeys.encounter(encounterId),
    queryFn: () => apiRequest(`/api/anc/encounter/${encounterId}`),
    staleTime: CACHE_TIMES.encounters,
    enabled: !!encounterId,
    ...options
  });
};

/**
 * Hook to fetch vital signs with real-time updates
 */
export const useVitalSigns = (encounterId: string, options?: any) => {
  return useQuery({
    queryKey: ancQueryKeys.vitalSigns(encounterId),
    queryFn: () => apiRequest(`/api/anc/vitals/${encounterId}`),
    staleTime: CACHE_TIMES.vitalSigns,
    refetchInterval: CACHE_TIMES.vitalSigns, // Auto-refresh for monitoring
    enabled: !!encounterId,
    ...options
  });
};

/**
 * Hook to fetch lab results
 */
export const useLabResults = (encounterId: string, options?: any) => {
  return useQuery({
    queryKey: ancQueryKeys.labResults(encounterId),
    queryFn: () => apiRequest(`/api/anc/labs/${encounterId}`),
    staleTime: CACHE_TIMES.labResults,
    enabled: !!encounterId,
    ...options
  });
};

/**
 * Hook to fetch clinical alerts
 */
export const useClinicalAlerts = (patientId: string, options?: any) => {
  return useQuery({
    queryKey: ancQueryKeys.clinicalAlerts(patientId),
    queryFn: () => apiRequest(`/api/anc/alerts/${patientId}`),
    staleTime: 60 * 1000, // 1 minute for critical alerts
    refetchInterval: 60 * 1000, // Check every minute
    enabled: !!patientId,
    ...options
  });
};

/**
 * Hook to save ANC encounter data
 */
export const useSaveAncEncounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { encounterId?: string; patientId: string; encounter: Partial<AncEncounter> }) => {
      const url = data.encounterId 
        ? `/api/anc/encounter/${data.encounterId}`
        : '/api/anc/encounter';
      const method = data.encounterId ? 'PATCH' : 'POST';
      
      return apiRequest(url, {
        method,
        body: JSON.stringify(data.encounter)
      });
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ancQueryKeys.encounters(variables.patientId) 
      });
      if (variables.encounterId) {
        queryClient.invalidateQueries({ 
          queryKey: ancQueryKeys.encounter(variables.encounterId) 
        });
      }
      // Update alerts immediately
      queryClient.invalidateQueries({ 
        queryKey: ancQueryKeys.clinicalAlerts(variables.patientId) 
      });
    }
  });
};

/**
 * Hook to save vital signs
 */
export const useSaveVitalSigns = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { encounterId: string; vitalSigns: Partial<VitalSigns> }) => {
      return apiRequest(`/api/anc/vitals/${data.encounterId}`, {
        method: 'POST',
        body: JSON.stringify(data.vitalSigns)
      });
    },
    onSuccess: (result, variables) => {
      // Invalidate vital signs cache
      queryClient.invalidateQueries({ 
        queryKey: ancQueryKeys.vitalSigns(variables.encounterId) 
      });
      // Also update encounter data
      queryClient.invalidateQueries({ 
        queryKey: ancQueryKeys.encounter(variables.encounterId) 
      });
    }
  });
};

/**
 * Hook to save lab results
 */
export const useSaveLabResults = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { encounterId: string; labResults: any }) => {
      return apiRequest(`/api/anc/labs/${data.encounterId}`, {
        method: 'POST',
        body: JSON.stringify(data.labResults)
      });
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ancQueryKeys.labResults(variables.encounterId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ancQueryKeys.encounter(variables.encounterId) 
      });
    }
  });
};

/**
 * Hook to create a referral
 */
export const useCreateReferral = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { patientId: string; referral: any }) => {
      return apiRequest('/api/anc/referral', {
        method: 'POST',
        body: JSON.stringify(data.referral)
      });
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ancQueryKeys.referrals(variables.patientId) 
      });
    }
  });
};

/**
 * Hook to prefetch encounter data
 */
export const usePrefetchEncounter = () => {
  const queryClient = useQueryClient();
  
  return (encounterId: string) => {
    queryClient.prefetchQuery({
      queryKey: ancQueryKeys.encounter(encounterId),
      queryFn: () => apiRequest(`/api/anc/encounter/${encounterId}`),
      staleTime: CACHE_TIMES.encounters
    });
  };
};

/**
 * Hook to get ANC statistics
 */
export const useAncStatistics = (facilityId: string, dateRange?: { start: Date; end: Date }) => {
  const params = dateRange 
    ? `?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
    : '';
  
  return useQuery({
    queryKey: [...ancQueryKeys.statistics(facilityId), dateRange],
    queryFn: () => apiRequest(`/api/anc/statistics/${facilityId}${params}`),
    staleTime: CACHE_TIMES.statistics,
    enabled: !!facilityId
  });
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();
  
  return {
    updateVitalSigns: (encounterId: string, vitalSigns: Partial<VitalSigns>) => {
      queryClient.setQueryData(
        ancQueryKeys.vitalSigns(encounterId),
        (old: any) => ({ ...old, ...vitalSigns })
      );
    },
    
    updateEncounter: (encounterId: string, updates: Partial<AncEncounter>) => {
      queryClient.setQueryData(
        ancQueryKeys.encounter(encounterId),
        (old: any) => ({ ...old, ...updates })
      );
    },
    
    rollback: (queryKey: readonly unknown[]) => {
      queryClient.invalidateQueries({ queryKey });
    }
  };
};