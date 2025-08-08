# SmartCare PRO - ANC Module Comprehensive Documentation

## Overview

The ANC (Antenatal Care) module is the cornerstone of SmartCare PRO's maternal healthcare capabilities. It provides a complete pregnancy management workflow with integrated assessments, WHO standards compliance, and advanced clinical decision support systems.

**Current Version:** 1.8.3  
**WHO Compliance:** Full WHO ANC guidelines integration  
**Clinical Standards:** Evidence-based care protocols  

## Module Architecture

### Tab-Based Navigation Structure
```
1. Rapid Assessment     → Initial contact and risk evaluation
2. Client Profile       → Always-visible patient information cards  
3. Medical History      → Comprehensive health background
4. Examination          → Physical and fetal assessments
5. Lab Investigations   → HIV testing, POC tests, laboratory work
6. Counselling          → Behavioral counselling and health education
7. Referral             → Component-based 3-card referral system
8. PMTCT                → Maternal HIV management with TPT integration
9. PrEP Assessment      → HIV prevention risk assessment
```

### Component-Based Design
- **ANCCardWrapper** - Consistent blue-bordered styling across all sections
- **LatestEncounterCard** - Dynamic sidebar with section-specific encounter data
- **RecentDataSummaryCard** - Aggregated clinical data summary
- **Modal-Driven Workflows** - All complex interactions use modals for clarity

## Section-by-Section Implementation

### 1. Rapid Assessment
**Purpose:** Initial contact evaluation and pregnancy status assessment

#### Core Components
```typescript
interface RapidAssessmentData {
  contactDate: string;
  gestationalAgeWeeks: number;
  pregnancyStatus: 'confirmed' | 'suspected' | 'not_pregnant';
  riskLevel: 'low' | 'moderate' | 'high';
  dangerSigns: string[];
  emergencyReferralRequired: boolean;
}
```

#### Features
- **Contact Date Recording** - Automatic date capture with manual override
- **Gestational Age Calculation** - LMP-based calculation with ultrasound confirmation
- **Pregnancy Status Confirmation** - Clinical and laboratory confirmation
- **Risk Level Assessment** - Automatic risk stratification based on danger signs
- **Emergency Detection** - Immediate identification of danger signs requiring referral

#### Clinical Decision Support
- Automatic danger sign detection based on WHO criteria
- Risk stratification with color-coded visual indicators
- Emergency referral triggering for critical conditions
- Real-time recommendations based on assessment data

### 2. Client Profile (Always-Visible Cards)
**Purpose:** Comprehensive patient information with permanent visibility

#### Card Structure
```typescript
interface ClientProfileCards {
  clientDetails: {
    registrationDate: string;
    demographics: PatientDemographics;
    contactInformation: ContactInfo;
    identifiers: ZambianIdentifiers;
  };
  currentPregnancy: {
    gravida: number;
    para: number;
    lmp: string;
    edd: string;
    gestationalAge: number;
  };
  obstetricHistory: {
    previousPregnancies: PregnancyHistory[];
    complications: string[];
    deliveryMethods: DeliveryMethod[];
  };
  medicalHistory: {
    chronicConditions: string[];
    allergies: Allergy[];
    currentMedications: Medication[];
    surgicalHistory: Surgery[];
  };
}
```

#### Implementation Features
- **Always-Visible Design** - Cards permanently displayed, no collapsing
- **Professional UI** - Blue-bordered cards with Lucide React icons
- **Comprehensive Data** - All WHO standard data elements included
- **Modal Integration** - Click-to-edit functionality via modals
- **Icon Integration** - Baby, FileText, Heart icons for visual consistency

#### Technical Implementation
```typescript
// Client Profile Card Component
const ClientProfileCard: React.FC<ClientProfileCardProps> = ({ 
  title, 
  icon: Icon, 
  data, 
  onEdit 
}) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-gray-100 p-3 rounded-t-lg">
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
      </CardHeader>
      <CardContent className="p-4">
        {/* Card content based on data type */}
        <ProfileDataDisplay data={data} />
      </CardContent>
    </Card>
  );
};
```

