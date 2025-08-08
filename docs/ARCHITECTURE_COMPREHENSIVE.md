# SmartCare PRO - Comprehensive Architecture Documentation

## System Architecture Overview

SmartCare PRO is built on a modern, healthcare-focused architecture designed for Zambian healthcare facilities. The system employs enterprise-grade security, performance optimization, and clinical workflow integration to serve 3,600+ healthcare facilities across Zambia's 10 provinces and 116 districts.

**Version:** 1.8.3  
**Architecture Pattern:** Frontend-heavy with secure backend services  
**Deployment:** Replit-optimized with production scalability  

## Core Architecture Principles

### 1. Frontend-Heavy Design
- **Rationale** - Minimize server load, maximize client-side functionality
- **Implementation** - React 18 with comprehensive state management
- **Benefits** - Improved user experience, reduced server costs, offline resilience

### 2. Component-Based Modularity
- **Pattern** - Reusable, composable component architecture
- **Examples** - ReferralCard, ReferralModal, FacilitySelector, EmergencyChecklist
- **Benefits** - Code reusability, maintainability, consistent UI/UX

### 3. Type-Safe Development
- **Frontend** - TypeScript with strict type checking
- **Backend** - Full TypeScript implementation
- **Database** - Drizzle ORM with type-safe queries
- **Benefits** - Reduced runtime errors, improved developer experience

## Frontend Architecture Deep Dive

### React 18 Implementation
```typescript
// Component Architecture Pattern
interface ComponentProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  onValidate?: (data: T) => ValidationResult;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

// Medical Record Component Example
export const MedicalRecordComponent: React.FC<MedicalRecordProps> = ({
  data,
  onSave,
  onValidate,
  isLoading = false,
  isReadOnly = false
}) => {
  const form = useForm<MedicalRecordData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: data
  });

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gray-100">
        <CardTitle>{title}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline">Edit Record</Button>
          <Button onClick={() => setModalOpen(true)}>Add Record</Button>
        </div>
      </CardHeader>
    </Card>
  );
};
```

### State Management Architecture
```typescript
// React Query for Server State
const usePatientData = (patientId: string) => {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => apiRequest.get(`/api/patients/${patientId}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// React Hook Form for Form State
const useANCForm = (initialData: ANCData) => {
  const form = useForm<ANCFormData>({
    resolver: zodResolver(ancSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await saveANCData(data);
    queryClient.invalidateQueries(['anc', patientId]);
  });

  return { form, handleSubmit };
};

// Local State for UI Components
const [activeTab, setActiveTab] = useState<ANCTab>('rapidAssessment');
const [latestEncounterData, setLatestEncounterData] = useState<EncounterData>({});
const [showReferralModal, setShowReferralModal] = useState(false);
```

### UI/UX Framework
```typescript
// Tailwind CSS + shadcn/ui Integration
const componentClasses = {
  card: "border-2 border-blue-200 rounded-lg shadow-sm",
  cardHeader: "bg-gray-100 p-3 rounded-t-lg",
  cardContent: "bg-white p-4 rounded-b-lg",
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-black",
    outline: "border border-gray-300 hover:bg-gray-50"
  }
};

// Responsive Design Implementation
const useResponsiveLayout = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowWidth < 768,
    isTablet: windowWidth >= 768 && windowWidth < 1024,
    isDesktop: windowWidth >= 1024
  };
};
```

## Backend Architecture Deep Dive

### Express.js + TypeScript Server
```typescript
// Server Configuration
const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
  store: new ConnectPgSimple(session)({
    pool: dbPool,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ABAC Middleware
app.use('/api', abacMiddleware);
```

### Database Architecture (PostgreSQL + Drizzle)
```typescript
// Schema Definition
export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id),
  nrc: varchar('nrc', { length: 50 }),
  nupin: varchar('nupin', { length: 50 }),
  artNumber: varchar('art_number', { length: 50 }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 10 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Row-Level Security Implementation
CREATE POLICY facility_isolation ON patients
  FOR ALL TO authenticated
  USING (facility_id = current_setting('app.current_facility_id')::uuid);

CREATE POLICY user_facility_access ON patients
  FOR ALL TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM user_facilities 
      WHERE user_id = current_setting('app.current_user_id')::uuid
    )
  );

