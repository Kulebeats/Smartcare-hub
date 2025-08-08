# [BR-ANC-01] PrEP Risk Assessment Foundation

## Epic Link
ANC-PREP-ENHANCEMENT-2025

## Module
ANC

## Sequence
01 (Foundation)

## Priority
**Critical** — Essential for maternal HIV prevention compliance with WHO guidelines, directly impacting patient safety in high-risk pregnancy scenarios requiring immediate PrEP intervention protocols.

## Dependencies
**Depends On**: None (foundational component)  
**Enables**: [BR-ANC-02] Eligibility Assessment Workflow, [BR-ANC-03] Dynamic Alert Modals, [BR-ANC-05] Clinical Decision Support Integration

## User Story

### 1. Title
Enhanced PrEP Risk Assessment with Real-Time Clinical Decision Support

### 2. User Story
**As a** healthcare provider conducting antenatal care consultations,  
**I want** a comprehensive PrEP risk assessment tool with real-time 20-point scoring and evidence-based clinical recommendations,  
**So that** I can accurately evaluate maternal HIV prevention needs and provide standardized PrEP counseling aligned with WHO guidelines within 5 minutes per assessment.

### 3. Acceptance Criteria
| # | Given | When | Then |
|---|-------|------|------|
| 1 | The provider opens the PrEP assessment modal with assessmentData state initialized | They access the risk assessment tab | Form displays 11 mandatory fields (inconsistent_condom_use, multiple_partners, recent_sti, partner_hiv_status_known, partner_not_on_art, partner_detectable_viral_load, partner_multiple_partners, partner_injection_drug_use, pregnancy_trimester, plans_to_breastfeed) with real-time validation |
| 2 | The provider selects "no" for inconsistent_condom_use triggering conditional validation | They complete this field and system executes calculateANCPrepRisk() | System adds 2 points to riskScore, shows additional condom_reasons field, updates progress indicator through getCompletionStatus(), and validates conditional field requirements |
| 3 | The provider marks partner as HIV+ not on ART with partner_not_on_art = "yes" | They select this high-risk factor | System adds 3 points through calculateANCPrepRisk(), updates calculatedRisk state, shows current total score with getRiskLevel(score) color coding (red for high risk), and logs score calculation |
| 4 | The assessment has getRiskAssessmentCompletion().isComplete = false with <60% completion | Provider attempts to trigger modal | System prevents modal opening through getCompletionStatus() validation, returns calculatedRisk.shouldShowModal = false, and shows toast with validateMandatoryFields() missing field list |
| 5 | All 11 mandatory fields completed with calculateANCPrepRisk() returning score ≥5 and completionStatus.isComplete = true | Assessment reaches 100% completion threshold | PrepDynamicAlertModal opens automatically with shouldShowModal = true, displays risk-stratified recommendations from generateClinicalRecommendations(), and executes handleChildModalStateChange() for proper state management |
| 6 | Provider selects partner_hiv_status_known = "yes" then partner_hiv_status = "positive" | They complete partner HIV status workflow | System dynamically enables conditional fields (partner_not_on_art, partner_detectable_viral_load), applies conditional scoring, updates risk calculation in real-time, and validates partner-specific risk factors |
| 7 | Provider completes pregnancy_trimester = "second" and plans_to_breastfeed = "yes" | They finish pregnancy modifier questions | System adds 2 points total (1 each), includes pregnancy-specific recommendations in calculatedRisk.recommendations, adjusts clinical guidance for trimester considerations, and updates risk classification |
| 8 | Risk calculation returns moderate risk (score 5-9) with completion ≥60% | calculateANCPrepRisk() executes with complete data | PrepDynamicAlertModal renders with moderate risk styling, shows targeted clinical actions, includes enhanced monitoring requirements, and provides specific adherence counseling recommendations |
| 9 | Provider partially completes assessment then returns later | Form state persistence through useState and component unmount | System preserves assessmentData state, maintains accurate progress indicators, prevents modal triggering until genuine completion, and logs assessment continuation |
| 10 | System handles edge cases with conflicting or incomplete data | Provider enters inconsistent responses or navigates away mid-assessment | System validates data integrity through validateMandatoryFields(), provides specific error messages, maintains form state consistency, and prevents calculation errors through safety guards |

