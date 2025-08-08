# SmartCare PRO - Performance Optimization Comprehensive Documentation

## Overview

SmartCare PRO employs advanced performance optimization strategies designed for healthcare environments with resource constraints. The system implements multi-tier caching, memory-conscious database indexing, component memoization, and intelligent load management to ensure optimal performance across 3,600+ healthcare facilities.

**Performance Targets:**  
- Page Load Time: <2 seconds  
- API Response Time: <100ms for 95% of requests  
- Database Query Time: <50ms for complex queries  
- Memory Usage: <512MB baseline for Replit deployment  

## Frontend Performance Optimization

### Component Memoization Strategy
```typescript
// Optimized ANC Section Rendering
const ANCSection = React.memo<ANCSectionProps>(({ 
  data, 
  onSave, 
  isActive,
  sectionKey 
}) => {
  // Memoize expensive data transformations
  const memoizedData = useMemo(() => {
    return processANCData(data);
  }, [data.lastModified, data.id, data.version]);
  
  // Debounced save function to prevent excessive API calls
  const debouncedSave = useCallback(
    debounce((formData: ANCFormData) => {
      onSave(formData);
    }, 500), // 500ms debounce
    [onSave]
  );
  
  // Memoized validation to prevent recalculation
  const validationErrors = useMemo(() => {
    return validateANCSection(memoizedData);
  }, [memoizedData]);
  
  // Early return for inactive sections to prevent unnecessary renders
  if (!isActive) {
    return <div className="hidden" data-section={sectionKey} />;
  }
  
  return (
    <div className="anc-section" data-section={sectionKey}>
      <SectionContent 
        data={memoizedData} 
        onSave={debouncedSave}
        errors={validationErrors}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.data.lastModified === nextProps.data.lastModified &&
    prevProps.data.id === nextProps.data.id
  );
});

// Display name for debugging
ANCSection.displayName = 'ANCSection';
```

### React Query Optimization
```typescript
// Optimized data fetching with intelligent caching
const useOptimizedPatientData = (patientId: string) => {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => apiRequest.get(`/api/patients/${patientId}`),
    
    // Aggressive stale time for patient data (rarely changes)
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    
    // Prevent refetch on window focus for stable data
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    
    // Enable query only when patientId is available
    enabled: !!patientId,
    
    // Keep previous data while fetching new data
    keepPreviousData: true,
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 404 (patient not found)
      if (error?.status === 404) return false;
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Background refetch interval for critical data
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

// Prefetch related data
const usePrefetchRelatedData = (patientId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (patientId) {
      // Prefetch ANC records
      queryClient.prefetchQuery({
        queryKey: ['anc-records', patientId],
        queryFn: () => apiRequest.get(`/api/patients/${patientId}/anc/records`),
        staleTime: 5 * 60 * 1000
      });
      
      // Prefetch facility data
      queryClient.prefetchQuery({
        queryKey: ['facilities', 'current'],
        queryFn: () => apiRequest.get('/api/facilities/current'),
        staleTime: 15 * 60 * 1000
      });
    }
  }, [patientId, queryClient]);
};
```

### Lazy Loading and Code Splitting
```typescript
// Route-based code splitting
const ANCPage = lazy(() => 
  import('./pages/anc-page').then(module => ({
    default: module.ANCPage
  }))
);

const PrEPAssessment = lazy(() => 
  import('./components/prep/prep-assessment').then(module => ({
    default: module.PrEPAssessment
  }))
);

const PharmacyModule = lazy(() => 
  import('./pages/pharmacy-page').then(module => ({
    default: module.PharmacyPage
  }))
);

// Component-level lazy loading with suspense
const LazyComponentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  }>
    {children}
  </Suspense>
);

// Dynamic imports for heavy components
const useDynamicComponent = (componentName: string) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (componentName && !Component) {
      setLoading(true);
      
      const loadComponent = async () => {
        try {
          const module = await import(`./components/${componentName}`);
          setComponent(() => module.default);
        } catch (error) {
          console.error(`Failed to load component: ${componentName}`, error);
        } finally {
          setLoading(false);
        }
      };
      
      loadComponent();
    }
  }, [componentName, Component]);
  
  return { Component, loading };
};
```

