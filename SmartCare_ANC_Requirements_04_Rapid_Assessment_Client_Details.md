# [BR ANC 04] Rapid Assessment and Comprehensive Client Details Capture

## 2. Epic Link
ANC-2025-Q1-CLIENT-INTAKE-OPTIMIZATION

**Rationale**: This epic encompasses the optimization of initial client assessment and comprehensive demographic data capture, facilitating efficient antenatal care initiation through streamlined intake workflows and clinical data collection.

## 3. Module Taxonomy
**ANC** (Antenatal Care Module)

## 4. Sequence Identifier
**04** (Foundational primitive)

**Interpretation**: Essential client intake capability that establishes comprehensive patient data foundation upon which all subsequent clinical assessments and care pathways are predicated.

## 5. Priority Stratification
**Critical** — indispensable within the current sprint window

**Directive**: Foundational requirement for antenatal care delivery, ensuring comprehensive client data capture for clinical decision support, risk stratification, and continuity of care across healthcare facilities.

## 6. Dependency Lattice
• **Depends On**: None (foundational primitive)
• **Enables**: [BR ANC 01] PrEP Risk Assessment, [BR ANC 05] Obstetric History Assessment, [BR ANC 09] Clinical Examination Workflow

**Implementation Note**: Establishes essential client data foundation that enables all downstream clinical assessment and care management capabilities.

## 7. User Centred Narrative
**As a** healthcare provider initiating antenatal care for new clients  
**I require** a rapid assessment tool with comprehensive client details capture and intelligent data validation  
**So that** I can efficiently establish complete patient profiles, identify immediate clinical priorities, and initiate appropriate care pathways with accurate demographic and clinical baseline data.

## 8. Business & Clinical Context Matrix

| Dimension | Explication |
|-----------|-------------|
| **Current Problem** | Manual client intake processes lack standardization and comprehensive data validation. Healthcare providers need efficient tools for rapid assessment and complete demographic capture during initial antenatal visits. |
| **Business Value** | Streamlined intake reduces registration time by 25 minutes, improves data completeness by 90%, decreases documentation errors by 70%, enhances clinical workflow efficiency through structured data capture. |
| **Clinical Impact** | Comprehensive client profiles enable accurate risk stratification, improved clinical decision support, enhanced continuity of care, and better maternal-fetal health outcomes through complete baseline assessment. |
| **Regulatory Driver** | Zambian Ministry of Health maternal care standards, WHO antenatal care guidelines, clinical documentation requirements, patient safety protocols for comprehensive intake assessment. |

## 9. Functional Requirements Catalogue

### Rapid Assessment Core Components
1. The system shall implement immediate triage assessment for urgent clinical conditions requiring emergency referral
2. The system shall capture gestational age estimation through LMP and clinical assessment with automated dating calculations
3. The system shall assess current pregnancy symptoms and immediate clinical concerns with severity stratification
4. The system shall evaluate maternal vital signs with automated alert generation for abnormal parameters

### Comprehensive Client Demographics
5. The system shall capture complete personal demographics including NRC, NUPIN, contact information, and emergency contacts
6. The system shall record socioeconomic factors including education level, occupation, household composition, and support systems
7. The system shall document geographical information including residence, facility accessibility, and referral pathway mapping
8. The system shall collect insurance and payment information with eligibility verification capabilities

### Clinical Baseline Assessment
9. The system shall record comprehensive medical history including chronic conditions, previous hospitalizations, and current medications
10. The system shall capture reproductive history including contraceptive use, previous pregnancies, and gynecological conditions
11. The system shall assess family medical history with genetic risk factor identification for maternal-fetal complications
12. The system shall document lifestyle factors including nutrition, substance use, occupational exposures, and social determinants

### Intelligent Data Validation
13. The system shall implement real-time data validation with clinical range checking and consistency verification
14. The system shall provide automated completeness scoring with missing data identification and prioritization
15. The system shall support data import from existing patient records with duplicate detection and merge capabilities
16. The system shall generate intake summary reports with clinical priority flagging and care pathway recommendations

