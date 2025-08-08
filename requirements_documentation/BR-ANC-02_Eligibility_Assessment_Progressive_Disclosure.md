# [BR-ANC-02] Eligibility Assessment Progressive Disclosure

## Epic Link
ANC-PREP-ENHANCEMENT-2025

## Module
ANC

## Sequence
02 (Foundation)

## Priority
**Critical** — Essential for systematic PrEP eligibility determination with clinical safety screening, ensuring evidence-based candidacy evaluation while maintaining clinical workflow efficiency.

## Dependencies
**Depends On**: [BR-ANC-01] PrEP Risk Assessment Foundation  
**Enables**: [BR-ANC-05] Prescription Management Workflow, [BR-ANC-06] POC Test Integration, [BR-ANC-07] Clinical Decision Support Analytics

## User Story

### 1. Title
Progressive Disclosure PrEP Eligibility Assessment with Clinical Safety Screening

### 2. User Story
**As a** healthcare provider evaluating PrEP candidacy during antenatal consultations,  
**I want** a structured eligibility assessment with intelligent progressive disclosure and comprehensive clinical safety screening,  
**So that** I can systematically determine PrEP appropriateness while ensuring patient safety, informed consent, and efficient clinical workflow within 8 minutes per evaluation.

### 3. Acceptance Criteria
| # | Given | When | Then |
|---|-------|------|------|
| 1 | The provider opens the eligibility tab with visibleSections state initialized | They navigate from risk assessment with activeTab = "eligibility" | Section A (risk_reduction_counselling_provided) and Section F (Clinical Safety) display with visibleSections.sectionA = true and visibleSections.sectionF = true, while visibleSections.sectionC/D/E = false by default |
| 2 | The provider selects "yes" for client_interested_in_prep triggering updateSectionVisibility() | They answer client interest with assessmentData.client_interested_in_prep = "yes" | System executes updateSectionVisibility("yes"), sets visibleSections.sectionD = true and visibleSections.sectionE = true, showing Acute HIV Symptoms and Medical History sections with proper validation |
| 3 | The provider selects "no" for client_interested_in_prep | Client indicates no interest with assessmentData.client_interested_in_prep = "no" | updateSectionVisibility("no") executes, visibleSections.sectionC = true (Follow-up Planning), while sectionD and sectionE remain false, requiring planned_next_steps array completion |
| 4 | The provider completes mandatory fields triggering validateEligibilityCompletion() | All 5+ mandatory fields pass validation with getEligibilityCompletion().isComplete = true | PrepEligibilityModal opens automatically with eligibilityData containing completion status, clinical recommendations generated through generateClinicalRecommendations(), and action buttons available |
| 5 | The provider clicks "Initiate PrEP & Continue to Prescription" in PrepEligibilityModal | handleEligibilityAction("INITIATE_PREP_AND_PRESCRIBE") is triggered | Modal closes through onClose(), handleTabChangeWithRestrictions("prescription") executes, page scrolls to prescription section using scrollIntoView(), toast notification confirms action completion |
| 6 | Provider completes Section A with risk_reduction_counselling_provided = "no" | They select counseling not provided | validateCounselingSection() requires counselling_not_provided_reasons array completion, validates "other" text field if selected, and blocks clinical safety section until proper justification provided |
| 7 | Provider attempts to access Section F before meeting prerequisites | They click clinical safety tab with isClinicalSafetyAvailable() = false | showClinicalSafetyToast() displays with specific missing requirements, Section F remains locked with visual indicators, and clinicalSafetyToastShown state prevents duplicate notifications |
| 8 | Provider completes conditional screening with hepatitis_b_screening = "yes" | They indicate hepatitis B screening performed | System requires hepatitis_b_screening_result completion through getEligibilityCompletion() validation, enables conditional result field, and includes screening results in clinical recommendations |
| 9 | Provider selects acute HIV symptoms requiring assessment | assessmentData.acute_hiv_symptoms = "yes" with symptom array completion | System validates acute_symptoms_list array completion, generates contraindication alerts through generateClinicalRecommendations(), and recommends HIV testing before PrEP initiation |
| 10 | Provider completes all eligibility sections triggering comprehensive validation | getEligibilityCompletion() returns isComplete with all conditional fields validated | System calculates final eligibility status (eligible/contraindicated/conditional), generates comprehensive clinical recommendations, enables prescription tab access, and provides complete clinical decision support |

