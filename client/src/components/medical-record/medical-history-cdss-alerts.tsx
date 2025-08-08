import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CDSSAlert, 
  getAlertColorScheme,
  mapAlertToCounsellingField 
} from '@/lib/medical-history-cdss';
import { BehavioralCounsellingData } from '../../../../shared/schema';

interface MedicalHistoryCDSSAlertsProps {
  alerts: CDSSAlert[];
  behavioralCounsellingData: BehavioralCounsellingData;
  onAcknowledgeCounselling: (alertType: CDSSAlert['type']) => void;
  className?: string;
}

export function MedicalHistoryCDSSAlerts({
  alerts,
  behavioralCounsellingData,
  onAcknowledgeCounselling,
  className = ""
}: MedicalHistoryCDSSAlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  const getCompletionStatus = (alert: CDSSAlert) => {
    const fieldName = mapAlertToCounsellingField(alert.type);
    const status = behavioralCounsellingData[fieldName as keyof BehavioralCounsellingData];
    return status === 'done' ? 'completed' : status === 'not_done' ? 'not_done' : 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'not_done':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Counselling Completed';
      case 'not_done':
        return 'Counselling Not Done';
      default:
        return 'Counselling Required';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <h4 className="font-semibold text-gray-800">Behavioral Counselling Required</h4>
        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
          {alerts.length} alert{alerts.length > 1 ? 's' : ''}
        </span>
      </div>

      {alerts.map((alert) => {
        const completionStatus = getCompletionStatus(alert);
        const colors = getAlertColorScheme(alert.type, alert.severity);
        
        return (
          <Card 
            key={alert.id} 
            className={`border-l-4 ${colors.border} ${
              completionStatus === 'completed' ? 'bg-green-50' : colors.background
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(completionStatus)}
                    <h5 className={`font-medium ${
                      completionStatus === 'completed' ? 'text-green-800' : colors.text
                    }`}>
                      {alert.title}
                    </h5>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Trigger:</strong> {alert.message}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <strong>Clinical Guidance:</strong>
                  </div>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded border-l-2 border-blue-200 mb-3">
                    {alert.counsellingGuidance}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    completionStatus === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : completionStatus === 'not_done'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {getStatusText(completionStatus)}
                  </span>
                </div>

                {completionStatus !== 'completed' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAcknowledgeCounselling(alert.type)}
                      className="h-8 text-xs border-green-300 text-green-700 hover:bg-green-50"
                    >
                      ✓ Acknowledge & Mark Done
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // This could be expanded to handle "not done" with reasons
                        // For now, we'll just acknowledge as done
                        onAcknowledgeCounselling(alert.type);
                      }}
                      className="h-8 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Not Applicable
                    </Button>
                  </div>
                )}

                {completionStatus === 'completed' && (
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Counselling documented
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                Behavioral Counselling Summary
              </span>
            </div>
            <div className="text-xs text-blue-600">
              {alerts.filter(alert => getCompletionStatus(alert) === 'completed').length} of {alerts.length} completed
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Acknowledgments automatically update the Behavioral Counselling card status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default MedicalHistoryCDSSAlerts;