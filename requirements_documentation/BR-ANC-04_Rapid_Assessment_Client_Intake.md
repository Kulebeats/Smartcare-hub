# [BR-ANC-04] Rapid Assessment Client Intake

## Epic Link
ANC-CLIENT-INTAKE-OPTIMIZATION-2025

## Module
ANC

## Sequence
04 (Foundation)

## Priority
**Critical** — Essential foundational requirement for antenatal care delivery, ensuring comprehensive client data capture for clinical decision support, risk stratification, and continuity of care across healthcare facilities.

## Dependencies
**Depends On**: None (foundational primitive)  
**Enables**: [BR-ANC-01] PrEP Risk Assessment Foundation, [BR-ANC-05] Obstetric History Assessment, [BR-ANC-09] Clinical Examination Workflow, [BR-ANC-10] Laboratory Integration

## User Story

### 1. Title
Comprehensive Rapid Client Intake Assessment with Intelligent Triage and Data Quality Management

### 2. User Story
**As a** healthcare provider initiating antenatal care for new clients,  
**I want** a rapid assessment tool with comprehensive client details capture, intelligent data validation, and efficient triage capabilities,  
**So that** I can establish complete patient profiles within 10 minutes, identify immediate clinical priorities, and initiate appropriate care pathways with accurate demographic and clinical baseline data.

### 3. Acceptance Criteria
| # | Given | When | Then |
|---|-------|------|------|
| 1 | The provider accesses patient registration interface with searchParams state management | They click "Add New Patient" or navigate to registration route | Client registration form opens with multi-section layout (emergency triage, demographics, vital signs, medical history), form validation through patientSchema, and real-time data quality assessment |
| 2 | The provider enters blood pressure ≥160/110 mmHg in vital signs section | They input systolic ≥160 OR diastolic ≥110 triggering validateVitalSigns() | System immediately executes triggerEmergencyAlert(), displays emergency banner with "SEVERE HYPERTENSION - IMMEDIATE CLINICAL ATTENTION REQUIRED", updates patient priority to "Emergency", and generates clinical recommendations |
| 3 | The provider enters NRC in format 123456/78/9 using validateZambianNRC() | They complete the National Registration Card field with proper formatting | System validates format using Zambian NRC pattern (/^\d{6}\/\d{2}\/\d$/), calculates age from birth year through extractAgeFromNRC(), shows validation status with checkmark/error indicator, and auto-populates demographic fields |
| 4 | The provider completes gestational age calculation with LMP date or weeks | They enter last_menstrual_period or gestational_weeks triggering calculateGestationalAge() | System calculates current gestational age using date arithmetic, determines trimester classification (first: <14 weeks, second: 14-27, third: >27), validates date reasonableness (not future, not >45 weeks ago), and updates clinical risk factors |
| 5 | The provider completes all required registration fields across sections | Demographic, contact, emergency, and clinical baseline data passes comprehensive validation | System calculates completionScore through getRegistrationCompletion(), validates required fields using patientSchema, enables "Save Patient" action, and assigns priority classification (Emergency/Urgent/High/Routine) using triagePriority algorithm |
| 6 | Provider enters temperature ≥38.5°C or other emergency vital signs | They complete vital signs with fever threshold exceeded | validateVitalSigns() triggers temperature alert, generateEmergencyProtocol() provides fever management guidance, updates patient status to urgent care required, and includes temperature monitoring in clinical recommendations |
| 7 | Provider completes phone number with Zambian format validation | They enter phone starting with provider codes (095, 096, 097, 076, 077) | validateZambianPhone() executes format validation, detectPhoneProvider() identifies network (MTN, Airtel, Zamtel), stores normalized format, and validates active number patterns for clinical communication |
| 8 | Provider selects high-risk medical history factors | They indicate diabetes, hypertension, HIV+ status, or previous pregnancy complications | calculateClinicalRiskFactors() assigns risk weights, updateTriagePriority() elevates patient priority, generateRiskAssessment() provides clinical guidance, and includes relevant monitoring protocols in care plan |
| 9 | Provider attempts to save incomplete registration with missing mandatory fields | Form submission with getRegistrationCompletion().isComplete = false | System prevents save operation, showFieldValidationErrors() highlights missing required fields, displays completion percentage, provides field-by-field guidance, and maintains form state for completion |
| 10 | Registration completes successfully with comprehensive data quality validation | All mandatory fields completed and pass patientSchema validation | System executes savePatientRecord(), generates unique patient identifier, creates initial ANC record, assigns facility context, stores audit trail, and provides confirmation with next steps guidance including ANC scheduling |


### 4. Functional Requirements
| # | Requirement Description |
|---|-------------------------|
| FR1 | System shall provide comprehensive rapid triage assessment through emergency_conditions array screening, vital signs capture with validateVitalSigns(), immediate clinical priority assignment through calculateTriagePriority(), and real-time emergency condition detection with appropriate clinical alerts |
| FR2 | System shall implement real-time vital signs validation with emergency threshold monitoring: BP ≥160/110 mmHg (triggerHypertensionAlert), temperature ≥38.5°C (triggerFeverAlert), pulse <60 or >120 bpm (triggerCardiacAlert), respiratory rate <12 or >24 (triggerRespiratoryAlert), with immediate clinical guidance generation |
| FR3 | System shall validate Zambian data formats through validateZambianNRC() for NRC pattern (/^\d{6}\/\d{2}\/\d$/), validateZambianPhone() for mobile numbers with provider detection (095/096/097 Airtel, 076/077 MTN, 075 Zamtel), extractAgeFromNRC() for demographic auto-population, and proper data normalization |
| FR4 | System shall calculate gestational age through calculateGestationalAge() using LMP date or current gestational weeks, determine trimester classification (first: <14 weeks, second: 14-27, third: >27), validate date reasonableness (not future, not >280 days), and integrate with clinical risk assessment for pregnancy-specific protocols |
| FR5 | System shall capture comprehensive demographics including personal information (first_name, last_name, date_of_birth), contact details (phone_number, address, emergency_contact), socioeconomic factors (occupation, education_level, insurance_status), and Zambian-specific identifiers (NRC, district, province) with proper validation |
| FR6 | System shall assess medical history through structured data capture including chronic conditions (diabetes, hypertension, HIV_status), obstetric history (previous_pregnancies, pregnancy_complications, delivery_history), family history, current medications, allergies, and risk factor weighting through calculateClinicalRiskFactors() |
| FR7 | System shall implement progressive data capture workflow with section-based navigation (Emergency Triage → Demographics → Medical History → Vital Signs → Clinical Assessment), section completion tracking through getRegistrationCompletion(), conditional field visibility, and seamless flow between sections with data preservation |
| FR8 | System shall provide comprehensive data quality scoring through getRegistrationCompletion() calculating completeness percentage, validateRequiredFields() for mandatory field checking, showDataQualityRecommendations() for improvement guidance, and real-time completion indicators with visual progress tracking |
| FR9 | System shall generate clinical priority classification through calculateTriagePriority() algorithm considering emergency conditions (Emergency), vital signs thresholds (Urgent), high-risk medical history (High), and routine cases (Routine), with automatic triage assignment and clinical workflow routing |
| FR10 | System shall implement emergency protocol activation through triggerEmergencyAlert() for critical vital signs, generateEmergencyProtocol() for clinical guidance, immediate provider notifications, automated clinical decision support, and proper escalation procedures for life-threatening conditions |
| FR11 | System shall provide Zambian healthcare compliance through facility assignment, district health system integration, proper patient identifier generation, ANC registration number creation, and alignment with Ministry of Health data standards and reporting requirements |
| FR12 | System shall execute comprehensive form validation through patientSchema Zod validation, real-time field validation feedback, conditional validation based on section visibility, comprehensive error handling with specific field guidance, and prevention of incomplete submissions |
| FR13 | System shall maintain registration audit trail through patient registration logging, timestamp tracking for each section completion, user attribution, data change history, facility context recording, and comprehensive compliance documentation for healthcare regulatory requirements |
| FR14 | System shall provide seamless integration with ANC workflow through automatic ANC record creation, patient profile establishment, clinical risk factor integration with PrEP assessment workflows, and proper data synchronization across clinical modules |