### 4. Functional Requirements
| # | Requirement Description |
|---|-------------------------|
| FR1 | System shall implement progressive disclosure through updateSectionVisibility() with conditional section rendering based on assessmentData.client_interested_in_prep state: visibleSections.sectionC for "no" (follow-up planning), visibleSections.sectionD/E for "yes" (acute HIV symptoms/medical history), with proper state management and validation |
| FR2 | System shall maintain persistent visibility for Section A (risk_reduction_counselling_provided) and Section F (Clinical Safety) with visibleSections.sectionA = true and visibleSections.sectionF = true by default, regardless of client interest status |
| FR3 | System shall conditionally display Section C (Follow-up Planning) exclusively when assessmentData.client_interested_in_prep = "no" through visibleSections.sectionC state, requiring planned_next_steps array completion with validateCounselingSection() validation |
| FR4 | System shall conditionally render Sections D (Acute HIV) and E (Medical History) only when assessmentData.client_interested_in_prep = "yes" through visibleSections.sectionD/E state management, with acute_hiv_symptoms and kidney_disease_history field validation |
| FR5 | System shall auto-trigger PrepEligibilityModal when getEligibilityCompletion().isComplete = true with 5+ mandatory fields validation (risk_reduction_counselling_provided, client_interested_in_prep, plus conditional fields based on visible sections), executing handleChildModalStateChange() for proper modal management |
| FR6 | System shall integrate POC test ordering through handleOrderPOCTest() with "Would you like to order this test now?" prompts for baseline tests (urinalysis_performed, hepatitis_b_screening, syphilis_screening_performed), opening POCTestOrderDialog with pre-selected test types and seamless modal stacking |
| FR7 | System shall calculate eligibility status through generateClinicalRecommendations() returning "pending"/"eligible"/"contraindicated"/"conditional" based on contraindication screening, acute HIV symptoms assessment, kidney disease history, and baseline test results with comprehensive clinical logic |
| FR8 | System shall provide real-time contraindication screening through validateEligibilityCompletion() with immediate safety alerts for kidney disease (kidney_disease_history), drug allergies (drug_allergy_tenofovir), and acute HIV symptoms (acute_symptoms_list), generating clinical recommendations with appropriate referral guidance |
| FR9 | System shall maintain section completion indicators through getEligibilityCompletion() showing "X/Y completed" badges, visual progress tracking, conditional field validation, and completion status updates with proper state synchronization across all visible sections |
| FR10 | System shall implement clinical safety prerequisites through isClinicalSafetyAvailable() requiring risk_reduction_counselling_provided = "yes" AND client_interested_in_prep = "yes" before enabling Section F access, with showClinicalSafetyToast() for requirement notifications |
| FR11 | System shall provide conditional field validation with hepatitis_b_screening_result required when hepatitis_b_screening = "yes", syphilis_screening_result required when syphilis_screening_performed = "yes", and proper array validation for planned_next_steps and acute_symptoms_list |
| FR12 | System shall execute comprehensive eligibility determination through generateClinicalRecommendations() including screening guidance for reactive results (syphilis, hepatitis B), clinical context generation, immediate action recommendations, monitoring requirements, follow-up timelines, and protocol references with complete clinical decision support |
| FR13 | System shall manage modal hierarchy through handleChildModalStateChange() enabling seamless transitions between PrepEligibilityModal and POCTestOrderDialog while maintaining parent modal state, proper event isolation, and modal stack management for complex clinical workflows |

### 5. Data Elements and Business Rules

#### Core Data Structure - PrEP Eligibility Assessment