## 10. Non-Functional Requirements Matrix

| Vector | Specification |
|--------|---------------|
| **Performance** | Data capture processing within 200ms, real-time validation with immediate feedback, efficient form navigation |
| **Usability** | Intuitive intake workflow, progressive data capture, clear validation messaging, mobile-responsive design |
| **Data Quality** | Comprehensive validation rules, automated consistency checking, duplicate detection algorithms, data completeness scoring |
| **Integration** | Seamless patient record system integration, facility registry connectivity, insurance verification capability |
| **Security** | ABAC compliance for client data, encrypted personal information storage, audit trail for all data modifications |
| **Accessibility** | WCAG 2.1 AA compliance for intake forms, multilingual support for Zambian languages, assistive technology compatibility |

## 11. Business Rule Corpus

### Rapid Assessment Prioritization
• **Emergency Conditions**: Severe hypertension (≥160/110), heavy bleeding, severe abdominal pain, signs of pre-eclampsia trigger immediate emergency protocol
• **Gestational Age Validation**: LMP-based dating cross-validated with clinical assessment, ultrasound correlation when available
• **Triage Classification**: High-risk conditions require immediate clinical evaluation, routine cases proceed through standard intake workflow
• **Vital Signs Alerts**: Temperature >38.5°C, BP >140/90, pulse >100 or <60, respiratory rate >24 trigger clinical alerts

### Client Demographics Standards
• **Identification Verification**: NRC validation through national registry, NUPIN cross-reference for existing patient records
• **Contact Information**: Minimum two contact methods required, emergency contact mandatory with relationship specification
• **Address Validation**: Geographical coordinates for rural locations, facility catchment area verification, referral pathway mapping
• **Insurance Verification**: Real-time eligibility checking where available, payment method documentation, social support assessment

### Clinical History Validation
• **Medical History Completeness**: Previous pregnancies, chronic conditions, medications, allergies require comprehensive documentation
• **Risk Factor Identification**: Diabetes, hypertension, cardiac conditions, previous complications flagged for enhanced monitoring
• **Family History Scoring**: Genetic risk factors for maternal-fetal complications assessed with clinical significance weighting
• **Lifestyle Assessment**: Smoking, alcohol, substance use documented with cessation counseling trigger protocols

## 12. Behaviour Driven Acceptance Criteria

| ID | Given (context) | When (trigger) | Then (expected consequence) |
|----|-----------------|----------------|----------------------------|
| **AC1** | New client presents for initial antenatal visit | Provider initiates rapid assessment | System displays triage checklist with emergency condition screening and immediate priority identification |
| **AC2** | Client reports LMP date during gestational age assessment | Provider enters LMP and current date | System automatically calculates gestational age, estimated delivery date, and flags any dating discrepancies for clinical review |
| **AC3** | Provider enters vital signs with elevated blood pressure (150/95) | They complete vital signs documentation | System generates immediate clinical alert with pre-eclampsia screening recommendation and monitoring protocol |
| **AC4** | Client provides NRC number during demographic capture | Provider enters identification information | System validates NRC format, checks existing patient database, and displays any matching records for merge consideration |
| **AC5** | Intake assessment shows 70% completion with missing critical data | Provider attempts to proceed to clinical assessment | System displays prioritized missing data list with clinical significance indicators and completion guidance |
| **AC6** | Client indicates history of diabetes during medical history capture | Provider documents chronic condition | System flags high-risk pregnancy status, generates monitoring recommendations, and suggests appropriate referral protocols |

## 13. Technical Specification Ledger

