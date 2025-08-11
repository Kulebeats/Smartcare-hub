/**
 * Examination Tab Component
 * Handles physical examination, vital signs, and fetal assessment
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Heart, Stethoscope, AlertTriangle, Baby } from 'lucide-react';
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { validateVitalSigns } from '@/services/anc/validation.service';
import { safeLog } from '@/utils/anc/safe-logger';

interface ExaminationTabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
  onBack?: () => void;
}

export const ExaminationTab: React.FC<ExaminationTabProps> = ({
  patientId,
  encounterId,
  onNext,
  onBack
}) => {
  const {
    state,
    dispatch,
    saveEncounter,
    currentTrimester
  } = useAncEncounter({ patientId, encounterId });
  
  const [vitalSigns, setVitalSigns] = useState({
    temperature: '',
    pulseRate: '',
    respiratoryRate: '',
    systolic: '',
    diastolic: '',
    weight: '',
    height: '',
    muac: ''
  });
  
  const [maternalExam, setMaternalExam] = useState({
    pallor: 'none',
    jaundice: 'none',
    oedema: 'none',
    oedemaGrade: '',
    breastExam: 'normal',
    abdominalExam: 'normal',
    sfh: '',
    lie: '',
    presentation: '',
    position: '',
    engagement: ''
  });
  
  const [fetalExam, setFetalExam] = useState({
    fetalHeartRate: '',
    fetalHeartRhythm: 'regular',
    fetalMovement: 'present',
    amnioticFluid: 'normal'
  });
  
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  
  const handleVitalSignChange = (field: string, value: string) => {
    const updatedVitals = { ...vitalSigns, [field]: value };
    setVitalSigns(updatedVitals);
    
    // Update state
    dispatch({
      type: 'UPDATE_VITAL_SIGNS',
      payload: {
        [field]: value ? parseFloat(value) : undefined
      }
    });
    
    // Validate vital signs
    const vitalsForValidation = {
      temperature: updatedVitals.temperature ? parseFloat(updatedVitals.temperature) : undefined,
      pulseRate: updatedVitals.pulseRate ? parseFloat(updatedVitals.pulseRate) : undefined,
      respiratoryRate: updatedVitals.respiratoryRate ? parseFloat(updatedVitals.respiratoryRate) : undefined,
      bloodPressure: updatedVitals.systolic && updatedVitals.diastolic ? {
        systolic: parseFloat(updatedVitals.systolic),
        diastolic: parseFloat(updatedVitals.diastolic)
      } : undefined
    };
    
    const validation = validateVitalSigns(vitalsForValidation);
    setValidationWarnings(validation.warnings);
  };
  
  const calculateBMI = () => {
    if (vitalSigns.weight && vitalSigns.height) {
      const weight = parseFloat(vitalSigns.weight);
      const height = parseFloat(vitalSigns.height) / 100; // Convert cm to m
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };
  
  const handleSaveAndNext = async () => {
    // Update all examination data in state
    dispatch({
      type: 'UPDATE_MATERNAL_ASSESSMENT',
      payload: {
        pallor: maternalExam.pallor as any,
        jaundice: maternalExam.jaundice as any,
        oedema: maternalExam.oedema as any,
        oedemaGrade: maternalExam.oedemaGrade ? parseInt(maternalExam.oedemaGrade) : undefined,
        breastExamination: maternalExam.breastExam,
        abdominalExamination: maternalExam.abdominalExam,
        symphysisFundalHeight: maternalExam.sfh ? parseFloat(maternalExam.sfh) : undefined,
        fetalLie: maternalExam.lie as any,
        fetalPresentation: maternalExam.presentation as any
      }
    });
    
    dispatch({
      type: 'UPDATE_FETAL_ASSESSMENT',
      payload: {
        fetalHeartRate: fetalExam.fetalHeartRate ? parseFloat(fetalExam.fetalHeartRate) : 0,
        fetalHeartRhythm: fetalExam.fetalHeartRhythm as any,
        fetalMovement: fetalExam.fetalMovement as any,
        amnioticFluidVolume: fetalExam.amnioticFluid as any
      }
    });
    
    // Save and proceed
    const result = await saveEncounter();
    if (result.success) {
      safeLog.clinical('Examination completed', {
        patientId,
        encounterId,
        hasWarnings: validationWarnings.length > 0
      });
      onNext?.();
    }
  };
  
  const bmi = calculateBMI();
  
  return (
    <div className="space-y-6">
      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Vital Signs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="temp">Temperature (°C)</Label>
              <Input
                id="temp"
                type="number"
                step="0.1"
                min="35"
                max="42"
                value={vitalSigns.temperature}
                onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                placeholder="36.5"
              />
            </div>
            <div>
              <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
              <Input
                id="pulse"
                type="number"
                min="40"
                max="200"
                value={vitalSigns.pulseRate}
                onChange={(e) => handleVitalSignChange('pulseRate', e.target.value)}
                placeholder="80"
              />
            </div>
            <div>
              <Label htmlFor="resp">Respiratory Rate</Label>
              <Input
                id="resp"
                type="number"
                min="10"
                max="60"
                value={vitalSigns.respiratoryRate}
                onChange={(e) => handleVitalSignChange('respiratoryRate', e.target.value)}
                placeholder="16"
              />
            </div>
            <div>
              <Label>Blood Pressure (mmHg)</Label>
              <div className="flex space-x-1">
                <Input
                  type="number"
                  min="60"
                  max="250"
                  value={vitalSigns.systolic}
                  onChange={(e) => handleVitalSignChange('systolic', e.target.value)}
                  placeholder="120"
                  className="w-20"
                />
                <span className="self-center">/</span>
                <Input
                  type="number"
                  min="40"
                  max="150"
                  value={vitalSigns.diastolic}
                  onChange={(e) => handleVitalSignChange('diastolic', e.target.value)}
                  placeholder="80"
                  className="w-20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={vitalSigns.weight}
                onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                placeholder="65"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                min="100"
                max="250"
                value={vitalSigns.height}
                onChange={(e) => handleVitalSignChange('height', e.target.value)}
                placeholder="165"
              />
            </div>
            <div>
              <Label htmlFor="muac">MUAC (cm)</Label>
              <Input
                id="muac"
                type="number"
                step="0.1"
                min="15"
                max="50"
                value={vitalSigns.muac}
                onChange={(e) => handleVitalSignChange('muac', e.target.value)}
                placeholder="25"
              />
            </div>
            {bmi && (
              <div>
                <Label>BMI</Label>
                <div className={`p-2 rounded font-medium ${
                  parseFloat(bmi) < 18.5 ? 'bg-yellow-100 text-yellow-800' :
                  parseFloat(bmi) > 30 ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {bmi} kg/m²
                </div>
              </div>
            )}
          </div>
          
          {validationWarnings.length > 0 && (
            <Alert className="mt-4 border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <strong>Clinical Warnings:</strong>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {validationWarnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Maternal Examination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            <span>Maternal Examination</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pallor">Pallor</Label>
              <Select value={maternalExam.pallor} onValueChange={(value) => 
                setMaternalExam({...maternalExam, pallor: value})
              }>
                <SelectTrigger id="pallor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="jaundice">Jaundice</Label>
              <Select value={maternalExam.jaundice} onValueChange={(value) => 
                setMaternalExam({...maternalExam, jaundice: value})
              }>
                <SelectTrigger id="jaundice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="oedema">Oedema</Label>
              <Select value={maternalExam.oedema} onValueChange={(value) => 
                setMaternalExam({...maternalExam, oedema: value})
              }>
                <SelectTrigger id="oedema">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pedal">Pedal</SelectItem>
                  <SelectItem value="pretibial">Pretibial</SelectItem>
                  <SelectItem value="generalised">Generalised</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {maternalExam.oedema !== 'none' && (
              <div>
                <Label htmlFor="oedema-grade">Oedema Grade</Label>
                <Select value={maternalExam.oedemaGrade} onValueChange={(value) => 
                  setMaternalExam({...maternalExam, oedemaGrade: value})
                }>
                  <SelectTrigger id="oedema-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grade 1 (+)</SelectItem>
                    <SelectItem value="2">Grade 2 (++)</SelectItem>
                    <SelectItem value="3">Grade 3 (+++)</SelectItem>
                    <SelectItem value="4">Grade 4 (++++)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {currentTrimester && currentTrimester >= 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sfh">Symphysis-Fundal Height (cm)</Label>
                <Input
                  id="sfh"
                  type="number"
                  min="10"
                  max="50"
                  value={maternalExam.sfh}
                  onChange={(e) => setMaternalExam({...maternalExam, sfh: e.target.value})}
                  placeholder="e.g., 28"
                />
              </div>
              <div>
                <Label htmlFor="lie">Fetal Lie</Label>
                <Select value={maternalExam.lie} onValueChange={(value) => 
                  setMaternalExam({...maternalExam, lie: value})
                }>
                  <SelectTrigger id="lie">
                    <SelectValue placeholder="Select lie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="longitudinal">Longitudinal</SelectItem>
                    <SelectItem value="transverse">Transverse</SelectItem>
                    <SelectItem value="oblique">Oblique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="presentation">Fetal Presentation</Label>
                <Select value={maternalExam.presentation} onValueChange={(value) => 
                  setMaternalExam({...maternalExam, presentation: value})
                }>
                  <SelectTrigger id="presentation">
                    <SelectValue placeholder="Select presentation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cephalic">Cephalic</SelectItem>
                    <SelectItem value="breech">Breech</SelectItem>
                    <SelectItem value="shoulder">Shoulder</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Fetal Assessment */}
      {currentTrimester && currentTrimester >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Baby className="w-5 h-5 text-pink-600" />
              <span>Fetal Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fhr">Fetal Heart Rate (bpm)</Label>
                <Input
                  id="fhr"
                  type="number"
                  min="100"
                  max="180"
                  value={fetalExam.fetalHeartRate}
                  onChange={(e) => setFetalExam({...fetalExam, fetalHeartRate: e.target.value})}
                  placeholder="140"
                />
              </div>
              <div>
                <Label htmlFor="fhr-rhythm">Heart Rhythm</Label>
                <Select value={fetalExam.fetalHeartRhythm} onValueChange={(value) => 
                  setFetalExam({...fetalExam, fetalHeartRhythm: value})
                }>
                  <SelectTrigger id="fhr-rhythm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="irregular">Irregular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fetal-movement">Fetal Movement</Label>
                <Select value={fetalExam.fetalMovement} onValueChange={(value) => 
                  setFetalExam({...fetalExam, fetalMovement: value})
                }>
                  <SelectTrigger id="fetal-movement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(fetalExam.fetalMovement === 'reduced' || fetalExam.fetalMovement === 'absent') && (
              <Alert className="mt-4 border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>WARNING:</strong> Reduced/absent fetal movement requires immediate assessment.
                  Consider CTG monitoring and ultrasound evaluation.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
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