| Section | Field Name | Data Type | Values | Required | Visibility Rule |
|---------|------------|-----------|--------|----------|----------------|
| **Section A** | risk_reduction_counselling_provided | String | "yes", "no", "" | Yes | Always visible |
| | counselling_topics_covered | Array | Multiple topics | Optional | Always visible |
| **Section B** | client_interested_in_prep | String | "yes", "no", "" | Yes | Always visible - Controls other sections |
| **Section C** | planned_next_steps | Array | Follow-up actions | Conditional | Only if client_interested_in_prep = "no" |
| | follow_up_date | String | ISO date | Optional | Only if client_interested_in_prep = "no" |
| **Section D** | acute_hiv_symptoms | Array | Symptom list | Conditional | Only if client_interested_in_prep = "yes" |
| | recent_hiv_test_date | String | ISO date | Optional | Only if client_interested_in_prep = "yes" |
| **Section E** | kidney_disease_history | String | "yes", "no", "" | Conditional | Only if client_interested_in_prep = "yes" |
| | bone_problems_history | String | "yes", "no", "" | Optional | Only if client_interested_in_prep = "yes" |
| | medication_allergies | Array | Allergy list | Optional | Only if client_interested_in_prep = "yes" |
| **Section F** | urinalysis_performed | String | "yes", "no", "" | Yes | Always visible |
| | creatinine_level | Number | mg/dL | Optional | Always visible |
| | hepatitis_b_screening | String | "yes", "no", "" | Yes | Always visible |
| | hepatitis_b_screening_result | String | "positive", "negative", "" | Conditional | If hepatitis_b_screening = "yes" |
| | syphilis_screening_performed | String | "yes", "no", "" | Yes | Always visible |
| | syphilis_screening_result | String | "positive", "negative", "" | Conditional | If syphilis_screening_performed = "yes" |
| **Calculated** | eligibility_status | String | "pending", "eligible", "deferred", "not_indicated" | Read-only | Auto-calculated |
| | completion_percentage | Number | 0-100 | Read-only | Based on visible sections |
| | contraindications_identified | Array | Contraindication list | Read-only | Auto-calculated |

#### Section Visibility Rules

| Section | Display Logic | Visibility Condition | Purpose |
|---------|--------------|---------------------|---------|
| **Section A** | Always visible | sectionA = true | Risk Reduction Counseling - Core requirement |
| **Section B** | Always visible | sectionB = true | Client Interest - Controls progressive disclosure |
| **Section C** | Conditional | client_interested_in_prep = "no" | Follow-up Planning - Only for non-interested clients |
| **Section D** | Conditional | client_interested_in_prep = "yes" | Acute HIV Assessment - Only for interested clients |
| **Section E** | Conditional | client_interested_in_prep = "yes" | Medical History - Only for interested clients |
| **Section F** | Always visible | sectionF = true | Clinical Safety Assessment - Always required |

#### Field Validation Rules
| Field | Type | Required | Conditional Logic | Business Rule |
|-------|------|----------|------------------|---------------|
| `risk_reduction_counselling_provided` | Enum | Always | None | Must be "yes" or "no" |
| `client_interested_in_prep` | Enum | Always | Controls section visibility | Must be "yes" or "no" |
| `planned_next_steps` | Array | Conditional | Required if sectionC visible | Min 1 item when client not interested |
| `acute_hiv_symptoms` | Array | Conditional | Required if sectionD visible | Min 1 item when client interested |
| `kidney_disease_history` | Enum | Conditional | Required if sectionE visible | Must be "yes" or "no" when client interested |
| `urinalysis_performed` | Enum | Always | None | Must be "yes" or "no" |
| `hepatitis_b_screening` | Enum | Always | None | Must be "yes" or "no" |
| `hepatitis_b_screening_result` | Enum | Conditional | Required if hepatitis_b_screening = "yes" | Must be "positive" or "negative" |
| `syphilis_screening_performed` | Enum | Always | None | Must be "yes" or "no" |
| `syphilis_screening_result` | Enum | Conditional | Required if syphilis_screening_performed = "yes" | Must be "positive" or "negative" |

#### Eligibility Calculation Rules

| Eligibility Status | Criteria | Clinical Action | Next Steps |
|-------------------|----------|-----------------|------------|
| **Eligible** | No contraindications + interested + completed screening | Initiate PrEP | Continue to prescription |
| **Contraindicated** | Kidney disease OR drug allergies OR acute HIV | Defer PrEP | Refer for specialist consultation |
| **Conditional** | Positive screening results (Hep B, Syphilis) | Conditional eligibility | Treat infections first |
| **Pending** | Incomplete assessment OR awaiting test results | Cannot determine | Complete missing requirements |
| **Not Indicated** | Client not interested + no high risk factors | No PrEP needed | Schedule follow-up assessment |

#### Data Structure Requirements

