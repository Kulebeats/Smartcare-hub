# ART and Pharmacovigilance Modules Integration Guide

This guide provides step-by-step instructions for integrating the ART and Pharmacovigilance modules into another React TypeScript project.

## Prerequisites

Before you begin, ensure your project has the following dependencies installed:

```bash
# Required packages for both modules
npm install react react-dom react-hook-form zod @hookform/resolvers date-fns lucide-react 

# UI components (if using shadcn/ui or equivalent)
npm install class-variance-authority clsx tailwind-merge
```

## Integration Steps

### Step 1: File Structure Setup

Create the following directory structure in your project:

```
/src
  /components
    /medical-record
      /art-card.tsx
      /art-dialog.tsx
      /pharmacovigilance-card.tsx
      /pharmacovigilance-dialog.tsx
      /pharmacovigilance-entry-modal.tsx
      /clinical-summary-dialog.tsx
    /patient
      /art-form.tsx
  /pages
    /art-page.tsx
```

### Step 2: Copy Module Files

1. Extract `art_pharmacovigilance_modules.zip`
2. Copy all files to their respective locations in your project structure

### Step 3: Resolve Dependencies

Both modules rely on shadcn/ui components. If your project uses a different UI component library, you'll need to replace these imports:

```typescript
// Original imports
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
// ... etc.

// Replace with your equivalent components
import { Button } from "your-ui-library";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "your-ui-library";
import { Form } from "your-ui-library";
// ... etc.
```

### Step 4: Set Up Required Hooks

The modules use several custom hooks. Create these if they don't exist in your project:

1. **useToast Hook**:
```typescript
// src/hooks/use-toast.ts
export function useToast() {
  // Implementation depends on your toast library
  // At minimum should provide { toast } with methods like toast({ title, description, variant })
  return {
    toast: ({ title, description, variant }) => {
      console.log({ title, description, variant });
      // Your toast implementation
    }
  };
}
```

2. **Form Components**:
If you're not using shadcn/ui's form components, you'll need to provide equivalents for:
- Form, FormField, FormItem, FormLabel, FormDescription
- Input, Select, RadioGroup, Checkbox, etc.

### Step 5: Adjust Import Paths

Go through each file and update the import paths to match your project structure:

```typescript
// Original
import { Button } from "@/components/ui/button";

// Updated (adjust based on your actual project structure)
import { Button } from "../../components/ui/button";
// Or
import { Button } from "@components/ui/button"; // if you have path aliases
```

### Step 6: Implement API Integration

The modules include function calls for saving data but don't implement the actual API calls. Add the necessary API integration:

```typescript
// In art-page.tsx
const handleSaveArtVisit = async (data: ArtForm) => {
  try {
    // Implement your API call
    const response = await fetch('/api/art-visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save ART visit');
    }
    
    // Handle success
    setArtDialogOpen(false);
  } catch (error) {
    console.error('Error saving ART visit:', error);
    // Show error message
  }
};
```

Do the same for pharmacovigilance data saving.

### Step 7: Add to Navigation/Routing

Add the ART page to your routing system:

```typescript
// If using React Router
import { Routes, Route } from 'react-router-dom';
import ArtPage from './pages/art-page';

function App() {
  return (
    <Routes>
      <Route path="/art" element={<ArtPage />} />
      {/* Other routes */}
    </Routes>
  );
}

// If using wouter
import { Switch, Route } from 'wouter';
import ArtPage from './pages/art-page';

function App() {
  return (
    <Switch>
      <Route path="/art" component={ArtPage} />
      {/* Other routes */}
    </Switch>
  );
}
```

### Step 8: Test the Integration

1. Navigate to the ART page
2. Test opening and closing dialogs
3. Try filling and submitting forms
4. Verify data is being properly captured

## Common Issues and Solutions

### Missing UI Components

**Issue**: Errors about missing UI components from shadcn/ui.

**Solution**: Either install shadcn/ui components or replace with equivalents from your UI library.

### Import Path Errors

**Issue**: "Cannot find module" errors related to import paths.

**Solution**: Adjust import paths to match your project structure. If using TypeScript path aliases, make sure your `tsconfig.json` is properly configured.

### Type Errors

**Issue**: TypeScript errors related to missing types or incompatible types.

**Solution**: Check that you have all the necessary type definitions and adjust as needed. The modules use several custom types which may need to be exported/imported correctly.

### Form Validation Errors

**Issue**: Form validation not working correctly.

**Solution**: Ensure zod and @hookform/resolvers are properly installed and check that your form components correctly implement the form validation pattern.

## Customizing the Modules

### Changing Form Fields

To add, remove, or modify form fields:

1. Update the schema in the corresponding file (artFormSchema or pharmacovigilanceSchema)
2. Update the form component to reflect the changes
3. Update any default values in the useForm hook

### Adjusting Styling

The modules use Tailwind CSS classes for styling. To change the styling:

1. Adjust the Tailwind classes directly in the components
2. Or replace with your own CSS/styling approach

### Modifying Business Logic

The business logic is primarily contained in:

1. The validation schemas (field requirements, conditional validation)
2. Event handlers in the form components
3. Conditional rendering logic in the components

Locate the relevant section in the code and modify as needed.

## Advanced Integration

### Connecting to an Existing Patient System

If you have an existing patient management system:

1. Modify the patient data model in the modules to match your system
2. Update the API integration to use your patient APIs
3. Adjust any UI components that display patient information

### Adding Authentication

The modules don't include authentication. To add authentication:

1. Wrap the API calls with authentication headers
2. Add protected route logic to control access to the ART page
3. Implement appropriate error handling for authentication failures

### Data Synchronization

For offline-first capabilities:

1. Implement local storage or IndexedDB caching
2. Add synchronization logic to handle offline/online transitions
3. Update the save functions to work with your sync strategy