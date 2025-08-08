import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PharmacovigilanceEntryModal } from "./pharmacovigilance-entry-modal";
import { useToast } from "@/hooks/use-toast";

export function PharmacovigilanceCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const handleEntrySelect = (option: string) => {
    let message = "";
    
    // Handle all options with initial and follow-up adverse reaction onset
    switch(option) {
      case "Routine Follow Up Visit":
        message = "Opening pharmacovigilance check link - six months since last active check";
        break;
      case "Adverse Reaction Onset - Initial Visit":
        message = "Recording an initial adverse reaction visit";
        break;
      case "Adverse Reaction Onset - Follow Up Visit":
        message = "Recording follow-up visit from initial adverse drug reaction onset";
        break;
      case "Change of ART Regimen":
        message = "Starting monitoring for minimum 3 post-change visits";
        break;
      case "ART Naive":
        message = "Setting up monitoring for minimum three visits";
        break;
    }

    toast({
      title: option,
      description: message,
      duration: 4000
    });
    
    // Notification only - the actual dialog is opened by the parent component
  };

  return (
    <>
      <Card 
        className="w-full cursor-pointer hover:bg-blue-50 transition-colors" 
        onClick={() => setModalOpen(true)}
      >
        <CardHeader className="pb-3">
          <CardTitle>Pharmacovigilance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Click to access monitoring options
          </p>
        </CardContent>
      </Card>

      <PharmacovigilanceEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onOptionSelect={handleEntrySelect}
      />
    </>
  );
}