| Requirement Type | Specification | Implementation Notes |
|------------------|---------------|---------------------|
| **Progressive Disclosure** | Section visibility based on client interest | Conditional rendering logic |
| **Field Dependencies** | Conditional validation rules | Dynamic requirement changes |
| **Modal Integration** | POC test ordering capability | Seamless workflow transitions |
| **Completion Tracking** | Section-based progress indicators | Real-time status updates |

#### Completion Validation Logic

| Validation Category | Required Fields | Conditional Logic | Completion Rule |
|---------------------|----------------|------------------|----------------|
| **Base Fields** | risk_reduction_counselling_provided, client_interested_in_prep | Always required | Must be "yes" or "no" |
| **Section C** | planned_next_steps | Only if client_interested_in_prep = "no" | Min 1 item required |
| **Section D** | acute_hiv_symptoms | Only if client_interested_in_prep = "yes" | Min 1 item required |
| **Section E** | kidney_disease_history | Only if client_interested_in_prep = "yes" | Must be "yes" or "no" |
| **Section F** | urinalysis_performed, hepatitis_b_screening, syphilis_screening_performed | Always required | Must be "yes" or "no" |
| **Conditional Results** | hepatitis_b_screening_result, syphilis_screening_result | If respective screening = "yes" | Must be "positive" or "negative" |

### 6. Definition of Done (DoD)
- All 9 functional requirements implemented with backward compatibility
- Progressive disclosure logic implemented with all conditional visibility scenarios
- Section visibility state management validated with client interest triggers
- POC test integration functional with seamless modal transitions
- Contraindication screening implemented with clinical safety validation
- Eligibility calculation algorithm tested with all status outcomes
- Modal auto-opening validated with 5-field completion threshold
- Input validations implemented for all conditional sections
- Existing modal state management preserved and enhanced
- Performance benchmarks met (100ms completion calculation, 60fps UI)
- Healthcare provider testing completed with efficiency validation
- Integration testing confirms no breaking changes to existing functionality
- Feature meets acceptance criteria with clinical workflow validation
- UI/UX tested for 8-minute completion target
- UAT completed with clinical safety and PrEP eligibility specialists
- Unit/integration tests cover progressive disclosure and eligibility calculation
- Clinical documentation updated with eligibility determination criteria and enhanced validation patterns
- Code peer-reviewed and passes healthcare data security standards

### 7. Metadata / Governance Traceability
| Field | Description |
|-------|-------------|
| Epic / Feature | ANC PrEP Eligibility Enhancement |
| Test Case ID | TC-ANC-ELIG-002 |
| Priority | Must Have |
| Clinical Guidelines | WHO PrEP Eligibility Criteria, Zambian Clinical Guidelines 2023 |
| Stakeholders | Clinical Officers, PrEP Coordinators, Laboratory Technicians |
| Dependencies | POC Test Ordering System, Clinical Decision Support Framework |
| Regulatory Compliance | Clinical Safety Standards, Healthcare Quality Assurance |

### 8. INVEST Evaluation
| Criterion | Explanation |
|-----------|-------------|
| **Independent** | Can be developed as standalone eligibility assessment module with clear interfaces to POC test system |
| **Negotiable** | Section visibility rules and completion thresholds can be adjusted based on clinical workflow feedback |
| **Valuable** | Reduces cognitive load by 60%, improves safety screening completeness by 75%, ensures systematic PrEP evaluation |
| **Estimable** | Well-scoped progressive disclosure implementation suitable for sprint planning and effort estimation |
| **Small** | Focused on single eligibility workflow that can be completed within one development iteration |
| **Testable** | Clear acceptance criteria with measurable section visibility triggers and eligibility calculation outcomes |

**Tags:** [ANC, PrEP, Eligibility-Assessment, Progressive-Disclosure, POC-Integration, Sprint-Ready]

## Business Context

### Current Problem
Inconsistent PrEP eligibility evaluation lacks systematic contraindication screening and patient readiness assessment. The current system shows eligibility completion status of 0/5 mandatory fields with users unable to access eligibility recommendations. Progressive disclosure needed to reduce cognitive load during complex clinical decision-making while maintaining comprehensive safety evaluation.

