import React, { useEffect } from 'react';
import { useObstetricWorkflow } from '../../hooks/useObstetricWorkflow';

interface PregnancyHistoryFormProps {
  pregnancyIndex: number;
  onStateChange?: (index: number, state: any) => void;
}

export const PregnancyHistoryForm: React.FC<PregnancyHistoryFormProps> = ({ 
  pregnancyIndex, 
  onStateChange 
}) => {
  const { pregnancyState, handlers } = useObstetricWorkflow(pregnancyIndex);

  // Notify parent component of state changes
  useEffect(() => {
    onStateChange?.(pregnancyIndex, pregnancyState);
  }, [pregnancyState, pregnancyIndex, onStateChange]);

  // Setup DOM manipulation for existing HTML forms (legacy compatibility)
  useEffect(() => {
    const setupDOMUpdates = () => {
      const gestationalField = document.getElementById(`gestational-months-${pregnancyIndex}`);
      const outcomeField = document.getElementById(`outcome-${pregnancyIndex}`);
      const deliverySection = document.getElementById(`delivery-mode-section-${pregnancyIndex}`);
      const infantSexSection = document.getElementById(`infant-sex-section-${pregnancyIndex}`);
      const birthWeightSection = document.getElementById(`birth-weight-section-${pregnancyIndex}`);
      const babyStatusSection = document.getElementById(`baby-status-section-${pregnancyIndex}`);
      const borderlineCdss = document.getElementById(`borderline-cdss-${pregnancyIndex}`);
      const weeksSection = document.getElementById(`weeks-section-${pregnancyIndex}`);
      const outcomeSection = document.getElementById(`outcome-section-${pregnancyIndex}`);

      // Update visibility based on state
      if (outcomeSection) {
        outcomeSection.style.display = pregnancyState.showOutcome ? 'block' : 'none';
      }
      
      if (weeksSection) {
        weeksSection.style.display = pregnancyState.showOutcome ? 'block' : 'none';
      }
      
      if (borderlineCdss) {
        borderlineCdss.style.display = pregnancyState.showBorderlineCdss ? 'block' : 'none';
      }
      
      if (deliverySection) {
        deliverySection.style.display = pregnancyState.showDelivery ? 'block' : 'none';
      }
      
      if (infantSexSection) {
        infantSexSection.style.display = pregnancyState.showInfantFields ? 'block' : 'none';
      }
      
      if (birthWeightSection) {
        birthWeightSection.style.display = pregnancyState.showInfantFields ? 'block' : 'none';
      }
      
      if (babyStatusSection) {
        babyStatusSection.style.display = pregnancyState.showBabyStatus ? 'block' : 'none';
        if (pregnancyState.showBabyStatus) {
          console.log('✅ Baby status field now visible for pregnancy', pregnancyIndex);
        }
      }

      // Setup event listeners for existing form elements
      if (gestationalField && !gestationalField.dataset.listenerAttached) {
        gestationalField.addEventListener('change', (e) => {
          const target = e.target as HTMLSelectElement;
          handlers.handleGestationalAgeChange(target.value);
        });
        gestationalField.dataset.listenerAttached = 'true';
      }

      if (outcomeField && !outcomeField.dataset.listenerAttached) {
        outcomeField.addEventListener('change', (e) => {
          const target = e.target as HTMLSelectElement;
          handlers.handleOutcomeChange(target.value);
        });
        outcomeField.dataset.listenerAttached = 'true';
      }
    };

    // Try to setup DOM updates immediately and retry if elements not found
    setupDOMUpdates();
    const retryInterval = setInterval(() => {
      const gestationalField = document.getElementById(`gestational-months-${pregnancyIndex}`);
      if (gestationalField) {
        setupDOMUpdates();
        clearInterval(retryInterval);
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(retryInterval);
    };
  }, [pregnancyIndex, pregnancyState, handlers]);

  // This component doesn't render anything visible - it just manages state
  return null;
};

// Export a hook for multiple pregnancies
export const useMultiplePregnancyForms = (numberOfPregnancies: number) => {
  const pregnancyStates = React.useRef<Record<number, any>>({});
  
  const handlePregnancyStateChange = React.useCallback((index: number, state: any) => {
    pregnancyStates.current[index] = state;
  }, []);

  const renderPregnancyForms = React.useCallback(() => {
    return Array.from({ length: numberOfPregnancies }, (_, i) => (
      <PregnancyHistoryForm
        key={i}
        pregnancyIndex={i}
        onStateChange={handlePregnancyStateChange}
      />
    ));
  }, [numberOfPregnancies, handlePregnancyStateChange]);

  return {
    pregnancyStates: pregnancyStates.current,
    renderPregnancyForms,
  };
};