// ANC Records Schema
export const ancRecords = pgTable('anc_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id),
  visitDate: date('visit_date').notNull(),
  gestationalAge: integer('gestational_age'),
  rapidAssessmentData: jsonb('rapid_assessment_data'),
  clientProfileData: jsonb('client_profile_data'),
  medicalHistoryData: jsonb('medical_history_data'),
  examinationData: jsonb('examination_data'),
  laboratoryData: jsonb('laboratory_data'),
  counsellingData: jsonb('counselling_data'),
  referralData: jsonb('referral_data'),
  pmtctData: jsonb('pmtct_data'),
  prepData: jsonb('prep_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

### API Architecture
```typescript
// RESTful Endpoint Structure
interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: RequestHandler;
  middleware: RequestHandler[];
  validation: z.ZodSchema;
}

// Patient Endpoints
const patientEndpoints: APIEndpoint[] = [
  {
    path: '/api/patients',
    method: 'GET',
    handler: getAllPatients,
    middleware: [authenticate, authorize(['read:patients'])],
    validation: z.object({
      query: z.object({
        search: z.string().optional(),
        facility: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0)
      })
    })
  },
  {
    path: '/api/patients/:id/anc/records',
    method: 'POST',
    handler: createANCRecord,
    middleware: [authenticate, authorize(['write:anc'])],
    validation: ancRecordSchema
  }
];

// Request Validation Middleware
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
      res.status(400).json({ error: 'Validation failed', details: error });
    }
  };
};
```

## Security Architecture

### ABAC (Attribute-Based Access Control)
```typescript
// ABAC Policy Engine
interface ABACPolicy {
  id: string;
  name: string;
  subject: {
    type: 'user' | 'role' | 'group';
    attributes: Record<string, any>;
  };
  resource: {
    type: 'patient' | 'anc_record' | 'prescription';
    attributes: Record<string, any>;
  };
  action: 'create' | 'read' | 'update' | 'delete';
  condition: (context: PolicyContext) => boolean;
  effect: 'allow' | 'deny';
}

// Active Security Policies (23 total)
const securityPolicies: ABACPolicy[] = [
  {
    id: 'facility_data_isolation',
    name: 'Facility Data Isolation',
    subject: { type: 'user', attributes: { facilityId: '*' } },
    resource: { type: 'patient', attributes: { facilityId: '*' } },
    action: 'read',
    condition: (ctx) => ctx.user.facilityId === ctx.resource.facilityId,
    effect: 'allow'
  },
  {
    id: 'anc_clinician_access',
    name: 'ANC Clinician Access',
    subject: { type: 'role', attributes: { name: 'anc_clinician' } },
    resource: { type: 'anc_record', attributes: {} },
    action: 'create',
    condition: (ctx) => ctx.user.permissions.includes('anc:write'),
    effect: 'allow'
  }
  // ... 21 additional policies
];

// Policy Evaluation Engine
const evaluatePolicy = (
  user: User,
  resource: Resource,
  action: string,
  policies: ABACPolicy[]
): boolean => {
  const applicablePolicies = policies.filter(policy => 
    matchesSubject(user, policy.subject) &&
    matchesResource(resource, policy.resource) &&
    policy.action === action
  );

  for (const policy of applicablePolicies) {
    const context = { user, resource, action };
    if (policy.condition(context)) {
      return policy.effect === 'allow';
    }
  }

  return false; // Default deny
};
```

### Data Encryption and Privacy
```typescript
// Encryption Configuration
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyDerivation: 'pbkdf2',
  iterations: 100000,
  saltLength: 32,
  tagLength: 16
};

// Field-Level Encryption for Sensitive Data
const encryptSensitiveField = (data: string, key: string): string => {
  const salt = crypto.randomBytes(encryptionConfig.saltLength);
  const derivedKey = crypto.pbkdf2Sync(key, salt, encryptionConfig.iterations, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipherGCM(encryptionConfig.algorithm, derivedKey, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]).toString('base64');
};

// HIPAA Compliance Audit Trail
interface AuditLogEntry {
  id: string;
  userId: string;
  facilityId: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  details?: Record<string, any>;
}

const logAuditEvent = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  await db.insert(auditLogs).values({
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date()
  });
};
```

## Performance Architecture

### Caching Strategy
```typescript
// Multi-Tier Caching Implementation
interface CacheLayer {
  name: string;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'ttl';
}

const cacheConfiguration = {
  redis: {
    ttl: 300, // 5 minutes
    fallback: true
  },
  memory: {
    ttl: 60, // 1 minute
    maxSize: 1000
  },
  browser: {
    ttl: 1800, // 30 minutes
    storage: 'sessionStorage'
  }
};

// Smart Cache Manager
class SmartCacheManager {
  private redisClient?: RedisClient;
  private memoryCache: Map<string, CacheEntry> = new Map();

  async get(key: string): Promise<any> {
    // Try Redis first
    if (this.redisClient) {
      try {
        const value = await this.redisClient.get(key);
        if (value) return JSON.parse(value);
      } catch (error) {
        console.warn('Redis cache miss, falling back to memory cache');
      }
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.value;
    }

    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const expiry = Date.now() + (ttl || cacheConfiguration.redis.ttl) * 1000;

    // Try Redis first
    if (this.redisClient) {
      try {
        await this.redisClient.setex(key, ttl || cacheConfiguration.redis.ttl, serialized);
      } catch (error) {
        console.warn('Redis cache write failed, using memory cache');
      }
    }

    // Always update memory cache as fallback
    this.memoryCache.set(key, { value, expiry });
  }
}
```

### Database Optimization
```typescript
// Memory-Conscious Indexing for Replit
const createOptimalIndexes = async () => {
  // Composite indexes for common queries
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_patients_facility_search 
    ON patients(facility_id, first_name, last_name);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_anc_records_patient_date 
    ON anc_records(patient_id, visit_date DESC);
  `);

  // Partial indexes for active records only
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_patients_active 
    ON patients(facility_id, created_at) 
    WHERE deleted_at IS NULL;
  `);

  // JSONB indexes for clinical data
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_anc_hiv_status 
    ON anc_records USING GIN ((laboratory_data->'hiv_testing'));
  `);
};

