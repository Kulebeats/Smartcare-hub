# Changelog

## [0.2.5] - 2025-04-09

### Added
- ✅ Enhanced Pharmacovigilance Module:
  - Added "3HP (Isoniazid + Rifapentine) initiated" as a follow-up drug option
  - Implemented session-based acknowledgment system for clinical alerts
  - Added special classification for truly life-threatening symptoms in Grade 4 alerts

### Improved
- 🔄 Optimized Clinical Alert Dialogs:
  - Reduced alert dialog size by 40% (two iterations of 20%)
  - Made alert text more concise with proper spacing
  - Optimized typography for better readability in smaller dialogs
  - Fixed React DOM nesting issues for improved stability

### Fixed
- 🔧 Resolved HTML structure issues in alert dialogs
- 🔧 Improved clinical alert text to fit properly in smaller dialog windows
- 🔧 Enhanced warning labels for Grade 3 and Grade 4 adverse reactions

## [0.2.4] - 2025-04-04

### Added
- ✅ Enhanced scrolling functionality in all sections:
  - Implemented max-height with overflow-y-auto for long sections
  - Added sticky headers for improved section navigation
  - Added sticky footer buttons for easy access to actions
  - Made tabs more accessible with consistent navigation

### Improved
- 🔄 Improved patient dashboard layout:
  - Added scrollable content containers for risk assessment
  - Enhanced recent visits and appointments sections with more content 
  - Added sticky headers for better visibility during scrolling
  - Increased maximum heights to accommodate more content

## [0.2.3] - 2025-03-27

### Changed
- 🔄 Removed Clinical Summary dialog from Pharmacovigilance module:
  - Simplified UI by removing view summary option
  - Streamlined workflow by focusing on direct form submission
  - Reduced form complexity

## [0.2.2] - 2025-03-26

### Added
- ✅ Enhanced Pharmacovigilance module:
  - Added comprehensive co-morbidities tracking:
    - Liver Disease
    - Stroke
    - Cardiovascular Disease (CVD)
    - Seizures
    - Allergies (including Asthma)
  - Implemented Adverse Drug Reactions (ADR) section:
    - Initial screening question
    - Free-text description field
    - System Review with categorized symptoms:
      - Gastro-intestinal symptoms
      - CNS/Neural/Psychiatric symptoms
      - Cardiovascular symptoms
      - Skin & Musculoskeletal symptoms
      - Genital & Urinary symptoms
    - Symptom grading (1-4) and "Other" specifications
  - Improved UI/UX:
    - Added scrollable sections with sticky headers
    - Fixed tabs navigation structure
    - Enhanced form validation

### Fixed
- 🔧 Fixed tabs component structure and hierarchy
- 🔧 Improved scrolling functionality in all sections
- 🔧 Enhanced section header visibility with sticky positioning

## [0.2.1] - 2025-03-17

### Added
#### Medical Records System Enhancements
- ✅ Added Pharmacovigilance card as standalone section:
  - Comprehensive form with registration details
  - Patient information auto-population
  - Follow-up reason selection
  - Co-morbidities tracking
  - Form validation using react-hook-form and zod
- ✅ Improved medical records UI:
  - Consistent card-based layout
  - Collapsible sections
  - Integrated with patient data system

## [0.2.0] - 2025-03-17

### Added
#### Patient Registration System
- ✅ Multi-step patient registration form with sections:
  - Personal Information
  - Parents/Guardian Details
  - Marital/Birth/Education Details
  - Biometric (placeholder for future implementation)
- ✅ Age-based conditional fields:
  - NRC field appears only for patients 16 years and above
  - Under Five Card Number field appears only for children under 5 years
- ✅ Form validation using react-hook-form and zod
- ✅ Summary dialog showing all entered information before saving

#### Database Implementation
- ✅ PostgreSQL database setup with tables:
  - Users table for authentication
  - Patients table with comprehensive fields
  - ART Follow-ups table for future implementation
  - Prescriptions table for future implementation
- ✅ Database migration using Drizzle ORM
- ✅ Proper data types and constraints

#### User Interface Features
- ✅ Professional design with SmartCare PRO branding
- ✅ Responsive form layout
- ✅ Tab-based navigation between form sections
- ✅ Field validation with error messages
- ✅ Conditional form fields based on patient age
- ✅ Summary view before final submission

### Technical Implementation
- ✅ TypeScript with proper type definitions
- ✅ React frontend with shadcn/ui components
- ✅ Form validation using react-hook-form and zod
- ✅ Database integration using Drizzle ORM
- ✅ Protected routes for authenticated users
- ✅ Session management and authentication system

### Pending Features
- 🔄 Real-time data synchronization
- 🔄 Offline-first capabilities
- 🔄 Advanced reporting and analytics
- 🔄 Biometric data capture implementation
- 🔄 Integration with SmartCare hub

## [0.1.0] - 2025-03-17

Initial release with basic features.

### Added
#### Patient Registration System
- ✅ Multi-step patient registration form with tabs:
  - Personal Information
  - Parents/Guardian Details
  - Marital/Birth/Education Details
  - Biometric (placeholder for future implementation)
- ✅ Age-based conditional fields:
  - NRC field appears only for patients 16 years and above
  - Under Five Card Number field appears only for children under 5 years
- ✅ Registration summary dialog showing all entered information before redirect

#### Database Schema
- ✅ PostgreSQL database setup with tables:
  - Users table for authentication
  - Patients table with comprehensive fields
  - ART Follow-ups table for future implementation
  - Prescriptions table for future implementation

#### User Interface Features
- ✅ Responsive form layout with proper validation
- ✅ Professional color scheme matching SmartCare PRO branding
- ✅ Header with facility name and logo
- ✅ Form navigation with Previous/Next buttons
- ✅ Patient search interface with multiple search options

### Technical Implementation
- ✅ React frontend with TypeScript
- ✅ Form validation using react-hook-form and zod
- ✅ Database integration using Drizzle ORM
- ✅ Protected routes for authenticated users
- ✅ Session management and authentication system

### Pending Features
- 🔄 Real-time data synchronization
- 🔄 Offline-first capabilities
- 🔄 Advanced reporting and analytics
- 🔄 Biometric data capture implementation

## Database Schema Details

### Patients Table
```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  surname TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  is_estimated_dob BOOLEAN DEFAULT FALSE,
  sex TEXT NOT NULL,
  nrc TEXT,
  no_nrc BOOLEAN DEFAULT FALSE,
  under_five_card_number TEXT,
  napsa TEXT,
  country TEXT NOT NULL,
  cellphone TEXT NOT NULL,
  other_cellphone TEXT,
  landline TEXT,
  email TEXT,
  house_number TEXT,
  road_street TEXT,
  area TEXT,
  city_town_village TEXT,
  landmarks TEXT,
  mothers_name TEXT,
  fathers_name TEXT,
  guardian_name TEXT,
  guardian_relationship TEXT,
  marital_status TEXT,
  birth_place TEXT,
  education_level TEXT,
  occupation TEXT,
  facility TEXT NOT NULL,
  registration_date TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);
```
