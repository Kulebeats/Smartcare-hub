# [BR ANC 03] Dynamic Alert Modal System with Completion-Based Triggers

## 2. Epic Link
ANC-2025-Q1-PREP-ENHANCEMENT

**Rationale**: This requirement establishes sophisticated modal management for clinical decision support, enabling context-aware alerts and recommendations through completion-based triggering mechanisms.

## 3. Module Taxonomy
**ANC** (Antenatal Care Module)

## 4. Sequence Identifier
**03** (Core clinical workflow)

**Interpretation**: Advanced modal system that depends on foundational risk assessment and eligibility frameworks to provide intelligent clinical decision support.

## 5. Priority Stratification
**High** — schedule at next capacity increment

**Directive**: Critical for clinical workflow optimization, reducing provider cognitive load through intelligent alert timing and context-aware recommendations.

## 6. Dependency Lattice
• **Depends On**: [BR ANC 01] PrEP Risk Assessment Enhancement, [BR ANC 02] Eligibility Assessment Workflow
• **Enables**: [BR ANC 07] Clinical Decision Support Analytics, [BR ANC 08] Provider Workflow Optimization

**Implementation Note**: Requires completed risk assessment and eligibility data for intelligent modal triggering and clinical recommendation generation.

## 7. User Centred Narrative
**As a** healthcare provider managing complex clinical assessments during antenatal consultations  
**I require** intelligent modal alerts that trigger at appropriate completion milestones with relevant clinical guidance  
**So that** I can receive timely decision support without workflow interruption and provide evidence-based patient care.

## 8. Business & Clinical Context Matrix

| Dimension | Explication |
|-----------|-------------|
| **Current Problem** | Static modal systems interrupt clinical workflow with premature alerts. Providers need intelligent timing for clinical decision support that respects assessment completion and clinical context. |
| **Business Value** | Intelligent modal timing reduces provider interruption by 60%, improves clinical decision accuracy by 35%, decreases consultation time through optimized workflow patterns. |
| **Clinical Impact** | Enhanced clinical decision-making through context-aware alerts, improved provider satisfaction with reduced workflow disruption, better patient care through timely clinical recommendations. |
| **Regulatory Driver** | Clinical workflow optimization standards, provider user experience guidelines, evidence-based clinical decision support implementation protocols. |

## 9. Functional Requirements Catalogue

### Completion-Based Triggering
1. The system shall implement completion threshold-based modal triggering with minimum viable assessment requirements
2. The system shall monitor assessment completion status in real-time with progressive milestone tracking
3. The system shall defer modal triggers until 60% completion threshold achieved for clinical accuracy
4. The system shall provide graduated clinical guidance based on partial assessment data availability

### Modal State Management
5. The system shall implement comprehensive modal hierarchy management with parent-child state preservation
6. The system shall prevent unintended modal closures during child modal interactions through event isolation
7. The system shall maintain modal context across clinical workflow transitions with state consistency
8. The system shall support modal stacking for complex clinical decision workflows

### Clinical Decision Integration
9. The system shall generate context-aware clinical recommendations based on completed assessment sections
10. The system shall provide risk-stratified alerts with appropriate clinical urgency indicators
11. The system shall integrate with existing clinical decision support rules and WHO guideline protocols
12. The system shall support deferred modal presentation for incomplete assessments with progress guidance

## 10. Non-Functional Requirements Matrix

| Vector | Specification |
|--------|---------------|
| **Performance** | Modal triggering within 100ms of completion threshold, smooth animations with 60fps responsiveness |
| **User Experience** | Non-intrusive timing, contextual relevance, clear modal hierarchy, intuitive navigation patterns |
| **Clinical Workflow** | Minimal disruption to provider tasks, intelligent timing based on clinical context, progressive guidance |
| **State Management** | Robust modal state persistence, reliable event handling, consistent parent-child modal relationships |
| **Integration** | Seamless compatibility with existing clinical modules, preserved audit trail, maintained security protocols |
| **Accessibility** | WCAG 2.1 AA compliance for modal interactions, keyboard navigation, screen reader compatibility |

## 11. Business Rule Corpus

### Modal Triggering Logic
• **Completion Thresholds**: 60% minimum completion required for clinical decision modal activation
• **Risk-Based Triggering**: Moderate risk (5-9 points) and high risk (≥10 points) trigger dynamic alert modals
• **Eligibility Modals**: Automatic eligibility recommendations modal upon 5 mandatory field completion
• **Assessment Progress**: Real-time completion monitoring with progressive milestone tracking

### Modal Hierarchy Management
• **Parent-Child Relationships**: Main ANC modal persists during child modal interactions (clinical decision, eligibility, POC tests, deferral)
• **Event Isolation**: Child modal events prevented from triggering parent modal closure through event propagation control
• **State Consistency**: Modal state transitions managed through centralized state management with user interaction context
• **Modal Stacking**: Support for multiple modal layers with proper z-index management and focus handling

## 12. Behaviour Driven Acceptance Criteria