### 4. Functional Requirements
| # | Requirement Description |
|---|-------------------------|
| FR1 | System shall implement structured risk assessment using assessmentData state with 11 mandatory fields validated through getRiskAssessmentCompletion() including client risk factors (inconsistent_condom_use, multiple_partners, recent_sti), partner risk factors (partner_hiv_status_known, partner_not_on_art, partner_detectable_viral_load, partner_multiple_partners, partner_injection_drug_use), and pregnancy modifiers (pregnancy_trimester, plans_to_breastfeed) |
| FR2 | System shall execute real-time 20-point scoring through calculateANCPrepRisk() with weighted factors: client risks (2+2+3=7 max), partner risks (3+3+2+3=11 max), pregnancy modifiers (1+1=2 max), updating calculatedRisk state on every field change with comprehensive logging |
| FR3 | System shall display visual progress indicators through getCompletionStatus() showing "X/11 fields completed (Y%)" with color-coded risk levels using getRiskLevel(score): green (low 0-4), yellow (moderate 5-9), red (high ≥10), and real-time score updates |
| FR4 | System shall auto-trigger PrepDynamicAlertModal through handleChildModalStateChange() when completionStatus.isComplete = true AND calculateANCPrepRisk() returns shouldShowModal = true, with 60% completion threshold validation and triggerModalOnce() to prevent duplicates |
| FR5 | System shall implement risk classification using getRiskLevel() algorithm with clinical thresholds: Low (0-4 points) showing basic counseling, Moderate (5-9 points) offering PrEP with monitoring, High (≥10 points) strongly recommending PrEP with enhanced support, each with specific color coding and clinical recommendations |
| FR6 | System shall provide conditional field validation through validateCounselingSection() showing context-sensitive help, requiring additional details for high-risk selections (sti_types for recent_sti, condom_reasons for inconsistent use), with clinical rationale tooltips and WHO guideline references |
| FR7 | System shall validate pregnancy-specific factors with trimester-based scoring (1 point for second/third trimester), breastfeeding risk assessment considering partner HIV status, gestational age calculations for clinical significance, and pregnancy-specific clinical recommendations in generateClinicalRecommendations() |
| FR8 | System shall generate comprehensive risk summary through generateClinicalRecommendations() including decision status, clinical context, immediate actions array, monitoring requirements, follow-up timeline, safety considerations, alternative options, and protocol references with complete clinical guidance |
| FR9 | System shall maintain assessment audit trail with useState persistence, console logging for all state changes, timestamp tracking for field completion, user interaction logging through handleChildModalStateChange(), and comprehensive validation status tracking through getCompletionStatus() |
| FR10 | System shall implement conditional field logic with partner HIV status workflow (partner_hiv_status_known → partner_hiv_status → conditional partner risk fields), STI type specification for recent_sti = "yes", condom barrier reasons for inconsistent_condom_use = "no", with proper validation and scoring |
| FR11 | System shall provide modal state management through handleChildModalStateChange() with proper parent-child relationship preservation, event isolation with stopPropagation(), modal hierarchy management, and seamless integration with PrepDynamicAlertModal, PrepEligibilityModal, and POCTestOrderDialog |
| FR12 | System shall execute performance optimization with useMemo for calculatedRisk, useState for efficient state updates, conditional rendering for field visibility, debounced validation, and sub-100ms response times for risk calculation and modal triggering |

### 5. Data Elements and Business Rules

#### Core Data Structure - PrEP Risk Assessment

| Category | Field Name | Data Type | Values | Required | Points | Conditional Logic |
|----------|------------|-----------|--------|----------|--------|------------------|
| **Client Risk Factors** | inconsistent_condom_use | String | "yes", "no", "" | Yes | 2 if "no" | Shows condom_reasons if "no" |
| | condom_reasons | Array | Multiple reasons | Conditional | 0 | Required if inconsistent_condom_use = "no" |
| | multiple_partners | String | "yes", "no", "" | Yes | 2 if "yes" | None |
| | recent_sti | String | "yes", "no", "" | Yes | 3 if "yes" | Shows sti_types if "yes" |
| | sti_types | Array | STI types | Conditional | 0 | Required if recent_sti = "yes" |
| **Partner Risk Factors** | partner_hiv_status_known | String | "yes", "no", "" | Yes | 0 | Controls partner status questions |
| | partner_hiv_status | String | "positive", "negative", "unknown", "" | Conditional | 0 | Required if partner_hiv_status_known = "yes" |
| | partner_not_on_art | String | "yes", "no", "" | Yes | 3 if "yes" | None |
| | partner_detectable_viral_load | String | "yes", "no", "" | Yes | 3 if "yes" | None |
| | partner_multiple_partners | String | "yes", "no", "" | Yes | 2 if "yes" | None |
| | partner_injection_drug_use | String | "yes", "no", "" | Yes | 3 if "yes" | None |
| **Pregnancy Modifiers** | pregnancy_trimester | String | "first", "second", "third", "" | Yes | 1 if "second" or "third" | None |
| | plans_to_breastfeed | String | "yes", "no", "" | Yes | 1 if "yes" | None |
| **Calculated Fields** | total_risk_score | Number | 0-20 | Read-only | N/A | Auto-calculated sum |
| | risk_level | String | "low", "moderate", "high", "unknown" | Read-only | N/A | Based on total score |
| | completion_percentage | Number | 0-100 | Read-only | N/A | Based on completed mandatory fields |
| | shouldShowModal | Boolean | true/false | Read-only | N/A | Based on completion + risk ≥5 |

