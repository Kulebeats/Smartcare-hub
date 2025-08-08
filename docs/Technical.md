# SmartCare PRO - Technical Architecture Documentation

## System Architecture Overview

SmartCare PRO employs a modern, scalable architecture designed for healthcare environments with enterprise-grade security and performance requirements.

### Architecture Pattern
- **Frontend-Heavy Architecture** - Maximum functionality in the frontend, backend focused on data persistence and API calls
- **Component-Based Design** - Modular, reusable components throughout the application
- **Type-Safe Development** - TypeScript throughout for maintainability and reliability
- **Progressive Web App** - Responsive design with offline capability considerations

## Frontend Architecture

### Core Technologies
- **React 18** - Latest React with concurrent features and improved performance
- **TypeScript** - Full type safety across the application
- **Vite** - Fast development builds and hot module replacement
- **Tailwind CSS** - Utility-first CSS framework for consistent design
- **shadcn/ui** - High-quality, accessible component library

### State Management
- **React Query (TanStack Query v5)** - Server state management and caching
- **React Hook Form** - Form validation and management
- **Zod** - Runtime type validation and schema definition
- **Local State Management** - React hooks for component-level state

### Routing and Navigation
- **Wouter** - Lightweight client-side routing
- **Route-based Code Splitting** - Lazy loading for optimal performance
- **Protected Routes** - Authentication-based route access control

### UI/UX Framework
```typescript
// Component Architecture Example
interface ComponentProps {
  data: TypedData;
  onSave: (data: TypedData) => void;
  isLoading?: boolean;
}

// Consistent styling with Tailwind + shadcn/ui
const Component: React.FC<ComponentProps> = ({ data, onSave, isLoading }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};
```

## Backend Architecture

### Core Technologies
- **Node.js 20** - Latest LTS version for stability and performance
- **Express.js** - Minimal, flexible web application framework
- **TypeScript** - Type safety for backend code
- **tsx** - TypeScript execution for development and production

### Database Layer
- **PostgreSQL 16** - Primary database with advanced features
- **Drizzle ORM** - Type-safe database operations with SQL-like syntax
- **Row-Level Security (RLS)** - Database-level access control
- **Automated Migrations** - `npm run db:push` for schema updates

```typescript
// Database Schema Example
export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  facilityId: uuid('facility_id').notNull(),
  nrc: varchar('nrc', { length: 50 }),
  nupin: varchar('nupin', { length: 50 }),
  artNumber: varchar('art_number', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// RLS Policy
CREATE POLICY facility_isolation ON patients
  FOR ALL TO authenticated
  USING (facility_id = current_setting('app.current_facility_id')::uuid);
```

### API Architecture
- **RESTful API Design** - Standard HTTP methods and status codes
- **Request Validation** - Zod schema validation for all endpoints
- **Error Handling** - Comprehensive error responses with proper status codes
- **Rate Limiting** - Protection against abuse and DoS attacks

### Caching and Performance
- **Redis Caching** - High-performance caching with fallback to memory
- **Bull Queue System** - Background job processing with fallback
- **Smart TTL Strategy** - Multi-tier cache expiration optimization
- **Connection Pooling** - Efficient database connection management

```typescript
// Caching Implementation
interface CacheConfig {
  ttl: number;
  fallback: boolean;
  invalidation: string[];
}

const cacheManager = {
  set: async (key: string, value: any, config: CacheConfig) => {
    // Redis with fallback to memory cache
  },
  get: async (key: string) => {
    // Retrieve from cache with fallback
  },
  invalidate: async (tags: string[]) => {
    // Tag-based cache invalidation
  }
};
```

## Security Architecture

### Authentication and Authorization
- **Session-based Authentication** - Secure server-side session management
- **ABAC (Attribute-Based Access Control)** - 23 active security policies
- **Multi-factor Authentication** - Enhanced security for healthcare data
- **Password Policy Enforcement** - Healthcare-grade password requirements

### Data Security
- **Row-Level Security (RLS)** - Database-level data isolation by facility
- **Data Encryption** - At-rest and in-transit encryption
- **Audit Trail** - Comprehensive logging of all data access and modifications
- **HIPAA Compliance** - Healthcare privacy and security standards

```typescript
// ABAC Policy Example
interface SecurityPolicy {
  name: string;
  subject: string;
  resource: string;
  action: string;
  condition: (context: SecurityContext) => boolean;
}

const policies: SecurityPolicy[] = [
  {
    name: 'facility_data_access',
    subject: 'user',
    resource: 'patient_data',
    action: 'read',
    condition: (ctx) => ctx.user.facilityId === ctx.resource.facilityId
  }
];
```

