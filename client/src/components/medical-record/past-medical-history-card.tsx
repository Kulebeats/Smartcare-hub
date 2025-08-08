
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PastMedicalHistoryDialog } from "./past-medical-history-dialog";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function PastMedicalHistoryCard() {
  const [modalOpen, setModalOpen] = useState(false);
  
  // Example data - in a real app this would come from your API/state
  const latestHistory = {
    drugHistory: "Previous allergic reaction to Penicillin",
    admissionHistory: "Hospitalized for 3 days due to typhoid fever in 2024"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Past Medical History</CardTitle>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setModalOpen(true)}
            className="text-blue-500 text-sm flex items-center"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {/* Drug History Section */}
        <div className="mb-2">
          <div className="flex">
            <span className="font-medium mr-1">Drug History</span>
            <span className="text-gray-700 text-sm">
              : {latestHistory.drugHistory || "N/A"}
            </span>
          </div>
        </div>
        
        {/* Admission History Section */}
        <div>
          <div className="flex">
            <span className="font-medium mr-1">Admission History</span>
            <span className="text-gray-700 text-sm">
              : {latestHistory.admissionHistory || "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
      
      {/* Modal for detailed view */}
      <PastMedicalHistoryDialog 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => {
          console.log("Saving past medical history:", data);
          setModalOpen(false);
        }}
      />
    </Card>
  );
}
