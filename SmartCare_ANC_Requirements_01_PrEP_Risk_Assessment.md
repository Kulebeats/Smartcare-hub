# [BR ANC 01] PrEP Risk Assessment and Clinical Decision Support Enhancement

## 2. Epic Link
ANC-2025-Q1-PREP-ENHANCEMENT

**Rationale**: This epic encompasses the comprehensive enhancement of PrEP risk assessment capabilities within the ANC module, facilitating evidence-based maternal HIV prevention through standardized WHO guideline implementation.

## 3. Module Taxonomy
**ANC** (Antenatal Care Module)

## 4. Sequence Identifier
**01** (Foundational primitive)

**Interpretation**: This requirement establishes the core PrEP risk assessment framework upon which subsequent clinical decision support and eligibility determination capabilities are predicated.

## 5. Priority Stratification
**Critical** — indispensable within the current sprint window

**Directive**: Essential for maternal HIV prevention compliance with WHO guidelines, directly impacting patient safety in high-risk pregnancy scenarios requiring immediate PrEP intervention protocols.

## 6. Dependency Lattice
• **Depends On**: None (foundational primitive)
• **Enables**: [BR ANC 02] Eligibility Assessment Workflow, [BR ANC 03] Clinical Decision Support Modals, [BR ANC 04] POC Test Integration

**Implementation Note**: Foundational component that enables downstream clinical workflows and decision support mechanisms.

## 7. User Centred Narrative
**As a** healthcare provider conducting antenatal care consultations  
**I require** a comprehensive PrEP risk assessment tool with real-time scoring and clinical recommendations  
**So that** I can accurately evaluate maternal HIV prevention needs and provide evidence-based PrEP counseling aligned with WHO guidelines.

## 8. Business & Clinical Context Matrix

| Dimension | Explication |
|-----------|-------------|
| **Current Problem** | Manual risk assessment processes lack standardization and WHO guideline compliance. Healthcare providers require structured tools for consistent PrEP eligibility evaluation during antenatal visits. |
| **Business Value** | Standardized risk assessment reduces consultation time by 20 minutes, improves clinical documentation accuracy by 85%, decreases liability exposure through evidence-based decision support. |
| **Clinical Impact** | Enhanced maternal HIV prevention through systematic risk evaluation, improved adherence to WHO PrEP guidelines, reduced mother-to-child HIV transmission risk in high-risk pregnancies. |
| **Regulatory Driver** | WHO Consolidated Guidelines on HIV Prevention, Diagnosis, Treatment and Care for Key Populations (2024 Update), Zambian Ministry of Health Clinical Guidelines 2023. |

## 9. Functional Requirements Catalogue

### Risk Assessment Core Logic
1. The system shall implement a 20-point scoring algorithm incorporating client risk factors, partner risk factors, and pregnancy-specific modifiers
2. The system shall evaluate inconsistent condom use (2 points), multiple partners (2 points), and recent STI diagnosis (3 points) as client risk factors
3. The system shall assess partner HIV status, ART adherence, viral load status, multiple partnerships, and injection drug use as partner risk factors
4. The system shall apply pregnancy trimester and breastfeeding plan modifiers to risk calculation

### Clinical Decision Support Integration
5. The system shall classify risk levels as Low (0-4 points), Moderate (5-9 points), or High (≥10 points) with corresponding clinical recommendations
6. The system shall generate real-time clinical guidance based on calculated risk scores and WHO protocol compliance
7. The system shall trigger dynamic alert modals for moderate and high-risk scenarios requiring immediate clinical intervention
8. The system shall provide contextual recommendations for risk mitigation and PrEP initiation consideration

## 10. Non-Functional Requirements Matrix

| Vector | Specification |
|--------|---------------|
| **Performance** | Risk calculation processing within 100ms, real-time UI updates with 60fps responsiveness |
| **Clinical Accuracy** | WHO guideline compliance verification, evidence-based scoring algorithm validation |
| **Usability** | Intuitive risk factor selection, clear visual risk level indicators, contextual clinical guidance |
| **Integration** | Seamless compatibility with existing ANC workflows, modal state management preservation |
| **Audit Trail** | Comprehensive logging of risk assessments, clinical decisions, and provider interventions |
| **Security** | ABAC compliance for risk assessment data, encrypted storage of sensitive clinical information |

## 11. Business Rule Corpus

### Risk Calculation Logic
• **Client Risk Factors**: Inconsistent condom use (2 points), multiple partners (2 points), recent STI (3 points) with maximum 7 points
• **Partner Risk Factors**: HIV-positive not on ART (3 points), detectable viral load (3 points), multiple partners (2 points), injection drug use (3 points) with maximum 11 points
• **Pregnancy Modifiers**: Second/third trimester (1 point), breastfeeding plans with HIV-positive partner (1 point) with maximum 2 points
• **Risk Thresholds**: Low risk (0-4), Moderate risk (5-9), High risk (≥10) with corresponding clinical protocols

