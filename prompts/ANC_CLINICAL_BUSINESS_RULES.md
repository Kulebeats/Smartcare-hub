# ANC Clinical Business Rules & Decision Support

## Overview
This document consolidates all clinical business rules, decision support logic, and assessment guidelines for the Antenatal Care (ANC) module in SmartCare PRO Version 1.8.3. This comprehensive guide covers WHO-compliant clinical decision support, advanced business rules, and integrated workflows with all implemented features including the dynamic alert modal system, complete PrEP risk assessment, and form trigger-based CDSS modals.

## Core Business Rules Framework

### 1. Previous Pregnancy Assessment Logic
**Rule ID:** ANC-BR-001
**Implementation:** Dynamic pregnancy history management
- Zero pregnancies: Hide all pregnancy-related sections
- 1-15 pregnancies: Display individual pregnancy details with conditional logic
- Gestational age thresholds determine field availability:
  - Abortion options: Available for pregnancies < 6 months
  - Delivery modes: Available for pregnancies ≥ 7 months
  - Birth outcomes: Only for live births ≥ 7 months
- Symphysial-fundal height as fallback dating method

### 2. Social Habits & Complications Assessment
**Rule ID:** ANC-BR-002 & ANC-BR-003
**Implementation:** Mutually exclusive conditional logic
- **Social Habits**: "None" selection disables all habit options; "Present" enables detailed assessment
- **Complications**: "No complications" disables detailed options; "Present" enables categorized selection
- Both use collapsible design with checkbox-based toggle system
- Organized into logical clinical groups for efficient data capture

## WHO Guidelines Implementation & Clinical Features

### Decision Support Systems Architecture
The ANC module integrates multiple specialized decision support engines:

#### 1. IPV Decision Support Engine
- WHO-compliant screening protocols with 5-tier risk stratification
- Real-time safety planning integration
- Comprehensive alert system with color-coded severity levels
- Immediate danger detection with automated response protocols

#### 2. ANC Clinical Decision Support
- Vital signs monitoring with two-stage protocols
- Medication management and compliance tracking
- Risk assessment algorithms with automated referral triggers
- Laboratory integration with clinical interpretation

#### 3. Fetal Movement Assessment
- Gestational age-based movement protocols (starting at 20 weeks)
- Movement pattern analysis with clinical recommendations
- Automated referral protocols for concerning patterns
- Integration with maternal danger signs assessment

#### 4. Medical History CDSS
- Behavioral counselling requirements evaluation
- Substance use risk assessment with trigger-based alerts
- Clinical guidance integration with modal system
- Comprehensive history tracking and correlation

### Enhanced Assessment Categories

#### Current Pregnancy Management
- **Pregnancy Dating**: LMP calculation, ultrasound correlation, SFH estimation
- **Risk Stratification**: Low/Moderate/High/Critical with specific protocols
- **Clinical Monitoring**: Vital signs trending, fetal heart rate assessment
- **Laboratory Integration**: Real-time results with automated interpretation

#### Comprehensive Obstetric History
- **Dynamic History Tracking**: 1-15 previous pregnancies with individual details
- **Conditional Field Logic**: Gestational age-based field availability
- **Delivery Classification**: Complete tracking of delivery modes and outcomes
- **Complications Assessment**: Organized into pregnancy, delivery, and postpartum categories

#### Enhanced Symptom Assessment
- **Current Symptoms**: Physiological symptoms, danger signs, other concerns
- **Previous Behaviors**: Follow-up visit tracking of persistent behaviors
- **Medication Tracking**: Current medications, compliance monitoring, side effects
- **Social Determinants**: Comprehensive habits assessment with mutual exclusivity

## Five-Tier Clinical Alert System

### Alert Severity Framework
- **Red (Critical)**: Immediate life-threatening conditions requiring emergency action
- **Purple (Urgent)**: Severe conditions requiring immediate clinical intervention
- **Orange (High)**: High-priority conditions requiring prompt assessment
- **Yellow (Moderate)**: Moderate-risk conditions requiring monitoring
- **Blue (Information)**: Informational alerts and routine recommendations

### Clinical Decision Rules Implementation
```typescript
interface ClinicalAlert {
  severity: 'red' | 'purple' | 'orange' | 'yellow' | 'blue';
  title: string;
  message: string;
  recommendations: string[];
  ruleCode: string;
  triggerData: Record<string, any>;
}
```

