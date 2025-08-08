# [BR ANC 02] PrEP Eligibility Assessment and Progressive Disclosure Workflow

## 2. Epic Link
ANC-2025-Q1-PREP-ENHANCEMENT

**Rationale**: This requirement establishes the comprehensive eligibility assessment framework with progressive disclosure patterns, enabling systematic PrEP candidacy evaluation through evidence-based clinical protocols.

## 3. Module Taxonomy
**ANC** (Antenatal Care Module)

## 4. Sequence Identifier
**02** (Foundational primitive)

**Interpretation**: Core eligibility assessment capability that builds upon risk assessment foundations and enables downstream prescription and clinical management workflows.

## 5. Priority Stratification
**Critical** — indispensable within the current sprint window

**Directive**: Essential for systematic PrEP eligibility determination, ensuring clinical safety through comprehensive contraindication screening and patient readiness assessment.

## 6. Dependency Lattice
• **Depends On**: [BR ANC 01] PrEP Risk Assessment and Clinical Decision Support Enhancement
• **Enables**: [BR ANC 05] Prescription Management Workflow, [BR ANC 06] Clinical Safety Assessment Integration

**Implementation Note**: Requires completed risk assessment data for informed eligibility determination and clinical decision support.

## 7. User Centred Narrative
**As a** healthcare provider evaluating PrEP candidacy during antenatal consultations  
**I require** a structured eligibility assessment with progressive disclosure and clinical safety screening  
**So that** I can systematically determine PrEP appropriateness while ensuring patient safety and informed consent.

## 8. Business & Clinical Context Matrix

| Dimension | Explication |
|-----------|-------------|
| **Current Problem** | Inconsistent PrEP eligibility evaluation lacks systematic contraindication screening and patient readiness assessment. Progressive disclosure needed to reduce cognitive load during complex clinical decision-making. |
| **Business Value** | Systematic eligibility assessment reduces clinical errors by 40%, improves documentation completeness by 75%, decreases liability through comprehensive contraindication screening. |
| **Clinical Impact** | Enhanced patient safety through systematic contraindication evaluation, improved informed consent processes, standardized PrEP candidacy determination aligned with clinical guidelines. |
| **Regulatory Driver** | WHO Consolidated Guidelines for PrEP implementation, Zambian Clinical Guidelines 2023 for maternal HIV prevention, clinical safety protocols for pregnancy care. |

## 9. Functional Requirements Catalogue

### Progressive Disclosure Framework
1. The system shall implement progressive section visibility based on client interest and clinical responses
2. The system shall display Section A (Risk Reduction Counseling) and Section F (Clinical Safety Assessment) by default
3. The system shall reveal Section C (Follow-up Planning) only when client indicates lack of interest in PrEP
4. The system shall display Sections D (Acute HIV Assessment) and E (Medical History) only when client expresses PrEP interest

### Clinical Safety Assessment
5. The system shall evaluate contraindications including kidney problems, bone density issues, drug allergies, and medication interactions
6. The system shall assess baseline clinical safety through urinalysis, creatinine, hepatitis B, and syphilis screening requirements
7. The system shall provide POC test integration for immediate baseline assessment completion
8. The system shall generate eligibility recommendations based on comprehensive safety evaluation

### Eligibility Determination Logic
9. The system shall implement automatic eligibility calculation based on completed assessment sections
10. The system shall trigger eligibility recommendations modal upon completion of mandatory fields
11. The system shall provide clear eligibility decisions with clinical justification and next steps
12. The system shall support eligibility deferral with comprehensive exclusion criteria documentation

## 10. Non-Functional Requirements Matrix

| Vector | Specification |
|--------|---------------|
| **Usability** | Progressive disclosure reduces cognitive load, clear section completion indicators, intuitive workflow navigation |
| **Clinical Safety** | Comprehensive contraindication screening, clinical safety validation, evidence-based eligibility criteria |
| **Performance** | Eligibility calculation within 150ms, responsive section visibility updates, optimized conditional rendering |
| **Integration** | Seamless POC test integration, compatibility with existing modal management, clinical decision support alignment |
| **Audit Trail** | Complete eligibility assessment logging, clinical decision documentation, contraindication tracking |
| **Accessibility** | WCAG 2.1 AA compliance for progressive disclosure, screen reader compatibility, keyboard navigation support |

## 11. Business Rule Corpus

### Progressive Disclosure Logic
• **Default Visibility**: Section A (Risk Reduction Counseling) and Section F (Clinical Safety Assessment) always visible
• **Interest-Based Disclosure**: Sections D and E visible only when client interested in PrEP; Section C visible only when not interested
• **Completion Requirements**: Minimum 5 mandatory fields required for eligibility recommendation generation
• **Clinical Safety Gates**: Contraindications must be evaluated before PrEP eligibility confirmation

