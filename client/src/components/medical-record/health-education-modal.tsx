import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Utensils, Activity, Baby, Shield, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EducationTopic {
  id: string;
  category: string;
  topic: string;
  completed: boolean;
  dateCompleted?: string;
  importance: 'high' | 'medium' | 'low';
}

interface HealthEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function HealthEducationModal({ isOpen, onClose, onSave, initialData }: HealthEducationModalProps) {
  const [nutritionTopics, setNutritionTopics] = useState<EducationTopic[]>([
    {
      id: 'n1',
      category: 'nutrition',
      topic: 'Iron-rich foods and anemia prevention',
      completed: false,
      importance: 'high'
    },
    {
      id: 'n2',
      category: 'nutrition',
      topic: 'Folic acid supplementation importance',
      completed: false,
      importance: 'high'
    },
    {
      id: 'n3',
      category: 'nutrition',
      topic: 'Calcium-rich foods for bone health',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'n4',
      category: 'nutrition',
      topic: 'Balanced diet during pregnancy',
      completed: false,
      importance: 'high'
    },
    {
      id: 'n5',
      category: 'nutrition',
      topic: 'Foods to avoid during pregnancy',
      completed: false,
      importance: 'high'
    },
    {
      id: 'n6',
      category: 'nutrition',
      topic: 'Hydration and fluid intake',
      completed: false,
      importance: 'medium'
    }
  ]);

  const [lifestyleTopics, setLifestyleTopics] = useState<EducationTopic[]>([
    {
      id: 'l1',
      category: 'lifestyle',
      topic: 'Smoking cessation counseling',
      completed: false,
      importance: 'high'
    },
    {
      id: 'l2',
      category: 'lifestyle',
      topic: 'Alcohol avoidance during pregnancy',
      completed: false,
      importance: 'high'
    },
    {
      id: 'l3',
      category: 'lifestyle',
      topic: 'Safe exercise during pregnancy',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'l4',
      category: 'lifestyle',
      topic: 'Sleep hygiene and rest',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'l5',
      category: 'lifestyle',
      topic: 'Stress management techniques',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'l6',
      category: 'lifestyle',
      topic: 'Work and environmental safety',
      completed: false,
      importance: 'medium'
    }
  ]);

  const [pregnancyTopics, setPregnancyTopics] = useState<EducationTopic[]>([
    {
      id: 'p1',
      category: 'pregnancy',
      topic: 'Danger signs during pregnancy',
      completed: false,
      importance: 'high'
    },
    {
      id: 'p2',
      category: 'pregnancy',
      topic: 'Normal pregnancy changes',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'p3',
      category: 'pregnancy',
      topic: 'Fetal movement monitoring',
      completed: false,
      importance: 'high'
    },
    {
      id: 'p4',
      category: 'pregnancy',
      topic: 'Birth preparedness planning',
      completed: false,
      importance: 'high'
    },
    {
      id: 'p5',
      category: 'pregnancy',
      topic: 'Labor and delivery signs',
      completed: false,
      importance: 'high'
    },
    {
      id: 'p6',
      category: 'pregnancy',
      topic: 'Postnatal care importance',
      completed: false,
      importance: 'high'
    }
  ]);

  const [preventionTopics, setPreventionTopics] = useState<EducationTopic[]>([
    {
      id: 'pr1',
      category: 'prevention',
      topic: 'HIV prevention and testing',
      completed: false,
      importance: 'high'
    },
    {
      id: 'pr2',
      category: 'prevention',
      topic: 'Malaria prevention (ITN use)',
      completed: false,
      importance: 'high'
    },
    {
      id: 'pr3',
      category: 'prevention',
      topic: 'Infection prevention practices',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'pr4',
      category: 'prevention',
      topic: 'Vaccination importance',
      completed: false,
      importance: 'high'
    },
    {
      id: 'pr5',
      category: 'prevention',
      topic: 'Family planning counseling',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'pr6',
      category: 'prevention',
      topic: 'Partner involvement in care',
      completed: false,
      importance: 'medium'
    }
  ]);

  const [familyPlanningTopics, setFamilyPlanningTopics] = useState<EducationTopic[]>([
    {
      id: 'fp1',
      category: 'family_planning',
      topic: 'Postpartum family planning discussed',
      completed: false,
      importance: 'high'
    },
    {
      id: 'fp2',
      category: 'family_planning',
      topic: 'Condoms education',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'fp3',
      category: 'family_planning',
      topic: 'Oral contraceptive pills',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'fp4',
      category: 'family_planning',
      topic: 'Injectable contraceptives',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'fp5',
      category: 'family_planning',
      topic: 'IUD education',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'fp6',
      category: 'family_planning',
      topic: 'Contraceptive implant',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'fp7',
      category: 'family_planning',
      topic: 'Natural family planning methods',
      completed: false,
      importance: 'medium'
    },
    {
      id: 'fp8',
      category: 'family_planning',
      topic: 'Minimum 24 months birth spacing',
      completed: false,
      importance: 'high'
    },
    {
      id: 'fp9',
      category: 'family_planning',
      topic: 'Benefits of birth spacing',
      completed: false,
      importance: 'high'
    }
  ]);

