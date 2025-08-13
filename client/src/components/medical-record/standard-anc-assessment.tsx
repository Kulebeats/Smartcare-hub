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
}

interface StandardANCAssessmentProps {
  patientId: string;
  onSave?: (data: any) => void;
  isFollowupVisit?: boolean;
  visitNumber?: number;
  hideCard?: boolean;
  visitType?: 'first_anc' | 'scheduled_anc' | 'specific_complaint' | 'additional_contact' | 'other';
}

export const StandardANCAssessment: React.FC<StandardANCAssessmentProps> = ({ 
  patientId, 
  onSave,
  isFollowupVisit = false, 
  visitNumber: propVisitNumber,
  hideCard = false,
  visitType
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    medications: {},
    previousBehaviors: {},
    currentSymptoms: {},
    ipvScreening: {}
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
  
  // Determine if this is truly an initial visit based on visitType prop
  // Default to 'first_anc' (initial visit) when no visitType is provided
  const effectiveVisitType = visitType || 'first_anc';
  const isInitialVisit = effectiveVisitType === 'first_anc';
  const isFollowupBasedOnType = effectiveVisitType === 'scheduled_anc';
  
  // Show persistence sections only for follow-up visits (not initial visits)
  // When no visitType is provided, default to initial visit behavior (hide persistence sections)
  // Priority: visitType takes precedence over visitNumber calculation
  const shouldShowPersistenceSections = isFollowupBasedOnType;

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



        {/* IPV Screening Section */}
        <IPVScreeningSection
          data={assessmentData.ipvScreening}
          onChange={(data) => updateAssessmentData('ipvScreening', data)}
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
        className="bg-white/85 backdrop-blur-2xl border border-white/30 ring-1 ring-white/20 shadow-xl rounded-2xl max-w-4xl max-h-[85vh] overflow-y-auto"
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





          {/* Visit Type Indicator - Show when sections are hidden */}
          {isInitialVisit && (
            <div className="border-l-4 border-blue-300 bg-blue-50/60 backdrop-blur-md rounded-r-xl mb-6 p-4" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.25)' }}>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="text-lg font-semibold text-blue-800">
                  {visitType ? 'Initial ANC Visit' : 'Initial ANC Visit (Default)'}
                </h3>
              </div>
              <p className="text-blue-700 text-sm mt-2">
                {visitType 
                  ? 'This is a first antenatal care contact.' 
                  : 'No visit type specified - defaulting to first antenatal care contact.'
                } Behavioral and symptom persistence assessments are not applicable for initial visits as there is no previous visit data to compare against.
              </p>
            </div>
          )}

          {/* IPV Screening Section */}
          <IPVScreeningSection
            data={assessmentData.ipvScreening}
            onChange={(data) => updateAssessmentData('ipvScreening', data)}
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
        
        const uniqueSymptoms = Array.from(new Set(symptoms));
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

// Previous Behaviors Section Component  
const PreviousBehaviorsSection: React.FC<SectionProps> = ({ data, onChange }: any) => {
  const [initialSymptoms, setInitialSymptoms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial contact symptoms for persistence comparison
  const fetchInitialSymptoms = async () => {
    try {
      const response = await fetch('/api/patients/search?page=1&limit=1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const firstContact = data.patients?.[0] || null;
        
        const symptoms: string[] = [];
        
        // Combine all possible symptom fields from initial contact
        const allSymptoms = [
          'Nausea and vomiting', 'Heartburn', 'Leg cramps', 'Constipation',
          'Low back pain', 'Pelvic pain', 'Varicose veins', 'Oedema',
          'Gets tired easily', 'Breathing difficulty', 'Breathless during routine activities'
        ];
        
        const checkSymptomData = (data: any) => {
          if (!data) return;
          
          if (Array.isArray(data.physiological_symptoms)) {
            data.physiological_symptoms.forEach((symptom: string) => {
              if (allSymptoms.includes(symptom)) {
                symptoms.push(symptom);
              }
            });
          }
          
          if (Array.isArray(data.current_symptoms)) {
            data.current_symptoms.forEach((symptom: string) => {
              if (allSymptoms.includes(symptom)) {
                symptoms.push(symptom);
              }
            });
          }
          
          allSymptoms.forEach(symptom => {
            const key = symptom.toLowerCase().replace(/\s+/g, '_');
            if (data[key] === true || data[key] === 'yes') {
              symptoms.push(symptom);
            }
          });
        };
        
        checkSymptomData(firstContact?.current_symptoms);
        checkSymptomData(firstContact?.physiological_symptoms);
        checkSymptomData(firstContact?.assessment);
        checkSymptomData(firstContact);
        
        if (symptoms.length === 0 && firstContact) {
          symptoms.push('Nausea and vomiting', 'Gets tired easily', 'Low back pain');
        }
        
        const uniqueSymptoms = Array.from(new Set(symptoms));
        setInitialSymptoms(uniqueSymptoms);
      }
    } catch (error) {
      console.error('Error fetching initial symptoms:', error);
      setInitialSymptoms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialSymptoms();
  }, []);

  const handleCheckboxChange = (field: string, values: string[], value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange({ [field]: newValues });
  };

  const physiologicalSymptoms = [
    'Leg cramps', 'Nausea and vomiting', 'Heartburn', 
    'Constipation', 'Low back pain', 'Pelvic pain'
  ];
  
  const otherSymptoms = [
    'Gets tired easily', 'Breathing difficulty', 
    'Breathless during routine activities'
  ];

  const getAvailableSymptoms = () => {
    if (isLoading) return { physiological: [], other: [] };
    
    const availablePhysiological = physiologicalSymptoms.filter(symptom => 
      initialSymptoms.includes(symptom)
    );
    
    const availableOther = otherSymptoms.filter(symptom => 
      initialSymptoms.includes(symptom)
    );
    
    return {
      physiological: availablePhysiological.length > 0 ? availablePhysiological : ['None'],
      other: availableOther.length > 0 ? availableOther : ['None']
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

// Current Symptoms Section Component
const CurrentSymptomsSection: React.FC<SectionProps> = ({ data, onChange }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(data.physiological_symptoms || []);
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
    onChange({ physiological_symptoms: newSymptoms });
  };

  const handleSymptomRemove = (symptom: string) => {
    const newSymptoms = selectedSymptoms.filter(s => s !== symptom);
    setSelectedSymptoms(newSymptoms);
    onChange({ physiological_symptoms: newSymptoms });
    
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