### 5. Data Elements and Business Rules

#### Core Data Structure - Client Intake Assessment
```typescript
interface ClientIntakeAssessment {
  // Emergency Triage Assessment
  emergency_conditions: string[];              // Array of emergency conditions - Required
  vital_signs: {
    systolic_bp: number;                      // mmHg - Required - Alert if ≥160
    diastolic_bp: number;                     // mmHg - Required - Alert if ≥110
    temperature: number;                      // °C - Required - Alert if ≥38.5
    pulse_rate: number;                       // bpm - Required
    respiratory_rate: number;                 // breaths/min - Required
    weight: number;                          // kg - Required
    height: number;                          // cm - Optional
    bmi: number;                             // kg/m² - Auto-calculated
  };
  
  // Demographics and Identity
  demographics: {
    first_name: string;                       // Required - 2-50 characters
    last_name: string;                        // Required - 2-50 characters
    date_of_birth: string;                    // ISO date - Required
    age_calculated: number;                   // Years - Auto-calculated from DOB
    nrc_number: string;                       // Required - Format: 123456/78/9
    phone_number: string;                     // Required - Zambian format validation
    phone_provider: string;                   // Auto-detected from number
    address: {
      province: string;                       // Required - Zambian province
      district: string;                       // Required - Zambian district  
      constituency: string;                   // Optional
      ward: string;                          // Optional
      village_compound: string;               // Required
    };
    next_of_kin: {
      name: string;                          // Required
      relationship: string;                   // Required
      phone_number: string;                   // Required
    };
  };
  
  // Pregnancy and Obstetric Information
  pregnancy_details: {
    lmp_date: string;                        // ISO date - Required if known
    edd_calculated: string;                   // ISO date - Auto-calculated
    gestational_age_weeks: number;            // Weeks - Auto-calculated
    gestational_age_days: number;             // Days - Auto-calculated
    current_trimester: string;                // "first" | "second" | "third" - Auto-calculated
    gravida: number;                         // Total pregnancies - Required
    para: number;                            // Live births - Required
    previous_pregnancies: {
      live_births: number;                   // Required
      stillbirths: number;                   // Required
      miscarriages: number;                  // Required
      abortions: number;                     // Required
    };
  };
  
  // Medical History and Risk Factors
  medical_history: {
    chronic_conditions: string[];             // Array of conditions - Optional
    current_medications: string[];            // Array of medications - Optional
    allergies: string[];                     // Array of allergies - Optional
    previous_hospitalizations: string[];      // Array of reasons - Optional
    family_history: {
      diabetes: boolean;                     // Optional
      hypertension: boolean;                 // Optional
      heart_disease: boolean;                // Optional
      mental_health: boolean;                // Optional
    };
    social_history: {
      smoking_status: string;                // "never" | "former" | "current" - Required
      alcohol_use: string;                   // "never" | "occasional" | "regular" - Required
      substance_use: string[];               // Array of substances - Optional
    };
  };
  
  // Insurance and Socioeconomic Information
  insurance_information: {
    has_insurance: boolean;                   // Required
    insurance_type: string;                   // "nhima" | "private" | "employer" | "" - Conditional
    insurance_number: string;                 // Conditional on has_insurance
    employment_status: string;                // "employed" | "unemployed" | "student" | "retired" - Required
    monthly_income_range: string;             // Income bracket - Optional
    education_level: string;                  // Education completed - Optional
  };
  
  // Calculated Fields and Assessment Results
  assessment_results: {
    data_completeness_score: number;          // 0-100 - Auto-calculated
    clinical_priority: string;                // "emergency" | "urgent" | "high" | "routine" - Auto-calculated
    risk_factors_identified: string[];        // Auto-calculated array
    emergency_alerts: string[];               // Auto-calculated alerts
    validation_status: {
      demographics_valid: boolean;            // All required fields complete
      contact_info_valid: boolean;            // Phone/address validation passed
      pregnancy_data_valid: boolean;          // LMP/EDD calculations reasonable
      triage_complete: boolean;               // Emergency screening complete
    };
  };
}
```

#### Emergency Threshold Rules
| Vital Sign | Emergency Threshold | Alert Message | Priority Level |
|------------|-------------------|---------------|----------------|
| Systolic BP | ≥160 mmHg | "SEVERE HYPERTENSION - IMMEDIATE CLINICAL ATTENTION REQUIRED" | Emergency |
| Diastolic BP | ≥110 mmHg | "SEVERE HYPERTENSION - IMMEDIATE CLINICAL ATTENTION REQUIRED" | Emergency |
| Temperature | ≥38.5°C | "FEVER - CLINICAL ASSESSMENT REQUIRED" | Urgent |
| Pulse Rate | <60 or >100 bpm | "ABNORMAL HEART RATE - MONITOR CLOSELY" | High |
| Respiratory Rate | <12 or >20 breaths/min | "ABNORMAL BREATHING - ASSESSMENT NEEDED" | High |

#### Zambian Data Validation Rules

| Validation Type | Pattern/Rule | Example | Auto-Detection |
|-----------------|--------------|---------|----------------|
| **NRC Number** | /^\d{6}\/\d{2}\/\d$/ | 123456/78/9 | Age calculation from birth year |
| **MTN Numbers** | /^(096\|097\|076\|077\|026\|027)\d{7}$/ | 0966123456 | Provider = "MTN" |
| **Airtel Numbers** | /^(095\|097\|075\|025)\d{7}$/ | 0955123456 | Provider = "Airtel" |
| **Zamtel Numbers** | /^(021\|211\|055)\d{7}$/ | 0211123456 | Provider = "Zamtel" |

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| validateNRC() | NRC string | { isValid: boolean, age: number \| null } | NRC format validation and age extraction |
| validateZambianPhone() | Phone string | { isValid: boolean, provider: string \| null } | Phone validation and provider detection |

#### Gestational Age Calculation

| Calculation Component | Formula | Range | Output |
|----------------------|---------|-------|--------|
| **Weeks** | floor(days_since_lmp / 7) | 0-45 weeks | gestational_age_weeks |
| **Days** | days_since_lmp % 7 | 0-6 days | gestational_age_days |
| **EDD** | LMP + 280 days | Future date | edd_date |
| **Trimester** | weeks < 13: "first", 13-26: "second", >26: "third" | Three trimesters | trimester |
| **Validation** | 0 ≤ weeks ≤ 45 AND lmp ≤ today | Boolean | isReasonable |

| Function | Input | Output Fields | Validation Rules |
|----------|--------|---------------|------------------|
| calculateGestationalAge() | lmpDate: string | weeks, days, trimester, edd, isReasonable | LMP not future, reasonable gestational age |

#### Clinical Priority Classification

| Priority Level | Trigger Conditions | Clinical Response | Examples |
|----------------|-------------------|------------------|----------|
| **Emergency** | Emergency conditions present OR BP ≥160/110 mmHg | Immediate clinical attention | Severe hypertension, danger signs |
| **Urgent** | Temperature ≥38.5°C | Clinical assessment within 1 hour | Fever requiring evaluation |
| **High** | Gestational age >37 weeks OR Gravida >5 OR Abnormal vital signs | Priority scheduling within 4 hours | Term pregnancy, grand multiparity |
| **Routine** | Normal vital signs, no risk factors | Standard ANC scheduling | Regular antenatal visit |