### Responsive Design Optimization
```typescript
// Optimized responsive layout hook
const useResponsiveLayout = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Throttled resize handler to prevent excessive re-renders
  const handleResize = useCallback(
    throttle(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 250), // 250ms throttle
    []
  );
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  // Memoized breakpoint calculations
  const breakpoints = useMemo(() => ({
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    isLargeScreen: dimensions.width >= 1440,
    
    // Custom healthcare facility breakpoints
    isFacilityTablet: dimensions.width >= 768 && dimensions.width < 1200,
    isFacilityDesktop: dimensions.width >= 1200
  }), [dimensions.width]);
  
  return { dimensions, ...breakpoints };
};

// Optimized sidebar layout for ANC
const useOptimizedSidebarLayout = () => {
  const { isMobile, isTablet } = useResponsiveLayout();
  
  // Memoized layout configuration
  const layoutConfig = useMemo(() => ({
    showSidebar: !isMobile,
    sidebarWidth: isTablet ? 280 : 320,
    contentMargin: isMobile ? 0 : (isTablet ? 280 : 320),
    stackVertically: isMobile
  }), [isMobile, isTablet]);
  
  return layoutConfig;
};
```

## Backend Performance Optimization

### Smart Caching Architecture
```typescript
// Multi-tier cache manager with intelligent fallbacks
interface CacheConfig {
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  fallback: boolean;
  invalidationTags: string[];
}

class SmartCacheManager {
  private redisClient?: RedisClient;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private maxMemoryEntries = 1000; // Memory constraint for Replit
  
  constructor() {
    this.initializeRedis();
    this.setupMemoryEviction();
  }
  
  async get(key: string): Promise<any> {
    // Try Redis first (if available)
    if (this.redisClient) {
      try {
        const value = await this.redisClient.get(key);
        if (value) {
          console.log(`Cache HIT (Redis): ${key}`);
          return JSON.parse(value);
        }
      } catch (error) {
        console.warn('Redis cache miss, falling back to memory cache');
      }
    }
    
    // Fallback to memory cache
    const entry = this.memoryCache.get(key);
    if (entry && entry.expiry > Date.now()) {
      console.log(`Cache HIT (Memory): ${key}`);
      return entry.value;
    }
    
    console.log(`Cache MISS: ${key}`);
    return null;
  }
  
  async set(key: string, value: any, config: CacheConfig): Promise<void> {
    const serialized = JSON.stringify(value);
    const expiry = Date.now() + config.ttl * 1000;
    
    // Try Redis first
    if (this.redisClient) {
      try {
        await this.redisClient.setex(key, config.ttl, serialized);
        
        // Add invalidation tags
        for (const tag of config.invalidationTags) {
          await this.redisClient.sadd(`tag:${tag}`, key);
          await this.redisClient.expire(`tag:${tag}`, config.ttl);
        }
        
        console.log(`Cache SET (Redis): ${key}, TTL: ${config.ttl}s`);
      } catch (error) {
        console.warn('Redis cache write failed, using memory cache');
      }
    }
    
    // Always update memory cache as fallback
    this.memoryCache.set(key, { 
      value, 
      expiry, 
      priority: config.priority,
      tags: config.invalidationTags 
    });
    
    // Evict if memory cache is full
    this.evictIfNeeded();
    
    console.log(`Cache SET (Memory): ${key}, TTL: ${config.ttl}s`);
  }
  
  async invalidateByTags(tags: string[]): Promise<void> {
    console.log(`Cache INVALIDATE TAGS: ${tags.join(', ')}`);
    
    // Redis tag-based invalidation
    if (this.redisClient) {
      for (const tag of tags) {
        try {
          const keys = await this.redisClient.smembers(`tag:${tag}`);
          if (keys.length > 0) {
            await this.redisClient.del(...keys);
            await this.redisClient.del(`tag:${tag}`);
          }
        } catch (error) {
          console.warn(`Redis tag invalidation failed for ${tag}`);
        }
      }
    }
    
    // Memory cache tag-based invalidation
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key);
      }
    }
  }
  
  private evictIfNeeded(): void {
    if (this.memoryCache.size > this.maxMemoryEntries) {
      // LRU eviction with priority consideration
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => {
          // First sort by priority (low priority evicted first)
          const priorityOrder = { low: 0, medium: 1, high: 2 };
          const priorityDiff = priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by expiry (closest to expiry evicted first)
          return a[1].expiry - b[1].expiry;
        });
      
      // Remove bottom 20% of entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.memoryCache.delete(entries[i][0]);
      }
      
      console.log(`Memory cache evicted ${toRemove} entries`);
    }
  }
}

// Cache configuration for different data types
const cacheConfigs = {
  patientData: {
    ttl: 300, // 5 minutes
    priority: 'high' as const,
    fallback: true,
    invalidationTags: ['patients']
  },
  facilityData: {
    ttl: 900, // 15 minutes
    priority: 'medium' as const,
    fallback: true,
    invalidationTags: ['facilities']
  },
  ancRecords: {
    ttl: 180, // 3 minutes
    priority: 'high' as const,
    fallback: true,
    invalidationTags: ['anc', 'patients']
  },
  cdssRules: {
    ttl: 1800, // 30 minutes
    priority: 'medium' as const,
    fallback: true,
    invalidationTags: ['cdss']
  }
};
```

