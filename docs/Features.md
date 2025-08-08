# SmartCare PRO - Comprehensive Features Documentation

## Clinical Modules

### 1. ANC (Antenatal Care) Module
**Complete pregnancy management workflow with integrated assessments**

#### Core Components
- **Rapid Assessment** - Contact date, gestational age, pregnancy status evaluation
- **Client Profile** - Always-visible cards with client details, current pregnancy, obstetric history, medical history
- **Medical History** - Comprehensive previous pregnancies, chronic conditions, allergies tracking
- **Physical Examination** - Maternal and fetal assessment with WHO standard protocols
- **Laboratory Investigations** - HIV testing, blood work, urinalysis with automated results processing
- **Counselling & Education** - Behavioral counselling with evidence-based recommendations
- **Referral System** - Component-based 3-card referral workflow
- **PMTCT Integration** - Maternal HIV management with TPT (TB Preventive Treatment)

#### Advanced Features
- **Dynamic Alert Modals** - Real-time clinical decision support with React Portal rendering
- **Automatic HIV Pretest Assessment** - Auto-fills testing modals from ANC context
- **Latest Encounter Cards** - Section-specific encounter information updates
- **Recent Data Summary** - Aggregated clinical data across all sections
- **WHO Standards Compliance** - Clinical staging, ART history, comprehensive PMTCT functionality

### 2. PrEP (Pre-Exposure Prophylaxis) Module
**HIV prevention protocols with comprehensive risk assessment**

#### Risk Assessment System
- **20-Point Scoring Algorithm** - Evidence-based risk calculation
- **Risk Thresholds** - Low (0-4), Moderate (5-9), High (≥10) points
- **Real-time Risk Calculation** - Live updates with visual progress bars
- **Color-coded Risk Levels** - Immediate visual risk identification

#### Assessment Components
- **Client Risk Factors** - Inconsistent condom use, multiple partners, recent STI
- **Partner Risk Factors** - ART status, viral load, multiple partners, injection drug use
- **Pregnancy Modifiers** - Trimester assessment, breastfeeding plans
- **Clinical Safety Screening** - 8-question comprehensive safety assessment

#### Advanced Workflows
- **Progressive Disclosure** - Section visibility based on client responses
- **Auto-Opening Modals** - Completion-based eligibility recommendations
- **Zambian Clinical Guidelines 2023** - Compliant PrEP regimens and dosing
- **POC Tests Integration** - Immediate test ordering from eligibility assessment

### 3. PMTCT (Prevention of Mother-to-Child Transmission)
**Maternal HIV management for pregnant women**

#### Core Features
- **HIV Care Enrollment** - Transfer-in support and facility tracking
- **ART History Management** - Start type classification, prior ARV exposure
- **WHO Clinical Stage Assessment** - Stage-specific symptom checklists (Stage 2-4)
- **Comorbidities & Coinfections** - Signs of serious illness monitoring
- **TPT Integration** - TB Preventive Treatment within unified PMTCT workflow

#### Clinical Components
- **Mother's HIV History** - ART status tracking (already on ART, newly on ART, not on ART)
- **Clinical Assessment** - WHO staging, CD4 count, opportunistic infections
- **Partner & Infant Planning** - Partner HIV status, infant feeding counselling
- **PMTCT Interventions** - Co-trimoxazole prophylaxis, infant ARV prophylaxis
- **Follow-up Scheduling** - Viral load monitoring, adherence counselling

### 4. TPT (TB Preventive Treatment) Module
**Integrated TB prevention for HIV-positive mothers**

#### Screening and Assessment
- **Comprehensive TB Screening** - Symptom checklist (cough, fever, night sweats, weight loss)
- **TPT Status Tracking** - Not started, on TPT, on hold, completed with regimen management
- **TPT Regimen Options** - 3HP, 1HP, 6H, levofloxacin, and other regimens
- **C-reactive Protein Tracking** - TB monitoring biomarker

#### Workflow Logic
- **Conditional Workflow** - Negative screening enables TPT initiation
- **Positive Screening Protocol** - Requires TB investigation before TPT
- **Integration with PMTCT** - Logical grouping as part of comprehensive HIV care

### 5. Pharmacy Module
**Prescription management and dispensation with modular architecture**

#### Modular Components
- **ClientDetailsCard** - Comprehensive patient information with expandable details
- **PharmacyDispenseDetails** - Complete dispensation workflow with dual-column layout
- **DataSummaryList** - Contextual data summary with pharmacy-specific metrics
- **Responsive Design** - Mobile-first approach with useWindowWidth hook

