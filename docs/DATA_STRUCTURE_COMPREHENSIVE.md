# SmartCare PRO - Comprehensive Data Structure Documentation

## Overview

SmartCare PRO employs a sophisticated data architecture designed for healthcare environments, featuring PostgreSQL with Row-Level Security, Drizzle ORM for type-safe operations, and comprehensive data models supporting all clinical modules.

**Database:** PostgreSQL 16 with advanced features  
**ORM:** Drizzle ORM with TypeScript integration  
**Security:** Row-Level Security (RLS) for facility-based isolation  
**Migration Strategy:** `npm run db:push` for schema updates  

## Core Database Architecture

### Primary Tables Schema

#### Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  nrc VARCHAR(50) UNIQUE, -- National Registration Card
  nupin VARCHAR(50) UNIQUE, -- National Unique Patient Identifier
  art_number VARCHAR(50), -- ART Number for HIV patients
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  phone_number VARCHAR(20),
  address TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_patients_facility_search ON patients(facility_id, first_name, last_name);
CREATE INDEX idx_patients_identifiers ON patients(nrc, nupin, art_number);
CREATE INDEX idx_patients_active ON patients(facility_id, created_at) WHERE deleted_at IS NULL;

-- Row-Level Security
CREATE POLICY patients_facility_isolation ON patients
  FOR ALL TO authenticated
  USING (facility_id = current_setting('app.current_facility_id')::uuid);
```

#### Facilities Table
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'hospital', 'clinic', 'health_center'
  level VARCHAR(20) NOT NULL, -- 'primary', 'secondary', 'tertiary'
  province VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  address TEXT,
  phone_number VARCHAR(20),
  email VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Geographic and search indexes
CREATE INDEX idx_facilities_location ON facilities(province, district);
CREATE INDEX idx_facilities_type_level ON facilities(type, level);
CREATE INDEX idx_facilities_active ON facilities(is_active, name);
```

### ANC Module Data Structures

#### ANC Records Table
```sql
CREATE TABLE anc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id),
  visit_date DATE NOT NULL,
  gestational_age INTEGER, -- weeks
  visit_number INTEGER DEFAULT 1,
  
  -- Rapid Assessment Data
  rapid_assessment_data JSONB DEFAULT '{}',
  
  -- Client Profile Data (always-visible cards)
  client_profile_data JSONB DEFAULT '{
    "client_details": {},
    "current_pregnancy": {},
    "obstetric_history": {},
    "medical_history": {}
  }',
  
  -- Medical History Data
  medical_history_data JSONB DEFAULT '{
    "previous_pregnancies": [],
    "chronic_conditions": [],
    "allergies": [],
    "surgical_history": [],
    "family_history": {}
  }',
  
  -- Examination Data
  examination_data JSONB DEFAULT '{
    "maternal_assessment": {
      "vital_signs": {},
      "physical_exam": {},
      "nutritional_assessment": {}
    },
    "fetal_assessment": {
      "fetal_heart_rate": null,
      "fetal_movements": null,
      "fetal_position": null,
      "estimated_fetal_weight": null
    },
    "who_measurements": {}
  }',
  
  -- Laboratory Data
  laboratory_data JSONB DEFAULT '{
    "hiv_testing": {
      "isANCContext": true,
      "clientType": "Single adult",
      "visitType": "PITC",
      "servicePoint": "PMTCT",
      "source": "Facility",
      "reason": "ANC/Pregnant"
    },
    "poc_tests": {},
    "laboratory_tests": {}
  }',
  
  -- Counselling Data
  counselling_data JSONB DEFAULT '{
    "behavioral_counselling": {},
    "health_education": {},
    "supplementation": {}
  }',
  
  -- Referral Data (component-based)
  referral_data JSONB DEFAULT '{
    "referral_reasons": [],
    "emergency_checklist": {},
    "facility_information": {},
    "danger_signs_sync": []
  }',
  
  -- PMTCT Data with TPT Integration
  pmtct_data JSONB DEFAULT '{
    "hiv_care_enrollment": {},
    "art_history": {},
    "who_staging": {},
    "comorbidities_coinfections": {},
    "tpt_data": {
      "tb_screening": {},
      "tpt_status": {},
      "c_reactive_protein": {}
    }
  }',
  
  -- PrEP Assessment Data
  prep_data JSONB DEFAULT '{
    "risk_assessment": {
      "client_risk_factors": {},
      "partner_risk_factors": {},
      "pregnancy_modifiers": {}
    },
    "eligibility_assessment": {
      "risk_reduction_counseling": {},
      "client_interest": {},
      "followup_planning": {},
      "acute_hiv_assessment": {},
      "medical_history_assessment": {},
      "clinical_safety_assessment": {}
    },
    "prescription_data": {}
  }',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_anc_records_patient_date ON anc_records(patient_id, visit_date DESC);
CREATE INDEX idx_anc_records_facility ON anc_records(facility_id, visit_date DESC);

-- JSONB indexes for clinical data queries
CREATE INDEX idx_anc_hiv_status ON anc_records USING GIN ((laboratory_data->'hiv_testing'));
CREATE INDEX idx_anc_danger_signs ON anc_records USING GIN ((rapid_assessment_data->'danger_signs'));
CREATE INDEX idx_anc_pmtct_status ON anc_records USING GIN ((pmtct_data->'art_history'));

-- Row-Level Security
CREATE POLICY anc_records_facility_isolation ON anc_records
  FOR ALL TO authenticated
  USING (facility_id = current_setting('app.current_facility_id')::uuid);
```

