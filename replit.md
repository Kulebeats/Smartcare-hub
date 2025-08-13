# SmartCare PRO - Electronic Health Record System for Zambian Healthcare

## Overview
SmartCare PRO is a comprehensive Electronic Health Record (EHR) system tailored for Zambian healthcare facilities. It integrates patient management, clinical decision support, and healthcare workflow automation across Zambia's healthcare landscape. The system aims to enhance patient care, streamline operations, and provide robust, secure data management for over 3,600 facilities. Key capabilities include dynamic alert systems, comprehensive PrEP risk assessment, form-triggered clinical decision support, advanced pharmacy dispensation, and enterprise-grade security.

## User Preferences
Preferred communication style: Simple, everyday language.

## Complete System Development History

### August 13, 2025: Comprehensive ANC Module Enhancement & Visual Consistency Implementation

#### IPV Screening Assessment Enhancements
- **WHO Protocol Integration**: Added WHO minimum requirements reminders and LIVES framework guidance
- **Enhanced Privacy Verification**: Implemented comprehensive privacy checks before IPV assessment
- **IPV Signs Consolidation**: Reduced from 6 to 4 main IPV sign groups with cleaner 2-column layout
- **Tooltip Overflow Fixes**: Resolved UI issues with IPV signs selection modal tooltips
- **Button Styling Standardization**: Updated all buttons from purple to blue (#0279ed) across components

#### Visual Consistency Implementation (Data Elements)
- **Comprehensive Form Styling**: Applied consistent styling to ALL data input elements across entire ANC module
- **Standardized Border Styling**: Implemented `border-2 border-gray-300 rounded p-2` for all form inputs
- **Text Color Consistency**: Applied `text-black` to all input elements throughout the module
- **Focus State Enhancement**: Added `focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none` to all inputs
- **Systematic Coverage**: Updated styling across all ANC components and dynamically generated sections

### January 17, 2025 (Version 1.8.3): Dynamic Alert Modal System & Complete PrEP Enhancement

#### Major Features
- **Dynamic Alert Modal System**: Complete implementation for all risk levels with completion-based triggers
- **PrEP Risk Assessment**: Comprehensive 20-point scoring system with evidence-based clinical recommendations
- **Form Trigger-Based CDSS**: Integrated clinical decision support modals throughout ANC workflow
- **Enhanced Modal Architecture**: React Portal rendering with high z-index for optimal user experience
- **POC Tests Integration Enhancement**: Baseline clinical safety assessment with follow-up questions

#### PrEP Module Enhancements
- **Complete Risk Assessment**: Full 20-point scoring system with WHO/CDC compliance
- **Client Risk Factors**: Inconsistent condom use (2), multiple partners (2), recent STI (3 points)
- **Partner Risk Factors**: Not on ART (3), detectable viral load (3), multiple partners (2), injection drug use (3 points)
- **Pregnancy Modifiers**: Trimester assessment (1 point for 2nd/3rd) and breastfeeding plans (1 point)
- **Enhanced Eligibility Tab**: Comprehensive 8-question clinical safety screening

### January 14, 2025 (Version 1.8.2): Completion-Based Modal System & Workflow Improvements

#### Workflow Improvements
- **Completion-Based Modal System**: Implemented deferred modal triggers for better user experience
- **Assessment Completion Validation**: Added validateAssessmentCompletion() for 9 mandatory fields
- **Enhanced User Experience**: Users complete full assessment without interruption
- **Modal/Toast Logic**: Low risk shows toast, moderate/high risk shows interactive modal

### January 11, 2025 (Version 1.8.1): Modular Dispensation System Architecture

#### Architecture Improvements
- **Modular Dispensation System**: Component-based architecture with reusable components
- **Responsive Design Enhancement**: Mobile-first approach with useWindowWidth hook
- **Enhanced Client Details**: Comprehensive patient information with expandable details
- **Route Integration**: Added /pharmacy/dispense with proper sidebar navigation

### July 10, 2025 (Version 1.8.0): Evidence-Based Clinical Framework & Production Deployment

#### Evidence-Based Clinical Framework
- **20-Point Scoring System**: Exact clinical weights aligned with WHO PrEP Implementation Guide 2024
- **CDC Compliance**: Integration with CDC PrEP Clinical Guideline 2025
- **Risk Interpretation**: Low (0-4), Moderate (5-9), High (≥10) with specific clinical actions
- **Production Deployment Security Fix**: Fixed deployment blocking security warning with tsx backend execution

### July 9, 2025 (Version 1.7.5): Pharmacy System Optimization & Performance Enhancement

#### Pharmacy System Optimization
- **Prescription Modal Performance**: Component code splitting into 6 optimized sub-components
- **Lazy Loading Architecture**: React.lazy() with Suspense for reduced bundle size
- **Database Error Resolution**: Fixed PostgreSQL CONCAT syntax issues
- **Local Data Fallback**: Comprehensive ANC medications database with instant search

### July 8, 2025 (Version 1.7.0): Clinical Decision Support Migration & UI Standardization

#### Clinical Decision Support Migration
- **POC Tests CDSS**: Migrated hemoglobin and hepatitis B evaluation from Laboratory Tests
- **Real-time Alerts**: CDSS modal functionality integrated into POC Tests components
- **Enhanced Clinical Workflow**: Point-of-care decision support for immediate guidance
- **Interface Standardization**: Complete button standardization across ANC system with rounded-full styling

### June 26, 2025 (Version 1.6.0): Documentation Consolidation & Laboratory Infrastructure

#### Documentation Consolidation
- **Phase 1-6 Cleanup**: Eliminated 23+ redundant files and consolidated documentation
- **Laboratory Infrastructure**: POC Testing Module with 17 test types and standard reference ranges
- **HIV Testing Module**: Comprehensive result tracking with date-dependent fields
- **Two-phase Workflow**: Test ordering followed by results entry

### June 25, 2025 (Version 1.5.0): Behavioral Counselling & Fetal Assessment Enhancement

#### Behavioral Counselling
- **Comprehensive Module**: Modal-based data entry with conditional counselling logic
- **Four Categories**: Caffeine, tobacco, second-hand smoke, alcohol/substances counselling
- **Fetal Assessment Enhancement**: Movement assessment with Given-When-Then rules
- **Risk Stratification**: Normal, Concern, Urgent, Emergency classification

### June 25, 2025 (Version 1.4.0): Initial System Foundation & Core Architecture

#### Core System Foundation
- **Frontend Architecture**: React 18 with TypeScript and Vite
- **Backend Architecture**: Node.js with Express and PostgreSQL
- **Security Framework**: ABAC with Row-Level Security (23 active policies)
- **Clinical Modules**: ANC, PrEP, Pharmacy, Laboratory Testing

#### Patient Management
- **Comprehensive Registration**: Zambian-specific fields (NRC, NUPIN, ART Number)
- **Advanced Search**: Multiple parameter search capabilities
- **CSV Operations**: Import/export functionality for bulk operations
- **Facility Isolation**: Secure patient data management for 3,600+ facilities

#### Clinical Decision Support
- **WHO Guidelines**: Comprehensive compliance engine
- **CDC Integration**: Evidence-based recommendations
- **Zambian MoH**: Local clinical protocol integration with Zambian ANC Guidelines 2022
- **Real-time Alerts**: Immediate clinical guidance and recommendations

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI/UX**: Tailwind CSS with shadcn/ui components for a consistent design.
- **State Management**: React Query for server state.
- **Routing**: Wouter.
- **Form Management**: React Hook Form with Zod for validation.

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL with Row-Level Security
- **Caching**: Redis for performance caching and session management
- **Job Processing**: Bull Queue for background jobs

### Security
- **Access Control**: Attribute-Based Access Control (ABAC) with 23 policies.
- **Data Isolation**: Row-Level Security (RLS) for facility-specific data isolation.
- **Authentication**: Multi-layered session-based security.
- **Compliance**: Designed to meet HIPAA standards.

### Key Components
- **Patient Management**: Comprehensive registration, advanced search, secure data, and CSV import/export.
- **Clinical Modules**: ANC (with consistent form styling), PrEP (20-point risk scoring), ART, PMTCT, Pharmacovigilance, and Pharmacy management.
- **Emergency & Referral**: 3-Card Referral system, real-time Clinical Decision Support with dynamic alerts, and Danger Signs Assessment with Zambian ANC Guidelines (2022) integration.
- **Administrative**: Multi-facility management, user access control (RBAC), performance monitoring, and audit trails.

### System Design Choices
- **Authentication Flow**: User login with facility selection, session establishment, ABAC/RLS enforcement per request.
- **Clinical Workflow**: Patient selection, role-based module access, real-time CDSS, data persistence, and alert generation.
- **Referral Process**: Structured three-card workflow with multi-category classification and checklist validation.
- **Deployment Strategy**: Node.js 20 with PostgreSQL 16 on Replit, optimized for production with Vite frontend build and tsx backend execution. Emphasizes memory-conscious indexing, smart caching, and application startup optimization.
- **Security Deployment**: Facility-based data isolation, role-based access control, session security with PostgreSQL context, and audit logging.

## External Dependencies

### AI Services (Optional)
- **Anthropic Claude API**: For clinical decision support and analysis.
- **Perplexity API**: For medical research and evidence-based recommendations.

### Infrastructure Services
- **PostgreSQL 16**: Primary data storage.
- **Redis**: Caching and session management.
- **Bull Board**: Queue monitoring and management.

### Healthcare Integrations
- **WHO Guidelines**: Compliance engine.
- **Zambian MoH**: Facility registry integration.
- **Zambian ANC Guidelines 2022**: Official danger signs descriptions and management protocols integrated into CDSS.
- **Clinical Decision Rules**: Based on evidence-based medicine.