### Key Clinical Decision Rules
- **ANC_BP_HYPERTENSION**: Blood pressure monitoring with two-stage protocols
- **ANC_PREECLAMPSIA**: Hypertension + proteinuria detection
- **ANC_ANEMIA_SEVERE**: Hemoglobin-based severity classification
- **ANC_FHR_ABNORMAL**: Fetal heart rate outside normal range (110-160 bpm)
- **ANC_SYPHILIS_REACTIVE**: Immediate treatment protocols
- **ANC_HYPOXEMIA_CRITICAL**: Oxygen saturation < 92% emergency response

## Integrated Clinical Workflows

### 1. Enhanced Initial Visit Workflow
1. **Rapid Assessment**: WHO danger signs screening with emergency protocols
2. **Client Profile Development**: Comprehensive history with conditional logic
3. **Standard Assessment**: Clinical examination with decision support
4. **Real-time Decision Support**: Alert generation and clinical recommendations

### 2. Advanced Follow-up Visit Workflow
1. **Rapid Re-assessment**: Previous visit follow-up and danger signs monitoring
2. **Symptom Progression**: Previous behaviors tracking and risk stratification
3. **Enhanced Monitoring**: Fetal movement, vital signs trending, lab integration
4. **Care Plan Updates**: Treatment modifications and referral coordination

### 3. Three-Card Referral System
1. **Referral Reasons**: Emergency vs. routine classification with clinical categorization
2. **Comprehensive Checklist**: 16-step maternal emergency protocols
3. **Facility Coordination**: Province-based selection with communication protocols

## Data Validation & Quality Assurance

### Clinical Validation Rules
- **Gestational Age**: 4-42 weeks with trimester classification
- **Vital Signs**: Two-stage monitoring protocols with reference ranges
- **Fetal Assessment**: Heart rate correlation with gestational age
- **Laboratory Values**: Reference ranges with clinical interpretation
- **Previous Pregnancy Logic**: Mathematical validation (para + abortions ≤ gravida)

### Performance Optimization
- **Memoized Components**: Static data caching to prevent re-renders
- **Conditional Rendering**: Assessment state-based display optimization
- **Error Boundaries**: Graceful degradation with recovery mechanisms
- **State Management**: Comparison logic for update prevention

## Integration Architecture

### 1. Client Profile Integration
- ANC Assessment card positioned after medical history
- Expandable design with progress indicators and completion badges
- Seamless patient context data flow

### 2. Database Integration
- 74-field structure with real-time persistence
- Clinical decision history tracking and audit trails
- Performance optimization with caching strategies

### 3. Laboratory & Referral Integration
- Real-time results processing with clinical interpretation
- Emergency and routine referral workflows
- Inter-facility communication and transport coordination

## Recent Enhancements & Current Features (Version 1.8.3)

### Dynamic Alert Modal System Implementation
**Modal Business Rules Framework**
- **Rule MODAL-001**: Modal triggers only after all 9 mandatory fields completed
- **Rule MODAL-002**: Dual trigger points (Save button click AND final field completion)
- **Rule MODAL-003**: All risk levels (low, moderate, high) display modal
- **Rule MODAL-004**: React Portal rendering with high z-index for optimal display
- **Rule MODAL-005**: Single source of truth with triggerModalOnce() function prevents duplicates

### Complete PrEP Risk Assessment Business Rules
**20-Point Evidence-Based Scoring System**
- **Rule PREP-001**: Client risk factors scoring (inconsistent condom use: 2 points)
- **Rule PREP-002**: Client risk factors scoring (multiple partners: 2 points)
- **Rule PREP-003**: Client risk factors scoring (recent STI: 3 points)
- **Rule PREP-004**: Partner risk factors scoring (not on ART: 3 points)
- **Rule PREP-005**: Partner risk factors scoring (detectable viral load: 3 points)
- **Rule PREP-006**: Partner risk factors scoring (multiple partners: 2 points)
- **Rule PREP-007**: Partner risk factors scoring (injection drug use: 3 points)
- **Rule PREP-008**: Pregnancy modifiers (2nd/3rd trimester: 1 point)
- **Rule PREP-009**: Pregnancy modifiers (plans to breastfeed: 1 point)
- **Rule PREP-010**: Risk classification (Low: 0-2, Moderate: 3-5, High: ≥6 points)