| ID | Given (context) | When (trigger) | Then (expected consequence) |
|----|-----------------|----------------|----------------------------|
| **AC1** | Assessment completion reaches 60% with moderate risk indicators | Provider completes next mandatory field | System triggers clinical decision modal with interim recommendations and risk-appropriate clinical guidance |
| **AC2** | User opens clinical decision modal from main assessment | They interact with modal controls and clinical recommendations | Main ANC modal remains open and accessible, child modal events isolated from parent state management |
| **AC3** | Assessment shows 40% completion with incomplete risk factors | Provider attempts clinical action | System displays "Continue assessment - clinical guidance available at 60% completion" with progress indicator |
| **AC4** | Eligibility assessment achieves 5 mandatory field completion | Provider saves final required field | System automatically opens eligibility recommendations modal with clinical decision options |
| **AC5** | High-risk assessment (≥10 points) completed with contraindications identified | Provider acknowledges risk level | System presents graduated clinical options including PrEP deferral with comprehensive exclusion criteria |

## 13. Technical Specification Ledger

| Vector | Specification Synopsis |
|--------|----------------------|
| **State Management** | Implement useModalStateManagement hook with isChildModalTransition, lastUserInteraction tracking, and centralized state transitions |
| **Event Handling** | handleChildModalEvents function with stopPropagation, preventDefault, and event isolation for parent-child modal interactions |
| **Completion Tracking** | Real-time completion monitoring with useEffect hooks, progressive milestone validation, and threshold-based triggering |
| **Modal Components** | Enhanced Dialog components with onOpenChange handlers, user interaction context detection, and state preservation logic |
| **Integration Layer** | Seamless compatibility with existing PrepDynamicAlertModal, PrepEligibilityModal, POCTestOrderDialog, and PrepDeferralModal components |
| **Performance Optimization** | React.memo for modal components, debounced completion tracking, optimized re-render patterns with state dependency arrays |

## 14. Definition of Done (DoD)

• **Modal State Management**: Comprehensive parent-child modal hierarchy implemented with reliable state preservation and event isolation
• **Completion-Based Triggering**: Intelligent modal timing based on assessment completion thresholds with progressive clinical guidance
• **Clinical Integration**: Seamless compatibility with existing clinical decision support rules and WHO guideline protocols
• **User Experience**: Non-intrusive modal timing validated through healthcare provider workflow testing and usability studies
• **Performance**: Modal interactions maintain 60fps responsiveness with optimized state management and efficient event handling
• **Accessibility**: WCAG 2.1 AA compliance for modal navigation, keyboard accessibility, and screen reader compatibility
• **Documentation**: Modal state management patterns, completion triggering logic, and clinical workflow integration documented

## 15. Quality Assurance Checklist (Pre-Submission Gate)

• **Modal Hierarchy Testing**: Parent-child modal relationships validated across all clinical workflow scenarios
• **Completion Threshold Accuracy**: Triggering logic tested with various assessment completion patterns and clinical scenarios
• **Event Isolation Verification**: Child modal interactions confirmed to preserve parent modal state and prevent unintended closures
• **Clinical Workflow Integration**: Healthcare provider testing completed with modal timing and clinical relevance validation
• **Performance Benchmarking**: Modal triggering and state transitions tested under load with responsiveness requirements met
• **Cross-Modal Compatibility**: Integration with existing clinical decision support modals verified through comprehensive testing
• **User Experience Validation**: Provider workflow testing with modal timing optimization and clinical context appropriateness

## 16. Ancillary Artefacts & Referential Corpus

### Technical Specifications
• **Modal State Management Patterns**: React hooks and context patterns for complex modal hierarchy management
• **Event Handling Documentation**: Event isolation and propagation control specifications for parent-child modal interactions
• **Performance Optimization Guidelines**: State management optimization and re-render prevention strategies for modal systems

### Clinical Workflow Documentation
• **Modal Triggering Algorithms**: Completion threshold calculation and clinical context evaluation for intelligent modal timing
• **Clinical Decision Integration**: WHO guideline compliance and evidence-based recommendation generation within modal workflows
• **Provider Workflow Patterns**: Healthcare provider task flow optimization with modal timing and clinical context integration

### Design Specifications
• **Modal User Experience Guidelines**: Non-intrusive timing patterns, contextual relevance criteria, and clinical workflow preservation
• **Accessibility Specifications**: WCAG 2.1 AA compliance for complex modal interactions and hierarchical navigation
• **Visual Design Patterns**: Modal layering, focus management, and clinical context visualization for healthcare provider interfaces

---

## Revision Log

| Version | Date | Author | Commentary |
|---------|------|--------|------------|
| 0.1 | 2025-07-25 | Technical BA | Initial dynamic modal system requirement with completion-based triggering framework |
| 0.2 | yyyy-mm-dd | UX Designer | Modal hierarchy patterns and user experience optimization for clinical workflows |
| 0.3 | yyyy-mm-dd | Clinical SME | Clinical decision support integration and provider workflow validation |