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
    - **ANC**: Comprehensive Antenatal Care module with consistent form styling, and dynamic pregnancy section generation.
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
- **WHO Guidelines**: Compliance engine.
- **Zambian MoH**: Facility registry integration.
- **Zambian ANC Guidelines 2022**: Official danger signs descriptions and management protocols integrated into CDSS.
- **Clinical Decision Rules**: Based on evidence-based medicine.