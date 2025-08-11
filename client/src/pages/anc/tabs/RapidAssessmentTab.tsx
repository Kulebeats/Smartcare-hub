/**
 * Rapid Assessment Tab Component
 * Handles danger signs assessment and initial patient evaluation
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DangerSign, DANGER_SIGN_DESCRIPTIONS, DANGER_SIGN_METADATA } from '@/constants/anc/danger-signs';
import { assessDangerSigns } from '@/services/anc/danger-signs.service';
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { safeLog } from '@/utils/anc/safe-logger';

interface RapidAssessmentTabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
}

const DangerSignCheckbox: React.FC<{
  sign: DangerSign;
  checked: boolean;
  onChange: (sign: DangerSign) => void;
  onInfoClick: (sign: DangerSign) => void;
}> = ({ sign, checked, onChange, onInfoClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const metadata = DANGER_SIGN_METADATA[sign];
  const showInfoIcon = checked || isHovered;
  
  return (
    <div 
      className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-gray-100/70" 
      style={{ boxShadow: '0 1px 3px hsla(223.58deg, 50.96%, 59.22%, 0.2)' }} 
      onMouseEnter={(e) => { 
        e.currentTarget.style.boxShadow = '0 3px 6px hsla(223.58deg, 50.96%, 59.22%, 0.35)';
        setIsHovered(true);
      }} 
      onMouseLeave={(e) => { 
        e.currentTarget.style.boxShadow = '0 1px 3px hsla(223.58deg, 50.96%, 59.22%, 0.2)';
        setIsHovered(false);
      }}
    >
      <input 
        type="checkbox" 
        id={`danger-${sign}`}
        checked={checked}
        onChange={() => onChange(sign)}
        className={`rounded border-gray-300 w-3.5 h-3.5 ${
          metadata.severity === 'critical' ? 'text-red-600' :
          metadata.severity === 'urgent' ? 'text-orange-600' :
          'text-yellow-600'
        }`}
      />
      <label 
        htmlFor={`danger-${sign}`} 
        className="text-xs font-medium flex items-center space-x-1.5 flex-1 cursor-pointer font-sans"
      >
        <span className="text-gray-800">{sign}</span>
        {metadata.severity === 'critical' && (
          <span className="text-red-600 text-xs font-semibold">[CRITICAL]</span>
        )}
        {showInfoIcon && (
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              onInfoClick(sign);
            }}
            className="w-3 h-3 rounded-full border border-gray-400 bg-white/80 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-xs font-semibold transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5 hover:scale-110"
            style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.3)' }}
          >
            i
          </button>
        )}
      </label>
    </div>
  );
};

export const RapidAssessmentTab: React.FC<RapidAssessmentTabProps> = ({
  patientId,
  encounterId,
  onNext
}) => {
  const {
    state,
    toggleDangerSign,
    confirmDangerSigns,
    hasCriticalDangerSigns,
    saveEncounter
  } = useAncEncounter({ patientId, encounterId });
  
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedSignInfo, setSelectedSignInfo] = useState<DangerSign | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [assessment, setAssessment] = useState<ReturnType<typeof assessDangerSigns> | null>(null);
  
  const handleInfoClick = (sign: DangerSign) => {
    setSelectedSignInfo(sign);
    setShowInfoModal(true);
  };
  
  const handleConfirmDangerSigns = async () => {
    const result = await confirmDangerSigns();
    setAssessment(result);
    setShowConfirmDialog(false);
    
    safeLog.clinical('Danger signs confirmed', {
      count: result.signs.length,
      critical: result.criticalSigns.length,
      requiresReferral: result.requiresImmediateReferral
    });
    
    // Auto-save if critical signs present
    if (result.requiresImmediateReferral) {
      await saveEncounter();
    }
  };
  
  const handleNext = () => {
    if (state.dangerSigns.length > 0 && !state.dangerSignsConfirmed) {
      setShowConfirmDialog(true);
    } else {
      onNext?.();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Danger Signs Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Danger Signs Assessment</span>
            </div>
            {state.dangerSignsConfirmed && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Select all danger signs present. Critical signs require immediate action.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(DANGER_SIGN_METADATA).map((sign) => (
              <DangerSignCheckbox
                key={sign}
                sign={sign as DangerSign}
                checked={state.dangerSigns.includes(sign as DangerSign)}
                onChange={toggleDangerSign}
                onInfoClick={handleInfoClick}
              />
            ))}
          </div>
          
          {/* Critical Signs Alert */}
          {hasCriticalDangerSigns && (
            <Alert className="mt-4 border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>CRITICAL DANGER SIGNS DETECTED!</strong>
                <br />
                Immediate medical intervention required. Prepare for emergency referral.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Assessment Results */}
          {assessment && assessment.signs.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Clinical Assessment:</h4>
                <ul className="text-sm space-y-1">
                  {assessment.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {assessment.requiresImmediateReferral && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-sm text-red-800 mb-2">Referral Required:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {assessment.referralReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" disabled>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {state.dangerSigns.length > 0 && !state.dangerSignsConfirmed ? 'Confirm & Continue' : 'Next'}
        </Button>
      </div>
      
      {/* Info Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold">
            {selectedSignInfo}
          </DialogTitle>
          <DialogDescription className="mt-2 space-y-3">
            {selectedSignInfo && (
              <>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Clinical Description:</h4>
                  <p className="text-sm">{DANGER_SIGN_DESCRIPTIONS[selectedSignInfo]}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Management Protocol:</h4>
                  <p className="text-sm">{DANGER_SIGN_METADATA[selectedSignInfo].managementProtocol}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Urgency:</h4>
                  <p className="text-sm">
                    <span className={`font-semibold ${
                      DANGER_SIGN_METADATA[selectedSignInfo].urgency === 'immediate' ? 'text-red-600' :
                      DANGER_SIGN_METADATA[selectedSignInfo].urgency === 'same_day' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      {DANGER_SIGN_METADATA[selectedSignInfo].urgency.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Reference: {DANGER_SIGN_METADATA[selectedSignInfo].guidelineReference.source} ({DANGER_SIGN_METADATA[selectedSignInfo].guidelineReference.version})
                  {DANGER_SIGN_METADATA[selectedSignInfo].guidelineReference.pageReference && 
                    ` - ${DANGER_SIGN_METADATA[selectedSignInfo].guidelineReference.pageReference}`}
                </div>
              </>
            )}
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowInfoModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogTitle>Confirm Danger Signs</DialogTitle>
          <DialogDescription>
            <p className="mb-3">You have selected the following danger signs:</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              {state.dangerSigns.map(sign => (
                <li key={sign} className={
                  DANGER_SIGN_METADATA[sign].severity === 'critical' ? 'text-red-600 font-semibold' :
                  DANGER_SIGN_METADATA[sign].severity === 'urgent' ? 'text-orange-600' :
                  ''
                }>
                  {sign}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600">
              Confirming will lock these selections and may trigger automatic referral processes.
            </p>
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Review Again
            </Button>
            <Button 
              onClick={handleConfirmDangerSigns}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Confirm Danger Signs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};