// Query Optimization
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
    .orderBy(desc(ancRecords.visitDate))
    .limit(10);
};
```

## Component Architecture Patterns

### Medical Record Components
```typescript
// Base Medical Record Component
interface MedicalRecordComponentProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  onValidate?: (data: T) => ValidationResult;
  isLoading?: boolean;
  isReadOnly?: boolean;
  showHeader?: boolean;
}

// HOC for Medical Record Components
const withMedicalRecord = <T extends Record<string, any>>(
  Component: React.ComponentType<MedicalRecordComponentProps<T>>,
  schema: z.ZodSchema<T>
) => {
  return React.forwardRef<HTMLDivElement, MedicalRecordComponentProps<T>>(
    (props, ref) => {
      const [errors, setErrors] = useState<z.ZodError | null>(null);
      
      const validate = useCallback((data: T) => {
        try {
          schema.parse(data);
          setErrors(null);
          return { isValid: true, errors: [] };
        } catch (error) {
          if (error instanceof z.ZodError) {
            setErrors(error);
            return { isValid: false, errors: error.errors };
          }
          return { isValid: false, errors: [{ message: 'Unknown validation error' }] };
        }
      }, []);

      return (
        <div ref={ref} className="medical-record-component">
          <Component {...props} onValidate={validate} />
          {errors && (
            <ValidationErrors errors={errors.errors} />
          )}
        </div>
      );
    }
  );
};
```

### Referral System Architecture
```typescript
// Referral Component Hierarchy
interface ReferralSystemProps {
  patientId: string;
  dangerSigns: string[];
  onReferralComplete: (referralData: ReferralData) => void;
}