### Advanced HIV Testing Integration
**HIV Testing Business Rules Framework**
- **Rule HIV-001**: Pre-test counseling required for all HIV testing requests
- **Rule HIV-002**: Multi-stage testing protocol (Determine → Bioline → Confirmatory)
- **Rule HIV-003**: Partner testing coordination and couple counseling protocols
- **Rule HIV-004**: Post-test counseling and linkage to care requirements
- **Rule HIV-005**: Quality control validation for all rapid HIV tests

### Laboratory Integration Business Rules
**Laboratory Testing Framework**
- **Rule LAB-001**: Priority-based test ordering (Routine/Urgent/STAT)
- **Rule LAB-002**: Reference range validation with automated alerts
- **Rule LAB-003**: Quality assurance protocols for all laboratory tests
- **Rule LAB-004**: Clinical decision support based on test results
- **Rule LAB-005**: Integration requirements between POC and laboratory systems

### Point-of-Care Testing Rules
**POC Testing Framework**
- **Rule POC-001**: Daily quality control requirements for all POC devices
- **Rule POC-002**: Staff competency validation before POC testing authorization
- **Rule POC-003**: Temperature monitoring and environmental controls
- **Rule POC-004**: Inventory management with expiry date monitoring
- **Rule POC-005**: Data integration requirements with laboratory information systems

### Advanced Clinical Decision Support
- Trigger-based CDSS modal system with behavioral counselling evaluation
- Substance use risk assessment with automated alerts
- Medical history integration with comprehensive clinical guidance
- Laboratory-based clinical alerts with treatment recommendations

### Enhanced User Interface
- Six-tab navigation system with progressive disclosure
- Real-time form validation and mobile-responsive design
- Integrated assessment workflow accessible from patient profiles
- Laboratory test ordering interface with priority management

### Comprehensive Data Management
- Clinical decision history tracking with performance monitoring
- Advanced referral capabilities with intelligent routing
- Three-card referral system with comprehensive pre-referral validation
- Laboratory data integration with secure result management

## Maintenance & Quality Standards

### Testing Requirements
- Business rule validation for all conditional logic
- Error boundary functionality verification
- Performance testing for large datasets
- Clinical decision support accuracy validation

### Compliance Standards
- WHO ANC guidelines adherence with HIPAA compliance
- Clinical documentation standards with audit trail maintenance
- Quality metrics tracking and clinical outcome correlation

### Version Control & Monitoring
- Business rule changes require version increment
- Documentation updates with each modification
- Performance metrics collection and user feedback integration

## Fetal Movement Assessment - Integrated Clinical Protocols

### WHO Guideline Compliance: Gestational Age-Based Assessment
**Core Requirement:** Ask about fetal movement during every contact if gestational age ≥ 20 weeks

#### Automatic Assessment Triggering
**Given:** Gestational age ≥ 20 weeks  
**When:** Any healthcare contact occurs  
**Then:** Fetal movement assessment must be completed

### Fetal Movement Business Rules (Given-When-Then Format)

#### Rule FM-001: Emergency - No Fetal Movement
**Given:** Gestational age ≥20 weeks AND No fetal movement reported  
**When:** Mother reports complete absence of fetal movement for >2 hours  
**Then:** URGENT referral for immediate fetal assessment, arrange emergency transport, monitor maternal vital signs

**Clinical Implementation:**
- Risk Level: Emergency (Red Alert)
- Alert: "EMERGENCY: No Fetal Movement Detected"
- Actions: Immediate FHR monitoring, obstetric consultation, emergency transport
- Follow-up: Required within hours

#### Rule FM-002: Urgent - Reduced Movement (28+ weeks)
**Given:** Gestational age ≥28 weeks AND Reduced fetal movement reported  
**When:** Mother notices decreased movement pattern from her established normal  
**Then:** Initiate kick counting protocol, schedule follow-up within 24 hours, provide safety counseling

**Clinical Implementation:**
- Risk Level: Urgent (Orange Alert)
- Alert: "Reduced Fetal Movement - Assessment Required"
- Actions: Kick counting protocol, left side positioning, FHR within 24 hours
- Follow-up: Required within 48 hours

#### Rule FM-003: High Priority - Late Pregnancy Reduction (36+ weeks)
**Given:** Gestational age ≥36 weeks AND Reduced fetal movement  
**When:** Movement reduction occurs in late pregnancy period  
**Then:** URGENT referral for fetal heart rate monitoring, consider delivery planning

