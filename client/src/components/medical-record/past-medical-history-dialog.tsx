
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

interface PastMedicalHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export function PastMedicalHistoryDialog({
  open,
  onClose,
  onSave,
}: PastMedicalHistoryDialogProps) {
  const [drugHistory, setDrugHistory] = useState<string>("");
  const [admissionHistory, setAdmissionHistory] = useState<string>("");
  
  // For past encounters example
  const pastEncounters = [
    {
      date: "18-Apr-2025",
      facility: "Masempela Rural Health Centre",
      clinician: "Administrator Administrator",
      drugHistory: "Previous allergic reaction to Penicillin",
      admissionHistory: "Hospitalized for 3 days due to typhoid fever in 2024"
    }
  ];

  const handleSave = () => {
    if (onSave) {
      onSave({
        drugHistory,
        admissionHistory
      });
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Past Medical History</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Drug History */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="drugHistory" className="font-medium mr-1">
                Drug History
              </Label>
              <span className="text-red-500">*</span>
            </div>
            <Textarea
              id="drugHistory"
              placeholder="Enter Drug History"
              value={drugHistory}
              onChange={(e) => setDrugHistory(e.target.value)}
              rows={4}
              className="resize-none border-gray-300"
            />
          </div>
          
          {/* Admission History */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="admissionHistory" className="font-medium mr-1">
                Admission History
              </Label>
              <span className="text-red-500">*</span>
            </div>
            <Textarea
              id="admissionHistory"
              placeholder="Enter Admission History"
              value={admissionHistory}
              onChange={(e) => setAdmissionHistory(e.target.value)}
              rows={4}
              className="resize-none border-gray-300"
            />
          </div>
          
          {/* Past Encounters Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Past Encounters</h3>
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm text-gray-600 mr-2">30</span>
                <button className="text-blue-500 font-bold">«</button>
                <span className="mx-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm">1</span>
                <button className="text-blue-500 font-bold">»</button>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-500 h-6 p-0">
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
            <div className="bg-gray-50 rounded-md">
              <div className="grid grid-cols-3 gap-4 p-2 font-medium text-sm border-b">
                <div>Encounter Date</div>
                <div>Facility</div>
                <div>Clinician</div>
              </div>
              <div className="border-b last:border-b-0">
                <div className="grid grid-cols-3 gap-4 p-2 text-sm">
                  <div>18-Apr-2025</div>
                  <div>Masempela Rural Health Centre</div>
                  <div>Administrator Administrator</div>
                </div>
                <div className="px-2 pb-2">
                  <div className="mb-1">
                    <span className="font-medium mr-1">Drug History</span>
                    <span className="text-gray-700">: Previous allergic reaction to Penicillin</span>
                  </div>
                  <div>
                    <span className="font-medium mr-1">Admission History</span>
                    <span className="text-gray-700">: Hospitalized for 3 days due to typhoid fever in 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dialog Actions */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