### 3. Medical History
**Purpose:** Comprehensive health background with CDSS integration

#### Data Structure
```typescript
interface MedicalHistoryData {
  previousPregnancies: {
    count: number;
    complications: PregnancyComplication[];
    outcomes: PregnancyOutcome[];
  };
  chronicConditions: {
    diabetes: boolean;
    hypertension: boolean;
    heartDisease: boolean;
    kidneyDisease: boolean;
    other: string[];
  };
  allergies: {
    medications: DrugAllergy[];
    environmental: EnvironmentalAllergy[];
    food: FoodAllergy[];
  };
  surgicalHistory: {
    procedures: Surgery[];
    anesthesiaComplications: boolean;
  };
  familyHistory: {
    geneticConditions: string[];
    pregnancyComplications: string[];
  };
}
```

#### CDSS Integration
- **Form Trigger-based Alerts** - CDSSTriggeredModal opens on completion
- **Risk Factor Analysis** - Automatic risk calculation based on history
- **Evidence-based Recommendations** - WHO guideline-compliant suggestions
- **Clinical Pathway Guidance** - Directed care based on risk factors

### 4. Physical Examination
**Purpose:** Maternal and fetal assessment with WHO standard protocols

#### Examination Components
```typescript
interface ExaminationData {
  maternalAssessment: {
    vitalSigns: VitalSigns;
    physicalExam: PhysicalExamFindings;
    nutritionalAssessment: NutritionalStatus;
  };
  fetalAssessment: {
    fetalHeartRate: number;
    fetalMovements: FetalMovementStatus;
    fetalPosition: FetalPosition;
    estimatedFetalWeight: number;
  };
  whoStandardMeasurements: {
    fundalHeight: number;
    abdominalCircumference: number;
    symphysisFundalHeight: number;
  };
}
```

#### Advanced Features
- **WHO Standard Protocols** - Automated compliance checking
- **Real-time Validation** - Immediate feedback on measurement accuracy
- **Visual Progress Tracking** - Growth charts and trend analysis
- **Automated Calculations** - EFW, growth percentiles, risk scores

### 5. Laboratory Investigations
**Purpose:** Comprehensive testing with automated results processing

#### Test Categories
```typescript
interface LaboratoryData {
  hivTesting: {
    isANCContext: boolean; // Auto-fills from ANC context
    clientType: 'Single adult'; // Auto-populated
    visitType: 'PITC'; // Auto-populated
    servicePoint: 'PMTCT'; // Auto-populated
    source: 'Facility'; // Auto-populated
    reason: 'ANC/Pregnant'; // Auto-populated
    result: HIVTestResult;
  };
  pocTests: {
    hemoglobin: POCTestResult;
    bloodGlucose: POCTestResult;
    urinalysis: POCTestResult;
    syphilisScreening: POCTestResult;
  };
  laboratoryTests: {
    bloodGroup: string;
    rhesusType: string;
    fullBloodCount: FullBloodCountResults;
    liverFunction: LiverFunctionTests;
    renalFunction: RenalFunctionTests;
  };
}
```

#### HIV Testing Integration
**Auto-Prefilling from ANC Context:**
```typescript
// Automatic population when opened from ANC
const hivTestingDefaults = {
  clientType: 'Single adult',
  visitType: 'PITC',
  servicePoint: 'PMTCT',
  source: 'Facility',
  reason: 'ANC/Pregnant'
};

// User can override any prefilled values
const HIVTestingModal: React.FC<HIVTestingModalProps> = ({ 
  isANCContext, 
  onSave 
}) => {
  const defaultValues = isANCContext ? hivTestingDefaults : {};
  
  const form = useForm({
    defaultValues,
    resolver: zodResolver(hivTestingSchema)
  });

  return (
    <Dialog>
      <Form {...form}>
        {/* Clean interface without visual indicators */}
        {/* All fields editable despite prefilling */}
      </Form>
    </Dialog>
  );
};
```

