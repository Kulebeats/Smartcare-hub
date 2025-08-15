# SmartCare PRO - Electronic Health Record System for Zambian Healthcare

## Overview
SmartCare PRO is a comprehensive Electronic Health Record (EHR) system designed for Zambian healthcare facilities, aiming to integrate patient management, clinical decision support, and healthcare workflow automation across Zambia's over 3,600 facilities. The system's purpose is to enhance patient care, streamline operations, and provide robust, secure data management, thereby significantly improving healthcare delivery and data integrity in Zambia. Key capabilities include dynamic alert systems, comprehensive PrEP risk assessment, form-triggered clinical decision support, advanced pharmacy dispensation, and enterprise-grade security.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI/UX**: Tailwind CSS with shadcn/ui components, featuring standardized input styling and blue buttons (`#0279ed`).
- **State Management**: React Query.
- **Routing**: Wouter.
- **Form Management**: React Hook Form with Zod validation.
- **Performance**: Lazy loading with `React.lazy()` and `Suspense`.

### Backend
- **Framework**: Node.js with Express and TypeScript.
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL with Row-Level Security.
- **Caching**: Redis.
- **Job Processing**: Bull Queue.

### Security
- **Access Control**: Attribute-Based Access Control (ABAC) with 23 policies.
- **Data Isolation**: Row-Level Security (RLS) for facility-specific data.
- **Authentication**: Multi-layered session-based security.
- **Compliance**: Designed to meet HIPAA standards.

### Key Components
- **Patient Management**: Registration, advanced search, and CSV import/export.
- **Clinical Modules**:
    - **ANC**: Antenatal Care with standardized visual consistency for inputs, dynamic pregnancy section generation, and IPV Enhanced Assessment Modal (WHO compliant).
    - **PrEP**: Comprehensive 20-point risk scoring system (WHO/CDC compliant).
    - **ART**: Antiretroviral Therapy.
    - **PMTCT**: Prevention of Mother-to-Child Transmission.
    - **Pharmacovigilance**: Adverse drug reaction tracking.
    - **Pharmacy Management**: Modular dispensation system with optimized prescription workflow.
    - **Laboratory Testing**: POC Testing Module with 17 test types.
- **Clinical Decision Support (CDSS)**: Real-time alerts and recommendations integrated throughout the ANC workflow based on WHO, CDC, and Zambian MoH protocols; Dynamic Alert Modal System; Form Trigger-Based CDSS; Evidence-based framework for PrEP.
- **Emergency & Referral**: 3-Card Referral system with a 16-step checklist and real-time CDSS for danger signs assessment.
- **Administrative**: Multi-facility management, user access control (RBAC), performance monitoring, and audit trails.

### System Design Choices
- **Authentication Flow**: User login with facility selection, session establishment, and ABAC/RLS enforcement.
- **Clinical Workflow**: Patient selection, role-based module access, real-time CDSS, data persistence, and alert generation.
- **Referral Process**: Structured three-card workflow with multi-category classification and checklist validation.
- **Deployment Strategy**: Node.js 20 with PostgreSQL 16 on Replit, optimized for production with Vite frontend build and tsx backend execution.
- **Behavioral Counselling**: Modal-based data entry with conditional logic.
- **Fetal Assessment**: Movement assessment with Given-When-Then rules.
- **Obstetric History Harmonization**: Unified business rules and validation across implementations with consistent UI/UX and risk calculation.
- **Dynamic Emergency Checklist**: Context-aware system prioritizing actions based on danger signs, with visual hierarchy and progress tracking.
- **IPV Assessment Enhancement**: Elimination of redundant risk factor collection between initial screening and detailed assessment, with smart risk factor mapping and redesigned "Review & Expand Assessment" page.

## External Dependencies

### AI Services
- **Anthropic Claude API**: For clinical decision support and analysis.
- **Perplexity API**: For medical research and evidence-based recommendations.

### Infrastructure Services
- **PostgreSQL 16**: Primary data storage.
- **Redis**: Caching and session management.
- **Bull Board**: Queue monitoring and management.

### Healthcare Integrations
- **WHO Guidelines**: Compliance engine, including IPV screening protocols.
- **Zambian MoH**: Facility registry integration.
- **Zambian ANC Guidelines 2022**: Official danger signs descriptions and management protocols.
- **Clinical Decision Rules**: Based on evidence-based medicine.

## Recent Enhancements

