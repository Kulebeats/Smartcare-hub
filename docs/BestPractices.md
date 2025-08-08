# SmartCare PRO - Best Practices and Development Guidelines

## Overview

SmartCare PRO best practices ensure consistent, maintainable, and healthcare-compliant development across all system components. These guidelines reflect lessons learned from deploying across 3,600+ healthcare facilities and provide standards for ongoing development and maintenance.

**Code Quality:** TypeScript-first with comprehensive validation  
**Healthcare Compliance:** WHO, HIPAA, and Zambian MoH standards  
**Performance:** Optimized for resource-constrained environments  
**Security:** Enterprise-grade with healthcare-specific requirements  

## Development Best Practices

### Code Organization and Architecture

#### Component Structure
```typescript
// Recommended component organization
src/
├── components/
│   ├── medical-record/           // Clinical components
│   │   ├── referral-card.tsx     // Card-based interfaces
│   │   ├── referral-modal.tsx    // Modal-driven workflows
│   │   └── facility-selector.tsx // Reusable clinical widgets
│   ├── ui/                       // shadcn/ui components
│   └── shared/                   // Cross-module components
├── pages/                        // Route-based pages
├── hooks/                        // Custom React hooks
├── lib/                          // Utility functions
├── types/                        // TypeScript type definitions
└── utils/                        // Helper functions

// Component naming conventions
- Use PascalCase for components: ReferralCard, HIVTestingModal
- Use kebab-case for files: referral-card.tsx, hiv-testing-modal.tsx
- Add descriptive suffixes: -card, -modal, -form, -list
```

#### TypeScript Best Practices
```typescript
// Always define comprehensive interfaces
interface MedicalRecordComponentProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  onValidate?: (data: T) => ValidationResult;
  isLoading?: boolean;
  isReadOnly?: boolean;
  className?: string;
}

// Use discriminated unions for clinical data
type HIVTestResult = 
  | { status: 'reactive'; confirmationRequired: true; followUpDate: string }
  | { status: 'non_reactive'; confirmationRequired: false; followUpDate?: never }
  | { status: 'indeterminate'; confirmationRequired: true; retestDate: string };

// Prefer type-safe database operations
const getPatientANCHistory = async (patientId: string, facilityId: string) => {
  return await db
    .select({
      id: ancRecords.id,
      visitDate: ancRecords.visitDate,
      gestationalAge: ancRecords.gestationalAge,
      hivStatus: sql<string>`laboratory_data->'hiv_testing'->>'result'`
    })
    .from(ancRecords)
    .where(
      and(
        eq(ancRecords.patientId, patientId),
        eq(ancRecords.facilityId, facilityId)
      )
    )
    .orderBy(desc(ancRecords.visitDate));
};
```

### Healthcare-Specific Development

#### Clinical Data Handling
```typescript
// Always validate healthcare data with Zod
const vitalSignsSchema = z.object({
  bloodPressure: z.object({
    systolic: z.number().min(60).max(250),
    diastolic: z.number().min(40).max(150)
  }),
  temperature: z.number().min(35.0).max(42.0),
  pulse: z.number().min(40).max(200),
  respiratoryRate: z.number().min(8).max(40)
});

// Implement healthcare-specific validation
const validateNRC = (nrc: string): boolean => {
  // Zambian NRC format: XXXXXX/XX/X
  return /^\d{6}\/\d{2}\/\d$/.test(nrc);
};

const validateGestationalAge = (weeks: number): boolean => {
  return weeks >= 4 && weeks <= 44;
};

// Use enums for clinical classifications
enum RiskLevel {
  LOW = 'low',
  MODERATE = 'moderate', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum WHOStage {
  STAGE_1 = 1,
  STAGE_2 = 2,
  STAGE_3 = 3,
  STAGE_4 = 4
}
```