### Eligibility Determination Rules
• **Automatic Calculation**: Eligibility status updated real-time based on assessment completion and safety evaluation
• **Contraindication Exclusions**: Active kidney disease, severe bone density issues, known drug allergies exclude PrEP candidacy
• **Baseline Testing Requirements**: Urinalysis, creatinine, hepatitis B screening required before PrEP initiation
• **Modal Triggering**: Eligibility recommendations modal opens automatically upon assessment completion

## 12. Behaviour Driven Acceptance Criteria

| ID | Given (context) | When (trigger) | Then (expected consequence) |
|----|-----------------|----------------|----------------------------|
| **AC1** | Provider accesses eligibility assessment with default sections visible | They indicate client is interested in PrEP | System reveals Sections D (Acute HIV) and E (Medical History) while maintaining Section A and F visibility |
| **AC2** | Client indicates lack of interest in PrEP during assessment | Provider selects "not interested" option | System displays Section C (Follow-up Planning) and hides Sections D and E to focus on alternative interventions |
| **AC3** | Provider completes 5 mandatory eligibility fields | Assessment reaches completion threshold | System automatically opens eligibility recommendations modal with clinical decision support |
| **AC4** | Assessment indicates contraindication during safety screening | Provider documents kidney problems or drug allergies | System generates eligibility deferral with comprehensive exclusion criteria and alternative clinical options |
| **AC5** | Provider selects "No" for baseline urinalysis performed | They complete the response | System displays "Would you like to order this test now?" with POC test integration modal access |

## 13. Technical Specification Ledger

| Vector | Specification Synopsis |
|--------|----------------------|
| **Database** | Extend schema with eligibility_status (enum), eligibility_reason (text), sections_completed (jsonb), contraindications_identified (text array) |
| **State Management** | Implement useEligibilityAssessment hook with progressive disclosure state, completion tracking, and eligibility calculation logic |
| **UI Components** | ProgressiveDisclosureSection, EligibilityStatusIndicator, ContraIndicationAlert, and POCTestIntegration components |
| **Validation Engine** | validateEligibilityCompletion function with conditional section requirements and clinical safety validation |
| **Modal Integration** | EligibilityRecommendationsModal with automatic triggering, clinical guidance, and prescription workflow integration |
| **POC Integration** | Seamless integration with existing POCTestOrderDialog for baseline clinical safety assessment |

## 14. Definition of Done (DoD)

• **Progressive Disclosure**: All conditional section visibility logic implemented with comprehensive state management
• **Clinical Safety**: Contraindication screening completed with evidence-based exclusion criteria validation
• **Eligibility Logic**: Automatic eligibility calculation with real-time status updates and clinical recommendation generation
• **POC Integration**: Baseline test ordering seamlessly integrated with eligibility assessment workflow
• **Modal Management**: Eligibility recommendations modal triggering with existing modal state management compatibility
• **Clinical Validation**: Healthcare provider workflow testing with clinical stakeholder approval and usability confirmation
• **Documentation**: Progressive disclosure patterns, eligibility criteria, and clinical safety protocols documented

## 15. Quality Assurance Checklist (Pre-Submission Gate)

• **Progressive Disclosure Logic**: Conditional section visibility tested across all client interest scenarios
• **Clinical Safety Validation**: Contraindication screening accuracy verified with clinical subject matter experts
• **Eligibility Calculation**: Automatic eligibility determination tested with comprehensive clinical scenarios
• **POC Test Integration**: Baseline testing workflow integration validated with existing test ordering systems
• **Modal State Management**: Compatibility with existing modal infrastructure verified through integration testing
• **User Experience**: Healthcare provider workflow testing completed with progressive disclosure usability validation
• **Performance**: Section visibility updates and eligibility calculation performance benchmarked

## 16. Ancillary Artefacts & Referential Corpus

### Clinical Guidelines
• **WHO PrEP Implementation Guidelines**: Eligibility criteria and contraindication screening protocols
• **Zambian Clinical Guidelines 2023**: Maternal HIV prevention and PrEP safety assessment standards
• **Clinical Safety Protocols**: Evidence-based contraindication evaluation and baseline testing requirements

### Technical Documentation
• **Progressive Disclosure Patterns**: React component patterns for conditional section visibility and state management
• **Eligibility Algorithm**: Clinical decision logic flowcharts and eligibility determination specifications
• **POC Integration Specifications**: Baseline testing workflow integration with existing point-of-care systems

### Design Specifications
• **User Interface Guidelines**: Progressive disclosure visual patterns and section completion indicators
• **Clinical Workflow Diagrams**: Eligibility assessment process flows with decision points and clinical pathways
• **Accessibility Specifications**: WCAG 2.1 AA compliance for progressive disclosure and conditional content

---

## Revision Log

| Version | Date | Author | Commentary |
|---------|------|--------|------------|
| 0.1 | 2025-07-25 | Technical BA | Initial eligibility assessment requirement with progressive disclosure framework |
| 0.2 | yyyy-mm-dd | Clinical SME | Clinical safety protocols and contraindication screening integration |
| 0.3 | yyyy-mm-dd | UX Designer | Progressive disclosure patterns and user experience optimization |