  // Section notes state
  const [nutritionNotes, setNutritionNotes] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [pregnancyNotes, setPregnancyNotes] = useState('');
  const [preventionNotes, setPreventionNotes] = useState('');
  const [familyPlanningNotes, setFamilyPlanningNotes] = useState('');

  const [breastfeedingTopics, setBreastfeedingTopics] = useState<EducationTopic[]>([
    {
      id: 'bf1',
      category: 'breastfeeding',
      topic: 'Benefits of breastfeeding',
      completed: false,
      importance: 'high'
    },
    {
      id: 'bf2',
      category: 'breastfeeding',
      topic: 'Early initiation (within 1 hour)',
      completed: false,
      importance: 'high'
    },
    {
      id: 'bf3',
      category: 'breastfeeding',
      topic: 'Exclusive breastfeeding (6 months)',
      completed: false,
      importance: 'high'
    },
    {
      id: 'bf4',
      category: 'breastfeeding',
      topic: 'Proper positioning & attachment',
      completed: false,
      importance: 'high'
    },
    {
      id: 'bf5',
      category: 'breastfeeding',
      topic: 'Hygiene & cord care',
      completed: false,
      importance: 'high'
    },
    {
      id: 'bf6',
      category: 'breastfeeding',
      topic: 'Keeping baby warm',
      completed: false,
      importance: 'high'
    },
    {
      id: 'bf7',
      category: 'breastfeeding',
      topic: 'Newborn danger signs',
      completed: false,
      importance: 'high'
    },
    {
      id: 'bf8',
      category: 'breastfeeding',
      topic: 'Immunization schedule',
      completed: false,
      importance: 'medium'
    }
  ]);

  const [breastfeedingNotes, setBreastfeedingNotes] = useState('');

  const updateTopic = (topicId: string, field: string, value: any, category: string) => {
    const updateFunction = {
      nutrition: setNutritionTopics,
      lifestyle: setLifestyleTopics,
      pregnancy: setPregnancyTopics,
      prevention: setPreventionTopics,
      family_planning: setFamilyPlanningTopics,
      breastfeeding: setBreastfeedingTopics
    }[category];

    const currentTopics = {
      nutrition: nutritionTopics,
      lifestyle: lifestyleTopics,
      pregnancy: pregnancyTopics,
      prevention: preventionTopics,
      family_planning: familyPlanningTopics,
      breastfeeding: breastfeedingTopics
    }[category];

    if (updateFunction && currentTopics) {
      updateFunction(currentTopics.map(topic => 
        topic.id === topicId 
          ? { 
              ...topic, 
              [field]: value,
              dateCompleted: field === 'completed' && value ? new Date().toISOString().split('T')[0] : topic.dateCompleted
            }
          : topic
      ));
    }
  };

  // Handle "All" selection for each category
  const handleSelectAll = (category: string, checked: boolean) => {
    const updateFunction = {
      nutrition: setNutritionTopics,
      lifestyle: setLifestyleTopics,
      pregnancy: setPregnancyTopics,
      prevention: setPreventionTopics,
      family_planning: setFamilyPlanningTopics,
      breastfeeding: setBreastfeedingTopics
    }[category];

    const currentTopics = {
      nutrition: nutritionTopics,
      lifestyle: lifestyleTopics,
      pregnancy: pregnancyTopics,
      prevention: preventionTopics,
      family_planning: familyPlanningTopics,
      breastfeeding: breastfeedingTopics
    }[category];

    if (updateFunction && currentTopics) {
      updateFunction(currentTopics.map(topic => ({
        ...topic,
        completed: checked,
        dateCompleted: checked ? new Date().toISOString().split('T')[0] : undefined
      })));
    }
  };

  // Check if all topics in a category are selected
  const isAllSelected = (category: string) => {
    const currentTopics = {
      nutrition: nutritionTopics,
      lifestyle: lifestyleTopics,
      pregnancy: pregnancyTopics,
      prevention: preventionTopics,
      family_planning: familyPlanningTopics,
      breastfeeding: breastfeedingTopics
    }[category];

    return currentTopics ? currentTopics.every(topic => topic.completed) : false;
  };

  const handleSave = () => {
    const educationData = {
      nutritionTopics,
      lifestyleTopics,
      pregnancyTopics,
      preventionTopics,
      familyPlanningTopics,
      breastfeedingTopics,
      nutritionNotes,
      lifestyleNotes,
      pregnancyNotes,
      preventionNotes,
      familyPlanningNotes,
      breastfeedingNotes,
      lastUpdated: new Date().toISOString()
    };

    onSave(educationData);
    toast({
      title: "Health Education Saved",
      description: "All health education and counseling records have been saved successfully.",
    });
    onClose();
  };