### Healthcare Compliance
- **HIPAA Standards** - Healthcare Information Portability and Accountability Act
- **Data Minimization** - Only collect and store necessary healthcare data
- **Access Logging** - Complete audit trail for compliance reporting
- **Data Retention Policies** - Automated data lifecycle management

## Component Architecture

### Medical Record Components
```typescript
// Modular Component Design
interface MedicalRecordComponent {
  data: MedicalRecordData;
  onSave: (data: MedicalRecordData) => void;
  onValidate: (data: MedicalRecordData) => ValidationResult;
  isReadOnly?: boolean;
}

// Referral System Components
export const ReferralCard: React.FC<ReferralCardProps> = ({ data, onOpenModal }) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gray-100">
        <CardTitle>Referral Reasons</CardTitle>
        <Button onClick={onOpenModal}>Add Record</Button>
      </CardHeader>
    </Card>
  );
};

export const ReferralModal: React.FC<ReferralModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: initialData
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <Form {...form}>
          {/* Form components */}
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

### Clinical Decision Support System (CDSS)
```typescript
// CDSS Engine Architecture
interface CDSSRule {
  id: string;
  name: string;
  condition: (data: ClinicalData) => boolean;
  recommendation: CDSSRecommendation;
  priority: 'critical' | 'warning' | 'info';
}

const CDSSEngine = {
  evaluate: (data: ClinicalData, rules: CDSSRule[]) => {
    return rules
      .filter(rule => rule.condition(data))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  },
  
  triggerAlert: (recommendations: CDSSRecommendation[]) => {
    // React Portal rendering for high-priority alerts
    createPortal(
      <CDSSAlert recommendations={recommendations} />,
      document.body
    );
  }
};
```

## Data Flow Architecture

### Client-Server Communication
```typescript
// API Request/Response Flow
interface APIRequest<T> {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  headers?: Record<string, string>;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// React Query Integration
const usePatientData = (patientId: string) => {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => apiRequest.get(`/api/patients/${patientId}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Real-time Data Updates
- **Optimistic Updates** - Immediate UI feedback with rollback capability
- **Cache Invalidation** - Smart cache management based on data relationships
- **WebSocket Integration** - Real-time notifications for critical alerts
- **Offline Support** - Local storage fallback for connectivity issues

## Performance Optimization

### Frontend Optimization
- **Code Splitting** - Route-based and component-based lazy loading
- **Tree Shaking** - Elimination of unused code in production builds
- **Image Optimization** - Lazy loading and format optimization
- **Bundle Analysis** - Regular analysis of bundle size and dependencies

### Backend Optimization
- **Database Indexing** - Memory-conscious indexing for Replit constraints
- **Query Optimization** - Efficient database queries with proper joins
- **Caching Strategy** - Multi-tier caching with intelligent invalidation
- **Connection Pooling** - Optimal database connection management

### Memory Management
```typescript
// Memory-conscious patterns
const MemoryOptimizedComponent = React.memo<ComponentProps>(({ data }) => {
  const memoizedData = useMemo(() => 
    expensiveDataTransformation(data), 
    [data.id, data.lastModified]
  );
  
  const debouncedSave = useCallback(
    debounce((data: FormData) => saveData(data), 300),
    []
  );
  
  return <ComponentContent data={memoizedData} onSave={debouncedSave} />;
});
```

## Deployment Architecture

### Production Deployment
- **Build Optimization** - Production-ready bundles with minification
- **Environment Configuration** - Secure environment variable management
- **Process Management** - PM2 or similar for process monitoring
- **Health Checks** - Automated health monitoring and alerting

### Security in Production
- **HTTPS Enforcement** - TLS/SSL certificate management
- **CSP Headers** - Content Security Policy implementation
- **Rate Limiting** - API endpoint protection
- **Dependency Scanning** - Regular security vulnerability scanning

### Monitoring and Logging
- **Application Monitoring** - Performance metrics and error tracking
- **Database Monitoring** - Query performance and connection monitoring
- **User Activity Logging** - Comprehensive audit trail for healthcare compliance
- **System Health Dashboards** - Real-time system status monitoring

This technical architecture ensures SmartCare PRO meets the demanding requirements of healthcare environments while maintaining modern development practices and scalability.