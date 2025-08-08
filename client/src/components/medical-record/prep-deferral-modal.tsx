import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';

interface PrepDeferralModalProps {
  open: boolean;
  onClose: () => void;
  exclusionCriteria: string[];
  onAcknowledge: () => void;
}

export default function PrepDeferralModal({
  open,
  onClose,
  exclusionCriteria,
  onAcknowledge
}: PrepDeferralModalProps) {
  
  const handleAcknowledge = () => {
    console.log("🚫 DEFERRAL MODAL: Clinician acknowledged deferral decision");
    onAcknowledge();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>PrEP Assessment - Clinical Decision</span>
          </DialogTitle>
          <DialogDescription>
            PrEP eligibility determination based on WHO and Zambian Clinical Guidelines
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Header */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <h3 className="font-medium text-red-900">❌ No, defer PrEP</h3>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Clinical assessment indicates deferral is appropriate at this time
            </p>
          </div>

          {/* Exclusion Criteria */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Exclusion Criteria Identified:</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <ul className="space-y-2">
                {exclusionCriteria.map((criteria, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Clinical Guidance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-blue-900 text-sm">Next Steps</h5>
                <p className="text-xs text-blue-700 mt-1">
                  Address identified concerns and reassess eligibility at future visits when clinically appropriate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button 
            onClick={handleAcknowledge}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            Acknowledge and Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}