| Vital Sign Category | Emergency Threshold | High Priority Threshold | Assessment Action |
|---------------------|--------------------|-----------------------|------------------|
| **Blood Pressure** | ≥160/110 mmHg | 140-159/90-109 mmHg | Immediate vs. monitoring |
| **Temperature** | N/A | ≥38.5°C | Urgent assessment |
| **Pulse Rate** | N/A | <60 or >100 bpm | Cardiac monitoring |
| **Respiratory Rate** | N/A | <12 or >20 breaths/min | Respiratory assessment |

#### Data Completeness Scoring

| Field Category | Required Fields | Weight | Scoring Rule |
|----------------|----------------|--------|--------------|
| **Demographics** | first_name, last_name, date_of_birth, nrc_number, phone_number | 25% | 5 fields × 5 points each |
| **Address** | province, district, village_compound | 15% | 3 fields × 5 points each |
| **Next of Kin** | name, relationship, phone_number | 15% | 3 fields × 5 points each |
| **Vital Signs** | systolic_bp, diastolic_bp, temperature, pulse_rate, respiratory_rate, weight | 30% | 6 fields × 5 points each |
| **Pregnancy Details** | gravida, para | 15% | 2 fields × 7.5 points each |
| **Total** | 19 required fields | 100% | Maximum 100 points |

| Completeness Score | Data Quality Level | Clinical Action | Registration Status |
|-------------------|-------------------|-----------------|-------------------|
| **90-100%** | Excellent | Proceed with full ANC registration | Complete registration |
| **75-89%** | Good | Minor data collection needed | Registration with notes |
| **60-74%** | Acceptable | Follow-up data collection required | Conditional registration |
| **<60%** | Poor | Cannot proceed with registration | Incomplete - collect more data |

| Function | Input | Output | Algorithm |
|----------|--------|--------|-----------|
| calculateDataCompleteness() | ClientIntakeAssessment | Completeness percentage (0-100) | Count non-null fields / total required fields × 100 |

### 6. Definition of Done (DoD)
- All 9 functional requirements implemented with backward compatibility
- Rapid triage assessment implemented with emergency screening and vital signs validation
- Real-time validation functional for Zambian data formats (NRC, phone) with provider detection
- Emergency alert system tested with clinical threshold validation and protocol references
- Gestational age calculation implemented with clinical significance assessment
- Comprehensive demographics capture with socioeconomic and insurance data validation
- Medical history assessment with risk factor identification and clinical significance weighting
- Progressive data capture workflow tested with section-based completion tracking
- Data quality scoring algorithm with completeness assessment and improvement guidance
- Clinical priority classification functional (Emergency/Urgent/High/Routine categorization)
- Existing modal state management preserved and enhanced
- Performance benchmarks met (100ms validation response, 60fps UI)
- Healthcare provider testing completed with efficiency validation
- Integration testing confirms no breaking changes to existing functionality
- Feature meets acceptance criteria with clinical workflow validation
- UI/UX tested for 10-minute completion target
- UAT completed with intake coordinators and clinical staff
- Unit/integration tests cover triage algorithms, validation logic, and data quality assessment
- Clinical documentation updated with triage protocols and enhanced validation patterns
- Code peer-reviewed and passes healthcare data security and privacy standards

### 7. Metadata / Governance Traceability
| Field | Description |
|-------|-------------|
| Epic / Feature | ANC Client Intake Optimization |
| Test Case ID | TC-ANC-INTAKE-004 |
| Priority | Critical |
| Clinical Guidelines | Emergency Triage Protocols, Antenatal Care Standards, Zambian Healthcare Guidelines |
| Stakeholders | Intake Coordinators, Clinical Officers, Data Quality Managers |
| Dependencies | Patient Registration System, Emergency Alert System, Data Validation Framework |
| Regulatory Compliance | Healthcare Data Standards, Emergency Response Protocols, Privacy Protection |

**Tags:** [ANC, Client-Intake, Rapid-Assessment, Triage, Data-Quality, Emergency-Protocols, Sprint-Ready]

## Business Context

### Current Problem
Manual client intake processes lack standardization and comprehensive data validation. Healthcare providers need efficient tools for rapid assessment and complete demographic capture during initial antenatal visits. Current patient search shows authentication requirements (401 errors) indicating need for streamlined client registration and intake workflows.

### Business Value
- Streamlined intake reduces registration time by 25 minutes per client
- Improves data completeness by 90% through structured capture and intelligent validation
- Decreases documentation errors by 70% with real-time validation and consistency checking
- Enhances clinical workflow efficiency through immediate triage and priority identification

### Clinical Impact
- Comprehensive client profiles enable accurate risk stratification and immediate clinical priority identification
- Improved clinical decision support through complete baseline assessment and demographic data
- Enhanced continuity of care across healthcare facilities with standardized data capture
- Better maternal-fetal health outcomes through complete baseline assessment and early risk identification

## Assessment of Enhancement Requirements

### Understanding of Requirements - Building Comprehensive Client Intake System From Scratch

This requirement involves creating a complete rapid assessment and client intake system for antenatal care that efficiently captures comprehensive demographic and clinical data while providing immediate triage and risk identification capabilities.

**Core Intake System Components:**
1. **Rapid Triage Assessment Module**
   - Emergency condition screening checklist
   - Vital signs capture with automated alerts
   - Gestational age calculation and validation
   - Immediate clinical priority classification

2. **Comprehensive Demographics Module**
   - Personal identification and verification
   - Contact information with validation
   - Socioeconomic assessment with clinical relevance
   - Insurance and payment information capture

3. **Clinical Baseline Assessment Module**
   - Medical history with risk factor identification
   - Reproductive history and pregnancy planning
   - Family history with genetic risk assessment
   - Lifestyle factors and social determinants

4. **Intelligent Data Quality Engine**
   - Real-time validation and consistency checking
   - Completeness scoring with prioritization
   - Duplicate detection and record merging
   - Clinical significance weighting

**Rapid Triage Data Structure:**

| Section | Field Name | Data Type | Significance | Example Values |
|---------|------------|-----------|--------------|----------------|
| **Emergency Conditions** | severe_hypertension | Boolean | BP ≥160/110 mmHg | true/false |
| | heavy_bleeding | Boolean | Active hemorrhage | true/false |
| | severe_abdominal_pain | Boolean | Acute abdomen | true/false |
| | preeclampsia_signs | Boolean | Maternal emergency | true/false |
| | difficulty_breathing | Boolean | Respiratory distress | true/false |
| | altered_consciousness | Boolean | Neurological emergency | true/false |
| **Vital Signs** | blood_pressure_systolic | Number | Systolic BP (mmHg) | 80-200 |
| | blood_pressure_diastolic | Number | Diastolic BP (mmHg) | 50-120 |
| | temperature | Number | Body temperature (°C) | 35.0-42.0 |
| | pulse_rate | Number | Heart rate (bpm) | 40-150 |
| | respiratory_rate | Number | Breathing rate (breaths/min) | 8-30 |
| | weight | Number | Body weight (kg) | 30-150 |
| | height | Number | Height (cm) | 120-200 |
| **Gestational Assessment** | lmp_date | Date | Last menstrual period | Date object |
| | lmp_certain | Boolean | LMP date certainty | true/false |
| | calculated_gestational_age | Number | Pregnancy weeks | 0-45 |
| | estimated_delivery_date | Date | Expected delivery | Date object |
| | dating_discrepancy | Boolean | LMP vs exam discrepancy | true/false |
| **Clinical Priority** | triage_priority | String | Priority classification | "emergency", "urgent", "routine" |
| | immediate_actions_required | Array | Required actions | String array |

**Comprehensive Demographics Structure:**

