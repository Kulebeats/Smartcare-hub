# SmartCare PRO - Electronic Health Record System for Zambian Healthcare

## Overview
SmartCare PRO is a comprehensive Electronic Health Record (EHR) system tailored for Zambian healthcare facilities. It integrates patient management, clinical decision support, and healthcare workflow automation across Zambia's healthcare landscape. The system aims to enhance patient care, streamline operations, and provide robust, secure data management for over 3,600 facilities. Key capabilities include dynamic alert systems, comprehensive PrEP risk assessment, form-triggered clinical decision support, advanced pharmacy dispensation, and enterprise-grade security.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

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
- **Systematic Coverage**: Updated styling across:
  - Main ANC page (`anc-page.tsx`) - all static and dynamically generated forms
  - Standard ANC Assessment component - medications, symptoms, and assessment forms
  - IPV Enhanced Assessment Modal - all input fields and form elements
  - IPV Signs Selection Modal - consolidated interface elements
  - Client Details sections - patient information forms
  - Danger Signs Assessment - all evaluation forms
  - Referral Modal forms - comprehensive referral workflow
  - Dynamic Pregnancy History sections - all conditional form fields
  - Appointment Scheduling forms - date and time selection elements

#### Technical Implementation Details
- **Dynamic HTML Template Updates**: Updated all JavaScript-generated HTML form templates
- **Component-Level Consistency**: Systematically updated all React component form elements
- **Preserved Functionality**: Maintained all existing clinical decision support and workflow logic
- **CDSS Element Preservation**: Kept original colors for Clinical Decision Support System elements
- **Focus Management**: Enhanced accessibility with proper focus states and outline removal

#### Quality Assurance
- **Comprehensive Testing**: Verified styling consistency across all ANC module sections
- **Functionality Preservation**: Ensured all existing features remain intact
- **Cross-Component Validation**: Confirmed uniform appearance across main pages and modal components
- **Responsive Design Maintenance**: Preserved mobile and tablet compatibility

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