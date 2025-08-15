# SmartCare PRO - Electronic Health Record System for Zambian Healthcare

## Overview
SmartCare PRO is a comprehensive Electronic Health Record (EHR) system designed for Zambian healthcare facilities. Its primary purpose is to integrate patient management, clinical decision support, and healthcare workflow automation across Zambia's healthcare landscape, serving over 3,600 facilities. The system aims to enhance patient care, streamline operations, and provide robust, secure data management. Key capabilities include dynamic alert systems, comprehensive PrEP risk assessment, form-triggered clinical decision support, advanced pharmacy dispensation, and enterprise-grade security. The business vision is to significantly improve healthcare delivery and data integrity in Zambia.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI/UX**: Tailwind CSS with shadcn/ui components for a consistent design. Consistent styling is applied to all data input elements, using `border-2 border-gray-300 rounded p-2` and `text-black`, with enhanced focus states. Buttons are standardized to blue (`#0279ed`).
- **State Management**: React Query for server state.
- **Routing**: Wouter.
- **Form Management**: React Hook Form with Zod for validation.
- **Performance**: Lazy loading architecture with `React.lazy()` and `Suspense` for reduced bundle size.

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL with Row-Level Security
- **Caching**: Redis for performance caching and session management
- **Job Processing**: Bull Queue for background jobs

### Security
- **Access Control**: Attribute-Based Access Control (ABAC) with 23 policies.
- **Data Isolation**: Row-Level Security (RLS) for facility-specific data isolation, ensuring secure patient data management for 3,600+ facilities.
- **Authentication**: Multi-layered session-based security.
- **Compliance**: Designed to meet HIPAA standards.

### Key Components
- **Patient Management**: Comprehensive registration (including Zambian-specific fields), advanced search, and CSV import/export.
- **Clinical Modules**:
    - **ANC**: Comprehensive Antenatal Care module with standardized visual consistency across all data input elements, featuring consistent border styling (border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200) applied to all Input, Select, and Textarea elements while preserving CDSS element colors. Includes dynamic pregnancy section generation and IPV Enhanced Assessment Modal with WHO protocol compliance.
    - **PrEP**: Comprehensive 20-point risk scoring system with evidence-based clinical recommendations (WHO/CDC compliant), including client and partner risk factors, and pregnancy modifiers.
    - **ART**: Antiretroviral Therapy module.
    - **PMTCT**: Prevention of Mother-to-Child Transmission module.
    - **Pharmacovigilance**: Adverse drug reaction tracking.
    - **Pharmacy Management**: Modular dispensation system with optimized prescription workflow and auto-calculation features.
    - **Laboratory Testing**: POC Testing Module with 17 test types, standard reference ranges, and HIV testing.
- **Clinical Decision Support (CDSS)**:
    - Real-time alerts and recommendations integrated throughout the ANC workflow, based on WHO Guidelines, CDC, and Zambian MoH protocols.
    - Dynamic Alert Modal System for all risk levels with completion-based triggers.
    - Form Trigger-Based CDSS with enhanced modal architecture.
    - Evidence-based clinical framework with a 20-point scoring system for PrEP.
- **Emergency & Referral**: 3-Card Referral system with a comprehensive 16-step checklist, facility coordination, and real-time Clinical Decision Support for danger signs assessment.
- **Administrative**: Multi-facility management, user access control (RBAC), performance monitoring, and audit trails.

### System Design Choices
- **Authentication Flow**: User login with facility selection, session establishment, and ABAC/RLS enforcement per request.
- **Clinical Workflow**: Patient selection, role-based module access, real-time CDSS, data persistence, and alert generation.
- **Referral Process**: Structured three-card workflow with multi-category classification and checklist validation.
- **Deployment Strategy**: Node.js 20 with PostgreSQL 16 on Replit, optimized for production with Vite frontend build and tsx backend execution, emphasizing memory-conscious indexing, smart caching, and application startup optimization.
- **Behavioral Counselling**: Modal-based data entry with conditional logic for various categories.
- **Fetal Assessment**: Movement assessment with Given-When-Then rules for risk stratification.

## External Dependencies

### AI Services
- **Anthropic Claude API**: For clinical decision support and analysis.
- **Perplexity API**: For medical research and evidence-based recommendations.

### Infrastructure Services
- **PostgreSQL 16**: Primary data storage.
- **Redis**: Caching and session management.
- **Bull Board**: Queue monitoring and management.

### Healthcare Integrations
- **WHO Guidelines**: Compliance engine with integrated IPV screening protocols.
- **Zambian MoH**: Facility registry integration.
- **Zambian ANC Guidelines 2022**: Official danger signs descriptions and management protocols integrated into CDSS.
- **Clinical Decision Rules**: Based on evidence-based medicine.

## Recent Major Updates (August 2025)

### Visual Consistency Implementation
**Date**: August 13, 2025
**Objective**: Achieve comprehensive visual consistency across all ANC module data input elements while preserving Clinical Decision Support System (CDSS) element colors and functionality.

**Changes Made**:
1. **Standardized Data Input Styling**: Applied consistent styling (border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none) to all Input, Select, and Textarea elements across:
   - vital-signs-measurements.tsx: All measurement inputs and selects
   - maternal-assessment-modal.tsx: All physical examination inputs, selects, and textarea elements
   - fetal-assessment-modal.tsx: All fetal assessment inputs and selects
   - IPV screening section: Textarea for additional signs specification

2. **Component-Specific Updates**:
   - **Vital Signs**: Updated 8 Input elements for measurements (blood pressure, temperature, pulse, etc.)
   - **Maternal Assessment**: Updated 10 SelectTrigger elements across physical examination sections (pallor, respiratory, cardiac, breast, pelvic, speculum, oedema, varicose veins, IPV screening)
   - **Fetal Assessment**: Updated 5 Input elements (symphysial-fundal height, fetal heart rates) and 4 SelectTrigger elements (fetal lie, presentation, descent, movement assessment)
   - **IPV Screening**: Applied styling to textarea element for "other signs" specification