### IPV Assessment Business Rules Engine & Enhanced Validation System
**Date**: August 15, 2025
**Objective**: Implement comprehensive business rules engine with mandatory field validation, enhanced user experience with scrolling fixes, and improved LISTEN phase integration throughout the IPV assessment workflow.

**Core Enhancement Implemented**:
1. **Business Rules Engine**: Complete validation framework with WHO-compliant mandatory requirements
   - **ValidationRule Interface**: Structured rules with conditions, error messages, and categorization (WHO_MANDATORY, CLINICAL_BEST_PRACTICE, LEGAL_REQUIREMENT)
   - **Real-time Validation**: Dynamic validation with immediate feedback and progress tracking
   - **Phase-specific Rules**: Targeted validation for LISTEN, INQUIRE, VALIDATE, ENHANCE_SAFETY, and SUPPORT phases
   - **Privacy Verification Enhancement**: Mandatory privacy checklist with 3-of-4 requirement enforcement

2. **WHO LIVES Protocol Business Rules**:
   - **LISTEN Requirements**: Minimum 20-character narrative OR clinical observations OR phase completion
   - **INQUIRE Requirements**: Immediate safety assessment OR safe place needs OR phase completion  
   - **Overall Protocol**: Minimum 2 completed phases OR meaningful content in 3 phases
   - **Privacy Assessment**: Patient alone validation + 3-of-4 privacy verification items

3. **Enhanced User Experience**:
   - **Fixed Mouse Scrolling**: Resolved scrolling conflicts in modal containers
   - **Visual Validation Feedback**: Real-time error/warning display with color-coded indicators
   - **Progress Tracking**: Dynamic completion counters and requirement status displays
   - **LISTEN Integration**: Cross-phase LISTEN status indicators in footer and navigation

4. **Technical Implementation**:
   - Added `ValidationRule`, `ValidationResult` interfaces with comprehensive error handling
   - Enhanced `EnhancedIPVAssessmentData` with `privacyVerification` tracking
   - Implemented `validatePage()` function with real-time validation updates
   - Updated `canProceed()` to use business rules validation instead of flexible logic
   - Added privacy verification handlers with state management

**Clinical Decision Support Enhancements**:
- WHO-compliant mandatory field enforcement preventing unsafe assessment progression
- Real-time business rule validation with immediate clinical guidance
- Enhanced LISTEN phase tracking with visual indicators across all pages
- Comprehensive error messaging system guiding clinicians through requirements
- Progress visualization showing completion status for each WHO LIVES phase

**User Interface Improvements**:
- Fixed modal scrolling issues enabling proper mouse wheel navigation
- Added validation status panel with error/warning categorization
- Enhanced footer with LISTEN phase integration indicators
- Real-time progress counters showing mandatory vs. completed requirements
- Visual feedback system with green/orange/red status indicators

**WHO Protocol Compliance Maintained**:
- ✅ Enforces WHO LIVES sequential methodology through business rules
- ✅ Maintains survivor autonomy while ensuring clinical completeness
- ✅ Provides evidence-based validation requirements with clear guidance
- ✅ Supports secure narrative documentation with minimum content requirements
- ✅ Ensures proper privacy verification before assessment progression
- ✅ Maintains comprehensive referral pathways with validation tracking

### Previous: WHO LIVES Protocol Implementation - Comprehensive First-Line Support
**Date**: August 15, 2025
**Objective**: Transform the basic IPV first-line support checklist into a comprehensive WHO LIVES protocol with structured clinical decision support.

**Enhancement Implemented**:
1. **Enhanced Data Architecture**: Extended `EnhancedIPVAssessmentData` interface with comprehensive `LIVESProtocolData` structure supporting all five protocol phases
2. **Five-Component LIVES Workflow**: Complete replacement of Page 4 with structured modules:
   - **Listen (L)**: Secure narrative documentation area with active listening technique tracking and clinical observations
   - **Inquire (I)**: Immediate safety assessment with structured questions covering safety, injuries, safe places, and children at risk
   - **Validate (V)**: Pre-scripted validation phrases with documentation of supportive responses used
   - **Enhance Safety (E)**: Guided safety planning with violence escalation assessment, weapon presence checks, emergency plan documentation, safe contacts management, and discrete safety plan generation
   - **Support (S)**: Integrated referral directory with consent tracking and comprehensive service categories

**Redundancy Elimination**:
- Converted interactive checklists to guidance-only sections for cleaner clinical decision support
- Applied consistent visual styling with white containers and black text throughout all LIVES sections
- Maintained distinct colored icons for each phase while ensuring uniform visual harmony
- Eliminated duplicate functionality between pages while maintaining clinical completeness