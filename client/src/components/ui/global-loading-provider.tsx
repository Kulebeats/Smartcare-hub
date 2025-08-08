import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

interface GlobalLoadingState {
  isSystemLoading: boolean;
  redisConnectionError: boolean;
  performanceDataUnavailable: boolean;
  retryCount: number;
  lastRetry: Date | null;
}

interface GlobalLoadingContextType extends GlobalLoadingState {
  retryConnection: () => void;
  dismissError: () => void;
  setSystemLoading: (loading: boolean) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | null>(null);

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  }
  return context;
}

interface GlobalLoadingProviderProps {
  children: React.ReactNode;
}

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<GlobalLoadingState>({
    isSystemLoading: false,
    redisConnectionError: false,
    performanceDataUnavailable: false,
    retryCount: 0,
    lastRetry: null
  });

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'queryUpdated') {
        const query = event.query;
        
        // Monitor performance and cache-related queries
        if (query.queryKey[0] === '/api/admin/performance/dashboard' || 
            query.queryKey[0] === '/api/admin/cache/stats') {
          
          if (query.state.status === 'pending') {
            setState(prev => ({ 
              ...prev, 
              isSystemLoading: true,
              performanceDataUnavailable: false
            }));
          } else if (query.state.status === 'error') {
            const errorMessage = query.state.error?.message || '';
            const isRedisError = errorMessage.includes('Redis') || 
                                errorMessage.includes('ECONNREFUSED') ||
                                errorMessage.includes('connection');
            
            setState(prev => ({ 
              ...prev, 
              isSystemLoading: false,
              redisConnectionError: isRedisError,
              performanceDataUnavailable: true,
              retryCount: prev.retryCount + 1,
              lastRetry: new Date()
            }));
          } else if (query.state.status === 'success') {
            setState(prev => ({ 
              ...prev, 
              isSystemLoading: false,
              redisConnectionError: false,
              performanceDataUnavailable: false
            }));
          }
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const retryConnection = () => {
    setState(prev => ({ ...prev, isSystemLoading: true }));
    queryClient.invalidateQueries({ 
      queryKey: ['/api/admin/performance/dashboard'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['/api/admin/cache/stats'] 
    });
  };

  const dismissError = () => {
    setState(prev => ({ 
      ...prev, 
      redisConnectionError: false,
      performanceDataUnavailable: false
    }));
  };

  const setSystemLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isSystemLoading: loading }));
  };

  const contextValue: GlobalLoadingContextType = {
    ...state,
    retryConnection,
    dismissError,
    setSystemLoading
  };

  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
      {state.redisConnectionError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Performance data temporarily unavailable</p>
                  <p className="text-sm">Redis connection issues detected. System functionality remains normal.</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={retryConnection}
                    disabled={state.isSystemLoading}
                  >
                    {state.isSystemLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-2" />
                    )}
                    Retry
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={dismissError}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}