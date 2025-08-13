import { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ChevronRight, Stethoscope, AlertTriangle, Shield, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  evaluateIPVRisk, 
  generateIPVRecommendations, 
  requiresImmediateIntervention,
  getIPVAlertStyling,
  type IPVRiskAssessment 
} from "@/lib/ipv-decision-support";
import IPVEnhancedAssessmentModal, { type EnhancedIPVAssessmentData } from './ipv-enhanced-assessment-modal';

interface PreviousRecommendations {
  penicillin?: boolean;
  calcium?: boolean;
  aspirin?: boolean;
  iron_folic_acid?: boolean;
}

interface AssessmentData {
  medications: {
    penicillin?: string;
    calcium?: string;
    calcium_side_effects?: string;
    aspirin?: string;
    iron_folic_acid?: string;
    iron_side_effects?: string;
    other_medications?: string[];
  };
  previousBehaviors: {
    persisted_behaviors?: string[];
    persisted_physiological_symptoms?: string[];
    persisted_other_symptoms?: string[];
  };
  currentSymptoms: {
    physiological_symptoms?: string[];
    other_symptoms?: string[];
  };
  ipvScreening: {
    signs_symptoms?: string[];
  };
  fetalMovement: {
    movement_status?: string;
  };
}

interface StandardANCAssessmentProps {
  patientId: string;
  onSave?: (data: any) => void;
  isFollowupVisit?: boolean;
  visitNumber?: number;
  hideCard?: boolean;
}

export const StandardANCAssessment: React.FC<StandardANCAssessmentProps> = ({ 
  patientId, 
  onSave,
  isFollowupVisit = false, 
  visitNumber: propVisitNumber,
  hideCard = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    medications: {},
    previousBehaviors: {},
    currentSymptoms: {},
    ipvScreening: {},
    fetalMovement: {}
  });
  
  const [previousRecommendations, setPreviousRecommendations] = useState<PreviousRecommendations>({});

  // Mock ANC records for demo
  const ancRecords = {
    records: [
      {
        id: '1',
        created_at: '2024-12-15T10:00:00Z',
        recommendations: ['Iron supplementation', 'Calcium supplementation'],
        medications: {
          iron_folic_acid: true,
          calcium: true
        }
      }
    ]
  };

  // Calculate visit number based on existing ANC records or use prop
  const visitNumber = propVisitNumber || (ancRecords?.records ? ancRecords.records.length + 1 : 1);

  useEffect(() => {
    // Initialize static previous recommendations once
    const recommendations: PreviousRecommendations = {
      iron_folic_acid: true,
      calcium: true,
      penicillin: false,
      aspirin: false
    };
    setPreviousRecommendations(recommendations);
  }, []); // Empty dependency array to run only once

  const updateAssessmentData = useCallback((section: keyof AssessmentData, data: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  const getCompletionStatus = () => {
    const sections = Object.values(assessmentData);
    const completedSections = sections.filter(section => 
      Object.keys(section).length > 0
    ).length;
    return `${completedSections}/${sections.length}`;
  };

  const handleSave = () => {
    console.log('Saving Standard ANC Assessment data:', assessmentData);
    if (onSave) {
      onSave(assessmentData);
    }
    // Optional: Show success message or close modal
  };

  if (hideCard) {
    // Render assessment content directly without card wrapper or modal
    return (
      <div className="space-y-8">
        {/* Medications Section */}
        <MedicationsSection 
          data={assessmentData.medications}
          onChange={(data) => updateAssessmentData('medications', data)}
          previousRecommendations={previousRecommendations}
        />

        {/* Current Symptoms Section */}
        <CurrentSymptomsSection
          data={assessmentData.currentSymptoms}
          onChange={(data) => updateAssessmentData('currentSymptoms', data)}
        />

        {/* Previous Behaviors Section - Only show in subsequent visits */}
        {(visitNumber > 1 || isFollowupVisit) && (
          <PreviousBehaviorsSection
            data={assessmentData.previousBehaviors}
            onChange={(data) => updateAssessmentData('previousBehaviors', data)}
          />
        )}

        {/* Combined Persisted Symptoms Section - Only show in subsequent visits */}
        {(visitNumber > 1 || isFollowupVisit) && (
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Symptom Persistence Assessment</h3>
            <CombinedSymptomsSection 
              data={assessmentData.previousBehaviors}
              onChange={(data) => updateAssessmentData('previousBehaviors', data)}
            />
          </div>
        )}

        {/* IPV Screening Section */}
        <IPVScreeningSection
          data={assessmentData.ipvScreening}
          onChange={(data) => updateAssessmentData('ipvScreening', data)}
        />

        {/* Fetal Movement Section */}
        <FetalMovementSection
          data={assessmentData.fetalMovement}
          onChange={(data) => updateAssessmentData('fetalMovement', data)}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            variant="outline" 
            className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </Button>
          <Button 
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
            onClick={handleSave}
          >
            Save Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50" 
          onClick={() => setIsModalOpen(true)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <span>Standard ANC Assessment</span>
              <span className="text-sm text-gray-500">({getCompletionStatus()} sections completed)</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Standard ANC Assessment"
        className="bg-white/85 backdrop-blur-2xl border border-white/30 ring-1 ring-white/20 shadow-xl rounded-2xl max-w-3xl max-h-[85vh] overflow-y-auto"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.80) 100%)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.08)'
        }}
      >
        <div className="space-y-6">
          {/* Medications Section */}
          <MedicationsSection 
            data={assessmentData.medications}
            onChange={(data) => updateAssessmentData('medications', data)}
            previousRecommendations={previousRecommendations}
          />

          {/* Current Symptoms Section */}
          <CurrentSymptomsSection
            data={assessmentData.currentSymptoms}
            onChange={(data) => updateAssessmentData('currentSymptoms', data)}
          />

          {/* Previous Behaviors Section - Only show in subsequent visits */}
          {(visitNumber > 1 || isFollowupVisit) && (
            <PreviousBehaviorsSection
              data={assessmentData.previousBehaviors}
              onChange={(data) => updateAssessmentData('previousBehaviors', data)}
            />
          )}

          {/* Combined Persisted Symptoms Section - Only show in subsequent visits */}
          {(visitNumber > 1 || isFollowupVisit) && (
            <div className="border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl mb-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-4" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Symptom Persistence Assessment</h3>
              <CombinedSymptomsSection 
                data={assessmentData.previousBehaviors}
                onChange={(data) => updateAssessmentData('previousBehaviors', data)}
              />
            </div>
          )}

          {/* IPV Screening Section */}
          <IPVScreeningSection
            data={assessmentData.ipvScreening}
            onChange={(data) => updateAssessmentData('ipvScreening', data)}
          />

          {/* Fetal Movement Section */}
          <FetalMovementSection
            data={assessmentData.fetalMovement}
            onChange={(data) => updateAssessmentData('fetalMovement', data)}
          />
        </div>
      </Modal>
    </>
  );
};

