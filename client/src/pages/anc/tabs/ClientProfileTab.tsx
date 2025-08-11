/**
 * Client Profile Tab Component
 * Handles patient demographics and pregnancy history
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar, Heart, Baby } from 'lucide-react';
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { calculateEDD } from '@/utils/anc/edd-calculator';
import { safeLog } from '@/utils/anc/safe-logger';

interface ClientProfileTabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
  onBack?: () => void;
}

export const ClientProfileTab: React.FC<ClientProfileTabProps> = ({
  patientId,
  encounterId,
  onNext,
  onBack
}) => {
  const {
    state,
    dispatch,
    patient,
    saveEncounter
  } = useAncEncounter({ patientId, encounterId });
  
  const [lmpKnown, setLmpKnown] = useState<'yes' | 'no' | 'unsure'>('yes');
  const [lmpDate, setLmpDate] = useState<string>('');
  const [pregnancyCount, setPregnancyCount] = useState({
    gravida: 0,
    para: 0,
    livingChildren: 0,
    miscarriages: 0,
    stillbirths: 0
  });
  
  const handleLMPDateChange = (date: string) => {
    setLmpDate(date);
    
    if (date) {
      const lmp = new Date(date);
      const eddResult = calculateEDD(lmp);
      dispatch({ type: 'SET_LMP_DATE', payload: lmp });
      dispatch({ type: 'SET_EDD', payload: eddResult });
      
      safeLog.clinical('EDD calculated', {
        lmpDate: date,
        edd: eddResult.edd.toISOString(),
        gestationalAge: eddResult.gestationalAge
      });
    }
  };
  
  const handleSaveAndNext = async () => {
    // Validate required fields
    if (lmpKnown === 'yes' && !lmpDate) {
      dispatch({ 
        type: 'SET_VALIDATION_ERROR', 
        payload: { field: 'lmpDate', error: 'LMP date is required' }
      });
      return;
    }
    
    // Save encounter data
    const result = await saveEncounter();
    if (result.success) {
      onNext?.();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Patient Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Patient Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Name</Label>
                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Age</Label>
                <p className="font-medium">{patient.age} years</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">NRC</Label>
                <p className="font-medium">{patient.nrc || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Marital Status</Label>
                <p className="font-medium">{patient.maritalStatus || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Phone</Label>
                <p className="font-medium">{patient.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Address</Label>
                <p className="font-medium">{patient.address || 'Not provided'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pregnancy History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <span>Pregnancy History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gravida">Gravida (Total Pregnancies)</Label>
              <Input
                id="gravida"
                type="number"
                min="0"
                max="20"
                value={pregnancyCount.gravida}
                onChange={(e) => setPregnancyCount({
                  ...pregnancyCount,
                  gravida: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label htmlFor="para">Para (Deliveries ≥20 weeks)</Label>
              <Input
                id="para"
                type="number"
                min="0"
                max="20"
                value={pregnancyCount.para}
                onChange={(e) => setPregnancyCount({
                  ...pregnancyCount,
                  para: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label htmlFor="living">Living Children</Label>
              <Input
                id="living"
                type="number"
                min="0"
                max="20"
                value={pregnancyCount.livingChildren}
                onChange={(e) => setPregnancyCount({
                  ...pregnancyCount,
                  livingChildren: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label htmlFor="miscarriages">Miscarriages</Label>
              <Input
                id="miscarriages"
                type="number"
                min="0"
                max="20"
                value={pregnancyCount.miscarriages}
                onChange={(e) => setPregnancyCount({
                  ...pregnancyCount,
                  miscarriages: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label htmlFor="stillbirths">Stillbirths</Label>
              <Input
                id="stillbirths"
                type="number"
                min="0"
                max="20"
                value={pregnancyCount.stillbirths}
                onChange={(e) => setPregnancyCount({
                  ...pregnancyCount,
                  stillbirths: parseInt(e.target.value) || 0
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Pregnancy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Baby className="w-5 h-5 text-green-600" />
            <span>Current Pregnancy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lmp-known">Is LMP (Last Menstrual Period) Known?</Label>
            <Select value={lmpKnown} onValueChange={(value: any) => setLmpKnown(value)}>
              <SelectTrigger id="lmp-known">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="unsure">Unsure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {lmpKnown === 'yes' && (
            <div>
              <Label htmlFor="lmp-date">LMP Date</Label>
              <Input
                id="lmp-date"
                type="date"
                value={lmpDate}
                onChange={(e) => handleLMPDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              {state.validationErrors.lmpDate && (
                <p className="text-xs text-red-600 mt-1">{state.validationErrors.lmpDate}</p>
              )}
            </div>
          )}
          
          {state.edd && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Expected Delivery Date (EDD):</span>
                <span className="font-semibold text-blue-600">
                  {state.edd.edd.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current Gestational Age:</span>
                <span className="font-semibold text-blue-600">
                  {state.gestationalAge?.weeks} weeks {state.gestationalAge?.days} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Trimester:</span>
                <span className="font-semibold text-blue-600">
                  {state.gestationalAge && state.gestationalAge.weeks < 14 ? 'First' :
                   state.gestationalAge && state.gestationalAge.weeks < 28 ? 'Second' : 'Third'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleSaveAndNext}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Save & Next
        </Button>
      </div>
    </div>
  );
};