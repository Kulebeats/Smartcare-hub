
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FollowUpNavigationProps {
  currentStep: number;
  totalSteps: number;
  followUpQuestions: boolean[];
  onNext: () => void;
  onSave: () => void;
  isValid: boolean;
  isLastStep: boolean;
}

export function FollowUpNavigation({
  currentStep,
  totalSteps,
  followUpQuestions,
  onNext,
  onSave,
  isValid,
  isLastStep,
}: FollowUpNavigationProps) {
  const [isMandatoryFollowUp, setIsMandatoryFollowUp] = useState(false);

  useEffect(() => {
    // Check if current step is a follow-up question
    setIsMandatoryFollowUp(followUpQuestions[currentStep]);
  }, [currentStep, followUpQuestions]);

  return (
    <div className="w-full flex justify-between items-center mt-6">
      <div className="text-sm text-gray-500">
        {isMandatoryFollowUp && (
          <span className="text-red-500 font-medium">* This follow-up is required</span>
        )}
      </div>
      <div className="flex gap-2">
        {!isLastStep ? (
          <Button 
            onClick={onNext}
            disabled={isMandatoryFollowUp && !isValid}
            className="flex items-center gap-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onSave}
            disabled={!isValid}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-32"
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
