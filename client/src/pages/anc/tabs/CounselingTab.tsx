/**
 * Counseling Tab Component
 * Handles health education, counseling topics, and patient education
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Info, CheckCircle, Heart, Baby, Apple, Shield } from 'lucide-react';
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { safeLog } from '@/utils/anc/safe-logger';

interface CounselingTabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
  onBack?: () => void;
}

interface CounselingTopic {
  id: string;
  category: string;
  title: string;
  description: string;
  trimesterSpecific?: number[];
  icon?: React.ElementType;
  keyPoints: string[];
}

const COUNSELING_TOPICS: CounselingTopic[] = [
  // Nutrition Counseling
  {
    id: 'nutrition_basics',
    category: 'Nutrition',
    title: 'Basic Nutrition in Pregnancy',
    description: 'Balanced diet, food groups, and healthy eating habits',
    icon: Apple,
    keyPoints: [
      'Eat variety of foods from all food groups',
      'Take folic acid and iron supplements as prescribed',
      'Avoid alcohol and limit caffeine',
      'Stay hydrated - drink plenty of water'
    ]
  },
  {
    id: 'weight_gain',
    category: 'Nutrition',
    title: 'Healthy Weight Gain',
    description: 'Expected weight gain during pregnancy',
    keyPoints: [
      'Normal BMI: 11-16 kg total gain',
      'Underweight: 12-18 kg total gain',
      'Overweight: 7-11 kg total gain',
      'Twin pregnancy: 16-20 kg total gain'
    ]
  },
  
  // Danger Signs Education
  {
    id: 'danger_signs',
    category: 'Safety',
    title: 'Danger Signs in Pregnancy',
    description: 'When to seek immediate medical care',
    icon: Shield,
    trimesterSpecific: [1, 2, 3],
    keyPoints: [
      'Vaginal bleeding',
      'Severe headache with blurred vision',
      'Fever and too weak to get out of bed',
      'Severe abdominal pain',
      'Fast or difficult breathing',
      'Reduced or no fetal movements'
    ]
  },
  
  // Birth Preparedness
  {
    id: 'birth_plan',
    category: 'Birth Preparedness',
    title: 'Birth Preparedness Plan',
    description: 'Planning for delivery and emergencies',
    icon: Baby,
    trimesterSpecific: [2, 3],
    keyPoints: [
      'Identify place of delivery and skilled attendant',
      'Arrange transportation to health facility',
      'Save money for delivery and emergencies',
      'Identify blood donor if needed',
      'Prepare essential items for mother and baby'
    ]
  },
  {
    id: 'labor_signs',
    category: 'Birth Preparedness',
    title: 'Signs of Labor',
    description: 'Recognizing when labor begins',
    trimesterSpecific: [3],
    keyPoints: [
      'Regular contractions that increase in intensity',
      'Lower back pain that comes and goes',
      'Water breaking (rupture of membranes)',
      'Blood-tinged mucus discharge (show)'
    ]
  },
  
  // Breastfeeding
  {
    id: 'breastfeeding',
    category: 'Infant Care',
    title: 'Exclusive Breastfeeding',
    description: 'Benefits and techniques of breastfeeding',
    icon: Heart,
    keyPoints: [
      'Exclusive breastfeeding for first 6 months',
      'Benefits for baby: immunity, nutrition, bonding',
      'Benefits for mother: faster recovery, reduced bleeding',
      'Proper positioning and latching techniques',
      'Feed on demand, at least 8-12 times per day'
    ]
  },
  
  // Family Planning
  {
    id: 'family_planning',
    category: 'Family Planning',
    title: 'Postpartum Family Planning',
    description: 'Contraception options after delivery',
    trimesterSpecific: [3],
    keyPoints: [
      'Discuss spacing of pregnancies',
      'Available methods: pills, injections, implants, IUDs',
      'Lactational amenorrhea method (LAM)',
      'When to start contraception after delivery'
    ]
  },
  
  // HIV/PMTCT
  {
    id: 'pmtct',
    category: 'PMTCT',
    title: 'Prevention of Mother-to-Child Transmission',
    description: 'HIV prevention and treatment adherence',
    keyPoints: [
      'Importance of HIV testing for both partners',
      'Adherence to ART if HIV positive',
      'Safe delivery practices',
      'Infant feeding counseling',
      'Early infant diagnosis'
    ]
  },
  
  // Lifestyle
  {
    id: 'exercise',
    category: 'Lifestyle',
    title: 'Exercise and Activity',
    description: 'Safe physical activity during pregnancy',
    keyPoints: [
      'Regular moderate exercise is beneficial',
      'Walking, swimming, prenatal yoga recommended',
      'Avoid contact sports and high-risk activities',
      'Stop if experiencing pain, bleeding, or dizziness'
    ]
  },
  {
    id: 'hygiene',
    category: 'Lifestyle',
    title: 'Personal Hygiene',
    description: 'Maintaining good hygiene during pregnancy',
    keyPoints: [
      'Regular hand washing',
      'Dental hygiene - brush twice daily',
      'Safe food handling and preparation',
      'Avoid exposure to harmful chemicals'
    ]
  }
];

export const CounselingTab: React.FC<CounselingTabProps> = ({
  patientId,
  encounterId,
  onNext,
  onBack
}) => {
  const {
    state,
    saveEncounter,
    currentTrimester
  } = useAncEncounter({ patientId, encounterId });
  
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [topicNotes, setTopicNotes] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [patientQuestions, setPatientQuestions] = useState('');
  
  const handleTopicToggle = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };
  
  const handleTopicNoteChange = (topicId: string, note: string) => {
    setTopicNotes(prev => ({
      ...prev,
      [topicId]: note
    }));
  };
  
  const getRelevantTopics = () => {
    return COUNSELING_TOPICS.filter(topic => {
      if (!topic.trimesterSpecific) return true;
      if (!currentTrimester) return true;
      return topic.trimesterSpecific.includes(currentTrimester);
    });
  };
  
  const getTopicsByCategory = (category: string) => {
    return getRelevantTopics().filter(topic => topic.category === category);
  };
  
  const categories = [...new Set(getRelevantTopics().map(t => t.category))];
  
  const handleSaveAndNext = async () => {
    const counselingData = {
      topicsCovered: Array.from(selectedTopics),
      topicNotes,
      additionalNotes,
      patientQuestions,
      sessionDate: new Date().toISOString()
    };
    
    safeLog.clinical('Counseling session completed', {
      patientId,
      encounterId,
      topicsCount: selectedTopics.size,
      hasQuestions: !!patientQuestions
    });
    
    const result = await saveEncounter();
    if (result.success) {
      onNext?.();
    }
  };
  
  // Determine required topics based on trimester and conditions
  const requiredTopics = [];
  if (currentTrimester === 1) {
    requiredTopics.push('danger_signs', 'nutrition_basics');
  } else if (currentTrimester === 2) {
    requiredTopics.push('danger_signs', 'birth_plan');
  } else if (currentTrimester === 3) {
    requiredTopics.push('labor_signs', 'breastfeeding', 'family_planning');
  }
  
  const missingRequired = requiredTopics.filter(id => !selectedTopics.has(id))
    .map(id => COUNSELING_TOPICS.find(t => t.id === id)?.title)
    .filter(Boolean);
  
  return (
    <div className="space-y-6">
      {/* Required Topics Alert */}
      {missingRequired.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Recommended topics for trimester {currentTrimester}:</strong>
            <ul className="mt-2 list-disc list-inside text-sm">
              {missingRequired.map(topic => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Counseling Topics by Category */}
      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>{category}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTopicsByCategory(category).map(topic => {
                const Icon = topic.icon || MessageSquare;
                const isSelected = selectedTopics.has(topic.id);
                
                return (
                  <div 
                    key={topic.id} 
                    className={`border rounded-lg p-4 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={topic.id}
                        checked={isSelected}
                        onCheckedChange={() => handleTopicToggle(topic.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={topic.id} className="flex items-center space-x-2 mb-1">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">{topic.title}</span>
                          {requiredTopics.includes(topic.id) && (
                            <span className="text-xs text-orange-600 font-semibold">
                              [RECOMMENDED]
                            </span>
                          )}
                        </Label>
                        <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                        
                        {isSelected && (
                          <>
                            <div className="bg-white rounded p-3 mb-3">
                              <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                Key Points to Cover:
                              </h5>
                              <ul className="text-xs space-y-1">
                                {topic.keyPoints.map((point, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Additional Notes</Label>
                              <Textarea
                                value={topicNotes[topic.id] || ''}
                                onChange={(e) => handleTopicNoteChange(topic.id, e.target.value)}
                                placeholder="Patient's understanding, concerns, or specific advice given..."
                                className="mt-1 h-20"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Patient Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Questions & Concerns</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={patientQuestions}
            onChange={(e) => setPatientQuestions(e.target.value)}
            placeholder="Document any questions or concerns raised by the patient..."
            className="h-24"
          />
        </CardContent>
      </Card>
      
      {/* Additional Counseling Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Counseling Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any other counseling provided or observations..."
            className="h-24"
          />
        </CardContent>
      </Card>
      
      {/* Summary */}
      <Card className="bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-green-800">
                Counseling Session Summary
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedTopics.size} topics covered • 
                {currentTrimester && ` Trimester ${currentTrimester}`}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
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