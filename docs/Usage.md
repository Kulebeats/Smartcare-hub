# SmartCare PRO - User Guide and Usage Documentation

## Getting Started

### System Access
1. **Login** - Secure authentication with facility selection
2. **Dashboard Navigation** - Main dashboard with module access
3. **Patient Search** - Advanced search across multiple parameters
4. **Module Selection** - Choose appropriate clinical module

### Patient Management

#### Patient Registration
```
1. Navigate to Patient Registration
2. Complete Zambian-specific fields:
   - NRC (National Registration Card)
   - NUPIN (National Unique Patient Identifier)
   - ART Number (if applicable)
3. Add demographic information
4. Save and create patient record
```

#### Patient Search
- **Quick Search** - Name, NRC, or NUPIN
- **Advanced Search** - Multiple criteria including facility, date range
- **CSV Import/Export** - Bulk patient operations
- **Facility-based Results** - Only show patients from your facility

## Clinical Modules Usage

### 1. ANC (Antenatal Care) Module

#### Navigation Structure
```
Rapid Assessment → Client Profile → Medical History → 
Examination → Lab Investigations → Counselling → 
Referral → PMTCT → PrEP Assessment
```

#### Section-by-Section Usage

**Rapid Assessment**
1. Record contact date and gestational age
2. Complete pregnancy status evaluation
3. Assess risk level automatically
4. Review encounter summary in sidebar

**Client Profile**
- Always-visible cards for immediate access
- Client Details: Registration, demographics, contact info
- Current Pregnancy: Gravida, para, LMP, EDD
- Obstetric History: Previous pregnancies, complications
- Medical History: Chronic conditions, allergies, medications

**Physical Examination**
1. Maternal Assessment - Vital signs, physical exam
2. Fetal Assessment - Heart rate, movements, position
3. WHO Standard Protocols - Automated compliance checking
4. Real-time data validation

**Laboratory Investigations**
1. **HIV Testing Card**
   - Automatic prefilling from ANC context
   - Client Type: "Single adult" (auto-filled)
   - Visit Type: "PITC" (auto-filled)
   - Service Point: "PMTCT" (auto-filled)
   - Complete testing workflow with results
2. **POC Tests Card**
   - Immediate test ordering
   - Integration with eligibility assessments
   - Results tracking and clinical decision support
3. **Laboratory Tests Card**
   - Blood work, urinalysis, specialized tests
   - Automated results processing
   - Clinical decision alerts

**Counselling & Education**
- Behavioral counselling with evidence-based recommendations
- Health education tracking
- WHO-compliant counselling protocols
- Progress tracking and follow-up scheduling

**Referral System**
1. **Referral Reasons Card** - Click "Add Record" to open comprehensive modal
2. **Routine Referral Checklist Card** - 16-step validation process
3. **Receiving Facility Information Card** - Facility selection and coordination

**PMTCT Integration**
- Automatic triggering when HIV test is positive
- Comprehensive maternal HIV management
- TPT (TB Preventive Treatment) integration
- ART history and clinical staging

### 2. PrEP (Pre-Exposure Prophylaxis) Module

#### Risk Assessment Workflow
```
1. Complete 20-point risk assessment
2. Real-time risk calculation (Low: 0-4, Moderate: 5-9, High: ≥10)
3. Progressive disclosure based on responses
4. Auto-opening eligibility recommendations modal
```

#### Assessment Sections
**Section A: Risk Reduction Counseling**
- Document counseling provision
- Track counseling effectiveness

**Section B: Client Interest Assessment**
- Determine client interest in PrEP
- Conditional follow-up based on response

**Section C: Follow-up Planning** (appears only if not interested)
- Plan next steps for clients not interested in PrEP
- Schedule follow-up assessments

**Section D: Acute HIV Assessment** (appears only if interested)
- Screen for acute HIV infection
- Clinical decision support for HIV testing

**Section E: Medical History Assessment** (appears only if interested)
- Comprehensive medical history review
- Contraindication screening

**Section F: Clinical Safety Assessment**
- 8-question safety screening
- POC test integration for baseline tests
- Eligibility determination

#### PrEP Prescription (Zambian Clinical Guidelines 2023)
- **TDF/FTC 300/200mg** (preferred regimen)
- **TDF/3TC 300/300mg** (alternative regimen)
- **CAB-LA** (long-acting injectable)
- Auto-populated dosing guidance and safety notes

### 3. PMTCT Module Usage

