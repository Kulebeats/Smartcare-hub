# ANC Module Documentation
## SmartCare PRO - Antenatal Care System

### Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Structure](#component-structure)
4. [API Reference](#api-reference)
5. [Clinical Decision Support](#clinical-decision-support)
6. [Workflow Guide](#workflow-guide)
7. [Integration Guide](#integration-guide)

---

## Overview

The ANC (Antenatal Care) module has been completely refactored from a monolithic 11,425-line component into a modern, modular architecture using React, TypeScript, and React Query. The system follows the Zambian ANC Guidelines 2022 and provides comprehensive clinical decision support.

### Key Features
- **Tab-based Navigation**: 7 specialized tabs for different aspects of antenatal care
- **Real-time Clinical Decision Support**: Automatic danger sign detection and alert generation
- **Three-Card Referral System**: Structured referral workflow with source, transport, and receiving facility cards
- **PMTCT Integration**: Comprehensive HIV/AIDS care and prevention management
- **Performance Optimized**: React Query with intelligent caching and prefetching

### Technology Stack
- **Frontend**: React 18, TypeScript, React Query, Tailwind CSS
- **Backend**: Node.js, Express, In-memory storage (development)
- **State Management**: React Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library

---

## Architecture

### Component Hierarchy
```
ANCTabsPage (Main Container)
├── TabNavigation
├── ClinicalAlerts
├── PatientSummary
└── Tab Components
    ├── RapidAssessmentTab
    ├── ClientProfileTab
    ├── ExaminationTab
    ├── LabsTab
    ├── CounselingTab
    ├── ReferralTab
    └── PMTCTTab
```

### Data Flow
1. **Patient Selection** → Load existing encounter or create new
2. **Tab Navigation** → Each tab maintains its own state
3. **Clinical Rules Engine** → Evaluates data in real-time
4. **Alert Generation** → Creates alerts based on clinical rules
5. **Data Persistence** → Saves to backend via API calls

### Service Layer Architecture
```
Services/
├── clinical-rules.service.ts    # Clinical decision logic
├── referral.service.ts          # Referral management
├── monitoring.service.ts        # Vital signs monitoring
└── validation.service.ts        # Form validation
```

---

## Component Structure

### 1. RapidAssessmentTab
**Purpose**: Quick screening for danger signs and immediate concerns

**Key Features**:
- Danger signs checklist (trimester-specific)
- Visit information capture
- Emergency alert generation

**Data Captured**:
- Visit date and number
- Chief complaints
- Danger signs presence
- Initial risk assessment

### 2. ClientProfileTab
**Purpose**: Comprehensive patient demographics and obstetric history

**Key Features**:
- Demographic information
- Obstetric history (G/P)
- Medical history
- Risk factor assessment

**Data Captured**:
- Personal information
- Previous pregnancies
- Medical conditions
- Social history

### 3. ExaminationTab
**Purpose**: Physical examination and vital signs recording

**Key Features**:
- Vital signs monitoring
- Physical examination findings
- Fetal assessment
- Real-time alert generation

**Data Captured**:
- Blood pressure, pulse, temperature
- Weight, height, BMI
- Fundal height
- Fetal heart rate
- Physical examination findings

### 4. LabsTab
**Purpose**: Laboratory test ordering and result management

**Key Features**:
- Test ordering interface
- Result entry and tracking
- Abnormal value flagging
- Historical result viewing

**Tests Included**:
- Hemoglobin/Hematocrit
- Blood group & Rh
- HIV testing
- Syphilis (VDRL/RPR)
- Urinalysis
- Blood glucose
- Hepatitis B

### 5. CounselingTab
**Purpose**: Health education and counseling documentation

**Topics Covered**:
- Nutrition counseling
- Birth preparedness
- Danger signs education
- Breastfeeding preparation
- Family planning
- Lifestyle modifications

### 6. ReferralTab
**Purpose**: Three-card referral system management

**Card System**:
1. **Source Card**: Referring facility information
2. **Transport Card**: Transportation arrangements
3. **Receiving Card**: Destination facility details

**Features**:
- Pre-referral checklist
- Referral letter generation
- Emergency vs routine classification

### 7. PMTCTTab
**Purpose**: Prevention of Mother-to-Child HIV Transmission

**Key Features**:
- HIV status tracking
- ART management
- Viral load monitoring
- Transmission risk calculation
- Infant prophylaxis planning

---

## API Reference

### Base URL
```
/api/anc
```

### Endpoints

#### Encounters
```http
GET    /encounters/:patientId     # Get all encounters for patient
GET    /encounter/:encounterId     # Get specific encounter
POST   /encounter                  # Create new encounter
PATCH  /encounter/:encounterId     # Update encounter
```

#### Vital Signs
```http
GET    /vitals/:encounterId        # Get vital signs
POST   /vitals/:encounterId        # Record vital signs
```

#### Lab Results
```http
GET    /labs/:encounterId          # Get lab results
POST   /labs/:encounterId          # Record lab results
```

#### Clinical Alerts
```http
GET    /alerts/:patientId          # Get active alerts
POST   /alerts                     # Create alert
PATCH  /alerts/:alertId/acknowledge # Acknowledge alert
```

#### Referrals
```http
GET    /referrals/:patientId       # Get referrals
POST   /referral                   # Create referral
PATCH  /referral/:referralId       # Update referral status
```

#### Statistics
```http
GET    /statistics/:facilityId     # Get facility statistics
```

### Request/Response Examples

#### Create Encounter
```javascript
POST /api/anc/encounter
{
  "patientId": "patient-123",
  "visitDate": "2025-01-08",
  "visitNumber": 1,
  "gestationalAgeWeeks": 12,
  "chiefComplaints": ["Nausea", "Fatigue"]
}

Response:
{
  "id": "encounter-456",
  "patientId": "patient-123",
  "visitDate": "2025-01-08",
  "visitNumber": 1,
  "gestationalAgeWeeks": 12,
  "chiefComplaints": ["Nausea", "Fatigue"],
  "createdAt": "2025-01-08T10:30:00Z"
}
```

---

## Clinical Decision Support

### Danger Signs Detection

The system automatically detects and alerts for the following danger signs:

#### All Trimesters
- Vaginal bleeding
- Severe headache
- Blurred vision
- Fever (>38°C)
- Severe abdominal pain
- Difficulty breathing

#### First Trimester Specific
- Severe vomiting
- Signs of ectopic pregnancy

#### Second/Third Trimester
- Decreased fetal movement
- Premature contractions
- Rupture of membranes

### Clinical Rules Engine

The clinical rules engine evaluates:

1. **Vital Signs**
   - Hypertension (≥140/90)
   - Severe hypertension (≥160/110)
   - Tachycardia (>100 bpm)
   - Fever (>38°C)

2. **Laboratory Values**
   - Severe anemia (Hb <7 g/dL)
   - Moderate anemia (Hb 7-10 g/dL)
   - Proteinuria (++ or more)
   - Glycosuria

3. **Risk Factors**
   - Previous pregnancy complications
   - Medical conditions
   - Age (<18 or >35)
   - Multiple pregnancy

### Alert Severity Levels

- **Critical**: Immediate action required (red alerts)
- **High**: Urgent attention needed (orange alerts)
- **Medium**: Close monitoring required (yellow alerts)
- **Low**: Routine follow-up (blue alerts)

---

## Workflow Guide

### Standard ANC Visit Workflow

1. **Patient Registration/Selection**
   - Search for existing patient or register new
   - Select patient to begin ANC visit

2. **Rapid Assessment** (Tab 1)
   - Screen for danger signs
   - Document chief complaints
   - Determine if immediate referral needed

3. **Client Profile** (Tab 2)
   - Update demographic information
   - Record obstetric history
   - Calculate gestational age from LMP/ultrasound

4. **Physical Examination** (Tab 3)
   - Record vital signs
   - Perform physical examination
   - Document fetal assessment

5. **Laboratory Tests** (Tab 4)
   - Order required tests
   - Enter available results
   - Review historical results

6. **Counseling** (Tab 5)
   - Provide health education
   - Document counseling topics covered
   - Schedule next visit

7. **Referral** (Tab 6) - If needed
   - Complete three-card system
   - Generate referral letter
   - Arrange transportation

8. **PMTCT** (Tab 7) - For HIV+ or at-risk
   - Manage ART therapy
   - Calculate transmission risk
   - Plan infant prophylaxis

### Emergency Workflow

For patients presenting with danger signs:

1. **Immediate Assessment**
   - Quick danger sign screening
   - Vital signs check

2. **Stabilization**
   - Provide emergency care
   - Document interventions

3. **Referral Preparation**
   - Complete emergency referral
   - Arrange urgent transport
   - Call receiving facility

---

## Integration Guide

### React Query Integration

```typescript
// Using the ANC queries hook
import { useAncQueries } from '@/hooks/anc/useAncQueries';

const MyComponent = () => {
  const { 
    encounters, 
    vitals, 
    labs, 
    alerts,
    isLoading 
  } = useAncQueries(patientId);
  
  // Component logic
};
```

### Clinical Rules Integration

```typescript
import { evaluateClinicalRules } from '@/services/anc/clinical-rules.service';

const checkForAlerts = (data: ANCData) => {
  const rules = evaluateClinicalRules(data);
  const triggeredRules = rules.filter(r => r.triggered);
  
  if (triggeredRules.length > 0) {
    // Generate alerts
  }
};
```

### Custom Tab Development

To add a new tab to the ANC module:

1. Create tab component in `/client/src/pages/anc/tabs/`
2. Add to `ANC_TABS` array in `ANCTabsPage.tsx`
3. Implement required props interface:

```typescript
interface TabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
  onBack?: () => void;
}
```

---

## Testing

### Running Tests

```bash
# Run all ANC tests
npm test -- __tests__/anc

# Run specific test suite
npm test -- __tests__/anc/clinical-rules.test.ts

# Run integration tests
npm test -- __tests__/anc/integration.test.tsx
```

### Test Coverage Areas

- Clinical rules engine validation
- Danger sign detection accuracy
- Form validation logic
- API endpoint functionality
- Component integration
- User workflow scenarios

---

## Troubleshooting

### Common Issues

1. **Tabs not loading**
   - Check patient ID is valid
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Alerts not appearing**
   - Verify clinical rules service is running
   - Check threshold values in rules configuration
   - Ensure data is being passed correctly

3. **Data not saving**
   - Check network requests in browser
   - Verify backend is running
   - Check for validation errors

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('ANC_DEBUG', 'true');
```

---

## Compliance & Standards

The ANC module complies with:

- **Zambian ANC Guidelines 2022**
- **WHO ANC Recommendations**
- **HIPAA Privacy Standards**
- **Clinical Data Standards**

### Data Privacy

- All patient data is encrypted in transit
- Role-based access control enforced
- Audit logging for all data access
- PHI protection measures implemented

---

## Support & Resources

- **Technical Support**: Contact development team
- **Clinical Guidelines**: Zambian MoH ANC Guidelines 2022
- **Training Materials**: Available in `/docs/training/`
- **API Documentation**: Swagger UI at `/api-docs`

---

## Version History

- **v2.0.0** (January 2025): Complete refactor to modular architecture
- **v1.0.0** (Legacy): Monolithic implementation

---

*Last Updated: January 2025*