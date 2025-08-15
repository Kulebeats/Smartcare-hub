import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Shield, Heart, Users, FileText, CheckCircle, Phone, MapPin, UserCheck, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { type IPVRiskAssessment } from '@/lib/ipv-decision-support';

interface LIVESProtocolData {
  listen: {
    narrative: string;
    activeListening: string[];
    clinicalNotes: string;
    completed: boolean;
  };
  inquire: {
    immediateSafety: boolean | null;
    safePlace: boolean | null;
    injuries: boolean | null;
    childrenAtRisk: boolean | null;
    additionalConcerns: string[];
    completed: boolean;
  };
  validate: {
    selectedPhrases: string[];
    customValidation: string;
    documentedResponse: string;
    completed: boolean;
  };
  enhanceSafety: {
    violenceIncreased: boolean | null;
    weaponsPresent: boolean | null;
    emergencyPlan: string;
    safeContacts: string[];
    codeWords: string;
    printablePlan: boolean;
    completed: boolean;
  };
  support: {
    referralsMade: string[];
    patientConsent: boolean | null;
    followUpPlanned: boolean | null;
    serviceDirectory: string[];
    completed: boolean;
  };
}

interface EnhancedIPVAssessmentData {
  patientAlone: 'yes' | 'no' | null;
  riskFactors: string[];
  firstLineSupport: {
    listened: boolean;
    inquired: boolean;
    validated: boolean;
    safetyPlan: boolean;
    connected: boolean;
  };
  livesProtocol: LIVESProtocolData;
  immediateNeeds: {
    emotional: boolean;
    physical: boolean;
    safety: boolean;
    support: boolean;
  };
  referrals: string[];
  notes: string;
}

interface IPVEnhancedAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSigns: string[];
  ipvAssessment: IPVRiskAssessment | null;
  onAssessmentComplete?: (data: EnhancedIPVAssessmentData) => void;
}