#### Prescription Management
- **PrescriptionModalWrapper** - Advanced prescription creation and management
- **Drug Selection** - Comprehensive drug database with dosing guidance
- **Prescription Validation** - Clinical decision support for drug interactions
- **Dispensation Tracking** - Complete audit trail for medication dispensing

### 6. Pharmacovigilance Module
**Adverse drug reaction monitoring and reporting**

#### ADR Management
- **Comprehensive ADR Reporting** - Structured adverse event documentation
- **Severity Classification** - WHO standard severity grading
- **Causality Assessment** - Evidence-based relationship evaluation
- **Follow-up Protocols** - Systematic adverse event monitoring

## Emergency and Referral Systems

### Component-Based Referral System
**Clean, modal-driven inter-facility patient transfers**

#### Three-Card Architecture
1. **Referral Reasons Card** - Emergency and routine referral reason selection
2. **Routine Referral Checklist Card** - 16-step validation checklist
3. **Receiving Facility Information Card** - Facility selection and coordination

#### Advanced Components
- **ReferralModal** - Comprehensive referral workflow with React Hook Form
- **FacilitySelector** - Dynamic facility selection with search and filtering
- **EmergencyChecklist** - Context-aware emergency procedure validation
- **Bi-directional Sync** - Automatic sync between Danger Signs and Emergency Referral

#### Referral Categories
- **Emergency Referrals** - Immediate transfer required for danger signs
- **Routine Referrals** - Scheduled transfers for specialized care
- **Multi-category Classification** - Comprehensive referral type management

### Clinical Decision Support System (CDSS)

#### Dynamic Alert Modals
- **Real-time Recommendations** - Immediate clinical guidance based on data entry
- **Completion-based Triggers** - Modals appear after mandatory field completion
- **React Portal Rendering** - High z-index modal display for optimal visibility
- **Form Trigger Integration** - CDSS alerts triggered by form completion events

#### Decision Rules Engine
- **Evidence-based Rules** - WHO and CDC guideline compliance
- **Risk Stratification** - Automatic risk level calculation and recommendations
- **Clinical Pathways** - Guided clinical decision workflows
- **Alert Prioritization** - Critical, warning, and informational alert levels

## Patient Management System

### Registration and Search
- **Zambian-specific Fields** - NRC, NUPIN, ART Number integration
- **Advanced Search** - Multi-parameter patient search capabilities
- **Facility-based Isolation** - Secure patient data management by facility
- **CSV Import/Export** - Bulk patient operations and data migration

### Data Security and Privacy
- **ABAC Security** - 23 active attribute-based access control policies
- **Row-Level Security** - Database-level facility isolation
- **Session Management** - PostgreSQL context-based security
- **Audit Trail** - Complete system activity logging for compliance

## Administrative Features

### Facility Management
- **Multi-facility Support** - 3,600+ healthcare facilities across Zambia
- **Facility Registry Integration** - Zambian MoH facility database integration
- **Geographic Coverage** - 10 provinces and 116 districts support
- **Facility-specific Configuration** - Customizable settings per facility

### User Access Control
- **Role-based Permissions** - Healthcare-appropriate access levels
- **Multi-layered Authentication** - Session-based security with fallback
- **User Activity Monitoring** - Comprehensive user action logging
- **Password Policy Enforcement** - Healthcare security standards compliance

### Performance Monitoring
- **Smart Caching Strategy** - Multi-tier TTL optimization with fallback systems
- **Database Optimization** - Memory-conscious indexing for Replit constraints
- **Component Memoization** - Lazy loading to prevent render cycles
- **Performance Dashboards** - Real-time system performance monitoring

## Technology Integration

### Healthcare Standards
- **WHO Guidelines** - Evidence-based clinical decision rules compliance
- **HIPAA Standards** - Healthcare privacy and security compliance
- **Zambian MoH Standards** - National healthcare protocol alignment
- **Clinical Evidence Integration** - Research-backed recommendation systems

### External Services
- **AI Clinical Support** - Anthropic Claude API for clinical decision analysis
- **Medical Research** - Perplexity API for evidence-based recommendations
- **Infrastructure Services** - PostgreSQL 16, Redis, Bull Queue with fallbacks
- **Healthcare Integrations** - WHO, Zambian MoH facility registry

This comprehensive feature set makes SmartCare PRO a complete solution for Zambian healthcare facilities, combining modern technology with healthcare-specific requirements and clinical best practices.