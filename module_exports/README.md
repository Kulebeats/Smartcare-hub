# ART and Pharmacovigilance Modules

This directory contains the core components of the ART (Antiretroviral Therapy) and Pharmacovigilance modules from the SmartCare PRO application.

## ART Module

### Core Components

1. **art-page.tsx**
   - Main page component for the ART module
   - Includes patient information display
   - Manages dialog state for different components
   - Contains the main layout and navigation

2. **art-dialog.tsx**
   - The primary form dialog for ART visits
   - Structured with tabs for different sections:
     - Enrollment
     - Clinical Assessment
     - Laboratory Results
     - Treatment Plan
     - Support Services
   - Contains comprehensive validation schema

3. **art-card.tsx**
   - Card component for displaying ART information in the medical records view
   - Summary view of key ART data points

4. **art-form.tsx**
   - Form component for ART data entry
   - Used within the ART dialog
   - Contains field-specific validation and business logic

### Key Features

- Comprehensive ART regimen management
- Patient enrollment tracking
- Clinical assessment with WHO staging
- Laboratory results tracking (CD4, Viral Load)
- Treatment plan with adherence monitoring
- Support services documentation

### Usage

To integrate the ART module into another project:

1. Copy all ART module files
2. Ensure dependencies are installed (React, shadcn components, zod)
3. Import the components as needed
4. Implement the necessary API calls to save and retrieve data

## Pharmacovigilance Module

### Core Components

1. **pharmacovigilance-dialog.tsx**
   - Main dialog component for adverse drug reaction monitoring
   - Contains comprehensive form with validation schema
   - Includes clinical alert system for severe reactions

2. **pharmacovigilance-card.tsx**
   - Card component for displaying pharmacovigilance information
   - Summary view of key adverse reaction data

3. **pharmacovigilance-entry-modal.tsx**
   - Entry point modal for initiating pharmacovigilance checks
   - Options for different types of follow-up

4. **clinical-summary-dialog.tsx**
   - Summary dialog showing clinical information
   - Used for reviewing pharmacovigilance data

### Key Features

- Comprehensive adverse drug reaction tracking
- Symptom grading system (1-4)
- System-based symptom categorization
- Clinical alerts for severe reactions
- Pregnancy and fetal outcome tracking
- Co-morbidities monitoring

### Usage

To integrate the Pharmacovigilance module:

1. Copy all Pharmacovigilance module files
2. Ensure dependencies are installed
3. Import components as needed
4. Implement necessary API calls
5. Configure the clinical alert system

## Integration Example

Here's a simple example of how to use these components:

```tsx
import { ArtDialog } from './art-dialog';
import { PharmacovigilanceDialog } from './pharmacovigilance-dialog';
import { useState } from 'react';

export function MedicalRecords() {
  const [artDialogOpen, setArtDialogOpen] = useState(false);
  const [pharmacovigilanceOpen, setPharmacovigilanceOpen] = useState(false);

  const handleSaveArt = (data) => {
    console.log('Saving ART data:', data);
    // API call to save data
    setArtDialogOpen(false);
  };

  const handleSavePharmacovigilance = (data) => {
    console.log('Saving pharmacovigilance data:', data);
    // API call to save data
    setPharmacovigilanceOpen(false);
  };

  return (
    <div>
      <button onClick={() => setArtDialogOpen(true)}>
        Open ART Form
      </button>
      <button onClick={() => setPharmacovigilanceOpen(true)}>
        Open Pharmacovigilance Form
      </button>

      <ArtDialog
        open={artDialogOpen}
        onClose={() => setArtDialogOpen(false)}
        onSave={handleSaveArt}
      />

      <PharmacovigilanceDialog
        open={pharmacovigilanceOpen}
        onClose={() => setPharmacovigilanceOpen(false)}
        onSave={handleSavePharmacovigilance}
      />
    </div>
  );
}
```

## Dependencies

These modules rely on the following dependencies:

- React and React DOM
- react-hook-form for form management
- zod for schema validation
- @hookform/resolvers/zod for connecting zod to react-hook-form
- shadcn/ui components (or equivalent UI components)
- date-fns for date manipulation
- lucide-react for icons

## Notes on UI Components

The modules use shadcn/ui components with the following naming convention:

- `@/components/ui/...` - Base UI components
- Component-specific interfaces and types are defined within each file

## Business Rules

The modules implement several important business rules:

1. **ART Module**
   - WHO Clinical Stage depends on CD4 count
   - BMI calculation based on weight and height
   - Medication regimens with specific options
   - Adherence level categorization

2. **Pharmacovigilance Module**
   - Symptom grading (1-4) with clinical alerts
   - Pregnancy and fetal outcome tracking
   - Conditional field visibility
   - Date validation for past events

## Additional Information

For more detailed information about these modules, refer to the documentation in the main project repository:

- docs/Project_Documentation.md
- docs/Pharmacovigilance_Module.md