#### POC Tests Integration
- **Immediate Test Ordering** - Direct integration with POC test workflow
- **Results Tracking** - Real-time results entry and validation
- **Clinical Decision Support** - Automated interpretation and recommendations
- **Quality Control** - Built-in QC checks and calibration reminders

### 6. Counselling & Education
**Purpose:** Behavioral counselling with evidence-based recommendations

#### Counselling Categories
```typescript
interface CounsellingData {
  behavioralCounselling: {
    nutritionCounselling: NutritionCounsellingData;
    smokingCessation: SmokingCessationData;
    alcoholReduction: AlcoholReductionData;
    exerciseGuidance: ExerciseGuidanceData;
  };
  healthEducation: {
    prenatalCare: PrenatalCareEducation;
    laborSigns: LaborSignsEducation;
    newbornCare: NewbornCareEducation;
    breastfeeding: BreastfeedingEducation;
  };
  supplementation: {
    ironFolate: SupplementationData;
    calcium: SupplementationData;
    vitamins: SupplementationData;
  };
}
```

#### Evidence-Based Protocols
- **WHO Counselling Guidelines** - Structured counselling protocols
- **Behavioral Change Techniques** - Evidence-based intervention strategies
- **Progress Tracking** - Counselling effectiveness monitoring
- **Follow-up Scheduling** - Automated counselling appointment scheduling

### 7. Referral System (Component-Based Architecture)
**Purpose:** Clean, modal-driven inter-facility patient transfers

#### Three-Card Architecture
```typescript
// Card 1: Referral Reasons
const ReferralReasonsCard: React.FC = () => (
  <Card className="border-2 border-blue-200">
    <CardHeader className="bg-gray-100 p-3 rounded">
      <CardTitle>Referral Reasons</CardTitle>
      <div className="flex space-x-2">
        <Button variant="outline">Edit Record</Button>
        <Button onClick={() => setShowReferralModal(true)}>
          Add Record
        </Button>
      </div>
    </CardHeader>
  </Card>
);

// Card 2: Routine Referral Checklist
const ReferralChecklistCard: React.FC = () => (
  <Card className="border-2 border-blue-200">
    <CardHeader className="bg-gray-100 p-3 rounded">
      <CardTitle>Routine Referral Checklist</CardTitle>
      <div className="flex space-x-2">
        <Button variant="outline">Edit Record</Button>
        <Button onClick={() => setShowReferralModal(true)}>
          Add Record
        </Button>
      </div>
    </CardHeader>
  </Card>
);

// Card 3: Receiving Facility Information
const FacilityInformationCard: React.FC = () => (
  <Card className="border-2 border-blue-200">
    <CardHeader className="bg-gray-100 p-3 rounded">
      <CardTitle>Receiving Facility Information</CardTitle>
      <div className="flex space-x-2">
        <Button variant="outline">Edit Record</Button>
        <Button onClick={() => setShowReferralModal(true)}>
          Add Record
        </Button>
      </div>
    </CardHeader>
  </Card>
);
```