#### CDSS Implementation Standards
```typescript
// CDSS rules should be modular and testable
interface CDSSRule {
  id: string;
  name: string;
  category: 'emergency' | 'warning' | 'recommendation' | 'info';
  condition: (data: ClinicalData) => boolean;
  recommendation: CDSSRecommendation;
  priority: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  references: string[];
}

// Example: Well-structured CDSS rule
const ancDangerSignsRule: CDSSRule = {
  id: 'anc_danger_signs_emergency',
  name: 'ANC Danger Signs - Emergency Referral',
  category: 'emergency',
  condition: (data: ANCData) => {
    const criticalDangerSigns = [
      'severe_headache', 
      'blurred_vision', 
      'convulsions', 
      'severe_abdominal_pain'
    ];
    return criticalDangerSigns.some(sign => 
      data.dangerSigns?.includes(sign)
    );
  },
  recommendation: {
    title: 'EMERGENCY: Immediate Referral Required',
    description: 'Patient presents with danger signs requiring immediate referral.',
    actions: [
      { type: 'urgent_referral', description: 'Arrange immediate transport' },
      { type: 'stabilization', description: 'Provide supportive care during transport' }
    ]
  },
  priority: 1,
  evidenceLevel: 'A',
  references: ['WHO ANC Guidelines 2016', 'Zambian National ANC Standards']
};
```

### Security and Privacy Best Practices

#### Data Protection
```typescript
// Always use Row-Level Security for facility isolation
CREATE POLICY facility_data_isolation ON patients
  FOR ALL TO authenticated
  USING (facility_id = current_setting('app.current_facility_id')::uuid);

// Implement comprehensive audit logging
interface AuditLogEntry {
  userId: string;
  facilityId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resource: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

const logAuditEvent = async (entry: AuditLogEntry) => {
  await db.insert(auditLogs).values(entry);
};

// Encrypt sensitive data fields
const encryptSensitiveField = (data: string, key: string): string => {
  const cipher = crypto.createCipher('aes-256-gcm', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

#### Authentication and Authorization
```typescript
// ABAC policy structure
interface SecurityPolicy {
  id: string;
  name: string;
  subject: { type: string; attributes: Record<string, any> };
  resource: { type: string; attributes: Record<string, any> };
  action: string;
  condition: (context: SecurityContext) => boolean;
  effect: 'allow' | 'deny';
}

// Middleware for request validation
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.validatedData = validatedData;
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error instanceof z.ZodError ? error.errors : error 
      });
    }
  };
};
```

### Performance Optimization Guidelines

#### Frontend Performance
```typescript
// Use React.memo for expensive components
const ANCSection = React.memo<ANCSectionProps>(({ data, onSave, isActive }) => {
  // Memoize expensive calculations
  const memoizedData = useMemo(() => 
    processANCData(data), 
    [data.lastModified, data.id]
  );
  
  // Debounce save operations
  const debouncedSave = useCallback(
    debounce((formData: ANCFormData) => onSave(formData), 500),
    [onSave]
  );
  
  // Early return for inactive sections
  if (!isActive) return null;
  
  return <SectionContent data={memoizedData} onSave={debouncedSave} />;
});

// Optimize React Query usage
const useOptimizedPatientData = (patientId: string) => {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => apiRequest.get(`/api/patients/${patientId}`),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!patientId
  });
};
```

#### Database Optimization
```sql
-- Create memory-conscious indexes
CREATE INDEX idx_patients_facility_search 
ON patients(facility_id, first_name, last_name) 
INCLUDE (nrc, nupin, art_number)
WHERE deleted_at IS NULL;

-- Use partial indexes for active records
CREATE INDEX idx_anc_records_recent 
ON anc_records(patient_id, visit_date DESC) 
WHERE visit_date >= CURRENT_DATE - INTERVAL '1 year';

-- JSONB indexes for clinical queries
CREATE INDEX idx_anc_hiv_status 
ON anc_records USING GIN ((laboratory_data->'hiv_testing'->>'result'))
WHERE laboratory_data->'hiv_testing'->>'result' IS NOT NULL;
```

### UI/UX Best Practices

#### Component Design Patterns
```typescript
// Card-based interface pattern
const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ 
  title, 
  icon: Icon, 
  data, 
  onEdit 
}) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gray-100 p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <CardTitle className="font-semibold">{title}</CardTitle>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={onEdit}
          >
            Edit Record
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <DataDisplay data={data} />
      </CardContent>
    </Card>
  );
};