**Clinical Implementation:**
- Risk Level: Urgent (Orange Alert)
- Alert: "Late Pregnancy: Reduced Movement Concern"
- Actions: Biophysical profile, continuous monitoring, delivery readiness
- Follow-up: Immediate obstetric evaluation

#### Rule FM-004: Educational - Early Pregnancy (16-20 weeks)
**Given:** Gestational age 16-20 weeks  
**When:** Mother asks about fetal movement expectations  
**Then:** Educate about expected movement patterns, reassure about normal variation

**Clinical Implementation:**
- Risk Level: Normal (Blue Alert)
- Alert: "Early Pregnancy - Movement Assessment"
- Actions: Education, reassurance, routine follow-up planning
- Follow-up: Routine scheduling

#### Rule FM-005: Reassurance - Normal Movement with Concern
**Given:** Normal fetal movement AND Maternal anxiety expressed  
**When:** Mother reports normal movement but expresses concern  
**Then:** Provide reassurance, teach kick counting, schedule routine follow-up

**Clinical Implementation:**
- Risk Level: Concern (Yellow Alert)
- Alert: "Normal Movement with Maternal Concern"
- Actions: Reassurance, education, kick counting instruction
- Follow-up: Routine appointment

#### Rule FM-006: Urgent - Additional Concerning Symptoms
**Given:** Any movement concern AND Additional symptoms present  
**When:** Movement changes occur with bleeding, cramping, pain, or fluid leakage  
**Then:** URGENT obstetric evaluation, assess for complications, continuous monitoring

**Clinical Implementation:**
- Risk Level: Urgent (Orange Alert)
- Alert: "Movement Changes with Additional Symptoms"
- Actions: Emergency evaluation, complication assessment, continuous monitoring
- Follow-up: Immediate and ongoing

### Gestational Age-Specific Assessment Categories

#### < 20 Weeks (Pre-Movement Assessment)
- **Status:** Too early for formal movement assessment
- **Action:** Provide education about expected movement timeline
- **Documentation:** Note that movement assessment not yet required
- **Patient Education:** Inform about quickening expectations (16-25 weeks)

#### 20-28 Weeks (Early Movement Phase)
- **Status:** Movement assessment required
- **Focus:** Establishing movement patterns
- **Education:** Teach normal movement expectations
- **Assessment:** Basic movement presence/absence

#### 28+ Weeks (Established Movement Phase)
- **Status:** Full movement assessment required
- **Focus:** Pattern recognition and kick counting
- **Education:** Kick counting protocol instruction
- **Assessment:** Detailed movement evaluation with clinical decision support

#### 36+ Weeks (Late Pregnancy)
- **Status:** Enhanced movement monitoring
- **Focus:** Quality over quantity of movements
- **Alert Level:** Higher clinical concern for movement changes
- **Assessment:** Urgent evaluation for any movement reduction

### Kick Counting Protocol Implementation
**Implementation Guidelines:**
1. **Timing:** Choose active periods (usually after meals)
2. **Position:** Left lateral position for optimal blood flow
3. **Method:** Count distinct movements (kicks, rolls, jabs)
4. **Normal:** 10 movements within 2 hours
5. **Action:** Contact provider if <10 movements in 2 hours

**Documentation Requirements:**
- Start time and end time (when 10th movement felt)
- Total duration and any concerns or patterns noted
- Clinical recommendations provided
- Follow-up arrangements made

### Patient Education Components by Gestational Age

#### For 16-20 Weeks
- "First movements usually felt between 16-25 weeks"
- "First-time mothers may not feel movement until 25 weeks"
- "Movements initially feel like fluttering or bubbles"
- "No formal monitoring required yet"

#### For 20+ Weeks
- "Movement assessment now important part of care"
- "Report any concerns about movement changes"
- "Learn normal patterns for your baby"
- "Kick counting technique instruction"

#### For 28+ Weeks
- "Formal kick counting protocol"
- "10 movements in 2 hours is normal"
- "Contact healthcare provider if <10 movements"
- "Movement quality as important as quantity"

### Healthcare Provider Protocol Checklist (≥20 weeks)
1. ✓ Verify current gestational age
2. ✓ Ask about fetal movement
3. ✓ Assess maternal concerns
4. ✓ Provide appropriate education
5. ✓ Document findings
6. ✓ Arrange follow-up if needed

