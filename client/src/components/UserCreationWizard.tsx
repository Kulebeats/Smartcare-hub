import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonalInfoStep } from "./wizard-steps/PersonalInfoStep";
import { ContactInfoStep } from "./wizard-steps/ContactInfoStep";
import { ProfessionalInfoStep } from "./wizard-steps/ProfessionalInfoStep";
import { LoginInfoStep } from "./wizard-steps/LoginInfoStep";
import { RdbInfoStep } from "./wizard-steps/RdbInfoStep";
import AgreementStep from "./wizard-steps/AgreementStep";
import { 
  PersonalInfo, 
  ProfessionalInfo, 
  LoginInfo, 
  RdbInfo,
  AgreementInfo,
  CompleteUserCreation 
} from "@shared/schema";

interface UserCreationWizardProps {
  onComplete: (userData: CompleteUserCreation) => void;
  onCancel: () => void;
}

export function UserCreationWizard({ onComplete, onCancel }: UserCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Form data for each step
  const [personalInfo, setPersonalInfo] = useState<Partial<PersonalInfo>>({});
  const [professionalInfo, setProfessionalInfo] = useState<Partial<ProfessionalInfo>>({});
  const [loginInfo, setLoginInfo] = useState<Partial<LoginInfo>>({});
  const [rdbInfo, setRdbInfo] = useState<Partial<RdbInfo>>({});
  const [agreementInfo, setAgreementInfo] = useState<Partial<AgreementInfo>>({});

  const steps = [
    { id: 1, title: "Personal Information", component: PersonalInfoStep },
    { id: 2, title: "Professional Information", component: ProfessionalInfoStep },
    { id: 3, title: "Login Info", component: LoginInfoStep },
    { id: 4, title: "RDB", component: RdbInfoStep },
    { id: 5, title: "Agreement", component: AgreementStep },
  ];

  const handleStepComplete = useCallback((stepId: number, data: any) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));

    switch (stepId) {
      case 1:
        setPersonalInfo(data);
        break;
      case 2:
        setProfessionalInfo(data);
        break;
      case 3:
        setLoginInfo(data);
        break;
      case 4:
        setRdbInfo(data);
        break;
      case 5:
        setAgreementInfo(data);
        break;
    }

    if (stepId < 5) {
      setCurrentStep(stepId + 1);
    } else {
      // Final step completion - combine all data
      const completeUserData: CompleteUserCreation = {
        ...personalInfo,
        ...professionalInfo,
        ...loginInfo,
        ...rdbInfo,
        ...data, // Agreement info from the final step
      } as CompleteUserCreation;

      onComplete(completeUserData);
    }
  }, [personalInfo, professionalInfo, loginInfo, rdbInfo, onComplete]);

  const handleStepBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleStepNavigate = useCallback((stepId: number) => {
    // Only allow navigation to completed steps or the next immediate step
    if (completedSteps.has(stepId) || stepId === Math.max(...Array.from(completedSteps)) + 1) {
      setCurrentStep(stepId);
    }
  }, [completedSteps]);

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1: return personalInfo;
      case 2: return professionalInfo;
      case 3: return loginInfo;
      case 4: return rdbInfo;
      case 5: return agreementInfo;
      default: return {};
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = ((completedSteps.size) / steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-blue-800">User Profile Registration</h1>
        <p className="text-gray-600">Fields marked by * are mandatory</p>
        <Progress value={progress} className="w-full max-w-2xl mx-auto h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepNavigate(step.id)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2",
                currentStep === step.id
                  ? "bg-blue-600 text-white shadow-md"
                  : completedSteps.has(step.id)
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-white text-gray-500 cursor-not-allowed",
                (completedSteps.has(step.id) || step.id === Math.max(...Array.from(completedSteps), 0) + 1) && 
                currentStep !== step.id ? "hover:bg-gray-200 cursor-pointer" : ""
              )}
              disabled={!completedSteps.has(step.id) && step.id !== Math.max(...Array.from(completedSteps), 0) + 1}
            >
              {completedSteps.has(step.id) && (
                <Check size={16} className="text-green-600" />
              )}
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl text-blue-800">
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <CurrentStepComponent
            data={getCurrentStepData()}
            onComplete={(data) => handleStepComplete(currentStep, data)}
            onBack={currentStep > 1 ? handleStepBack : undefined}
            isLastStep={currentStep === 6}
          />
        </CardContent>
      </Card>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel Registration
        </Button>
      </div>
    </div>
  );
}