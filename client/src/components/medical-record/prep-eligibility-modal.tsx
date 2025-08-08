import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Shield, Zap, Clock, ArrowLeft, BookOpen, CalendarClock, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';

interface EligibilityData {
  eligible: boolean | null;
  reason: string;
  status: "eligible" | "excluded" | "incomplete" | "pending" | "low_risk";
}

interface ClinicalRecommendations {
  decision: "eligible" | "contraindicated" | "conditional" | "pending";
  clinicalContext: string;
  immediateActions: string[];
  monitoringRequirements: string[];
  followUpTimeline: string;
  safetyConsiderations: string[];
  alternativeOptions: string[];
  protocolReferences: string[];
  screeningGuidance: string[];
}

interface PrepEligibilityModalProps {
  eligibilityData: EligibilityData;
  clinicalRecommendations: ClinicalRecommendations;
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  protocol?: string;
}

const PrepEligibilityModal: React.FC<PrepEligibilityModalProps> = ({
  eligibilityData,
  clinicalRecommendations,
  open,
  onClose,
  onAction,
  protocol = "PrEP Eligibility Assessment"
}) => {
  const [currentView, setCurrentView] = useState<'decision' | 'actions'>('decision');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log("🔘 ESCAPE KEY PRESSED - CLOSING ELIGIBILITY MODAL");
        onClose();
      }
      
      // Tab navigation between views
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        if (currentView === 'actions') setCurrentView('decision');
      } else if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        if (currentView === 'decision') setCurrentView('actions');
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose, currentView]);

  // Reset to decision view when modal opens
  useEffect(() => {
    if (open) {
      setCurrentView('decision');
      console.log("🔘 ELIGIBILITY MODAL OPENED - RESET TO DECISION VIEW");
    }
  }, [open]);

  const getDecisionIcon = () => {
    switch (clinicalRecommendations.decision) {
      case 'eligible': return <Shield size={24} className="text-green-600" />;
      case 'contraindicated': return <XCircle size={24} className="text-red-600" />;
      case 'conditional': return <Clock size={24} className="text-yellow-600" />;
      default: return <ClipboardCheck size={24} className="text-gray-600" />;
    }
  };

  const getDecisionColor = () => {
    switch (clinicalRecommendations.decision) {
      case 'eligible': return 'bg-green-600';
      case 'contraindicated': return 'bg-red-600';
      case 'conditional': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getDecisionTitle = () => {
    switch (clinicalRecommendations.decision) {
      case 'eligible': return 'PrEP RECOMMENDED';
      case 'contraindicated': return 'PrEP CONTRAINDICATED';
      case 'conditional': return 'CONDITIONAL ELIGIBILITY';
      default: return 'ASSESSMENT PENDING';
    }
  };

  const ClinicalDecisionView = () => {
    if (clinicalRecommendations.decision === 'pending') {
      return (
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <ClipboardCheck size={48} className="mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Assessment in Progress</h3>
            <p className="text-gray-600">Complete the eligibility assessment to receive comprehensive clinical guidance.</p>
          </div>
        </div>
      );
    }

    const getBannerColor = () => {
      switch (clinicalRecommendations.decision) {
        case 'eligible': return 'text-green-800 bg-green-50 border-green-200';
        case 'contraindicated': return 'text-red-800 bg-red-50 border-red-200';
        case 'conditional': return 'text-yellow-800 bg-yellow-50 border-yellow-200';
        default: return 'text-gray-800 bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className="p-6 max-h-96 overflow-y-auto">
        {/* Decision Header */}
        <div className={`p-4 rounded-lg border mb-6 ${getBannerColor()}`}>
          <div className="flex items-center mb-2">
            {getDecisionIcon()}
            <h3 className="text-lg font-bold ml-2">
              {clinicalRecommendations.decision === 'eligible' && 'PrEP Recommended'}
              {clinicalRecommendations.decision === 'contraindicated' && 'PrEP Contraindicated'}
              {clinicalRecommendations.decision === 'conditional' && 'Conditional Recommendation'}
            </h3>
          </div>
          {clinicalRecommendations.clinicalContext && (
            <p className="text-sm leading-relaxed">{clinicalRecommendations.clinicalContext}</p>
          )}
        </div>

        {/* Screening Guidance */}
        {clinicalRecommendations.screeningGuidance.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
              <ClipboardCheck size={16} className="mr-2" />
              Screening Results
            </h4>
            <div className="space-y-2">
              {clinicalRecommendations.screeningGuidance.map((guidance, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  {guidance}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Immediate Actions */}
        {clinicalRecommendations.immediateActions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
              <Zap size={16} className="mr-2" />
              Immediate Actions
            </h4>
            <ul className="space-y-2">
              {clinicalRecommendations.immediateActions.map((action, index) => (
                <li key={index} className="p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monitoring Requirements */}
        {clinicalRecommendations.monitoringRequirements.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
              <CalendarClock size={16} className="mr-2" />
              Monitoring Requirements
            </h4>
            <ul className="space-y-2">
              {clinicalRecommendations.monitoringRequirements.map((requirement, index) => (
                <li key={index} className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Considerations */}
        {clinicalRecommendations.safetyConsiderations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
              <Shield size={16} className="mr-2" />
              Safety Considerations
            </h4>
            <ul className="space-y-2">
              {clinicalRecommendations.safetyConsiderations.map((safety, index) => (
                <li key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {safety}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative Options */}
        {clinicalRecommendations.alternativeOptions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
              <ArrowLeft size={16} className="mr-2" />
              Alternative Options
            </h4>
            <ul className="space-y-2">
              {clinicalRecommendations.alternativeOptions.map((option, index) => (
                <li key={index} className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 flex items-start">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow-up Timeline */}
        {clinicalRecommendations.followUpTimeline && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
              <Clock size={16} className="mr-2" />
              Follow-up Timeline
            </h4>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
              {clinicalRecommendations.followUpTimeline}
            </div>
          </div>
        )}

        {/* Protocol References */}
        {clinicalRecommendations.protocolReferences.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
              <BookOpen size={16} className="mr-2" />
              Protocol References
            </h4>
            <div className="flex flex-wrap gap-2">
              {clinicalRecommendations.protocolReferences.map((ref, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs text-indigo-700">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation to Actions */}
        <div className="pt-4 border-t">
          <button 
            onClick={() => setCurrentView('actions')}
            className="w-full p-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors"
          >
            Continue to Actions
          </button>
        </div>
      </div>
    );
  };

  const ActionsView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Recommended Actions</h3>
        <button 
          onClick={() => setCurrentView('decision')}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded px-2 py-1"
        >
          <ArrowLeft size={16} className="mr-1" />Back to Decision
        </button>
      </div>
      
      <div className="space-y-3">
        {clinicalRecommendations.decision === 'eligible' && (
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("🔘 INITIATE PREP & CONTINUE TO PRESCRIPTION BUTTON CLICKED");
              setIsProcessing(true);
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                onAction('INITIATE_PREP_AND_PRESCRIBE');
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="w-full p-4 rounded-lg flex items-center transition-colors bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none disabled:bg-green-400"
          >
            <Shield size={20} className="mr-3" />
            <div className="text-left">
              <div className="font-semibold">
                {isProcessing ? 'Processing...' : 'Initiate PrEP & Continue to Prescription'}
              </div>
              <div className="text-sm text-green-100">
                {isProcessing ? 'Preparing prescription workflow...' : 'Begin PrEP protocol and complete prescription'}
              </div>
            </div>
          </button>
        )}
        
        {clinicalRecommendations.decision === 'contraindicated' && (
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("🔘 DEFER PREP BUTTON CLICKED");
              setIsProcessing(true);
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                onAction('DEFER_PREP');
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="w-full p-4 rounded-lg flex items-center transition-colors bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none disabled:bg-red-400"
          >
            <XCircle size={20} className="mr-3" />
            <div className="text-left">
              <div className="font-semibold">
                {isProcessing ? 'Processing...' : 'Defer PrEP'}
              </div>
              <div className="text-sm text-red-100">
                {isProcessing ? 'Recording deferral...' : 'Address contraindications first.'}
              </div>
            </div>
          </button>
        )}

        {clinicalRecommendations.decision === 'conditional' && (
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("🔘 REASSESS LATER BUTTON CLICKED");
              setIsProcessing(true);
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                onAction('REASSESS_LATER');
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="w-full p-4 rounded-lg flex items-center transition-colors bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-400 focus:outline-none disabled:bg-yellow-400"
          >
            <CalendarClock size={20} className="mr-3" />
            <div className="text-left">
              <div className="font-semibold">
                {isProcessing ? 'Processing...' : 'Schedule Reassessment'}
              </div>
              <div className="text-sm text-yellow-100">
                {isProcessing ? 'Scheduling follow-up...' : 'Reassess when conditions change.'}
              </div>
            </div>
          </button>
        )}

        <button 
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔘 DOCUMENT ASSESSMENT BUTTON CLICKED");
            setIsProcessing(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 500));
              onAction('DOCUMENT_ASSESSMENT');
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
          className="w-full p-4 rounded-lg flex items-center transition-colors bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-blue-400"
        >
          <BookOpen size={20} className="mr-3" />
          <div className="text-left font-semibold">
            {isProcessing ? 'Processing...' : 'Document Assessment'}
          </div>
        </button>

        {/* Schedule Follow-up Assessment - Available for all decisions */}
        <button 
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔘 SCHEDULE FOLLOW-UP ASSESSMENT BUTTON CLICKED");
            setIsProcessing(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 500));
              onAction('SCHEDULE_FOLLOWUP');
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
          className="w-full p-4 rounded-lg flex items-center transition-colors bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-blue-400"
        >
          <CalendarClock size={20} className="mr-3" />
          <div className="text-left">
            <div className="font-semibold">
              {isProcessing ? 'Processing...' : 'Schedule Follow-up Assessment'}
            </div>
            <div className="text-sm text-blue-100">
              {isProcessing ? 'Scheduling appointment...' : 'Plan next PrEP assessment visit'}
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'actions':
        return <ActionsView />;
      case 'decision':
      default:
        return <ClinicalDecisionView />;
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 font-sans"
      style={{ zIndex: 10000, pointerEvents: 'auto' }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          console.log("🔘 BACKDROP CLICKED - CLOSING ELIGIBILITY MODAL ONLY");
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fade-in"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <div className={`text-white p-4 flex items-center ${getDecisionColor()}`}>
          <div className="flex items-center">
            {getDecisionIcon()}
            <div className="ml-3">
              <h2 className="text-xl font-bold">{getDecisionTitle()}</h2>
              <p className="opacity-90 text-sm">Clinical Decision Support</p>
            </div>
          </div>
        </div>
        
        {renderContent()}

        <div className="bg-gray-100 px-6 py-3 flex items-center justify-between text-sm text-gray-600">
          <span>Protocol: {protocol}</span>
          <div className="flex items-center">
            <Clock size={14} className="mr-1.5" />
            <span>Real-time</span>
          </div>
        </div>
        
        {/* Close Button Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("🔘 CLOSE ELIGIBILITY MODAL BUTTON CLICKED - MODAL ONLY");
              onClose();
            }}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:outline-none disabled:bg-gray-400 transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Close'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );

  // Debug logging for modal rendering
  console.log("🔄 PrepEligibilityModal render check:", {
    open: open,
    eligibilityData: eligibilityData,
    decision: clinicalRecommendations.decision,
    shouldRender: open && eligibilityData && clinicalRecommendations
  });
  
  // Render modal only if open and data are both available
  if (!open || !eligibilityData || !clinicalRecommendations) {
    console.log("🔄 PrepEligibilityModal NOT rendering - open:", open, "eligibilityData:", !!eligibilityData, "recommendations:", !!clinicalRecommendations);
    return null;
  }
  
  console.log("🔄 PrepEligibilityModal IS rendering via portal");
  return createPortal(modalContent, document.body);
};

export default PrepEligibilityModal;