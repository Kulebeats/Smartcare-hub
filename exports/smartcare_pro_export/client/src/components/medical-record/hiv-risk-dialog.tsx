
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface HivRiskScreeningDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
}

export function HivRiskScreeningDialog({
  open,
  onClose,
  onSave,
}: HivRiskScreeningDialogProps) {
  // State to hold all form answers with strong typing
  const [formData, setFormData] = useState<Record<string, string | null>>({
    // Section 1: Sexual activity
    sexuallyActiveLast6Months: null,
    intercourseWithoutCondom: null,
    consistentCondomUse: null,
    hadSTI: null,
    usedPEP: null,
    
    // Section 2: Injection equipment
    sharedInjectionEquipment: null,
    
    // Section 3: HIV+ partners
    hadSexPartnerHIV: null,
    partnerHIVStatus: null,
    partnerViralLoad: null,
    partnerOnART: null,
    
    // Additional risk factors
    partnerInjectsDrugs: null,
    partnerIsSexWorker: null,
    partnerIsMSM: null, 
    partnerIsTransgender: null,
    partnerHasMultiplePartners: null,
  });

  // State for risk level
  const [riskLevel, setRiskLevel] = useState<string>("Unknown");
  // Track whether validation should be shown
  const [showValidation, setShowValidation] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData(Object.fromEntries(Object.keys(formData).map(key => [key, null])));
      setRiskLevel("Unknown");
      setShowValidation(false);
    }
  }, [open]);

  // Handler for radio button changes
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle special cases for immediate follow-up logic
    if (name === "sexuallyActiveLast6Months" && value === "no") {
      // If not sexually active, clear any sexual behavior and partner assessment data
      const updatedData = {...formData, [name]: value};
      const keysToReset = [
        "consistentCondomUse", "intercourseWithoutCondom", "partnerHasMultiplePartners",
        "hadSexPartnerHIV", "partnerHIVStatus", "partnerOnART", "partnerViralLoad",
        "partnerInjectsDrugs", "partnerIsSexWorker", "partnerIsMSM", "partnerIsTransgender"
      ];
      
      keysToReset.forEach(key => {
        updatedData[key] = null;
      });
      
      setFormData(updatedData);
    }
    
    if (name === "hadSexPartnerHIV" && value === "no") {
      // If no HIV+ partners, clear HIV partner details
      const updatedData = {...formData, [name]: value};
      const keysToReset = ["partnerHIVStatus", "partnerOnART", "partnerViralLoad"];
      
      keysToReset.forEach(key => {
        updatedData[key] = null;
      });
      
      setFormData(updatedData);
    }
  };

  // Calculate risk level based on answers
  useEffect(() => {
    let highRiskFactors = 0;
    let mediumRiskFactors = 0;
    
    // Count high risk factors
    if (formData.intercourseWithoutCondom === "yes") highRiskFactors++;
    if (formData.consistentCondomUse === "no" && formData.sexuallyActiveLast6Months === "yes") highRiskFactors++;
    if (formData.hadSTI === "yes") highRiskFactors++;
    if (formData.hadSexPartnerHIV === "yes" && formData.partnerOnART === "no") highRiskFactors++;
    if (formData.partnerViralLoad === "detectable" || formData.partnerViralLoad === "unknown") highRiskFactors++;
    
    // Count medium risk factors
    if (formData.usedPEP === "yes") mediumRiskFactors++;
    if (formData.sharedInjectionEquipment === "yes") mediumRiskFactors++;
    if (formData.partnerInjectsDrugs === "yes") mediumRiskFactors++;
    if (formData.partnerIsSexWorker === "yes") mediumRiskFactors++;
    if (formData.partnerIsMSM === "yes") mediumRiskFactors++;
    if (formData.partnerIsTransgender === "yes") mediumRiskFactors++;
    if (formData.partnerHasMultiplePartners === "yes") mediumRiskFactors++;
    
    // Determine overall risk level
    if (highRiskFactors >= 2 || (highRiskFactors >= 1 && mediumRiskFactors >= 2)) {
      setRiskLevel("High Risk");
    } else if (highRiskFactors === 1 || mediumRiskFactors >= 2) {
      setRiskLevel("Medium Risk");
    } else if (mediumRiskFactors === 1 || formData.sexuallyActiveLast6Months === "yes") {
      setRiskLevel("Low Risk");
    } else if (formData.sexuallyActiveLast6Months === "no") {
      setRiskLevel("Very Low Risk");
    } else {
      setRiskLevel("Unknown");
    }
  }, [formData]);

  // Check if form is valid for submission
  const isFormValid = () => {
    // Basic validation for required fields
    if (formData.sexuallyActiveLast6Months === null || 
        formData.sharedInjectionEquipment === null ||
        formData.hadSTI === null ||
        formData.usedPEP === null) {
      return false;
    }
    
    // Conditionally required fields for sexually active patients
    if (formData.sexuallyActiveLast6Months === "yes") {
      if (formData.consistentCondomUse === null || 
          formData.intercourseWithoutCondom === null ||
          formData.hadSexPartnerHIV === null) {
        return false;
      }
      
      // If they have an HIV+ partner, additional fields are required
      if (formData.hadSexPartnerHIV === "yes") {
        if (formData.partnerHIVStatus === null ||
            formData.partnerOnART === null ||
            formData.partnerViralLoad === null) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    setShowValidation(true);
    
    if (!isFormValid()) {
      return;
    }
    
    // Convert null values to empty strings for consistency with the existing system
    const dataToSave = {
      ...Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value || ""])
      ),
      riskLevel
    };
    
    onSave(dataToSave);
    onClose();
  };

  // Helper function to render a radio group
  const renderRadioGroup = (
    name: string, 
    label: string, 
    options: Array<{value: string, label: string}> = [
      {value: "yes", label: "Yes"},
      {value: "no", label: "No"}
    ],
    required: boolean = true
  ) => {
    const currentValue = formData[name];
    const hasError = showValidation && required && currentValue === null;
    
    return (
      <div className={`p-3 ${hasError ? "bg-red-50 border border-red-300" : "bg-gray-50"} rounded-md mb-3`}>
        <div className="flex flex-col">
          <p className="text-sm mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <div className="flex space-x-4 mt-2">
            {options.map(option => (
              <label 
                key={option.value}
                className={`flex items-center space-x-2 cursor-pointer rounded px-3 py-1 ${
                  currentValue === option.value ? "bg-blue-100 text-blue-800" : ""
                }`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={currentValue === option.value}
                  onChange={() => handleChange(name, option.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {hasError && (
            <p className="text-xs text-red-500 mt-1">This question requires an answer</p>
          )}
        </div>
      </div>
    );
  };

  // Determine which sections to show based on answers
  const showSexualActivityDetails = formData.sexuallyActiveLast6Months === "yes";
  const showHIVPartnerDetails = formData.hadSexPartnerHIV === "yes";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[80vh] overflow-y-auto" aria-describedby="hiv-risk-description">
        <DialogHeader>
          <DialogTitle>HIV Risk Screening</DialogTitle>
          <DialogDescription id="hiv-risk-description">
            Complete the screening to assess HIV risk factors.
          </DialogDescription>
        </DialogHeader>
        
        {/* Risk Level Indicator */}
        <div className="mt-2 flex items-center space-x-2">
          <div className={`flex-1 p-2 rounded-md text-white font-medium text-center ${
            riskLevel === "High Risk" ? "bg-red-500" : 
            riskLevel === "Medium Risk" ? "bg-orange-500" : 
            riskLevel === "Low Risk" ? "bg-yellow-500" : 
            riskLevel === "Very Low Risk" ? "bg-green-500" : "bg-gray-500"
          }`}>
            Current Assessment: {riskLevel}
          </div>
        </div>
        
        <div className="mt-4 space-y-4 overflow-y-auto">
          {/* Section 1: Patient History */}
          <fieldset className="border border-gray-200 rounded-md p-3">
            <legend className="text-sm font-medium px-2">Patient History Assessment</legend>
            
            {renderRadioGroup(
              "sexuallyActiveLast6Months",
              "In the last 6 months have you been sexually active?"
            )}
            
            {renderRadioGroup(
              "sharedInjectionEquipment",
              "In the last 6 months have you shared injection material/equipment with other people?"
            )}
            
            {renderRadioGroup(
              "hadSTI",
              "Had an STI based on self report/lab test/syndromic STI treatment in the last 6 months?"
            )}
            
            {renderRadioGroup(
              "usedPEP",
              "In the last 6 months have you used PEP following potential exposure to HIV?"
            )}
          </fieldset>
          
          {/* Section 2: Sexual Behavior - Only show if sexually active */}
          {showSexualActivityDetails && (
            <fieldset className="border border-gray-200 rounded-md p-3">
              <legend className="text-sm font-medium px-2">Sexual Risk Behavior</legend>
              
              {renderRadioGroup(
                "consistentCondomUse",
                "In the last 6 months have you used condoms consistently during sex?"
              )}
              
              {renderRadioGroup(
                "intercourseWithoutCondom",
                "In the last 6 months have you had vaginal or anal sex without condom with more than 1 person?"
              )}
              
              {renderRadioGroup(
                "partnerHasMultiplePartners",
                "In the last 6 months have you had a sex partner who has sex with multiple partners without condoms?"
              )}
            </fieldset>
          )}
          
          {/* Section 3: Partner Assessment - Only show if sexually active */}
          {showSexualActivityDetails && (
            <fieldset className="border border-gray-200 rounded-md p-3">
              <legend className="text-sm font-medium px-2">Partner Risk Assessment</legend>
              
              {renderRadioGroup(
                "hadSexPartnerHIV",
                "In the last 6 months have you had a sex partner who is living with HIV?"
              )}
              
              {/* Only show HIV partner details if had HIV+ partner */}
              {showHIVPartnerDetails && (
                <>
                  {renderRadioGroup(
                    "partnerHIVStatus",
                    "Is your partner HIV infected?"
                  )}
                  
                  {renderRadioGroup(
                    "partnerOnART",
                    "Is she/he on ART?"
                  )}
                  
                  {renderRadioGroup(
                    "partnerViralLoad",
                    "If infected what was their last viral load result?",
                    [
                      {value: "undetectable", label: "Undetectable"},
                      {value: "detectable", label: "Detectable"},
                      {value: "unknown", label: "Unknown"}
                    ]
                  )}
                </>
              )}
              
              {renderRadioGroup(
                "partnerInjectsDrugs",
                "In the last 6 months have you had a sex partner who injects drugs?",
                undefined,
                showSexualActivityDetails
              )}
              
              {renderRadioGroup(
                "partnerIsSexWorker",
                "In the last 6 months have you had a sex partner who is a sex worker?",
                undefined,
                showSexualActivityDetails
              )}
              
              {renderRadioGroup(
                "partnerIsMSM",
                "In the last 6 months have you had a sex partner who is a man who has sex with men?",
                undefined,
                showSexualActivityDetails
              )}
              
              {renderRadioGroup(
                "partnerIsTransgender",
                "In the last 6 months have you had a sex partner who is transgender?",
                undefined,
                showSexualActivityDetails
              )}
            </fieldset>
          )}
          
          {/* Risk Assessment Summary */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-lg mb-3">Risk Assessment Summary</h3>
            <div className={`p-3 rounded-md text-white font-medium ${
              riskLevel === "High Risk" ? "bg-red-500" : 
              riskLevel === "Medium Risk" ? "bg-orange-500" : 
              riskLevel === "Low Risk" ? "bg-yellow-500" : 
              riskLevel === "Very Low Risk" ? "bg-green-500" : "bg-gray-500"
            }`}>
              Current Assessment: {riskLevel}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-700">
                Based on your responses, we provide the following assessment. Click "Save" to record this assessment and view detailed recommendations.
              </p>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button 
              type="button" 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white w-2/3"
            >
              Save
            </Button>
          </div>
          
          {showValidation && !isFormValid() && (
            <div className="mt-2 text-sm text-red-500 font-medium text-center">
              Please complete all required fields marked with *
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