// Modal-driven workflow pattern
const ClinicalModal: React.FC<ClinicalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  children
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {children}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### Responsive Design Standards
```css
/* Mobile-first responsive design */
.anc-layout {
  @apply flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4;
}

.sidebar {
  @apply w-full lg:w-80 order-2 lg:order-1;
}

.main-content {
  @apply flex-1 order-1 lg:order-2;
}

.data-summary {
  @apply w-full lg:w-80 order-3;
}

/* Healthcare facility specific breakpoints */
@media (min-width: 768px) and (max-width: 1200px) {
  .facility-tablet-layout {
    /* Optimized for facility tablets */
    @apply grid-cols-2 gap-4;
  }
}

@media (min-width: 1200px) {
  .facility-desktop-layout {
    /* Optimized for facility desktops */
    @apply grid-cols-3 gap-6;
  }
}
```

### Testing Best Practices

#### Unit Testing
```typescript
// Test clinical logic thoroughly
describe('PrEP Risk Assessment', () => {
  it('should calculate high risk correctly', () => {
    const assessmentData: PrEPAssessmentData = {
      clientRiskFactors: {
        inconsistentCondomUse: { present: true, points: 2 },
        multiplePartners: { present: true, points: 2 },
        recentSTI: { present: true, points: 3 }
      },
      partnerRiskFactors: {
        notOnART: { present: true, points: 3 },
        detectableViralLoad: { present: false, points: 0 },
        multiplePartners: { present: false, points: 0 },
        injectionDrugUse: { present: false, points: 0 }
      },
      pregnancyModifiers: {
        trimesterAssessment: { trimester: 2, points: 1 },
        breastfeedingPlans: { planning: false, points: 0 }
      }
    };

    const riskScore = calculatePrEPRiskScore(assessmentData);
    expect(riskScore.totalScore).toBe(11);
    expect(riskScore.riskLevel).toBe('high');
  });
});

// Test CDSS rule evaluation
describe('CDSS Rules', () => {
  it('should trigger emergency alert for danger signs', () => {
    const ancData: ANCData = {
      dangerSigns: ['severe_headache', 'blurred_vision'],
      // ... other data
    };

    const recommendations = evaluateCDSSRules(ancData, 'anc');
    const emergencyRec = recommendations.find(r => r.category === 'emergency');
    
    expect(emergencyRec).toBeDefined();
    expect(emergencyRec?.title).toContain('EMERGENCY');
  });
});
```

#### Integration Testing
```typescript
// Test API endpoints with validation
describe('ANC Records API', () => {
  beforeEach(async () => {
    // Set up test database with RLS context
    await db.execute(sql`
      SELECT set_config('app.current_facility_id', ${testFacilityId}, true)
    `);
  });

  it('should create ANC record with proper validation', async () => {
    const ancData = {
      patientId: testPatientId,
      visitDate: '2025-07-30',
      gestationalAge: 20,
      rapidAssessmentData: { /* test data */ }
    };

    const response = await request(app)
      .post(`/api/patients/${testPatientId}/anc/records`)
      .send(ancData)
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.facilityId).toBe(testFacilityId);
  });
});
```

### Documentation Standards

#### Code Documentation
```typescript
/**
 * Calculates PrEP risk score based on WHO and CDC guidelines
 * 
 * @param assessmentData - Complete PrEP assessment data
 * @returns Risk score with classification and recommendations
 * 
 * @example
 * ```typescript
 * const riskScore = calculatePrEPRiskScore(assessmentData);
 * if (riskScore.riskLevel === 'high') {
 *   // Recommend PrEP initiation
 * }
 * ```
 */
const calculatePrEPRiskScore = (
  assessmentData: PrEPAssessmentData
): PrEPRiskScore => {
  // Implementation with clear logic flow
  const clientRiskPoints = calculateClientRiskPoints(assessmentData.clientRiskFactors);
  const partnerRiskPoints = calculatePartnerRiskPoints(assessmentData.partnerRiskFactors);
  const pregnancyPoints = calculatePregnancyModifiers(assessmentData.pregnancyModifiers);
  
  const totalScore = clientRiskPoints + partnerRiskPoints + pregnancyPoints;
  
  return {
    totalScore,
    riskLevel: classifyRiskLevel(totalScore),
    recommendations: generateRiskBasedRecommendations(totalScore)
  };
};
```