  const TopicCheckboxGrid = ({ topics, category }: { topics: EducationTopic[]; category: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {/* All option */}
      <label className="flex items-center space-x-3 p-4 border-2 rounded-lg bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={isAllSelected(category)}
          onChange={(e) => handleSelectAll(category, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
        />
        <span className="text-sm font-semibold text-blue-700">Select All</span>
      </label>

      {/* Individual topics */}
      {topics.map(topic => (
        <label key={topic.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200">
          <input
            type="checkbox"
            checked={topic.completed}
            onChange={(e) => updateTopic(topic.id, 'completed', e.target.checked, category)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <div className="flex items-center justify-between flex-1">
            <span className={`text-sm leading-5 ${topic.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {topic.topic}
            </span>
            {topic.completed && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />}
          </div>
        </label>
      ))}
    </div>
  );

  const SectionCard = ({ 
    title, 
    icon, 
    description, 
    topics, 
    category, 
    bgColor, 
    borderColor, 
    textColor,
    notes,
    setNotes 
  }: {
    title: string;
    icon: React.ReactNode;
    description: string;
    topics: EducationTopic[];
    category: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    notes: string;
    setNotes: (notes: string) => void;
  }) => (
    <div className="mb-8">
      <div className={`${bgColor} ${borderColor} rounded-lg p-4 mb-4 border-l-4`}>
        <h3 className={`font-medium ${textColor} mb-2 flex items-center`}>
          {icon}
          {title}
        </h3>
        <p className={`text-sm ${textColor.replace('900', '700')}`}>
          {description}
        </p>
      </div>

      <TopicCheckboxGrid topics={topics} category={category} />

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {title} Notes & Counseling Summary
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Add comprehensive notes for ${title.toLowerCase()}, patient response, counseling provided, and follow-up plans...`}
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Health Education & Lifestyle Counseling
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nutrition Section */}
          <SectionCard
            title="Nutritional Counseling"
            icon={<Utensils className="w-4 h-4 mr-2" />}
            description="Essential nutrition education for optimal maternal and fetal health during pregnancy."
            topics={nutritionTopics}
            category="nutrition"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            textColor="text-green-900"
            notes={nutritionNotes}
            setNotes={setNutritionNotes}
          />

          {/* Lifestyle Section */}
          <SectionCard
            title="Lifestyle Counseling"
            icon={<Activity className="w-4 h-4 mr-2" />}
            description="Guidance on healthy lifestyle choices and behavior modification during pregnancy."
            topics={lifestyleTopics}
            category="lifestyle"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            textColor="text-blue-900"
            notes={lifestyleNotes}
            setNotes={setLifestyleNotes}
          />

          {/* Pregnancy Section */}
          <SectionCard
            title="Pregnancy Education"
            icon={<Baby className="w-4 h-4 mr-2" />}
            description="Comprehensive education about pregnancy stages, fetal development, and birth preparation."
            topics={pregnancyTopics}
            category="pregnancy"
            bgColor="bg-pink-50"
            borderColor="border-pink-200"
            textColor="text-pink-900"
            notes={pregnancyNotes}
            setNotes={setPregnancyNotes}
          />

          {/* Prevention Section */}
          <SectionCard
            title="Prevention & Health Protection"
            icon={<Shield className="w-4 h-4 mr-2" />}
            description="Disease prevention strategies and protective health measures for mother and baby."
            topics={preventionTopics}
            category="prevention"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            textColor="text-purple-900"
            notes={preventionNotes}
            setNotes={setPreventionNotes}
          />

          {/* Family Planning Section */}
          <SectionCard
            title="Family Planning & Contraceptive Counseling"
            icon={<Baby className="w-4 h-4 mr-2" />}
            description="Comprehensive family planning education, contraceptive methods, and birth spacing counseling."
            topics={familyPlanningTopics}
            category="family_planning"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            textColor="text-orange-900"
            notes={familyPlanningNotes}
            setNotes={setFamilyPlanningNotes}
          />

          {/* Breastfeeding & Newborn Care Section */}
          <SectionCard
            title="Breastfeeding & Newborn Care Education"
            icon={<Baby className="w-4 h-4 mr-2" />}
            description="Essential breastfeeding techniques, newborn care practices, and early childhood health education."
            topics={breastfeedingTopics}
            category="breastfeeding"
            bgColor="bg-teal-50"
            borderColor="border-teal-200"
            textColor="text-teal-900"
            notes={breastfeedingNotes}
            setNotes={setBreastfeedingNotes}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6 py-2"
          >
            Close
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6 py-2"
          >Save </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}