#### Field Validation Rules
| Field | Type | Required | Business Rule | Validation |
|-------|------|----------|---------------|------------|
| `inconsistent_condom_use` | Enum | Yes | Core client risk factor | Must be "yes" or "no" |
| `condom_reasons` | Array | Conditional | Required if inconsistent_condom_use = "no" | Min 1 item if visible |
| `multiple_partners` | Enum | Yes | Core client risk factor | Must be "yes" or "no" |
| `recent_sti` | Enum | Yes | Core client risk factor | Must be "yes" or "no" |
| `sti_types` | Array | Conditional | Required if recent_sti = "yes" | Min 1 item if visible |
| `partner_hiv_status_known` | Enum | Yes | Prerequisite for partner assessment | Must be "yes" or "no" |
| `partner_hiv_status` | Enum | Conditional | Required if partner_hiv_status_known = "yes" | Must be valid HIV status |
| `partner_not_on_art` | Enum | Yes | High-impact partner risk factor (3 pts) | Must be "yes" or "no" |
| `partner_detectable_viral_load` | Enum | Yes | High-impact partner risk factor (3 pts) | Must be "yes" or "no" |
| `partner_multiple_partners` | Enum | Yes | Medium-impact partner risk factor (2 pts) | Must be "yes" or "no" |
| `partner_injection_drug_use` | Enum | Yes | High-impact partner risk factor (3 pts) | Must be "yes" or "no" |
| `pregnancy_trimester` | Enum | Yes | Pregnancy-specific modifier | Must be "first", "second", or "third" |
| `plans_to_breastfeed` | Enum | Yes | Pregnancy-specific modifier | Must be "yes" or "no" |

#### Risk Calculation Business Rules

| Risk Category | Scoring Logic | Points | Calculation Method |
|---------------|--------------|--------|-------------------|
| **Client Risk Factors** | Inconsistent condom use = "no" | 2 | Direct scoring |
| | Multiple partners = "yes" | 2 | Direct scoring |
| | Recent STI = "yes" | 3 | Direct scoring |
| | **Maximum Client Points** | **7** | Sum of above |
| **Partner Risk Factors** | Partner not on ART = "yes" | 3 | Direct scoring |
| | Partner detectable viral load = "yes" | 3 | Direct scoring |
| | Partner multiple partners = "yes" | 2 | Direct scoring |
| | Partner injection drug use = "yes" | 3 | Direct scoring |
| | **Maximum Partner Points** | **11** | Sum of above |
| **Pregnancy Modifiers** | Pregnancy trimester = "second" or "third" | 1 | Conditional scoring |
| | Plans to breastfeed = "yes" | 1 | Direct scoring |
| | **Maximum Pregnancy Points** | **2** | Sum of above |
| **Total Risk Score** | Sum of all categories | **0-20** | calculateRiskScore() function |

#### Risk Level Classification Rules

| Risk Level | Score Range | Color Coding | Clinical Action | Modal Trigger |
|------------|-------------|--------------|-----------------|---------------|
| **Low** | 0-4 points | Green | Basic counseling, routine follow-up | Toast notification only |
| **Moderate** | 5-9 points | Yellow | PrEP offered with monitoring | Modal with standard recommendations |
| **High** | ≥10 points | Red | PrEP strongly recommended | Modal with enhanced support |
| **Unknown** | N/A | Gray | Incomplete assessment | No modal until completion |

#### Completion Validation Rules

| Validation Type | Field Count | Completion Threshold | Trigger Condition |
|-----------------|-------------|---------------------|-------------------|
| **Mandatory Fields** | 11 total | 60% (7 fields) | Modal trigger enabled |
| **Full Completion** | 11 total | 100% (11 fields) | All clinical features enabled |

| Field Name | Validation Rule | Error Message | Dependency |
|------------|----------------|---------------|------------|
| inconsistent_condom_use | Must be "yes" or "no" | "Please select consistent condom use status" | None |
| multiple_partners | Must be "yes" or "no" | "Please select multiple partners status" | None |
| recent_sti | Must be "yes" or "no" | "Please select recent STI status" | None |
| partner_hiv_status_known | Must be "yes" or "no" | "Please select if partner HIV status is known" | None |
| partner_not_on_art | Must be "yes" or "no" | "Please select partner ART status" | None |
| partner_detectable_viral_load | Must be "yes" or "no" | "Please select partner viral load status" | None |
| partner_multiple_partners | Must be "yes" or "no" | "Please select partner multiple partners status" | None |
| partner_injection_drug_use | Must be "yes" or "no" | "Please select partner injection drug use status" | None |
| pregnancy_trimester | Must be "first", "second", or "third" | "Please select current pregnancy trimester" | None |
| plans_to_breastfeed | Must be "yes" or "no" | "Please select breastfeeding plans" | None |
| condom_reasons | Min 1 selection required | "Please select reason for inconsistent condom use" | inconsistent_condom_use = "no" |
| sti_types | Min 1 selection required | "Please select STI type(s)" | recent_sti = "yes" |

#### Data Structure Requirements

| Requirement Type | Specification | Implementation Notes |
|------------------|---------------|---------------------|
| **Completion Threshold** | 60% (7 of 11 fields) | Enables modal triggering |
| **Modal Trigger Score** | ≥5 points (moderate/high risk) | Automatic clinical decision support |
| **Maximum Risk Score** | 20 points total | Sum of all risk categories |
| **Field Dependencies** | Conditional validation | Dynamic form behavior based on responses |
| **State Management** | Real-time calculation | Updates on every field change |