| Section | Field Name | Data Type | Options/Format | Clinical Relevance |
|---------|------------|-----------|----------------|-------------------|
| **Personal Identity** | first_name | String | Text input | Legal identification |
| | last_name | String | Text input | Legal identification |
| | date_of_birth | Date | Date picker | Age calculation |
| | age | Number | Auto-calculated | Clinical protocols |
| | nrc_number | String | ######/##/# format | National ID verification |
| | nupin | String | Unique identifier | Health system ID |
| **Contact Information** | primary_phone | String | Zambian format validation | Communication |
| | secondary_phone | String | Optional | Backup contact |
| | email | String | Optional | Digital communication |
| | residential_address | Object | Province/District/Village | Geographic health data |
| | emergency_contact | Object | Name/Phone/Relationship | Emergency situations |
| **Socioeconomic Data** | education_level | String | "none", "primary", "secondary", "tertiary" | Health literacy |
| | occupation | String | Free text | Risk assessment |
| | employment_status | String | "employed", "unemployed", "student", "self_employed" | Social determinants |
| | household_size | Number | 1-20 range | Social support |
| | primary_income_source | String | Free text | Economic status |
| | social_support_available | Boolean | Yes/No | Care support |
| **Insurance/Payment** | has_insurance | Boolean | Yes/No | Payment method |
| | insurance_type | String | "nhima", "private", "employer", "other" | Coverage type |
| | insurance_number | String | Optional | Insurance verification |
| | payment_method | String | "cash", "insurance", "voucher", "free" | Payment processing |

### Key Considerations for Implementation

**Clinical Risk Assessment Integration:**

| Assessment Category | Field Name | Data Type | Options | Clinical Use |
|---------------------|------------|-----------|---------|--------------|
| **Medical History** | chronic_conditions | Array | ChronicCondition objects | Risk stratification |
| | current_medications | Array | Medication objects | Drug interactions |
| | allergies | Array | Allergy objects | Safety screening |
| | previous_hospitalizations | Array | Hospitalization objects | Risk assessment |
| | surgical_history | Array | Surgery objects | Surgical risk |
| **Reproductive History** | total_pregnancies | Number | 0-20 range | Parity assessment |
| | live_births | Number | 0-20 range | Birth outcomes |
| | miscarriages | Number | 0-10 range | Loss history |
| | stillbirths | Number | 0-10 range | Fetal outcomes |
| | contraceptive_history | Array | ContraceptiveMethod objects | Family planning |
| | gynecological_conditions | Array | GynecologicalCondition objects | Reproductive health |
| **Family History** | maternal_conditions | Array | FamilyCondition objects | Maternal risk factors |
| | paternal_conditions | Array | FamilyCondition objects | Paternal risk factors |
| | genetic_risk_factors | Array | GeneticRiskFactor objects | Genetic screening |
| | hereditary_conditions | Array | HereditaryCondition objects | Inherited conditions |
| **Lifestyle Assessment** | smoking_status | String | "never", "former", "current" | Cardiovascular risk |
| | alcohol_use | String | "never", "occasional", "regular", "heavy" | Fetal alcohol syndrome |
| | substance_use | Array | SubstanceUse objects | Substance abuse screening |
| | nutritional_status | Object | NutritionalAssessment | Maternal nutrition |
| | physical_activity | Object | ActivityLevel | Activity assessment |
| | occupational_exposures | Array | Exposure objects | Environmental risks |

**Emergency Triage Algorithms:**

| Condition Check | Threshold | Urgency Level | Clinical Protocol | Required Actions |
|-----------------|-----------|---------------|-------------------|------------------|
| **Severe Hypertension** | BP ≥160/110 mmHg | Immediate | emergency_bp_management | Medical evaluation, magnesium sulfate, delivery prep |
| **Fever** | Temperature ≥38.5°C | Urgent | infection_screening | Blood cultures, antibiotics, fetal monitoring |
| **Gestational Age Concern** | <20 or >42 weeks | Urgent/Immediate | gestational_age_verification | Ultrasound dating, obstetric consultation, delivery planning |

| Function | Input | Output | Algorithm |
|----------|--------|--------|-----------|
| evaluateEmergencyConditions() | RapidTriageAssessment | TriageResult | Evaluates vital signs and gestational age against emergency thresholds |

| Return Object | Field | Data Type | Content |
|---------------|-------|-----------|---------|
| TriageResult | priority | String | "emergency" or "routine" |
| | conditions | Array | Emergency conditions detected |
| | immediate_actions | Array | Flattened actions from all conditions |
| | next_steps | Array | Generated next steps |

### Best Practice User Experience for Intake Implementation

**Progressive Data Capture Workflow:**
1. **Immediate Triage (2-3 minutes)**: Emergency screening and vital signs
2. **Essential Demographics (3-4 minutes)**: Identity verification and contact details
3. **Clinical History (4-5 minutes)**: Medical and reproductive history
4. **Comprehensive Assessment (2-3 minutes)**: Social determinants and lifestyle factors

**Intelligent Validation and Guidance:**

| Hook Component | Function | Purpose | Implementation |
|----------------|----------|---------|----------------|
| **useIntelligentValidation()** | Main validation hook | Real-time field validation | Returns validation functions and state |
| **validateField()** | Field-level validation | Individual field checking | Returns validation object with errors/warnings |
| **calculateCompletionScore()** | Completion scoring | Section-weighted scoring | Returns percentage and missing fields |

| Validation Fields | Field Name | Validation Rule | Clinical Significance |
|-------------------|------------|-----------------|----------------------|
| **Identity** | nrc_number | validateNRCFormat() | Required for progression |
| **Vital Signs** | blood_pressure_systolic | ≥160 triggers warning | High clinical significance |
| **Pregnancy** | lmp_date | Gestational age >42 weeks | High clinical significance |

| Completion Scoring | Section | Weight | Rationale |
|--------------------|---------|--------|-----------|
| **Emergency Screening** | emergency_screening | 30% | Highest weight for safety |
| **Demographics** | demographics | 25% | Essential identification |
| **Medical History** | medical_history | 20% | Clinical risk assessment |
| **Reproductive History** | reproductive_history | 15% | Pregnancy-specific care |
| **Lifestyle Factors** | lifestyle_factors | 10% | Social determinants |

| Return Object | Field | Data Type | Content |
|---------------|-------|-----------|---------|
| CompletionScore | percentage | Number | Weighted completion percentage |
| | missingCriticalFields | Array | Fields blocking progression |
| | nextRecommendedFields | Array | Prioritized next fields |
| | clinicalSignificance | String | Overall clinical priority |

### Technical Implementation Architecture

**Database Schema for Complete Intake:**

| Schema Section | Table: client_intake_assessments | Field Details |
|----------------|----------------------------------|---------------|
| **Core Identity** | id | SERIAL PRIMARY KEY |
| | patient_id | INTEGER REFERENCES patients(id) |
| | facility_id | INTEGER REFERENCES facilities(id) |
| | assessment_date | TIMESTAMP DEFAULT NOW() |
| **Rapid Triage** | emergency_conditions | JSONB |
| | vital_signs | JSONB |
| | gestational_assessment | JSONB |
| | triage_priority | VARCHAR(20) |
| | immediate_actions | TEXT[] |
| **Demographics** | personal_information | JSONB |
| | contact_details | JSONB |
| | socioeconomic_data | JSONB |
| | insurance_information | JSONB |
| **Clinical Assessment** | medical_history | JSONB |
| | reproductive_history | JSONB |
| | family_history | JSONB |
| | lifestyle_factors | JSONB |
| **Quality Metrics** | completion_score | INTEGER |
| | validation_status | JSONB |
| | clinical_priority | VARCHAR(20) |
| | data_quality_score | INTEGER |
| **Workflow State** | current_section | VARCHAR(50) |
| | sections_completed | TEXT[] |
| | next_recommended_action | TEXT |
| **Audit Trail** | created_by | INTEGER REFERENCES users(id) |
| | updated_at | TIMESTAMP DEFAULT NOW() |
| | version | INTEGER DEFAULT 1 |