#### Comprehensive Referral Modal
```typescript
interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReferralData) => void;
  initialData: ReferralData;
  dangerSigns: string[];
}

const ReferralModal: React.FC<ReferralModalProps> = ({
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Referral Management</DialogTitle>
        <Form {...form}>
          <ReferralReasonsSection />
          <EmergencyChecklist />
          <FacilitySelector />
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

#### Advanced Components
- **ReferralModal** - Comprehensive referral workflow with React Hook Form
- **FacilitySelector** - Dynamic facility selection with search and filtering
- **EmergencyChecklist** - Context-aware emergency procedure validation (16 steps)
- **Bi-directional Sync** - Automatic sync between Danger Signs and Emergency Referral

### 8. PMTCT Integration
**Purpose:** Maternal HIV management with comprehensive WHO standards

#### PMTCT Components
```typescript
interface PMTCTData {
  hivCareEnrollment: {
    transferIn: boolean;
    originFacility: string;
    artNumber: string;
    enrollmentDate: string;
  };
  artHistory: {
    artStatus: 'already_on_art' | 'newly_on_art' | 'not_on_art';
    startType: 'first_time' | 'restarting';
    priorARVExposure: boolean;
    regimenHistory: ARVRegimen[];
  };
  whoStaging: {
    stage: 1 | 2 | 3 | 4;
    stageConditions: WHOStageCondition[];
    symptomChecklist: string[];
  };
  comorbiditiesCoinfections: {
    opportunisticInfections: string[];
    seriousIllnessSigns: string[];
    coinfections: string[];
  };
  tptIntegration: TPTData;
}
```

#### TPT (TB Preventive Treatment) Integration
```typescript
interface TPTData {
  tbScreening: {
    symptoms: {
      cough: boolean;
      fever: boolean;
      nightSweats: boolean;
      weightLoss: boolean;
    };
    screeningResult: 'negative' | 'positive';
  };
  tptStatus: {
    status: 'not_started' | 'on_tpt' | 'on_hold' | 'completed';
    regimen: '3HP' | '1HP' | '6H' | 'levofloxacin' | 'other';
    startDate: string;
    endDate?: string;
  };
  cReactiveProtein: {
    testDate: string;
    result: number;
    interpretation: 'normal' | 'elevated';
  };
}
```

#### Workflow Logic
- **Automatic Triggering** - PMTCT tab opens when HIV test result is positive
- **Progressive Disclosure** - Form sections appear based on selections
- **TPT Integration** - TB Preventive Treatment within unified PMTCT workflow
- **WHO Compliance** - Full WHO HIV.E-F standard data elements

### 9. PrEP Assessment Integration
**Purpose:** HIV prevention protocols with 20-point risk scoring

#### Risk Assessment Algorithm
```typescript
interface PrEPRiskFactors {
  clientRiskFactors: {
    inconsistentCondomUse: number; // 2 points
    multiplePartners: number; // 2 points
    recentSTI: number; // 3 points
  };
  partnerRiskFactors: {
    notOnART: number; // 3 points
    detectableViralLoad: number; // 3 points
    multiplePartners: number; // 2 points
    injectionDrugUse: number; // 3 points
  };
  pregnancyModifiers: {
    trimesterAssessment: number; // 1 point for 2nd/3rd
    breastfeedingPlans: number; // 1 point for yes
  };
}

// Risk Thresholds
const riskThresholds = {
  low: { min: 0, max: 4 },
  moderate: { min: 5, max: 9 },
  high: { min: 10, max: 20 }
};
```

#### Advanced Workflows
- **Progressive Disclosure** - Section visibility based on client responses
- **Auto-Opening Modals** - Completion-based eligibility recommendations
- **Zambian Clinical Guidelines 2023** - Compliant PrEP regimens and dosing
- **POC Tests Integration** - Immediate test ordering from eligibility assessment

## Advanced Features

### Dynamic Alert Modal System
```typescript
// Real-time clinical decision support
interface CDSSAlert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  recommendations: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  references: string[];
}

// React Portal rendering for high-priority alerts
const CDSSAlertPortal: React.FC<{ alert: CDSSAlert }> = ({ alert }) => {
  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <CDSSAlertModal alert={alert} />
      </div>
    </div>,
    document.body
  );
};
```

### Latest Encounter and Data Summary
```typescript
// Dynamic sidebar with section-specific data
interface LatestEncounterData {
  rapidAssessment: {
    contactDate: string;
    gestationalAge: string;
    pregnancyStatus: string;
    riskLevel: string;
  };
  clientProfile: {
    registrationDate: string;
    age: string;
    gravida: string;
    para: string;
  };
  // ... data for all 9 sections
}

