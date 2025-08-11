/**
 * Referral Tab Component
 * Handles the three-card referral system
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertTriangle, Clock, MapPin, CheckCircle, FileText, Ambulance } from 'lucide-react';
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { createReferral, getReferralChecklist, validateReferralReadiness, generateReferralLetter } from '@/services/anc/referral.service';
import { requiresImmediateReferral } from '@/services/anc/clinical-rules.service';
import { safeLog } from '@/utils/anc/safe-logger';

interface ReferralTabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
  onBack?: () => void;
}

export const ReferralTab: React.FC<ReferralTabProps> = ({
  patientId,
  encounterId,
  onNext,
  onBack
}) => {
  const {
    state,
    saveEncounter,
    dangerSigns
  } = useAncEncounter({ patientId, encounterId });
  
  const [referralType, setReferralType] = useState<'emergency' | 'routine' | 'specialist'>('routine');
  const [referralReasons, setReferralReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [checklist, setChecklist] = useState(getReferralChecklist('routine'));
  const [checklistStatus, setChecklistStatus] = useState<Record<string, boolean>>({});
  
  // Three-card system states
  const [sourceCard, setSourceCard] = useState({
    facilityName: '',
    providerName: '',
    clinicalSummary: '',
    treatmentGiven: [] as string[],
    vitalSigns: state.vitalSigns
  });
  
  const [transportCard, setTransportCard] = useState({
    mode: 'ambulance' as 'ambulance' | 'private' | 'public' | 'walking',
    condition: 'stable' as 'stable' | 'unstable' | 'critical',
    accompaniedBy: '',
    treatmentDuringTransport: [] as string[]
  });
  
  const [receivingCard, setReceivingCard] = useState({
    facilityName: '',
    facilityId: '',
    expectedServices: [] as string[]
  });
  
  // Check for immediate referral needs
  const immediateReferral = requiresImmediateReferral({
    vitalSigns: state.vitalSigns,
    maternalAssessment: state.maternalAssessment,
    fetalAssessment: state.fetalAssessment,
    dangerSigns
  });
  
  // Update checklist when type changes
  React.useEffect(() => {
    const newChecklist = getReferralChecklist(referralType);
    setChecklist(newChecklist);
    setChecklistStatus({});
  }, [referralType]);
  
  const commonReferralReasons = [
    'Severe pre-eclampsia/eclampsia',
    'Antepartum hemorrhage',
    'Obstructed labor',
    'Fetal distress',
    'Severe anemia (Hb <7g/dL)',
    'Premature rupture of membranes',
    'Multiple pregnancy complications',
    'Previous cesarean section',
    'Suspected placenta previa',
    'Maternal medical conditions',
    'Need for specialized care',
    'Diagnostic investigations unavailable'
  ];
  
  const handleReasonToggle = (reason: string) => {
    setReferralReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };
  
  const handleChecklistToggle = (itemId: string) => {
    setChecklistStatus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  const handleCreateReferral = async () => {
    // Validate checklist
    const updatedChecklist = checklist.map(item => ({
      ...item,
      completed: checklistStatus[item.id] || false
    }));
    
    const validation = validateReferralReadiness(updatedChecklist);
    if (!validation.ready) {
      alert(`Please complete required items: ${validation.missing.join(', ')}`);
      return;
    }
    
    // Create referral
    const allReasons = customReason 
      ? [...referralReasons, customReason]
      : referralReasons;
    
    const referral = createReferral(
      patientId,
      encounterId || '',
      allReasons,
      referralType,
      dangerSigns,
      state.clinicalAlerts
    );
    
    // Update referral with card data
    referral.sourceCard = {
      ...referral.sourceCard,
      ...sourceCard,
      vitalSigns: state.vitalSigns
    };
    
    referral.transportCard = transportCard;
    referral.receivingCard = receivingCard;
    
    // Generate letter
    const referralLetter = generateReferralLetter(referral);
    
    safeLog.clinical('Referral created', {
      patientId,
      encounterId,
      type: referralType,
      reasons: allReasons.length,
      urgent: immediateReferral.required
    });
    
    // Save and proceed
    const result = await saveEncounter();
    if (result.success) {
      onNext?.();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Immediate Referral Alert */}
      {immediateReferral.required && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>IMMEDIATE REFERRAL REQUIRED</strong>
            <ul className="mt-2 list-disc list-inside">
              {immediateReferral.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Referral Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>Referral Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setReferralType('emergency')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                referralType === 'emergency' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Ambulance className={`w-8 h-8 mx-auto mb-2 ${
                referralType === 'emergency' ? 'text-red-600' : 'text-gray-400'
              }`} />
              <div className="font-semibold">Emergency</div>
              <div className="text-xs text-gray-600">Immediate transfer</div>
            </button>
            
            <button
              onClick={() => setReferralType('routine')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                referralType === 'routine' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className={`w-8 h-8 mx-auto mb-2 ${
                referralType === 'routine' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div className="font-semibold">Routine</div>
              <div className="text-xs text-gray-600">Scheduled visit</div>
            </button>
            
            <button
              onClick={() => setReferralType('specialist')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                referralType === 'specialist' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className={`w-8 h-8 mx-auto mb-2 ${
                referralType === 'specialist' ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <div className="font-semibold">Specialist</div>
              <div className="text-xs text-gray-600">Expert consultation</div>
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Card 1: Source Facility */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle>Card 1: Source Facility Information</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="space-y-4">
            <div>
              <Label>Referring Facility</Label>
              <Input
                value={sourceCard.facilityName}
                onChange={(e) => setSourceCard({...sourceCard, facilityName: e.target.value})}
                placeholder="Enter facility name"
              />
            </div>
            
            <div>
              <Label>Referring Provider</Label>
              <Input
                value={sourceCard.providerName}
                onChange={(e) => setSourceCard({...sourceCard, providerName: e.target.value})}
                placeholder="Provider name and title"
              />
            </div>
            
            <div>
              <Label>Reason for Referral</Label>
              <div className="space-y-2 mt-2">
                {commonReferralReasons.map(reason => (
                  <div key={reason} className="flex items-center space-x-2">
                    <Checkbox
                      checked={referralReasons.includes(reason)}
                      onCheckedChange={() => handleReasonToggle(reason)}
                    />
                    <Label className="font-normal">{reason}</Label>
                  </div>
                ))}
              </div>
              <Textarea
                className="mt-3"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Other reasons (specify)..."
              />
            </div>
            
            <div>
              <Label>Clinical Summary</Label>
              <Textarea
                value={sourceCard.clinicalSummary}
                onChange={(e) => setSourceCard({...sourceCard, clinicalSummary: e.target.value})}
                placeholder="Brief clinical history and current condition..."
                className="h-24"
              />
            </div>
            
            <div>
              <Label>Treatment Given</Label>
              <Textarea
                value={sourceCard.treatmentGiven.join('\n')}
                onChange={(e) => setSourceCard({
                  ...sourceCard, 
                  treatmentGiven: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="List treatments provided (one per line)..."
                className="h-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Card 2: Transport */}
      <Card className="border-yellow-200">
        <CardHeader className="bg-yellow-50">
          <CardTitle>Card 2: Transport Information</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mode of Transport</Label>
              <Select 
                value={transportCard.mode}
                onValueChange={(value: any) => setTransportCard({...transportCard, mode: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambulance">Ambulance</SelectItem>
                  <SelectItem value="private">Private Vehicle</SelectItem>
                  <SelectItem value="public">Public Transport</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Patient Condition</Label>
              <Select 
                value={transportCard.condition}
                onValueChange={(value: any) => setTransportCard({...transportCard, condition: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="unstable">Unstable</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label>Accompanied By</Label>
              <Input
                value={transportCard.accompaniedBy}
                onChange={(e) => setTransportCard({...transportCard, accompaniedBy: e.target.value})}
                placeholder="e.g., Nurse, Midwife, Family member"
              />
            </div>
            
            <div className="col-span-2">
              <Label>Treatment During Transport</Label>
              <Textarea
                value={transportCard.treatmentDuringTransport.join('\n')}
                onChange={(e) => setTransportCard({
                  ...transportCard,
                  treatmentDuringTransport: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="List any treatments to be continued during transport..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Card 3: Receiving Facility */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle>Card 3: Receiving Facility</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="space-y-4">
            <div>
              <Label>Receiving Facility</Label>
              <Input
                value={receivingCard.facilityName}
                onChange={(e) => setReceivingCard({...receivingCard, facilityName: e.target.value})}
                placeholder="Name of receiving facility"
              />
            </div>
            
            <div>
              <Label>Expected Services</Label>
              <div className="space-y-2 mt-2">
                {[
                  'Emergency obstetric care',
                  'Cesarean section',
                  'Blood transfusion',
                  'NICU services',
                  'Specialist consultation',
                  'Advanced diagnostics',
                  'ICU care'
                ].map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      checked={receivingCard.expectedServices.includes(service)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setReceivingCard({
                            ...receivingCard,
                            expectedServices: [...receivingCard.expectedServices, service]
                          });
                        } else {
                          setReceivingCard({
                            ...receivingCard,
                            expectedServices: receivingCard.expectedServices.filter(s => s !== service)
                          });
                        }
                      }}
                    />
                    <Label className="font-normal">{service}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pre-referral Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-referral Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={checklistStatus[item.id] || false}
                  onCheckedChange={() => handleChecklistToggle(item.id)}
                />
                <Label className={`flex-1 ${item.required ? 'font-medium' : ''}`}>
                  {item.item}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {checklistStatus[item.id] && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleCreateReferral}
          disabled={referralReasons.length === 0 && !customReason}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Create Referral
        </Button>
      </div>
    </div>
  );
};