### Business Value
- Systematic eligibility assessment reduces clinical decision errors by 40%
- Improves safety screening completeness by 75% through structured contraindication evaluation
- Decreases consultation time by 12 minutes through intelligent section visibility
- Reduces liability through comprehensive clinical safety documentation

### Clinical Impact
- Enhanced patient safety through systematic contraindication evaluation and baseline testing requirements
- Improved informed consent processes with structured client interest assessment and follow-up planning
- Standardized PrEP candidacy determination aligned with WHO guidelines and Zambian clinical protocols
- Strengthened clinical decision support through evidence-based eligibility criteria and safety screening

## Assessment of Enhancement Requirements

### Understanding of Requirements - Building Progressive Disclosure Eligibility Assessment From Scratch

This requirement involves creating a comprehensive PrEP eligibility assessment system with intelligent progressive disclosure that adapts interface complexity based on client responses. The system must systematically evaluate PrEP candidacy while reducing cognitive load through conditional section visibility.

**Core Progressive Disclosure Sections:**
1. **Section A: Risk Reduction Counseling** (Always visible)
   - Has risk reduction counseling been provided? (Yes/No)
   - Counseling topics covered (multiple selection)
   - Client understanding assessment

2. **Section B: Client Interest Assessment** (Always visible)  
   - Is the client interested in PrEP? (Yes/No/Uncertain)
   - Reason for interest/disinterest (if applicable)
   - Additional questions needed (conditional)

3. **Section C: Follow-up Planning** (Visible only if NOT interested)
   - Alternative prevention methods discussed
   - Follow-up appointment scheduled
   - Additional support services referrals

4. **Section D: Acute HIV Assessment** (Visible only if interested)
   - Recent HIV exposure risk (past 72 hours)
   - Symptoms of acute HIV infection
   - Recent HIV testing history

5. **Section E: Medical History** (Visible only if interested)
   - Current medications and interactions
   - Chronic medical conditions
   - Previous adverse drug reactions

6. **Section F: Clinical Safety Assessment** (Always visible)
   - Contraindication screening checklist
   - Baseline laboratory requirements
   - Clinical safety evaluation

**Eligibility Determination Logic:**
- **Pending**: <5 mandatory fields completed
- **Eligible**: All safety criteria met, no contraindications
- **Deferred**: Contraindications identified or incomplete safety assessment
- **Not Indicated**: Client not interested, low risk profile

### Key Considerations for Implementation

**Progressive Disclosure State Management:**

| State Category | Field | Values | Purpose |
|----------------|-------|--------|---------|
| **Section Visibility** | sectionA | Always true | Risk Reduction Counseling |
| | sectionB | Always true | Client Interest Assessment |
| | sectionC | True if NOT interested | Follow-up Planning |
| | sectionD | True if interested | Acute HIV Assessment |
| | sectionE | True if interested | Medical History |
| | sectionF | Always true | Clinical Safety Assessment |
| **Client Interest** | clientInterest | "interested", "not_interested", "uncertain", null | Controls section visibility |
| **Completion Tracking** | totalFields | Number | Total required fields |
| | completedFields | Number | Fields with valid data |
| | percentage | 0-100 | Completion percentage |
| **Eligibility Status** | eligibilityStatus | "pending", "eligible", "deferred", "not_indicated" | Final determination |

**Clinical Safety Assessment Fields:**

| Field Category | Field Name | Data Type | Clinical Significance |
|----------------|------------|-----------|----------------------|
| **Contraindications** | kidney_problems | Boolean | Major contraindication for PrEP |
| | bone_density_issues | Boolean | Relative contraindication |
| | drug_allergies | Boolean | Drug-specific contraindication |
| | medication_interactions | Boolean | Requires medication review |
| **Baseline Testing** | urinalysis_performed | Boolean | Kidney function assessment |
| | creatinine_tested | Boolean | Kidney function screening |
| | hepatitis_b_tested | Boolean | Viral hepatitis screening |
| | syphilis_tested | Boolean | STI screening requirement |
| **Clinical Evaluation** | blood_pressure_normal | Boolean | Cardiovascular assessment |
| | weight_stable | Boolean | General health indicator |
| | general_health_good | Boolean | Overall health status |