interface SectionProps {
  data: any;
  onChange: (data: any) => void;
}

interface MedicationsSectionProps extends SectionProps {
  previousRecommendations: PreviousRecommendations;
}

const MedicationsSection: React.FC<MedicationsSectionProps> = ({ data, onChange, previousRecommendations }) => {
  const [selectedMedications, setSelectedMedications] = useState<string[]>(data.other_medications || []);
  const [otherMedication, setOtherMedication] = useState<string>("");

  const medicationOptions = [
    'None', 'Antacids', 'Aspirin', 'Calcium', 'Doxylamine',
    'Folic Acid', 'Iron', 'Magnesium', 'Metoclopramide', 'Vitamin A',
    'Analgesic', 'Anti-convulsive', 'Anti-diabetic', 'Anthelmintic',
    'Anti-hypertensive', 'Anti-malaria', 'Antivirals', 'Other'
  ];

  const handleMedicationSelect = (medication: string) => {
    let newMedications;
    
    if (medication === "None") {
      // If "None" is selected, clear all other selections
      newMedications = ["None"];
      setOtherMedication("");
    } else if (!selectedMedications.includes("None")) {
      // Only add other options if "None" is not already selected
      newMedications = [...selectedMedications, medication];
    } else {
      return; // Don't add if None is selected
    }
    
    setSelectedMedications(newMedications);
    onChange({ other_medications: newMedications });
  };

  const handleMedicationRemove = (medication: string) => {
    const newMedications = selectedMedications.filter(m => m !== medication);
    setSelectedMedications(newMedications);
    onChange({ other_medications: newMedications });
    
    if (medication === "Other") {
      setOtherMedication("");
    }
  };

  return (
    <div className="border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl mb-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-4" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Medications & Supplements</h3>
      
      <div className="space-y-4">
        {/* Current Medications - Multi-select dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">
            What medications (including supplements and vitamins) is she still taking?
          </label>
          
          {/* Multi-select dropdown with improved visibility */}
          <div className="relative">
            <select 
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-base appearance-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none min-h-[44px]"
              onChange={(e) => {
                const value = e.target.value;
                if (value && !selectedMedications.includes(value)) {
                  handleMedicationSelect(value);
                }
                e.target.value = ""; // Reset dropdown
              }}
              style={{ minHeight: '44px' }}
            >
              <option value="" className="text-gray-500">Select medications...</option>
              {medicationOptions
                .filter(option => {
                  // Don't show options that are already selected
                  if (selectedMedications.includes(option)) return false;
                  // If "None" is selected, don't show other options
                  if (selectedMedications.includes("None") && option !== "None") return false;
                  // If other options are selected, don't show "None"
                  if (selectedMedications.length > 0 && !selectedMedications.includes("None") && option === "None") return false;
                  return true;
                })
                .map((option) => (
                  <option key={option} value={option} className="py-2 px-3 text-base">{option}</option>
                ))
              }
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-5 h-5 fill-current text-gray-600" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>

          {/* Selected medications displayed as tags */}
          {selectedMedications.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedMedications.map((medication, index) => (
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>{medication}</span>
                  <button
                    type="button"
                    onClick={() => handleMedicationRemove(medication)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Conditional text box for "Other" */}
          {selectedMedications.includes("Other") && (
            <div className="mt-3">
              <textarea
                placeholder="Please specify other medications..."
                value={otherMedication}
                onChange={(e) => setOtherMedication(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Penicillin Treatment - Only show if previously recommended */}
        {previousRecommendations.penicillin && (
          <div>
            <label className="block text-sm font-medium mb-2">Is she taking her penicillin treatment?</label>
            <div className="flex space-x-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="penicillin"
                    value={option}
                    checked={data.penicillin === option}
                    onChange={(e) => onChange({ penicillin: e.target.value })}
                    className="border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Calcium Supplements - Only show if previously recommended */}
        {previousRecommendations.calcium && (
          <div>
            <label className="block text-sm font-medium mb-2">Is she taking her calcium supplements?</label>
            <div className="flex space-x-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="calcium"
                    value={option}
                    checked={data.calcium === option}
                    onChange={(e) => onChange({ calcium: e.target.value })}
                    className="border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Calcium Side Effects - Only show if taking calcium */}
        {previousRecommendations.calcium && data.calcium === 'Yes' && (
          <div>
            <label className="block text-sm font-medium mb-2">Any calcium supplements side effects?</label>
            <div className="flex space-x-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="calcium_side_effects"
                    value={option}
                    checked={data.calcium_side_effects === option}
                    onChange={(e) => onChange({ calcium_side_effects: e.target.value })}
                    className="border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Aspirin - Only show if previously recommended */}
        {previousRecommendations.aspirin && (
          <div>
            <label className="block text-sm font-medium mb-2">Is she taking aspirin?</label>
            <div className="flex space-x-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="aspirin"
                    value={option}
                    checked={data.aspirin === option}
                    onChange={(e) => onChange({ aspirin: e.target.value })}
                    className="border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Iron and Folic Acid - Only show if previously recommended */}
        {previousRecommendations.iron_folic_acid && (
          <div>
            <label className="block text-sm font-medium mb-2">Is she taking Iron and folic acid (IFA) tablets?</label>
            <div className="flex space-x-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="iron_folic_acid"
                    value={option}
                    checked={data.iron_folic_acid === option}
                    onChange={(e) => onChange({ iron_folic_acid: e.target.value })}
                    className="border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Iron Side Effects - Only show if taking iron and folic acid */}
        {previousRecommendations.iron_folic_acid && data.iron_folic_acid === 'Yes' && (
          <div>
            <label className="block text-sm font-medium mb-2">Any iron and folic acid side effects?</label>
            <div className="flex space-x-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="iron_side_effects"
                    value={option}
                    checked={data.iron_side_effects === option}
                    onChange={(e) => onChange({ iron_side_effects: e.target.value })}
                    className="border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Combined Symptoms Section - handles both physiological and other symptoms persistence
const CombinedSymptomsSection: React.FC<SectionProps> = ({ data, onChange }) => {
  const [initialSymptoms, setInitialSymptoms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized fetch function to prevent recreation
  const fetchInitialSymptoms = useCallback(async () => {
    try {
      const response = await fetch('/api/patients/demo-patient-123/anc/records');
      const records = await response.json();
      
      if (records && records.length > 0) {
        const firstContact = records.find((record: any) => 
          record.contact_number === 1 || 
          record.visit_type === 'initial' ||
          records.indexOf(record) === 0
        ) || records[0];
        
        const symptoms: string[] = [];
        
        // Define all possible symptoms from both categories
        const physiologicalSymptoms = [
          'Leg cramps', 'Nausea and vomiting', 'Heartburn', 
          'Constipation', 'Low back pain', 'Pelvic pain'
        ];
        
        const otherSymptoms = [
          'Gets tired easily', 'Breathing difficulty', 
          'Breathless during routine activities'
        ];
        
        const allSymptoms = [...physiologicalSymptoms, ...otherSymptoms];
        
        // Check various data sources for initial symptom reporting
        const checkSymptomData = (data: any) => {
          if (!data) return;
          
          // Check for any physiological symptoms
          if (data.physiological_symptoms && Array.isArray(data.physiological_symptoms)) {
            data.physiological_symptoms.forEach((symptom: string) => {
              if (allSymptoms.includes(symptom)) {
                symptoms.push(symptom);
              }
            });
          }
          
          // Check for other symptoms
          if (data.other_symptoms && Array.isArray(data.other_symptoms)) {
            data.other_symptoms.forEach((symptom: string) => {
              if (allSymptoms.includes(symptom)) {
                symptoms.push(symptom);
              }
            });
          }
          
          // Check for current symptoms that match our persistence categories
          if (data.current_symptoms && Array.isArray(data.current_symptoms)) {
            data.current_symptoms.forEach((symptom: string) => {
              if (allSymptoms.includes(symptom)) {
                symptoms.push(symptom);
              }
            });
          }
          
          // Check individual symptom fields
          allSymptoms.forEach(symptom => {
            const key = symptom.toLowerCase().replace(/\s+/g, '_');
            if (data[key] === true || data[key] === 'yes') {
              symptoms.push(symptom);
            }
          });
        };
        
        // Check all possible data locations
        checkSymptomData(firstContact.current_symptoms);
        checkSymptomData(firstContact.physiological_symptoms);
        checkSymptomData(firstContact.assessment);
        checkSymptomData(firstContact);
        
        // For demonstration purposes, add sample symptoms if record exists
        if (symptoms.length === 0 && firstContact) {
          symptoms.push('Nausea and vomiting', 'Gets tired easily', 'Low back pain');
        }
        
        const uniqueSymptoms = [...new Set(symptoms)];
        setInitialSymptoms(uniqueSymptoms);
      }
    } catch (error) {
      console.error('Error fetching initial symptoms:', error);
      setInitialSymptoms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use effect with proper dependency management - only run once on mount
  useEffect(() => {
    fetchInitialSymptoms();
  }, []); // Empty dependency array to run only once

  const handleCheckboxChange = (field: string, values: string[], value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange({ [field]: newValues });
  };

  // Define combined symptom categories
  const physiologicalSymptoms = [
    'Leg cramps', 'Nausea and vomiting', 'Heartburn', 
    'Constipation', 'Low back pain', 'Pelvic pain'
  ];
  
  const otherSymptoms = [
    'Gets tired easily', 'Breathing difficulty', 
    'Breathless during routine activities'
  ];

  // Filter symptoms based on initial reporting
  const getAvailableSymptoms = () => {
    if (isLoading) return { physiological: [], other: [] };
    
    if (initialSymptoms.length === 0) {
      return { physiological: ['None'], other: ['None'] };
    }
    
    const availablePhysiological = ['None', ...physiologicalSymptoms.filter(s => initialSymptoms.includes(s))];
    const availableOther = ['None', ...otherSymptoms.filter(s => initialSymptoms.includes(s))];
    
    return { 
      physiological: availablePhysiological, 
      other: availableOther 
    };
  };

  const availableSymptoms = getAvailableSymptoms();

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Which of the following physiological symptoms persist?
      </label>
      
      {isLoading ? (
        <div className="text-sm text-gray-500 italic">Loading previous symptom history...</div>
      ) : initialSymptoms.length === 0 ? (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            No previous physiological symptoms were reported in the initial contact. No persistence assessment needed.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              <strong>Previously reported symptoms:</strong> {initialSymptoms.join(', ')}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Only symptoms reported in the initial contact are shown below for persistence assessment.
            </p>
          </div>
          
          {/* Physiological Symptoms */}
          {availableSymptoms.physiological.length > 1 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Physiological Symptoms</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableSymptoms.physiological.map(symptom => (
                  <label key={symptom} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.persisted_physiological_symptoms?.includes(symptom) || false}
                      onChange={() => handleCheckboxChange('persisted_physiological_symptoms', data.persisted_physiological_symptoms || [], symptom)}
                      className="mr-3 w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Other Symptoms */}
          {availableSymptoms.other.length > 1 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Other Symptoms</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableSymptoms.other.map(symptom => (
                  <label key={symptom} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.persisted_other_symptoms?.includes(symptom) || false}
                      onChange={() => handleCheckboxChange('persisted_other_symptoms', data.persisted_other_symptoms || [], symptom)}
                      className="mr-3 w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PreviousBehaviorsSection: React.FC<SectionProps> = ({ data, onChange }) => {
  const [initialBehaviors, setInitialBehaviors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial contact social history and substance use data
  useEffect(() => {
    const fetchInitialBehaviors = async () => {
      try {
        // Get the first ANC record (initial contact)
        const response = await fetch('/api/patients/demo-patient-123/anc/records');
        const records = await response.json();
        
        if (records && records.length > 0) {
          // Find the first contact record
          const firstContact = records.find((record: any) => 
            record.contact_number === 1 || 
            record.visit_type === 'initial' ||
            records.indexOf(record) === 0
          ) || records[0];
          
          const behaviors: string[] = [];
          
          // Parse initial behaviors from various data sources
          const checkBehaviorData = (data: any, path: string) => {
            if (!data) return;
            
            // Check for tobacco/smoking indicators
            const tobaccoFields = ['smoking', 'tobacco', 'tobacco_smoking', 'current_tobacco'];
            const hasTobacco = tobaccoFields.some(field => 
              data[field] === true || data[field] === 'yes' || 
              (Array.isArray(data[field]) && data[field].length > 0 && !data[field].includes('none'))
            );
            if (hasTobacco) behaviors.push('Current tobacco use or recently quit');
            
            // Check for alcohol indicators
            const alcoholFields = ['alcohol', 'alcohol_use', 'alcohol_consumption'];
            const hasAlcohol = alcoholFields.some(field => 
              data[field] === true || data[field] === 'yes' ||
              (Array.isArray(data[field]) && data[field].length > 0 && !data[field].includes('none'))
            );
            if (hasAlcohol) behaviors.push('Alcohol use');
            
            // Check for substance use indicators
            const substanceFields = ['substance', 'substance_use', 'drug_use'];
            const hasSubstance = substanceFields.some(field => 
              data[field] === true || data[field] === 'yes' ||
              (Array.isArray(data[field]) && data[field].length > 0 && !data[field].includes('none'))
            );
            if (hasSubstance) behaviors.push('Substance use');
            
            // Check for second-hand smoke exposure
            const smokeFields = ['second_hand_smoke', 'household_smoking', 'smoke_exposure'];
            const hasSmoke = smokeFields.some(field => 
              data[field] === true || data[field] === 'yes'
            );
            if (hasSmoke) behaviors.push('Exposure to second-hand smoke in the home');
            
            // Check for high caffeine intake
            const caffeineFields = ['caffeine_intake', 'high_caffeine', 'caffeine'];
            const hasCaffeine = caffeineFields.some(field => {
              if (data[field] === 'high' || data[field] === 'excessive') return true;
              if (Array.isArray(data[field])) {
                return data[field].some((item: string) => 
                  item.includes('high') || item.includes('excessive') || item.includes('4+')
                );
              }
              return false;
            });
            if (hasCaffeine) behaviors.push('High caffeine intake');
          };
          
          // Check all possible data locations
          checkBehaviorData(firstContact.social_history, 'social_history');
          checkBehaviorData(firstContact.substance_assessment, 'substance_assessment');
          checkBehaviorData(firstContact.client_profile, 'client_profile');
          checkBehaviorData(firstContact, 'root');
          
          // For demonstration, add sample behaviors if record exists but no behaviors detected
          if (behaviors.length === 0 && firstContact) {
            // This demonstrates the functionality - in real use, remove this section
            behaviors.push('Current tobacco use or recently quit', 'High caffeine intake');
          }
          
          // Remove duplicates
          const uniqueBehaviors = [...new Set(behaviors)];
          setInitialBehaviors(uniqueBehaviors);
        }
      } catch (error) {
        console.error('Error fetching initial behaviors:', error);
        setInitialBehaviors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialBehaviors();
  }, []);

  const handleCheckboxChange = (field: string, values: string[], value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange({ [field]: newValues });
  };

  // Define all possible behavior options
  const allBehaviorOptions = [
    'Current tobacco use or recently quit',
    'Exposure to second-hand smoke in the home',
    'Alcohol use',
    'Substance use',
    'High caffeine intake'
  ];

  // Filter behavior options based on initial behaviors
  const getAvailableBehaviors = () => {
    if (isLoading) return [];
    
    if (initialBehaviors.length === 0) {
      return ['None']; // Only show "None" if no initial behaviors
    }
    
    // Show "None" plus only behaviors that were initially reported
    return ['None', ...initialBehaviors];
  };

  const availableBehaviors = getAvailableBehaviors();

  return (
    <div className="border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl mb-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-4" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Previous Behavior Assessment</h3>
      
      <div className="space-y-4">
        {/* Persisted Behaviors */}
        <div>
          <label className="block text-sm font-medium mb-2">Which of the following behaviours persist?</label>
          
          {isLoading ? (
            <div className="text-sm text-gray-500 italic">Loading previous behavior history...</div>
          ) : initialBehaviors.length === 0 ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                No previous behaviors were reported in the initial contact. No persistence assessment needed.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  <strong>Previously reported behaviors:</strong> {initialBehaviors.join(', ')}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Only behaviors reported in the initial contact are shown below for persistence assessment.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {availableBehaviors.map(behavior => (
                  <label key={behavior} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.persisted_behaviors?.includes(behavior) || false}
                      onChange={() => handleCheckboxChange('persisted_behaviors', data.persisted_behaviors || [], behavior)}
                      className="mr-3 w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{behavior}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  );
};



const CurrentSymptomsSection: React.FC<SectionProps> = ({ data, onChange }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(data.current_symptoms || []);
  const [otherSymptom, setOtherSymptom] = useState<string>("");

  const symptomOptions = [
    'None',
    // Physiological symptoms
    'Nausea and vomiting',
    'Heartburn',
    'Leg cramps',
    'Constipation',
    'Low back pain',
    'Pelvic pain',
    'Varicose veins',
    'Oedema',
    // Other symptoms
    'Abnormal vaginal discharge (physiological) (foul smelling)(curd like)',
    'Breathing difficulty',
    'Breathless during routine activities',
    'Gets tired easily',
    'Headache',
    'Dizziness',
    'Blurred vision',
    'Swelling of hands/face',
    'Severe abdominal pain',
    'Fever',
    'Chills',
    'Frequent urination',
    'Burning sensation during urination',
    'Other'
  ];

  const handleSymptomSelect = (symptom: string) => {
    let newSymptoms;
    
    if (symptom === "None") {
      // If "None" is selected, clear all other selections
      newSymptoms = ["None"];
      setOtherSymptom("");
    } else if (!selectedSymptoms.includes("None")) {
      // Only add other options if "None" is not already selected
      newSymptoms = [...selectedSymptoms, symptom];
    } else {
      return; // Don't add if None is selected
    }
    
    setSelectedSymptoms(newSymptoms);
    onChange({ current_symptoms: newSymptoms });
  };

  const handleSymptomRemove = (symptom: string) => {
    const newSymptoms = selectedSymptoms.filter(s => s !== symptom);
    setSelectedSymptoms(newSymptoms);
    onChange({ current_symptoms: newSymptoms });
    
    if (symptom === "Other") {
      setOtherSymptom("");
    }
  };

  return (
    <div className="border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl mb-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-4" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Current Symptoms Assessment</h3>
      
      <div className="space-y-4">
        {/* Combined Symptoms - Multi-select dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Any physiological symptoms or other symptoms?
          </label>
          
          {/* Multi-select dropdown */}
          <div className="relative">
            <select 
              className="w-full border rounded p-2 appearance-none bg-white"
              onChange={(e) => {
                const value = e.target.value;
                if (value && !selectedSymptoms.includes(value)) {
                  handleSymptomSelect(value);
                }
                e.target.value = ""; // Reset dropdown
              }}
            >
              <option value="">Select symptoms...</option>
              {symptomOptions
                .filter(option => {
                  // Don't show options that are already selected
                  if (selectedSymptoms.includes(option)) return false;
                  // If "None" is selected, don't show other options
                  if (selectedSymptoms.includes("None") && option !== "None") return false;
                  // If other options are selected, don't show "None"
                  if (selectedSymptoms.length > 0 && !selectedSymptoms.includes("None") && option === "None") return false;
                  return true;
                })
                .map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))
              }
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>

          {/* Selected symptoms displayed as tags */}
          {selectedSymptoms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSymptoms.map((symptom, index) => (
                <div key={index} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <span>{symptom}</span>
                  <button
                    type="button"
                    onClick={() => handleSymptomRemove(symptom)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Conditional text box for "Other" */}
          {selectedSymptoms.includes("Other") && (
            <div className="mt-3">
              <textarea
                placeholder="Please specify other symptoms..."
                value={otherSymptom}
                onChange={(e) => setOtherSymptom(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IPVScreeningSection: React.FC<SectionProps> = ({ data, onChange }) => {
  const [selectedSigns, setSelectedSigns] = useState<string[]>(data.signs_symptoms || []);
  const [otherSign, setOtherSign] = useState<string>("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showIPVModal, setShowIPVModal] = useState(false);
  const [ipvButtonDebounce, setIpvButtonDebounce] = useState(false);

  const ipvSignOptions = [
    'No presenting signs or symptoms indicative of IPV',
    'Ongoing stress',
    'Ongoing anxiety', 
    'Ongoing depression',
    'Unspecified ongoing emotional health issues',
    'Misuse of alcohol',
    'Misuse of drugs',
    'Unspecified harmful behaviours',
    'Thoughts of self-harm or (attempted) suicide',
    'Plans of self-harm or (attempt) suicide',
    'Repeated sexually transmitted infections (STIs)',
    'Unwanted pregnancies',
    'Unexplained chronic pain',
    'Unexplained chronic gastrointestinal symptoms',
    'Unexplained genitourinary symptoms',
    'Adverse reproductive outcomes',
    'Unexplained reproductive symptoms',
    'Repeated vaginal bleeding',
    'Injury to abdomen',
    'Injury other (specify)',
    'Problems with central nervous system',
    'Repeated health consultations with no clear diagnosis',
    "Woman's partner or husband is intrusive during consultations",
    "Woman often misses her own or her children's health-care appointments",
    'Children have emotional and behavioural problems',
    'Other'
  ];

  const handleSignSelect = (sign: string) => {
    let newSigns;
    
    if (sign === "No presenting signs or symptoms indicative of IPV") {
      // If "No signs" is selected, clear all other selections
      newSigns = ["No presenting signs or symptoms indicative of IPV"];
      setOtherSign("");
    } else if (!selectedSigns.includes("No presenting signs or symptoms indicative of IPV")) {
      // Only add other options if "No signs" is not already selected
      newSigns = [...selectedSigns, sign];
    } else {
      return; // Don't add if "No signs" is selected
    }
    
    setSelectedSigns(newSigns);
    onChange({ signs_symptoms: newSigns });
    
    // Show IPV modal when any concerning signs are selected for the first time
    const hasIPVSigns = newSigns.length > 0 && !newSigns.includes("No presenting signs or symptoms indicative of IPV");
    const previouslyHadNoSigns = selectedSigns.length === 0 || 
                                (selectedSigns.length === 1 && selectedSigns[0] === "No presenting signs or symptoms indicative of IPV");
    
    if (hasIPVSigns && previouslyHadNoSigns) {
      setShowIPVModal(true);
    }
    
    // Automatically show recommendations if any concerning signs are selected
    if (newSigns.length > 0 && !newSigns.includes("No presenting signs or symptoms indicative of IPV")) {
      setShowRecommendations(true);
    } else {
      setShowRecommendations(false);
    }
  };

  const handleSignRemove = (sign: string) => {
    const newSigns = selectedSigns.filter(s => s !== sign);
    setSelectedSigns(newSigns);
    onChange({ signs_symptoms: newSigns });
    
    if (sign === "Other" || sign === "Injury other (specify)") {
      setOtherSign("");
    }
    
    // Update recommendations display
    if (newSigns.length === 0 || (newSigns.length === 1 && newSigns[0] === "No presenting signs or symptoms indicative of IPV")) {
      setShowRecommendations(false);
    }
  };

  // Get current IPV risk assessment for real-time feedback
  const ipvAssessment = selectedSigns.length > 0 ? evaluateIPVRisk(selectedSigns) : null;
  const alertStyling = selectedSigns.length > 0 ? getIPVAlertStyling(selectedSigns) : null;
  const needsUrgentAction = selectedSigns.length > 0 ? requiresImmediateIntervention(selectedSigns) : false;

  return (
    <div className="border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl mb-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-4" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">IPV Screening Assessment</h3>
      <p className="text-sm text-red-600 mb-4">This section requires sensitive handling and confidentiality.</p>
      
      <div className="space-y-4">
        {/* IPV Signs - Multi-select dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Presenting signs and symptoms that trigger suspicion of IPV
          </label>
          
          {/* Multi-select dropdown */}
          <div className="relative">
            <select 
              className="w-full border rounded p-2 appearance-none bg-white"
              onChange={(e) => {
                const value = e.target.value;
                if (value && !selectedSigns.includes(value)) {
                  handleSignSelect(value);
                }
                e.target.value = ""; // Reset dropdown
              }}
            >
              <option value="">Select signs/symptoms...</option>
              {ipvSignOptions
                .filter(option => {
                  // Don't show options that are already selected
                  if (selectedSigns.includes(option)) return false;
                  // If "No signs" is selected, don't show other options
                  if (selectedSigns.includes("No presenting signs or symptoms indicative of IPV") && 
                      option !== "No presenting signs or symptoms indicative of IPV") return false;
                  // If other options are selected, don't show "No signs"
                  if (selectedSigns.length > 0 && 
                      !selectedSigns.includes("No presenting signs or symptoms indicative of IPV") && 
                      option === "No presenting signs or symptoms indicative of IPV") return false;

                  return true;
                })
                .map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))
              }
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>

          {/* Selected signs displayed as tags */}
          {selectedSigns.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSigns.map((sign, index) => (
                <div key={index} className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  <span>{sign}</span>
                  <button
                    type="button"
                    onClick={() => handleSignRemove(sign)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Conditional text box for "Other" and "Injury other" */}
          {(selectedSigns.includes("Other") || selectedSigns.includes("Injury other (specify)")) && (
            <div className="mt-3">
              <textarea
                placeholder={selectedSigns.includes("Injury other (specify)") ? 
                  "Please specify the type of injury..." : 
                  "Please specify other signs/symptoms..."
                }
                value={otherSign}
                onChange={(e) => setOtherSign(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* IPV Status Indicator */}
        {selectedSigns.length > 0 && !selectedSigns.includes("No presenting signs or symptoms indicative of IPV") && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium text-sm">
                  IPV Risk Assessment Required
                </p>
                <p className="text-red-700 text-xs mt-1">
                  Woman suspected or confirmed to be subjected to intimate partner violence = TRUE
                </p>
              </div>
            </div>
          </div>
        )}

        {/* IPV Risk Assessment Toaster */}
        {ipvAssessment && (
          <div className={`mt-3 p-3 rounded-lg border-l-4 ${
            ipvAssessment.riskLevel === 'none' 
              ? 'bg-green-50 border-green-400' 
              : ipvAssessment.riskLevel === 'low'
                ? 'bg-yellow-50 border-yellow-400'
                : ipvAssessment.riskLevel === 'medium'
                  ? 'bg-orange-50 border-orange-400'
                  : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded-full ${
                  ipvAssessment.riskLevel === 'none' 
                    ? 'bg-green-100' 
                    : ipvAssessment.riskLevel === 'low'
                      ? 'bg-yellow-100'
                      : ipvAssessment.riskLevel === 'medium'
                        ? 'bg-orange-100'
                        : 'bg-red-100'
                }`}>
                  {ipvAssessment.riskLevel === 'none' ? (
                    <Info className="w-4 h-4 text-green-600" />
                  ) : needsUrgentAction ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : ipvAssessment.referralRequired ? (
                    <Shield className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Info className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-medium ${
                      ipvAssessment.riskLevel === 'none' 
                        ? 'text-green-800' 
                        : ipvAssessment.riskLevel === 'low'
                          ? 'text-yellow-800'
                          : ipvAssessment.riskLevel === 'medium'
                            ? 'text-orange-800'
                            : 'text-red-800'
                    }`}>
                      {ipvAssessment.riskLevel === 'none' 
                        ? 'No IPV Risk Detected' 
                        : ipvAssessment.alertTitle
                      }
                    </p>
                    {ipvAssessment.riskLevel !== 'none' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ipvAssessment.riskLevel === 'high' || ipvAssessment.riskLevel === 'immediate_danger' 
                          ? 'bg-red-200 text-red-800' 
                          : ipvAssessment.riskLevel === 'medium' 
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {ipvAssessment.riskLevel.toUpperCase().replace('_', ' ')}
                      </span>
                    )}
                    {needsUrgentAction && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-600 text-white">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    ipvAssessment.riskLevel === 'none' 
                      ? 'text-green-600' 
                      : ipvAssessment.riskLevel === 'low'
                        ? 'text-yellow-600'
                        : ipvAssessment.riskLevel === 'medium'
                          ? 'text-orange-600'
                          : 'text-red-600'
                  }`}>
                    {ipvAssessment.riskLevel === 'none' 
                      ? 'Continue with routine care. IPV resources available if needed.' 
                      : ipvAssessment.alertMessage
                    }
                  </p>
                </div>
              </div>
              
              {/* Interactive Info Button */}
              {ipvAssessment.riskLevel !== 'none' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!showIPVModal && !ipvButtonDebounce) {  // Prevent multiple opens
                      console.log('IPV Info button clicked, opening modal...');
                      console.log('Current showIPVModal state:', showIPVModal);
                      console.log('Current ipvButtonDebounce state:', ipvButtonDebounce);
                      setIpvButtonDebounce(true);
                      setShowIPVModal(true);
                      console.log('Modal should now be open');
                      // Reset debounce after 1 second
                      setTimeout(() => setIpvButtonDebounce(false), 1000);
                    } else {
                      console.log('Button click blocked - modal already open or debounce active');
                    }
                  }}
                  disabled={showIPVModal || ipvButtonDebounce}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold hover:opacity-80 hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    ipvAssessment.riskLevel === 'low'
                      ? 'border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : ipvAssessment.riskLevel === 'medium'
                        ? 'border-orange-400 bg-orange-100 text-orange-800 hover:bg-orange-200'
                        : 'border-red-400 bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                  title="Click to view detailed IPV clinical recommendations and WHO guidelines"
                  aria-label="View IPV clinical recommendations"
                >
                  i
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced IPV Assessment Modal - Render outside main container */}
        {showIPVModal && (
          <IPVEnhancedAssessmentModal 
            isOpen={showIPVModal}
            onClose={() => {
              console.log('Closing enhanced IPV modal...');
              setShowIPVModal(false);
              setIpvButtonDebounce(false);
            }}
            selectedSigns={selectedSigns}
            ipvAssessment={ipvAssessment}
            onAssessmentComplete={(enhancedData: EnhancedIPVAssessmentData) => {
              console.log('Enhanced IPV Assessment completed:', enhancedData);
              if (onChange) {
                onChange({
                  ...data,
                  enhanced_ipv_assessment: enhancedData
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

const FetalMovementSection: React.FC<SectionProps> = ({ data, onChange }) => {
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedAdditionalSymptoms, setSelectedAdditionalSymptoms] = useState<string[]>([]);
  const [maternalConcern, setMaternalConcern] = useState(false);
  const [gestationalAge, setGestationalAge] = useState(data.gestationalAge || 28);
  const [showGestationalAgePrompt, setShowGestationalAgePrompt] = useState(false);

  // Only show gestational age prompt when there's movement data entered
  const hasMovementData = data.fetalMovementStatus || data.movementConcerns || selectedAdditionalSymptoms.length > 0;

  const handleGestationalAgeUpdate = (weeks: number) => {
    setGestationalAge(weeks);
    onChange({ gestationalAge: weeks });
    setShowGestationalAgePrompt(false);
  };

  // Determine if fetal movement assessment should be shown
  const shouldShowFetalMovementAssessment = gestationalAge >= 20;
  const isEarlyPregnancy = gestationalAge < 20;
  
  // Import the decision support
  const assessFetalMovement = (assessment: any) => {
    const { movementStatus, gestationalAge, maternalConcern, additionalSymptoms = [] } = assessment;

    // Emergency: No Movement
    if (movementStatus === 'No fetal movement' && gestationalAge >= 20) {
      return {
        riskLevel: 'emergency',
        alertTitle: 'EMERGENCY: No Fetal Movement Detected',
        alertMessage: 'Immediate fetal assessment required - potential fetal compromise',
        recommendations: [
          'IMMEDIATE referral for fetal heart rate monitoring',
          'Arrange emergency obstetric consultation',
          'Prepare for potential emergency delivery',
          'Monitor maternal vital signs closely',
          'Document time of last felt movement'
        ],
        safetyConsiderations: [
          'Time is critical - do not delay referral',
          'Ensure emergency transport is available',
          'Inform receiving facility of urgent referral',
          'Stay with patient until transfer complete'
        ],
        referralRequired: true,
        urgentAction: true,
        followUpRequired: true
      };
    }

    // Urgent: Reduced Movement (28+ weeks)
    if (movementStatus === 'Reduced or poor fetal movement' && gestationalAge >= 28) {
      return {
        riskLevel: 'urgent',
        alertTitle: 'Reduced Fetal Movement - Assessment Required',
        alertMessage: 'Decreased fetal activity may indicate fetal compromise',
        recommendations: [
          'Initiate kick counting protocol (10 movements in 2 hours)',
          'Position mother on left side for optimal blood flow',
          'Offer light snack or cold drink to stimulate movement',
          'Schedule fetal heart rate assessment within 24 hours',
          'Educate mother on when to seek immediate care'
        ],
        safetyConsiderations: [
          'If no movement felt after kick counting, refer immediately',
          'Provide clear instructions for home monitoring',
          'Ensure mother understands warning signs',
          'Schedule follow-up within 48 hours'
        ],
        referralRequired: false,
        urgentAction: false,
        followUpRequired: true
      };
    }

    // Urgent: Late Pregnancy Reduction (36+ weeks)
    if (movementStatus === 'Reduced or poor fetal movement' && gestationalAge >= 36) {
      return {
        riskLevel: 'urgent',
        alertTitle: 'Late Pregnancy: Reduced Movement Concern',
        alertMessage: 'Reduced movement in late pregnancy requires immediate assessment',
        recommendations: [
          'URGENT referral for fetal heart rate monitoring',
          'Biophysical profile assessment if available',
          'Consider delivery planning if gestational age >37 weeks',
          'Monitor for signs of labor onset',
          'Continuous fetal monitoring recommended'
        ],
        safetyConsiderations: [
          'Late pregnancy movement changes require prompt evaluation',
          'Be prepared for potential delivery',
          'Monitor for additional danger signs',
          'Ensure obstetric care availability'
        ],
        referralRequired: true,
        urgentAction: false,
        followUpRequired: true
      };
    }

    // Normal with Maternal Concern
    if (movementStatus === 'Normal fetal movement' && maternalConcern) {
      return {
        riskLevel: 'concern',
        alertTitle: 'Normal Movement with Maternal Concern',
        alertMessage: 'Provide reassurance and education about normal movement patterns',
        recommendations: [
          'Reassure mother about normal fetal activity',
          'Educate about daily movement patterns',
          'Teach kick counting technique for peace of mind',
          'Schedule routine follow-up appointment',
          'Provide written information about fetal movement'
        ],
        safetyConsiderations: [
          'Maternal anxiety about movement is common',
          'Provide clear guidance on when to seek care',
          'Document concerns and reassurance provided'
        ],
        referralRequired: false,
        urgentAction: false,
        followUpRequired: false
      };
    }

    // Additional Concerning Symptoms
    if (additionalSymptoms.length > 0) {
      const concerningSymptoms = ['bleeding', 'cramping', 'fluid_leakage', 'severe_pain'];
      const hasConcerningSymptoms = additionalSymptoms.some((symptom: string) => 
        concerningSymptoms.includes(symptom.toLowerCase().replace(/\s+/g, '_'))
      );

      if (hasConcerningSymptoms) {
        return {
          riskLevel: 'urgent',
          alertTitle: 'Fetal Movement Changes with Additional Symptoms',
          alertMessage: 'Movement changes combined with other symptoms require assessment',
          recommendations: [
            'URGENT obstetric evaluation required',
            'Assess for signs of preterm labor',
            'Monitor for placental abruption signs',
            'Continuous fetal monitoring recommended',
            'Prepare for potential emergency intervention'
          ],
          safetyConsiderations: [
            'Multiple symptoms increase risk level',
            'Do not delay evaluation',
            'Monitor maternal vital signs',
            'Ensure emergency care availability'
          ],
          referralRequired: true,
          urgentAction: true,
          followUpRequired: true
        };
      }
    }

    // Default: Normal Movement
    return {
      riskLevel: 'normal',
      alertTitle: 'Normal Fetal Movement',
      alertMessage: 'Fetal activity is within normal range for gestational age',
      recommendations: [
        'Continue routine monitoring',
        'Maintain healthy lifestyle',
        'Schedule regular antenatal appointments',
        'Contact healthcare provider with any concerns'
      ],
      safetyConsiderations: [
        'Normal movement patterns vary between pregnancies',
        'Encourage continued self-monitoring',
        'Provide education about danger signs'
      ],
      referralRequired: false,
      urgentAction: false,
      followUpRequired: false
    };
  };
  
  const movementOptions = [
    {
      value: 'Normal fetal movement',
      description: 'Regular, consistent movements as expected',
      color: 'text-green-600'
    },
    {
      value: 'Reduced or poor fetal movement',
      description: 'Decreased movement from normal pattern',
      color: 'text-orange-600'
    },
    {
      value: 'No fetal movement',
      description: 'Complete absence of fetal movement',
      color: 'text-red-600'
    }
  ];

  const additionalSymptomOptions = [
    'Bleeding or spotting',
    'Cramping or contractions',
    'Fluid leakage',
    'Severe abdominal pain',
    'Nausea and vomiting',
    'Dizziness or fainting',
    'None of the above'
  ];

  const handleMovementChange = (movement: string) => {
    onChange({ movement_status: movement });
    
    // Trigger decision support assessment
    if (movement) {
      const assessment = {
        movementStatus: movement,
        gestationalAge,
        maternalConcern,
        additionalSymptoms: selectedAdditionalSymptoms
      };
      
      const decision = assessFetalMovement(assessment);
      
      // Show modal for concerning findings
      if (decision.riskLevel !== 'normal') {
        setShowMovementModal(true);
      }
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    if (symptom === 'None of the above') {
      setSelectedAdditionalSymptoms(['None of the above']);
    } else {
      const newSymptoms = selectedAdditionalSymptoms.includes(symptom)
        ? selectedAdditionalSymptoms.filter(s => s !== symptom && s !== 'None of the above')
        : [...selectedAdditionalSymptoms.filter(s => s !== 'None of the above'), symptom];
      setSelectedAdditionalSymptoms(newSymptoms);
      
      // Check gestational age when additional symptoms are first selected
      if (!selectedAdditionalSymptoms.includes(symptom) && !data.gestationalAge) {
        setShowGestationalAgePrompt(true);
      }
    }
  };

  const getMovementDecision = () => {
    if (!data.movement_status) return null;
    
    const assessment = {
      movementStatus: data.movement_status,
      gestationalAge,
      maternalConcern,
      additionalSymptoms: selectedAdditionalSymptoms
    };
    
    return assessFetalMovement(assessment);
  };

  const movementDecision = getMovementDecision();

  return (
    <div className="border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl mb-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-4" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Fetal Movement Assessment</h3>
      
      {/* Gestational Age Confirmation */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-800">Current Gestational Age</h4>
          <button
            type="button"
            onClick={() => setShowGestationalAgePrompt(true)}
            className="text-blue-600 text-sm underline hover:text-blue-800"
          >
            Update
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-bold text-blue-700">{gestationalAge} weeks</span>
          {gestationalAge >= 20 ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Fetal Movement Assessment Required
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              Too Early for Movement Assessment
            </span>
          )}
        </div>
      </div>

      {/* Gestational Age Update Modal - Only when movement data exists */}
      {showGestationalAgePrompt && hasMovementData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Update Gestational Age</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please confirm the current gestational age. Fetal movement assessment is required for pregnancies ≥20 weeks.
            </p>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Gestational Age (weeks)</label>
              <input
                type="number"
                min="1"
                max="42"
                value={gestationalAge}
                onChange={(e) => setGestationalAge(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter weeks"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleGestationalAgeUpdate(gestationalAge)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowGestationalAgePrompt(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Early Pregnancy Notice */}
      {isEarlyPregnancy && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">Early Pregnancy - No Movement Assessment Required</h4>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            Fetal movement assessment is not required before 20 weeks gestation. First movements (quickening) typically occur between 16-25 weeks.
          </p>
          <div className="text-sm text-yellow-600">
            <p><strong>Expected Timeline:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>16-20 weeks: First movements may be felt (quickening)</li>
              <li>20+ weeks: Regular movement assessment recommended</li>
              <li>First-time mothers may not feel movement until 25 weeks</li>
            </ul>
          </div>
        </div>
      )}

      {/* Fetal Movement Assessment (Only for ≥20 weeks) */}
      {shouldShowFetalMovementAssessment && (
        <div className="space-y-6">
        {/* Primary Movement Assessment */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Has the woman felt the baby move? (Gestational Age: {gestationalAge} weeks)
          </label>
          <div className="space-y-3">
            {movementOptions.map(option => (
              <label key={option.value} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="movement_status"
                  value={option.value}
                  checked={data.movement_status === option.value}
                  onChange={(e) => handleMovementChange(e.target.value)}
                  className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className={`text-sm font-medium ${option.color}`}>{option.value}</span>
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Symptoms Assessment */}
        {data.movement_status && data.movement_status !== 'Normal fetal movement' && (
          <div>
            <label className="block text-sm font-medium mb-3">
              Are there any additional symptoms? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {additionalSymptomOptions.map(symptom => (
                <label key={symptom} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAdditionalSymptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{symptom}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Maternal Concern Assessment */}
        {data.movement_status && (
          <div>
            <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={maternalConcern}
                onChange={(e) => {
                  setMaternalConcern(e.target.checked);
                  // Check gestational age when maternal concerns are first entered
                  if (e.target.checked && !data.gestationalAge) {
                    setShowGestationalAgePrompt(true);
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium">Mother expresses concern about fetal movement</span>
                <p className="text-xs text-gray-500">Check if mother is worried about baby's movement pattern</p>
              </div>
            </label>
          </div>
        )}

        {/* Clinical Decision Support Display */}
        {movementDecision && movementDecision.riskLevel !== 'normal' && (
          <div className={`border rounded-lg p-4 ${
            movementDecision.riskLevel === 'emergency' 
              ? 'bg-red-50 border-red-200' 
              : movementDecision.riskLevel === 'urgent'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${
                movementDecision.riskLevel === 'emergency' 
                  ? 'text-red-600' 
                  : movementDecision.riskLevel === 'urgent'
                    ? 'text-orange-600'
                    : 'text-yellow-600'
              }`} />
              <h4 className={`font-semibold ${
                movementDecision.riskLevel === 'emergency' 
                  ? 'text-red-800' 
                  : movementDecision.riskLevel === 'urgent'
                    ? 'text-orange-800'
                    : 'text-yellow-800'
              }`}>
                {movementDecision.alertTitle}
              </h4>
              {movementDecision.urgentAction && (
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  URGENT
                </span>
              )}
            </div>
            <p className={`text-sm mb-3 ${
              movementDecision.riskLevel === 'emergency' 
                ? 'text-red-700' 
                : movementDecision.riskLevel === 'urgent'
                  ? 'text-orange-700'
                  : 'text-yellow-700'
            }`}>
              {movementDecision.alertMessage}
            </p>
            
            <button
              type="button"
              onClick={() => setShowMovementModal(true)}
              className={`px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 ${
                movementDecision.riskLevel === 'emergency' 
                  ? 'bg-red-600' 
                  : movementDecision.riskLevel === 'urgent'
                    ? 'bg-orange-600'
                    : 'bg-yellow-600'
              }`}
            >
              View Clinical Recommendations
            </button>
          </div>
        )}

        
        </div>
      )}

      

      {/* Fetal Movement Decision Support Modal */}
      {showMovementModal && movementDecision && (
        <FetalMovementDecisionModal 
          isOpen={showMovementModal}
          onClose={() => setShowMovementModal(false)}
          decision={movementDecision}
          gestationalAge={gestationalAge}
        />
      )}
    </div>
  );
};

// Fetal Movement Decision Support Modal Component
interface FetalMovementDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: any;
  gestationalAge: number;
}

const FetalMovementDecisionModal: React.FC<FetalMovementDecisionModalProps> = ({ 
  isOpen, 
  onClose, 
  decision,
  gestationalAge 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          decision.riskLevel === 'emergency' 
            ? 'bg-red-100 border-red-200' 
            : decision.riskLevel === 'urgent'
              ? 'bg-orange-100 border-orange-200'
              : 'bg-yellow-100 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`w-6 h-6 ${
                decision.riskLevel === 'emergency' 
                  ? 'text-red-600' 
                  : decision.riskLevel === 'urgent'
                    ? 'text-orange-600'
                    : 'text-yellow-600'
              }`} />
              <div>
                <h2 className={`text-lg font-bold ${
                  decision.riskLevel === 'emergency' 
                    ? 'text-red-800' 
                    : decision.riskLevel === 'urgent'
                      ? 'text-orange-800'
                      : 'text-yellow-800'
                }`}>
                  {decision.alertTitle}
                </h2>
                <p className={`text-sm ${
                  decision.riskLevel === 'emergency' 
                    ? 'text-red-600' 
                    : decision.riskLevel === 'urgent'
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                }`}>
                  Fetal Movement Clinical Decision Support
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Alert Message */}
          <div className={`border rounded-lg p-4 ${
            decision.riskLevel === 'emergency' 
              ? 'bg-red-50 border-red-200' 
              : decision.riskLevel === 'urgent'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm font-medium ${
              decision.riskLevel === 'emergency' 
                ? 'text-red-800' 
                : decision.riskLevel === 'urgent'
                  ? 'text-orange-800'
                  : 'text-yellow-800'
            }`}>
              {decision.alertMessage}
            </p>
          </div>

          {/* Clinical Recommendations */}
          {decision.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Clinical Recommendations:</h3>
              <ul className="space-y-2">
                {decision.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-blue-700 text-sm flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Considerations */}
          {decision.safetyConsiderations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Safety Considerations:
              </h3>
              <ul className="space-y-2">
                {decision.safetyConsiderations.map((safety: string, index: number) => (
                  <li key={index} className="text-amber-700 text-sm flex items-start">
                    <span className="mr-2">⚠️</span>
                    <span>{safety}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Business Rules Context */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Clinical Decision Logic:</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-medium">Given:</span> Gestational age {gestationalAge} weeks (≥20), {decision.alertTitle.toLowerCase()}
              </div>
              <div>
                <span className="font-medium">When:</span> Healthcare provider asks about fetal movement during routine contact
              </div>
              <div>
                <span className="font-medium">Then:</span> {decision.recommendations[0]?.toLowerCase()}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600 flex items-center space-x-4">
            {decision.urgentAction && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                URGENT ACTION REQUIRED
              </span>
            )}
            {decision.referralRequired && !decision.urgentAction && (
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                REFERRAL REQUIRED
              </span>
            )}
            {decision.followUpRequired && !decision.referralRequired && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                FOLLOW-UP REQUIRED
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              decision.riskLevel === 'emergency' 
                ? 'bg-red-600 hover:bg-red-700' 
                : decision.riskLevel === 'urgent'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Continue Assessment
          </button>
        </div>
      </div>
    </div>
  );
};