| Database Indexes | Index Name | Purpose |
|------------------|------------|---------|
| idx_intake_patient | ON patient_id | Patient lookup performance |
| idx_intake_triage | ON triage_priority | Emergency prioritization |
| idx_intake_completion | ON completion_score | Quality metrics |
| idx_intake_facility | ON facility_id | Facility-based queries |

## Step-by-Step Implementation Plan

### Phase 1: Rapid Triage System (Days 1-2)

**Day 1: Emergency Screening and Vital Signs Capture**

| Implementation Task | Component: RapidTriageAssessment | Component Details |
|---------------------|-----------------------------------|-------------------|
| **Props Interface** | TriageProps | onTriageComplete callback |
| **State Management** | useState hooks | triageData, emergencyAlerts |
| **Container** | div with space-y-6 | Main layout container |
| **Emergency Card** | Card with border-red-200 | Emergency conditions container |
| **Card Header** | CardHeader with bg-red-50 | Red background for urgency |
| **Card Title** | text-red-800 with AlertTriangle icon | Emergency Conditions Screening |
| **Content Layout** | CardContent with space-y-3 | Conditions checklist |
| **Condition Mapping** | emergencyConditions.map() | Dynamic condition rendering |
| **Checkbox Logic** | onCheckedChange handler | handleEmergencyCondition() |
| **Critical Badge** | Badge variant="destructive" | For critical conditions |
| **Vital Signs** | VitalSignsCapture component | Integrated vital signs input |

| Event Handlers | Function | Purpose |
|----------------|----------|---------|
| handleEmergencyCondition() | Field-specific emergency handling | Updates emergency conditions state |
| handleVitalSignsChange() | Vital signs data updates | Updates vital signs state |
| handleVitalSignsAlert() | Alert processing | Handles vital signs alerts |

2. **Implement Emergency Alert System**

| Function Task | Function: evaluateEmergencyConditions | Implementation Details |
|---------------|----------------------------------------|------------------------|
| **Parameters** | triageData: RapidTriageData | Input triage data |
| **Return Type** | EmergencyEvaluation | Emergency assessment result |
| **Alert Array** | alerts: EmergencyAlert[] | Collected emergency alerts |

| Emergency Condition | Threshold | Alert Configuration |
|---------------------|-----------|---------------------|
| **Severe Hypertension** | blood_pressure_systolic >= 160 | type: 'severe_hypertension', urgency: 'immediate', protocol: 'ANC-EMERGENCY-001' |
| **Fever** | temperature >= 38.5 | type: 'fever', urgency: 'urgent', protocol: 'ANC-INFECTION-002' |

| Alert Details | Severe Hypertension | Fever |
|---------------|---------------------|-------|
| **Message** | 'Severe hypertension detected - immediate medical attention required' | 'Maternal fever detected - infection screening required' |
| **Actions** | blood_pressure_recheck, physician_notification, preparation_for_delivery | blood_cultures, fbc_investigation, fetal_monitoring |

| Return Object | Field | Logic | Purpose |
|---------------|-------|-------|---------|
| triagePriority | String | alerts.length > 0 ? 'emergency' : 'routine' | Priority classification |
| alerts | Array | Collected EmergencyAlert objects | All detected alerts |
| immediateActions | Array | alerts.flatMap(alert => alert.actions) | Flattened action list |
| estimatedWaitTime | Number | calculateWaitTime(priority) | Wait time calculation |

**Day 2: Gestational Age Calculation and Clinical Priority**
3. **Gestational Age Assessment Engine**
   ```typescript
   const calculateGestationalAge = (lmpDate: Date, currentDate: Date = new Date()): GestationalAgeResult => {
     const timeDiff = currentDate.getTime() - lmpDate.getTime();
     const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
     const weeks = Math.floor(daysDiff / 7);
     const days = daysDiff % 7;
     
     const estimatedDeliveryDate = new Date(lmpDate);
     estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 280); // 40 weeks
     
     // Validate gestational age reasonableness
     const warnings = [];
     if (weeks < 4) warnings.push('Very early pregnancy - confirm dates');
     if (weeks > 42) warnings.push('Post-term pregnancy - immediate obstetric review');
     if (weeks < 0) warnings.push('Future LMP date - please verify');
     
     return {
       weeks,
       days,
       totalDays: daysDiff,
       estimatedDeliveryDate,
       trimester: weeks <= 13 ? 1 : weeks <= 26 ? 2 : 3,
       isValidRange: weeks >= 4 && weeks <= 42,
       warnings,
       clinicalSignificance: weeks < 20 || weeks > 37 ? 'high' : 'standard'
     };
   };
   ```

4. **Clinical Priority Classification**
   ```typescript
   const determineClientPriority = (
     triageData: RapidTriageData,
     emergencyEvaluation: EmergencyEvaluation,
     gestationalAge: GestationalAgeResult
   ): ClientPriorityAssessment => {
     let priority: 'emergency' | 'urgent' | 'high' | 'routine' = 'routine';
     const priorityFactors = [];
     
     // Emergency conditions override
     if (emergencyEvaluation.triagePriority === 'emergency') {
       priority = 'emergency';
       priorityFactors.push('Emergency conditions detected');
     }
     
     // Gestational age factors
     if (gestationalAge.weeks > 41) {
       priority = priority === 'routine' ? 'urgent' : priority;
       priorityFactors.push('Post-term pregnancy');
     } else if (gestationalAge.weeks < 20) {
       priority = priority === 'routine' ? 'high' : priority;
       priorityFactors.push('Early pregnancy concerns');
     }
     
     // Vital signs factors
     if (triageData.vital_signs.blood_pressure_systolic > 140 || 
         triageData.vital_signs.blood_pressure_diastolic > 90) {
       priority = priority === 'routine' ? 'high' : priority;
       priorityFactors.push('Elevated blood pressure');
     }
     
     return {
       priority,
       priorityFactors,
       estimatedConsultationTime: getEstimatedTime(priority),
       specialistReferralNeeded: priority === 'emergency' || priority === 'urgent',
       nextSteps: generateNextSteps(priority, priorityFactors)
     };
   };
   ```

### Phase 2: Demographics and Data Quality (Days 3-4)

**Day 3: Comprehensive Demographics Capture**
5. **Personal Information Validation**
   ```typescript
   const PersonalInformationForm = ({ values, onChange, onValidation }: PersonalInfoProps) => {
     const validateNRC = useCallback((nrcNumber: string): NRCValidation => {
       // Zambian NRC format: 123456/78/9
       const nrcPattern = /^\d{6}\/\d{2}\/\d$/;
       
       if (!nrcPattern.test(nrcNumber)) {
         return {
           isValid: false,
           error: 'Invalid NRC format. Expected: 123456/78/9',
           suggestion: 'Please enter NRC in format: XXXXXX/XX/X'
         };
       }
       
       // Extract birth year and validate age reasonableness
       const birthYearSuffix = parseInt(nrcNumber.substring(7, 9));
       const currentYear = new Date().getFullYear();
       const birthYear = birthYearSuffix < 50 ? 2000 + birthYearSuffix : 1900 + birthYearSuffix;
       const age = currentYear - birthYear;
       
       if (age < 12 || age > 55) {
         return {
           isValid: true,
           warning: `Calculated age (${age}) may need verification for antenatal care`,
           calculatedAge: age
         };
       }
       
       return { isValid: true, calculatedAge: age };
     }, []);
     
     return (
       <div className="space-y-4">
         <div className="grid grid-cols-2 gap-4">
           <FormField
             name="first_name"
             render={({ field }) => (
               <div>
                 <Label>First Name *</Label>
                 <Input {...field} placeholder="Enter first name" />
               </div>
             )}
           />
           <FormField
             name="last_name"
             render={({ field }) => (
               <div>
                 <Label>Last Name *</Label>
                 <Input {...field} placeholder="Enter last name" />
               </div>
             )}
           />
         </div>
         
         <FormField
           name="nrc_number"
           render={({ field }) => (
             <div>
               <Label>National Registration Card (NRC) *</Label>
               <Input 
                 {...field} 
                 placeholder="123456/78/9"
                 onChange={(e) => {
                   field.onChange(e);
                   const validation = validateNRC(e.target.value);
                   onValidation('nrc_number', validation);
                 }}
               />
             </div>
           )}
         />
       </div>
     );
   };
   ```

