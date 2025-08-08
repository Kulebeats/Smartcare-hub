# ART and Pharmacovigilance Modules - Quick Start Guide

This quick start guide provides a condensed version of the integration steps to get you up and running with the ART and Pharmacovigilance modules quickly.

## 1. Prerequisites

Make sure your React project has these dependencies:

```bash
npm install react react-dom react-hook-form zod @hookform/resolvers date-fns lucide-react
```

If using shadcn/ui components (recommended):

```bash
npx shadcn-ui@latest init
```

## 2. File Setup

Extract the ZIP file contents into your project, maintaining the directory structure:

```
/components/medical-record/
  - art-card.tsx
  - art-dialog.tsx
  - pharmacovigilance-card.tsx
  - pharmacovigilance-dialog.tsx
  - pharmacovigilance-entry-modal.tsx
  - clinical-summary-dialog.tsx
/components/patient/
  - art-form.tsx
/pages/
  - art-page.tsx
```

## 3. Basic Implementation

### To implement the ART module:

```tsx
// In your route file or App.tsx
import ArtPage from './pages/art-page';

// Add to your router
<Route path="/art" component={ArtPage} />
```

### To implement just the forms/dialogs:

```tsx
import { useState } from 'react';
import { ArtDialog } from './components/medical-record/art-dialog';
import { PharmacovigilanceDialog } from './components/medical-record/pharmacovigilance-dialog';

function MedicalRecord() {
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
      <button onClick={() => setArtDialogOpen(true)}>Add ART Visit</button>
      <button onClick={() => setPharmacovigilanceOpen(true)}>Add Pharmacovigilance Check</button>

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

## 4. Common Requirements

These modules require:

1. **UI Component Library**: shadcn/ui or equivalent with similar component names
2. **Toast Notifications**: A toast hook with `toast({ title, description, variant })` API
3. **Form Components**: Components for form fields, labels, and validation
4. **API Integration**: Implementation of save/load functionality

## 5. Key Features

### ART Module

- **Enrollment**: Track patient ART enrollment
- **Clinical Assessment**: Record WHO stage, functional status, vitals
- **Lab Results**: CD4 count, viral load, TB status
- **Treatment Plan**: ART regimens, adherence, next appointment
- **Support Services**: Nutritional, psychosocial support options

### Pharmacovigilance Module

- **ADR Tracking**: Adverse drug reaction monitoring
- **Symptom Grading**: 1-4 severity scale with clinical alerts
- **System Review**: Categorized symptoms by body system
- **Outcomes Tracking**: Clinical outcomes and follow-up actions

## 6. Troubleshooting

- **Import Issues**: Check path aliases and directory structure
- **Component Errors**: Ensure UI components match expected props/interfaces
- **Form Errors**: Verify zod schemas and form hook implementation

## 7. Next Steps

After basic implementation:

1. **Connect to APIs**: Implement data saving/loading
2. **Customize**: Adapt forms to your requirements
3. **Testing**: Verify form validation and business rules
4. **Integration**: Connect with other system components

For more details, see the full Integration Guide.

---

**Note**: This module preserves the exact functionality of the SmartCare PRO system. If needed, adapt the fields, validation, and business rules to match your specific requirements.

## Quick Demo

Here's a minimalist example to get started:

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { ArtDialog } from './components/medical-record/art-dialog';
import { useState } from 'react';

function App() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ART Module Demo</h1>
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded" 
        onClick={() => setOpen(true)}
      >
        Open ART Form
      </button>
      
      <ArtDialog 
        open={open}
        onClose={() => setOpen(false)}
        onSave={(data) => {
          console.log(data);
          setOpen(false);
        }}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```