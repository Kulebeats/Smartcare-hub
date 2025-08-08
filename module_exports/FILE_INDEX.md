# File Index - ART and Pharmacovigilance Modules

## Core Files

| Filename | Description |
|----------|-------------|
| README.md | Overview documentation of the modules |
| INTEGRATION_GUIDE.md | Detailed guide on integrating the modules into another project |
| QUICK_START.md | Condensed guide for quick implementation |
| FILE_INDEX.md | This file - provides descriptions of all included files |

## ART Module Files

| Filename | Description |
|----------|-------------|
| **art-page.tsx** | Main page component for the ART module. Contains patient information display, main layout, and navigation. Manages state for all dialog components. |
| **art-dialog.tsx** | Primary form dialog for ART visits. Implements a tabbed interface with comprehensive form validation. Contains the full ART visit form with multiple sections: Enrollment, Clinical Assessment, Laboratory Results, Treatment Plan, and Support Services. |
| **art-card.tsx** | Card component for displaying ART information summary in the medical records view. Shows key ART data points in a compact format. |
| **art-form.tsx** | Detailed form component for ART data entry. Contains field-specific validation, conditional logic, and business rules. Used within the ART dialog. |

## Pharmacovigilance Module Files

| Filename | Description |
|----------|-------------|
| **pharmacovigilance-dialog.tsx** | Main dialog component for adverse drug reaction monitoring. Contains a comprehensive form with validation schema and clinical alert system. Implements a tabbed interface for organizing different sections of pharmacovigilance data. |
| **pharmacovigilance-card.tsx** | Card component for displaying pharmacovigilance information in the medical records view. Provides a summary of key adverse reaction data and status. |
| **pharmacovigilance-entry-modal.tsx** | Entry point modal for initiating pharmacovigilance checks. Presents options for different types of follow-up (Routine, Adverse Reaction, etc.). |
| **clinical-summary-dialog.tsx** | Summary dialog showing clinical information. Used for reviewing pharmacovigilance data before submission or viewing an existing record. |

## Dependencies

These files depend on several UI components and utilities:

1. **UI Components**:
   - Button, Dialog, Form, Input, Select, etc. (from shadcn/ui or equivalent)
   - These are imported from `@/components/ui/...`

2. **Hooks**:
   - useForm (from react-hook-form)
   - useToast (custom hook for toast notifications)

3. **Validation**:
   - zod (for schema validation)
   - zodResolver (from @hookform/resolvers/zod)

4. **Utilities**:
   - date-fns (for date manipulation)
   - lucide-react (for icons)

## Implementation Notes

- Most components use TypeScript with strict typing
- Dialog components follow a consistent pattern with `open`, `onClose`, and `onSave` props
- Form components use zod schemas for validation
- Components implement advanced conditional validation and field visibility

## Key Data Structures

1. **ArtForm** - Type defined in art-dialog.tsx
2. **PharmacovigilanceForm** - Type defined in pharmacovigilance-dialog.tsx

These types detail the full data model for each module and are used throughout the components to ensure type safety.

## Integration Points

The main integration points are:

1. **Dialog Open/Close** - Control display via state variables
2. **Data Saving** - Implement the `onSave` callback to connect to your API
3. **Data Loading** - Pre-populate forms with existing data where applicable
4. **UI Component Substitution** - Replace UI components if not using shadcn/ui