**Day 4: Contact Information and Socioeconomic Assessment**
6. **Contact Validation System**
   ```typescript
   const ContactInformationCapture = ({ values, onChange, onValidation }: ContactProps) => {
     const validatePhoneNumber = useCallback((phone: string): PhoneValidation => {
       // Zambian phone number patterns
       const patterns = {
         mtn: /^(\+260|0)?9[5-7]\d{7}$/,
         airtel: /^(\+260|0)?9[6-7]\d{7}$/,
         zamtel: /^(\+260|0)?21\d{7}$/
       };
       
       const normalizedPhone = phone.replace(/\s+/g, '');
       
       for (const [provider, pattern] of Object.entries(patterns)) {
         if (pattern.test(normalizedPhone)) {
           return {
             isValid: true,
             provider: provider.toUpperCase(),
             normalizedNumber: normalizedPhone.startsWith('+260') ? 
               normalizedPhone : '+260' + normalizedPhone.replace(/^0/, '')
           };
         }
       }
       
       return {
         isValid: false,
         error: 'Invalid Zambian phone number format',
         suggestion: 'Enter format: +260 9X XXXXXXX or 09X XXXXXXX'
       };
     }, []);
     
     return (
       <Card>
         <CardHeader>
           <CardTitle>Contact Information</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <FormField
             name="primary_phone"
             render={({ field }) => (
               <div>
                 <Label>Primary Phone Number *</Label>
                 <Input 
                   {...field} 
                   placeholder="+260 95 1234567"
                   onChange={(e) => {
                     field.onChange(e);
                     const validation = validatePhoneNumber(e.target.value);
                     onValidation('primary_phone', validation);
                   }}
                 />
               </div>
             )}
           />
           
           <div className="grid grid-cols-2 gap-4">
             <FormField
               name="emergency_contact_name"
               render={({ field }) => (
                 <div>
                   <Label>Emergency Contact Name *</Label>
                   <Input {...field} placeholder="Full name" />
                 </div>
               )}
             />
             <FormField
               name="emergency_contact_relationship"
               render={({ field }) => (
                 <div>
                   <Label>Relationship *</Label>
                   <Select onValueChange={field.onChange} value={field.value}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select relationship" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="spouse">Spouse/Partner</SelectItem>
                       <SelectItem value="mother">Mother</SelectItem>
                       <SelectItem value="father">Father</SelectItem>
                       <SelectItem value="sister">Sister</SelectItem>
                       <SelectItem value="brother">Brother</SelectItem>
                       <SelectItem value="friend">Friend</SelectItem>
                       <SelectItem value="other">Other</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               )}
             />
           </div>
         </CardContent>
       </Card>
     );
   };
   ```

### Phase 3: Clinical History and Data Quality (Days 5-6)

**Day 5: Medical and Reproductive History**
7. **Comprehensive Medical History Capture**
   ```typescript
   const MedicalHistoryAssessment = ({ values, onChange, onRiskIdentified }: MedicalHistoryProps) => {
     const identifyRiskFactors = useCallback((medicalHistory: MedicalHistoryData): RiskFactorAnalysis => {
       const riskFactors = [];
       const clinicalAlerts = [];
       
       // Chronic conditions risk assessment
       if (medicalHistory.chronic_conditions.includes('diabetes')) {
         riskFactors.push({
           factor: 'diabetes_mellitus',
           riskLevel: 'high',
           implications: ['Gestational diabetes risk', 'Macrosomia risk', 'Enhanced monitoring required'],
           management: 'Endocrine consultation and enhanced glucose monitoring'
         });
       }
       
       if (medicalHistory.chronic_conditions.includes('hypertension')) {
         riskFactors.push({
           factor: 'chronic_hypertension',
           riskLevel: 'high',
           implications: ['Pre-eclampsia risk', 'Placental abruption risk', 'IUGR risk'],
           management: 'Enhanced BP monitoring and antihypertensive review'
         });
       }
       
       // Medication interaction screening
       const problematicMedications = ['ace_inhibitors', 'warfarin', 'tetracyclines'];
       const currentMeds = medicalHistory.current_medications.map(med => med.category);
       const interactions = currentMeds.filter(med => problematicMedications.includes(med));
       
       if (interactions.length > 0) {
         clinicalAlerts.push({
           type: 'medication_interaction',
           urgency: 'high',
           message: 'Potentially harmful medications identified for pregnancy',
           medications: interactions,
           action: 'Immediate medication review and substitution required'
         });
       }
       
       return {
         riskFactors,
         clinicalAlerts,
         overallRiskLevel: riskFactors.some(rf => rf.riskLevel === 'high') ? 'high' : 'moderate',
         requiresSpecialistReferral: riskFactors.length > 0 || clinicalAlerts.length > 0
       };
     }, []);
     
     return (
       <div className="space-y-6">
         <Card>
           <CardHeader>
             <CardTitle>Chronic Medical Conditions</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-2 gap-4">
               {chronicConditionOptions.map(condition => (
                 <div key={condition.id} className="flex items-center space-x-2">
                   <Checkbox 
                     checked={values?.chronic_conditions?.includes(condition.id)}
                     onCheckedChange={(checked) => handleConditionChange(condition.id, checked)}
                   />
                   <Label>{condition.label}</Label>
                   {condition.riskLevel === 'high' && 
                     <Badge variant="destructive">High Risk</Badge>
                   }
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
         
         <Card>
           <CardHeader>
             <CardTitle>Current Medications</CardTitle>
           </CardHeader>
           <CardContent>
             <MedicationList 
               medications={values?.current_medications || []}
               onChange={handleMedicationsChange}
               onInteractionAlert={handleMedicationAlert}
             />
           </CardContent>
         </Card>
       </div>
     );
   };
   ```