// Main Referral Card Component
export const ReferralCard: React.FC<ReferralCardProps> = ({ 
  data, 
  onOpenModal 
}) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gray-100 p-3 rounded">
        <CardTitle className="font-semibold">Referral Reasons</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" className="rounded-full">
            Edit Record
          </Button>
          <Button 
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onOpenModal}
          >
            Add Record
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

// Comprehensive Referral Modal
export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  dangerSigns
}) => {
  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: initialData
  });

  const [currentStep, setCurrentStep] = useState<'reasons' | 'checklist' | 'facility'>('reasons');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Referral Management</DialogTitle>
        <Form {...form}>
          {currentStep === 'reasons' && (
            <ReferralReasonsSection 
              form={form} 
              dangerSigns={dangerSigns}
              onNext={() => setCurrentStep('checklist')}
            />
          )}
          {currentStep === 'checklist' && (
            <EmergencyChecklist
              form={form}
              onNext={() => setCurrentStep('facility')}
              onBack={() => setCurrentStep('reasons')}
            />
          )}
          {currentStep === 'facility' && (
            <FacilitySelector
              form={form}
              onSave={form.handleSubmit(onSave)}
              onBack={() => setCurrentStep('checklist')}
            />
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

## Clinical Decision Support System (CDSS) Architecture

### CDSS Engine Implementation
```typescript
// CDSS Rule Definition
interface CDSSRule {
  id: string;
  name: string;
  category: 'emergency' | 'warning' | 'recommendation';
  condition: (data: ClinicalData) => boolean;
  recommendation: CDSSRecommendation;
  priority: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  references: string[];
}

// CDSS Recommendation Structure
interface CDSSRecommendation {
  title: string;
  description: string;
  actions: CDSSAction[];
  followUp?: {
    timeframe: string;
    requirements: string[];
  };
}

// CDSS Engine
class CDSSEngine {
  private rules: CDSSRule[] = [];

  constructor(rules: CDSSRule[]) {
    this.rules = rules.sort((a, b) => b.priority - a.priority);
  }

  evaluate(data: ClinicalData): CDSSRecommendation[] {
    const applicableRules = this.rules.filter(rule => 
      rule.condition(data)
    );

    return applicableRules.map(rule => ({
      ...rule.recommendation,
      ruleId: rule.id,
      category: rule.category,
      evidenceLevel: rule.evidenceLevel
    }));
  }

  // Real-time evaluation for form-based triggers
  evaluateOnFormCompletion(
    formData: FormData, 
    completionThreshold: number = 0.8
  ): CDSSRecommendation[] {
    const completionRate = this.calculateCompletionRate(formData);
    
    if (completionRate >= completionThreshold) {
      return this.evaluate(formData as ClinicalData);
    }

    return [];
  }

  private calculateCompletionRate(formData: FormData): number {
    const totalFields = Object.keys(formData).length;
    const completedFields = Object.values(formData).filter(
      value => value !== null && value !== undefined && value !== ''
    ).length;

    return completedFields / totalFields;
  }
}

// React Portal Alert System
const CDSSAlertPortal: React.FC<{ recommendations: CDSSRecommendation[] }> = ({ 
  recommendations 
}) => {
  const portalRoot = document.getElementById('cdss-portal-root') || document.body;
  
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Clinical Decision Support Alert
          </h2>
          {recommendations.map((rec, index) => (
            <div key={index} className="mb-4 p-4 border-l-4 border-red-500 bg-red-50">
              <h3 className="font-semibold">{rec.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
              <div className="space-y-1">
                {rec.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="text-sm">
                    • {action.description}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    portalRoot
  );
};
```

This comprehensive architecture documentation provides a complete technical overview of SmartCare PRO's implementation, from component-level patterns to system-wide architectural decisions, ensuring maintainability and scalability for Zambian healthcare facilities.