**CDSS Triggers for Eligibility:**
1. **Auto-Modal Opening**: Triggers when 5 mandatory fields completed
2. **POC Test Integration**: "No" responses to baseline tests trigger immediate test ordering
3. **Contraindication Alerts**: Real-time alerts for identified safety concerns
4. **Eligibility Calculation**: Automatic status updates based on assessment completion

### Best Practice User Experience for Progressive Implementation

**Conditional Section Visibility Logic:**

| Section | Visibility Rule | Display Condition | Clinical Rationale |
|---------|----------------|------------------|-------------------|
| Section A | Always visible | sectionA = true | Risk reduction counseling required for all clients |
| Section B | Always visible | sectionB = true | Client interest determines workflow path |
| Section C | Conditional | clientInterest === 'not_interested' | Follow-up planning for non-interested clients |
| Section D | Conditional | clientInterest === 'interested' | Acute HIV screening for interested clients |
| Section E | Conditional | clientInterest === 'interested' | Medical history for interested clients |
| Section F | Always visible | sectionF = true | Clinical safety assessment required for all |

**Clinical Context Integration:**
- Each section header includes clinical rationale and significance
- Field-level help text explains why information is needed
- Progress indicators show completion status with clinical context
- Smart navigation highlights next most important incomplete field

**POC Test Integration Workflow:**
- Baseline test questions integrate with existing POC test ordering system
- "Would you like to order this test now?" appears for "No" responses
- Seamless modal transition to POC test interface
- Real-time updates when tests ordered through integrated workflow

### Technical Implementation Architecture

**Database Schema for Progressive Assessment:**

| Table Section | Field Name | Data Type | Constraints | Purpose |
|--------------|------------|-----------|-------------|---------|
| **Core Identity** | id | SERIAL | PRIMARY KEY | Unique assessment identifier |
| | patient_id | INTEGER | REFERENCES patients(id) | Links to patient record |
| | assessment_date | TIMESTAMP | DEFAULT NOW() | Assessment creation time |
| **Section A** | counseling_provided | BOOLEAN | DEFAULT false | Risk reduction counseling status |
| | counseling_topics | TEXT[] | Array | Topics covered in counseling |
| | client_understanding_assessed | BOOLEAN | DEFAULT false | Comprehension verification |
| **Section B** | client_interested_in_prep | VARCHAR(20) | CHECK constraint | Client interest level |
| | interest_reason | TEXT | Optional | Rationale for interest/disinterest |
| **Section C** | alternative_prevention_discussed | BOOLEAN | DEFAULT false | Alternative methods counseling |
| | followup_scheduled | BOOLEAN | DEFAULT false | Follow-up appointment status |
| | support_services_referral | TEXT[] | Array | Referral services provided |
| **Section D** | recent_hiv_exposure_risk | BOOLEAN | DEFAULT false | Recent HIV exposure assessment |
| | acute_hiv_symptoms | BOOLEAN | DEFAULT false | Acute HIV symptom screening |
| | recent_hiv_testing_date | DATE | Optional | Last HIV test date |
| **Section E** | current_medications | TEXT[] | Array | Current medication list |
| | chronic_conditions | TEXT[] | Array | Chronic medical conditions |
| | previous_adverse_reactions | TEXT[] | Array | Drug reaction history |
| **Section F** | kidney_problems | BOOLEAN | DEFAULT false | Renal function assessment |
| | bone_density_issues | BOOLEAN | DEFAULT false | Bone health screening |
| | drug_allergies | BOOLEAN | DEFAULT false | Drug allergy screening |
| | medication_interactions | BOOLEAN | DEFAULT false | Drug interaction assessment |
| | urinalysis_performed | BOOLEAN | DEFAULT false | Urine test completion |
| | creatinine_tested | BOOLEAN | DEFAULT false | Kidney function test |
| | hepatitis_b_tested | BOOLEAN | DEFAULT false | Hepatitis B screening |
| | syphilis_tested | BOOLEAN | DEFAULT false | Syphilis screening |
| | blood_pressure_normal | BOOLEAN | DEFAULT false | BP assessment |
| | weight_stable | BOOLEAN | DEFAULT false | Weight stability |
| | general_health_good | BOOLEAN | DEFAULT false | Overall health status |
| **Calculated** | visible_sections | JSONB | Dynamic | Section visibility state |
| | completion_percentage | INTEGER | DEFAULT 0 | Assessment completion |
| | mandatory_fields_completed | INTEGER | DEFAULT 0 | Required field count |
| | eligibility_status | VARCHAR(20) | CHECK constraint | Final eligibility determination |
| | eligibility_reason | TEXT | Optional | Rationale for eligibility decision |
| **Audit** | created_by | INTEGER | REFERENCES users(id) | Assessment creator |
| | updated_at | TIMESTAMP | DEFAULT NOW() | Last modification time |

