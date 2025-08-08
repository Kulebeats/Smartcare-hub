import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  lastAttempt: Date | null;
}

export function useGlobalLoadingState() {
  const queryClient = useQueryClient();
  const [globalState, setGlobalState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    lastAttempt: null
  });

  // Monitor query cache for global loading states
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'queryUpdated') {
        const query = event.query;
        
        // Check for performance dashboard or cache-related queries
        if (query.queryKey[0] === '/api/admin/performance/dashboard' || 
            query.queryKey[0] === '/api/admin/cache/stats') {
          
          if (query.state.status === 'pending') {
            setGlobalState(prev => ({ 
              ...prev, 
              isLoading: true, 
              error: null 
            }));
          } else if (query.state.status === 'error') {
            setGlobalState(prev => ({ 
              ...prev, 
              isLoading: false, 
              error: 'Performance data temporarily unavailable due to Redis connection issues',
              retryCount: prev.retryCount + 1,
              lastAttempt: new Date()
            }));
          } else if (query.state.status === 'success') {
            setGlobalState(prev => ({ 
              ...prev, 
              isLoading: false, 
              error: null 
            }));
          }
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const retry = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/admin/performance/dashboard'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['/api/admin/cache/stats'] 
    });
  };

  const clearError = () => {
    setGlobalState(prev => ({ ...prev, error: null }));
  };

  return {
    ...globalState,
    retry,
    clearError
  };
}

export function usePageLoading(pageKey: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate page loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pageKey]);

  return {
    isLoading,
    error,
    setError,
    setIsLoading
  };
}