| Vector | Specification Synopsis |
|--------|----------------------|
| **Database** | Create comprehensive client_intake table with demographics, rapid_assessment, clinical_baseline, and validation_status fields |
| **Validation Engine** | Implement validateClientIntake function with real-time validation, data consistency checking, and completeness scoring |
| **UI Components** | RapidAssessmentTriage, DemographicCapture, ClinicalHistoryForm, and IntakeProgressIndicator components with TypeScript interfaces |
| **Integration Layer** | Patient record system connectivity, facility registry integration, insurance verification API, and duplicate detection algorithms |
| **Data Quality** | Automated validation rules, consistency checking algorithms, missing data prioritization, and intake summary generation |
| **Mobile Optimization** | Responsive design for tablet-based data capture, offline capability for rural settings, and synchronization protocols |

## 14. Definition of Done (DoD)

• **Rapid Assessment**: Emergency triage workflow implemented with immediate clinical alert generation and priority case identification
• **Comprehensive Demographics**: Complete client data capture with validation, verification, and duplicate detection capabilities
• **Clinical Baseline**: Medical history, reproductive history, and family history capture with risk factor identification and clinical significance weighting
• **Data Quality**: Real-time validation, consistency checking, and completeness scoring with automated quality metrics
• **Integration**: Seamless connectivity with existing patient records, facility systems, and clinical decision support infrastructure
• **User Experience**: Healthcare provider workflow testing completed with intake efficiency validation and clinical usability approval
• **Performance**: Data capture and validation processing consistently under 200ms with responsive user interface maintenance

## 15. Quality Assurance Checklist (Pre-Submission Gate)

• **Triage Accuracy**: Emergency condition identification validated with clinical protocols and healthcare provider approval
• **Data Validation**: Comprehensive validation rules tested across all demographic and clinical data fields with accuracy verification
• **Integration Testing**: Patient record connectivity, duplicate detection, and merge capabilities validated through comprehensive testing
• **Clinical Workflow**: Healthcare provider intake workflow testing completed with efficiency metrics and usability validation
• **Data Quality**: Validation algorithms tested with clinical scenarios, completeness scoring accuracy verified
• **Performance**: Load testing with concurrent intake sessions, response time validation, and mobile device compatibility
• **Security**: Data encryption, access control, and audit trail functionality validated for client information protection

## 16. Ancillary Artefacts & Referential Corpus

### Clinical Documentation
• **Zambian MoH Standards**: Antenatal care documentation requirements and maternal health data collection protocols
• **WHO Guidelines**: Comprehensive antenatal care standards and client assessment recommendations
• **Clinical Risk Assessment**: Evidence-based risk factor identification and maternal-fetal health outcome correlation studies

### Technical Specifications
• **Data Validation Standards**: Client demographics validation rules, clinical data consistency requirements, and quality metrics
• **Integration Protocols**: Patient record system connectivity, facility registry integration, and data exchange standards
• **Mobile Implementation**: Responsive design specifications, offline capability requirements, and synchronization protocols

### Design Assets
• **Intake Workflow Diagrams**: Client assessment process flows with triage decision points and clinical pathway integration
• **User Interface Mockups**: Rapid assessment interfaces, demographic capture forms, and progress indication components
• **Accessibility Guidelines**: WCAG 2.1 AA compliance specifications for multilingual support and assistive technology integration

### Validation Documentation
• **Clinical Validation Protocols**: Emergency condition identification accuracy, risk assessment validation, and clinical decision support integration
• **Data Quality Metrics**: Completeness scoring algorithms, validation rule effectiveness, and intake quality measurement standards
• **Performance Benchmarks**: Data capture efficiency metrics, provider workflow optimization, and system responsiveness requirements

---

## Revision Log

| Version | Date | Author | Commentary |
|---------|------|--------|------------|
| 0.1 | 2025-07-25 | Technical BA | Initial rapid assessment and client details requirement instantiation |
| 0.2 | yyyy-mm-dd | Clinical SME | Triage protocols and clinical validation integration |
| 0.3 | yyyy-mm-dd | Data Analyst | Data quality metrics and validation rule optimization |