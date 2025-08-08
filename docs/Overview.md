# SmartCare PRO - Electronic Health Record System Overview

## System Overview

SmartCare PRO is a comprehensive Electronic Health Record (EHR) system designed specifically for Zambian healthcare facilities. It provides integrated patient management, clinical decision support, and healthcare workflow automation across 3,600+ healthcare facilities in Zambia's 10 provinces and 116 districts.

**Current Version:** 1.8.3

## Key Features

### Core Clinical Modules
- **ANC (Antenatal Care)** - Complete pregnancy management workflow with integrated assessments
- **PrEP (Pre-Exposure Prophylaxis)** - HIV prevention protocols with 20-point risk scoring
- **ART (Antiretroviral Therapy)** - HIV treatment management
- **PMTCT (Prevention of Mother-to-Child Transmission)** - Maternal HIV management for pregnant women
- **Pharmacovigilance** - Adverse drug reaction monitoring
- **Pharmacy** - Prescription management and dispensation with modular architecture

### Advanced Features
- **Dynamic Alert Modal Systems** - Real-time clinical decision support with React Portal rendering
- **Form Trigger-based CDSS Modals** - Completion-based clinical decision support triggers
- **Enhanced Pharmacy Dispensation Architecture** - Modular component-based dispensation system
- **Comprehensive Error Handling** - Enterprise-grade error management and logging
- **Security Framework** - ABAC and Row-Level Security for healthcare compliance

### Patient Management
- Comprehensive patient registration with Zambian-specific fields (NRC, NUPIN, ART Number)
- Advanced search capabilities across multiple parameters
- Secure patient data management with facility-based isolation
- CSV import/export functionality for bulk operations

### Emergency and Referral Systems
- **3-Card Referral System** for inter-facility patient transfers
- **Clinical Decision Support** with real-time recommendations and dynamic alert modals
- **Danger Signs Assessment** for rapid clinical evaluation
- **Component-Based Referral Architecture** - Clean modal-based referral workflow

### Administrative Features
- **Facility Management** supporting multi-facility deployments
- **User Access Control** with role-based permissions
- **Performance Monitoring** with caching and optimization
- **Audit Trail** for complete system activity logging

## Healthcare Compliance

### WHO Standards Integration
- Evidence-based clinical decision rules
- WHO Guidelines compliance engine
- Clinical staging and assessment protocols

### Zambian MoH Integration
- Facility registry integration
- Local healthcare protocols compliance
- National reporting standards alignment

### Security and Privacy
- HIPAA standards compliance
- Facility-based data isolation
- Multi-layered authentication
- Session-based security with PostgreSQL context management

## Technology Stack Highlights

### Frontend
- React 18 with TypeScript for type safety
- Vite for fast development builds
- Tailwind CSS with shadcn/ui for consistent design
- React Query for efficient server state management
- Wouter for lightweight client-side routing
- React Hook Form with Zod for form validation

### Backend
- Node.js with Express framework
- TypeScript throughout for maintainability
- Drizzle ORM for type-safe database operations
- PostgreSQL 16 with Row-Level Security
- Redis with fallback cache management
- Bull Queue system with fallback processing

### Security
- ABAC (Attribute-Based Access Control) with 23 active policies
- Row-Level Security (RLS) for database-level isolation
- Healthcare-compliant session management
- Comprehensive audit trail system

## Deployment and Performance

### Production Ready
- Security-compliant deployment scripts
- Optimized production builds
- Automated deployment processes
- Performance monitoring and optimization

### Resource Optimization
- Memory-conscious database indexing for Replit constraints
- Smart caching strategy with multi-tier TTL optimization
- Component memoization and lazy loading
- Application startup optimization with warm-up processes

## Recent Enhancements

### Component-Based Referral System (Latest)
- Replaced extensive inline JavaScript with React Hook Form components
- Created modular ReferralCard, ReferralModal, FacilitySelector, and EmergencyChecklist components
- Maintained bi-directional sync between Danger Signs and Emergency Referral
- Clean card-based interface with modal-driven functionality

### HIV Testing Integration
- Automatic prefilling of HIV testing modals from ANC context
- Streamlined workflow for pregnant women in ANC visits
- Clean interface design with professional UI consistency

### Enhanced ANC Module
- Complete client profile section with always-visible cards
- Professional card-based architecture throughout
- WHO clinical standards integration
- Dynamic alert systems with completion-based triggers

This system represents a comprehensive solution for Zambian healthcare facilities, combining modern web technologies with healthcare-specific requirements and clinical best practices.