const IPVEnhancedAssessmentModal: React.FC<IPVEnhancedAssessmentModalProps> = ({
  isOpen,
  onClose,
  selectedSigns,
  ipvAssessment,
  onAssessmentComplete
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [assessmentData, setAssessmentData] = useState<EnhancedIPVAssessmentData>({
    patientAlone: null,
    riskFactors: [],
    firstLineSupport: {
      listened: false,
      inquired: false,
      validated: false,
      safetyPlan: false,
      connected: false
    },
    livesProtocol: {
      listen: {
        narrative: '',
        activeListening: [],
        clinicalNotes: '',
        completed: false
      },
      inquire: {
        immediateSafety: null,
        safePlace: null,
        injuries: null,
        childrenAtRisk: null,
        additionalConcerns: [],
        completed: false
      },
      validate: {
        selectedPhrases: [],
        customValidation: '',
        documentedResponse: '',
        completed: false
      },
      enhanceSafety: {
        violenceIncreased: null,
        weaponsPresent: null,
        emergencyPlan: '',
        safeContacts: [],
        codeWords: '',
        printablePlan: false,
        completed: false
      },
      support: {
        referralsMade: [],
        patientConsent: null,
        followUpPlanned: null,
        serviceDirectory: [],
        completed: false
      }
    },
    immediateNeeds: {
      emotional: false,
      physical: false,
      safety: false,
      support: false
    },
    referrals: [],
    notes: ''
  });

  // Categorized risk factors based on the attachment
  const riskFactors = [
    { id: 'ongoing_stress', label: 'Ongoing stress', category: 'Emotional' },
    { id: 'ongoing_anxiety', label: 'Ongoing anxiety', category: 'Emotional' },
    { id: 'ongoing_depression', label: 'Ongoing depression', category: 'Emotional' },
    { id: 'alcohol_misuse', label: 'Misuse of alcohol', category: 'Behavioral' },
    { id: 'drug_misuse', label: 'Misuse of drugs', category: 'Behavioral' },
    { id: 'self_harm_thoughts', label: 'Thoughts of self-harm or suicide', category: 'Self-harm' },
    { id: 'self_harm_plans', label: 'Plans of self-harm or suicide', category: 'Self-harm' },
    { id: 'repeated_stis', label: 'Repeated STIs', category: 'Reproductive' },
    { id: 'unwanted_pregnancies', label: 'Unwanted pregnancies', category: 'Reproductive' },
    { id: 'chronic_pain', label: 'Unexplained chronic pain', category: 'Physical' },
    { id: 'traumatic_injury', label: 'Unexplained traumatic injury', category: 'Physical' },
    { id: 'intrusive_partner', label: 'Partner intrusive during consultations', category: 'Behavioral' },
    { id: 'missed_appointments', label: 'Often misses appointments', category: 'Behavioral' },
    { id: 'children_problems', label: 'Children have emotional/behavioral problems', category: 'Behavioral' }
  ];

  // Map IPV signs to risk factors for initial assessment
  const mapIPVSignsToRiskFactors = (signs: string[]): string[] => {
    return signs
      .filter(sign => sign !== "No presenting signs or symptoms indicative of IPV")
      .map(sign => {
        // Map selected signs to risk factor IDs with comprehensive matching
        if (sign.toLowerCase().includes('stress')) return 'ongoing_stress';
        if (sign.toLowerCase().includes('anxiety')) return 'ongoing_anxiety';
        if (sign.toLowerCase().includes('depression')) return 'ongoing_depression';
        if (sign.toLowerCase().includes('alcohol')) return 'alcohol_misuse';
        if (sign.toLowerCase().includes('drug')) return 'drug_misuse';
        if (sign.toLowerCase().includes('self-harm') || sign.toLowerCase().includes('suicide')) return 'self_harm_thoughts';
        if (sign.toLowerCase().includes('sti') || sign.toLowerCase().includes('sexually transmitted')) return 'repeated_stis';
        if (sign.toLowerCase().includes('unwanted pregnanc')) return 'unwanted_pregnancies';
        if (sign.toLowerCase().includes('chronic pain')) return 'chronic_pain';
        if (sign.toLowerCase().includes('injury')) return 'traumatic_injury';
        if (sign.toLowerCase().includes('intrusive')) return 'intrusive_partner';
        if (sign.toLowerCase().includes('missed') || sign.toLowerCase().includes('misses')) return 'missed_appointments';
        if (sign.toLowerCase().includes('children')) return 'children_problems';
        // Additional mappings for comprehensive coverage
        if (sign.toLowerCase().includes('emotional')) return 'ongoing_stress';
        if (sign.toLowerCase().includes('trauma') || sign.toLowerCase().includes('ptsd')) return 'self_harm_thoughts';
        if (sign.toLowerCase().includes('reproductive')) return 'repeated_stis';
        if (sign.toLowerCase().includes('bleeding')) return 'repeated_stis';
        if (sign.toLowerCase().includes('gastrointestinal') || sign.toLowerCase().includes('genitourinary')) return 'chronic_pain';
        if (sign.toLowerCase().includes('partner')) return 'intrusive_partner';
        return null;
      })
      .filter(Boolean) as string[];
  };

  // Initialize risk factors from selected signs
  useEffect(() => {
    if (selectedSigns.length > 0) {
      const initialRiskFactors = mapIPVSignsToRiskFactors(selectedSigns);
      setAssessmentData(prev => ({
        ...prev,
        riskFactors: initialRiskFactors
      }));
    }
  }, [selectedSigns]);

  // Handle modal effects
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const hasRiskFactors = assessmentData.riskFactors.length > 0;
  const totalPages = hasRiskFactors ? 5 : 3;

  const handleRiskFactorToggle = (factorId: string) => {
    setAssessmentData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.includes(factorId) 
        ? prev.riskFactors.filter(id => id !== factorId)
        : [...prev.riskFactors, factorId]
    }));
  };

  const handleCheckboxChange = (section: keyof Pick<EnhancedIPVAssessmentData, 'firstLineSupport' | 'immediateNeeds'>, key: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]]
      }
    }));
  };

  const handleReferralToggle = (referral: string) => {
    setAssessmentData(prev => ({
      ...prev,
      referrals: prev.referrals.includes(referral)
        ? prev.referrals.filter(r => r !== referral)
        : [...prev.referrals, referral]
    }));
  };

  // LIVES Protocol helper functions
  const updateLIVESProtocol = (section: keyof LIVESProtocolData, updates: Partial<LIVESProtocolData[keyof LIVESProtocolData]>) => {
    setAssessmentData(prev => ({
      ...prev,
      livesProtocol: {
        ...prev.livesProtocol,
        [section]: {
          ...prev.livesProtocol[section],
          ...updates
        }
      }
    }));
  };

  // Removed interactive checkbox handlers since these are now guidance-only sections

  const handleSafeContactAdd = (contact: string) => {
    if (contact.trim()) {
      const current = assessmentData.livesProtocol.enhanceSafety.safeContacts;
      updateLIVESProtocol('enhanceSafety', {
        safeContacts: [...current, contact.trim()]
      });
    }
  };

  const handleSafeContactRemove = (index: number) => {
    const current = assessmentData.livesProtocol.enhanceSafety.safeContacts;
    updateLIVESProtocol('enhanceSafety', {
      safeContacts: current.filter((_, i) => i !== index)
    });
  };

  const handleSupportReferralToggle = (referral: string) => {
    const current = assessmentData.livesProtocol.support.referralsMade;
    updateLIVESProtocol('support', {
      referralsMade: current.includes(referral) 
        ? current.filter(r => r !== referral)
        : [...current, referral]
    });
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const canProceed = () => {
    if (currentPage === 1) return assessmentData.patientAlone === 'yes';
    if (currentPage === 4 && hasRiskFactors) {
      // For LIVES protocol, allow proceeding if some meaningful work has been done
      const hasListenContent = assessmentData.livesProtocol.listen.narrative.length > 0 ||
                              assessmentData.livesProtocol.listen.clinicalNotes.length > 0;
      const hasInquireContent = assessmentData.livesProtocol.inquire.immediateSafety !== null ||
                               assessmentData.livesProtocol.inquire.safePlace !== null;
      const hasSafetyContent = assessmentData.livesProtocol.enhanceSafety.emergencyPlan.length > 0 ||
                              assessmentData.livesProtocol.enhanceSafety.violenceIncreased !== null;
      const hasSupportContent = assessmentData.livesProtocol.support.referralsMade.length > 0 ||
                               assessmentData.livesProtocol.support.patientConsent !== null;
      
      // Allow proceeding if any phase has content or any phase is completed
      const contentCount = [hasListenContent, hasInquireContent, hasSafetyContent, hasSupportContent].filter(Boolean).length;
      const completedCount = [
        assessmentData.livesProtocol.listen.completed,
        assessmentData.livesProtocol.inquire.completed,
        assessmentData.livesProtocol.validate.completed,
        assessmentData.livesProtocol.enhanceSafety.completed,
        assessmentData.livesProtocol.support.completed
      ].filter(Boolean).length;
      
      return contentCount >= 1 || completedCount >= 1; // Flexible validation based on actual content
    }
    return true;
  };

  const handleComplete = () => {
    if (onAssessmentComplete) {
      onAssessmentComplete(assessmentData);
    }
    console.log('Enhanced IPV Assessment completed:', assessmentData);
    onClose();
  };

  if (!isOpen) return null;

  console.log('IPV Modal rendering - currentPage:', currentPage, 'totalPages:', totalPages);
  console.log('assessmentData:', assessmentData);
  console.log('Portal modal should be visible now');

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '896px',
          width: '100%',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pointerEvents: 'auto'
        }}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-xl flex-shrink-0 pt-[1px] pb-[1px]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">IPV Risk Assessment</h2>
            </div>
            <button 
              onClick={(e) => {
                console.log('Close button clicked');
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }} 
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              style={{ pointerEvents: 'auto' }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-red-100 mb-1">
              <span>Page {currentPage} of {totalPages}</span>
              <span>{Math.round((currentPage / totalPages) * 100)}%</span>
            </div>
            <div className="w-full bg-red-500 bg-opacity-30 rounded-full h-1.5">
              <div 
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
          
          {/* Page 1: Privacy Check */}
          {currentPage === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mt-[-13px] mb-[-13px]">Privacy Assessment</h3>
              </div>
              
              {/* WHO Protocol Reminder */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-800 text-sm">
                    <p className="font-semibold mb-1">WHO Protocol Requirements:</p>
                    <ul className="space-y-1">
                      <li>✓ <strong>Private setting:</strong> Door closed, no interruptions possible</li>
                      <li>✓ <strong>Confidentiality:</strong> Assured except if child at risk</li>
                      <li>✓ <strong>Time allocation:</strong> Minimum 15-20 minutes uninterrupted</li>
                      <li>✓ <strong>Training:</strong> Provider trained in sensitive inquiry</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              

              {/* Privacy Verification Checklist */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-[18px] mb-[18px] pt-[1px] pb-[1px]">
                <h4 className="text-sm font-semibold text-black mb-3">Privacy Verification Checklist:</h4>
                <div className="space-y-2 text-sm">
                  {[
                    'Door is closed and room is private',
                    'No partner, family, or friends present',
                    'No children over 2 years old present',
                    'Confidentiality has been explained'
                  ].map((item, index) => (
                    <label key={index} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input type="checkbox" className="mr-2 text-blue-600" />
                      <span className="text-black">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold pt-[-1px] pb-[-1px] mt-[-7px] mb-[-7px]">Is the patient alone right now?</h4>
                <div className="space-y-4">
                  <label 
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors border-gray-200 hover:bg-green-50 hover:border-green-300 mt-[4px] mb-[4px] pt-[4px] pb-[4px]"
                    onClick={(e) => {
                      console.log('Yes label clicked');
                      e.stopPropagation();
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <input
                      type="radio"
                      name="patientAlone"
                      value="yes"
                      checked={assessmentData.patientAlone === 'yes'}
                      onChange={(e) => {
                        console.log('Yes radio button clicked');
                        setAssessmentData(prev => ({ ...prev, patientAlone: e.target.value as 'yes' }));
                      }}
                      onClick={(e) => {
                        console.log('Yes radio button onClick');
                        e.stopPropagation();
                      }}
                      className="mr-3 text-green-600 w-4 h-4"
                      style={{ pointerEvents: 'auto' }}
                    />
                    <div>
                      <span className="font-medium text-black">✓ Yes, patient is alone</span>
                      <p className="text-sm text-black">Safe to proceed with IPV assessment</p>
                    </div>
                  </label>
                  
                  <label 
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors border-gray-200 hover:bg-red-50 hover:border-red-300 pt-[2px] pb-[2px] mt-[7px] mb-[7px]"
                    onClick={(e) => {
                      console.log('No label clicked');
                      e.stopPropagation();
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <input
                      type="radio"
                      name="patientAlone"
                      value="no"
                      checked={assessmentData.patientAlone === 'no'}
                      onChange={(e) => {
                        console.log('No radio button clicked');
                        setAssessmentData(prev => ({ ...prev, patientAlone: e.target.value as 'no' }));
                      }}
                      onClick={(e) => {
                        console.log('No radio button onClick');
                        e.stopPropagation();
                      }}
                      className="mr-3 text-red-600 w-4 h-4"
                      style={{ pointerEvents: 'auto' }}
                    />
                    <div>
                      <span className="font-medium text-black">✗ No, others are present</span>
                      <p className="text-sm text-black">Cannot safely conduct IPV assessment at this time</p>
                    </div>
                  </label>
                </div>

                {assessmentData.patientAlone === 'no' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div className="text-red-800">
                        <p className="font-medium">Assessment Blocked</p>
                        <p className="text-sm">For patient safety, IPV assessment can only proceed when patient is alone.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page 2: Review & Expand Assessment */}
          {currentPage === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">Review & Expand Assessment</h3>
                <p className="text-black">Confirm initial screening results and identify any additional concerns</p>
              </div>

              

              {/* Provider Guidance */}
              <div className="border border-purple-200 rounded-lg p-3 bg-[#f5fcff] text-[#1f2937e8]">
                <div className="flex gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-purple-800 text-sm">
                    <p className="font-medium mb-1">Deeper Assessment Guidance:</p>
                    <p className="italic">"During our conversation, have any additional concerns emerged that we should discuss?"</p>
                    <p className="mt-1 text-xs">Allow natural disclosure. Use empathetic responses.</p>
                  </div>
                </div>
              </div>

              {/* Additional Risk Factors */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  Additional Concerns Assessment
                </h4>
                <p className="text-black text-sm mb-4">
                  Based on further discussion, are there any additional risk factors to consider?
                </p>
                
                <div className="grid gap-3">
                  {Object.entries(
                    riskFactors.reduce((acc, factor) => {
                      if (!acc[factor.category]) acc[factor.category] = [];
                      acc[factor.category].push(factor);
                      return acc;
                    }, {} as Record<string, typeof riskFactors>)
                  ).map(([category, factors]) => (
                    <div key={category} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                      <h5 className="text-sm font-medium text-black mb-2 flex items-center gap-2">
                        {category === 'Emotional' && <Heart className="w-3 h-3 text-blue-600" />}
                        {category === 'Behavioral' && <Users className="w-3 h-3 text-purple-600" />}
                        {category === 'Self-harm' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                        {category === 'Reproductive' && <Heart className="w-3 h-3 text-pink-600" />}
                        {category === 'Physical' && <Shield className="w-3 h-3 text-green-600" />}
                        {category}
                      </h5>
                      <div className="grid grid-cols-1 gap-1">
                        {factors.map((factor) => {
                          const isInitialFactor = mapIPVSignsToRiskFactors(selectedSigns).includes(factor.id);
                          return (
                            <label key={factor.id} className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                              isInitialFactor ? 'bg-blue-100 border border-blue-200' : 'hover:bg-gray-100'
                            }`}>
                              <input
                                type="checkbox"
                                checked={assessmentData.riskFactors.includes(factor.id)}
                                onChange={() => handleRiskFactorToggle(factor.id)}
                                disabled={isInitialFactor}
                                className="mr-2 text-blue-600"
                              />
                              <span className={`text-xs flex-1 ${isInitialFactor ? 'text-blue-800 font-medium' : 'text-black'}`}>
                                {factor.label}
                                {isInitialFactor && <span className="ml-2 text-blue-600">(From initial screening)</span>}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {hasRiskFactors && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-800 font-semibold">⚠️ Risk Assessment Summary</h4>
                      <p className="text-red-700 text-sm mt-1">
                        {assessmentData.riskFactors.length} risk factor(s) confirmed. First-line support protocols will be initiated.
                      </p>
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Initial screening: {mapIPVSignsToRiskFactors(selectedSigns).length} factors</p>
                        <p>• Additional assessment: {assessmentData.riskFactors.length - mapIPVSignsToRiskFactors(selectedSigns).length} factors</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Page 3: Documentation (if no risk factors) OR Immediate Needs (if risk factors) */}
          {currentPage === 3 && !hasRiskFactors && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">Documentation</h3>
                <p className="text-black">Complete assessment documentation</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Assessment Result</h4>
                <p className="text-blue-800 text-sm">
                  No immediate risk factors identified. Continue with standard ANC care.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Clinical Notes
                </label>
                <textarea
                  rows={6}
                  value={assessmentData.notes}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Document assessment findings and any observations..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use objective language. Store securely - authorized access only.
                </p>
              </div>

              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Assessment Summary
                </h5>
                <div className="text-sm text-green-800">
                  <p>• Risk factors identified: <strong>{assessmentData.riskFactors.length}</strong></p>
                  <p>• Privacy maintained: <strong>{assessmentData.patientAlone === 'yes' ? 'Yes' : 'No'}</strong></p>
                  <p>• Assessment completed: <strong>Yes</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Page 3: Immediate Needs Assessment (if risk factors detected) */}
          {currentPage === 3 && hasRiskFactors && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">Immediate Needs Assessment</h3>
                <p className="text-black">Assess the 4 types of immediate needs</p>
              </div>

              {/* WHO Training Prompt */}
              <div className="border border-green-200 rounded-lg p-3 text-[#000000] bg-[#f0fdf4ad]">
                <div className="flex gap-2">
                  <Heart className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-green-800 text-sm">
                    <p className="font-medium mb-1">WHO Protocol - Immediate Response:</p>
                    <p>Assess needs without pressuring disclosure. Offer choices, not advice. Respect her decisions.</p>
                    <p className="mt-1 text-xs italic">"What would be most helpful for you right now?"</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'emotional', label: 'Emotional/Psychological Health', icon: Heart, color: 'blue' },
                  { key: 'physical', label: 'Physical Health', icon: Shield, color: 'green' },
                  { key: 'safety', label: 'Safety Planning', icon: AlertTriangle, color: 'red' },
                  { key: 'support', label: 'Support & Mental Health', icon: Users, color: 'purple' }
                ].map(({ key, label, icon: Icon, color }) => (
                  <label key={key} className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    assessmentData.immediateNeeds[key as keyof typeof assessmentData.immediateNeeds] 
                      ? `border-${color}-300 bg-${color}-50` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={assessmentData.immediateNeeds[key as keyof typeof assessmentData.immediateNeeds]}
                      onChange={() => handleCheckboxChange('immediateNeeds', key)}
                      className={`mb-3 text-${color}-600`}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                      <span className="font-medium text-black">{label}</span>
                    </div>
                    <p className="text-sm text-black">
                      {key === 'emotional' && 'Immediate psychological support needed'}
                      {key === 'physical' && 'Medical attention or treatment required'}
                      {key === 'safety' && 'Ongoing safety concerns to address'}
                      {key === 'support' && 'Long-term support services needed'}
                    </p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Page 4: WHO LIVES Protocol */}
          {currentPage === 4 && hasRiskFactors && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">WHO LIVES Protocol</h3>
                <p className="text-black">Comprehensive first-line support through structured clinical guidance</p>
              </div>

              {/* Protocol Overview */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-indigo-800 text-sm">
                    <p className="font-semibold mb-1">WHO LIVES Protocol - Essential Actions:</p>
                    <p>Follow each step sequentially to provide comprehensive, evidence-based support.</p>
                    <p className="mt-1 text-xs">Remember: Survivor autonomy and safety are paramount.</p>
                  </div>
                </div>
              </div>

              {/* L - LISTEN Component */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">L</div>
                  <h4 className="font-bold text-black text-lg">LISTEN</h4>
                  <div className="ml-auto">
                    {assessmentData.livesProtocol.listen.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Clinical Guidance */}
                <div className="border border-purple-200 rounded-lg p-3 mb-4 bg-[#f5fcff] text-[#1f2937e8]">
                  <div className="flex gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-purple-800 text-sm">
                      <p className="font-medium mb-1">Clinical Guidance:</p>
                      <p className="italic">"Listen with empathy and without judgment. Use active listening techniques."</p>
                      <p className="mt-1 text-xs">Allow for silence. Do not rush the patient.</p>
                    </div>
                  </div>
                </div>

                {/* Active Listening Techniques Guide */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Active Listening Techniques
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-black text-sm mb-2">Use these supportive phrases during conversation:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-black">
                      <p>• "I understand"</p>
                      <p>• "I see"</p>
                      <p>• "That must have been difficult"</p>
                      <p>• "Thank you for sharing"</p>
                      <p>• "I hear you"</p>
                      <p>• "Tell me more"</p>
                      <p>• "That sounds challenging"</p>
                      <p>• "You are being very brave"</p>
                    </div>
                  </div>
                </div>

                {/* Secure Narrative Area */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Patient Narrative (Secure Documentation)
                  </label>
                  <textarea
                    rows={4}
                    value={assessmentData.livesProtocol.listen.narrative}
                    onChange={(e) => updateLIVESProtocol('listen', { narrative: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Document the survivor's narrative in their own words..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🔒 Encrypted storage. Use patient's exact words when possible.
                  </p>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Clinical Observations
                  </label>
                  <textarea
                    rows={3}
                    value={assessmentData.livesProtocol.listen.clinicalNotes}
                    onChange={(e) => updateLIVESProtocol('listen', { clinicalNotes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Clinical observations about emotional state, body language, etc..."
                  />
                </div>

                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assessmentData.livesProtocol.listen.completed}
                      onChange={(e) => updateLIVESProtocol('listen', { completed: e.target.checked })}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-medium text-black">Mark LISTEN phase as complete</span>
                  </label>
                </div>
              </div>

              {/* I - INQUIRE Component */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">I</div>
                  <h4 className="font-bold text-black text-lg">INQUIRE</h4>
                  <div className="ml-auto">
                    {assessmentData.livesProtocol.inquire.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Clinical Guidance */}
                <div className="border border-purple-200 rounded-lg p-3 mb-4 bg-[#f5fcff] text-[#1f2937e8]">
                  <div className="flex gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-purple-800 text-sm">
                      <p className="font-medium mb-1">Assessment Focus:</p>
                      <p className="italic">Ask about immediate needs and concerns without pressuring disclosure.</p>
                      <p className="mt-1 text-xs">Focus on safety, physical needs, and emotional support.</p>
                    </div>
                  </div>
                </div>

                {/* Immediate Safety Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {[
                    { key: 'immediateSafety', label: 'Are you safe right now?', icon: Shield },
                    { key: 'safePlace', label: 'Do you need a safe place to go?', icon: MapPin },
                    { key: 'injuries', label: 'Do you have any injuries that need attention?', icon: Heart },
                    { key: 'childrenAtRisk', label: 'Are there children at risk?', icon: Users }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-3 bg-white/60">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-black">{label}</span>
                      </div>
                      <div className="flex gap-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={key}
                            checked={assessmentData.livesProtocol.inquire[key as keyof typeof assessmentData.livesProtocol.inquire] === true}
                            onChange={() => updateLIVESProtocol('inquire', { [key]: true })}
                            className="mr-1 text-green-600"
                          />
                          <span className="text-xs text-black">Yes</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={key}
                            checked={assessmentData.livesProtocol.inquire[key as keyof typeof assessmentData.livesProtocol.inquire] === false}
                            onChange={() => updateLIVESProtocol('inquire', { [key]: false })}
                            className="mr-1 text-red-600"
                          />
                          <span className="text-xs text-black">No</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assessmentData.livesProtocol.inquire.completed}
                      onChange={(e) => updateLIVESProtocol('inquire', { completed: e.target.checked })}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-medium text-black">Mark INQUIRE phase as complete</span>
                  </label>
                </div>
              </div>

              {/* V - VALIDATE Component */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">V</div>
                  <h4 className="font-bold text-black text-lg">VALIDATE</h4>
                  <div className="ml-auto">
                    {assessmentData.livesProtocol.validate.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Clinical Guidance */}
                <div className="border border-purple-200 rounded-lg p-3 mb-4 bg-[#f5fcff] text-[#1f2937e8]">
                  <div className="flex gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-purple-800 text-sm">
                      <p className="font-medium mb-1">Validation Guidelines:</p>
                      <p className="italic">Show understanding and belief. Assure them they are not to blame.</p>
                      <p className="mt-1 text-xs">Use non-judgmental, supportive language.</p>
                    </div>
                  </div>
                </div>

                {/* Validation Phrases Guide */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Validation Phrases
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-black text-sm mb-2">Use these supportive validation statements:</p>
                    <div className="space-y-1 text-xs text-black">
                      <p>• "Thank you for telling me. I know this was difficult."</p>
                      <p>• "You are not to blame."</p>
                      <p>• "You are not alone; this happens to many women."</p>
                      <p>• "I believe you."</p>
                      <p>• "You are being very brave by talking about this."</p>
                      <p>• "What happened to you is not okay."</p>
                      <p>• "You deserve to be treated with respect."</p>
                      <p>• "It takes courage to seek help."</p>
                    </div>
                  </div>
                </div>

                {/* Custom Validation */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Additional Validation Messages
                  </label>
                  <textarea
                    rows={3}
                    value={assessmentData.livesProtocol.validate.customValidation}
                    onChange={(e) => updateLIVESProtocol('validate', { customValidation: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Additional validation messages or patient responses..."
                  />
                </div>

                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assessmentData.livesProtocol.validate.completed}
                      onChange={(e) => updateLIVESProtocol('validate', { completed: e.target.checked })}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-medium text-black">Mark VALIDATE phase as complete</span>
                  </label>
                </div>
              </div>

              {/* E - ENHANCE SAFETY Component */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">E</div>
                  <h4 className="font-bold text-black text-lg">ENHANCE SAFETY</h4>
                  <div className="ml-auto">
                    {assessmentData.livesProtocol.enhanceSafety.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Clinical Guidance */}
                <div className="border border-purple-200 rounded-lg p-3 mb-4 bg-[#f5fcff] text-[#1f2937e8]">
                  <div className="flex gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-purple-800 text-sm">
                      <p className="font-medium mb-1">Safety Planning Focus:</p>
                      <p className="italic">Discuss protection plans if violence occurs again. Respect her choices.</p>
                      <p className="mt-1 text-xs">Collaborate on safety strategies. Document agreed-upon plans.</p>
                    </div>
                  </div>
                </div>

                {/* Safety Assessment Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border border-gray-200 rounded-lg p-3 bg-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-black">Has the level of violence increased recently?</span>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="violenceIncreased"
                          checked={assessmentData.livesProtocol.enhanceSafety.violenceIncreased === true}
                          onChange={() => updateLIVESProtocol('enhanceSafety', { violenceIncreased: true })}
                          className="mr-1 text-red-600"
                        />
                        <span className="text-xs text-black">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="violenceIncreased"
                          checked={assessmentData.livesProtocol.enhanceSafety.violenceIncreased === false}
                          onChange={() => updateLIVESProtocol('enhanceSafety', { violenceIncreased: false })}
                          className="mr-1 text-green-600"
                        />
                        <span className="text-xs text-black">No</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-black">Are there weapons in the home?</span>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="weaponsPresent"
                          checked={assessmentData.livesProtocol.enhanceSafety.weaponsPresent === true}
                          onChange={() => updateLIVESProtocol('enhanceSafety', { weaponsPresent: true })}
                          className="mr-1 text-red-600"
                        />
                        <span className="text-xs text-black">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="weaponsPresent"
                          checked={assessmentData.livesProtocol.enhanceSafety.weaponsPresent === false}
                          onChange={() => updateLIVESProtocol('enhanceSafety', { weaponsPresent: false })}
                          className="mr-1 text-green-600"
                        />
                        <span className="text-xs text-black">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Emergency Plan */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Emergency Safety Plan
                  </label>
                  <textarea
                    rows={4}
                    value={assessmentData.livesProtocol.enhanceSafety.emergencyPlan}
                    onChange={(e) => updateLIVESProtocol('enhanceSafety', { emergencyPlan: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Document the agreed-upon emergency plan: Where to go, who to call, what to do..."
                  />
                </div>

                {/* Safe Contacts */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Safe Contacts
                  </label>
                  <div className="space-y-2">
                    {assessmentData.livesProtocol.enhanceSafety.safeContacts.map((contact, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white/60 rounded border">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-black flex-1">{contact}</span>
                        <button
                          onClick={() => handleSafeContactRemove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Add safe contact..."
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          handleSafeContactAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Code Words */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Code Words/Phrases
                  </label>
                  <input
                    type="text"
                    value={assessmentData.livesProtocol.enhanceSafety.codeWords}
                    onChange={(e) => updateLIVESProtocol('enhanceSafety', { codeWords: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Discrete code words or phrases for emergency communication..."
                  />
                </div>

                {/* Printable Plan Option */}
                <div className="mb-3">
                  <label className="flex items-center p-2 hover:bg-red-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assessmentData.livesProtocol.enhanceSafety.printablePlan}
                      onChange={(e) => updateLIVESProtocol('enhanceSafety', { printablePlan: e.target.checked })}
                      className="mr-2 text-red-600"
                    />
                    <span className="text-sm text-black">Generate discrete printable safety plan summary</span>
                  </label>
                </div>

                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assessmentData.livesProtocol.enhanceSafety.completed}
                      onChange={(e) => updateLIVESProtocol('enhanceSafety', { completed: e.target.checked })}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-medium text-black">Mark ENHANCE SAFETY phase as complete</span>
                  </label>
                </div>
              </div>

              {/* S - SUPPORT Component */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">S</div>
                  <h4 className="font-bold text-black text-lg">SUPPORT</h4>
                  <div className="ml-auto">
                    {assessmentData.livesProtocol.support.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Clinical Guidance */}
                <div className="border border-purple-200 rounded-lg p-3 mb-4 bg-[#f5fcff] text-[#1f2937e8]">
                  <div className="flex gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-purple-800 text-sm">
                      <p className="font-medium mb-1">Support Connection:</p>
                      <p className="italic">"Would you like me to connect you with someone who can help further?"</p>
                      <p className="mt-1 text-xs">Offer referrals based on expressed needs. Obtain consent first.</p>
                    </div>
                  </div>
                </div>

                {/* Consent Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border border-gray-200 rounded-lg p-3 bg-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-black">Patient consents to referrals?</span>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="patientConsent"
                          checked={assessmentData.livesProtocol.support.patientConsent === true}
                          onChange={() => updateLIVESProtocol('support', { patientConsent: true })}
                          className="mr-1 text-green-600"
                        />
                        <span className="text-xs text-black">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="patientConsent"
                          checked={assessmentData.livesProtocol.support.patientConsent === false}
                          onChange={() => updateLIVESProtocol('support', { patientConsent: false })}
                          className="mr-1 text-red-600"
                        />
                        <span className="text-xs text-black">No</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-black">Follow-up planned?</span>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="followUpPlanned"
                          checked={assessmentData.livesProtocol.support.followUpPlanned === true}
                          onChange={() => updateLIVESProtocol('support', { followUpPlanned: true })}
                          className="mr-1 text-green-600"
                        />
                        <span className="text-xs text-black">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="followUpPlanned"
                          checked={assessmentData.livesProtocol.support.followUpPlanned === false}
                          onChange={() => updateLIVESProtocol('support', { followUpPlanned: false })}
                          className="mr-1 text-red-600"
                        />
                        <span className="text-xs text-black">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Referral Directory */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Referrals Made
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Crisis hotline (24/7)',
                      'Domestic violence shelter',
                      'Legal aid services',
                      'Mental health counseling',
                      'Social services',
                      'Police victim support',
                      'Medical specialist',
                      'Support groups',
                      'Emergency financial aid',
                      'Housing assistance',
                      'Child protection services',
                      'Immigration support'
                    ].map((referral) => (
                      <label key={referral} className="flex items-center p-2 hover:bg-purple-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assessmentData.livesProtocol.support.referralsMade.includes(referral)}
                          onChange={() => handleSupportReferralToggle(referral)}
                          className="mr-2 text-purple-600"
                        />
                        <span className="text-xs text-black">{referral}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assessmentData.livesProtocol.support.completed}
                      onChange={(e) => updateLIVESProtocol('support', { completed: e.target.checked })}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-medium text-black">Mark SUPPORT phase as complete</span>
                  </label>
                </div>
              </div>

              {/* Progress and Navigation Helper */}
              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4">
                <div className="flex">
                  <FileText className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-indigo-800 font-semibold">Progress & Next Steps</h4>
                    <div className="text-indigo-700 text-sm mt-2">
                      <p className="mb-2">Complete any of these activities to proceed to final documentation:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <p>• Add patient narrative or observations (Listen)</p>
                        <p>• Answer immediate safety questions (Inquire)</p>
                        <p>• Mark validation phase complete (Validate)</p>
                        <p>• Complete safety planning (Enhance Safety)</p>
                        <p>• Make referrals (Support)</p>
                        <p>• Mark any phase as complete</p>
                      </div>
                    </div>
                    <div className="text-indigo-700 text-xs mt-3 p-2 bg-indigo-100 rounded">
                      <p className="font-medium">Protocol Status: {[
                        assessmentData.livesProtocol.listen.completed,
                        assessmentData.livesProtocol.inquire.completed,
                        assessmentData.livesProtocol.validate.completed,
                        assessmentData.livesProtocol.enhanceSafety.completed,
                        assessmentData.livesProtocol.support.completed
                      ].filter(Boolean).length}/5 phases complete</p>
                      <p className="mt-1">
                        {(() => {
                          const hasListenContent = assessmentData.livesProtocol.listen.narrative.length > 0 ||
                                                  assessmentData.livesProtocol.listen.clinicalNotes.length > 0;
                          const hasInquireContent = assessmentData.livesProtocol.inquire.immediateSafety !== null ||
                                                   assessmentData.livesProtocol.inquire.safePlace !== null;
                          const hasSafetyContent = assessmentData.livesProtocol.enhanceSafety.emergencyPlan.length > 0 ||
                                                  assessmentData.livesProtocol.enhanceSafety.violenceIncreased !== null;
                          const hasSupportContent = assessmentData.livesProtocol.support.referralsMade.length > 0 ||
                                                   assessmentData.livesProtocol.support.patientConsent !== null;
                          
                          const contentCount = [hasListenContent, hasInquireContent, hasSafetyContent, hasSupportContent].filter(Boolean).length;
                          const completedCount = [
                            assessmentData.livesProtocol.listen.completed,
                            assessmentData.livesProtocol.inquire.completed,
                            assessmentData.livesProtocol.validate.completed,
                            assessmentData.livesProtocol.enhanceSafety.completed,
                            assessmentData.livesProtocol.support.completed
                          ].filter(Boolean).length;
                          
                          if (contentCount >= 1 || completedCount >= 1) {
                            return "✅ Ready to proceed to final documentation";
                          } else {
                            return "⏳ Complete at least one LIVES activity above to continue";
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page 5: Final Documentation */}
          {currentPage === (hasRiskFactors ? 5 : 3) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">Final Documentation</h3>
                <p className="text-black">Complete comprehensive assessment documentation</p>
              </div>

              {/* Final Clinical Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Comprehensive Clinical Notes <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={8}
                  value={assessmentData.notes}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={hasRiskFactors ? 
                    "Document comprehensive assessment findings, LIVES protocol implementation, safety planning outcomes, referrals made, and recommended next steps..." :
                    "Document assessment findings and any observations..."}
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Use objective language. Store securely - authorized access only.
                </p>
              </div>

              {/* Comprehensive Assessment Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Complete Assessment Summary
                </h5>
                <div className="text-sm text-green-800 space-y-3">
                  {/* Basic Assessment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>• Risk factors identified: <strong>{assessmentData.riskFactors.length}</strong></p>
                      <p>• Privacy maintained: <strong>{assessmentData.patientAlone === 'yes' ? 'Yes' : 'No'}</strong></p>
                    </div>
                    <div>
                      <p>• Assessment completed: <strong>Yes</strong></p>
                      <p>• Documentation: <strong>{assessmentData.notes.length > 50 ? 'Complete' : 'Pending'}</strong></p>
                    </div>
                  </div>

                  {/* LIVES Protocol Summary */}
                  {hasRiskFactors && (
                    <div className="border-t pt-3 mt-3">
                      <p className="font-semibold mb-2">WHO LIVES Protocol Implementation:</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p>• Listen: {assessmentData.livesProtocol.listen.completed ? '✓ Complete' : '○ Pending'}</p>
                          <p>• Inquire: {assessmentData.livesProtocol.inquire.completed ? '✓ Complete' : '○ Pending'}</p>
                        </div>
                        <div>
                          <p>• Validate: {assessmentData.livesProtocol.validate.completed ? '✓ Complete' : '○ Pending'}</p>
                          <p>• Enhance Safety: {assessmentData.livesProtocol.enhanceSafety.completed ? '✓ Complete' : '○ Pending'}</p>
                        </div>
                        <div>
                          <p>• Support: {assessmentData.livesProtocol.support.completed ? '✓ Complete' : '○ Pending'}</p>
                          <p><strong>Protocol: {[
                            assessmentData.livesProtocol.listen.completed,
                            assessmentData.livesProtocol.inquire.completed,
                            assessmentData.livesProtocol.validate.completed,
                            assessmentData.livesProtocol.enhanceSafety.completed,
                            assessmentData.livesProtocol.support.completed
                          ].filter(Boolean).length}/5 Complete</strong></p>
                        </div>
                      </div>
                      
                      {/* Detailed LIVES Summary */}
                      <div className="mt-3 space-y-2">
                        <p>• Patient narrative documented: <strong>{assessmentData.livesProtocol.listen.narrative.length > 0 ? 'Yes' : 'No'}</strong></p>
                        <p>• Clinical observations noted: <strong>{assessmentData.livesProtocol.listen.clinicalNotes.length > 0 ? 'Yes' : 'No'}</strong></p>
                        <p>• Safety contacts identified: <strong>{assessmentData.livesProtocol.enhanceSafety.safeContacts.length}</strong></p>
                        <p>• Referrals provided: <strong>{assessmentData.livesProtocol.support.referralsMade.length}</strong></p>
                        <p>• Safety plan generated: <strong>{assessmentData.livesProtocol.enhanceSafety.printablePlan ? 'Yes' : 'No'}</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Final Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Recommendations & Next Steps
                </h5>
                <div className="text-sm text-blue-800 space-y-1">
                  {!hasRiskFactors ? (
                    <>
                      <p>• Continue with standard ANC care protocols</p>
                      <p>• Routine follow-up at next scheduled visit</p>
                      <p>• Maintain supportive, non-judgmental care environment</p>
                    </>
                  ) : (
                    <>
                      <p>• Follow-up on safety planning within 1-2 weeks (if safe to do so)</p>
                      <p>• Monitor for escalation of risk factors at future visits</p>
                      <p>• Ensure all referral connections were successful</p>
                      <p>• Document any changes in safety situation</p>
                      <p>• Continue trauma-informed care approach</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-500">WHO Guidelines for Intimate Partner & Sexual Violence 2013</div>
          <div className="flex gap-3">
            {currentPage > 1 && (
              <button 
                onClick={(e) => {
                  console.log('Previous button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  prevPage();
                }} 
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                style={{ pointerEvents: 'auto' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            {currentPage < totalPages ? (
              <button 
                onClick={(e) => {
                  console.log('Next button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  nextPage();
                }} 
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ pointerEvents: 'auto' }}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  console.log('Complete Assessment button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  handleComplete();
                }}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                style={{ pointerEvents: 'auto' }}
              >
                <CheckCircle className="w-4 h-4" />
                Complete Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Ensure document.body exists before creating portal
  if (typeof document === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
};

export default IPVEnhancedAssessmentModal;
export type { EnhancedIPVAssessmentData };