### TypeScript Data Models

#### Core Patient Interface
```typescript
// Drizzle Schema Definition
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
  emergencyContactName: varchar('emergency_contact_name', { length: 100 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at')
});

// TypeScript Interfaces
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

// Zod Schemas for Validation
export const patientSchema = createSelectSchema(patients);
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

export type PatientFormData = z.infer<typeof insertPatientSchema>;
```

#### ANC Record Data Models
```typescript
// ANC Record Schema
export const ancRecords = pgTable('anc_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id),
  visitDate: date('visit_date').notNull(),
  gestationalAge: integer('gestational_age'),
  visitNumber: integer('visit_number').default(1),
  rapidAssessmentData: jsonb('rapid_assessment_data').default('{}'),
  clientProfileData: jsonb('client_profile_data').default('{}'),
  medicalHistoryData: jsonb('medical_history_data').default('{}'),
  examinationData: jsonb('examination_data').default('{}'),
  laboratoryData: jsonb('laboratory_data').default('{}'),
  counsellingData: jsonb('counselling_data').default('{}'),
  referralData: jsonb('referral_data').default('{}'),
  pmtctData: jsonb('pmtct_data').default('{}'),
  prepData: jsonb('prep_data').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Comprehensive TypeScript Interfaces
interface RapidAssessmentData {
  contactDate: string;
  gestationalAgeWeeks: number;
  pregnancyStatus: 'confirmed' | 'suspected' | 'not_pregnant';
  riskLevel: 'low' | 'moderate' | 'high';
  dangerSigns: string[];
  emergencyReferralRequired: boolean;
  vitalSigns: {
    bloodPressure: { systolic: number; diastolic: number };
    temperature: number;
    pulse: number;
    respiratoryRate: number;
  };
}

interface ClientProfileData {
  clientDetails: {
    registrationDate: string;
    age: number;
    maritalStatus: string;
    education: string;
    occupation: string;
    religion: string;
  };
  currentPregnancy: {
    gravida: number;
    para: number;
    lmp: string; // Last Menstrual Period
    edd: string; // Expected Date of Delivery
    gestationalAge: number;
    pregnancyPlanned: boolean;
  };
  obstetricHistory: {
    previousPregnancies: Array<{
      year: number;
      outcome: 'live_birth' | 'stillbirth' | 'abortion' | 'miscarriage';
      complications: string[];
      deliveryMethod: 'vaginal' | 'cesarean';
      birthWeight: number;
    }>;
    complications: string[];
    cesareanHistory: boolean;
  };
  medicalHistory: {
    chronicConditions: string[];
    allergies: Array<{
      type: 'medication' | 'food' | 'environmental';
      allergen: string;
      reaction: string;
    }>;
    currentMedications: Array<{
      name: string;
      dose: string;
      frequency: string;
      indication: string;
    }>;
    surgicalHistory: Array<{
      procedure: string;
      date: string;
      complications: string[];
    }>;
  };
}

interface LaboratoryData {
  hivTesting: {
    isANCContext: boolean;
    clientType: string; // Auto-filled: "Single adult"
    visitType: string; // Auto-filled: "PITC"
    servicePoint: string; // Auto-filled: "PMTCT"
    source: string; // Auto-filled: "Facility"
    reason: string; // Auto-filled: "ANC/Pregnant"
    testDate: string;
    result: 'reactive' | 'non_reactive' | 'indeterminate';
    confirmationTest: boolean;
    counselingProvided: boolean;
  };
  pocTests: {
    hemoglobin: {
      result: number;
      unit: 'g/dL';
      interpretation: 'normal' | 'mild_anemia' | 'moderate_anemia' | 'severe_anemia';
    };
    bloodGlucose: {
      result: number;
      unit: 'mg/dL';
      fastingStatus: boolean;
      interpretation: 'normal' | 'impaired' | 'diabetic';
    };
    urinalysis: {
      protein: 'negative' | 'trace' | '1+' | '2+' | '3+' | '4+';
      glucose: 'negative' | 'positive';
      ketones: 'negative' | 'positive';
      nitrites: 'negative' | 'positive';
      leukocytes: 'negative' | 'positive';
    };
  };
  laboratoryTests: {
    bloodGroup: 'A' | 'B' | 'AB' | 'O';
    rhesusType: 'positive' | 'negative';
    fullBloodCount: {
      hemoglobin: number;
      hematocrit: number;
      whiteBloodCells: number;
      platelets: number;
    };
    syphilisScreening: {
      result: 'reactive' | 'non_reactive';
      confirmationTest: boolean;
    };
  };
}

interface ReferralData {
  referralReasons: Array<{
    type: 'emergency' | 'routine';
    reason: string;
    description: string;
    urgency: 'immediate' | 'within_24h' | 'within_week';
  }>;
  emergencyChecklist: {
    steps: Array<{
      id: string;
      description: string;
      completed: boolean;
      completedBy: string;
      completedAt: string;
    }>;
    allStepsCompleted: boolean;
  };
  facilityInformation: {
    receivingFacilityId: string;
    receivingFacilityName: string;
    contactPerson: string;
    contactPhone: string;
    expectedArrival: string;
    transportArranged: boolean;
    referralLetterSent: boolean;
  };
  dangerSignsSync: string[]; // Synced from danger signs assessment
}

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
    currentRegimen: string;
    regimenStartDate: string;
    adherenceLevel: 'good' | 'fair' | 'poor';
  };
  whoStaging: {
    stage: 1 | 2 | 3 | 4;
    stageConditions: string[];
    symptomChecklist: Array<{
      symptom: string;
      present: boolean;
    }>;
    stagingDate: string;
  };
  comorbiditiesCoinfections: {
    opportunisticInfections: string[];
    seriousIllnessSigns: string[];
    coinfections: Array<{
      infection: string;
      status: 'active' | 'treated' | 'chronic';
      treatment: string;
    }>;
  };
  tptData: {
    tbScreening: {
      symptoms: {
        cough: boolean;
        fever: boolean;
        nightSweats: boolean;
        weightLoss: boolean;
      };
      screeningResult: 'negative' | 'positive';
      screeningDate: string;
    };
    tptStatus: {
      status: 'not_started' | 'on_tpt' | 'on_hold' | 'completed';
      regimen: '3HP' | '1HP' | '6H' | 'levofloxacin' | 'other';
      startDate?: string;
      endDate?: string;
      sideEffects: string[];
    };
    cReactiveProtein: {
      testDate: string;
      result: number;
      unit: 'mg/L';
      interpretation: 'normal' | 'elevated';
    };
  };
}

interface PrEPAssessmentData {
  riskAssessment: {
    clientRiskFactors: {
      inconsistentCondomUse: { present: boolean; points: number };
      multiplePartners: { present: boolean; points: number };
      recentSTI: { present: boolean; points: number };
    };
    partnerRiskFactors: {
      notOnART: { present: boolean; points: number };
      detectableViralLoad: { present: boolean; points: number };
      multiplePartners: { present: boolean; points: number };
      injectionDrugUse: { present: boolean; points: number };
    };
    pregnancyModifiers: {
      trimesterAssessment: { trimester: 1 | 2 | 3; points: number };
      breastfeedingPlans: { planning: boolean; points: number };
    };
    totalRiskScore: number;
    riskLevel: 'low' | 'moderate' | 'high';
  };
  eligibilityAssessment: {
    riskReductionCounseling: {
      counselingProvided: boolean;
      topics: string[];
      clientUnderstanding: 'good' | 'fair' | 'poor';
    };
    clientInterest: {
      interestedInPrEP: boolean;
      reasonsForInterest: string[];
      reasonsAgainstInterest: string[];
    };
    followupPlanning: {
      nextAppointment: string;
      followupType: 'counseling' | 'assessment' | 'prescription';
      interventions: string[];
    };
    acuteHIVAssessment: {
      symptoms: string[];
      riskExposure: boolean;
      testingRecommended: boolean;
    };
    medicalHistoryAssessment: {
      contraindications: string[];
      drugInteractions: string[];
      renalFunction: 'normal' | 'impaired';
      hepatitisStatus: string;
    };
    clinicalSafetyAssessment: {
      baselineTests: Array<{
        test: string;
        required: boolean;
        completed: boolean;
        result?: string;
      }>;
      eligibilityStatus: 'eligible' | 'not_eligible' | 'defer';
      clinicalDecision: string;
    };
  };
  prescriptionData: {
    regimen: 'TDF/FTC 300/200mg' | 'TDF/3TC 300/300mg' | 'CAB-LA';
    dose: string;
    frequency: string;
    duration: string;
    safetyNotes: string[];
    populationGuidance: string;
    guidelineReference: string;
  };
}
```