## Step-by-Step Implementation Plan

### Phase 1: Enhanced Progressive Disclosure (Days 1-2)
1. **Section Completion Indicators**: Add visual progress indicators for each conditional section
2. **Clinical Context Headers**: Enhance section headers with clinical significance explanations
3. **Smart Section Transitions**: Improve transitions between sections with contextual guidance

### Phase 2: Advanced Safety Screening (Days 3-4)
4. **Contraindication Intelligence**: Enhanced contraindication detection with clinical severity weighting
5. **Baseline Test Optimization**: Streamlined POC test integration with intelligent test recommendations
6. **Safety Alert System**: Real-time safety alerts for identified contraindications and risk factors

### Phase 3: Eligibility Optimization (Days 5-6)
7. **Enhanced Completion Tracking**: Improved completion validation with clinical priority weighting
8. **Intelligent Recommendations**: Context-aware eligibility recommendations based on assessment patterns
9. **Clinical Documentation**: Comprehensive eligibility rationale documentation for clinical records

## Technical Implementation Framework

| Component | Interface/Function | Parameters | Purpose |
|-----------|-------------------|------------|---------|
| **Progressive Disclosure Hook** | useProgressiveEligibilityDisclosure() | assessmentData, clientInterest | Section visibility management |
| | ProgressiveDisclosureState | visibleSections, completionStatus, clinicalContext, nextRecommendedAction | State structure |
| **Safety Screening Component** | EnhancedSafetyScreening | contraindications, baselineTests, onContraIndicationDetected | Enhanced safety assessment |
| | SafetyScreeningProps | Array types with severity callback | Component interface |
| **Eligibility Engine** | calculateEnhancedEligibility() | assessmentData, safetyScreening, clinicalContext | Enhanced eligibility calculation |
| | EligibilityResult | Enhanced eligibility determination | Result object |

### Enhanced Progressive Disclosure Rules

| Rule Component | Function: determineSectionVisibility() | Logic | Clinical Rationale |
|----------------|----------------------------------------|-------|-------------------|
| **Always Visible** | sectionA, sectionB, sectionF | true | Core assessment sections |
| **Conditional Sections** | sectionC | clientInterest === 'not_interested' | Follow-up planning for disinterested clients |
| | sectionD, sectionE | clientInterest === 'interested' | HIV assessment and medical history for interested clients |
| **Enhanced Guidance** | enhancedGuidance | completionStatus.percentage > 60 | Clinical context help when 60% complete |

| Parameter | Data Type | Usage | Output |
|-----------|-----------|-------|--------|
| clientInterest | String | Determines section visibility | Boolean visibility states |
| completionStatus | CompletionStatus | Enables enhanced guidance | Section visibility object |

## Functional Requirements

1. The system shall implement enhanced progressive section visibility with clinical context indicators and completion status
2. The system shall provide intelligent contraindication screening with severity weighting and clinical impact assessment
3. The system shall integrate baseline testing recommendations with POC test ordering workflow for immediate safety evaluation
4. The system shall maintain existing five mandatory fields requirement while adding clinical significance indicators
5. The system shall auto-trigger eligibility recommendations modal with enhanced clinical rationale and next steps
6. The system shall support client interest-based section disclosure while providing clinical context for each conditional section
7. The system shall implement comprehensive safety screening with real-time contraindication alerts and clinical guidance
8. The system shall generate detailed eligibility documentation with clinical justification and evidence-based recommendations

## Business Rules

### Enhanced Progressive Disclosure Logic
- **Default Visibility**: Sections A (Risk Reduction Counseling) and F (Clinical Safety Assessment) always visible with clinical context
- **Interest-Based Conditional Display**: Section C (Follow-up Planning) visible only when client not interested; Sections D (Acute HIV) and E (Medical History) visible only when interested
- **Completion Enhancement**: Each section displays completion percentage and clinical significance indicators
- **Clinical Context Integration**: Section headers include clinical rationale and impact on patient care outcomes

