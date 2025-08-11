/**
 * Clinical Query Client Configuration
 * Specialized React Query client for healthcare data
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create clinical-optimized query client
 */
export const createClinicalQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Clinical data needs freshness but avoid excessive refetching
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes cache
        
        // Don't retry on auth errors
        retry: (failureCount, error: any) => {
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          return failureCount < 2;
        },
        
        // Progressive retry delays
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus for critical data
        refetchOnWindowFocus: true,
        
        // Keep previous data during refetch
        refetchOnMount: true,
        
        // Network status tracking
        networkMode: 'online'
      },
      mutations: {
        // Log clinical data mutation failures
        onError: (error: any) => {
          console.error('Clinical data mutation failed:', {
            message: error?.message,
            status: error?.status,
            timestamp: new Date().toISOString()
          });
        },
        
        // Retry mutations once
        retry: 1,
        
        // Network-aware mutations
        networkMode: 'online'
      }
    }
  });
};

/**
 * Clinical data invalidation helper
 */
export const invalidateClinicalData = (
  queryClient: QueryClient,
  patientId: string
): void => {
  // Invalidate all patient-related queries
  queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
  queryClient.invalidateQueries({ queryKey: ['encounters', patientId] });
  queryClient.invalidateQueries({ queryKey: ['vital-signs', patientId] });
  queryClient.invalidateQueries({ queryKey: ['lab-results', patientId] });
};

/**
 * Prefetch essential patient data
 */
export const prefetchPatientBundle = async (
  queryClient: QueryClient,
  patientId: string
): Promise<void> => {
  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: ['patient', patientId],
      queryFn: () => fetch(`/api/patients/${patientId}`).then(res => res.json()),
      staleTime: 5 * 60 * 1000
    }),
    queryClient.prefetchQuery({
      queryKey: ['encounters', patientId],
      queryFn: () => fetch(`/api/anc/patients/${patientId}/encounters`).then(res => res.json()),
      staleTime: 2 * 60 * 1000
    })
  ];
  
  await Promise.all(prefetchPromises);
};

/**
 * Clear sensitive data from cache
 */
export const clearSensitiveData = (queryClient: QueryClient): void => {
  // Clear all patient data
  queryClient.removeQueries({ queryKey: ['patient'] });
  queryClient.removeQueries({ queryKey: ['encounters'] });
  queryClient.removeQueries({ queryKey: ['vital-signs'] });
  queryClient.removeQueries({ queryKey: ['lab-results'] });
  queryClient.removeQueries({ queryKey: ['medications'] });
  
  // Clear cache
  queryClient.clear();
};