### Specialized Data Structures

#### Facility and Geographic Data
```sql
-- Comprehensive facility data for Zambia's 3,600+ facilities
CREATE TABLE facilities_extended (
  id UUID PRIMARY KEY REFERENCES facilities(id),
  facility_code_hmis VARCHAR(20), -- HMIS facility code
  facility_code_smartcare VARCHAR(20), -- SmartCare facility code
  parent_facility_id UUID REFERENCES facilities(id),
  catchment_population INTEGER,
  bed_capacity INTEGER,
  staff_count INTEGER,
  services_offered TEXT[], -- Array of services
  operating_hours JSONB, -- Operating schedule
  coordinates GEOGRAPHY(POINT, 4326), -- PostGIS geography type
  accessibility_features TEXT[], -- Accessibility information
  last_supervision_date DATE,
  accreditation_status VARCHAR(50),
  accreditation_expiry DATE
);

-- Geographic hierarchy for Zambia
CREATE TABLE geographic_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'country', 'province', 'district', 'constituency', 'ward'
  code VARCHAR(20) UNIQUE,
  parent_id UUID REFERENCES geographic_regions(id),
  population INTEGER,
  area_sq_km DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Clinical Decision Support Data
```sql
CREATE TABLE cdss_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(200) NOT NULL,
  module VARCHAR(50) NOT NULL, -- 'anc', 'prep', 'pmtct', 'pharmacy'
  category VARCHAR(20) NOT NULL, -- 'emergency', 'warning', 'recommendation', 'info'
  condition_expression TEXT NOT NULL, -- JSON logic expression
  recommendation_data JSONB NOT NULL,
  priority INTEGER DEFAULT 100,
  evidence_level VARCHAR(1) CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  references TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cdss_alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  rule_id UUID NOT NULL REFERENCES cdss_rules(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL,
  alert_data JSONB NOT NULL,
  user_response VARCHAR(20), -- 'accepted', 'overridden', 'dismissed'
  response_reason TEXT,
  triggered_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);