### 6. Definition of Done (DoD)
- All 9 functional requirements implemented with backward compatibility
- Clinical validation with WHO/CDC guideline compliance verification
- Real-time risk calculation algorithm implemented and tested with edge cases
- Visual progress indicators and color-coded risk levels functional
- Modal triggering system validated with 60% completion threshold
- Input validations implemented for all 11 mandatory risk factors
- Existing modal state management preserved and enhanced
- Risk calculation algorithm maintains current thresholds and WHO compliance
- Progressive validation provides clinical context without workflow disruption
- Performance benchmarks met (100ms completion calculation, 60fps UI)
- Healthcare provider testing completed with efficiency validation
- Integration testing confirms no breaking changes to existing functionality
- UI/UX tested for 5-minute completion target
- UAT completed with obstetric and HIV prevention specialists
- Unit/integration tests cover risk calculation and modal triggering logic
- Clinical documentation updated with evidence-based scoring rationale and enhanced validation patterns
- Code peer-reviewed and passes healthcare data security compliance

### 7. Metadata / Governance Traceability
| Field | Description |
|-------|-------------|
| Epic / Feature | ANC PrEP Assessment Enhancement |
| Test Case ID | TC-ANC-PrEP-001 |
| Priority | Must Have |
| Clinical Guidelines | WHO 2022 PrEP Guidelines, Zambian Clinical Guidelines 2023 |
| Stakeholders | Obstetric Nurses, HIV Prevention Specialists, ANC Coordinators |
| Dependencies | Patient Management System, Clinical Decision Support Framework |
| Regulatory Compliance | HIPAA, Zambian Health Data Protection Standards |

**Tags:** [ANC, PrEP, Risk-Assessment, CDSS, WHO-Guidelines, Sprint-Ready]

## Business Context

### Current Problem
Manual risk assessment processes lack standardization and WHO guideline compliance. The current system shows incomplete assessment scenarios (0/8 to 1/11 field completion) with healthcare providers unable to progress through clinical decision workflows. System lacks intelligent validation feedback and completion guidance, resulting in suboptimal clinical decision support.

### Business Value
- Standardized risk assessment reduces consultation time by 20 minutes per patient
- Improves clinical documentation accuracy by 85%
- Decreases liability exposure through evidence-based decision support
- Increases assessment completion rates from current 40% to target 85%

### Clinical Impact
- Enhanced maternal HIV prevention through systematic risk evaluation
- Improved adherence to WHO PrEP guidelines with 20-point scoring algorithm
- Reduced mother-to-child HIV transmission risk in high-risk pregnancies
- Strengthened clinical decision support accuracy for pregnancy-related HIV prevention

## Assessment of Enhancement Requirements

### Understanding of Requirements - Building PrEP Risk Assessment From Scratch

This requirement involves creating a comprehensive 20-point PrEP risk assessment system for antenatal care that currently does not exist. The system must evaluate maternal HIV prevention needs through systematic risk factor analysis and provide evidence-based clinical decision support.

**Core Assessment Components Required:**
1. **Client Risk Factors Section** (Maximum 7 points)
   - Inconsistent condom use (2 points)
   - Multiple sexual partners (2 points)  
   - Recent STI diagnosis within 6 months (3 points)

2. **Partner Risk Factors Section** (Maximum 11 points)
   - HIV-positive partner not on ART (3 points)
   - Partner with detectable viral load (3 points)
   - Partner with multiple sexual partners (2 points)
   - Partner injection drug use (3 points)

3. **Pregnancy-Specific Modifiers** (Maximum 2 points)
   - Second or third trimester pregnancy (1 point)
   - Plans to breastfeed with HIV-positive partner (1 point)

**Risk Level Classification System:**
- Low Risk: 0-4 points (counseling and follow-up)
- Moderate Risk: 5-9 points (enhanced counseling, PrEP consideration)
- High Risk: ≥10 points (immediate PrEP discussion and support)

### Key Considerations for Implementation

**Clinical Decision Support System (CDSS) Triggers:**
1. **Real-time Risk Calculation**: Score updates immediately as each field is completed
2. **Progressive Modal Triggering**: 
   - No modal for incomplete assessments (<60% completion)
   - Clinical guidance modal for moderate/high risk when ≥60% complete
   - Toast notifications for low risk scenarios
3. **WHO Guideline Integration**: All recommendations must align with WHO Consolidated Guidelines 2024

**Data Structure Requirements:**

| Field Category | Field Name | Data Type | Point Value | Clinical Significance |
|----------------|------------|-----------|-------------|----------------------|
| **Client Risk** | inconsistent_condom_use | Boolean | 2 points | High-risk sexual behavior |
| | multiple_partners | Boolean | 2 points | Increased exposure risk |
| | recent_sti_diagnosis | Boolean | 3 points | Recent sexually transmitted infection |
| **Partner Risk** | partner_hiv_positive_not_on_art | Boolean | 3 points | Highest transmission risk |
| | partner_detectable_viral_load | Boolean | 3 points | Active viral replication |
| | partner_multiple_partners | Boolean | 2 points | Network transmission risk |
| | partner_injection_drug_use | Boolean | 3 points | High-risk behavior |
| **Pregnancy Modifiers** | second_third_trimester | Boolean | 1 point | Increased maternal risk |
| | breastfeeding_plans_hiv_partner | Boolean | 1 point | Post-partum transmission risk |
| **Calculated Fields** | total_risk_score | Number | 0-20 range | Sum of all risk points |
| | risk_level | String | 'low' \| 'moderate' \| 'high' | Risk classification |
| | completion_percentage | Number | 0-100 | Assessment completeness |
| | clinical_recommendations | Array | String array | Generated guidance |

