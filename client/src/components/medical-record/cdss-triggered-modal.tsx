import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { BehavioralCounsellingData } from '@/lib/medical-history-cdss';

export interface CDSSTriggeredAlert {
  id: string;
  type: 'caffeine' | 'tobacco' | 'secondhand_smoke' | 'alcohol_substance' | 'ipv_gbv';
  title: string;
  message: string;
  counsellingGuidance: string;
  severity: 'warning' | 'important' | 'critical';
  triggerCondition: string;
}

interface CDSSTriggeredModalProps {
  isOpen: boolean;
  alert: CDSSTriggeredAlert | null;
  behavioralCounsellingData?: BehavioralCounsellingData;
  onClose: () => void;
  onAcknowledge: (alertType: CDSSTriggeredAlert['type']) => void;
  onNotApplicable?: (alertType: CDSSTriggeredAlert['type']) => void;
}

const CDSSTriggeredModal: React.FC<CDSSTriggeredModalProps> = ({
  isOpen,
  alert,
  behavioralCounsellingData,
  onClose,
  onAcknowledge,
  onNotApplicable
}) => {
  if (!alert) return null;

  // Get completion status for this specific alert
  const getCompletionStatus = () => {
    if (!behavioralCounsellingData) return 'pending';
    
    switch (alert.type) {
      case 'caffeine':
        return behavioralCounsellingData.caffeineCounselling?.status || 'pending';
      case 'tobacco':
        return behavioralCounsellingData.tobaccoCounselling?.status || 'pending';
      case 'secondhand_smoke':
        return behavioralCounsellingData.secondhandSmokeCounselling?.status || 'pending';
      case 'alcohol_substance':
        return behavioralCounsellingData.alcoholSubstanceCounselling?.status || 'pending';
      case 'ipv_gbv':
        return behavioralCounsellingData.ipvGbvCounselling?.status || 'pending';
      default:
        return 'pending';
    }
  };

  const completionStatus = getCompletionStatus();

  // Generate color scheme based on alert type and completion
  const generateColorScheme = () => {
    if (completionStatus === 'completed') {
      return {
        background: 'bg-green-50',
        border: 'border-l-green-500',
        text: 'text-green-800',
        badge: 'bg-green-100 text-green-800'
      };
    }

    switch (alert.type) {
      case 'caffeine':
        return {
          background: 'bg-orange-50',
          border: 'border-l-orange-500',
          text: 'text-orange-800',
          badge: 'bg-orange-100 text-orange-800'
        };
      case 'tobacco':
      case 'alcohol_substance':
      case 'ipv_gbv':
        return {
          background: 'bg-red-50',
          border: 'border-l-red-500',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800'
        };
      case 'secondhand_smoke':
        return {
          background: 'bg-purple-50',
          border: 'border-l-purple-500',
          text: 'text-purple-800',
          badge: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          background: 'bg-blue-50',
          border: 'border-l-blue-500',
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const colors = generateColorScheme();

  const getStatusIcon = () => {
    switch (completionStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'not_done':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-orange-600" />;
    }
  };

  const getStatusText = () => {
    switch (completionStatus) {
      case 'completed':
        return 'Counselling Completed';
      case 'not_done':
        return 'Not Done';
      default:
        return 'Counselling Required';
    }
  };

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'important':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getSeverityIcon()}
            <span>Clinical Decision Support Alert</span>
          </DialogTitle>
          <DialogDescription>
            WHO Guidelines-based counselling recommendation triggered by assessment findings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert Details Card */}
          <Card className={`${colors.border} border-l-4 ${colors.background}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Alert Title and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon()}
                      <h3 className={`font-semibold text-lg ${colors.text}`}>
                        {alert.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${colors.badge}`}>
                        {getStatusText()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trigger Information */}
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-sm">
                    <strong className="text-gray-700">Assessment Finding:</strong>
                    <p className="text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Trigger Condition:</strong> {alert.triggerCondition}
                  </div>
                </div>

                {/* WHO Clinical Guidance */}
                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">WHO</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800 mb-2">Clinical Guidance</h4>
                      <div className="text-sm text-blue-700 leading-relaxed">
                        {alert.counsellingGuidance}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-gray-500">
              This alert was triggered by your assessment selections and follows WHO ANC guidelines.
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4"
              >
                Close
              </Button>
              
              {completionStatus !== 'completed' && (
                <>
                  {onNotApplicable && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onNotApplicable(alert.type);
                        onClose();
                      }}
                      className="px-4 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Not Applicable
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => {
                      onAcknowledge(alert.type);
                      onClose();
                    }}
                    className="px-4 bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Acknowledge & Mark Done
                  </Button>
                </>
              )}
              
              {completionStatus === 'completed' && (
                <div className="flex items-center text-green-600 font-medium text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Counselling Documented
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CDSSTriggeredModal;