### Database Query Optimization
```typescript
// Memory-conscious database indexing for Replit constraints
const createOptimalIndexes = async () => {
  // Composite indexes for common query patterns
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_patients_facility_search 
    ON patients(facility_id, first_name, last_name) 
    INCLUDE (nrc, nupin, art_number)
    WHERE deleted_at IS NULL;
  `);
  
  // Partial indexes for active records (saves space)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_anc_records_recent 
    ON anc_records(patient_id, visit_date DESC) 
    WHERE visit_date >= CURRENT_DATE - INTERVAL '1 year';
  `);
  
  // JSONB indexes for clinical data (memory-conscious)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_anc_hiv_status 
    ON anc_records USING GIN ((laboratory_data->'hiv_testing'->>'result'))
    WHERE laboratory_data->'hiv_testing'->>'result' IS NOT NULL;
  `);
  
  // Function-based index for computed values
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_patients_age_computed
    ON patients((EXTRACT(YEAR FROM AGE(date_of_birth))))
    WHERE date_of_birth IS NOT NULL;
  `);
  
  console.log('Optimal database indexes created for Replit deployment');
};

// Optimized query patterns
const getPatientANCHistory = async (patientId: string, facilityId: string) => {
  // Use prepared statement for better performance
  const query = db
    .select({
      id: ancRecords.id,
      visitDate: ancRecords.visitDate,
      gestationalAge: ancRecords.gestationalAge,
      visitNumber: ancRecords.visitNumber,
      // Only select specific JSONB fields to reduce data transfer
      hivStatus: sql<string>`laboratory_data->'hiv_testing'->>'result'`,
      dangerSigns: sql<string[]>`rapid_assessment_data->'danger_signs'`,
      riskLevel: sql<string>`rapid_assessment_data->>'risk_level'`
    })
    .from(ancRecords)
    .where(
      and(
        eq(ancRecords.patientId, patientId),
        eq(ancRecords.facilityId, facilityId),
        // Only get recent records to limit result set
        gte(ancRecords.visitDate, sql`CURRENT_DATE - INTERVAL '2 years'`)
      )
    )
    .orderBy(desc(ancRecords.visitDate))
    .limit(20); // Reasonable limit for performance
  
  // Add query execution timing
  const startTime = performance.now();
  const result = await query;
  const executionTime = performance.now() - startTime;
  
  if (executionTime > 50) {
    console.warn(`Slow query detected: ${executionTime.toFixed(2)}ms`);
  }
  
  return result;
};

// Query result caching
const getCachedPatientData = async (patientId: string, facilityId: string) => {
  const cacheKey = `patient:${patientId}:${facilityId}`;
  
  return await cacheManager.get(cacheKey) || 
    await cacheManager.set(
      cacheKey,
      await getPatientData(patientId, facilityId),
      cacheConfigs.patientData
    );
};
```