### Best Practice User Experience for New Implementation

**Progressive Assessment Flow:**
1. **Section-Based Organization**: Group related risk factors logically
2. **Visual Risk Scoring**: Real-time score display with color-coded progress bar
3. **Contextual Field Help**: Each field includes clinical significance explanation
4. **Completion Guidance**: Clear indication of required vs. optional fields
5. **Clinical Context**: Explain why each risk factor matters for PrEP consideration

**CDSS Modal Behavior:**
- **Trigger Conditions**: Modal opens when assessment ≥60% complete AND risk score ≥5
- **Modal Content**: Risk-specific recommendations with clinical rationale
- **Action Options**: Continue to eligibility assessment, defer PrEP, schedule follow-up
- **Clinical Documentation**: Automatically generate assessment summary

### Technical Implementation Best Practices

**Form State Management:**

| Hook/Function | Purpose | Input | Output | Implementation Notes |
|---------------|---------|-------|--------|---------------------|
| usePrEPRiskAssessment() | Main state management hook | N/A | Assessment state and actions | Central state container |
| calculateRiskScore() | Real-time risk calculation | PrEPRiskAssessment data | Risk score (0-20) | Updates on field changes |
| trackCompletion() | Completion monitoring | PrEPRiskAssessment data | Completion percentage | Field-level tracking |
| setAssessmentData() | State update function | Partial assessment data | Updated state | Immutable state updates |
| setCompletionStatus() | Completion state update | CompletionStatus | Updated completion state | Progress tracking |

**Performance Considerations:**
- Debounced risk calculation (300ms) to prevent excessive re-renders
- Memoized components for risk score display
- Optimistic UI updates for responsive field interactions

## Step-by-Step Implementation Plan

### Phase 1: Core Assessment Data Structure and Validation (Days 1-2)

**Day 1: Database Schema and Core Types**

| Implementation Task | Database Table: anc_prep_risk_assessments | Field Details |
|---------------------|------------------------------------------|---------------|
| **Core Identity** | id | SERIAL PRIMARY KEY |
| | patient_id | INTEGER REFERENCES patients(id) |
| | assessment_date | TIMESTAMP DEFAULT NOW() |
| **Client Risk (max 7 pts)** | inconsistent_condom_use | BOOLEAN DEFAULT false |
| | multiple_partners | BOOLEAN DEFAULT false |
| | recent_sti_diagnosis | BOOLEAN DEFAULT false |
| **Partner Risk (max 11 pts)** | partner_hiv_positive_not_on_art | BOOLEAN DEFAULT false |
| | partner_detectable_viral_load | BOOLEAN DEFAULT false |
| | partner_multiple_partners | BOOLEAN DEFAULT false |
| | partner_injection_drug_use | BOOLEAN DEFAULT false |
| **Pregnancy Modifiers (max 2 pts)** | second_third_trimester | BOOLEAN DEFAULT false |
| | breastfeeding_plans_hiv_partner | BOOLEAN DEFAULT false |
| **Calculated Fields** | total_risk_score | INTEGER DEFAULT 0 |
| | risk_level | VARCHAR(20) with CHECK constraint |
| | completion_percentage | INTEGER DEFAULT 0 |
| | clinical_recommendations | TEXT[] array |
| **Audit Fields** | created_by | INTEGER REFERENCES users(id) |
| | updated_at | TIMESTAMP DEFAULT NOW() |

2. **TypeScript Interfaces and Schemas**

| Schema Component | Field Name | Zod Validation | Default Value | Purpose |
|------------------|------------|----------------|---------------|---------|
| **Client Risk Schema** | inconsistent_condom_use | z.boolean() | false | Condom use assessment |
| | multiple_partners | z.boolean() | false | Partner count risk |
| | recent_sti_diagnosis | z.boolean() | false | STI history |
| **Partner Risk Schema** | partner_hiv_positive_not_on_art | z.boolean() | false | Partner HIV status |
| | partner_detectable_viral_load | z.boolean() | false | Viral load risk |
| | partner_multiple_partners | z.boolean() | false | Partner behavior |
| | partner_injection_drug_use | z.boolean() | false | IDU risk factor |
| **Pregnancy Modifiers** | second_third_trimester | z.boolean() | false | Trimester assessment |
| | breastfeeding_plans_hiv_partner | z.boolean() | false | Breastfeeding risk |

