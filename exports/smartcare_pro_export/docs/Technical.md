# Technical Documentation

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query
- **Form Handling**: react-hook-form with Zod validation
- **UI Components**: shadcn/ui
- **Routing**: wouter
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Passport.js
- **Session Management**: express-session

### Database
- **RDBMS**: PostgreSQL
- **ORM**: Drizzle
- **Schema Validation**: Zod + drizzle-zod

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Vite
- **Type Checking**: TypeScript
- **Code Formatting**: Prettier
- **Deployment**: Replit

## UI/UX Specifications

### Design System

#### Colors
```json
{
  "primary": {
    "base": "#0072BC",
    "light": "#3395D6",
    "dark": "#005A96"
  },
  "secondary": {
    "base": "#00A651",
    "light": "#33BD77",
    "dark": "#008541"
  },
  "neutral": {
    "white": "#FFFFFF",
    "background": "#F9FAFB",
    "border": "#E5E7EB",
    "text": {
      "primary": "#111827",
      "secondary": "#4B5563"
    }
  }
}
```

#### Typography
```css
/* Font Families */
--font-sans: "Inter", system-ui, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Component Patterns

##### Buttons
```typescript
// Primary Button
<Button variant="default">
  Primary Action
</Button>

// Secondary Button
<Button variant="outline">
  Secondary Action
</Button>

// With Icon
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add New
</Button>
```

##### Forms
```typescript
// Form Field Pattern
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Form Patterns
##### Medical Record Forms
```typescript
// Tabbed Form Layout
<Tabs defaultValue="registration" className="w-full">
  <TabsList className="grid w-full">
    <TabsTrigger value="registration">Registration</TabsTrigger>
    <TabsTrigger value="details">Patient Details</TabsTrigger>
    <TabsTrigger value="medical">Medical Info</TabsTrigger>
  </TabsList>

  <TabsContent value="registration">
    {/* Registration Form Fields */}
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="registration.date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Other registration fields */}
    </div>
  </TabsContent>
</Tabs>

// Dialog Form Pattern
<Dialog>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Medical Record Entry</DialogTitle>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        {/* Form fields */}
      </form>
    </Form>
  </DialogContent>
</Dialog>

// Multi-Column Form Layout
<div className="grid grid-cols-2 gap-4">
  {/* Left column */}
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="patientInfo.firstName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>

  {/* Right column */}
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="patientInfo.lastName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
</div>
```

#### Form Patterns (Medical Records)

##### Pharmacovigilance Form Layout
```typescript
// Tabs Structure
<Tabs defaultValue="registration" className="w-full">
  <TabsList className="grid grid-cols-5 w-full">
    <TabsTrigger value="registration">Registration</TabsTrigger>
    <TabsTrigger value="reactions">K2. Adverse Reactions</TabsTrigger>
    <TabsTrigger value="art">ART History</TabsTrigger>
    <TabsTrigger value="hivtests">E1. HIV Tests</TabsTrigger>
    <TabsTrigger value="othertests">E2. Other Tests</TabsTrigger>
  </TabsList>

  {/* Registration Section */}
  <TabsContent value="registration">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Registration</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="registration.dateOfReporting"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Reporting</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Other registration fields */}
      </div>
    </div>
  </TabsContent>

  {/* Adverse Reactions Section */}
  <TabsContent value="reactions">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">K2. ADVERSE DRUG REACTIONS</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="adverseDrugReactions.drugName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drug Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter drug name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Other reaction fields */}
      </div>
    </div>
  </TabsContent>

  {/* Other sections follow similar pattern */}
</Tabs>

// Validation Schema
const pharmacovigilanceSchema = z.object({
  registration: z.object({
    dateOfReporting: z.string(),
    healthFacility: z.string(),
    district: z.string(),
    province: z.string()
  }),
  adverseDrugReactions: z.object({
    drugName: z.string().min(1, "Drug name is required"),
    reactionType: z.string().min(1, "Reaction type is required"),
    severity: z.string().min(1, "Severity is required"),
    onsetDate: z.string().min(1, "Onset date is required"),
    description: z.string().min(1, "Description is required"),
    actionTaken: z.string().min(1, "Action taken is required"),
    outcome: z.string().min(1, "Outcome is required")
  }),
  artHistory: z.object({
    regimen: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    reasonForChange: z.string().optional()
  }),
  hivTests: z.object({
    cd4Count: z.string(),
    viralLoad: z.string(),
    testDate: z.string()
  }),
  otherTests: z.object({
    testName: z.string(),
    result: z.string(),
    testDate: z.string()
  }),
  followUpReason: z.enum([
    "TDF+XTC+DTG",
    "TAF+FTC+DTG",
    "AZT+3TC+DRV-r",
    "AZT+3TC+DTG",
    "ABC+3TC+DTG",
    "Rifapentine + High-dose Isoniazid (3HP)",
    "INH",
    "Pregnant or Breastfeeding Women (PBW)"
  ]),
  coMorbidities: z.array(z.string())
});

// Constants
const CO_MORBIDITIES = [
  { id: "tb", label: "Tuberculosis" },
  { id: "diabetes", label: "Diabetes Mellitus" },
  { id: "hypertension", label: "Hypertension" },
  { id: "mental", label: "Mental Illness" },
  { id: "renal", label: "Renal Disease" },
  { id: "liver", label: "Liver Disease" },
  { id: "stroke", label: "Stroke" },
  { id: "cvd", label: "Cardiovascular Disease (CVD)" },
  { id: "seizures", label: "Seizures" },
  { id: "allergies", label: "Allergies (including Asthma)" }
];

// Implementation Example
export function PharmacovigilanceDialog({
  open,
  onClose,
  onSave
}: PharmacovigilanceDialogProps) {
  const form = useForm<z.infer<typeof pharmacovigilanceSchema>>({
    resolver: zodResolver(pharmacovigilanceSchema),
    defaultValues: {
      registration: {
        dateOfReporting: format(new Date(), "yyyy-MM-dd"),
        healthFacility: "",
        district: "",
        province: ""
      },
      coMorbidities: []
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pharmacovigilance</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            {/* Form content */}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

##### Medical Record Form Examples
```typescript
// Pharmacovigilance Form Layout (Replaced with updated version above)

