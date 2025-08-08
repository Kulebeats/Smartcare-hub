# SmartCare Pro Business Requirements Document — ANC Module Enhancement

## 1. Title
[BR ANC 15] Enhanced ANC Risk Assessment Completion Validation and User Experience Optimization

## 2. Epic Link
ANC-2025-Q1-UX-Enhancement

**Rationale**: This enhancement addresses critical user experience gaps in the PrEP risk assessment workflow, ensuring comprehensive data capture and improved clinical decision support accuracy.

## 3. Module Taxonomy
**ANC** (Antenatal Care Module)

## 4. Sequence Identifier
**15** (Iterative enhancement to core clinical workflow)

**Interpretation**: This enhancement builds upon the established ANC PrEP assessment framework (foundational elements 01-14) to optimize user experience and data completeness validation.

## 5. Priority Stratification
**High** — Schedule at next capacity increment

**Justification**: Current incomplete assessment scenarios result in suboptimal clinical decision support, potentially compromising patient safety in high-risk pregnancy scenarios requiring PrEP intervention.

## 6. Dependency Lattice
• **Depends On**: [BR ANC 14] Dynamic Alert Modal System Implementation (completed)
• **Enables**: [BR ANC 16] Advanced Clinical Analytics Dashboard, [BR ANC 17] Predictive Risk Modeling

**Implementation Note**: Enhancement leverages existing modal state management and risk calculation infrastructure without requiring architectural modifications.

## 7. User Centred Narrative
**As a** healthcare provider conducting antenatal PrEP risk assessments  
**I require** intelligent completion validation with contextual guidance and progressive feedback  
**So that** I can ensure comprehensive risk evaluation, reduce assessment abandonment, and provide evidence-based clinical recommendations for maternal HIV prevention.

## 8. Business & Clinical Context Matrix

| Dimension | Explication |
|-----------|-------------|
| **Current Problem** | Assessment completion rates show 0/8 to 1/11 field completion scenarios with users unable to progress through clinical decision workflows. System lacks intelligent validation feedback and completion guidance, resulting in incomplete risk assessments. |
| **Business Value** | Increased assessment completion rates (target: 85%+), reduced consultation time by 15 minutes per patient, decreased incomplete records requiring follow-up documentation, improved clinical workflow efficiency. |
| **Clinical Impact** | Enhanced maternal HIV prevention through comprehensive risk assessment, improved adherence to WHO PrEP guidelines, reduced missed high-risk scenarios, strengthened clinical decision support accuracy for pregnancy-related HIV prevention strategies. |
| **Regulatory Driver** | WHO Consolidated Guidelines on HIV Prevention, Diagnosis, Treatment and Care for Key Populations (2024 Update), Zambian Ministry of Health Clinical Guidelines 2023 for ANC services. |

## 9. Functional Requirements Catalogue

### Core Validation Logic
1. The system shall implement progressive validation checkpoints at 25%, 50%, 75%, and 100% completion thresholds
2. The system shall provide contextual field-level guidance for incomplete mandatory sections
3. The system shall display dynamic completion progress indicators with visual feedback
4. The system shall prevent modal triggering until minimum viable assessment threshold (60%) is achieved

### User Experience Enhancements
5. The system shall implement intelligent field focusing for incomplete sections
6. The system shall provide section-specific completion status with actionable guidance
7. The system shall offer assessment resumption capabilities for interrupted workflows
8. The system shall display estimated time remaining based on completion velocity

### Clinical Decision Support Integration
9. The system shall trigger graduated clinical guidance based on partial assessment data
10. The system shall provide interim risk stratification for incomplete assessments
11. The system shall enable conditional clinical recommendations based on available data
12. The system shall maintain audit trail for assessment completion patterns

## 10. Non-Functional Requirements Matrix

| Vector | Specification |
|--------|---------------|
| **Performance** | Validation processing within 200ms, progress calculation optimized for 60fps UI updates |
| **Usability** | Assessment completion rate improvement ≥20%, user task completion time reduction ≥15% |
| **Accessibility** | WCAG 2.1 AA compliance for progress indicators, screen reader compatible validation messaging |
| **Scalability** | Support for 500+ concurrent assessment sessions, efficient state management for complex workflows |
| **Security** | Maintain existing ABAC and RLS compliance, ensure data integrity during progressive validation |
| **Integration** | Seamless compatibility with existing modal state management and clinical decision support systems |

## 11. Business Rule Corpus

### Assessment Completion Logic
• **Minimum Viable Assessment**: Require completion of client risk factors (inconsistent condom use, multiple partners, recent STI) before enabling clinical recommendations
• **Progressive Disclosure**: Section C visibility requires "not interested" response in Section B; Sections D&E require "interested" response
• **Risk Calculation**: Maintain 20-point scoring algorithm with Low (0-4), Moderate (5-9), High (≥10) thresholds
• **Modal Triggering**: Dynamic alert modal activation requires ≥60% assessment completion AND calculated risk ≥5 points

### Clinical Workflow Rules
• **Eligibility Assessment**: Five mandatory fields must be completed before auto-opening eligibility recommendations modal
• **POC Test Integration**: Baseline clinical safety questions trigger POC test ordering workflow when answered negatively
• **Prescription Workflow**: PrEP prescription section accessible only after positive eligibility determination
• **Data Persistence**: Auto-save assessment data every 30 seconds and on field blur events

## 12. Behaviour Driven Acceptance Criteria

