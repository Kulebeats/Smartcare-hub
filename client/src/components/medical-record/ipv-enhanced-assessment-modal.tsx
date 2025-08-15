import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Shield, Heart, Users, FileText, CheckCircle, Phone, MapPin, UserCheck, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { type IPVRiskAssessment } from '@/lib/ipv-decision-support';

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

  // Initialize risk factors from selected signs
  useEffect(() => {
    if (selectedSigns.length > 0) {
      const mappedFactors = selectedSigns
        .filter(sign => sign !== "No presenting signs or symptoms indicative of IPV")
        .map(sign => {
          // Map selected signs to risk factor IDs
          if (sign.includes('stress')) return 'ongoing_stress';
          if (sign.includes('anxiety')) return 'ongoing_anxiety';
          if (sign.includes('depression')) return 'ongoing_depression';
          if (sign.includes('alcohol')) return 'alcohol_misuse';
          if (sign.includes('drug')) return 'drug_misuse';
          if (sign.includes('self-harm') || sign.includes('suicide')) return 'self_harm_thoughts';
          if (sign.includes('STI')) return 'repeated_stis';
          if (sign.includes('unwanted pregnanc')) return 'unwanted_pregnancies';
          if (sign.includes('chronic pain')) return 'chronic_pain';
          if (sign.includes('injury')) return 'traumatic_injury';
          if (sign.includes('intrusive')) return 'intrusive_partner';
          if (sign.includes('misses')) return 'missed_appointments';
          if (sign.includes('children')) return 'children_problems';
          return null;
        })
        .filter(Boolean) as string[];

      setAssessmentData(prev => ({
        ...prev,
        riskFactors: mappedFactors
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

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const canProceed = () => {
    if (currentPage === 1) return assessmentData.patientAlone === 'yes';
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
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-xl flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Page 1: Privacy Check */}
          {currentPage === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">Privacy Assessment</h3>
                <p className="text-black mb-4">Ensure patient safety before proceeding with IPV assessment</p>
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
                <h4 className="text-lg font-semibold">Is the patient alone right now?</h4>
                <div className="space-y-4">
                  <label 
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      assessmentData.patientAlone === 'yes' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:bg-green-50 hover:border-green-300'
                    }`}
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
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      assessmentData.patientAlone === 'no' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:bg-red-50 hover:border-red-300'
                    }`}
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

          {/* Page 2: Risk Factors */}
          {currentPage === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">Risk Factor Screening</h3>
                <p className="text-black">Select any factors that apply to this patient</p>
              </div>

              {/* Training Prompt */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-purple-800 text-sm">
                    <p className="font-medium mb-1">Provider Guidance - How to Ask:</p>
                    <p className="italic">"I ask all my patients about their well-being at home because it affects health. Is there anything concerning you?"</p>
                    <p className="mt-1 text-xs">Use open-ended questions. Listen without judgment.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {Object.entries(
                  riskFactors.reduce((acc, factor) => {
                    if (!acc[factor.category]) acc[factor.category] = [];
                    acc[factor.category].push(factor);
                    return acc;
                  }, {} as Record<string, typeof riskFactors>)
                ).map(([category, factors]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                      {category === 'Emotional' && <Heart className="w-4 h-4 text-blue-600" />}
                      {category === 'Behavioral' && <Users className="w-4 h-4 text-purple-600" />}
                      {category === 'Self-harm' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {category === 'Reproductive' && <Heart className="w-4 h-4 text-pink-600" />}
                      {category === 'Physical' && <Shield className="w-4 h-4 text-green-600" />}
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {factors.map((factor) => (
                        <label key={factor.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={assessmentData.riskFactors.includes(factor.id)}
                            onChange={() => handleRiskFactorToggle(factor.id)}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-sm flex-1 text-black">{factor.label}</span>
                          {/* Contextual Help */}
                          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Ask sensitively about this factor">
                            ?
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {hasRiskFactors && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-800 font-semibold">⚠️ Risk Factors Detected</h4>
                      <p className="text-red-700 text-sm mt-1">
                        {assessmentData.riskFactors.length} risk factor(s) identified. First-line support required.
                      </p>
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
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

          {/* Page 4: First-Line Support */}
          {currentPage === 4 && hasRiskFactors && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">First-Line Support Tasks</h3>
                <p className="text-black">Complete the 5 essential support actions</p>
              </div>

              {/* WHO LIVES Protocol Reminder */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-indigo-800 text-sm">
                    <p className="font-semibold mb-1">WHO LIVES Protocol - Essential Actions:</p>
                    <p>Each step builds trust and empowers the woman. Complete all 5 steps in sequence.</p>
                    <p className="mt-1 text-xs">Remember: Her safety and autonomy are paramount.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'listened', label: 'LISTEN', desc: 'Listen closely with empathy, without judging' },
                  { key: 'inquired', label: 'INQUIRE', desc: 'Ask about needs and concerns (emotional, physical, practical)' },
                  { key: 'validated', label: 'VALIDATE', desc: 'Show understanding and belief - assure not to blame' },
                  { key: 'safetyPlan', label: 'ENHANCE SAFETY', desc: 'Discuss protection plan if violence occurs again' },
                  { key: 'connected', label: 'SUPPORT', desc: 'Connect to information, services and social support' }
                ].map(({ key, label, desc }) => (
                  <label key={key} className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    assessmentData.firstLineSupport[key as keyof typeof assessmentData.firstLineSupport] 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={assessmentData.firstLineSupport[key as keyof typeof assessmentData.firstLineSupport]}
                        onChange={() => handleCheckboxChange('firstLineSupport', key)}
                        className="mt-1 text-green-600"
                      />
                      <div>
                        <div className="font-semibold text-black">{label}</div>
                        <div className="text-sm text-black mt-1">{desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Safety Planning Questions
                </h5>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• "Do you have a safe place to go if needed?"</p>
                  <p>• "Do you have important documents accessible?"</p>
                  <p>• "Is there someone you trust for emergencies?"</p>
                  <p>• "Would you like information about support services?"</p>
                </div>
              </div>
            </div>
          )}

          {/* Page 5: Referrals & Documentation */}
          {currentPage === (hasRiskFactors ? 5 : 3) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  {hasRiskFactors ? 'Referrals & Documentation' : 'Documentation'}
                </h3>
                <p className="text-black">Complete assessment documentation</p>
              </div>

              {/* WHO Referral Protocol */}
              {hasRiskFactors && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <div className="flex gap-2">
                    <Phone className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-orange-800 text-sm">
                      <p className="font-semibold mb-1">WHO Referral Guidelines:</p>
                      <ul className="space-y-0.5 text-xs">
                        <li>• Obtain consent before making referrals</li>
                        <li>• Provide written information she can take safely</li>
                        <li>• Warm handover when possible (call together)</li>
                        <li>• Follow up within 2 weeks if safe to do so</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {hasRiskFactors && (
                <div>
                  <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Referrals Made
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Crisis hotline',
                      'Domestic violence shelter',
                      'Legal aid services',
                      'Mental health counseling',
                      'Social services',
                      'Police/law enforcement',
                      'Medical specialist',
                      'Support groups'
                    ].map((referral) => (
                      <label key={referral} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assessmentData.referrals.includes(referral)}
                          onChange={() => handleReferralToggle(referral)}
                          className="mr-2 text-blue-600"
                        />
                        <span className="text-sm text-black">{referral}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Clinical Notes <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={6}
                  value={assessmentData.notes}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Document findings, support provided, safety planning, and next steps..."
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
                <div className="text-sm text-green-800 grid grid-cols-2 gap-4">
                  <div>
                    <p>• Risk factors: <strong>{assessmentData.riskFactors.length}</strong></p>
                    <p>• Privacy maintained: <strong>{assessmentData.patientAlone === 'yes' ? 'Yes' : 'No'}</strong></p>
                  </div>
                  {hasRiskFactors && (
                    <div>
                      <p>• Support tasks: <strong>{Object.values(assessmentData.firstLineSupport).filter(Boolean).length}/5</strong></p>
                      <p>• Referrals: <strong>{assessmentData.referrals.length}</strong></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-500">WHO Clinical Guidelines</div>
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