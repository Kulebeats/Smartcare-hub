# React Performance Optimization Patterns for SmartCare PRO

## Overview
This document consolidates all performance optimization patterns, best practices, and solutions implemented in SmartCare PRO Version 1.8.3, particularly focusing on the ANC Assessment components, dynamic alert modal system, and PrEP risk assessment performance optimizations.

## Critical Performance Issues Resolved

### 1. Infinite Re-render Loop Resolution
**Problem:** "Maximum update depth exceeded" error in StandardANCAssessment
**Root Cause:** Unstable useEffect dependencies and object recreation on each render
**Solution:** Comprehensive memoization strategy

#### Before (Problematic Code)
```typescript
// ❌ BAD: Object recreated on each render
const ancRecords = {
  records: [/* data */]
};

// ❌ BAD: useEffect with unstable dependencies
useEffect(() => {
  if (ancRecords?.records) {
    setPreviousRecommendations(calculateRecommendations(ancRecords.records));
  }
}, [ancRecords]); // ancRecords changes every render
```

#### After (Optimized Code)
```typescript
// ✅ GOOD: Memoized static data
const ancRecords = useMemo(() => ({
  records: [/* data */]
}), []);

// ✅ GOOD: Memoized calculation function
const calculateRecommendations = useCallback((records: any[]) => {
  // calculation logic
}, []);

// ✅ GOOD: Optimized useEffect with state comparison
useEffect(() => {
  if (!ancRecords?.records?.length) return;
  
  const newRecommendations = calculateRecommendations(ancRecords.records);
  
  setPreviousRecommendations(prev => {
    // Only update if actually different
    if (JSON.stringify(prev) === JSON.stringify(newRecommendations)) {
      return prev;
    }
    return newRecommendations;
  });
}, [ancRecords, calculateRecommendations]);
```

## React Memoization Patterns

### 1. useMemo for Expensive Calculations
```typescript
// Memoize computed values
const visitNumber = useMemo(() => {
  return propVisitNumber || (ancRecords?.records ? ancRecords.records.length + 1 : 1);
}, [propVisitNumber, ancRecords]);

// Memoize derived state
const completionStatus = useMemo(() => {
  const sections = [
    assessmentData.medications,
    assessmentData.currentSymptoms,
    assessmentData.ipvScreening,
    assessmentData.fetalMovement
  ];
  
  const completedSections = sections.filter(section => 
    Object.keys(section).length > 0
  ).length;
  
  return `${completedSections}/${sections.length}`;
}, [assessmentData]);
```

### 2. useCallback for Function Stability
```typescript
// Memoize event handlers
const updateAssessmentData = useCallback((section: keyof AssessmentData, data: any) => {
  setAssessmentData(prev => ({
    ...prev,
    [section]: { ...prev[section], ...data }
  }));
}, []);

// Memoize async functions
const fetchInitialSymptoms = useCallback(async () => {
  try {
    const response = await fetch('/api/patients/demo-patient-123/anc/records');
    const records = await response.json();
    // processing logic
  } catch (error) {
    console.error('Error fetching symptoms:', error);
  }
}, []);
```

### 3. State Update Optimization
```typescript
// Prevent unnecessary state updates
const handleCheckboxChange = useCallback((field: string, values: string[], value: string) => {
  const newValues = values.includes(value)
    ? values.filter(v => v !== value)
    : [...values, value];
    
  // Only update if values actually changed
  if (JSON.stringify(values) !== JSON.stringify(newValues)) {
    onChange({ [field]: newValues });
  }
}, [onChange]);

// Functional state updates for complex logic
const setPreviousRecommendations = useCallback((recommendations: PreviousRecommendations) => {
  setRecommendations(prev => {
    // Deep comparison to prevent unnecessary updates
    const prevKeys = Object.keys(prev).sort();
    const newKeys = Object.keys(recommendations).sort();
    
    if (prevKeys.length !== newKeys.length || 
        !prevKeys.every(key => prev[key as keyof PreviousRecommendations] === 
                              recommendations[key as keyof PreviousRecommendations])) {
      return recommendations;
    }
    
    return prev; // No change, return previous state
  });
}, []);
```

## Component Optimization Strategies

### 1. Conditional Rendering Optimization
```typescript
// Use early returns for conditional rendering
if (hideCard) {
  return (
    <div className="space-y-8">
      {/* Inline assessment content */}
    </div>
  );
}

// Lazy loading for heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Conditional component loading
{expanded && (
  <Suspense fallback={<LoadingSpinner />}>
    <HeavyComponent data={assessmentData} />
  </Suspense>
)}
```

### 2. Props Optimization
```typescript
// Stable props to prevent child re-renders
interface StableProps {
  readonly patientId: string;
  readonly visitNumber: number;
}

// Memoized child components
const MedicationsSection = memo(({ data, onChange, previousRecommendations }: MedicationsSectionProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.data === nextProps.data &&
         prevProps.previousRecommendations === nextProps.previousRecommendations;
});
```

### 3. Event Handler Optimization
```typescript
// Debounced event handlers for frequent updates
const debouncedSave = useMemo(
  () => debounce((data: AssessmentData) => {
    if (onSave) {
      onSave(data);
    }
  }, 500),
  [onSave]
);

// Memoized click handlers
const handleExpand = useCallback(() => {
  setExpanded(prev => !prev);
  onToggle?.();
}, [onToggle]);
```

