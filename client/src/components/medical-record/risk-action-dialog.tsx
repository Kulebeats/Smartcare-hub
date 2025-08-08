
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Calendar, Clipboard, ArrowRight } from "lucide-react";

interface RiskActionDialogProps {
  open: boolean;
  onClose: () => void;
  riskLevel: string;
}

export function RiskActionDialog({ open, onClose, riskLevel }: RiskActionDialogProps) {
  // Actions based on risk level
  const getActions = () => {
    switch (riskLevel) {
      case "High Risk":
        return [
          "Recommend immediate PrEP initiation",
          "Schedule HIV testing every 3 months",
          "Counsel on safer sex practices and condom use",
          "Consider STI screening",
          "Follow up within 1 month"
        ];
      case "Medium Risk":
        return [
          "Recommend PrEP consideration",
          "Schedule HIV testing every 3-6 months",
          "Counsel on safer sex practices",
          "Follow up within 3 months"
        ];
      case "Low Risk":
        return [
          "Discuss PrEP as an option",
          "Schedule HIV testing every 6 months",
          "Provide education on HIV prevention",
          "Follow up during next routine visit"
        ];
      case "Very Low Risk":
        return [
          "Routine HIV testing annually",
          "Provide education on maintaining low-risk behaviors",
          "Follow up during next annual checkup"
        ];
      default:
        return [
          "Complete risk assessment to determine appropriate actions",
          "Schedule follow-up for comprehensive evaluation"
        ];
    }
  };

  // Get relevant icon based on risk level
  const getIcon = () => {
    switch (riskLevel) {
      case "High Risk":
        return <ShieldAlert className="h-12 w-12 text-red-500" />;
      case "Medium Risk":
        return <ShieldAlert className="h-12 w-12 text-orange-500" />;
      case "Low Risk":
        return <Calendar className="h-12 w-12 text-yellow-500" />;
      case "Very Low Risk":
        return <Clipboard className="h-12 w-12 text-green-500" />;
      default:
        return <Clipboard className="h-12 w-12 text-gray-500" />;
    }
  };

  // Get color based on risk level for styling
  const getColor = () => {
    switch (riskLevel) {
      case "High Risk": return "bg-red-50 border-red-200";
      case "Medium Risk": return "bg-orange-50 border-orange-200";
      case "Low Risk": return "bg-yellow-50 border-yellow-200";
      case "Very Low Risk": return "bg-green-50 border-green-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  // Get title based on risk level
  const getTitle = () => {
    switch (riskLevel) {
      case "High Risk": return "Urgent Action Needed";
      case "Medium Risk": return "Recommended Actions";
      case "Low Risk": return "Preventive Measures";
      case "Very Low Risk": return "Maintenance Plan";
      default: return "Assessment Incomplete";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]" aria-describedby="risk-action-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Recommended Next Steps</span>
          </DialogTitle>
          <DialogDescription id="risk-action-description">
            Based on the {riskLevel.toLowerCase()} assessment, here are the recommended actions
          </DialogDescription>
        </DialogHeader>

        <div className={`p-4 rounded-lg border ${getColor()} mt-2`}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">{getTitle()}</h3>
              <ul className="space-y-2">
                {getActions().map((action, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose} className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