### API Response Optimization
```typescript
// Response compression and optimization middleware
const optimizeApiResponse = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  // Enable response compression
  if (!res.get('Content-Encoding')) {
    res.set('Content-Encoding', 'gzip');
  }
  
  // Set cache headers for static-ish data
  if (req.path.includes('/facilities') || req.path.includes('/cdss-rules')) {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  }
  
  // Optimize JSON responses
  const originalJson = res.json;
  res.json = function(body: any) {
    // Remove null values to reduce payload size
    const optimizedBody = removeNullValues(body);
    
    // Add performance metrics to response headers
    const executionTime = performance.now() - startTime;
    res.set('X-Response-Time', `${executionTime.toFixed(2)}ms`);
    res.set('X-Cache-Status', res.get('X-Cache-Status') || 'MISS');
    
    // Log slow responses
    if (executionTime > 100) {
      console.warn(`Slow API response: ${req.method} ${req.path} - ${executionTime.toFixed(2)}ms`);
    }
    
    return originalJson.call(this, optimizedBody);
  };
  
  next();
};

// Utility function to remove null values from responses
const removeNullValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(removeNullValues);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj)
      .reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = removeNullValues(value);
        }
        return acc;
      }, {} as any);
  }
  
  return obj;
};

// Background job processing optimization
class OptimizedJobProcessor {
  private processingQueue: Map<string, Promise<any>> = new Map();
  
  async processJob(jobType: string, data: any): Promise<any> {
    const jobKey = `${jobType}:${JSON.stringify(data)}`;
    
    // Deduplicate identical jobs
    if (this.processingQueue.has(jobKey)) {
      return this.processingQueue.get(jobKey);
    }
    
    const jobPromise = this.executeJob(jobType, data);
    this.processingQueue.set(jobKey, jobPromise);
    
    // Clean up completed jobs
    jobPromise.finally(() => {
      this.processingQueue.delete(jobKey);
    });
    
    return jobPromise;
  }
  
  private async executeJob(jobType: string, data: any): Promise<any> {
    const startTime = performance.now();
    
    try {
      let result;
      
      switch (jobType) {
        case 'patient_analysis':
          result = await this.analyzePatientData(data);
          break;
        case 'clinical_rules':
          result = await this.evaluateClinicalRules(data);
          break;
        case 'alert_processing':
          result = await this.processAlerts(data);
          break;
        default:
          throw new Error(`Unknown job type: ${jobType}`);
      }
      
      const executionTime = performance.now() - startTime;
      console.log(`Job completed: ${jobType} in ${executionTime.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      console.error(`Job failed: ${jobType}`, error);
      throw error;
    }
  }
  
  private async analyzePatientData(data: any): Promise<any> {
    // Lightweight patient analysis for performance
    return {
      riskLevel: calculateRiskLevel(data),
      recommendations: generateBasicRecommendations(data),
      processingTime: Date.now()
    };
  }
  
  private async evaluateClinicalRules(data: any): Promise<any> {
    // Cached rule evaluation
    const cacheKey = `rules:${data.module}:${data.dataHash}`;
    
    return await cacheManager.get(cacheKey) || 
      await cacheManager.set(
        cacheKey,
        await this.performRuleEvaluation(data),
        cacheConfigs.cdssRules
      );
  }
  
  private async processAlerts(data: any): Promise<any> {
    // Batch alert processing for efficiency
    const alerts = await this.batchProcessAlerts(data.alerts);
    
    // Send notifications asynchronously
    setImmediate(() => {
      this.sendNotifications(alerts);
    });
    
    return { processed: alerts.length, timestamp: Date.now() };
  }
}
```

## Memory Management and Resource Optimization

### Memory-Conscious Component Design
```typescript
// Optimized large dataset handling
const usePaginatedData = <T>(
  dataFetcher: (page: number, limit: number) => Promise<T[]>,
  initialLimit: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Virtual scrolling for large datasets
  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newData = await dataFetcher(page, limit);
      
      if (newData.length < limit) {
        setHasMore(false);
      }
      
      // Limit total items in memory (important for Replit)
      setData(prevData => {
        const combined = [...prevData, ...newData];
        // Keep only the last 1000 items to prevent memory issues
        return combined.slice(-1000);
      });
      
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setLoading(false);
    }
  }, [dataFetcher, page, limit, loading, hasMore]);
  
  return { data, loadMoreData, loading, hasMore };
};

