import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Shield, Zap, Clock, ArrowLeft, BookOpen, CalendarClock, ClipboardCheck } from 'lucide-react';

interface RiskCalculationResult {
  level: string;
  score: number;
  recommendations: string[];
  contraindications: string[];
  followUpFrequency: string;
  clinicalActions: string[];
  shouldShowModal: boolean;
  shouldShowToast: boolean;
}

interface PrepDynamicAlertModalProps {
  riskInfo: RiskCalculationResult | null;
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  maxScore?: number;
  protocol?: string;
}

const PrepDynamicAlertModal: React.FC<PrepDynamicAlertModalProps> = ({
  riskInfo,
  open,
  onClose,
  onAction,
  maxScore = 20,
  protocol = "ANC PrEP Assessment"
}) => {
  const [currentView, setCurrentView] = useState<'actions' | 'recommendations' | 'readiness'>('actions');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log("🔘 ESCAPE KEY PRESSED - CLOSING MODAL");
        onClose();
      }
      
      // Tab navigation between views
      if (event.key === 'Tab' && event.shiftKey) {
        // Shift+Tab - previous view
        event.preventDefault();
        if (currentView === 'readiness') setCurrentView('recommendations');
        else if (currentView === 'recommendations') setCurrentView('actions');
      } else if (event.key === 'Tab' && !event.shiftKey) {
        // Tab - next view
        event.preventDefault();
        if (currentView === 'actions') setCurrentView('recommendations');
        else if (currentView === 'recommendations') setCurrentView('readiness');
      }
    };
    
    if (open && riskInfo) {
      window.addEventListener('keydown', handleKeyDown);
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, riskInfo, onClose, currentView]);

  // Reset to the main action view whenever the alert is opened for a new patient
  useEffect(() => {
    if (open && riskInfo) {
      setCurrentView('actions');
      console.log("🔘 MODAL OPENED - RESET TO ACTIONS VIEW");
    }
  }, [open, riskInfo]);

  // CRITICAL FIX: Only render when both open AND riskInfo exist
  console.log("🔍 MODAL RENDER DEBUG:", { 
    open, 
    riskInfo: !!riskInfo, 
    riskLevel: riskInfo?.level,
    shouldShowModal: riskInfo?.shouldShowModal 
  });
  
  if (!open || !riskInfo) {
    console.log("❌ MODAL NOT RENDERING:", { open, riskInfo: !!riskInfo });
    return null;
  }
  
  console.log("✅ MODAL RENDERING:", riskInfo.level, "risk level");

  const getRiskProfile = (score: number) => {
    // CORRECTED THRESHOLDS: Low (0-4), Moderate (5-9), High (≥10)
    if (score <= 4) return { 
      level: 'Low', 
      recommendation: 'Reassess later in pregnancy', 
      headerClass: 'bg-gray-500', 
      bannerClass: 'bg-gray-50 border-gray-500 text-gray-800' 
    };
    if (score <= 9) return { 
      level: 'Moderate', 
      recommendation: 'Offer PrEP, tailor counseling', 
      headerClass: 'bg-yellow-500', 
      bannerClass: 'bg-yellow-50 border-yellow-500 text-yellow-800' 
    };
    return { 
      level: 'High', 
      recommendation: 'Strongly recommend PrEP initiation', 
      headerClass: 'bg-red-600', 
      bannerClass: 'bg-red-50 border-red-500 text-red-800' 
    };
  };

  const riskProfile = getRiskProfile(riskInfo.score);



  const ActionSelectionView = () => (
    <div className="p-6">
      <p className="text-gray-800 mb-4 font-medium">Select immediate action:</p>
      <div className="space-y-3">
        {riskProfile.level === 'Low' && (
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("🔘 LOW RISK BUTTON CLICKED: SCHEDULE_REASSESSMENT");
              setIsProcessing(true);
              try {
                await new Promise(resolve => setTimeout(resolve, 500)); // Brief loading feedback
                onAction('SCHEDULE_REASSESSMENT');
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="w-full p-4 rounded-lg flex items-center transition-colors bg-gray-500 text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none disabled:bg-gray-400"
          >
            <CalendarClock size={20} className="mr-3" />
            <div className="text-left font-semibold">
              {isProcessing ? 'Processing...' : 'Reassess Later in Pregnancy'}
            </div>
          </button>
        )}
        {(riskProfile.level === 'Moderate' || riskProfile.level === 'High') && (
          <>
            <button 
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🔘 INITIATE PREP BUTTON CLICKED");
                setIsProcessing(true);
                try {
                  await new Promise(resolve => setTimeout(resolve, 500)); // Brief loading feedback
                  // ONLY call onAction - let parent handle all modal state management
                  onAction('INITIATE_PREP');
                  console.log("🔘 INITIATE PREP ACTION SENT - parent will handle modal closure");
                } finally {
                  setIsProcessing(false);
                }
                // DO NOT call onClose() here - parent handleDynamicAlertAction will manage modal state
              }}
              disabled={isProcessing}
              className={`w-full p-4 rounded-lg flex items-center transition-colors text-white focus:ring-2 focus:outline-none ${
                riskProfile.level === 'High' 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400 disabled:bg-red-400' 
                  : 'bg-green-500 hover:bg-green-600 focus:ring-green-400 disabled:bg-green-400'
              }`}
            >
              <Shield size={20} className="mr-3" />
              <div className="text-left">
                <div className="font-semibold">
                  {isProcessing ? 'Processing...' : 'Initiate PrEP'}
                </div>
                <div className={`text-sm ${riskProfile.level === 'High' ? 'text-red-100' : 'text-green-100'}`}>
                  {isProcessing ? 'Preparing eligibility assessment...' : 'Conduct risk reduction counseling and ascertain client interest.'}
                </div>
              </div>
              {riskProfile.level === 'High' && (
                <div className="bg-red-700 text-xs px-2 py-1 rounded-full font-bold">PRIORITY</div>
              )}
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🔘 CLINICAL RECOMMENDATIONS BUTTON CLICKED");
                setCurrentView('recommendations');
              }}
              className="w-full p-4 rounded-lg flex items-center transition-colors bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <BookOpen size={20} className="mr-3" />
              <div className="text-left font-semibold">Clinical Recommendations</div>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🔘 ASSESS PREP READINESS BUTTON CLICKED");
                setCurrentView('readiness');
              }}
              className="w-full p-4 rounded-lg flex items-center transition-colors bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            >
              <ClipboardCheck size={20} className="mr-3" />
              <div className="text-left">
                <div className="font-semibold">Assess PrEP Readiness</div>
                <div className="text-sm text-orange-100">Go through readiness checklist.</div>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );

  const RecommendationsView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Clinical Recommendations</h3>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔘 BACK TO ACTIONS BUTTON CLICKED (Recommendations)");
            setCurrentView('actions');
          }}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded px-2 py-1"
        >
          <ArrowLeft size={16} className="mr-1" />Back to Actions
        </button>
      </div>
      <div className="space-y-4 text-sm text-gray-700 max-h-72 overflow-y-auto pr-2">
        {riskInfo.recommendations.length > 0 ? (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Evidence-Based Recommendations</h4>
            <ul className="list-disc list-inside space-y-2">
              {riskInfo.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600">No specific recommendations available for this risk level.</p>
        )}
        
        {riskInfo.clinicalActions.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 mt-4">Clinical Actions</h4>
            <ul className="list-disc list-inside space-y-2">
              {riskInfo.clinicalActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}

        {riskInfo.contraindications.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-800 mb-2 mt-4">Contraindications</h4>
            <ul className="list-disc list-inside space-y-2 text-red-700">
              {riskInfo.contraindications.map((contraindication, index) => (
                <li key={index}>{contraindication}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
  
  const ReadinessView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">ANC PrEP Readiness Checklist</h3>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔘 BACK TO ACTIONS BUTTON CLICKED (Readiness)");
            setCurrentView('actions');
          }}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded px-2 py-1"
        >
          <ArrowLeft size={16} className="mr-1" />Back to Actions
        </button>
      </div>
      <div className="space-y-4 text-sm text-gray-700 max-h-72 overflow-y-auto pr-2">
        <div className="p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800">1. Medical Eligibility</h4>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Confirm client is HIV-negative with a recent rapid test.</li>
            <li>Assess for signs/symptoms of acute HIV infection.</li>
            <li>Confirm eGFR is &gt;60 mL/min (no significant kidney problems).</li>
            <li>No use of other nephrotoxic drugs.</li>
          </ul>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800">2. Client Counseling & Understanding</h4>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Explain that PrEP is safe during pregnancy and breastfeeding.</li>
            <li>Counsel on the importance of PrEP for protecting both mother and baby from HIV.</li>
            <li>Discuss the need for daily adherence for maximum protection.</li>
            <li>Explain potential mild, temporary side effects (e.g., nausea).</li>
          </ul>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800">3. Adherence & Social Support</h4>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Discuss client's daily routine to identify best time to take pill.</li>
            <li>Address potential barriers: stigma, partner support, and disclosure.</li>
            <li>Offer to counsel the client's partner if she consents.</li>
          </ul>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800">4. Final Confirmation</h4>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Confirm client is willing to start PrEP today.</li>
            <li>Explain the follow-up schedule (e.g., next visit in 1 month).</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'recommendations':
        return <RecommendationsView />;
      case 'readiness':
        return <ReadinessView />;
      case 'actions':
      default:
        return <ActionSelectionView />;
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 font-sans"
      style={{ zIndex: 10000, pointerEvents: 'auto' }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          console.log("🔘 BACKDROP CLICKED - CLOSING DYNAMIC ALERT MODAL ONLY");
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
        <div className={`text-white p-4 flex items-center ${riskProfile.headerClass}`}>
          <div className="flex items-center">
            <AlertTriangle size={24} className="mr-3" />
            <div>
              <h2 className="text-xl font-bold">{riskProfile.level.toUpperCase()} RISK ALERT</h2>
              <p className="opacity-90 text-sm">{riskProfile.recommendation}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 border-l-4 ${riskProfile.bannerClass}`}>
          <div className="flex items-center">
            <Zap size={18} className="mr-2" />
            <span className="font-semibold">Risk Score: {riskInfo.score}/{maxScore} ({riskProfile.level} Risk)</span>
          </div>
        </div>
        
        {renderContent()}

        <div className="bg-gray-100 px-6 py-3 flex items-center justify-between text-sm text-gray-600">
          <span>Protocol: {protocol}</span>
          <div className="flex items-center">
            <Clock size={14} className="mr-1.5" />
            <span>{riskInfo.followUpFrequency}</span>
          </div>
        </div>
        
        {/* Acknowledge Button Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("🔘 ACKNOWLEDGE BUTTON CLICKED");
              onClose();
            }}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-blue-400 transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Acknowledge'}
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
  console.log("🔄 PrepDynamicAlertModal render check:", {
    open: open,
    riskInfo: riskInfo,
    shouldRender: open && riskInfo
  });
  
  // Render modal only if open and riskInfo are both truthy
  if (!open || !riskInfo) {
    console.log("🔄 PrepDynamicAlertModal NOT rendering - open:", open, "riskInfo:", !!riskInfo);
    return null;
  }
  
  console.log("🔄 PrepDynamicAlertModal IS rendering via portal");
  // Use React Portal to render modal at document.body level
  return createPortal(modalContent, document.body);
};

export default PrepDynamicAlertModal;