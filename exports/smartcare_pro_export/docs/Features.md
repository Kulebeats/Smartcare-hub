# Features Documentation

## Current Features

### 1. Authentication System
- Secure login/logout functionality
- Session management
- Protected routes for authenticated users
- Facility-specific access control

### 2. Patient Registration
#### Personal Information
- Basic demographics
- Contact details
- Identification (NRC/Under Five Card)
- Address information

#### Conditional Fields
- NRC field for patients 16 years and above
- Under Five Card Number for children under 5
- Guardian details for minors

#### Data Validation
- Real-time form validation
- Required field enforcement
- Age-based field validation
- Summary review before submission

### 3. Medical Records Management
#### Main Components
- Presenting Complaints
- TB Constitutional Symptoms
- Review of Systems
- Past Medical History
- Chronic/Non-Chronic Conditions
- Pharmacovigilance Reports
- Allergies
- Family & Social History

#### Pharmacovigilance System
- Registration details
- Patient information
- Adverse drug reactions (K2)
- ART history tracking
- HIV-specific medical tests (E1)
- Other medical tests (E2)
- Follow-up reason selection
- Co-morbidities tracking
- Direct form submission workflow

### 4. User Interface
#### Navigation
- Collapsible sidebar
- Tab-based section navigation
- Breadcrumb navigation
- Responsive design

#### Form Components
- Input validation
- Error messaging
- Progress tracking
- Multi-step forms
- Modal dialogs
- Card-based layouts

### 5. Data Management
- PostgreSQL database integration
- Efficient data retrieval
- Secure data storage
- Data validation using Zod
- Form handling with react-hook-form

## Feature Status

✅ Implemented
- User authentication
- Patient registration
- Basic medical records
- Pharmacovigilance reporting
- Facility selection
- Form validation
- Database integration

🔄 In Progress
- Real-time synchronization
- Offline capabilities
- Advanced reporting
- Analytics dashboard

❌ Planned
- Biometric integration
- SmartCare hub connectivity
- Mobile app development
- Automated backups

## Feature Documentation Guidelines

### Update Process
1. When adding new features:
   - Add feature description under appropriate section
   - Update feature status (✅, 🔄, or ❌)
   - Document any dependencies or requirements
   - Add relevant code examples if needed

2. When modifying existing features:
   - Update feature description to reflect changes
   - Document any breaking changes
   - Update status if feature implementation status changes

### Documentation Sections to Update
- Main Components: Add new major feature categories
- Sub-components: Document feature details
- Status: Update implementation status
- Validation & Rules: Document new business rules
- UI Components: Document new interface elements

### Version Control
- Feature documentation should match application version
- Keep feature history for tracking evolution
- Mark deprecated features clearly
- Document feature dependencies

This document will be updated as new features are implemented or existing features are modified.