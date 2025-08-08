
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

// Match the entry options with the format shown in the screenshot (exact wording and structure from the example)
const ENTRY_OPTIONS = [
  {
    id: "routine",
    title: "Routine Follow Up Visit",
    description: "A link to initiate pharmacovigilance check if six months have passed since last active check"
  },
  {
    id: "adverse-reaction-onset",
    title: "Adverse Reaction Onset",
    description: "An observed adverse reaction",
    hasSubOptions: true,
    subOptions: [
      {
        id: "adverse-reaction-onset-initial",
        title: "Initial Visit",
        description: "First documentation of an adverse drug reaction"
      },
      {
        id: "adverse-reaction-onset-followup",
        title: "Follow Up Visit",
        description: "Follow up visit from an initial adverse drug reaction onset"
      }
    ]
  },
  {
    id: "art-regimen",
    title: "Change of ART Regimen",
    description: "If there is a change of ART, there should be active monitoring for minimum 3 post-change visits"
  },
  {
    id: "art-naive",
    title: "ART Naive",
    description: "Someone who's newly initiated should have three minimum visits monitored"
  }
];

interface PharmacovigilanceEntryModalProps {
  open: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
}

export function PharmacovigilanceEntryModal({
  open,
  onClose,
  onOptionSelect
}: PharmacovigilanceEntryModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedSubOption, setSelectedSubOption] = useState<string>("");

  const handleOptionSelect = (optionId: string, subOptionId?: string) => {
    // Find the main option
    const option = ENTRY_OPTIONS.find(o => o.id === optionId);
    
    if (!option) return;
    
    // If there's a sub-option selected
    if (subOptionId && option.hasSubOptions && option.subOptions) {
      const subOption = option.subOptions.find(s => s.id === subOptionId);
      if (subOption) {
        // Combine the title of main option and sub-option
        onOptionSelect(`${option.title} - ${subOption.title}`);
        onClose();
      }
    } else {
      // For options without sub-options
      onOptionSelect(option.title);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedOption("");
    setSelectedSubOption("");
    onClose();
  };

  // Find currently selected option object
  const selectedOptionObj = ENTRY_OPTIONS.find(o => o.id === selectedOption);
  const hasSubOptions = selectedOptionObj?.hasSubOptions;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedOption("");
        setSelectedSubOption("");
        onClose();
      }
    }}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-semibold text-center">
            Adverse Drug Reaction Form
          </DialogTitle>
          <p className="text-xs text-gray-500 text-center">
            Complete the adverse drug reaction assessment form with patient medication details
          </p>
        </DialogHeader>

        <div className="pt-4">
          <h3 className="text-base font-semibold mb-4 px-1">Reason for Pharmacovigilance Assessment</h3>
          
          <div className="space-y-4">
            {ENTRY_OPTIONS.map((option) => (
              <div key={option.id}>
                <label className="block">
                  <div className="flex items-start p-3 border rounded mb-2 cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="pharmacovigilanceOption" 
                      value={option.id} 
                      className="mt-1 mr-3"
                      checked={selectedOption === option.id}
                      onChange={() => {
                        setSelectedOption(option.id);
                        setSelectedSubOption(""); // Reset sub-option when main option changes
                      }}
                    />
                    <div>
                      <div className="font-medium">{option.title}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </div>
                </label>
                
                {/* Show sub-options only when parent is selected */}
                {selectedOption === option.id && option.hasSubOptions && option.subOptions && (
                  <div className="ml-8 mt-1 space-y-2 border-l-2 border-blue-300 pl-4">
                    {option.subOptions.map(subOption => (
                      <label key={subOption.id} className="block">
                        <div className="flex items-start p-2 border rounded mb-1 cursor-pointer hover:bg-gray-50">
                          <input 
                            type="radio" 
                            name="pharmacovigilanceSubOption" 
                            value={subOption.id} 
                            className="mt-1 mr-3"
                            checked={selectedSubOption === subOption.id}
                            onChange={() => setSelectedSubOption(subOption.id)}
                          />
                          <div>
                            <div className="font-medium">{subOption.title}</div>
                            <div className="text-sm text-gray-600">{subOption.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t pt-3 mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="default"
            onClick={() => {
              if (selectedOption && hasSubOptions) {
                if (selectedSubOption) {
                  handleOptionSelect(selectedOption, selectedSubOption);
                }
              } else if (selectedOption) {
                handleOptionSelect(selectedOption);
              }
            }}
            disabled={!selectedOption || (hasSubOptions && !selectedSubOption)}
            className="bg-blue-700 hover:bg-blue-800"
          >
            View Summary
          </Button>
          <Button 
            onClick={() => {
              if (selectedOption && hasSubOptions) {
                if (selectedSubOption) {
                  handleOptionSelect(selectedOption, selectedSubOption);
                }
              } else if (selectedOption) {
                handleOptionSelect(selectedOption);
              }
            }}
            disabled={!selectedOption || (hasSubOptions && !selectedSubOption)}
            className="bg-blue-700 hover:bg-blue-800"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
