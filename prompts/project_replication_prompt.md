
# SmartCare PRO Project Structure Replication Prompt

I need to create a new project that replicates the exact structure of the SmartCare PRO Version 1.8.3 project, specifically focusing on the documentation folder structure, content, and update protocols. The replication should maintain all the following aspects of the original project including dynamic alert modal system, complete PrEP risk assessment, form trigger-based CDSS modals, and comprehensive ANC workflow integration:

## Documentation Structure 

Please create a project with these exact documentation files:

- `/docs/Overview.md`
- `/docs/Features.md`
- `/docs/Technical.md`
- `/docs/Usage.md`
- `/docs/UserStories.md`
- `/docs/ARCHITECTURE_COMPREHENSIVE.md`
- `/docs/PERFORMANCE_COMPREHENSIVE.md`
- `/docs/IMPLEMENTATION_SUMMARIES.md`
- `/docs/CDSS_COMPREHENSIVE_DOCUMENTATION.md`
- `/docs/ANC-COMPREHENSIVE-DOCUMENTATION.md`
- `/docs/DATA_STRUCTURE_COMPREHENSIVE.md`
- `/docs/SYSTEM_INTEGRATIONS_OVERVIEW.md`
- `/docs/PharmVigilanceWorkflow.md`
- `/docs/BestPractices.md`
- `/docs/DOCUMENTATION_CHANGELOG.md`
- `/RELEASE_NOTES.md`
- `/CHANGELOG.md`
- `/replit.md`

## Documentation Content

The documentation should follow these specific content guidelines:

1. **Overview.md** - Project introduction, purpose, core functionalities for Version 1.8.3
2. **Features.md** - Feature-by-feature breakdown with implementation details for all current features
3. **Technical.md** - Technical implementation details, architecture overview, API documentation
4. **Usage.md** - User-facing documentation with workflows and instructions
5. **UserStories.md** - User stories organized by feature area
6. **ARCHITECTURE_COMPREHENSIVE.md** - Complete system architecture documentation including security, performance, and integration architecture
7. **PERFORMANCE_COMPREHENSIVE.md** - Performance metrics, optimization strategies, targets, and version-specific enhancements
8. **IMPLEMENTATION_SUMMARIES.md** - Implementation details and recent changes for Version 1.8.3
9. **CDSS_COMPREHENSIVE_DOCUMENTATION.md** - Clinical Decision Support System documentation
10. **ANC-COMPREHENSIVE-DOCUMENTATION.md** - Complete ANC module documentation with Version 1.8.3 enhancements
11. **DATA_STRUCTURE_COMPREHENSIVE.md** - Database schema, data relationships, and structure documentation
12. **SYSTEM_INTEGRATIONS_OVERVIEW.md** - Integration architecture and external system connections
13. **PharmVigilanceWorkflow.md** - Pharmacovigilance system workflows and procedures
14. **BestPractices.md** - Development and clinical best practices
15. **DOCUMENTATION_CHANGELOG.md** - Documentation version history and changes
16. **RELEASE_NOTES.md** - Version history and release notes including Version 1.8.3 changes
17. **CHANGELOG.md** - Detailed change log with technical implementation details
18. **replit.md** - Project summary and user preferences

## Current Version Features (1.8.3 - July 2025)

The documentation should reflect these current system capabilities:

### Core Features
- **Patient Management**: Comprehensive patient registration, search, and transfer capabilities
- **Antenatal Care (ANC)**: Complete pregnancy tracking with dynamic obstetric history (1-15 pregnancies)
- **HIV Services**: ART, PrEP, and HTS with real-time risk assessment
- **Pharmacovigilance**: Comprehensive ADR monitoring and safety surveillance
- **Laboratory Integration**: Point-of-care testing and results management
- **Clinical Decision Support**: Real-time alerts and treatment recommendations
- **Pharmacy Management**: Prescription and dispensing workflows

### Technical Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Node.js 20
- **Database**: PostgreSQL 16 + Drizzle ORM + Redis caching
- **Security**: ABAC policies (23 active) + Row-Level Security + Audit trails
- **Performance**: Redis caching + Bull queues + Performance monitoring
- **Deployment**: Replit Cloud Run with auto-scaling

### Version 1.8.3 Enhancements
- **Laboratory Tests & Health Education Modal Integration**
- **Enhanced Point-of-Care Testing workflows**
- **Specialized Diagnostic Tests Integration**
- **UI/UX Consistency and Button Standardization**
- **Technical Implementation with robust modal architecture**
- **Performance optimizations with Redis fallback systems**
- **Security framework enhancements**

## Documentation Maintenance Rules

The documentation should follow these maintenance protocols:

1. **Update Process**:
   - Every new feature must update relevant documentation files
   - UI/UX pattern documentation for new components
   - Schema updates for data structure changes
   - Performance considerations documented
   - Security implications documented

2. **Review Checklist** before committing:
   - All relevant documentation files updated
   - Code examples current and correct
   - UI/UX patterns documented
   - Schema changes documented
   - Performance impact documented
   - User instructions added
   - Documentation formatting verified

3. **Version Control**:
   - Documentation version matches application version (1.8.3)
   - Each release includes documentation updates
   - Keep "as-is" snapshots with each release
   - Mark deprecated features in documentation

4. **Content Quality Standards**:
   - Technical accuracy verified
   - User-friendly language for non-technical readers
   - Comprehensive code examples with explanations
   - Cross-references between related documentation
   - Regular review and updates for relevance

## Prompt Folder Structure

The prompts folder should contain:

- `/prompts/project_replication_prompt.md` - This file
- `/prompts/changelog_template.md` - Template for changelog entries
- `/prompts/ANC_CLINICAL_BUSINESS_RULES.md` - Clinical decision support rules
- `/prompts/PERFORMANCE_OPTIMIZATION_PATTERNS.md` - Performance optimization guidelines

## Implementation Requirements

1. **Exact Structure Replication**: Maintain identical folder structure and file organization
2. **Content Accuracy**: Ensure all documentation reflects actual implemented features
3. **Version Consistency**: All references should be to Version 1.8.3 dated July 2025
4. **Technical Precision**: Code examples and technical details must be accurate
5. **User-Centric Approach**: Documentation should serve both technical and clinical users

## Quality Assurance

1. **Documentation Testing**: Verify all code examples work as documented
2. **Link Validation**: Ensure all internal links are functional
3. **Content Review**: Regular review cycles for accuracy and completeness
4. **User Feedback**: Incorporate feedback from actual system users
5. **Automated Checks**: Implement automated documentation quality checks

## Maintenance Schedule

1. **Daily**: Update implementation summaries for new features
2. **Weekly**: Review and update technical documentation
3. **Monthly**: Comprehensive documentation review and updates
4. **Per Release**: Complete documentation update for new versions
5. **Quarterly**: Architecture and performance documentation review

Please replicate this exact structure with appropriate content in each file following the guidelines specified above. The documentation should serve as a comprehensive resource for developers, healthcare providers, system administrators, and end users of the SmartCare PRO Version 1.8.3 system.

## Current System Status (July 2025)

- **Active Version**: 1.8.3
- **Deployment**: Production on Replit Cloud Run
- **Database**: PostgreSQL 16 with Redis caching
- **Security**: 23 active ABAC policies with RLS
- **Performance**: Optimized with fallback systems
- **Features**: All core modules operational with latest enhancements
- **Documentation**: Comprehensive and up-to-date

The replicated project should reflect this current operational status and serve as a foundation for continued development and deployment.
