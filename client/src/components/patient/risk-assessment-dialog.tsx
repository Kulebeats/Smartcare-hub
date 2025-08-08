import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RiskAssessmentDashboard } from "./risk-assessment-visualization";

export function RiskAssessmentDialog({
  open,
  onClose,
  patientData,
}: {
  open: boolean;
  onClose: () => void;
  patientData: any;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="risk-assessment-description">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
          <DialogTitle>Comprehensive Risk Assessment</DialogTitle>
          <DialogDescription id="risk-assessment-description">
            Detailed analysis of patient health metrics and risk factors
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 pb-6">
          <RiskAssessmentDashboard patientData={patientData} />
        </div>
      </DialogContent>
    </Dialog>
  );
}