#### Core Workflow
```
1. HIV Care Enrollment
2. ART History Assessment
3. WHO Clinical Stage Evaluation
4. Comorbidities & Coinfections Screening
5. TPT Integration Assessment
```

#### TPT (TB Preventive Treatment) Section
1. **TB Screening Checklist**
   - Cough, fever, night sweats, weight loss
   - Conditional workflow based on screening results
2. **TPT Status Management**
   - Track regimen type (3HP, 1HP, 6H, levofloxacin)
   - Monitor CRP levels for TB activity
3. **Clinical Decision Logic**
   - Negative screening → TPT initiation eligible
   - Positive screening → TB investigation required

### 4. Pharmacy Module Usage

#### Prescription Management
1. **Create Prescription**
   - Open PrescriptionModalWrapper
   - Select medications from comprehensive database
   - Add dosing, frequency, duration
   - Clinical decision support for interactions

2. **Dispensation Workflow**
   - ClientDetailsCard: Patient information review
   - PharmacyDispenseDetails: Dual-column dispensing interface
   - DataSummaryList: Pharmacy-specific metrics
   - Complete audit trail documentation

#### Drug Selection and Validation
- Comprehensive drug database with dosing guidance
- Automatic interaction checking
- Clinical decision support alerts
- Prescription validation before dispensing

## Advanced Features Usage

### Dynamic Alert Modals
- **Trigger Conditions** - Form completion, risk thresholds, clinical criteria
- **Alert Types** - Critical (red), Warning (yellow), Info (blue)
- **Action Required** - Follow recommended clinical actions
- **Portal Rendering** - High-priority alerts appear above all content

### Clinical Decision Support System (CDSS)
1. **Real-time Recommendations** - Immediate guidance during data entry
2. **Evidence-based Rules** - WHO and CDC guideline compliance
3. **Risk Stratification** - Automatic risk calculation and recommendations
4. **Clinical Pathways** - Guided decision workflows

### Component-Based Referral System
1. **Three-Card Interface**
   - Clean card headers with modal access buttons
   - No inline status displays - all functionality in modals
   - Professional, consistent UI across all cards

2. **Comprehensive Referral Modal**
   - Emergency vs. routine referral classification
   - Reason selection with danger sign integration
   - Facility selector with search and filtering
   - Emergency checklist with 16 validation steps
   - Bi-directional sync with danger signs assessment

### Latest Encounter and Data Summary
- **Dynamic Sidebar** - Updates based on active ANC section
- **Section-specific Data** - Relevant encounter information per tab
- **Recent Data Summary** - Aggregated clinical data across all sections
- **Responsive Design** - Mobile-friendly sidebar stacking

## Best Practices

### Data Entry
1. **Complete Required Fields** - System highlights mandatory information
2. **Use Auto-fill Features** - HIV testing auto-fills from ANC context
3. **Review Alerts** - Address clinical decision support recommendations
4. **Save Frequently** - Data auto-saves but manual saves ensure persistence

### Clinical Workflows
1. **Follow Section Order** - Logical progression through assessment tabs
2. **Review Encounter Data** - Check sidebar for data completeness
3. **Address CDSS Alerts** - Follow evidence-based recommendations
4. **Complete Referrals** - Use comprehensive modal workflow for transfers

### System Navigation
1. **Use Search Efficiently** - Multiple search parameters for quick patient location
2. **Leverage Sidebar Information** - Latest encounter data for context
3. **Modal-based Interactions** - All complex workflows use modals for clarity
4. **Facility-based Access** - Data automatically filtered by your facility

### Performance Optimization
1. **Use Caching** - System caches frequently accessed data
2. **Lazy Loading** - Components load as needed for optimal performance
3. **Mobile Optimization** - Responsive design adapts to device size
4. **Offline Resilience** - System handles connectivity issues gracefully

## Troubleshooting

### Common Issues
1. **Login Problems** - Verify facility selection and credentials
2. **Data Not Saving** - Check network connection and required fields
3. **Modal Not Opening** - Ensure prerequisites are met (form completion, etc.)
4. **Performance Issues** - Clear browser cache, check system resources

### Support Resources
1. **Built-in Help** - Context-sensitive help within the application
2. **Clinical Decision Support** - Evidence-based recommendations and guidance
3. **Audit Trail** - Complete activity logging for troubleshooting
4. **Performance Monitoring** - Real-time system health indicators

This comprehensive usage guide ensures healthcare workers can effectively utilize all SmartCare PRO features for optimal patient care and clinical workflow efficiency.