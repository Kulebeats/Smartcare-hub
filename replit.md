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