| ID | Given (context) | When (trigger) | Then (expected consequence) |
|----|-----------------|----------------|----------------------------|
| **AC1** | User accesses PrEP risk assessment with 0 fields completed | They complete first mandatory field | System displays "1/8 completed" with next field highlight and contextual guidance |
| **AC2** | Assessment reaches 25% completion threshold | User pauses for >60 seconds | System displays "Continue assessment - 3 minutes remaining" with resume prompt |
| **AC3** | User attempts to close modal with 40% completion | They click close button | System presents "Save progress and resume later?" confirmation with completion benefits |
| **AC4** | Assessment achieves 60% completion with moderate risk indicators | User completes next mandatory field | System triggers clinical guidance modal with interim recommendations |
| **AC5** | User completes eligibility section with mixed responses | They attempt to access prescription section | System validates eligibility completion and provides appropriate access control |
| **AC6** | Assessment completion velocity decreases significantly | System detects slow progress pattern | Contextual help appears with field explanations and clinical significance |
| **AC7** | User has incomplete partner risk assessment | They indicate partner HIV status as positive | System prioritizes partner-related fields with clinical urgency indicators |

## 13. Technical Specification Ledger

| Vector | Specification Synopsis |
|--------|----------------------|
| **Database** | Extend ancPrepAssessmentSchema with completion_metadata (completion_percentage, session_duration, completion_velocity) and validation_checkpoints fields |
| **State Management** | Implement useCompletionTracking hook with progressive validation, auto-save functionality, and completion analytics |
| **UI Components** | Create CompletionProgressBar, SectionValidationFeedback, and ContextualGuidanceTooltip components with TypeScript interfaces |
| **Validation Engine** | Develop validateAssessmentProgression function with configurable thresholds and conditional validation rules |
| **Analytics Integration** | Implement completion telemetry with assessment abandonment tracking and user journey analytics |
| **Performance Optimization** | Utilize React.memo for completion components, implement debounced validation (300ms), optimize re-render patterns |

## 14. Definition of Done (DoD)

• **Functional Completeness**: All 12 functional requirements implemented with comprehensive unit test coverage ≥90%
• **User Experience Validation**: Assessment completion rate improvement demonstrated through A/B testing with statistical significance
• **Performance Benchmarking**: Validation processing consistently under 200ms with 60fps UI responsiveness maintained
• **Clinical Accuracy**: Risk calculation algorithm maintains WHO guideline compliance with clinical stakeholder approval
• **Integration Integrity**: Seamless compatibility with existing modal state management and clinical decision support verified
• **Accessibility Compliance**: WCAG 2.1 AA certification for all new UI components and interaction patterns
• **Documentation Completeness**: Technical specifications, user guides, and clinical workflow documentation updated
• **Security Validation**: ABAC and RLS compliance maintained with penetration testing for new validation endpoints

## 15. Quality Assurance Checklist (Pre-Submission Gate)

• **Requirements Traceability**: Each functional requirement mapped to specific acceptance criteria and technical specifications
• **Clinical Validation**: Healthcare provider workflow testing completed with clinical stakeholders approval
• **Performance Testing**: Load testing with 500+ concurrent users, response time SLA validation, memory leak assessment
• **Cross-browser Compatibility**: Testing across Chrome, Firefox, Safari, Edge with mobile responsiveness verification
• **Data Integrity**: Assessment completion data consistency verified across progressive validation checkpoints
• **Error Handling**: Comprehensive error scenarios tested including network interruptions and session timeouts
• **Accessibility Audit**: Screen reader testing, keyboard navigation validation, color contrast verification
• **Security Assessment**: Input validation, XSS prevention, CSRF protection for all new validation endpoints

## 16. Ancillary Artefacts & Referential Corpus

### Technical Documentation
• **API Specification**: RESTful endpoint documentation for assessment validation and completion tracking
• **Component Library**: React component specifications with TypeScript interfaces and usage examples
• **State Management Diagrams**: Redux/Context API flow charts for completion tracking and validation state

### Clinical References
• **WHO Consolidated Guidelines**: HIV Prevention, Diagnosis, Treatment and Care for Key Populations (2024 Update)
• **Zambian Clinical Guidelines 2023**: Antenatal care and HIV prevention protocols
• **Evidence-Based Research**: Maternal PrEP effectiveness studies and risk assessment validation research

### Design Assets
• **Figma Prototypes**: Interactive mockups for completion progress indicators and validation feedback UI
• **User Journey Maps**: Assessment workflow optimization with completion enhancement touchpoints
• **Accessibility Specifications**: WCAG 2.1 AA compliance guidelines for validation components

### Implementation Guides
• **Development Handbook**: Step-by-step implementation guide for progressive validation system
• **Testing Protocols**: Comprehensive testing strategies for completion tracking and clinical accuracy
• **Deployment Checklist**: Production rollout procedures with rollback contingency planning

---

## Revision Log

| Version | Date | Author | Commentary |
|---------|------|--------|------------|
| 0.1 | 2025-07-25 | Technical BA | Initial requirements instantiation based on ANC module analysis |
| 0.2 | yyyy-mm-dd | Clinical SME | Integrated clinical workflow feedback and WHO guideline alignment |
| 0.3 | yyyy-mm-dd | Dev Lead | Technical specification refinement and implementation feasibility review |

---

**Editorial Note**: This requirements document provides comprehensive specifications for enhancing the ANC PrEP risk assessment completion validation system while preserving existing clinical workflow integrity and technical architecture. Implementation should proceed through iterative development cycles with continuous clinical stakeholder feedback integration.