| Export Type | Declaration | Usage |
|-------------|-------------|-------|
| prepRiskAssessmentSchema | Zod schema object | Form validation |
| PrEPRiskAssessmentInput | z.infer<typeof prepRiskAssessmentSchema> | TypeScript interface |

**Day 2: Risk Calculation Engine**

| Implementation Task | Function: calculatePrEPRiskScore() | Algorithm Details |
|---------------------|-------------------------------------|-------------------|
| **Input Parameter** | assessment: PrEPRiskAssessmentInput | Validated assessment data |
| **Output** | RiskCalculationResult | Score, level, breakdown, recommendations |
| **Client Risk Logic** | if inconsistent_condom_use → +2 points | totalScore += 2, clientRiskFactors += 2 |
| | if multiple_partners → +2 points | totalScore += 2, clientRiskFactors += 2 |
| | if recent_sti_diagnosis → +3 points | totalScore += 3, clientRiskFactors += 3 |
| **Partner Risk Logic** | if partner_hiv_positive_not_on_art → +3 points | totalScore += 3, partnerRiskFactors += 3 |
| | if partner_detectable_viral_load → +3 points | totalScore += 3, partnerRiskFactors += 3 |
| | if partner_multiple_partners → +2 points | totalScore += 2, partnerRiskFactors += 2 |
| | if partner_injection_drug_use → +3 points | totalScore += 3, partnerRiskFactors += 3 |
| **Pregnancy Logic** | if second_third_trimester → +1 point | totalScore += 1, pregnancyModifiers += 1 |
| | if breastfeeding_plans_hiv_partner → +1 point | totalScore += 1, pregnancyModifiers += 1 |
| **Risk Classification** | totalScore ≤4 → 'low' | Risk threshold classification |
| | totalScore 5-9 → 'moderate' | Intermediate risk level |
| | totalScore ≥10 → 'high' | High risk requiring intervention |

| Return Object | Field | Data Type | Content |
|---------------|-------|-----------|---------|
| RiskCalculationResult | totalScore | Number | Sum of all risk points (0-20) |
| | riskLevel | String | 'low', 'moderate', or 'high' |
| | scoringBreakdown | Object | Points by category |
| | clinicalRecommendations | Array | Generated clinical guidance |

### Phase 2: User Interface Components (Days 3-4)

**Day 3: Assessment Form Components**

| Component Task | Component: ClientRiskFactorsSection | Implementation Details |
|----------------|-------------------------------------|------------------------|
| **Structure** | Card with header and content | Client risk factors container |
| **Header** | CardTitle with User icon and badge | "Client Risk Factors" + "Max 7 points" |
| **Content** | CardContent with space-y-4 | Form fields container |
| **Field Pattern** | FormField with checkbox | Reusable field pattern |
| **Checkbox Logic** | onCheckedChange handler | Updates field and calls onFieldComplete |
| **Label Display** | Label with point value | "Inconsistent condom use (2 points)" |
| **Help System** | TooltipProvider with Info icon | Clinical context on hover |
| **Clinical Tooltip** | TooltipContent | "Inconsistent or no condom use increases HIV transmission risk" |

| Field Implementation | Props Interface | Event Handling |
|---------------------|-----------------|----------------|
| RiskFactorsSectionProps | values, onChange, onFieldComplete | State management interface |
| field.onChange() | React Hook Form integration | Form state update |
| onFieldComplete() | Custom completion tracking | Progress calculation |

5. **Real-time Risk Score Display**

| Component Task | Component: RiskScoreIndicator | Implementation Details |
|----------------|-------------------------------|------------------------|
| **Props Interface** | RiskScoreProps | totalScore, riskLevel, completionPercentage |
| **Color Function** | getRiskColor(level) | Returns CSS classes based on risk level |
| **Low Risk** | 'low' → 'text-green-600 bg-green-50' | Green color scheme |
| **Moderate Risk** | 'moderate' → 'text-yellow-600 bg-yellow-50' | Yellow color scheme |
| **High Risk** | 'high' → 'text-red-600 bg-red-50' | Red color scheme |
| **Container** | div with bg-white border rounded-lg p-4 sticky top-4 | Main container styling |
| **Score Display** | flex justify-between items-center mb-2 | Header with score |
| **Score Value** | text-2xl font-bold | {totalScore}/20 display |
| **Progress Bar** | Progress component | (totalScore / 20) * 100 value |
| **Risk Badge** | Badge with dynamic color | {riskLevel.toUpperCase()} RISK |
| **Completion Status** | text-xs text-gray-500 | Assessment {completionPercentage}% complete |

**Day 4: Clinical Decision Support Modal**

| Component Task | Component: PrEPRiskCDSSModal | Modal Content Details |
|----------------|------------------------------|----------------------|
| **Props Interface** | CDSSModalProps | isOpen, onClose, riskData, onActionSelected |
| **Content Function** | getModalContent(riskLevel, score) | Risk-specific modal content |
| **Dialog Structure** | Dialog with DialogContent | max-w-2xl modal container |

