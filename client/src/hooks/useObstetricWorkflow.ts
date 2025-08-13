import { useState, useEffect, useCallback } from 'react';

interface PregnancyState {
  gestationalAge: string;
  outcome: string;
  deliveryMode: string;
  infantSex: string;
  showOutcome: boolean;
  showDelivery: boolean;
  showInfantFields: boolean;
  showBabyStatus: boolean;
  showBorderlineCdss: boolean;
}

export const useObstetricWorkflow = (pregnancyIndex: number) => {
  const [pregnancyState, setPregnancyState] = useState<PregnancyState>({
    gestationalAge: '',
    outcome: '',
    deliveryMode: '',
    infantSex: '',
    showOutcome: false,
    showDelivery: false,
    showInfantFields: false,
    showBabyStatus: false,
    showBorderlineCdss: false,
  });

  // Step 1: Handle gestational age changes
  const handleGestationalAgeChange = useCallback((ageMonths: string) => {
    console.log('🤱 Gestational age changed:', ageMonths, 'for pregnancy', pregnancyIndex);
    
    const age = parseInt(ageMonths);
    const isViable = age >= 7;
    const isBorderline = age === 6;
    
    setPregnancyState(prev => ({
      ...prev,
      gestationalAge: ageMonths,
      showOutcome: age >= 6, // Show outcome for 6+ months
      showBorderlineCdss: isBorderline,
      // Reset dependent fields when gestational age changes
      outcome: '',
      deliveryMode: '',
      infantSex: '',
      showDelivery: false,
      showInfantFields: false,
      showBabyStatus: false,
    }));

    console.log(isViable ? '✅ Viable pregnancy (7+ months)' : 
                isBorderline ? '⚠️ Borderline pregnancy (6 months)' : 
                '❌ Non-viable pregnancy (<6 months)');
  }, [pregnancyIndex]);

  // Step 2: Handle pregnancy outcome changes
  const handleOutcomeChange = useCallback((outcome: string) => {
    console.log('🤱 Outcome selected:', outcome, 'for pregnancy', pregnancyIndex);
    
    const age = parseInt(pregnancyState.gestationalAge);
    const isViable = age >= 7;
    const showDeliveryFields = outcome === 'still_birth' || outcome === 'live_birth';
    const showInfantForLiveBirth = outcome === 'live_birth' && isViable;
    
    setPregnancyState(prev => ({
      ...prev,
      outcome,
      showDelivery: showDeliveryFields,
      showInfantFields: showInfantForLiveBirth,
      showBabyStatus: showInfantForLiveBirth, // Show immediately for live births in viable pregnancies
      // Reset dependent fields
      deliveryMode: '',
      infantSex: '',
    }));

    if (showInfantForLiveBirth) {
      console.log('✅ Baby status section shown permanently for viable live birth');
    }
  }, [pregnancyIndex, pregnancyState.gestationalAge]);

  // Step 3: Handle delivery mode changes
  const handleDeliveryModeChange = useCallback((deliveryMode: string) => {
    console.log('🚑 Delivery mode selected:', deliveryMode, 'for pregnancy', pregnancyIndex);
    
    setPregnancyState(prev => ({
      ...prev,
      deliveryMode,
    }));
  }, [pregnancyIndex]);

  // Step 4: Handle infant sex changes
  const handleInfantSexChange = useCallback((infantSex: string) => {
    console.log('👶 Infant sex selected:', infantSex, 'for pregnancy', pregnancyIndex);
    
    setPregnancyState(prev => ({
      ...prev,
      infantSex,
    }));
  }, [pregnancyIndex]);

  // Expose methods for legacy compatibility
  useEffect(() => {
    // Create global functions for this specific pregnancy index
    const globalKey = `pregnancy_${pregnancyIndex}`;
    
    (window as any)[`handleGestationalAge_${pregnancyIndex}`] = handleGestationalAgeChange;
    (window as any)[`handleOutcome_${pregnancyIndex}`] = handleOutcomeChange;
    (window as any)[`handleDeliveryMode_${pregnancyIndex}`] = handleDeliveryModeChange;
    (window as any)[`handleInfantSex_${pregnancyIndex}`] = handleInfantSexChange;

    console.log(`✅ Obstetric workflow hooks registered for pregnancy ${pregnancyIndex}`);

    // Cleanup
    return () => {
      delete (window as any)[`handleGestationalAge_${pregnancyIndex}`];
      delete (window as any)[`handleOutcome_${pregnancyIndex}`];
      delete (window as any)[`handleDeliveryMode_${pregnancyIndex}`];
      delete (window as any)[`handleInfantSex_${pregnancyIndex}`];
    };
  }, [pregnancyIndex, handleGestationalAgeChange, handleOutcomeChange, handleDeliveryModeChange, handleInfantSexChange]);

  return {
    pregnancyState,
    handlers: {
      handleGestationalAgeChange,
      handleOutcomeChange,
      handleDeliveryModeChange,
      handleInfantSexChange,
    },
  };
};