// Common Form Section Patterns
const formSection = (title: string, children: React.ReactNode) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

// Medical Records Card Pattern
<Card key={section.id} className="p-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-medium text-gray-900">
      {section.title}
    </h3>
    <div className="flex gap-2">
      <Button variant="outline" className="flex items-center gap-2">
        <FileEdit className="h-4 w-4" />
        Edit Record
      </Button>
      <Button
        className="flex items-center gap-2"
        onClick={() => handleAddRecord(section.id)}
      >
        <Plus className="h-4 w-4" />
        Add Record
      </Button>
    </div>
  </div>
</Card>

// Form Validation Examples
const pharmacovigilanceSchema = z.object({ //This is replaced with the updated schema above.
  registration: z.object({
    dateOfReporting: z.string(),
    healthFacility: z.string(),
    district: z.string(),
    province: z.string()
  }),
  adverseDrugReactions: z.object({
    drugName: z.string().min(1, "Drug name is required"),
    reactionType: z.string().min(1, "Reaction type is required"),
    severity: z.string().min(1, "Severity is required"),
    onsetDate: z.string().min(1, "Onset date is required"),
    description: z.string().min(1, "Description is required"),
    actionTaken: z.string().min(1, "Action taken is required"),
    outcome: z.string().min(1, "Outcome is required"),
  }),
  artHistory: z.object({
    regimen: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    reasonForChange: z.string().optional(),
  }),
  hivTests: z.object({
    cd4Count: z.string(),
    viralLoad: z.string(),
    testDate: z.string(),
  }),
  otherTests: z.object({
    testName: z.string(),
    result: z.string(),
    testDate: z.string(),
  }),
  followUpReason: z.enum([
    "TDF+XTC+DTG",
    "TAF+FTC+DTG",
    "AZT+3TC+DRV-r",
    "AZT+3TC+DTG",
    "ABC+3TC+DTG",
    "Rifapentine + High-dose Isoniazid (3HP)",
    "INH",
    "Pregnant or Breastfeeding Women (PBW)"
  ]),
  coMorbidities: z.array(z.string())
});
```

##### Medical Record Dialog Forms
```typescript
// Present History Dialog Pattern
export function PresentHistoryDialog({
  open,
  onClose,
  onSave
}: DialogProps) {
  const form = useForm<PresentHistoryForm>({
    resolver: zodResolver(presentHistorySchema),
    defaultValues: {
      complaint: "",
      duration: "",
      severity: "",
      notes: ""
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Present History</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            {/* Form fields */}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Family Social History Dialog Pattern
export function FamilySocialHistoryDialog({
  open,
  onClose,
  onSave
}: DialogProps) {
  const form = useForm<FamilySocialHistoryForm>({
    resolver: zodResolver(familySocialHistorySchema),
    defaultValues: {
      familyHistory: "",
      socialHistory: "",
      occupation: "",
      lifestyle: ""
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Family & Social History</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            {/* Form fields */}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// NCD Management Form Pattern
export function NCDManagementForm({
  onSave
}: NCDManagementFormProps) {
  const form = useForm<NCDManagementForm>({
    resolver: zodResolver(ncdManagementSchema),
    defaultValues: {
      condition: "",
      management: "",
      medications: "",
      followUp: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>NCD Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Form fields */}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
```

#### Form Validation Schemas
```typescript
// Present History Schema
const presentHistorySchema = z.object({
  complaint: z.string().min(1, "Complaint is required"),
  duration: z.string().min(1, "Duration is required"),
  severity: z.string().min(1, "Severity is required"),
  notes: z.string()
});

// Family Social History Schema
const familySocialHistorySchema = z.object({
  familyHistory: z.string().min(1, "Family history is required"),
  socialHistory: z.string().min(1, "Social history is required"),
  occupation: z.string(),
  lifestyle: z.string()
});

// NCD Management Schema
const ncdManagementSchema = z.object({
  condition: z.string().min(1, "Condition is required"),
  management: z.string().min(1, "Management plan is required"),
  medications: z.string(),
  followUp: z.string()
});
```

#### Error Handling Patterns
```typescript
// Form Error Handling
const handleError = (error: Error) => {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
};

// API Error Handling
const handleAPIError = (error: unknown) => {
  if (error instanceof APIError) {
    toast({
      title: "API Error",
      description: error.message,
      variant: "destructive"
    });
  } else {
    toast({
      title: "Unexpected Error",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
  }
};
```

#### Medical Records Page Layout
```typescript
export default function MedicalRecords() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "url('/Carepro_Background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header */}
      <header className="bg-white/80 border-b relative z-10">
        {/* Header content */}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="space-y-6">
          {/* Patient Information Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Patient details grid */}
              </div>
            </CardContent>
          </Card>

          {/* Medical Records Tabs */}
          <Tabs defaultValue="complaints" className="w-full">
            <TabsList className="w-full justify-start border-b mb-6">
              <TabsTrigger value="complaints">Complaints & Histories</TabsTrigger>
              <TabsTrigger value="examination">Examination & Diagnosis</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="complaints" className="space-y-6">
              {/* Medical record sections */}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
```

##### Common Form Validation Rules
```typescript
// Validation schema examples
const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nrc: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
});

const medicalRecordSchema = z.object({
  complaint: z.string().min(1, "Complaint is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  treatment: z.string().min(1, "Treatment is required"),
  followUpDate: z.string().optional(),
});

// Form initialization
const form = useForm<z.infer<typeof patientSchema>>({
  resolver: zodResolver(patientSchema),
  defaultValues: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nrc: "",
    phone: "",
  }
});
```

##### Form State Management
```typescript
// Loading states
const { isPending } = useMutation({
  mutationFn: savePatient,
  onSuccess: () => {
    toast({ title: "Success", description: "Patient saved successfully" });
    form.reset();
  },
  onError: (error) => {
    toast({ 
      title: "Error", 
      description: error.message,
      variant: "destructive"
    });
  }
});

// Conditional rendering based on form state
<Button type="submit" disabled={isPending}>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    "Save"
  )}
</Button>

// Error handling
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
      {form.formState.errors.email && (
        <p className="text-sm text-destructive">
          {form.formState.errors.email.message}
        </p>
      )}
    </FormItem>
  )}
/>
```

##### Cards
```typescript
// Standard Card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

##### Dialogs
```typescript
// Modal Dialog Pattern
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Content goes here
  </DialogContent>
</Dialog>
```

#### Component States
```css
/* Button States */
.button {
  /* Default */
  @apply bg-primary text-white;

  /* Hover */
  &:hover {
    @apply bg-primary/90;
  }

  /* Active */
  &:active {
    @apply bg-primary/80;
  }

  /* Disabled */
  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}

/* Input States */
.input {
  /* Default */
  @apply border-input;

  /* Focus */
  &:focus {
    @apply ring-2 ring-ring ring-offset-2;
  }

  /* Error */
  &[aria-invalid="true"] {
    @apply border-destructive;
  }
}
```

#### Spacing System
```css
/* Spacing Scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */

/* Common Spacing Patterns */
.container {
  @apply px-4 py-8 md:px-6 lg:px-8;
}

.stack {
  @apply space-y-4;
}

.grid-layout {
  @apply grid gap-4 md:gap-6;
}
```

#### Shadow System
```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Usage */
.card {
  @apply shadow-md hover:shadow-lg transition-shadow;
}

.dropdown {
  @apply shadow-lg;
}
```

#### Icon Usage
```typescript
// Icon Sizes
const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8"
};

// Common Icon Patterns
const ButtonIcon = () => (
  <Button>
    <Plus className={cn(iconSizes.sm, "mr-2")} />
    Add New
  </Button>
);

const NavigationIcon = () => (
  <Link className="flex items-center gap-2">
    <Home className={iconSizes.md} />
    Dashboard
  </Link>
);
```

#### Form Validation Patterns
```typescript
// Form Validation Example
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const FormExample = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
```

#### Layout Patterns

##### Page Layout
```typescript
// Standard Page Layout
<div className="min-h-screen bg-white relative">
  {/* Background Image */}
  <div 
    className="absolute inset-0 pointer-events-none opacity-10"
    style={{
      backgroundImage: "url('/Carepro_Background.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  />

  {/* Header */}
  <header className="bg-white/80 border-b relative z-10">
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header content */}
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
    {/* Page content */}
  </main>
</div>
```

##### Sidebar Navigation
```typescript
// Collapsible Sidebar
<div className={cn(
  "fixed inset-y-0 z-40 flex w-64 flex-col transition-transform duration-200",
  !isOpen && "-translate-x-full"
)}>
  <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white px-6">
    {/* Sidebar content */}
  </div>
</div>
```

#### Animation Patterns
```css
/* Transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Transforms */
.transform {
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
```

## System Architecture

### Component Structure
```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── medical-record/
│   │   ├── patient/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── App.tsx
server/
├── routes/
├── db/
└── auth/
shared/
└── schema/
```

### Data Flow
1. User Interface
2. React Components
3. TanStack Query
4. Express Routes
5. Database Operations
6. Response Handling

### Authentication Flow
1. User Login
2. Passport Authentication
3. Session Creation
4. Protected Route Access
5. Session Maintenance

## API Documentation

### Authentication Endpoints
- POST `/api/login`
- POST `/api/logout`
- GET `/api/user`

### Patient Management
- GET `/api/patients`
- POST `/api/patients`
- GET `/api/patients/:id`
- PATCH `/api/patients/:id`

### Medical Records
- GET `/api/medical-records/:patientId`
- POST `/api/medical-records`
- PATCH `/api/medical-records/:id`

### Pharmacovigilance
- POST `/api/pharmacovigilance`
- GET `/api/pharmacovigilance/:patientId`

## Database Schema

### Patients Table
```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  surname TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  is_estimated_dob BOOLEAN DEFAULT FALSE,
  sex TEXT NOT NULL,
  nrc TEXT,
  no_nrc BOOLEAN DEFAULT FALSE,
  under_five_card_number TEXT,
  napsa TEXT,
  country TEXT NOT NULL,
  cellphone TEXT NOT NULL,
  other_cellphone TEXT,
  landline TEXT,
  email TEXT,
  house_number TEXT,
  road_street TEXT,
  area TEXT,
  city_town_village TEXT,
  landmarks TEXT,
  mothers_name TEXT,
  fathers_name TEXT,
  guardian_name TEXT,
  guardian_relationship TEXT,
  marital_status TEXT,
  birth_place TEXT,
  education_level TEXT,
  occupation TEXT,
  facility TEXT NOT NULL,
  registration_date TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);
```

## Security Measures

### Authentication
- Session-based authentication
- Password hashing
- CSRF protection
- Rate limiting

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## Performance Optimizations

### Frontend
- Code splitting
- Lazy loading
- Memoization
- Query caching

### Backend
- Query optimization
- Connection pooling
- Response compression
- Caching strategies

## Deployment

### Environment Variables
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`
- `PORT`

### Build Process
1. TypeScript compilation
2. Asset optimization
3. Bundle generation
4. Environment configuration

## Documentation Maintenance

### Update Process
1. Every new feature addition must include:
   - Technical documentation updates
   - UI/UX pattern documentation if new components are added
   - Schema updates if data structure changes
   - Performance considerations

2. Documentation sections to update:
   - Overview.md: Add feature summary
   - Features.md: Add detailed feature description
   - Technical.md: Add implementation details
   - DataStructure.md: Update schema if needed
   - Performance.md: Add optimization details
   - Usage.md: Add user instructions
   - UserStories.md: Add new user stories
   - BestPractices.md: Add new guidelines if needed

### Review Checklist
Before committing new features:
- [ ] All relevantdocumentation files updated
- [ ] Code examples are current and correct
- [ ] UI/UX patterns documented
- [ ] Schema changes documented
- [ ] Performance impact documented
- [ ] User instructions added
- [ ] Documentation formatting verified

### Version Control
- Documentation version should match application version
- Each release should include documentation updates
- Keep an "as-is" snapshot of documentation with each release
- Mark deprecatedfeatures in documentation

This documentation will be continuously updated as new features are implemented and existing functionality is enhanced.