| Risk Level | Modal Content | Clinical Recommendations | Available Actions |
|------------|---------------|--------------------------|-------------------|
| **Moderate Risk** | "Moderate PrEP Risk Identified" | Enhanced counseling, PrEP discussion, partner testing, follow-up in 4-6 weeks | Continue to Eligibility (primary), Enhanced Counseling, Schedule Follow-up |
| **High Risk** | "High PrEP Risk - Immediate Action Required" | Immediate PrEP discussion, safety assessment, partner notification, enhanced monitoring | Begin PrEP Assessment (primary), Clinical Safety Screening, Partner Services Referral |

| Action Objects | Structure | Purpose |
|----------------|-----------|---------|
| Action Interface | { id, label, primary } | Modal action buttons |
| Primary Actions | primary: true | Main recommended action |
| Secondary Actions | Standard actions | Additional options |

### Phase 3: Integration and State Management (Days 5-6)

**Day 5: State Management and Auto-save**

| Hook Task | Hook: usePrEPRiskAssessment | Implementation Details |
|-----------|----------------------------|------------------------|
| **Parameters** | patientId: string | Patient identifier |
| **State Variables** | assessment, riskCalculation, completionStatus, shouldShowCDSS | Core state management |
| **Auto-save** | useDebouncedCallback(saveAssessment, 2000) | 2-second debounced save |
| **Risk Calculation** | useEffect with calculatePrEPRiskScore() | Real-time risk updates |
| **Completion Tracking** | calculateCompletionPercentage() | Progress monitoring |
| **CDSS Trigger** | completion.percentage >= 60 && riskLevel !== 'low' | Modal trigger logic |
| **Dependencies** | [assessment, debouncedSave] | Effect dependency array |

| Return Object | Field | Type | Purpose |
|---------------|-------|------|---------|
| State | assessment | PrEPRiskAssessmentInput | Assessment data |
| | riskCalculation | RiskCalculationResult | Calculated risk results |
| | completionStatus | CompletionStatus | Progress tracking |
| | shouldShowCDSS | Boolean | Modal trigger state |
| Actions | setAssessment | Function | Update assessment data |
| | setShouldShowCDSS | Function | Control modal visibility |

**Day 6: API Integration and Testing**

| API Task | Endpoint: POST /api/patients/:patientId/prep-risk-assessment | Implementation Details |
|----------|--------------------------------------------------------------|------------------------|
| **Function** | savePrEPRiskAssessment() | Async function |
| **Parameters** | patientId (string), assessment (PrEPRiskAssessmentInput) | Input parameters |
| **Return Type** | Promise<PrEPRiskAssessmentResult> | Response promise |
| **Risk Calculation** | calculatePrEPRiskScore(assessment) | Real-time calculation |
| **Database Insert** | db.insert(prepRiskAssessments).values() | Drizzle ORM insert |
| **Completion** | calculateCompletionPercentage(assessment).percentage | Progress calculation |

| Database Fields | Source | Purpose |
|-----------------|--------|---------|
| patient_id | parseInt(patientId) | Patient reference |
| assessment fields | ...assessment | Spread assessment data |
| total_risk_score | riskCalculation.totalScore | Calculated score |
| risk_level | riskCalculation.riskLevel | Risk classification |
| clinical_recommendations | riskCalculation.clinicalRecommendations | Clinical guidance |
| completion_percentage | calculateCompletionPercentage() | Progress tracking |

9. **Integration Testing Framework**

| Test Suite | Test: PrEP Risk Assessment | Test Details |
|------------|----------------------------|--------------|
| **Test Framework** | describe('PrEP Risk Assessment') | Jest test suite |
| **High-Risk Test** | 'calculates risk score correctly for high-risk scenario' | Score calculation validation |
| **CDSS Test** | 'triggers CDSS modal for moderate risk at 60% completion' | Modal trigger logic |

| High-Risk Test Data | Field | Value | Points |
|---------------------|-------|-------|--------|
| inconsistent_condom_use | true | 2 points | Client risk |
| multiple_partners | true | 2 points | Client risk |
| recent_sti_diagnosis | true | 3 points | Client risk |
| partner_hiv_positive_not_on_art | true | 3 points | Partner risk |
| partner_detectable_viral_load | true | 3 points | Partner risk |
| **Total Score** | | | 13 points |

| Test Expectations | Assertion | Expected Value | Purpose |
|------------------|-----------|----------------|---------|
| result.totalScore | toBe(13) | 13 | Score calculation accuracy |
| result.riskLevel | toBe('high') | 'high' | Risk classification accuracy |

## Technical Implementation Framework

| Framework Component | Interface/Function | Implementation Details |
|---------------------|-------------------|------------------------|
| **Enhanced Validation Hook** | useEnhancedAssessmentValidation() | Extends existing validateAssessmentCompletion |
| **Progress Interface** | AssessmentProgress | completionPercentage, completedSections, nextRequiredField, clinicalPriority |
| **Progress Component** | AssessmentProgressIndicator | Uses existing Badge, Progress, Tooltip components |
| **Field Validation** | validateFieldWithContext() | Extends current validation with clinical context |