#### API Documentation
```typescript
/**
 * @api {post} /api/patients/:id/anc/records Create ANC Record
 * @apiName CreateANCRecord
 * @apiGroup ANC
 * @apiVersion 1.8.3
 * 
 * @apiParam {String} id Patient's unique ID
 * 
 * @apiBody {String} visitDate Visit date in YYYY-MM-DD format
 * @apiBody {Number} gestationalAge Gestational age in weeks (4-44)
 * @apiBody {Object} rapidAssessmentData Rapid assessment data structure
 * 
 * @apiSuccess {String} id Created record ID
 * @apiSuccess {String} patientId Patient ID
 * @apiSuccess {String} facilityId Facility ID (auto-assigned)
 * @apiSuccess {String} visitDate Visit date
 * 
 * @apiError {String} ValidationError Invalid input data
 * @apiError {String} AuthenticationError User not authenticated
 * @apiError {String} AuthorizationError Insufficient permissions
 * 
 * @apiExample {curl} Example usage:
 * curl -X POST http://localhost:5000/api/patients/123/anc/records \
 *      -H "Content-Type: application/json" \
 *      -d '{"visitDate": "2025-07-30", "gestationalAge": 20}'
 */
```

### Deployment and DevOps

#### Environment Configuration
```typescript
// Environment-specific configuration
const config = {
  development: {
    database: {
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      pool: { min: 2, max: 10 }
    },
    cache: {
      ttl: 60, // 1 minute for development
      provider: 'memory'
    }
  },
  production: {
    database: {
      connectionString: process.env.DATABASE_URL,
      ssl: true,
      pool: { min: 5, max: 20 }
    },
    cache: {
      ttl: 300, // 5 minutes for production
      provider: 'redis'
    }
  }
};

// Feature flags for gradual rollouts
const featureFlags = {
  enhancedCDSS: process.env.FEATURE_ENHANCED_CDSS === 'true',
  advancedReporting: process.env.FEATURE_ADVANCED_REPORTING === 'true',
  mobileOptimization: process.env.FEATURE_MOBILE_OPTIMIZATION === 'true'
};
```

#### Error Handling and Monitoring
```typescript
// Comprehensive error handling
class ApplicationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errorCode: string = 'INTERNAL_ERROR',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

// Error monitoring and reporting
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    facilityId: req.user?.facilityId,
    timestamp: new Date().toISOString()
  });

  // Send appropriate response
  if (error instanceof ApplicationError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.errorCode,
      ...(process.env.NODE_ENV === 'development' && { context: error.context })
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Performance monitoring
const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - startTime;
    
    // Log slow requests
    if (duration > 100) {
      console.warn(`Slow request: ${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
    }
    
    // Record metrics
    recordMetric('api_request_duration', duration);
    recordMetric(`api_${req.method.toLowerCase()}_requests`, 1);
  });
  
  next();
};
```

## Maintenance Best Practices

### Code Review Guidelines
1. **Healthcare Logic Review** - All clinical logic must be reviewed by healthcare-knowledgeable team members
2. **Security Review** - All database queries and API endpoints must be security-reviewed
3. **Performance Review** - Memory and performance impact must be assessed for Replit constraints
4. **Test Coverage** - All new features must include comprehensive tests
5. **Documentation Update** - All changes must update relevant documentation

### Version Control Practices
```bash
# Branch naming conventions
git checkout -b feature/anc-referral-enhancement
git checkout -b bugfix/prep-risk-calculation
git checkout -b hotfix/security-vulnerability

# Commit message format
feat(anc): add component-based referral system
fix(prep): correct risk score calculation thresholds
docs(api): update CDSS endpoint documentation
perf(db): optimize patient search query indexing
```

### Monitoring and Alerting
- **Performance Monitoring** - API response times, database query performance
- **Error Tracking** - Application errors, security incidents, data validation failures
- **Usage Analytics** - Feature adoption, user workflows, facility performance
- **Health Checks** - System availability, database connectivity, external service status

These best practices ensure SmartCare PRO maintains high quality, security, and performance standards while continuing to serve Zambian healthcare facilities effectively.