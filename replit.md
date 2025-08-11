# SmartCare PRO - Electronic Health Record System for Zambian Healthcare

## Overview
SmartCare PRO is a comprehensive Electronic Health Record (EHR) system tailored for Zambian healthcare facilities. It integrates patient management, clinical decision support, and healthcare workflow automation across Zambia's healthcare landscape. The system aims to enhance patient care, streamline operations, and provide robust, secure data management for over 3,600 facilities. Key capabilities include dynamic alert systems, comprehensive PrEP risk assessment, form-triggered clinical decision support, advanced pharmacy dispensation, and enterprise-grade security.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Clinical Modules**: ANC, PrEP (20-point risk scoring), ART, PMTCT, Pharmacovigilance, and Pharmacy management.
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