3. **Preservation of CDSS Elements**: Maintained original colors and styling for all Clinical Decision Support alerts, modals, and recommendation panels to ensure medical workflow integrity.

### IPV Enhanced Assessment Integration
**Date**: August 13, 2025
**Updates**:
- Successfully integrated WHO minimum requirements for IPV screening
- Implemented LIVES framework guidance with enhanced privacy verification protocols
- Consolidated IPV signs selection from 6 to 4 main groups with improved 2-column layout
- Fixed tooltip overflow issues in IPV assessment modals
- Enhanced privacy and safety protocols in accordance with WHO guidelines

### Enhanced Danger Signs Workflow Implementation
**Date**: August 15, 2025
**Updates**:
- Successfully implemented streamlined danger signs workflow returning users to original urgent alert modal
- Orange "Danger Signs Information" button shows detailed clinical protocols and management guidance
- After reviewing information (acknowledge/close), users return directly to original urgent alert modal
- Maintains original Emergency Referral and Facility Management buttons in urgent alert modal
- Removed intermediate "Clinical Management Required" section per user feedback
- Preserved all existing functionality while providing seamless information review workflow
- Users can review danger signs information and then proceed with original urgent alert options

### Technical Implementation Details
- Enhanced `AncDecisionSupportAlert` component with `onDangerSignsAcknowledged` callback
- Simplified acknowledgment flow to return to original urgent alert modal instead of creating new UI
- Both acknowledge and close buttons in information modal trigger return to urgent alert
- Removed complex workflow phase state management for cleaner user experience
- Integrated seamlessly with existing referral workflows and emergency management protocols

### Obstetric History Harmonization Project
**Date**: August 15, 2025
**Objective**: Create unified business rules and validation across all three obstetric history implementations (Client Profile, Obstetric Assessment, Emergency Referral).

**Implementation Approach**:
- Created unified validation schema (`shared/obstetric-validation.ts`) with consistent business rules
- Developed reusable React component (`UnifiedObstetricHistory.tsx`) for consistent UI/UX
- Standardized risk calculation logic across all implementations
- Ensured data integrity with Zod validation schema

**Business Rules Standardized**:
1. **Validation Rules**: Para + Abortions ≤ Gravida, Living Children ≤ Para
2. **Risk Categories**: Nullipara, Primipara, Multipara, Grand Multipara classifications
3. **Risk Levels**: Low, Moderate, High, Critical with specific thresholds
4. **Clinical Alerts**: Grand Multiparity (≥5), High Parity (>6), Recurrent Loss (≥3)
5. **Field Ranges**: Gravida (1-20), Para (0-15), Abortions (0-10), Living Children (0-15)

### Dynamic Emergency Checklist Implementation
**Date**: August 15, 2025
**Objective**: Transform static emergency referral checklist into dynamic, context-aware system that prioritizes actions based on specific danger signs.

**Technical Implementation**:
- Created `shared/emergency-checklist-mapping.ts` with comprehensive danger sign categorization and priority mapping
- Developed `DynamicEmergencyChecklist` React component with visual priority hierarchy (Critical/Secondary/Standard)
- Implemented clinical decision logic based on WHO/CDC protocols for 4 categories: Neurological, Bleeding & Delivery, Hypertensive, Systemic
- Added real-time progress tracking and clinical focus display

**Business Logic Features**:
1. **Smart Prioritization**: Dynamically reorganizes 24 checklist items based on clinical urgency
2. **Visual Hierarchy**: Color-coded sections (Red=Critical, Orange=Secondary, Blue=Standard) 
3. **Clinical Context**: Displays clinical rationale for emergency protocol selection
4. **Progress Tracking**: Real-time completion percentage with item counting
5. **Fallback System**: Maintains compatibility with existing static checklist when no danger signs present

**Category Mappings**:
- **Neurological** (Convulsing, Unconscious): Focus on seizure control, airway protection
- **Bleeding & Delivery** (Vaginal bleeding, Imminent delivery): Focus on volume replacement, shock management
- **Hypertensive** (Severe headache, Visual disturbance): Focus on eclampsia prevention, BP management
- **Systemic** (Fever, Looks very ill): Focus on infection control, fluid resuscitation

### Technical Implementation Completed
**Date**: August 15, 2025
**Integration Status**: Dynamic Emergency Checklist fully operational in Emergency Referral rapid assessment

**Final Technical Solutions**:
1. **Module-level Constants**: Moved `REFERRAL_REASON_TO_DANGER_SIGN` mapping outside component scope to eliminate initialization order issues
2. **Simplified Dependencies**: Removed static references from `useCallback` dependency arrays to prevent temporal dead zone errors
3. **Real-time Integration**: Connected referral reason selections to dynamic checklist updates via `handleReferralReasonsChange`
4. **Clinical Intelligence Active**: 12 danger signs mapped to 4 clinical categories with 24 prioritized checklist items

**Clinical Categories Operational**:
- **Neurological** (Convulsing, Unconscious): Critical focus on seizure control, airway protection
- **Bleeding & Delivery** (Vaginal bleeding, Labour): Critical focus on volume replacement, shock management
- **Hypertensive** (Severe headache): Critical focus on eclampsia prevention, BP management
- **Systemic** (Fever, Looks very ill): Critical focus on infection control, fluid resuscitation

### Ongoing Work
- Integration of unified obstetric components into existing workflows
- Final ANC PrEP Assessment modal styling updates in progress