### Emergency Response Protocols
- **Red Flag Indicators:**
  - No movement reported ≥20 weeks
  - Significant decrease from established pattern
  - Complete absence of movement >6 hours (≥28 weeks)
  - Maternal expression of high concern

- **Emergency Actions:**
  - Immediate fetal heart rate assessment
  - Obstetric consultation
  - Emergency transport preparation
  - Continuous monitoring arrangements

## Behavioral Counselling Implementation Details

### Data Schema Implementation
```typescript
export const behavioralCounsellingSchema = z.object({
  // Caffeine counselling
  caffeine_counselling: z.enum(['done', 'not_done']).optional(),
  reason_caffeine_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  caffeine_other_specify: z.string().optional(),
  
  // Tobacco counselling  
  tobacco_counselling: z.enum(['done', 'not_done']).optional(),
  reason_tobacco_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  tobacco_other_specify: z.string().optional(),
  
  // Second hand smoke counselling
  second_hand_smoking: z.enum(['done', 'not_done']).optional(),
  secondhand_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  secondhand_other_specify: z.string().optional(),
  
  // Alcohol/substance counselling
  alcohol_substance_counselling: z.enum(['done', 'not_done']).optional(),
  substance_or_alcohol_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  alcohol_substance_other_specify: z.string().optional(),
});
```

### Conditional Counselling Business Logic
**Implementation**: Behavioral counselling modal displays sections only when client profile indicates risk factors

1. **Caffeine Counselling**: Triggered when `daily_caffeine_intake === "yes"`
2. **Tobacco Counselling**: Triggered when `tobacco_use_smoking === "yes"` OR `tobacco_use_sniffing === "yes"`
3. **Second-hand Smoke Counselling**: Triggered when `anyone_smokes_in_household === "yes"`
4. **Alcohol/Substance Counselling**: Triggered when `uses_alcohol_substances` contains risk substances

### Status Tracking System
- **Individual Status**: Each counselling type shows "Done", "Not done", or "Not applicable"
- **Overall Status**: Displays completion ratio (e.g., "2/3 completed") with color coding
- **Dynamic Updates**: Real-time status updates as counselling is completed

### UI/UX Features
**Card Design**
- Header with "Behavioral Counselling" title and expand/collapse functionality
- Edit Record (outline style) and Add Record (blue primary) buttons
- Status display showing completion status for each counselling type
- Responsive layout working across different screen sizes

**Modal Interface**
- Large modal (Max-width 4xl) with scrollable content for comprehensive forms
- Color-coded sections: Each counselling type has distinct color coding (orange, red, purple, green)
- Contextual information showing why each counselling is required based on client profile
- Action buttons with Cancel and Save functionality with proper styling and disabled states

### Integration Points
**Data Flow**
1. **Client Profile Assessment** → Risk factor identification
2. **Behavioral Counselling Card** → Modal trigger based on risk factors
3. **Counselling Completion** → Status updates and data persistence
4. **Clinical Decision Support** → Integration with broader ANC workflow

**Error Handling**
- **Missing Client Profile**: Graceful handling when profile data is unavailable
- **Form Validation**: Required field validation with user-friendly error messages
- **Save Failures**: Toast notifications for both success and error states

### Clinical Compliance
**WHO Guidelines Alignment**
- Evidence-based counselling following WHO recommendations for behavioral interventions
- Risk-based approach targeting counselling to identified risk factors
- Documentation standards maintaining proper clinical documentation for audit trails

**Quality Assurance**
- Structured data collection ensuring consistent data format for reporting and analysis
- Completion tracking ensuring all required counselling is documented
- Referral tracking documenting when counselling is referred to specialists

### Technical Implementation
**Performance Considerations**
- Conditional rendering only showing required counselling sections
- State optimization with efficient state management and minimal re-renders
- Memory management with proper cleanup of event listeners and state

**Accessibility Features**
- Keyboard navigation with full keyboard accessibility for all form elements
- Screen reader support with proper ARIA labels and descriptions
- Color contrast meeting WCAG guidelines for color contrast ratios

This comprehensive documentation reflects the complete current state of the ANC module with all implemented features, clinical decision support capabilities, fetal movement assessment protocols, behavioral counselling implementation, and integration points as of the latest development cycle.