| Progress Properties | Field | Type | Purpose |
|---------------------|-------|------|---------|
| completionPercentage | Number | Assessment completion percentage | Progress tracking |
| completedSections | String[] | Finished sections | Section tracking |
| nextRequiredField | String | Next required field | Guidance |
| clinicalPriority | String | 'low', 'medium', 'high' | Clinical urgency |

| Component Props | Interface | Parameters | Integration |
|----------------|-----------|-------------|-------------|
| AssessmentProgressProps | completion, onFieldFocus | Progress data and field focus handler | Current form state management |
| FieldValidationResult | Enhanced validation response | Clinical significance context | Current error handling patterns |

### Database Enhancements

| Schema Enhancement | Table: anc_prep_assessments | Field Details |
|-------------------|----------------------------|---------------|
| **Non-breaking Extensions** | ALTER TABLE statement | Extends existing schema |
| **Completion Metadata** | completion_metadata JSONB | Progress tracking data |
| **Completion Check** | last_completion_check TIMESTAMP | Last validation time |
| **Assessment Milestones** | assessment_milestones TEXT[] | Progress milestone tracking |

### Integration Points
- **Existing Modal System**: Enhance without replacing current modal state management
- **Risk Calculation**: Extend `calculateANCPrepRisk` with completion-aware triggers
- **Clinical Decision Support**: Integrate with existing WHO guideline compliance checks
- **Form Validation**: Build upon current Zod schema validation patterns

## Functional Requirements

1. The system shall implement progressive validation checkpoints at 25%, 50%, 75%, and 100% completion thresholds
2. The system shall provide real-time completion percentage display with visual progress indicators
3. The system shall offer contextual field guidance explaining clinical significance and next steps
4. The system shall maintain existing 20-point risk scoring algorithm with enhanced completion tracking
5. The system shall trigger clinical guidance modals only after 60% completion threshold achieved
6. The system shall preserve all existing modal state management and event isolation functionality
7. The system shall implement auto-save capabilities every 30 seconds during assessment completion
8. The system shall provide intelligent field focusing for incomplete mandatory sections

## Business Rules

### Progressive Validation Logic
- **Completion Thresholds**: 25% (basic demographics), 50% (risk factors), 75% (clinical safety), 100% (comprehensive assessment)
- **Modal Triggering**: Clinical decision modals require ≥60% completion AND calculated risk ≥5 points
- **Field Prioritization**: Client risk factors (inconsistent condom use, multiple partners, recent STI) required before partner assessment
- **Clinical Context**: Each validation message includes clinical significance and impact on patient care

### Enhanced User Experience Rules
- **Non-Disruptive Timing**: Validation feedback appears on field blur, not during active typing
- **Clinical Relevance**: All guidance messages relate to evidence-based clinical practice and patient outcomes
- **Progress Persistence**: Assessment state preserved across session interruptions with recovery capabilities
- **Intelligent Navigation**: System suggests next most clinically significant incomplete field

## Acceptance Criteria

| ID | Given (initial state) | When (action) | Then (expected outcome) |
|----|----------------------|---------------|------------------------|
| **AC1** | User accesses PrEP assessment with 0% completion | They complete first client risk factor | System displays "1/8 completed (12%)" with next field highlight and clinical significance tooltip |
| **AC2** | Assessment reaches 60% completion with moderate risk | User completes additional mandatory field | System maintains existing modal triggering logic while displaying enhanced progress feedback |
| **AC3** | User pauses assessment at 45% completion for >2 minutes | They return to continue assessment | System displays "Continue assessment - 4 fields remaining for clinical guidance" with smart field prioritization |
| **AC4** | Assessment shows incomplete partner risk factors | User indicates HIV-positive partner status | System prioritizes partner-related fields with clinical urgency indicators while maintaining existing risk calculation |
| **AC5** | Provider attempts to close modal with 70% completion | They click close button | System presents completion benefits and clinical impact of finishing assessment |

## Technical Specifications

### Database Changes
- Extend `ancPrepAssessmentSchema` with `completion_metadata`, `assessment_milestones`, `last_completion_check`
- Add indexing for completion tracking queries
- Maintain backward compatibility with existing assessment records

### API Changes
- Enhance existing assessment endpoints with completion tracking
- Add GET `/api/assessments/:id/progress` for completion status
- Maintain existing POST/PATCH patterns for assessment data

### Integration Points
- **Existing Modal System**: Preserve all current modal state management functionality
- **Risk Calculation**: Enhance without modifying core algorithm or thresholds
- **Clinical Decision Support**: Integrate completion tracking with existing WHO compliance checks

### Performance Requirements
- Completion calculation within 100ms
- Progress updates at 60fps during user interaction
- Auto-save processing without user interface interruption

## Definition of Done

- [ ] All 8 functional requirements implemented with backward compatibility
- [ ] Existing modal state management preserved and enhanced
- [ ] Risk calculation algorithm maintains current thresholds and WHO compliance
- [ ] Progressive validation provides clinical context without workflow disruption
- [ ] Healthcare provider testing completed with efficiency validation
- [ ] Performance benchmarks met (100ms completion calculation, 60fps UI)
- [ ] Integration testing confirms no breaking changes to existing functionality
- [ ] Documentation updated with enhanced validation patterns and clinical guidance