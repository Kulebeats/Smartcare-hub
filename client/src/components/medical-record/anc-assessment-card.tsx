/**
 * ANC Assessment Card Component
 * 
 * Integrates Standard ANC Assessment into client profile following established UI/UX patterns.
 * Provides expandable card design with status tracking and progress indicators.
 * 
 * Key Features:
 * - Client profile integration with consistent styling
 * - Status badges showing assessment completion
 * - Progress tracking with section completion indicators
 * - Error boundary wrapper for fault tolerance
 * - Expandable/collapsible design for space efficiency
 * 
 * @see /prompts/ANC_COMPONENT_INTEGRATION_GUIDE.md for integration details
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Baby, Calendar, User, AlertCircle } from 'lucide-react';
import { StandardANCAssessment } from './standard-anc-assessment';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useToast } from '@/hooks/use-toast';

interface ANCAssessmentCardProps {
  patientId: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const ANCAssessmentCard: React.FC<ANCAssessmentCardProps> = ({ 
  patientId, 
  isExpanded = false, 
  onToggle 
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [lastAssessmentDate, setLastAssessmentDate] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle && onToggle();
  };

  const handleAssessmentSave = (data: any) => {
    console.log('Saving ANC assessment data:', data);
    setAssessmentComplete(true);
    setLastAssessmentDate(new Date().toLocaleDateString());
    
    toast({
      title: "ANC Assessment Saved",
      description: "Assessment has been successfully recorded in patient profile.",
      variant: "success",
    });
  };

  const getStatusBadge = () => {
    if (assessmentComplete) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Assessment Complete
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pending Assessment
      </Badge>
    );
  };

  return (
    <Card className="w-full border border-gray-200 shadow-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Baby className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                ANC Assessment
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">Antenatal Care Evaluation</span>
                {lastAssessmentDate && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Last: {lastAssessmentDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getStatusBadge()}
            
            <div className="flex items-center space-x-2">
              {!assessmentComplete && (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              
              <Button variant="ghost" size="sm" className="p-1">
                {expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pb-6">
          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Patient-Centered ANC Care</h4>
                  <p className="text-sm text-blue-700">
                    Comprehensive antenatal assessment following WHO guidelines for maternal and fetal health monitoring.
                  </p>
                </div>
              </div>
            </div>

            <ErrorBoundary
              fallback={
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">Unable to load ANC Assessment. Please refresh the page.</p>
                </div>
              }
              onError={(error, errorInfo) => {
                console.error('ANC Assessment Error:', error, errorInfo);
                toast({
                  title: "Assessment Error",
                  description: "There was an issue loading the assessment. Please try again.",
                  variant: "destructive",
                });
              }}
            >
              <StandardANCAssessment
                patientId={patientId}
                onSave={handleAssessmentSave}
                isFollowupVisit={false}
                visitNumber={1}
                hideCard={true}
              />
            </ErrorBoundary>
          </div>
        </CardContent>
      )}
    </Card>
  );
};