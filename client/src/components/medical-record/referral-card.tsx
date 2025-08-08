import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ReferralData {
  emergency_referral?: string;
  reasons?: string[];
  facility?: string;
  provider_name?: string;
  provider_phone?: string;
  referral_date?: string;
  notes?: string;
  checklist_progress?: number;
  treatment_before_referral?: string;
}

interface ReferralCardProps {
  data?: ReferralData;
  onOpenModal: () => void;
  dangerSigns?: string[];
}

export default function ReferralCard({ 
  data, 
  onOpenModal, 
  dangerSigns = [] 
}: ReferralCardProps) {
  const hasEmergencyReferral = data?.emergency_referral === 'yes';
  const hasReferralReasons = data?.reasons && data.reasons.length > 0;
  const isCompleted = hasEmergencyReferral && hasReferralReasons && data?.facility;

  // Auto-detect emergency conditions from danger signs
  const hasEmergencyConditions = dangerSigns.some(sign => 
    ['Convulsions', 'Severe vaginal bleeding', 'Severe headache', 'Visual disturbance', 
     'Unconscious', 'Imminent delivery', 'Severe abdominal pain', 'High fever'].includes(sign)
  );

  const getStatusInfo = () => {
    if (hasEmergencyConditions) {
      return {
        status: 'Emergency Required',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertTriangle,
        description: 'Emergency referral required based on danger signs'
      };
    }
    
    if (isCompleted) {
      return {
        status: 'Completed',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: FileText,
        description: `Referral to ${data?.facility} arranged`
      };
    }
    
    if (hasEmergencyReferral) {
      return {
        status: 'In Progress',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: FileText,
        description: 'Referral initiated, details pending'
      };
    }
    
    return {
      status: 'Not Started',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: FileText,
      description: 'No referral assessment performed'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={`border-2 ${statusInfo.color} transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusInfo.color}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Referral Assessment</h3>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenModal}
              className="h-8 w-8 p-0 hover:bg-blue-50"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Emergency Alert */}
        {hasEmergencyConditions && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Emergency conditions detected - immediate referral required
              </span>
            </div>
          </div>
        )}

        {/* Quick Summary */}
        {(hasReferralReasons || data?.facility) && (
          <div className="mt-3 space-y-1">
            {hasReferralReasons && (
              <div className="flex items-center text-xs text-gray-600">
                <span className="font-medium">Reasons:</span>
                <span className="ml-1">{data?.reasons?.length} selected</span>
              </div>
            )}
            {data?.facility && (
              <div className="flex items-center text-xs text-gray-600">
                <span className="font-medium">Facility:</span>
                <span className="ml-1">{data.facility}</span>
              </div>
            )}
            {data?.checklist_progress !== undefined && (
              <div className="flex items-center text-xs text-gray-600">
                <span className="font-medium">Checklist:</span>
                <span className="ml-1">{data.checklist_progress}% complete</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}