### Clinical Decision Rules
• **Moderate Risk**: Requires enhanced counseling and PrEP consideration with partner testing protocols
• **High Risk**: Mandates immediate PrEP initiation discussion with comprehensive clinical support
• **Contraindication Assessment**: Kidney problems, bone density issues, drug allergies must be evaluated before PrEP recommendation
• **Documentation Requirements**: All risk assessments require clinical notes and provider signature

## 12. Behaviour Driven Acceptance Criteria

| ID | Given (context) | When (trigger) | Then (expected consequence) |
|----|-----------------|----------------|----------------------------|
| **AC1** | Healthcare provider accesses PrEP risk assessment | They select client risk factors indicating high-risk behavior | System calculates real-time risk score and displays appropriate risk level classification |
| **AC2** | Risk assessment indicates moderate risk (5-9 points) | Provider completes mandatory fields | System triggers clinical decision modal with WHO-compliant recommendations and counseling protocols |
| **AC3** | Assessment reveals HIV-positive partner not on ART | Provider documents partner status | System adds 3 points to risk score and generates urgent PrEP consideration alert with partner linkage recommendations |
| **AC4** | Provider indicates kidney problems during contraindication screening | They attempt to proceed with PrEP recommendation | System blocks PrEP initiation and displays alternative clinical management options |
| **AC5** | High-risk assessment (≥10 points) completed | Provider saves assessment | System generates comprehensive clinical recommendations and schedules appropriate follow-up protocols |

## 13. Technical Specification Ledger

| Vector | Specification Synopsis |
|--------|----------------------|
| **Database** | Extend ancPrepAssessmentSchema with risk_score (integer), risk_level (enum), calculated_at (timestamp), clinical_recommendations (text array) |
| **API** | POST /api/patients/:id/anc/prep-assessment with comprehensive risk calculation endpoint returning clinical guidance |
| **State Management** | Implement useRiskCalculation hook with real-time scoring, debounced validation, and clinical recommendation generation |
| **UI Components** | RiskScoreIndicator, ClinicalRecommendationPanel, and ContraIndicationAlert components with TypeScript interfaces |
| **Validation Engine** | calculateANCPrepRisk function with WHO guideline compliance and evidence-based scoring algorithms |
| **Integration** | Seamless compatibility with existing modal state management and clinical decision support infrastructure |

## 14. Definition of Done (DoD)

• **Functional Completeness**: All 8 functional requirements implemented with comprehensive unit test coverage ≥95%
• **Clinical Accuracy**: WHO guideline compliance verified through clinical stakeholder review and evidence-based validation
• **Performance Benchmarking**: Risk calculation consistently under 100ms with real-time UI responsiveness maintained
• **Integration Testing**: Seamless compatibility with existing ANC workflows and modal state management verified
• **User Acceptance**: Healthcare provider workflow testing completed with clinical usability approval
• **Security Validation**: ABAC compliance maintained with risk assessment data encryption and audit trail implementation
• **Documentation**: Clinical protocols, user guides, and technical specifications updated with risk assessment procedures

## 15. Quality Assurance Checklist (Pre-Submission Gate)

• **Clinical Validation**: Risk scoring algorithm reviewed and approved by clinical subject matter experts
• **WHO Guideline Compliance**: Evidence-based scoring thresholds validated against WHO consolidated guidelines
• **Performance Testing**: Load testing with concurrent risk assessments, response time SLA validation completed
• **Integration Integrity**: Compatibility with existing modal system and clinical workflows verified
• **Data Accuracy**: Risk calculation precision testing with clinical scenario validation
• **User Experience**: Healthcare provider workflow testing with usability feedback integration
• **Security Assessment**: ABAC compliance, data encryption, and audit trail functionality validated

## 16. Ancillary Artefacts & Referential Corpus

### Clinical Documentation
• **WHO Consolidated Guidelines**: HIV Prevention, Diagnosis, Treatment and Care for Key Populations (2024 Update)
• **Zambian Clinical Guidelines 2023**: Antenatal care protocols and HIV prevention strategies
• **Evidence-Based Research**: Maternal PrEP effectiveness studies and risk assessment validation literature

### Technical Specifications
• **API Documentation**: RESTful endpoint specifications for risk assessment and clinical recommendation services
• **Component Library**: React component specifications with TypeScript interfaces and clinical workflow integration
• **Database Schema**: Extended ANC assessment schema with risk calculation and clinical recommendation fields

### Design Assets
• **Clinical Workflow Diagrams**: Risk assessment process flows with WHO guideline integration points
• **User Interface Mockups**: Risk score visualization and clinical recommendation display components
• **Accessibility Guidelines**: WCAG 2.1 AA compliance specifications for clinical assessment interfaces

---

## Revision Log

| Version | Date | Author | Commentary |
|---------|------|--------|------------|
| 0.1 | 2025-07-25 | Technical BA | Initial PrEP risk assessment requirement instantiation |
| 0.2 | yyyy-mm-dd | Clinical SME | WHO guideline alignment and clinical workflow integration |
| 0.3 | yyyy-mm-dd | Dev Lead | Technical architecture review and implementation feasibility assessment |