### Advanced Safety Screening Rules
- **Contraindication Severity**: Mild (monitoring required), Moderate (enhanced counseling), Severe (PrEP exclusion) with clinical management protocols
- **Baseline Testing Priority**: Urinalysis, creatinine, hepatitis B, syphilis screening with intelligent test recommendation based on risk factors
- **POC Integration Logic**: "No" responses to baseline tests trigger immediate POC test ordering opportunity with clinical justification
- **Safety Alert Thresholds**: Real-time alerts for identified contraindications with clinical severity and management recommendations

### Enhanced Eligibility Determination
- **Automatic Calculation**: Real-time eligibility status updates with clinical reasoning and evidence-based justification
- **Clinical Context Weighting**: Assessment completeness weighted by clinical significance and patient safety impact
- **Documentation Requirements**: Comprehensive eligibility rationale with clinical evidence and safety assessment summary
- **Modal Triggering Enhancement**: Eligibility modal includes enhanced clinical recommendations and structured next steps

## Acceptance Criteria

| ID | Given (initial state) | When (action) | Then (expected outcome) |
|----|----------------------|---------------|------------------------|
| **AC1** | Provider accesses eligibility assessment with default sections | They indicate client is interested in PrEP | System reveals Sections D and E with clinical context headers and completion indicators while maintaining existing section visibility logic |
| **AC2** | Client indicates lack of interest during assessment | Provider selects "not interested" option | System displays Section C (Follow-up Planning) with clinical alternatives and hides D/E sections while providing counseling continuation guidance |
| **AC3** | Provider completes 5 mandatory eligibility fields with clinical safety screening | Assessment reaches completion threshold | System automatically opens eligibility recommendations modal with enhanced clinical rationale and evidence-based next steps |
| **AC4** | Safety screening indicates moderate contraindication (kidney concerns) | Provider documents renal history | System generates clinical alert with severity weighting, monitoring recommendations, and alternative clinical management options |
| **AC5** | Provider responds "No" to baseline urinalysis completion | They complete the safety screening response | System displays "Order urinalysis now? Clinical significance: Baseline renal function assessment" with POC test integration |
| **AC6** | Assessment shows mixed eligibility factors (high risk but contraindications) | Provider completes comprehensive evaluation | System generates nuanced eligibility recommendation with clinical trade-offs, risk-benefit analysis, and structured clinical decision support |

## Technical Specifications

### Database Changes
- Extend eligibility schema with `clinical_context_metadata`, `contraindication_severity_scores`, `section_completion_tracking`
- Add clinical reasoning fields for eligibility documentation and audit trail
- Maintain backward compatibility with existing eligibility assessment records

### API Changes
- Enhance existing eligibility endpoints with clinical context and severity weighting
- Add GET `/api/eligibility/:id/clinical-context` for enhanced clinical reasoning
- Maintain existing eligibility calculation patterns with clinical intelligence extensions

### Integration Points
- **Progressive Disclosure**: Enhance existing conditional section visibility with clinical context integration
- **POC Test Integration**: Strengthen existing POCTestOrderDialog connectivity with intelligent test recommendations
- **Clinical Decision Support**: Integrate enhanced eligibility logic with existing WHO compliance and safety protocols
- **Modal Management**: Preserve existing eligibility modal auto-triggering with enhanced clinical content

### Performance Requirements
- Section visibility transitions within 150ms with smooth animations
- Contraindication screening processing under 200ms with real-time feedback
- Clinical context calculation without user interface performance impact

## Definition of Done

- [ ] Enhanced progressive disclosure maintains existing conditional logic while adding clinical context
- [ ] Advanced safety screening provides real-time contraindication detection with severity weighting
- [ ] Eligibility calculation preserves existing automation while adding clinical intelligence
- [ ] POC test integration enhanced without disrupting existing workflow patterns
- [ ] Clinical context indicators provide meaningful guidance without overwhelming interface
- [ ] Healthcare provider testing validates improved efficiency and clinical decision support
- [ ] All existing eligibility functionality preserved with enhanced clinical capabilities
- [ ] Documentation updated with progressive disclosure patterns and clinical safety protocols