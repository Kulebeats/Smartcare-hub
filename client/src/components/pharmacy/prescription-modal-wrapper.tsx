import { Suspense, lazy } from 'react';
import PrescriptionModalSkeleton from './prescription-modal-skeleton';

// Lazy load the enhanced prescription modal component
const LazyPrescriptionModal = lazy(() => import('./pharmacy-prescription-enhanced'));

// Import intervention drug interface for pre-population
interface InterventionDrug {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  category: string;
  itemPerDose: string;
  timePerUnit: string;
  frequencyUnit: string;
  durationUnit: string;
  instructions?: string;
}

interface PrescriptionModalWrapperProps {
  isOpen: boolean;
  onSaveComplete?: () => void;
  onClose?: () => void;
  prePopulatedDrug?: InterventionDrug;
}

export default function PrescriptionModalWrapper({ 
  isOpen, 
  onSaveComplete, 
  onClose,
  prePopulatedDrug
}: PrescriptionModalWrapperProps) {
  if (!isOpen) return null;

  return (
    <Suspense fallback={<PrescriptionModalSkeleton />}>
      <LazyPrescriptionModal 
        onSaveComplete={onSaveComplete} 
        onClose={onClose} 
        prePopulatedDrug={prePopulatedDrug}
      />
    </Suspense>
  );
}