**Day 6: Data Quality and API Integration**
8. **Comprehensive Data Quality Engine**
   ```typescript
   const useDataQualityAssessment = (intakeData: ClientIntakeData) => {
     const [qualityScore, setQualityScore] = useState<DataQualityScore>();
     const [completionAnalysis, setCompletionAnalysis] = useState<CompletionAnalysis>();
     
     const assessDataQuality = useCallback((data: ClientIntakeData): DataQualityAssessment => {
       const qualityMetrics = {
         completeness: 0,
         accuracy: 0,
         consistency: 0,
         clinicalRelevance: 0
       };
       
       // Completeness scoring (40% of total)
       const requiredFields = identifyRequiredFields();
       const completedRequired = requiredFields.filter(field => hasValue(data, field));
       qualityMetrics.completeness = (completedRequired.length / requiredFields.length) * 40;
       
       // Accuracy scoring (30% of total) 
       const validationResults = validateAllFields(data);
       const accurateFields = validationResults.filter(result => result.isValid);
       qualityMetrics.accuracy = (accurateFields.length / validationResults.length) * 30;
       
       // Consistency scoring (20% of total)
       const consistencyChecks = performConsistencyChecks(data);
       const consistentChecks = consistencyChecks.filter(check => check.isConsistent);
       qualityMetrics.consistency = (consistentChecks.length / consistencyChecks.length) * 20;
       
       // Clinical relevance scoring (10% of total)
       const clinicalRelevanceScore = assessClinicalRelevance(data);
       qualityMetrics.clinicalRelevance = clinicalRelevanceScore * 10;
       
       const totalScore = Object.values(qualityMetrics).reduce((sum, score) => sum + score, 0);
       
       return {
         totalScore: Math.round(totalScore),
         breakdown: qualityMetrics,
         qualityLevel: totalScore >= 90 ? 'excellent' : 
                      totalScore >= 75 ? 'good' : 
                      totalScore >= 60 ? 'acceptable' : 'poor',
         improvementAreas: identifyImprovementAreas(qualityMetrics),
         nextSteps: generateQualityImprovementSteps(data, qualityMetrics)
       };
     }, []);
     
     return {
       assessDataQuality,
       qualityScore,
       completionAnalysis
     };
   };
   ```

9. **API Integration and Testing**
   ```typescript
   // API Endpoints for Client Intake
   
   // POST /api/patients/:patientId/client-intake
   export const createClientIntakeAssessment = async (
     patientId: string,
     intakeData: ClientIntakeData
   ): Promise<ClientIntakeResult> => {
     // Validate intake data
     const validation = validateClientIntakeData(intakeData);
     if (!validation.isValid) {
       throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
     }
     
     // Evaluate triage priority
     const triageEvaluation = evaluateEmergencyConditions(intakeData.rapidTriage);
     
     // Assess data quality
     const qualityAssessment = assessDataQuality(intakeData);
     
     // Calculate clinical priority
     const clinicalPriority = determineClientPriority(
       intakeData.rapidTriage,
       triageEvaluation,
       intakeData.gestationalAssessment
     );
     
     const result = await db.insert(clientIntakeAssessments).values({
       patient_id: parseInt(patientId),
       emergency_conditions: intakeData.rapidTriage.emergency_conditions,
       vital_signs: intakeData.rapidTriage.vital_signs,
       gestational_assessment: intakeData.gestationalAssessment,
       triage_priority: triageEvaluation.triagePriority,
       immediate_actions: triageEvaluation.immediateActions,
       personal_information: intakeData.demographics.personal_info,
       contact_details: intakeData.demographics.contact_details,
       socioeconomic_data: intakeData.demographics.socioeconomic_data,
       insurance_information: intakeData.demographics.insurance_info,
       medical_history: intakeData.clinicalBaseline.medical_history,
       reproductive_history: intakeData.clinicalBaseline.reproductive_history,
       family_history: intakeData.clinicalBaseline.family_history,
       lifestyle_factors: intakeData.clinicalBaseline.lifestyle_factors,
       completion_score: qualityAssessment.totalScore,
       validation_status: validation,
       clinical_priority: clinicalPriority.priority,
       data_quality_score: qualityAssessment.totalScore
     }).returning();
     
     return {
       ...result[0],
       triageEvaluation,
       qualityAssessment,
       clinicalPriority
     };
   };
   ```

## Technical Implementation Framework

### Complete System Architecture
```typescript
// Main Client Intake Hook
const useClientIntakeAssessment = (patientId: string) => {
  const [intakeData, setIntakeData] = useState<ClientIntakeData>();
  const [currentSection, setCurrentSection] = useState<IntakeSection>('triage');
  const [qualityAssessment, setQualityAssessment] = useState<DataQualityAssessment>();
  const [triageEvaluation, setTriageEvaluation] = useState<TriageEvaluation>();
  
  // Auto-save functionality with debouncing
  const debouncedSave = useDebouncedCallback(
    async (data: ClientIntakeData) => {
      await saveIntakeProgress(patientId, data);
    },
    3000
  );
  
  // Real-time validation and quality assessment
  useEffect(() => {
    if (intakeData) {
      const quality = assessDataQuality(intakeData);
      setQualityAssessment(quality);
      
      if (intakeData.rapidTriage) {
        const triage = evaluateEmergencyConditions(intakeData.rapidTriage);
        setTriageEvaluation(triage);
      }
      
      debouncedSave(intakeData);
    }
  }, [intakeData, debouncedSave]);
  
  return {
    intakeData,
    setIntakeData,
    currentSection,
    setCurrentSection,
    qualityAssessment,
    triageEvaluation
  };
};
```

### Understanding of Current Implementation
The existing system includes:
- Patient search and registration capabilities with authentication requirements
- ANC record management with comprehensive clinical data structures
- Integration with PostgreSQL for secure health data management
- Clinical decision support infrastructure for assessment workflows

### Key Considerations for Non-Disruptive Implementation
1. **Authentication Integration**: Build upon existing user authentication and facility-based access control
2. **Patient Record System**: Integrate with existing patient search, registration, and medical record infrastructure
3. **Clinical Workflow Preservation**: Maintain existing ANC assessment patterns while enhancing intake efficiency
4. **Data Schema Compatibility**: Work within established database schemas and clinical data structures

### Best Practice User Experience Approach
1. **Rapid Triage First**: Immediate emergency condition screening before comprehensive demographic capture
2. **Progressive Data Capture**: Structured intake workflow that builds from urgent to comprehensive information
3. **Intelligent Validation**: Real-time data quality checking with clinical significance prioritization
4. **Mobile-First Design**: Tablet-optimized interface for point-of-care data capture in clinical settings

### Relevant Best Practices for Current Implementation
1. **Form Management**: Leverage existing React Hook Form patterns and Zod validation for clinical data
2. **State Management**: Build upon current clinical assessment state patterns and modal management
3. **Database Integration**: Utilize existing Drizzle ORM patterns and PostgreSQL schema structures
4. **Clinical Integration**: Maintain existing WHO guideline compliance and clinical decision support

## Step-by-Step Implementation Plan

### Phase 1: Rapid Triage and Emergency Assessment (Days 1-2)
1. **Emergency Triage Screen**: Implement immediate screening for urgent conditions requiring emergency referral
2. **Vital Signs Capture**: Basic vital signs with automated alert generation for abnormal parameters
3. **Gestational Age Assessment**: LMP-based dating with automated calculations and clinical validation

### Phase 2: Comprehensive Demographics and Identification (Days 3-4)
4. **Identity Verification**: NRC and NUPIN validation with existing patient record integration
5. **Contact Information**: Complete contact details with emergency contact requirements and validation
6. **Socioeconomic Assessment**: Education, occupation, household composition with clinical relevance indicators

### Phase 3: Clinical Baseline and History Capture (Days 5-6)
7. **Medical History**: Comprehensive chronic conditions, medications, allergies with risk factor identification
8. **Reproductive History**: Previous pregnancies, contraceptive use, gynecological conditions
9. **Family History**: Genetic risk factors with clinical significance weighting and maternal-fetal implications

### Phase 4: Intelligent Validation and Workflow Integration (Days 7-8)
10. **Data Quality Engine**: Real-time validation with clinical range checking and consistency verification
11. **Completion Scoring**: Automated completeness assessment with missing data prioritization
12. **Care Pathway Integration**: Automatic care pathway recommendations based on intake assessment

## Technical Implementation Framework