// Responsive three-column layout
const ANCLayout: React.FC = () => (
  <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
    <div className="w-full lg:w-80 order-2 lg:order-1">
      <LatestEncounterCard data={latestEncounterData} />
    </div>
    <div className="flex-1 order-1 lg:order-2">
      <ANCTabsContent />
    </div>
    <div className="w-full lg:w-80 order-3">
      <RecentDataSummaryCard data={recentDataSummary} />
    </div>
  </div>
);
```

### Form Trigger-Based CDSS
```typescript
// Completion-based modal triggers
const useCDSSTriggering = (formData: FormData, section: ANCSection) => {
  const [showCDSSModal, setShowCDSSModal] = useState(false);
  const [cdssAlert, setCDSSAlert] = useState<CDSSAlert | null>(null);

  useEffect(() => {
    const completionRate = calculateCompletionRate(formData);
    
    if (completionRate >= 0.8) { // 80% completion threshold
      const recommendations = evaluateCDSSRules(formData, section);
      
      if (recommendations.length > 0) {
        setCDSSAlert({
          type: 'warning',
          title: 'Clinical Decision Support',
          recommendations,
          evidenceLevel: 'A'
        });
        setShowCDSSModal(true);
      }
    }
  }, [formData, section]);

  return { showCDSSModal, cdssAlert, setShowCDSSModal };
};
```

## Data Persistence and Integration

### Database Schema
```sql
-- ANC Records Table
CREATE TABLE anc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  visit_date DATE NOT NULL,
  gestational_age INTEGER,
  rapid_assessment_data JSONB,
  client_profile_data JSONB,
  medical_history_data JSONB,
  examination_data JSONB,
  laboratory_data JSONB,
  counselling_data JSONB,
  referral_data JSONB,
  pmtct_data JSONB,
  prep_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row-Level Security
CREATE POLICY anc_facility_isolation ON anc_records
  FOR ALL TO authenticated
  USING (facility_id = current_setting('app.current_facility_id')::uuid);
```

### API Integration
```typescript
// RESTful API endpoints
const ancAPI = {
  getRecord: (patientId: string, recordId: string) =>
    apiRequest.get(`/api/patients/${patientId}/anc/records/${recordId}`),
    
  createRecord: (patientId: string, data: ANCRecordData) =>
    apiRequest.post(`/api/patients/${patientId}/anc/records`, data),
    
  updateRecord: (patientId: string, recordId: string, data: Partial<ANCRecordData>) =>
    apiRequest.put(`/api/patients/${patientId}/anc/records/${recordId}`, data),
    
  getRecordHistory: (patientId: string) =>
    apiRequest.get(`/api/patients/${patientId}/anc/records`)
};
```

## Performance Optimization

### Component Memoization
```typescript
// Optimized ANC section rendering
const ANCSection = React.memo<ANCSectionProps>(({ 
  data, 
  onSave, 
  isActive 
}) => {
  const memoizedData = useMemo(() => 
    processANCData(data), 
    [data.lastModified, data.id]
  );
  
  const debouncedSave = useCallback(
    debounce((formData: ANCFormData) => onSave(formData), 500),
    [onSave]
  );
  
  // Only render if section is active for performance
  if (!isActive) return null;
  
  return <SectionContent data={memoizedData} onSave={debouncedSave} />;
});
```

### Data Caching Strategy
```typescript
// React Query optimization for ANC data
const useANCRecord = (patientId: string, recordId: string) => {
  return useQuery({
    queryKey: ['anc', patientId, recordId],
    queryFn: () => ancAPI.getRecord(patientId, recordId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!patientId && !!recordId
  });
};
```

This comprehensive ANC module documentation provides complete technical implementation details, clinical workflows, and architectural patterns for optimal maternal healthcare delivery in Zambian healthcare facilities.