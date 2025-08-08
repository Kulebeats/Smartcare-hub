import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Heart, Activity, Thermometer } from 'lucide-react';

interface RapidAssessmentProps {
  patientId: string;
  onComplete: (data: any) => void;
}

interface VitalSigns {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
}

interface RapidAssessmentData {
  vital_signs: VitalSigns;
  danger_signs: string[];
  immediate_concerns: string[];
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  requires_immediate_attention: boolean;
  assessment_complete: boolean;
}

export const RapidAssessment: React.FC<RapidAssessmentProps> = ({ patientId, onComplete }) => {
  const [assessmentData, setAssessmentData] = useState<RapidAssessmentData>({
    vital_signs: {},
    danger_signs: [],
    immediate_concerns: [],
    priority_level: 'low',
    requires_immediate_attention: false,
    assessment_complete: false
  });

  // Mock recent data for demo
  const recentData = null;

  const updateVitalSign = (key: keyof VitalSigns, value: number) => {
    setAssessmentData(prev => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [key]: value
      }
    }));
  };

  const toggleDangerSign = (sign: string) => {
    setAssessmentData(prev => ({
      ...prev,
      danger_signs: prev.danger_signs.includes(sign)
        ? prev.danger_signs.filter(s => s !== sign)
        : [...prev.danger_signs, sign]
    }));
  };

  // Calculate priority level based on vital signs and danger signs
  useEffect(() => {
    const { vital_signs, danger_signs } = assessmentData;
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    let requiresImmediate = false;

    // Check vital signs
    if (vital_signs.blood_pressure_systolic && vital_signs.blood_pressure_systolic >= 160) {
      priority = 'urgent';
      requiresImmediate = true;
    } else if (vital_signs.blood_pressure_systolic && vital_signs.blood_pressure_systolic >= 140) {
      priority = 'high';
    }

    if (vital_signs.temperature && vital_signs.temperature >= 38.0) {
      priority = priority === 'urgent' ? 'urgent' : 'high';
    }

    if (vital_signs.heart_rate && (vital_signs.heart_rate < 60 || vital_signs.heart_rate > 100)) {
      priority = priority === 'urgent' ? 'urgent' : 'medium';
    }

    // Check danger signs
    if (danger_signs.length > 0) {
      const criticalSigns = ['Severe headache', 'Blurred vision', 'Severe abdominal pain', 'Vaginal bleeding'];
      if (danger_signs.some(sign => criticalSigns.includes(sign))) {
        priority = 'urgent';
        requiresImmediate = true;
      } else {
        priority = priority === 'low' ? 'medium' : priority;
      }
    }

    setAssessmentData(prev => ({
      ...prev,
      priority_level: priority,
      requires_immediate_attention: requiresImmediate
    }));
  }, [assessmentData.vital_signs, assessmentData.danger_signs]);

  const handleComplete = () => {
    const completedAssessment = {
      ...assessmentData,
      assessment_complete: true,
      completed_at: new Date().toISOString()
    };
    
    setAssessmentData(completedAssessment);
    onComplete(completedAssessment);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const dangerSignOptions = [
    'Severe headache',
    'Blurred vision',
    'Severe abdominal pain',
    'Vaginal bleeding',
    'Fever',
    'Severe vomiting',
    'Reduced fetal movement',
    'Swelling of face and hands',
    'Difficulty breathing',
    'Convulsions'
  ];

  return (
    <div className="space-y-6">
      {/* Priority Level Display */}
      <div className={`p-4 rounded-lg border-2 ${getPriorityColor(assessmentData.priority_level)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {assessmentData.requires_immediate_attention ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span className="font-medium">
              Priority Level: {assessmentData.priority_level.toUpperCase()}
            </span>
          </div>
          {assessmentData.requires_immediate_attention && (
            <Badge variant="destructive">IMMEDIATE ATTENTION REQUIRED</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Vital Signs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Systolic BP</label>
                <input
                  type="number"
                  placeholder="120"
                  className="w-full border rounded p-2"
                  onChange={(e) => updateVitalSign('blood_pressure_systolic', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Diastolic BP</label>
                <input
                  type="number"
                  placeholder="80"
                  className="w-full border rounded p-2"
                  onChange={(e) => updateVitalSign('blood_pressure_diastolic', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>Heart Rate (bpm)</span>
                </label>
                <input
                  type="number"
                  placeholder="70"
                  className="w-full border rounded p-2"
                  onChange={(e) => updateVitalSign('heart_rate', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center space-x-1">
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature (°C)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  className="w-full border rounded p-2"
                  onChange={(e) => updateVitalSign('temperature', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Respiratory Rate (per min)</label>
              <input
                type="number"
                placeholder="16"
                className="w-full border rounded p-2"
                onChange={(e) => updateVitalSign('respiratory_rate', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Signs Check</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">Select any danger signs present:</p>
              {dangerSignOptions.map(sign => (
                <label key={sign} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={assessmentData.danger_signs.includes(sign)}
                    onChange={() => toggleDangerSign(sign)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{sign}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Rapid Assessment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Danger Signs Detected:</span>
              <span>{assessmentData.danger_signs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Vital Signs Concerns:</span>
              <span>
                {Object.keys(assessmentData.vital_signs).length > 0 
                  ? `${Object.keys(assessmentData.vital_signs).length} recorded`
                  : 'None recorded'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Priority Level:</span>
              <Badge className={getPriorityColor(assessmentData.priority_level)}>
                {assessmentData.priority_level.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              onClick={handleComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Complete Rapid Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};