```typescript
// Rapid Assessment Data Structure
interface RapidAssessmentData {
  // Emergency Triage
  emergencyConditions: EmergencyCondition[];
  triagePriority: 'emergency' | 'urgent' | 'routine';
  vitalSigns: VitalSigns;
  gestationalAge: GestationalAgeAssessment;
  
  // Client Demographics
  personalInformation: PersonalInformation;
  identification: IdentificationData;
  contactDetails: ContactInformation;
  socioeconomicFactors: SocioeconomicData;
  
  // Clinical Baseline
  medicalHistory: MedicalHistory;
  reproductiveHistory: ReproductiveHistory;
  familyHistory: FamilyHistory;
  
  // Quality Metrics
  completionScore: number;
  validationStatus: ValidationStatus;
  clinicalPriority: ClinicalPriority;
}

// Rapid Triage Component
const RapidTriageAssessment: React.FC<RapidTriageProps> = ({
  onEmergencyDetected,
  onTriageComplete
}) => {
  // Emergency condition screening
  // Vital signs capture with alerts
  // Immediate priority classification
}

// Intelligent Data Validation Hook
const useIntelligentValidation = (assessmentData: RapidAssessmentData) => {
  // Real-time validation with clinical context
  // Completeness scoring with priority weighting
  // Consistency checking across data domains
}

// Client Intake Workflow Manager
const useClientIntakeWorkflow = () => {
  // Progressive intake workflow management
  // Care pathway determination
  // Integration with existing patient systems
}
```

### Database Schema Enhancement
```sql
-- Client Intake Core Table
CREATE TABLE client_intake_assessments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  facility_id INTEGER REFERENCES facilities(id),
  
  -- Rapid Triage Data
  emergency_conditions JSONB,
  triage_priority VARCHAR(20),
  vital_signs JSONB,
  gestational_age_data JSONB,
  
  -- Demographics and Identification
  personal_information JSONB,
  identification_data JSONB,
  contact_details JSONB,
  socioeconomic_factors JSONB,
  
  -- Clinical Baseline
  medical_history JSONB,
  reproductive_history JSONB,
  family_history JSONB,
  
  -- Quality and Validation
  completion_score INTEGER,
  validation_status JSONB,
  clinical_priority VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Functional Requirements

1. The system shall implement immediate emergency triage screening for urgent conditions requiring emergency referral protocols
2. The system shall capture comprehensive client demographics with NRC and NUPIN validation and existing patient record integration
3. The system shall assess gestational age through LMP and clinical evaluation with automated dating calculations and discrepancy flagging
4. The system shall record vital signs with automated alert generation for abnormal parameters requiring immediate clinical attention
5. The system shall document comprehensive medical history including chronic conditions, medications, and allergies with risk factor identification
6. The system shall capture reproductive history including contraceptive use, previous pregnancies, and gynecological conditions
7. The system shall assess family medical history with genetic risk factor identification for maternal-fetal complications
8. The system shall implement real-time data validation with clinical range checking, consistency verification, and completeness scoring
9. The system shall provide intelligent missing data prioritization based on clinical significance and care pathway requirements
10. The system shall generate automated care pathway recommendations based on intake assessment and clinical priority classification
11. The system shall support offline data capture capabilities for rural settings with synchronization protocols
12. The system shall integrate with existing patient record systems for duplicate detection and record merge capabilities

## Business Rules

### Emergency Triage Prioritization
- **Emergency Conditions**: Severe hypertension (≥160/110), heavy bleeding, severe abdominal pain, signs of pre-eclampsia trigger immediate emergency protocol
- **Vital Signs Alerts**: Temperature >38.5°C, BP >140/90, pulse >100 or <60, respiratory rate >24 trigger clinical alerts and monitoring protocols
- **Gestational Age Validation**: LMP-based dating cross-validated with clinical assessment, ultrasound correlation when available
- **Triage Classification**: Emergency (immediate intervention), Urgent (within 1 hour), Routine (standard workflow) with appropriate care pathways

### Client Demographics and Validation Standards
- **Identification Verification**: NRC validation through format checking, NUPIN cross-reference for existing patient records
- **Contact Information Requirements**: Minimum two contact methods required, emergency contact mandatory with relationship specification
- **Address Validation**: Geographical coordinates for rural locations, facility catchment area verification, referral pathway mapping
- **Socioeconomic Assessment**: Education level, occupation, household size with clinical relevance indicators for care planning

### Clinical History and Risk Assessment
- **Medical History Completeness**: Chronic conditions, current medications, allergies require comprehensive documentation with clinical significance weighting
- **Risk Factor Identification**: Diabetes, hypertension, cardiac conditions, previous complications flagged for enhanced monitoring and care protocols
- **Reproductive History Validation**: Previous pregnancies, delivery outcomes, contraceptive history with clinical significance for current pregnancy
- **Family History Scoring**: Genetic risk factors for maternal-fetal complications assessed with evidence-based clinical significance weighting

## Acceptance Criteria

| ID | Given (initial state) | When (action) | Then (expected outcome) |
|----|----------------------|---------------|------------------------|
| **AC1** | New client presents for initial antenatal visit | Provider initiates rapid assessment | System displays emergency triage checklist with immediate condition screening and priority classification based on clinical urgency |
| **AC2** | Client reports LMP date during gestational age assessment | Provider enters LMP and current date | System automatically calculates gestational age, estimated delivery date, and flags dating discrepancies for clinical review |
| **AC3** | Provider enters vital signs showing elevated blood pressure (150/95) | They complete vital signs documentation | System generates immediate clinical alert with pre-eclampsia screening recommendation and monitoring protocol initiation |
| **AC4** | Client provides NRC number during demographic capture | Provider enters identification information | System validates NRC format, searches existing patient database, displays matching records for merge consideration |
| **AC5** | Intake assessment shows 70% completion with missing critical clinical data | Provider attempts to proceed to care planning | System displays prioritized missing data list with clinical significance indicators and completion guidance |
| **AC6** | Client indicates diabetes history during medical assessment | Provider documents chronic condition | System flags high-risk pregnancy status, generates monitoring recommendations, suggests appropriate specialist referral |
| **AC7** | Provider works in rural setting with intermittent connectivity | They complete client intake assessment | System functions offline, stores data locally, synchronizes when connectivity restored with conflict resolution |

## Technical Specifications

### Database Changes
- Create comprehensive `client_intake_assessments` table with triage, demographics, clinical baseline, and validation fields
- Add indexing for rapid client lookup, triage priority queries, and completion status tracking
- Implement data validation constraints for clinical ranges, required fields, and referential integrity

### API Changes
- POST `/api/clients/intake` for comprehensive client intake assessment creation with validation
- GET `/api/clients/:id/intake-status` for completion tracking and missing data identification
- PATCH `/api/clients/:id/intake` for progressive intake completion and real-time validation

### Integration Points
- **Patient Record System**: Seamless integration with existing patient search, registration, and medical record infrastructure
- **Facility Registry**: Integration with facility-based access control and catchment area verification
- **Clinical Decision Support**: Connection with existing WHO guideline compliance and clinical protocols
- **Offline Capability**: Robust offline functionality with synchronization for rural healthcare settings

### Performance Requirements
- Rapid triage assessment completion within 3 minutes with immediate priority classification
- Data validation processing under 200ms with real-time feedback and clinical range checking
- Offline capability with local storage and efficient synchronization protocols for rural settings

## Definition of Done

- [ ] Emergency triage workflow implemented with immediate clinical alert generation and priority case identification
- [ ] Comprehensive demographic capture with validation, verification, and duplicate detection capabilities
- [ ] Clinical baseline assessment including medical, reproductive, and family history with risk factor identification
- [ ] Real-time data validation with clinical range checking, consistency verification, and completeness scoring
- [ ] Integration with existing patient record systems, authentication, and facility-based access control
- [ ] Offline capability for rural settings with robust synchronization and conflict resolution
- [ ] Healthcare provider workflow testing completed with intake efficiency validation and clinical usability
- [ ] Performance benchmarks met for rapid assessment, data validation, and system responsiveness