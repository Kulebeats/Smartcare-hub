# Data Structure Documentation

## Database Schema

### Patients
```typescript
// Primary patient information
interface Patient {
  id: number;              // Primary key
  firstName: string;       // Required
  surname: string;         // Required
  dateOfBirth: Date;       // Required
  isEstimatedDob: boolean; // Default: false
  sex: string;            // Required
  nrc: string | null;     // Optional, for 16+ years
  noNrc: boolean;         // Default: false
  underFiveCardNumber: string | null; // Optional, for <5 years
  napsa: string | null;    // Optional

  // Contact Information
  country: string;         // Required
  cellphone: string;       // Required
  otherCellphone: string | null;
  landline: string | null;
  email: string | null;

  // Address Information
  houseNumber: string | null;
  roadStreet: string | null;
  area: string | null;
  cityTownVillage: string | null;
  landmarks: string | null;

  // Family Information
  mothersName: string | null;
  fathersName: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;

  // Additional Information
  maritalStatus: string | null;
  birthPlace: string | null;
  educationLevel: string | null;
  occupation: string | null;

  // Facility Information
  facility: string;        // Required
  registrationDate: Date;  // Default: NOW()
  lastUpdated: Date;       // Default: NOW()
}
```

### Medical Records
```typescript
interface MedicalRecord {
  id: number;
  patientId: number;      // Foreign key to Patients
  recordType: string;     // Enum of record types
  recordDate: Date;
  notes: string;
  createdBy: number;      // Foreign key to Users
  createdAt: Date;
  updatedAt: Date;
}
```

### Pharmacovigilance Reports
```typescript
interface PharmacovigilanceReport {
  id: number;
  patientId: number;      // Foreign key to Patients

  // Registration
  dateOfReporting: Date;
  healthFacility: string;
  district: string;
  province: string;

  // Adverse Drug Reactions
  drugName: string;
  reactionType: string;
  severity: string;
  onsetDate: Date;
  description: string;
  actionTaken: string;
  outcome: string;

  // ART History
  regimen: string;
  startDate: Date;
  endDate: Date | null;
  reasonForChange: string | null;

  // HIV Tests
  cd4Count: string;
  viralLoad: string;
  testDate: Date;

  // Other Tests
  testName: string;
  result: string;
  testDate: Date;

  // Additional Information
  followUpReason: string;
  coMorbidities: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

### Users
```typescript
interface User {
  id: number;
  username: string;
  password: string;       // Hashed
  role: string;
  facility: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Data Relationships

### One-to-Many Relationships
- Facility -> Patients
- Patient -> Medical Records
- Patient -> Pharmacovigilance Reports
- User -> Medical Records

### Many-to-Many Relationships
- Patients <-> Facilities (through Visits)
- Users <-> Facilities (through Assignments)

## Data Validation Rules

### Patient Registration
- Required fields must not be empty
- Age-based validation for NRC/Under Five Card
- Phone number format validation
- Email format validation (if provided)
- Date validations for DOB and registration

### Medical Records
- Record date cannot be in future
- Patient ID must exist
- Record type must be valid
- Created by must be valid user

### Pharmacovigilance
- Drug name required
- Severity must be valid enum
- Dates cannot be in future
- Test results must be in valid format

## Data Access Patterns

### Common Queries
```sql
-- Get Patient with Latest Medical Records
SELECT p.*, mr.*
FROM patients p
LEFT JOIN medical_records mr ON mr.patient_id = p.id
WHERE p.id = $1
ORDER BY mr.created_at DESC
LIMIT 10;

-- Get Pharmacovigilance Reports by Facility
SELECT pr.*
FROM pharmacovigilance_reports pr
JOIN patients p ON p.id = pr.patient_id
WHERE p.facility = $1
ORDER BY pr.date_of_reporting DESC;
```

### Indexes
```sql
-- Patient Lookup Indexes
CREATE INDEX idx_patients_nrc ON patients(nrc);
CREATE INDEX idx_patients_under_five ON patients(under_five_card_number);
CREATE INDEX idx_patients_facility ON patients(facility);

-- Medical Records Indexes
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);

-- Pharmacovigilance Indexes
CREATE INDEX idx_pharma_patient ON pharmacovigilance_reports(patient_id);
CREATE INDEX idx_pharma_date ON pharmacovigilance_reports(date_of_reporting);
```

This documentation will be updated as the data structure evolves with new features and requirements.

## Documentation Maintenance

### Schema Updates
1. When adding new tables:
   - Document complete schema
   - Add relevant indexes
   - Document relationships
   - Include validation rules

2. When modifying existing tables:
   - Document schema changes
   - Update affected relationships
   - Revise validation rules
   - Note any migrations needed

### Access Pattern Updates
1. For new queries:
   - Document query patterns
   - Include performance considerations
   - Add relevant indexes
   - Document expected results

2. For modified queries:
   - Update query documentation
   - Review index effectiveness
   - Update performance notes

### Version Control
- Keep schema history
- Document migration paths
- Track index changes
- Maintain query optimizations