```

#### Audit and Security Tables
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'SELECT'
  old_values JSONB,
  new_values JSONB,
  user_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_facility_date ON audit_logs(facility_id, created_at DESC);

-- User sessions for security
CREATE TABLE user_sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL,
  user_id UUID,
  facility_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_expire ON user_sessions(expire);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
```

### Performance Optimization Structures

#### Database Indexing Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_patients_facility_active_search 
ON patients(facility_id, deleted_at) 
INCLUDE (first_name, last_name, nrc, nupin)
WHERE deleted_at IS NULL;

-- Partial indexes for active records
CREATE INDEX idx_anc_records_recent_visits
ON anc_records(patient_id, visit_date DESC)
WHERE visit_date >= CURRENT_DATE - INTERVAL '1 year';

-- JSONB GIN indexes for clinical data queries
CREATE INDEX idx_anc_laboratory_results 
ON anc_records USING GIN (laboratory_data);

CREATE INDEX idx_anc_danger_signs_assessment 
ON anc_records USING GIN ((rapid_assessment_data->'danger_signs'));

-- Function-based indexes for computed values
CREATE INDEX idx_anc_gestational_age_computed
ON anc_records((gestational_age + EXTRACT(days FROM (CURRENT_DATE - visit_date))/7))
WHERE gestational_age IS NOT NULL;
```

#### Materialized Views for Reporting
```sql
-- Patient summary view
CREATE MATERIALIZED VIEW patient_summary AS
SELECT 
  p.id,
  p.facility_id,
  p.first_name,
  p.last_name,
  p.nrc,
  p.nupin,
  p.art_number,
  p.date_of_birth,
  EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
  p.gender,
  COUNT(anc.id) as anc_visits,
  MAX(anc.visit_date) as last_anc_visit,
  MAX(anc.gestational_age) as current_gestational_age,
  (anc.laboratory_data->'hiv_testing'->>'result') as hiv_status,
  p.created_at