// Memory-efficient form handling
const useOptimizedForm = <T extends Record<string, any>>(
  initialData: T,
  schema: z.ZodSchema<T>
) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: 'onChange' // Only validate on change, not on every keystroke
  });
  
  // Debounced validation to prevent excessive computation
  const debouncedValidation = useMemo(
    () => debounce((data: T) => {
      try {
        schema.parse(data);
      } catch (error) {
        // Handle validation errors efficiently
        if (error instanceof z.ZodError) {
          // Only process relevant errors
          error.errors.forEach(err => {
            if (err.path.length > 0) {
              form.setError(err.path[0] as keyof T, {
                type: 'validation',
                message: err.message
              });
            }
          });
        }
      }
    }, 300),
    [schema, form]
  );
  
  // Watch form changes efficiently
  const watchedValues = form.watch();
  useEffect(() => {
    debouncedValidation(watchedValues);
  }, [watchedValues, debouncedValidation]);
  
  return form;
};
```

### Resource Monitoring and Cleanup
```typescript
// Memory usage monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements to prevent memory bloat
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        report[name] = {
          average: this.getAverageMetric(name),
          latest: values[values.length - 1],
          count: values.length,
          max: Math.max(...values),
          min: Math.min(...values)
        };
      }
    }
    
    // Add system metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        report.pageLoad = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
        };
      }
    }
    
    return report;
  }
  
  // Memory cleanup utility
  cleanup(): void {
    console.log('Performance monitor cleanup initiated');
    
    // Clear old metrics
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 50) {
        this.metrics.set(name, values.slice(-50));
      }
    }
    
    // Force garbage collection if available (Node.js)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }
}

// React hook for performance monitoring
const usePerformanceMonitoring = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      monitor.recordMetric(`component_render_${componentName}`, renderTime);
    };
  }, [componentName, monitor]);
  
  // Component memory usage tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        monitor.recordMetric('memory_used', memory.usedJSHeapSize);
        monitor.recordMetric('memory_total', memory.totalJSHeapSize);
        monitor.recordMetric('memory_limit', memory.jsHeapSizeLimit);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [monitor]);
};
```

### Production Performance Configuration
```typescript
// Production optimization configuration
const productionConfig = {
  // React optimization
  reactOptimization: {
    strictMode: true,
    profilerEnabled: false, // Disable in production
    devToolsDisabled: true
  },
  
  // Bundle optimization
  bundleOptimization: {
    treeshaking: true,
    minification: true,
    codesplitting: true,
    imageOptimization: true
  },
  
  // API optimization
  apiOptimization: {
    responseCompression: true,
    cacheHeaders: true,
    rateLimiting: true,
    requestSizeLimit: '10mb'
  },
  
  // Database optimization
  databaseOptimization: {
    connectionPoolSize: 20,
    queryTimeout: 30000, // 30 seconds
    preparedStatements: true,
    indexOptimization: true
  },
  
  // Memory management
  memoryManagement: {
    maxCacheSize: '256MB',
    garbageCollectionInterval: 300000, // 5 minutes
    memoryThreshold: 0.85 // 85% of available memory
  }
};

// Performance monitoring dashboard data
const getPerformanceDashboardData = async (): Promise<any> => {
  const monitor = PerformanceMonitor.getInstance();
  const report = monitor.getPerformanceReport();
  
  return {
    timestamp: new Date().toISOString(),
    
    // Frontend metrics
    frontend: {
      averagePageLoad: report.pageLoad?.loadComplete || 0,
      averageRenderTime: report.component_render_average || 0,
      memoryUsage: report.memory_used?.latest || 0,
      cacheHitRate: calculateCacheHitRate()
    },
    
    // Backend metrics
    backend: {
      averageResponseTime: report.api_response_time?.average || 0,
      databaseQueryTime: report.db_query_time?.average || 0,
      cacheEfficiency: getCacheEfficiency(),
      activeConnections: getActiveConnections()
    },
    
    // System health
    health: {
      status: getSystemHealthStatus(),
      alerts: getActivePerformanceAlerts(),
      recommendations: generatePerformanceRecommendations(report)
    }
  };
};
```

This comprehensive performance documentation ensures SmartCare PRO operates efficiently within resource constraints while maintaining optimal user experience and system responsiveness across all healthcare facility deployments.