## Memory Management

### 1. Cleanup Patterns
```typescript
// Effect cleanup
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      // Handle response
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    controller.abort();
  };
}, []);

// Timer cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    // Timer logic
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);
```

### 2. Reference Stability
```typescript
// Stable object references
const config = useMemo(() => ({
  apiEndpoint: '/api/anc/assessment',
  timeout: 5000,
  retries: 3
}), []);

// Stable array references
const medicationOptions = useMemo(() => [
  'None', 'Antacids', 'Aspirin', 'Calcium',
  'Doxylamine', 'Folic Acid', 'Iron'
], []);
```

## Error Boundary Performance

### 1. Lightweight Error Boundaries
```typescript
// Optimized error boundary with minimal re-renders
class OptimizedErrorBoundary extends Component<Props, State> {
  private hasLogged = false;
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log once to prevent performance issues
    if (!this.hasLogged) {
      console.error('Error boundary caught:', error, errorInfo);
      this.hasLogged = true;
    }
    
    // Optional error reporting
    this.props.onError?.(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### 2. Error Recovery Optimization
```typescript
// Optimized error recovery
const handleRetry = useCallback(() => {
  // Clear error state
  setError(null);
  
  // Reset component state
  setAssessmentData(initialAssessmentData);
  
  // Trigger re-render
  setKey(prev => prev + 1);
}, []);

// Memoized error fallback
const ErrorFallback = memo(({ error, onRetry }: ErrorFallbackProps) => (
  <div className="error-fallback">
    <p>Something went wrong: {error.message}</p>
    <Button onClick={onRetry}>Try Again</Button>
  </div>
));
```

## Bundle Size Optimization

### 1. Dynamic Imports
```typescript
// Lazy load assessment sections
const MedicationsSection = lazy(() => 
  import('./sections/MedicationsSection').then(module => ({
    default: module.MedicationsSection
  }))
);

// Conditional imports
const loadIPVScreening = () => {
  if (shouldLoadIPVScreening) {
    return import('./sections/IPVScreeningSection');
  }
  return Promise.resolve({ default: () => null });
};
```

### 2. Tree Shaking Optimization
```typescript
// Named imports instead of default exports
export { MedicationsSection } from './MedicationsSection';
export { SymptomsSection } from './SymptomsSection';
export { IPVScreeningSection } from './IPVScreeningSection';

// Use specific imports
import { MedicationsSection, SymptomsSection } from './sections';
```

## Monitoring & Profiling

### 1. Performance Monitoring
```typescript
// Performance measurement
const measurePerformance = (name: string, fn: () => void) => {
  performance.mark(`${name}-start`);
  fn();
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
};

// React Profiler integration
const ProfiledAssessment = ({ children, id }: ProfilerProps) => (
  <Profiler
    id={id}
    onRender={(id, phase, actualDuration) => {
      if (actualDuration > 16) { // Alert if render takes longer than 16ms
        console.warn(`Slow render detected: ${id} took ${actualDuration}ms`);
      }
    }}
  >
    {children}
  </Profiler>
);
```

### 2. Memory Leak Detection
```typescript
// Memory leak detection in development
if (process.env.NODE_ENV === 'development') {
  const checkMemoryLeaks = () => {
    const memoryUsage = performance.memory;
    if (memoryUsage.usedJSHeapSize > memoryUsage.totalJSHeapSize * 0.9) {
      console.warn('High memory usage detected');
    }
  };
  
  setInterval(checkMemoryLeaks, 10000);
}
```

## Best Practices Summary

### Do's ✅
1. **Always memoize static data objects** with `useMemo`
2. **Use `useCallback` for all event handlers** passed as props
3. **Implement state comparison logic** to prevent unnecessary updates
4. **Wrap expensive components** in `React.memo`
5. **Clean up effects** with proper cleanup functions
6. **Use error boundaries** to prevent cascading failures
7. **Implement lazy loading** for non-critical components
8. **Monitor performance** in development and production

### Don'ts ❌
1. **Don't recreate objects** in render functions
2. **Don't use inline objects** as props without memoization
3. **Don't ignore useEffect dependencies** - always include them
4. **Don't mutate state directly** - use functional updates
5. **Don't forget to cleanup** timers, subscriptions, and listeners
6. **Don't over-optimize** - measure first, then optimize
7. **Don't use deep equality checks** for every state update
8. **Don't ignore console warnings** about keys, dependencies, etc.

## Performance Metrics

### Target Metrics
- **Initial Render:** < 100ms
- **State Updates:** < 16ms (60fps)
- **Memory Usage:** < 50MB for assessment components
- **Bundle Size:** < 500KB for assessment module
- **Modal Render:** < 50ms for dynamic alert modal system
- **Risk Calculation:** < 10ms for 20-point PrEP risk assessment

### Monitoring Tools
- React DevTools Profiler
- Chrome DevTools Performance tab
- Bundle analyzer for size optimization
- Memory profiler for leak detection

## Implementation Checklist

Before deploying performance optimizations:

- [ ] All functions wrapped in `useCallback`
- [ ] All computed values wrapped in `useMemo`
- [ ] Static data objects memoized
- [ ] useEffect dependencies optimized
- [ ] State update logic includes comparison
- [ ] Error boundaries implemented
- [ ] Cleanup functions added to effects
- [ ] Performance measurements in place
- [ ] Bundle size analyzed
- [ ] Memory usage monitored