FROM patients p
LEFT JOIN anc_records anc ON p.id = anc.patient_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.facility_id, p.first_name, p.last_name, p.nrc, p.nupin, 
         p.art_number, p.date_of_birth, p.gender, 
         (anc.laboratory_data->'hiv_testing'->>'result'), p.created_at;

-- Refresh materialized view daily
CREATE INDEX idx_patient_summary_facility ON patient_summary(facility_id);
CREATE INDEX idx_patient_summary_hiv ON patient_summary(hiv_status) WHERE hiv_status IS NOT NULL;

-- Facility performance metrics view
CREATE MATERIALIZED VIEW facility_metrics AS
SELECT 
  f.id as facility_id,
  f.name as facility_name,
  f.type as facility_type,
  f.level as facility_level,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(DISTINCT anc.id) as total_anc_visits,
  COUNT(DISTINCT CASE WHEN anc.visit_date >= CURRENT_DATE - INTERVAL '30 days' 
                      THEN anc.id END) as recent_anc_visits,
  AVG(anc.gestational_age) as avg_gestational_age_at_visit,
  COUNT(DISTINCT CASE WHEN (anc.laboratory_data->'hiv_testing'->>'result') = 'reactive' 
                      THEN p.id END) as hiv_positive_patients,
  COUNT(DISTINCT CASE WHEN anc.pmtct_data IS NOT NULL AND anc.pmtct_data != '{}' 
                      THEN p.id END) as pmtct_enrolled_patients
FROM facilities f
LEFT JOIN patients p ON f.id = p.facility_id AND p.deleted_at IS NULL
LEFT JOIN anc_records anc ON p.id = anc.patient_id
WHERE f.is_active = true
GROUP BY f.id, f.name, f.type, f.level;

CREATE INDEX idx_facility_metrics_type_level ON facility_metrics(facility_type, facility_level);
```

### Data Validation and Constraints

#### Advanced Validation Rules
```sql
-- Custom validation functions
CREATE OR REPLACE FUNCTION validate_nrc(nrc_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Zambian NRC format: XXXXXX/XX/X
  RETURN nrc_value ~ '^\d{6}/\d{2}/\d$';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_gestational_age(ga INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  -- Gestational age must be between 4 and 44 weeks
  RETURN ga >= 4 AND ga <= 44;
END;
$$ LANGUAGE plpgsql;

-- Apply validation constraints
ALTER TABLE patients 
ADD CONSTRAINT chk_nrc_format 
CHECK (nrc IS NULL OR validate_nrc(nrc));

ALTER TABLE anc_records 
ADD CONSTRAINT chk_gestational_age_range 
CHECK (gestational_age IS NULL OR validate_gestational_age(gestational_age));

-- JSONB validation for clinical data
CREATE OR REPLACE FUNCTION validate_vital_signs(vs JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (vs->'blood_pressure'->>'systolic')::INTEGER BETWEEN 60 AND 250 AND
    (vs->'blood_pressure'->>'diastolic')::INTEGER BETWEEN 40 AND 150 AND
    (vs->>'temperature')::DECIMAL BETWEEN 35.0 AND 42.0 AND
    (vs->>'pulse')::INTEGER BETWEEN 40 AND 200
  );
END;
$$ LANGUAGE plpgsql;
```

#### Data Integrity Triggers
```sql
-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_update_timestamp
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER anc_records_update_timestamp
  BEFORE UPDATE ON anc_records
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Audit logging trigger
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name, record_id, action, old_values, new_values,
    user_id, facility_id, ip_address, session_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    current_setting('app.current_user_id', true)::UUID,
    current_setting('app.current_facility_id', true)::UUID,
    inet_client_addr(),
    current_setting('app.session_id', true)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_anc_records
  AFTER INSERT OR UPDATE OR DELETE ON anc_records
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
```

This comprehensive data structure documentation provides complete implementation details for SmartCare PRO's database architecture, ensuring robust, secure, and performant healthcare data management for Zambian healthcare facilities.