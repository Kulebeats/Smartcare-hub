import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BehavioralCounsellingData, GivenWhenThenSession } from "../../../../shared/schema";
import { AlertTriangle, CheckCircle, Clock, User, Calendar, Star, Plus, X } from "lucide-react";

interface EnhancedBehavioralCounsellingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BehavioralCounsellingData) => void;
  clientProfile?: {
    daily_caffeine_intake?: string;
    tobacco_use_smoking?: string;
    tobacco_use_sniffing?: string;
    anyone_smokes_in_household?: string;
    uses_alcohol_substances?: string[];
  };
  clinicalContext?: {
    syphilis_test?: string;
    hiv_status?: string;
    hepatitis_b_test?: string;
    medical_history?: string[];
    uti_detected?: boolean;
  };
  existingData?: BehavioralCounsellingData;
}

export default function EnhancedBehavioralCounsellingModal({
  isOpen,
  onClose,
  onSave,
  clientProfile,
  clinicalContext,
  existingData
}: EnhancedBehavioralCounsellingModalProps) {
  const [formData, setFormData] = useState<BehavioralCounsellingData>(existingData || {});
  const [activeTab, setActiveTab] = useState("behavioral");

  // Initialize counseling sessions array if not present
  useEffect(() => {
    if (!formData.counseling_sessions) {
      setFormData(prev => ({ ...prev, counseling_sessions: [] }));
    }
  }, [formData.counseling_sessions]);

  // Determine which counselling types should be shown
  const counsellingRequirements = {
    // Existing behavioral counselling
    caffeine: clientProfile?.daily_caffeine_intake === "yes",
    tobacco: clientProfile?.tobacco_use_smoking === "yes" || clientProfile?.tobacco_use_sniffing === "yes",
    secondhand: clientProfile?.anyone_smokes_in_household === "yes",
    alcohol: clientProfile?.uses_alcohol_substances?.some(substance => 
      ["alcohol", "marijuana", "cocaine", "injectable_drugs"].includes(substance.toLowerCase())
    ),
    
    // New condition-based counselling
    syphilis: clinicalContext?.syphilis_test === "positive",
    hypertension: clinicalContext?.medical_history?.includes("hypertension"),
    hiv: clinicalContext?.hiv_status === "positive",
    hepatitis_b: clinicalContext?.hepatitis_b_test === "positive",
    uti: clinicalContext?.uti_detected === true,
    
    // Always applicable
    nutrition: true,
    preventive: true,
    immunization: true
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addGivenWhenThenSession = (type: GivenWhenThenSession['type']) => {
    const newSession: GivenWhenThenSession = {
      type,
      given_context: "",
      when_action: "",
      then_outcome: "",
      completion_status: "partial",
      counseling_date: new Date().toISOString().split('T')[0]
    };
    
    setFormData(prev => ({
      ...prev,
      counseling_sessions: [...(prev.counseling_sessions || []), newSession]
    }));
  };

  const updateGivenWhenThenSession = (index: number, field: keyof GivenWhenThenSession, value: any) => {
    setFormData(prev => ({
      ...prev,
      counseling_sessions: prev.counseling_sessions?.map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }));
  };

  const removeGivenWhenThenSession = (index: number) => {
    setFormData(prev => ({
      ...prev,
      counseling_sessions: prev.counseling_sessions?.filter((_, i) => i !== index)
    }));
  };

  const renderGivenWhenThenSection = (sessionType: GivenWhenThenSession['type'], title: string, color: string) => {
    const sessions = formData.counseling_sessions?.filter(s => s.type === sessionType) || [];
    
    return (
      <div className={`space-y-4 border border-${color}-200 rounded p-4 bg-${color}-50`}>
        <div className="flex justify-between items-center">
          <h4 className={`font-medium text-${color}-800`}>{title}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addGivenWhenThenSession(sessionType)}
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Session
          </Button>
        </div>
        
        {sessions.map((session, index) => (
          <div key={index} className="space-y-3 border border-gray-200 rounded p-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Session {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGivenWhenThenSession(formData.counseling_sessions?.findIndex(s => s === session) || 0)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Given (Clinical Context)
                </label>
                <textarea
                  value={session.given_context}
                  onChange={(e) => updateGivenWhenThenSession(
                    formData.counseling_sessions?.findIndex(s => s === session) || 0,
                    'given_context',
                    e.target.value
                  )}
                  className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Patient has positive HIV test result"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  When (Action Performed)
                </label>
                <textarea
                  value={session.when_action}
                  onChange={(e) => updateGivenWhenThenSession(
                    formData.counseling_sessions?.findIndex(s => s === session) || 0,
                    'when_action',
                    e.target.value
                  )}
                  className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., HIV counseling provided covering prevention, treatment, support"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Then (Observable Outcome)
                </label>
                <textarea
                  value={session.then_outcome}
                  onChange={(e) => updateGivenWhenThenSession(
                    formData.counseling_sessions?.findIndex(s => s === session) || 0,
                    'then_outcome',
                    e.target.value
                  )}
                  className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Patient demonstrates understanding, asks relevant questions"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={session.completion_status}
                  onChange={(e) => updateGivenWhenThenSession(
                    formData.counseling_sessions?.findIndex(s => s === session) || 0,
                    'completion_status',
                    e.target.value
                  )}
                  className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="partial">Partial</option>
                  <option value="completed">Completed</option>
                  <option value="deferred">Deferred</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Effectiveness (1-5)
                </label>
                <select
                  value={session.effectiveness_rating || ""}
                  onChange={(e) => updateGivenWhenThenSession(
                    formData.counseling_sessions?.findIndex(s => s === session) || 0,
                    'effectiveness_rating',
                    e.target.value ? Number(e.target.value) : undefined
                  )}
                  className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Not rated</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Follow-up Required
                </label>
                <select
                  value={session.follow_up_required ? "yes" : "no"}
                  onChange={(e) => updateGivenWhenThenSession(
                    formData.counseling_sessions?.findIndex(s => s === session) || 0,
                    'follow_up_required',
                    e.target.value === "yes"
                  )}
                  className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              
              {session.follow_up_required && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={session.follow_up_date || ""}
                    onChange={(e) => updateGivenWhenThenSession(
                      formData.counseling_sessions?.findIndex(s => s === session) || 0,
                      'follow_up_date',
                      e.target.value
                    )}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={session.notes || ""}
                onChange={(e) => updateGivenWhenThenSession(
                  formData.counseling_sessions?.findIndex(s => s === session) || 0,
                  'notes',
                  e.target.value
                )}
                className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about the counseling session"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Enhanced Behavioral Counselling with Given-When-Then Tracking</DialogTitle>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="clinical">Clinical</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="preventive">Preventive</TabsTrigger>
            <TabsTrigger value="immunization">Immunization</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="behavioral" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Behavioral Counselling</h3>
                
                {counsellingRequirements.caffeine && renderGivenWhenThenSection('nutrition', 'Caffeine Reduction Counselling', 'orange')}
                {counsellingRequirements.tobacco && renderGivenWhenThenSection('preventive', 'Tobacco Cessation Counselling', 'red')}
                {counsellingRequirements.secondhand && renderGivenWhenThenSection('preventive', 'Second-hand Smoke Counselling', 'purple')}
                {counsellingRequirements.alcohol && renderGivenWhenThenSection('preventive', 'Alcohol/Substance Counselling', 'green')}
              </div>
            </TabsContent>
            
            <TabsContent value="clinical" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Clinical Condition Counselling</h3>
                
                {counsellingRequirements.syphilis && renderGivenWhenThenSection('syphilis', 'Syphilis Counselling and Treatment', 'red')}
                {counsellingRequirements.hypertension && renderGivenWhenThenSection('hypertension', 'Hypertension Management Counselling', 'blue')}
                {counsellingRequirements.hiv && renderGivenWhenThenSection('hiv', 'HIV Positive Counselling', 'purple')}
                {counsellingRequirements.hepatitis_b && renderGivenWhenThenSection('hepatitis_b', 'Hepatitis B Counselling', 'yellow')}
              </div>
            </TabsContent>
            
            <TabsContent value="nutrition" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Nutrition Supplementation</h3>
                
                {/* Iron and Folic Acid Supplementation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Iron and Folic Acid (60mg + 0.4mg daily)</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iron_given" 
                          name="elemental_iron_andfolic_acid" 
                          value="given" 
                          checked={formData.elemental_iron_andfolic_acid === 'given'}
                          onChange={(e) => setFormData(prev => ({ ...prev, elemental_iron_andfolic_acid: e.target.value as 'given' | 'not_given' | 'alternative' }))}
                          className="text-blue-600" 
                        />
                        <label htmlFor="iron_given" className="text-sm">Given</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iron_not_given" 
                          name="elemental_iron_andfolic_acid" 
                          value="not_given" 
                          checked={formData.elemental_iron_andfolic_acid === 'not_given'}
                          onChange={(e) => setFormData(prev => ({ ...prev, elemental_iron_andfolic_acid: e.target.value as 'given' | 'not_given' | 'alternative' }))}
                          className="text-blue-600" 
                        />
                        <label htmlFor="iron_not_given" className="text-sm">Not given</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iron_alternative" 
                          name="elemental_iron_andfolic_acid" 
                          value="alternative" 
                          checked={formData.elemental_iron_andfolic_acid === 'alternative'}
                          onChange={(e) => setFormData(prev => ({ ...prev, elemental_iron_andfolic_acid: e.target.value as 'given' | 'not_given' | 'alternative' }))}
                          className="text-blue-600" 
                        />
                        <label htmlFor="iron_alternative" className="text-sm">Alternative</label>
                      </div>
                    </div>
                    
                    {/* Reason for not given */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Reason (if not given)</label>
                      <select 
                        value={formData.iron_folic_acid_reason || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, iron_folic_acid_reason: e.target.value as 'out_of_stock' | 'expired' | 'other_specify' }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        disabled={formData.elemental_iron_andfolic_acid === 'given'}
                      >
                        <option value="">Select reason</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="expired">Expired</option>
                        <option value="other_specify">Other (specify)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Specify (if other)</label>
                      <input 
                        type="text" 
                        value={formData.iron_folic_acid_specify || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, iron_folic_acid_specify: e.target.value }))}
                        disabled={formData.iron_folic_acid_reason !== 'other_specify'}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        placeholder="Specify reason..." 
                      />
                    </div>
                  </div>
                </div>

                {/* Calcium Supplementation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Calcium Supplementation (1.5-2.0g daily)</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="calcium_given" 
                          name="calcium_supplementation" 
                          value="given" 
                          checked={formData.calcium_supplementation === 'given'}
                          onChange={(e) => setFormData(prev => ({ ...prev, calcium_supplementation: e.target.value as 'given' | 'not_given' }))}
                          className="text-green-600" 
                        />
                        <label htmlFor="calcium_given" className="text-sm">Given</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="calcium_not_given" 
                          name="calcium_supplementation" 
                          value="not_given" 
                          checked={formData.calcium_supplementation === 'not_given'}
                          onChange={(e) => setFormData(prev => ({ ...prev, calcium_supplementation: e.target.value as 'given' | 'not_given' }))}
                          className="text-green-600" 
                        />
                        <label htmlFor="calcium_not_given" className="text-sm">Not given</label>
                      </div>
                    </div>
                    
                    {/* Reason for not given */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Reason (if not given)</label>
                      <select 
                        value={formData.calcium_reason || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, calcium_reason: e.target.value as 'out_of_stock' | 'expired' | 'other_specify' }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        disabled={formData.calcium_supplementation === 'given'}
                      >
                        <option value="">Select reason</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="expired">Expired</option>
                        <option value="other_specify">Other (specify)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Specify (if other)</label>
                      <input 
                        type="text" 
                        value={formData.calcium_specify || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, calcium_specify: e.target.value }))}
                        disabled={formData.calcium_reason !== 'other_specify'}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        placeholder="Specify reason..." 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preventive" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preventive Therapy</h3>
                
                {/* Malaria Prevention Counselling */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-3">Malaria Prevention Counselling</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="malaria_done" 
                          name="malaria_prevention_counselling" 
                          value="done" 
                          checked={formData.malaria_prevention_counselling === 'done'}
                          onChange={(e) => setFormData(prev => ({ ...prev, malaria_prevention_counselling: e.target.value as 'done' | 'not_done' }))}
                          className="text-yellow-600" 
                        />
                        <label htmlFor="malaria_done" className="text-sm">Done</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="malaria_not_done" 
                          name="malaria_prevention_counselling" 
                          value="not_done" 
                          checked={formData.malaria_prevention_counselling === 'not_done'}
                          onChange={(e) => setFormData(prev => ({ ...prev, malaria_prevention_counselling: e.target.value as 'done' | 'not_done' }))}
                          className="text-yellow-600" 
                        />
                        <label htmlFor="malaria_not_done" className="text-sm">Not done</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ITN (Insecticide Treated Net) */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">ITN (Insecticide Treated Net) Issued</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="itn_yes" 
                          name="itn_issued" 
                          value="yes" 
                          checked={formData.itn_issued === 'yes'}
                          onChange={(e) => setFormData(prev => ({ ...prev, itn_issued: e.target.value as 'yes' | 'no' }))}
                          className="text-green-600" 
                        />
                        <label htmlFor="itn_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="itn_no" 
                          name="itn_issued" 
                          value="no" 
                          checked={formData.itn_issued === 'no'}
                          onChange={(e) => setFormData(prev => ({ ...prev, itn_issued: e.target.value as 'yes' | 'no' }))}
                          className="text-green-600" 
                        />
                        <label htmlFor="itn_no" className="text-sm">No</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CPT (Co-trimoxazole) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">CPT (Co-trimoxazole 960mg OD oral)</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="cpt_yes" 
                          name="cpt_cotrimoxazole" 
                          value="yes" 
                          checked={formData.cpt_cotrimoxazole === 'yes'}
                          onChange={(e) => setFormData(prev => ({ ...prev, cpt_cotrimoxazole: e.target.value as 'yes' | 'no' }))}
                          className="text-blue-600" 
                        />
                        <label htmlFor="cpt_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="cpt_no" 
                          name="cpt_cotrimoxazole" 
                          value="no" 
                          checked={formData.cpt_cotrimoxazole === 'no'}
                          onChange={(e) => setFormData(prev => ({ ...prev, cpt_cotrimoxazole: e.target.value as 'yes' | 'no' }))}
                          className="text-blue-600" 
                        />
                        <label htmlFor="cpt_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {/* Reason for No */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Reason (if No)</label>
                      <select 
                        value={formData.cpt_reason || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, cpt_reason: e.target.value as 'out_of_stock' | 'expired' | 'other_specify' }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        disabled={formData.cpt_cotrimoxazole === 'yes'}
                      >
                        <option value="">Select reason</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="expired">Expired</option>
                        <option value="other_specify">Other (specify)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Specify (if other)</label>
                      <input 
                        type="text" 
                        value={formData.cpt_specify || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cpt_specify: e.target.value }))}
                        disabled={formData.cpt_reason !== 'other_specify'}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        placeholder="Specify reason..." 
                      />
                    </div>
                  </div>
                </div>

                {/* Deworming */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-3">Deworming (Mebendazole 500mg PO stat)</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="deworming_yes" 
                          name="deworming_mebendazole" 
                          value="yes" 
                          checked={formData.deworming_mebendazole === 'yes'}
                          onChange={(e) => setFormData(prev => ({ ...prev, deworming_mebendazole: e.target.value as 'yes' | 'no' }))}
                          className="text-purple-600" 
                        />
                        <label htmlFor="deworming_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="deworming_no" 
                          name="deworming_mebendazole" 
                          value="no" 
                          checked={formData.deworming_mebendazole === 'no'}
                          onChange={(e) => setFormData(prev => ({ ...prev, deworming_mebendazole: e.target.value as 'yes' | 'no' }))}
                          className="text-purple-600" 
                        />
                        <label htmlFor="deworming_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {/* Reason for No */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Reason (if No)</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                        <option value="">Select reason</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="expired">Expired</option>
                        <option value="other">Other (specify)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Specify (if other)</label>
                      <input type="text" className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="Specify reason..." />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="immunization" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Immunisation</h3>
                
                {/* TTCV Immunisation */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-800 mb-3">TTCV (Tetanus Toxoid) Immunisation</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="ttcv_done_today" 
                          name="ttcv_immunisation" 
                          value="done_today" 
                          checked={formData.ttcv_immunisation === 'done_today'}
                          onChange={(e) => setFormData(prev => ({ ...prev, ttcv_immunisation: e.target.value as 'done_today' | 'done_earlier' | 'not_done' }))}
                          className="text-indigo-600" 
                        />
                        <label htmlFor="ttcv_done_today" className="text-sm">Done today</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="ttcv_done_earlier" 
                          name="ttcv_immunisation" 
                          value="done_earlier" 
                          checked={formData.ttcv_immunisation === 'done_earlier'}
                          onChange={(e) => setFormData(prev => ({ ...prev, ttcv_immunisation: e.target.value as 'done_today' | 'done_earlier' | 'not_done' }))}
                          className="text-indigo-600" 
                        />
                        <label htmlFor="ttcv_done_earlier" className="text-sm">Done earlier</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="ttcv_not_done" 
                          name="ttcv_immunisation" 
                          value="not_done" 
                          checked={formData.ttcv_immunisation === 'not_done'}
                          onChange={(e) => setFormData(prev => ({ ...prev, ttcv_immunisation: e.target.value as 'done_today' | 'done_earlier' | 'not_done' }))}
                          className="text-indigo-600" 
                        />
                        <label htmlFor="ttcv_not_done" className="text-sm">Not done</label>
                      </div>
                    </div>
                    
                    {/* TTCV Dose Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">TTCV Dose No. (if done today or earlier)</label>
                      <select 
                        value={formData.ttcv_dose_number || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, ttcv_dose_number: e.target.value as '1' | '2' | '3' | '4' }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        disabled={formData.ttcv_immunisation === 'not_done'}
                      >
                        <option value="">Select dose number</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                    
                    {/* Date TTCV was given (if done earlier) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Date TTCV was given (if done earlier)</label>
                      <input 
                        type="date" 
                        value={formData.ttcv_date_given || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ttcv_date_given: e.target.value }))}
                        disabled={formData.ttcv_immunisation !== 'done_earlier'}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                      />
                    </div>
                    
                    {/* Reason for not done */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Reason (if not done)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_stock_out" 
                            checked={formData.ttcv_reason?.includes('stock_out') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'stock_out'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'stock_out') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_stock_out" className="text-sm">Stock out</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_expired" 
                            checked={formData.ttcv_reason?.includes('expired') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'expired'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'expired') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_expired" className="text-sm">Expired</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_woman_ill" 
                            checked={formData.ttcv_reason?.includes('woman_ill') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'woman_ill'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'woman_ill') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_woman_ill" className="text-sm">Woman is ill</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_woman_refused" 
                            checked={formData.ttcv_reason?.includes('woman_refused') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'woman_refused'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'woman_refused') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_woman_refused" className="text-sm">Woman refused</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_allergies" 
                            checked={formData.ttcv_reason?.includes('allergies') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'allergies'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'allergies') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_allergies" className="text-sm">Allergies</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_other" 
                            checked={formData.ttcv_reason?.includes('other_specify') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'other_specify'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'other_specify') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_other" className="text-sm">Other (specify)</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Specify (if other)</label>
                      <input 
                        type="text" 
                        value={formData.ttcv_specify || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ttcv_specify: e.target.value }))}
                        disabled={!formData.ttcv_reason?.includes('other_specify')}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        placeholder="Specify reason..." 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm"
              >
                Save Counselling Data
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}