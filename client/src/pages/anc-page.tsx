import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronDown, ArrowLeft, AlertTriangle, Plus, Edit, TestTube, Clock, Heart, Baby, Thermometer, Stethoscope, Pill, User, ArrowRight, FileText, Calendar, Microscope, Activity, Users, ClipboardCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextCard } from "@/components/ui/context-card";
import { motion, AnimatePresence } from "framer-motion";
import { AncInitialDialog } from "@/components/medical-record/anc-initial-dialog";
import { AncDecisionSupportAlert, DecisionRuleTable } from "@/components/medical-record/anc-decision-support";
import { SmartCareHeader } from "@/components/layout/smartcare-header";
import MedicalHistoryModal from '@/components/ui/medical-history-modal';
import { StandardANCAssessment } from "@/components/medical-record/standard-anc-assessment";
import { VitalSignsMeasurements } from "@/components/medical-record/vital-signs-measurements";
import { MaternalAssessmentModal } from "@/components/medical-record/maternal-assessment-modal";
import { FetalAssessmentModal } from "@/components/medical-record/fetal-assessment-modal";
import PatientRelationshipManager from '@/components/PatientRelationshipManager';
import { ClinicalDecisionSupportModal, evaluateASB, evaluateGBS, evaluateGlucose, type CDSSCondition } from "@/components/medical-record/clinical-decision-support-modal";
import { evaluateHepatitisB } from "@/components/medical-record/poc-tests-cdss";
import BehavioralCounsellingModal from "@/components/medical-record/behavioral-counselling-modal";
import EnhancedBehavioralCounsellingModal from "@/components/medical-record/enhanced-behavioral-counselling-modal";
import InterventionsTreatmentsModal from "@/components/medical-record/interventions-treatments-modal";
import { BehavioralCounsellingData, HIVTestingData, POCTestData, InterventionsTreatmentsData, ANCPrepAssessmentData } from "@/shared/schema";
import PrescriptionModalWrapper from "@/components/pharmacy/prescription-modal-wrapper";
import { HIVTestingCard } from '@/components/medical-record/hiv-testing-card';
import { POCTestsCard } from '@/components/medical-record/poc-tests-card';
import LaboratoryTestsModal from '@/components/medical-record/laboratory-tests-modal';
import HealthEducationModal from '@/components/medical-record/health-education-modal';
import { ANCPrepCard } from '@/components/medical-record/anc-prep-card';
// Removed MedicalHistoryCDSSAlerts - now using trigger-based CDSSTriggeredModal only
import { evaluateBehavioralCounsellingRequirements, CDSSAlert, ClientProfileData } from "@/lib/medical-history-cdss";
import CDSSTriggeredModal, { CDSSTriggeredAlert } from "@/components/medical-record/cdss-triggered-modal";

import Coat_of_arms_of_Zambia_svg from "@assets/Coat_of_arms_of_Zambia.svg.png";
import { LatestEncounterCard } from "@/components/medical-record/LatestEncounterCard";
import { RecentDataSummaryCard } from "@/components/medical-record/RecentDataSummaryCard";
import { ANCCardWrapper } from "@/components/medical-record/ANCCardWrapper";
import { PMTCTCardSection } from "@/components/medical-record/PMTCTCardSection";
import ReferralCard from "@/components/medical-record/referral-card";
import ReferralModal from "@/components/medical-record/referral-modal";
import { ANCHeaderDock } from "@/components/anc-header-dock";
import { PregnancyHistoryForm, useMultiplePregnancyForms } from "../components/medical-record/PregnancyHistoryForm";

// Zambian ANC Guidelines danger sign descriptions (2022)
const enhancedDangerSignDescriptions = {
  // Bleeding & Delivery Complications
  'Vaginal bleeding': 'Any amount of vaginal bleeding during pregnancy may indicate placental abruption, placenta previa, cervical issues, or threatened abortion. According to the guidelines, bleeding can occur anytime from conception to birth, and all bleeding must be treated as serious and be immediately attended to. Bleeding in the 2nd and 3rd trimester is a possible sign of problems. Assess amount, color, and associated pain. Always requires immediate evaluation.',
  'Draining': 'Amniotic fluid leak or rupture of membranes (PROM/PPROM) may be a gush or a slow, steady trickle of clear, straw-colored, or greenish fluid from the vagina. It indicates the protective barrier around the fetus is broken, increasing the risk of infection (chorioamnionitis) and preterm labor. If the baby\'s head is not engaged, there is a risk of umbilical cord prolapse, which is a medical emergency.',
  'Imminent delivery': 'This refers to signs that birth is about to happen immediately. Key indicators include an overwhelming urge to bear down or push, strong and frequent contractions (less than 2 minutes apart), the mother grunting with contractions, or the baby\'s head being visible at the vaginal opening (crowning). This requires immediate preparation for a safe birth, regardless of location.',
  'Labour': 'This is defined as regular, painful uterine contractions that cause progressive changes to the cervix (effacement and dilation). When this occurs before 37 completed weeks of gestation, it is preterm labor, a significant danger sign that can lead to premature birth. The guidelines define preterm labor as labor that occurs after 20 weeks but before 37 weeks of pregnancy. Infants born before 37 weeks are at an increased risk for health problems.',
  
  // Neurological & Pre-eclampsia Signs
  'Convulsing': 'Also known as an eclamptic seizure, this is a life-threatening emergency. It involves tonic-clonic (shaking and stiffening) movements and loss of consciousness. It is a sign of eclampsia, a severe complication of high blood pressure in pregnancy. The priority is to manage the patient\'s airway, prevent injury, and administer magnesium sulfate to control the seizure.',
  'Severe headache': 'A new-onset, persistent, and often throbbing headache that is not relieved by usual painkillers like paracetamol. It is a hallmark symptom of pre-eclampsia, a condition which the guidelines identify as a serious medical condition. Severe headaches are listed as a key symptom.',
  'Visual disturbance': 'New vision problems such as seeing flashing lights or spots (scotomata), double vision, or temporary loss of vision. Like a severe headache, this is a key sign of severe pre-eclampsia or impending eclampsia. The guidelines list "blurred vision" as a symptom of pre-eclampsia.',
  'Unconscious': 'A state of unresponsiveness where the patient cannot be roused. This is a critical emergency with many potential causes in pregnancy, including eclampsia, severe blood loss (hypovolemic shock), septic shock, or diabetic coma. Immediate assessment of airway, breathing, and circulation (ABC) is vital.',
  
  // Systemic & Infectious Signs
  'Fever': 'A body temperature ≥38°C (100.4°F) with chills or rigors. It often signals a serious infection, such as chorioamnionitis (infection of the amniotic sac), pyelonephritis (kidney infection), or sepsis. Fever significantly increases the metabolic demands on both the mother and fetus and requires urgent investigation to find and treat the source.',
  'Looks very ill': 'This is a crucial clinical sign based on professional judgment. The patient may appear lethargic, confused, pale, or have cool, clammy skin. It often signifies the onset of sepsis or shock before vital signs dramatically change. Trusting this "gut feeling" can lead to earlier life-saving interventions.',
  'Severe vomiting': 'Persistent vomiting that prevents the patient from keeping down any food or fluids. The guidelines recognize "Nausea and Vomiting" as a physiological complication of pregnancy. While many women experience this in the first trimester, some may experience it beyond 20 weeks, and pharmacological treatments may be required for distressing symptoms. Severe cases can lead to dehydration, electrolyte imbalances, and nutritional deficiencies (ketosis), which can harm both mother and fetus.',
  'Severe abdominal pain': 'Intense, non-contraction pain in the abdomen. The guidelines recognize "Lower Back and Pelvic Pain" as a common physiological symptom in pregnancy. The location of severe pain can provide clues: upper right abdomen pain may suggest HELLP syndrome (a severe form of pre-eclampsia); sharp, constant pain could indicate placental abruption; generalized tenderness with fever may suggest infection.',
  'Other': 'Any other concerning symptoms or signs not listed above that require clinical assessment.'
};

// Helper component for danger sign with inline expandable info
const DangerSignWithTooltip = ({ id, name, value, checked, onChange, label, description, onInfoClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Smart contextual display: show icon when selected OR hovered
  const showInfoIcon = checked || isHovered;
  
  return (
    <div>
      <div 
        className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-gray-100/70" 
        style={{ boxShadow: '0 1px 3px hsla(223.58deg, 50.96%, 59.22%, 0.2)' }} 
        onMouseEnter={(e) => { 
          e.currentTarget.style.boxShadow = '0 3px 6px hsla(223.58deg, 50.96%, 59.22%, 0.35)';
          setIsHovered(true);
        }} 
        onMouseLeave={(e) => { 
          e.currentTarget.style.boxShadow = '0 1px 3px hsla(223.58deg, 50.96%, 59.22%, 0.2)';
          setIsHovered(false);
        }}
      >
        <input 
          type="checkbox" 
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="rounded border-gray-300 text-red-600 w-3.5 h-3.5"
        />
        <label htmlFor={id} className="text-xs font-medium flex items-center space-x-1.5 flex-1 cursor-pointer font-sans">
          <span className="text-black">{label}</span>
          {showInfoIcon && (
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
              className="w-3 h-3 rounded-full border border-gray-400 bg-white/80 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-xs font-semibold transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5 hover:scale-110 animate-in fade-in-0 slide-in-from-right-1 cursor-help"
              style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.3)' }}
              title={`Click for information about ${label}`}
            >
              i
            </div>
          )}
        </label>
      </div>
      
      {/* Inline expandable information */}
      {showInfo && (
        <div className="ml-6 mt-1 p-2 bg-blue-50 border-l-2 border-blue-400 rounded-r animate-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
};

export default function AncPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Extract patientId from URL parameters - handle both /anc and /anc/:patientId routes
  const [match, params] = useRoute('/anc/:patientId');
  const patientId = params?.patientId || null;
  
  // State for Latest Encounter and Recent Data Summary
  const [latestEncounterData, setLatestEncounterData] = useState<any>({});
  const [recentDataSummary, setRecentDataSummary] = useState<any>({
    vitals: {},
    gestationalAge: null,
    htsStatus: null,
    diagnoses: [],
    activeMedications: [],
    treatmentPlan: null,
    nextAppointment: null
  });

  // Function to update Latest Encounter data based on section
  const updateLatestEncounterData = useCallback((section: string, data: any) => {
    setLatestEncounterData(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  // Function to update Recent Data Summary
  const updateRecentDataSummary = useCallback((data: Partial<typeof recentDataSummary>) => {
    setRecentDataSummary(prev => ({
      ...prev,
      ...data
    }));
  }, []);
  
  // Clinical Decision Support Modal State
  const [cdssModalOpen, setCdssModalOpen] = useState(false);
  const [currentCdssCondition, setCurrentCdssCondition] = useState<CDSSCondition | null>(null);
  
  // Danger Signs Info Modal State  
  const [showDangerSignInfo, setShowDangerSignInfo] = useState(false);
  const [selectedDangerSignInfo, setSelectedDangerSignInfo] = useState<{title: string, description: string} | null>(null);
  
  // Handler for opening danger sign info modal
  const handleDangerSignInfoClick = (title: string, description: string) => {
    setSelectedDangerSignInfo({ title, description });
    setShowDangerSignInfo(true);
  };
  
  // Auto-close timer for danger sign info modal
  useEffect(() => {
    if (showDangerSignInfo) {
      const timer = setTimeout(() => {
        setShowDangerSignInfo(false);
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [showDangerSignInfo]);
  
  // Function to trigger CDSS evaluation and modal
  const triggerCDSSEvaluation = (condition: CDSSCondition) => {
    setCurrentCdssCondition(condition);
    setCdssModalOpen(true);
  };
  
  // Function to handle CDSS protocol confirmation
  const handleCDSSConfirm = (condition: CDSSCondition) => {
    toast({
      title: "Protocol Acknowledged",
      description: `${condition.diagnosis} treatment protocol has been acknowledged and implemented.`,
      duration: 5000,
    });
    setCdssModalOpen(false);
    setCurrentCdssCondition(null);
  };

  // Actions dropdown state
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);
  
  // Pregnancy Dating Functions
  const updateCurrentPregnancyDatingOptions = useCallback(() => {
    const lmpKnown = document.querySelector('input[name="current_pregnancy_lmp_known"]:checked')?.value;
    const ultrasoundDone = document.querySelector('input[name="current_pregnancy_ultrasound_done"]:checked')?.value;
    const datingMethodSelect = document.getElementById('current-pregnancy-dating-method');
    const datingMethodInfo = document.getElementById('current-pregnancy-dating-method-info');
    
    if (datingMethodSelect) {
      datingMethodSelect.innerHTML = '<option value="">Select dating method...</option>';
      
      if (lmpKnown === 'yes' && ultrasoundDone === 'yes') {
        datingMethodSelect.innerHTML += 
          '<option value="using_lmp">Using LMP</option>' +
          '<option value="using_ultrasound">Using Ultrasound</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Both LMP and Ultrasound available - select preferred method';
          datingMethodInfo.style.display = 'block';
        }
      } else if (lmpKnown === 'yes' && ultrasoundDone === 'no') {
        datingMethodSelect.innerHTML += '<option value="using_lmp">Using LMP</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Dating based on Last Menstrual Period';
          datingMethodInfo.style.display = 'block';
        }
      } else if (lmpKnown === 'no' && ultrasoundDone === 'yes') {
        datingMethodSelect.innerHTML += '<option value="using_ultrasound">Using Ultrasound</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Dating based on Ultrasound findings';
          datingMethodInfo.style.display = 'block';
        }
      } else if (lmpKnown === 'no' && ultrasoundDone === 'no') {
        datingMethodSelect.innerHTML += '<option value="using_sfh">Using Symphysial-Fundal Height (cm)</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Dating based on Symphysial-Fundal Height measurement from Clinical Assessment';
          datingMethodInfo.style.display = 'block';
        }
      }
      
      // Always add SFH option if available
      datingMethodSelect.innerHTML += '<option value="using_sfh">Using Symphysial-Fundal Height (cm)</option>';
      
      // Add event listener for dating method selection to calculate EDD
      datingMethodSelect.onchange = function() {
        calculateEDDFromSelectedMethod('current_pregnancy');
      };
    }
  }, []);

  // Handle click outside to close actions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target as Node)) {
        setIsActionsDropdownOpen(false);
      }
    };

    if (isActionsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionsDropdownOpen]);

  const calculateCurrentPregnancyEDDFromUS = useCallback(() => {
    const usDate = document.getElementById('current-pregnancy-ultrasound-date')?.value;
    const usWeeks = parseInt(document.getElementById('current-pregnancy-us-weeks')?.value || '0');
    const usDays = parseInt(document.getElementById('current-pregnancy-us-days')?.value || '0');
    
    if (usDate && usWeeks > 0) {
      const ultrasoundDate = new Date(usDate);
      const totalDaysFromUS = (usWeeks * 7) + usDays;
      const remainingDays = 280 - totalDaysFromUS;
      const eddFromUS = new Date(ultrasoundDate);
      eddFromUS.setDate(eddFromUS.getDate() + remainingDays);
      
      const eddInput = document.getElementById('current-pregnancy-edd-from-us');
      const eddDiv = document.getElementById('current-pregnancy-edd-from-us-div');
      
      if (eddInput) {
        eddInput.value = eddFromUS.toISOString().split('T')[0];
      }
      if (eddDiv) {
        eddDiv.style.display = 'block';
      }
    }
  }, []);

  const updateClientProfileDatingOptions = useCallback(() => {
    const lmpKnown = document.querySelector('input[name="client_profile_lmp_known"]:checked')?.value;
    const ultrasoundDone = document.querySelector('input[name="client_profile_ultrasound_done"]:checked')?.value;
    const datingMethodSelect = document.getElementById('client-profile-dating-method');
    const datingMethodInfo = document.getElementById('client-profile-dating-method-info');
    
    if (datingMethodSelect) {
      datingMethodSelect.innerHTML = '<option value="">Select dating method...</option>';
      
      if (lmpKnown === 'yes' && ultrasoundDone === 'yes') {
        datingMethodSelect.innerHTML += 
          '<option value="using_lmp">Using LMP</option>' +
          '<option value="using_ultrasound">Using Ultrasound</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Both LMP and Ultrasound available - select preferred method';
          datingMethodInfo.style.display = 'block';
        }
      } else if (lmpKnown === 'yes' && ultrasoundDone === 'no') {
        datingMethodSelect.innerHTML += '<option value="using_lmp">Using LMP</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Dating based on Last Menstrual Period';
          datingMethodInfo.style.display = 'block';
        }
      } else if (lmpKnown === 'no' && ultrasoundDone === 'yes') {
        datingMethodSelect.innerHTML += '<option value="using_ultrasound">Using Ultrasound</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Dating based on Ultrasound findings';
          datingMethodInfo.style.display = 'block';
        }
      } else if (lmpKnown === 'no' && ultrasoundDone === 'no') {
        datingMethodSelect.innerHTML += '<option value="using_sfh">Using Symphysial-Fundal Height (cm)</option>';
        if (datingMethodInfo) {
          datingMethodInfo.textContent = 'Dating based on Symphysial-Fundal Height measurement from Clinical Assessment';
          datingMethodInfo.style.display = 'block';
        }
      }
      
      // Always add SFH option if available
      datingMethodSelect.innerHTML += '<option value="using_sfh">Using Symphysial-Fundal Height (cm)</option>';
      
      // Add event listener for dating method selection to calculate EDD
      datingMethodSelect.onchange = function() {
        calculateEDDFromSelectedMethod('client_profile');
      };
    }
  }, []);

  const calculateClientProfileEDDFromUS = useCallback(() => {
    const usDate = document.getElementById('client-profile-ultrasound-date')?.value;
    const usWeeks = parseInt(document.getElementById('client-profile-us-weeks')?.value || '0');
    const usDays = parseInt(document.getElementById('client-profile-us-days')?.value || '0');
    
    if (usDate && usWeeks > 0) {
      const ultrasoundDate = new Date(usDate);
      const totalDaysFromUS = (usWeeks * 7) + usDays;
      const remainingDays = 280 - totalDaysFromUS;
      const eddFromUS = new Date(ultrasoundDate);
      eddFromUS.setDate(eddFromUS.getDate() + remainingDays);
      
      const eddInput = document.getElementById('client-profile-edd-from-us');
      const eddDiv = document.getElementById('client-profile-edd-from-us-div');
      
      if (eddInput) {
        eddInput.value = eddFromUS.toISOString().split('T')[0];
      }
      if (eddDiv) {
        eddDiv.style.display = 'block';
      }
    }
  }, []);

  // EDD calculation from selected dating method
  const calculateEDDFromSelectedMethod = useCallback((context) => {
    const datingMethodSelect = document.getElementById(context === 'current_pregnancy' ? 'current-pregnancy-dating-method' : 'client-profile-dating-method');
    const selectedMethod = datingMethodSelect?.value;
    const summaryDiv = document.getElementById(context === 'current_pregnancy' ? 'current-pregnancy-final-summary' : 'client-profile-final-summary');
    const summaryContent = document.getElementById(context === 'current_pregnancy' ? 'current-pregnancy-summary-content' : 'client-profile-summary-content');
    
    if (!selectedMethod || !summaryDiv || !summaryContent) return;
    
    let eddDate = null;
    let gaWeeks = 0;
    let gaDays = 0;
    let methodDescription = '';
    
    if (selectedMethod === 'using_lmp') {
      const lmpInput = document.getElementById(context === 'current_pregnancy' ? 'current-pregnancy-lmp-date' : 'client-profile-lmp-date');
      if (lmpInput?.value) {
        const lmpDate = new Date(lmpInput.value);
        eddDate = new Date(lmpDate);
        eddDate.setDate(eddDate.getDate() + 280);
        
        const today = new Date();
        const diffTime = today - lmpDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        gaWeeks = Math.floor(diffDays / 7);
        gaDays = diffDays % 7;
        methodDescription = 'Last Menstrual Period (Naegele\'s Rule)';
      }
    } else if (selectedMethod === 'using_ultrasound') {
      const usDate = document.getElementById(context === 'current_pregnancy' ? 'current-pregnancy-ultrasound-date' : 'client-profile-ultrasound-date');
      const usWeeks = parseInt(document.getElementById(context === 'current_pregnancy' ? 'current-pregnancy-us-weeks' : 'client-profile-us-weeks')?.value || '0');
      const usDays = parseInt(document.getElementById(context === 'current_pregnancy' ? 'current-pregnancy-us-days' : 'client-profile-us-days')?.value || '0');
      
      if (usDate?.value && usWeeks > 0) {
        const ultrasoundDate = new Date(usDate.value);
        const totalDaysFromUS = (usWeeks * 7) + usDays;
        const remainingDays = 280 - totalDaysFromUS;
        eddDate = new Date(ultrasoundDate);
        eddDate.setDate(eddDate.getDate() + remainingDays);
        
        gaWeeks = usWeeks;
        gaDays = usDays;
        methodDescription = 'Ultrasound Biometry';
      }
    } else if (selectedMethod === 'using_sfh') {
      // Get SFH measurement from Clinical Assessment
      const sfhInput = document.getElementById('symphysial_fundal_height');
      const sfhValue = parseInt(sfhInput?.value || '0');
      
      if (sfhValue > 0) {
        // SFH approximation: GA (weeks) ≈ SFH (cm) - 2 to 4 (using average of 3)
        gaWeeks = Math.max(0, sfhValue - 3);
        gaDays = 0;
        
        // Calculate EDD based on current date and estimated GA
        const today = new Date();
        const totalCurrentDays = (gaWeeks * 7) + gaDays;
        const remainingDays = 280 - totalCurrentDays;
        eddDate = new Date(today);
        eddDate.setDate(eddDate.getDate() + remainingDays);
        
        methodDescription = 'Symphysial-Fundal Height (Clinical Assessment)';
      }
    }
    
    if (eddDate && gaWeeks >= 0) {
      summaryContent.innerHTML = 
        '<div class="grid grid-cols-2 gap-4">' +
          '<div>' +
            '<div class="text-sm font-medium text-blue-600">Dating Method</div>' +
            '<div class="text-sm text-gray-700">' + methodDescription + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="text-sm font-medium text-blue-600">Current Gestational Age</div>' +
            '<div class="text-lg font-bold text-blue-700">' + gaWeeks + ' weeks ' + gaDays + ' days</div>' +
          '</div>' +
          '<div>' +
            '<div class="text-sm font-medium text-blue-600">Estimated Due Date</div>' +
            '<div class="text-lg font-bold text-blue-700">' + eddDate.toLocaleDateString() + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="text-sm font-medium text-blue-600">Trimester</div>' +
            '<div class="text-sm text-gray-700">' + getTrimester(gaWeeks) + '</div>' +
          '</div>' +
        '</div>';
      
      summaryDiv.style.display = 'block';
      
      // Update Clinical Assessment if SFH method is selected
      if (selectedMethod === 'using_sfh') {
        const gaDisplayDiv = document.getElementById('ga_from_sfh_display');
        if (gaDisplayDiv) {
          gaDisplayDiv.innerHTML = 
            '<div class="text-sm font-medium text-green-600">Estimated GA from SFH</div>' +
            '<div class="text-lg font-bold text-green-700">' + gaWeeks + ' weeks ' + gaDays + ' days</div>' +
            '<div class="text-xs text-gray-500">Based on SFH measurement of ' + (gaWeeks + 3) + ' cm</div>';
          gaDisplayDiv.style.display = 'block';
        }
      }
    }
  }, []);

  const getTrimester = (weeks) => {
    if (weeks >= 4 && weeks <= 13) return 'First Trimester (4-13 weeks)';
    if (weeks >= 14 && weeks <= 27) return 'Second Trimester (14-27 weeks)';
    if (weeks >= 28 && weeks <= 40) return 'Third Trimester (28-40 weeks)';
    if (weeks > 40) return 'Post-term (>40 weeks)';
    return 'Pre-viable (<4 weeks)';
  };

  // Static patient data to match the screenshot
  const patient = {
    id: 1, // Added ID for Patient Relationship Manager
    name: "ANGELA PHIRI",
    dateOfBirth: "25-Nov-1998 (25Y)",
    sex: "Female",
    cellphone: "0000 000000000",
    nhpn: "3002-0063P-10207-1",
    nrc: "181/1/1",
    mothersName: "CAROL"
  };

  // Selected facility from context or state
  const facilityName = "Chikando Rural Health Centre";
  const facilityCode = user?.facilityCode || "500600"; // Get from user context

  // Province and District code mapping for Zambian facilities
  const provinceDistrictMapping = {
    // Lusaka Province (05)
    "05": {
      "Lusaka": "01",
      "Chilanga": "02", 
      "Chongwe": "03",
      "Kafue": "04",
      "Luangwa": "05",
      "Rufunsa": "06"
    },
    // Central Province (02)
    "02": {
      "Kabwe": "01",
      "Chibombo": "02",
      "Kapiri Mposhi": "03",
      "Mkushi": "04",
      "Mumbwa": "05",
      "Serenje": "06",
      "Chitambo": "07",
      "Ngabwe": "08",
      "Itezhi-Tezhi": "09",
      "Luano": "10"
    },
    // Copperbelt Province (03)
    "03": {
      "Ndola": "01",
      "Kitwe": "02",
      "Chingola": "03",
      "Mufulira": "04",
      "Luanshya": "05",
      "Kalulushi": "06",
      "Chililabombwe": "07",
      "Masaiti": "08",
      "Mpongwe": "09",
      "Lufwanyama": "10"
    }
    // Add other provinces as needed
  };

  // Auto-generate Safe Motherhood Number
  const generateSafeMotherhoodNumber = (serialNumber = "0001") => {
    const currentYear = new Date().getFullYear();
    
    // Extract codes from facility code (assuming first 2 digits are province, next 2 are district)
    const provinceCode = facilityCode.substring(0, 2);
    const districtCode = facilityCode.substring(2, 4);
    const facilityCodePart = facilityCode.substring(4, 6);
    
    // Generate check digit (simple algorithm)
    const checkDigit = "SC"; // Could be calculated based on other digits
    
    return `${provinceCode}-${districtCode}-${facilityCodePart}-${currentYear}-${serialNumber}-${checkDigit}`;
  };

  // State for Safe Motherhood Number
  const [safeMotherhoodNumber, setSafeMotherhoodNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("0001");

  // Referral states
  const [selectedReferralReasons, setSelectedReferralReasons] = useState<string[]>([]);

  // Partner relationship states
  const [cameAsCouple, setCameAsCouple] = useState<"" | "yes" | "no">("");
  const [showPartnerSearch, setShowPartnerSearch] = useState(false);
  const [attachedPartner, setAttachedPartner] = useState<{
    id: string;
    name: string;
    nrc: string;
    nupn?: string;
    cellphone?: string;
  } | null>(null);

  // Pregnancy reminders preference
  const [wantsReminders, setWantsReminders] = useState<"" | "yes" | "no">("");

  // Co-habitants (people client lives with)
  const [coHabitants, setCoHabitants] = useState<string[]>([]);
  const [otherCoHabitant, setOtherCoHabitant] = useState("");

  // Origin dropdown
  const [origin, setOrigin] = useState("");

  // Auto-generate SMN when component mounts or facility changes
  useEffect(() => {
    const generatedSMN = generateSafeMotherhoodNumber(serialNumber);
    setSafeMotherhoodNumber(generatedSMN);
    updateLatestEncounterData('rapidAssessment', {
      safeMotherhoodNumber: generatedSMN
    });
  }, [facilityCode, serialNumber]);

  // Event listener for partner selection from search results
  useEffect(() => {
    const handlePartnerSelected = (event: any) => {
      const { nrc, name, nupn, phone } = event.detail;
      setAttachedPartner({
        id: nupn || `temp_${Date.now()}`,
        name: name,
        nrc: nrc,
        nupn: nupn,
        cellphone: phone
      });
      setShowPartnerSearch(false);
      toast({
        title: "Partner Selected Successfully",
        description: `${name} has been linked as partner.`,
      });
    };

    window.addEventListener('partnerSelected', handlePartnerSelected);
    return () => window.removeEventListener('partnerSelected', handlePartnerSelected);
  }, []);

  const [showInitialVisitDialog, setShowInitialVisitDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDangerSignsDialog, setShowDangerSignsDialog] = useState(false);
  const [showEmergencyReferralDialog, setShowEmergencyReferralDialog] = useState(false);
  const [showReferralReasonsDialog, setShowReferralReasonsDialog] = useState(false);
  const [showReferralChecklistDialog, setShowReferralChecklistDialog] = useState(false);
  const [showFacilityInfoDialog, setShowFacilityInfoDialog] = useState(false);
  const [showVitalSignsDialog, setShowVitalSignsDialog] = useState(false);
  const [showBehavioralCounsellingDialog, setShowBehavioralCounsellingDialog] = useState(false);
  const [showInterventionsTreatmentsDialog, setShowInterventionsTreatmentsDialog] = useState(false);
  const [showPMTCTDialog, setShowPMTCTDialog] = useState(false);
  const [showTPTDialog, setShowTPTDialog] = useState(false);
  const [showTPTSection, setShowTPTSection] = useState(false);
  const [tptCompleted, setTPTCompleted] = useState(false);
  const [interventionsData, setInterventionsData] = useState<InterventionsTreatmentsData>({});
  const [showLaboratoryTestsModal, setShowLaboratoryTestsModal] = useState(false);
  const [showHealthEducationModal, setShowHealthEducationModal] = useState(false);
  const [pmtctData, setPmtctData] = useState<any>({});
  
  // Referral Modal State
  const [showReferralModal, setShowReferralModal] = useState(false);
  
  // Pregnancy Workflow State
  const [numberOfPregnancies, setNumberOfPregnancies] = useState(0);
  
  // React-based pregnancy workflow manager component
  const ReactPregnancyWorkflowManager: React.FC = () => {
    const { renderPregnancyForms } = useMultiplePregnancyForms(numberOfPregnancies);
    
    useEffect(() => {
      console.log(`✅ React Pregnancy Workflow Manager initialized for ${numberOfPregnancies} pregnancies`);
      
      // Watch for changes to the pregnancy input field
      const pregnancyInput = document.getElementById('referral_previous_pregnancies') as HTMLInputElement;
      if (pregnancyInput) {
        const handlePregnancyChange = () => {
          const count = parseInt(pregnancyInput.value) || 0;
          setNumberOfPregnancies(count);
          console.log(`🔄 Pregnancy count updated: ${count}`);
        };
        
        pregnancyInput.addEventListener('change', handlePregnancyChange);
        pregnancyInput.addEventListener('input', handlePregnancyChange);
        
        return () => {
          pregnancyInput.removeEventListener('change', handlePregnancyChange);
          pregnancyInput.removeEventListener('input', handlePregnancyChange);
        };
      }
    }, []);
    
    return <>{renderPregnancyForms()}</>;
  };
  
  // PMTCT Update Handler
  const handlePMTCTUpdate = (updatedData: any) => {
    setPmtctData(updatedData);
    updateLatestEncounterData('pmtct', {
      pmtctStatus: updatedData.clinicalPlan?.ctxProphylaxis || 'Not started',
      artStatus: updatedData.artHistory?.artStatus || 'Unknown',
      partnerStatus: updatedData.counselling?.partnerHivStatus || 'Unknown',
      whoStage: updatedData.clinicalAssessment?.whoStage || 'Not assessed'
    });
    toast({
      title: "PMTCT Data Updated",
      description: "Changes have been saved successfully",
    });
  };
  
  // Referral Update Handler
  const handleReferralSave = (updatedData: any) => {
    setReferralData(updatedData);
    updateLatestEncounterData('referral', {
      referralStatus: updatedData.emergencyReferral || 'No referral',
      referralType: updatedData.referralType || 'Not specified',
      facility: updatedData.receivingFacility || 'Not selected',
      reason: updatedData.referralReasons?.join(', ') || 'Not specified'
    });
    toast({
      title: "Referral Data Updated",
      description: "Changes have been saved successfully",
    });
  };
  
  // Prescription modal state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prePopulatedDrug, setPrePopulatedDrug] = useState<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    category: string;
    itemPerDose: string;
    timePerUnit: string;
    frequencyUnit: string;
    durationUnit: string;
    instructions?: string;
  } | null>(null);
  const [routineVisitType, setRoutineVisitType] = useState<"initial" | "routine">("routine");
  const [activeTab, setActiveTab] = useState("rapidAssessment");
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([]);
  const [dangerSignMode, setDangerSignMode] = useState<'none' | 'present' | undefined>(undefined);
  

  
  // Shared state for bi-directional sync between Danger Signs and Emergency Referral
  const [sharedReferralReasons, setSharedReferralReasons] = useState<string[]>([]);
  const [syncNotification, setSyncNotification] = useState<string>('');
  
  // Two-tier medical history state
  const [medicalHistoryChoice, setMedicalHistoryChoice] = useState<'no_history' | 'history_present' | null>(null);
  const [surgicalHistoryChoice, setSurgicalHistoryChoice] = useState<'no_history' | 'history_present' | null>(null);

  // Examination data state
  const [examData, setExamData] = useState({
    pallor_present: '',
    respiratory_exam: '',
    respiratory_exam_abnormal: [],
    cardiac_exam: '',
    cardiac_exam_abnormal: [],
    breast_exam: '',
    breast_exam_abnormal: [],
    pelvic_exam: '',
    pelvic_exam_test: [],
    speculum_exam: '',
    speculum_exam_abnormal: [],
    oedema_present: '',
    oedema_type: [],
    unilateral_or_bilateral: '',
    other_oedema_symptoms: [],
    oedema_severity: '',
    varicose_veins: '',
    varicose_type: [],
    ipv_status: '',
    presenting_signs_conditions: [],
    other_signs: ''
  });

  // Handle examination data changes
  const handleExamChange = (newData: any) => {
    setExamData(prev => ({ ...prev, ...newData }));
  };

  // Maternal assessment modal handler
  const handleSaveMaternalAssessment = (data: any) => {
    console.log('Maternal Assessment Data:', data);
    setExamData(prev => ({ ...prev, ...data }));
    setShowMaternalAssessmentModal(false);
    toast({
      title: "Maternal Assessment Saved",
      description: "Assessment record has been saved successfully.",
    });
  };

  // Bi-directional sync functions for Danger Signs <-> Emergency Referral
  const dangerSignToReferralMapping: { [key: string]: string } = {
    'Vaginal bleeding': 'severe_bleeding',
    'Draining': 'severe_bleeding', 
    'Imminent delivery': 'imminent_delivery',
    'Labour': 'labour_complications',
    'Convulsing': 'convulsions',
    'Severe headache': 'severe_headache_bp',
    'Visual disturbance': 'severe_headache_bp',
    'Unconscious': 'unconscious',
    'Severe abdominal pain': 'severe_abdominal_pain',
    'High fever': 'high_fever',
    'Severe vomiting': 'severe_vomiting',
    'Looks very ill': 'looks_very_ill'
  };

  const referralToDangerSignMapping: { [key: string]: string } = {
    'severe_bleeding': 'Vaginal bleeding',
    'imminent_delivery': 'Imminent delivery', 
    'labour_complications': 'Labour',
    'convulsions': 'Convulsing',
    'severe_headache_bp': 'Severe headache',
    'unconscious': 'Unconscious',
    'severe_abdominal_pain': 'Severe abdominal pain',
    'high_fever': 'High fever',
    'severe_vomiting': 'Severe vomiting',
    'looks_very_ill': 'Looks very ill'
  };

  // Sync from Danger Signs to Emergency Referral
  const syncDangerSignsToReferral = useCallback((dangerSigns: string[]) => {
    const mappedReasons = dangerSigns
      .map(sign => dangerSignToReferralMapping[sign])
      .filter(Boolean);
    
    setSharedReferralReasons(prev => {
      const combined = [...new Set([...prev, ...mappedReasons])];
      return combined;
    });

    if (mappedReasons.length > 0) {
      // Auto-set Emergency Referral to "Yes" when danger signs are present
      setTimeout(() => {
        const emergencyYesRadio = document.getElementById('refYes') as HTMLInputElement;
        if (emergencyYesRadio && !emergencyYesRadio.checked) {
          emergencyYesRadio.checked = true;
          emergencyYesRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Auto-check the corresponding referral reason checkboxes
        mappedReasons.forEach(reason => {
          const checkbox = document.querySelector(`input[name="referral_reasons"][value="${reason}"]`) as HTMLInputElement;
          if (checkbox && !checkbox.checked) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }, 500);

      setSyncNotification(`Auto-populated ${mappedReasons.length} referral reason(s) from danger signs`);
      setTimeout(() => setSyncNotification(''), 3000);
    }
  }, []);

  // Sync from Emergency Referral to Danger Signs
  const syncReferralToDangerSigns = useCallback((referralReasons: string[]) => {
    const mappedDangerSigns = referralReasons
      .map(reason => referralToDangerSignMapping[reason])
      .filter(Boolean);
    
    if (mappedDangerSigns.length > 0) {
      setSelectedDangerSigns(prev => {
        const combined = [...new Set([...prev, ...mappedDangerSigns])];
        return combined;
      });
      
      // If danger signs are being added, set mode to 'present'
      if (mappedDangerSigns.length > 0) {
        setDangerSignMode('present');
      }

      setSyncNotification(`Auto-populated ${mappedDangerSigns.length} danger sign(s) from referral`);
      setTimeout(() => setSyncNotification(''), 3000);
    }
  }, []);

  // Enhanced danger sign descriptions with comprehensive clinical relevance for ANC
  const enhancedDangerSignDescriptions = {
    // Bleeding & Delivery Complications
    'Vaginal bleeding': 'Any amount of vaginal bleeding during pregnancy - may indicate placental abruption, placenta previa, cervical issues, or threatened abortion. Assess amount, color, and associated pain. Always requires immediate evaluation.',
    'Draining': 'Amniotic fluid leak or rupture of membranes (PROM/PPROM) - clear, blood-stained, or greenish fluid leaking from vagina. May indicate preterm labor, infection risk, or cord prolapse. Check gestational age and fetal movement.',
    'Imminent delivery': 'Active labor with cervical dilation >7cm, baby crowning, or uncontrollable urge to push. Prepare for immediate delivery or urgent transfer. Check fetal presentation and cord visibility.',
    'Labour': 'Regular uterine contractions before 37 weeks gestation (preterm labor) - contractions every 5-10 minutes lasting 30+ seconds. May lead to premature birth. Assess cervical changes and fetal wellbeing.',
    
    // Neurological & Pre-eclampsia Signs
    'Convulsing': 'Seizures, fits, or uncontrolled muscle contractions - may indicate eclampsia (BP >140/90 + proteinuria + seizures), severe pre-eclampsia, or epilepsy. IMMEDIATE ACTIONS: Position on left side, protect airway, give MgSO4 4g IV loading dose + 1g/hr maintenance. Life-threatening emergency.',
    'Severe headache': 'Persistent, throbbing headache not relieved by rest or paracetamol, often frontal or occipital - classic sign of severe pre-eclampsia (BP >160/110). Check: BP, urine protein, deep tendon reflexes (DTRs), and epigastric pain. May progress to eclampsia.',
    'Visual disturbance': 'Blurred vision, seeing spots/scotomata, flashing lights, or temporary vision loss - indicates severe pre-eclampsia with possible cerebral edema or retinal changes. URGENT: Check BP, fundoscopy for papilledema/hemorrhages. High risk for eclampsia within hours.',
    'Unconscious': 'Not responding to voice, touch, or painful stimuli (GCS <8) - may indicate post-ictal state (eclampsia), severe hypoglycemia (<2.2mmol/L), or cerebral complications. IMMEDIATE: Secure airway, check blood glucose, vital signs, and neurological assessment.',
    
    // Systemic & Infectious Signs
    'Fever': 'Body temperature ≥39°C (102.2°F) or ≥38°C with chills/rigors - may indicate chorioamnionitis, UTI, malaria, or sepsis. Higher risk if membranes ruptured. Check for source and culture specimens.',
    'Looks very ill': 'Appears distressed, lethargic, pale, sweating, or critically unwell - non-specific but important danger sign. May indicate sepsis, severe anemia, or multi-organ dysfunction. Assess vital signs and oxygen saturation.',
    'Severe vomiting': 'Persistent vomiting unable to keep fluids/food down >24 hours, signs of dehydration - may indicate hyperemesis gravidarum, pre-eclampsia, or gastroenteritis. Check for ketones and electrolyte imbalance.',
    'Severe abdominal pain': 'Constant severe cramping, knife-like, or tearing abdominal pain - may indicate placental abruption, uterine rupture, appendicitis, or ectopic pregnancy. Assess uterine tenderness and fetal heart rate.'
  };

  // Critical danger signs that auto-trigger emergency referral
  const criticalDangerSigns = [
    'Convulsing', 'Unconscious', 'Severe headache', 'Visual disturbance',
    'Vaginal bleeding', 'Imminent delivery', 'Severe abdominal pain'
  ];

  // Handle danger signs acknowledgment from orange button - return to urgent alert modal
  const handleDangerSignsAcknowledgement = useCallback((acknowledgedSigns: string[]) => {
    // Don't set workflow phase to action_selection, instead keep original flow
    // This will cause the AncDecisionSupportAlert to re-trigger the urgent modal
    toast({
      title: "Danger Signs Information Reviewed",
      description: "Please select emergency referral or facility management.",
      variant: "default",
    });
  }, [toast]);



  // Handle danger sign confirmation
  const handleDangerSignConfirmation = useCallback(() => {
    setDangerSignsConfirmed(true);
    
    // Auto-trigger emergency referral if critical signs present
    const hasCriticalSigns = selectedDangerSigns.some(sign => 
      criticalDangerSigns.includes(sign)
    );
    
    if (hasCriticalSigns) {
      setShowEmergencyReferralAuto(true);
      toast({
        title: "Emergency Referral Required",
        description: `Critical danger signs detected: ${selectedDangerSigns.filter(sign => criticalDangerSigns.includes(sign)).join(', ')}. Emergency referral has been auto-populated.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Danger Signs Confirmed",
        description: `${selectedDangerSigns.length} danger sign(s) documented. Please proceed with appropriate clinical management.`,
        variant: "default",
      });
    }
  }, [selectedDangerSigns, toast]);

  // Handle "none" selection with informational toast
  const handleNoneDangerSigns = useCallback(() => {
    setSelectedDangerSigns([]);
    setDangerSignsConfirmed(false);
    setShowEmergencyReferralAuto(false);
    
    toast({
      title: "No Danger Signs Identified",
      description: "Continue with routine ANC care.",
      variant: "default",
    });
  }, [toast]);

  // Handle danger signs change with sync
  const handleDangerSignsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setSelectedDangerSigns(prev => {
      const updated = checked 
        ? [...prev, value]
        : prev.filter(sign => sign !== value);
      
      // Update Latest Encounter data
      updateLatestEncounterData('dangerSigns', {
        dangerSigns: updated,
        dangerSignsPresent: updated.length > 0,
        assessmentDate: new Date().toISOString()
      });
      
      // Sync to referral with delay to ensure DOM is ready
      setTimeout(() => {
        syncDangerSignsToReferral(updated);
      }, 100);
      
      return updated;
    });
    
    // Reset confirmation when selection changes
    setDangerSignsConfirmed(false);
  }, [syncDangerSignsToReferral]);

  // Handle referral reasons change with sync
  const handleReferralReasonsChange = useCallback((selectedReasons: string[]) => {
    setSharedReferralReasons(selectedReasons);
    syncReferralToDangerSigns(selectedReasons);
  }, [syncReferralToDangerSigns]);

  // Expose sync function to global scope for inline handlers
  useEffect(() => {
    (window as any).handleReferralReasonsSync = handleReferralReasonsChange;
  }, [handleReferralReasonsChange]);

  // Generic referral checkbox handler for all referral reasons
  const createReferralCheckboxHandler = useCallback(() => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedReasons = Array.from(document.querySelectorAll('input[name="referral_reasons"]:checked')).map((cb: any) => cb.value);
      console.log('Selected referral reasons:', selectedReasons);
      
      // Sync to danger signs
      handleReferralReasonsChange(selectedReasons);
      
      // Update checklist relevance if function exists
      setTimeout(() => {
        if ((window as any).updateChecklistRelevance) {
          console.log('Triggering checklist relevance update...');
          (window as any).updateChecklistRelevance();
        }
      }, 200);
    };
  }, [handleReferralReasonsChange]);
  
  const [drugHistoryChoice, setDrugHistoryChoice] = useState<'no_history' | 'history_present' | null>(null);
  const [substanceUseChoice, setSubstanceUseChoice] = useState<'no_assessment' | 'assessment_needed' | null>(null);
  const [medicalHistoryModalOpen, setMedicalHistoryModalOpen] = useState(false);

  // Two-tier medical history primary choice handler
  const handlePrimaryHistoryChoice = (choiceType: 'medical' | 'surgical' | 'drug' | 'substance', value: 'no_history' | 'history_present' | 'no_assessment' | 'assessment_needed') => {
    // Update the appropriate state
    if (choiceType === 'medical') {
      setMedicalHistoryChoice(value as 'no_history' | 'history_present');
    } else if (choiceType === 'surgical') {
      setSurgicalHistoryChoice(value as 'no_history' | 'history_present');
    } else if (choiceType === 'drug') {
      setDrugHistoryChoice(value as 'no_history' | 'history_present');
    } else if (choiceType === 'substance') {
      setSubstanceUseChoice(value as 'no_assessment' | 'assessment_needed');
    }
    
    // If switching to "no_history" or "no_assessment", clear all detailed selections
    if (value === 'no_history' || value === 'no_assessment') {
      let groupName = '';
      if (choiceType === 'substance') {
        // Clear all substance use fields
        const substanceFields = ['caffeine_intake', 'tobacco_smoking', 'tobacco_sniffing', 'household_smoking', 'clinical_enquiry', 'substance_use'];
        substanceFields.forEach(field => {
          const checkboxes = document.querySelectorAll(`input[name="${field}"]`) as NodeListOf<HTMLInputElement>;
          checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            // Hide any "Other specify" text boxes
            if (checkbox.value === 'other') {
              const textBox = document.getElementById(checkbox.id.replace('_other', '_other_specify'));
              if (textBox) textBox.style.display = 'none';
            }
          });
        });
      } else {
        groupName = `client_${choiceType}_history`;
        const allCheckboxes = document.querySelectorAll(`input[name="${groupName}"]`) as NodeListOf<HTMLInputElement>;
        allCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
          // Hide any "Other specify" text boxes
          if (checkbox.value === 'other') {
            const textBox = document.getElementById(checkbox.id.replace('_other', '_other_specify'));
            if (textBox) textBox.style.display = 'none';
          }
        });
      }
    }
  };

  // Detailed medical history change handler (for checkboxes within the detailed section)
  const handleDetailedHistoryChange = (e: React.ChangeEvent<HTMLInputElement>, groupName: string) => {
    // Handle "Other specify" text box visibility
    if (e.target.value === 'other') {
      const textBox = document.getElementById(e.target.id.replace('_other', '_other_specify'));
      if (textBox) {
        textBox.style.display = e.target.checked ? 'block' : 'none';
      }
    }
  };

  // Substance use assessment handler with "None" exclusivity and conditional visibility
  const handleSubstanceUseChange = (e: React.ChangeEvent<HTMLInputElement>, fieldType: 'caffeine' | 'substances') => {
    const isNoneSelected = e.target.value === 'none';
    const groupName = fieldType === 'caffeine' ? 'caffeine_intake' : 'substance_use';
    
    if (isNoneSelected && e.target.checked) {
      // If "None" is selected, uncheck and hide all other options in the same group
      const allCheckboxes = document.querySelectorAll(`input[name="${groupName}"]`) as NodeListOf<HTMLInputElement>;
      allCheckboxes.forEach(checkbox => {
        if (checkbox.value !== 'none') {
          checkbox.checked = false;
          // Hide the checkbox and its label
          const checkboxContainer = checkbox.closest('.flex.items-center.space-x-2');
          if (checkboxContainer) {
            (checkboxContainer as HTMLElement).style.display = 'none';
          }
          // Hide any "Other specify" text boxes
          if (checkbox.value === 'other') {
            const textBox = document.getElementById(checkbox.id.replace('_other', '_other_specify'));
            if (textBox) textBox.style.display = 'none';
          }
        }
      });
    } else if (!isNoneSelected && e.target.checked) {
      // If any other option is selected, uncheck "None" and show all options
      const noneCheckbox = document.querySelector(`input[name="${groupName}"][value="none"]`) as HTMLInputElement;
      if (noneCheckbox) {
        noneCheckbox.checked = false;
      }
      
      // Show all options in the group
      const allCheckboxes = document.querySelectorAll(`input[name="${groupName}"]`) as NodeListOf<HTMLInputElement>;
      allCheckboxes.forEach(checkbox => {
        const checkboxContainer = checkbox.closest('.flex.items-center.space-x-2');
        if (checkboxContainer) {
          (checkboxContainer as HTMLElement).style.display = 'flex';
        }
      });
    } else if (!isNoneSelected && !e.target.checked) {
      // If unchecking an option, check if we should show "None" again
      const otherCheckedBoxes = document.querySelectorAll(`input[name="${groupName}"]:checked:not([value="none"])`) as NodeListOf<HTMLInputElement>;
      if (otherCheckedBoxes.length === 0) {
        // Show all options again if nothing is selected
        const allCheckboxes = document.querySelectorAll(`input[name="${groupName}"]`) as NodeListOf<HTMLInputElement>;
        allCheckboxes.forEach(checkbox => {
          const checkboxContainer = checkbox.closest('.flex.items-center.space-x-2');
          if (checkboxContainer) {
            (checkboxContainer as HTMLElement).style.display = 'flex';
          }
        });
      }
    }
    
    // Handle "Other specify" text box visibility
    if (e.target.value === 'other') {
      const textBox = document.getElementById(e.target.id.replace('_other', '_other_specify'));
      if (textBox) {
        textBox.style.display = e.target.checked ? 'block' : 'none';
      }
    }
    
    // Trigger business rules evaluation after state changes
    setTimeout(() => evaluateSubstanceUseRisk(), 100);
  };

  // Handler for tobacco smoking radio buttons with conditional visibility
  const handleTobaccoSmokingChange = (value: string) => {
    const smokingTypesContainer = document.querySelector('.ml-4.mt-2') as HTMLElement;
    if (smokingTypesContainer) {
      if (value === 'yes') {
        smokingTypesContainer.style.display = 'block';
      } else {
        smokingTypesContainer.style.display = 'none';
        // Uncheck all smoking types when hiding
        const smokingTypeCheckboxes = document.querySelectorAll('input[name="smoking_types"]') as NodeListOf<HTMLInputElement>;
        smokingTypeCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      }
    }
    
    // Trigger business rules evaluation
    setTimeout(() => evaluateSubstanceUseRisk(), 100);
  };

  // Substance Use Risk Assessment Business Rules Engine
  const evaluateSubstanceUseRisk = () => {
    // Only evaluate if assessment is needed
    if (substanceUseChoice !== 'assessment_needed') return;
    
    // Collect all substance use data
    const caffeineInputs = document.querySelectorAll('input[name="caffeine_intake"]:checked') as NodeListOf<HTMLInputElement>;
    const tobaccoSmoking = document.querySelector('input[name="tobacco_smoking"]:checked') as HTMLInputElement;
    const tobaccoSniffing = document.querySelector('input[name="tobacco_sniffing"]:checked') as HTMLInputElement;
    const householdSmoking = document.querySelector('input[name="household_smoking"]:checked') as HTMLInputElement;
    const clinicalEnquiry = document.querySelector('input[name="clinical_enquiry"]:checked') as HTMLInputElement;
    const substanceInputs = document.querySelectorAll('input[name="substance_use"]:checked') as NodeListOf<HTMLInputElement>;
    
    const caffeineValues = Array.from(caffeineInputs).map(input => input.value);
    const substanceValues = Array.from(substanceInputs).map(input => input.value);
    
    // Risk Assessment Logic
    let riskLevel = 'low';
    let recommendations: string[] = [];
    let alerts: any[] = [];
    
    // HIGH RISK SCENARIOS
    
    // Critical: Active smoking during pregnancy
    if (tobaccoSmoking?.value === 'yes') {
      riskLevel = 'critical';
      alerts.push({
        type: 'critical',
        title: 'CRITICAL: Active Smoking During Pregnancy',
        message: 'Patient is actively smoking during pregnancy - immediate intervention required',
        condition: 'Active tobacco smoking detected',
        recommendations: [
          'URGENT: Provide immediate smoking cessation counseling',
          'Refer to smoking cessation specialist',
          'Discuss nicotine replacement therapy options',
          'Counsel on pregnancy-specific smoking risks',
          'Schedule follow-up within 1 week',
          'Document in high-risk pregnancy category'
        ],
        requiresReferral: true
      });
    }
    
    // High risk: Multiple substance use
    const activeSubstances = substanceValues.filter(val => val !== 'none').length;
    if (activeSubstances > 1) {
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
      alerts.push({
        type: 'high',
        title: 'HIGH RISK: Multiple Substance Use',
        message: 'Patient reports multiple substance use - comprehensive assessment needed',
        condition: `Multiple substances detected: ${substanceValues.filter(val => val !== 'none').join(', ')}`,
        recommendations: [
          'Conduct detailed substance use assessment',
          'Refer to addiction counseling services',
          'Monitor for withdrawal symptoms',
          'Coordinate with social services if needed',
          'Develop harm reduction plan',
          'Increase prenatal visit frequency'
        ],
        requiresReferral: true
      });
    }
    
    // High risk: Alcohol use during pregnancy
    if (substanceValues.includes('alcohol')) {
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
      alerts.push({
        type: 'high',
        title: 'HIGH RISK: Alcohol Use During Pregnancy',
        message: 'Alcohol consumption during pregnancy detected - immediate counseling required',
        condition: 'Alcohol use reported',
        recommendations: [
          'Provide immediate alcohol cessation counseling',
          'Screen for Fetal Alcohol Spectrum Disorders risk',
          'Refer to addiction specialist if needed',
          'Discuss alcohol-related pregnancy complications',
          'Offer support group resources',
          'Monitor fetal development closely'
        ],
        requiresReferral: false
      });
    }
    
    // MODERATE RISK SCENARIOS
    
    // Moderate: High caffeine intake
    const highCaffeineIntake = caffeineValues.some(val => ['coffee', 'tea', 'cola'].includes(val));
    if (highCaffeineIntake && !caffeineValues.includes('none')) {
      riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
      alerts.push({
        type: 'moderate',
        title: 'MODERATE RISK: High Caffeine Intake',
        message: 'High caffeine consumption may affect pregnancy outcomes',
        condition: `Caffeine sources: ${caffeineValues.filter(val => val !== 'none').join(', ')}`,
        recommendations: [
          'Counsel to limit caffeine to <200mg/day (1 cup coffee)',
          'Discuss caffeine withdrawal management',
          'Suggest caffeine-free alternatives',
          'Monitor for pregnancy-related symptoms',
          'Reassess at next visit'
        ],
        requiresReferral: false
      });
    }
    
    // Moderate: Recently quit smoking
    if (tobaccoSmoking?.value === 'recently_quit') {
      riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
      alerts.push({
        type: 'moderate',
        title: 'POSITIVE: Recently Quit Smoking',
        message: 'Patient recently quit smoking - support needed to maintain cessation',
        condition: 'Recently quit tobacco smoking',
        recommendations: [
          'Praise patient for quitting smoking',
          'Provide relapse prevention counseling',
          'Offer ongoing cessation support resources',
          'Monitor for withdrawal symptoms',
          'Discuss benefits of continued cessation',
          'Schedule regular follow-up for support'
        ],
        requiresReferral: false
      });
    }
    
    // Moderate: Household smoking exposure
    if (householdSmoking?.value === 'yes') {
      riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
      alerts.push({
        type: 'moderate',
        title: 'MODERATE RISK: Household Smoking Exposure',
        message: 'Secondhand smoke exposure poses risks during pregnancy',
        condition: 'Household members smoke',
        recommendations: [
          'Counsel on secondhand smoke risks',
          'Discuss household smoking cessation',
          'Recommend smoke-free home environment',
          'Provide resources for family smoking cessation',
          'Suggest strategies to minimize exposure'
        ],
        requiresReferral: false
      });
    }
    
    // Moderate: Injectable drug use
    if (substanceValues.includes('injectable')) {
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
      alerts.push({
        type: 'high',
        title: 'HIGH RISK: Injectable Drug Use',
        message: 'Injectable drug use poses serious pregnancy and infection risks',
        condition: 'Injectable drug use reported',
        recommendations: [
          'URGENT: Screen for blood-borne infections (HIV, Hepatitis)',
          'Refer to addiction treatment immediately',
          'Provide harm reduction counseling',
          'Coordinate with infectious disease specialist',
          'Offer needle exchange program information',
          'Monitor for complications closely'
        ],
        requiresReferral: true
      });
    }
    
    // LOW RISK / POSITIVE SCENARIOS
    
    // Low risk: No substance use
    if (substanceValues.includes('none') && caffeineValues.includes('none') && 
        (!tobaccoSmoking || tobaccoSmoking.value === 'no') &&
        (!tobaccoSniffing || tobaccoSniffing.value === 'no')) {
      alerts.push({
        type: 'success',
        title: 'EXCELLENT: No Substance Use Detected',
        message: 'Patient reports no harmful substance use - continue healthy practices',
        condition: 'No substance use reported',
        recommendations: [
          'Praise patient for healthy lifestyle choices',
          'Reinforce benefits of substance-free pregnancy',
          'Provide general wellness counseling',
          'Encourage continued healthy habits',
          'Regular prenatal care schedule'
        ],
        requiresReferral: false
      });
    }
    
    // Display alerts
    alerts.forEach(alert => {
      showUrgentAlert(alert);
    });
  };

  // Enhanced substance use choice handler with business rules
  const handleSubstanceChoiceWithRules = (choiceType: 'substance', value: 'no_assessment' | 'assessment_needed') => {
    // Handle the primary choice change
    handlePrimaryHistoryChoice(choiceType, value);
    
    // Business rule for "No assessment needed"
    if (value === 'no_assessment') {
      showUrgentAlert({
        type: 'warning',
        title: 'Substance Use Assessment: No Assessment Needed',
        message: 'Healthcare provider determined substance use assessment not required at this time',
        condition: 'Clinical decision: No substance use assessment needed',
        recommendations: [
          'Continue routine prenatal care',
          'Reassess if circumstances change',
          'Patient can request assessment if needed',
          'Document clinical reasoning in notes',
          'Review at subsequent visits if indicated'
        ],
        requiresReferral: false
      });
    }
    
    // Clear any previous alerts when switching between choices
    if (value === 'assessment_needed') {
      // Wait for UI to update, then evaluate
      setTimeout(() => evaluateSubstanceUseRisk(), 200);
    }
  };
  const [currentContactNumber, setCurrentContactNumber] = useState(1);
  const [recordClosed, setRecordClosed] = useState(false);
  const [recordClosureReason, setRecordClosureReason] = useState("");

  
  // Collapsible card states

  const [showVitalSigns, setShowVitalSigns] = useState(false);
  const [showMaternalAssessment, setShowMaternalAssessment] = useState(false);
  const [showMaternalAssessmentModal, setShowMaternalAssessmentModal] = useState(false);
  const [showFetalAssessment, setShowFetalAssessment] = useState(false);
  const [showFetalAssessmentModal, setShowFetalAssessmentModal] = useState(false);
  const [showLabInvestigations, setShowLabInvestigations] = useState(false);
  const [showObstetricExam, setShowObstetricExam] = useState(false);
  const [showScreeningTests, setShowScreeningTests] = useState(false);
  const [showHealthEducation, setShowHealthEducation] = useState(false);



  const [showSpecializedTestsModal, setShowSpecializedTestsModal] = useState(false);
  const [showClinicalInvestigations, setShowClinicalInvestigations] = useState(false);
  
  // Behavioral counselling state
  const [behavioralCounsellingData, setBehavioralCounsellingData] = useState<BehavioralCounsellingData>({});
  
  // HIV Testing state
  const [hivTestingData, setHivTestingData] = useState<HIVTestingData | undefined>(undefined);
  
  // POC Tests state
  const [pocTestsData, setPocTestsData] = useState<POCTestData[]>([]);
  
  // Laboratory Tests state
  const [laboratoryTestsData, setLaboratoryTestsData] = useState<any>({});
  
  // Health Education state
  const [healthEducationData, setHealthEducationData] = useState<any>({});
  
  // ANC PrEP state
  const [ancPrepData, setAncPrepData] = useState<ANCPrepAssessmentData | undefined>(undefined);
  
  // State for various ANC sections data
  const [rapidAssessmentData, setRapidAssessmentData] = useState<any>({});
  const [clientData, setClientData] = useState<any>({});
  const [counsellingData, setCounsellingData] = useState<any>({});
  const [referralData, setReferralData] = useState<any>({});
  
  // Enhanced danger signs state
  const [dangerSignsConfirmed, setDangerSignsConfirmed] = useState(false);
  const [showEmergencyReferralAuto, setShowEmergencyReferralAuto] = useState(false);
  
  // Medical History CDSS state - now trigger-based only
  
  // Form trigger-based CDSS modal state
  const [showCDSSTriggeredModal, setShowCDSSTriggeredModal] = useState(false);
  const [currentCDSSAlert, setCurrentCDSSAlert] = useState<CDSSTriggeredAlert | null>(null);
  const [substanceUseFormData, setSubstanceUseFormData] = useState<any>({});

  // Update Latest Encounter data when active tab changes
  useEffect(() => {
    const encounterData: any = {};
    
    switch (activeTab) {
      case 'rapidAssessment':
        // Get contact date from the form input element
        const contactDateInput = document.getElementById('contact_date') as HTMLInputElement;
        const contactDateValue = contactDateInput?.value || 'Not recorded';
        
        encounterData.title = 'Rapid Assessment';
        encounterData.fields = [
          { label: 'Contact Date', value: contactDateValue },
          { label: 'Gestational Age', value: rapidAssessmentData?.gestational_age_weeks ? `${rapidAssessmentData.gestational_age_weeks} weeks` : 'Not calculated' },
          { label: 'Pregnancy Status', value: rapidAssessmentData?.pregnancy_status || 'Not assessed' },
          { label: 'Risk Level', value: rapidAssessmentData?.risk_level || 'Not assessed' }
        ];
        break;
        
      case 'clientProfile':
        encounterData.title = 'Client Profile';
        encounterData.fields = [
          { label: 'Registration Date', value: clientData?.registration_date || 'Not recorded' },
          { label: 'Age', value: clientData?.age ? `${clientData.age} years` : 'Not recorded' },
          { label: 'Gravida', value: clientData?.gravida || 'Not recorded' },
          { label: 'Para', value: clientData?.para || 'Not recorded' }
        ];
        break;
        
      case 'medicalHistory':
        encounterData.title = 'Medical History';
        encounterData.fields = [
          { label: 'Previous Pregnancies', value: '0' },
          { label: 'Chronic Conditions', value: 'None' },
          { label: 'Allergies', value: 'None' },
          { label: 'Risk Factors', value: '0' }
        ];
        break;
        
      case 'examination':
        encounterData.title = 'Examination';
        encounterData.fields = [
          { label: 'Blood Pressure', value: examData?.bp_systolic && examData?.bp_diastolic ? `${examData.bp_systolic}/${examData.bp_diastolic} mmHg` : 'Not recorded' },
          { label: 'Weight', value: examData?.weight ? `${examData.weight} kg` : 'Not recorded' },
          { label: 'Fundal Height', value: examData?.fundal_height ? `${examData.fundal_height} cm` : 'Not recorded' },
          { label: 'Fetal Heart Rate', value: examData?.fetal_heart_rate ? `${examData.fetal_heart_rate} bpm` : 'Not recorded' }
        ];
        break;
        
      case 'labs':
        encounterData.title = 'Lab Investigations';
        encounterData.fields = [
          { label: 'HIV Status', value: laboratoryTestsData?.hiv_status || 'Not tested' },
          { label: 'Hemoglobin', value: laboratoryTestsData?.hemoglobin ? `${laboratoryTestsData.hemoglobin} g/dL` : 'Not tested' },
          { label: 'Blood Group', value: laboratoryTestsData?.blood_group || 'Not tested' },
          { label: 'Anemia Status', value: laboratoryTestsData?.anemia_status || 'Not assessed' }
        ];
        break;
        
      case 'counseling':
        encounterData.title = 'Counselling & Preventative';
        encounterData.fields = [
          { label: 'Counselling Provided', value: counsellingData?.counselling_provided?.length ? 'Yes' : 'No' },
          { label: 'Topics Covered', value: counsellingData?.topics_covered?.length || '0' },
          { label: 'Iron/Folate', value: counsellingData?.iron_folate_given ? 'Given' : 'Not given' },
          { label: 'Deworming', value: counsellingData?.deworming_given ? 'Given' : 'Not given' }
        ];
        break;
        
      case 'referral':
        encounterData.title = 'Referral';
        encounterData.fields = [
          { label: 'Referral Status', value: referralData?.referral_made ? 'Referred' : 'Not referred' },
          { label: 'Referral Type', value: referralData?.referral_type || 'None' },
          { label: 'Facility', value: referralData?.referral_facility || 'Not specified' },
          { label: 'Reason', value: referralData?.referral_reason || 'Not specified' }
        ];
        break;
        
      case 'pmtct':
        encounterData.title = 'PMTCT';
        encounterData.fields = [
          { label: 'PMTCT Status', value: pmtctData?.pmtct_status || 'Not assessed' },
          { label: 'ART Status', value: pmtctData?.art_status || 'Not on ART' },
          { label: 'Partner Status', value: pmtctData?.partner_hiv_status || 'Unknown' },
          { label: 'WHO Stage', value: pmtctData?.who_stage || 'Not assessed' }
        ];
        break;
        
      default:
        encounterData.title = 'No Section Selected';
        encounterData.fields = [];
    }
    
    setLatestEncounterData(encounterData);
  }, [activeTab, rapidAssessmentData, clientData, examData, laboratoryTestsData, counsellingData, referralData, pmtctData]);

  // Handler for saving behavioral counselling data
  const handleSaveBehavioralCounselling = (data: BehavioralCounsellingData) => {
    setBehavioralCounsellingData(data);
    updateBehavioralCounsellingStatus(data);
    toast({
      title: "Behavioral Counselling Saved",
      description: "Assessment data has been recorded successfully.",
      duration: 3000,
    });
  };

  // HIV Testing handler
  const handleSaveHIVTesting = (data: HIVTestingData) => {
    setHivTestingData(data);
    
    // Update Recent Data Summary with HTS status using correct field names
    updateRecentDataSummary({
      testResult: data.bioline === 'Reactive' ? 'Positive' : data.bioline === 'Non-reactive' ? 'Negative' : data.bioline,
      testDate: data.testDate ? new Date(data.testDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      hivType: data.bioline === 'Reactive' ? (data.hivType || 'HIV+') : null
    });
    
    // Check if HIV test is positive (bioline is Reactive)
    if (data.bioline === 'Reactive') {
      toast({
        title: "HIV Positive Result Detected",
        description: "Please complete the PMTCT assessment in the PMTCT tab.",
        variant: "destructive",
        duration: 7000,
      });
      
      // Automatically switch to PMTCT tab
      setTimeout(() => {
        setActiveTab('pmtct');
        // Open PMTCT dialog automatically
        setTimeout(() => {
          setShowPMTCTDialog(true);
        }, 500);
      }, 1500);
    } else {
      toast({
        title: "HIV Testing Data Saved",
        description: "HIV testing data has been saved successfully.",
      });
    }
  };

  // ANC PrEP handler
  const handleSaveANCPrep = (data: ANCPrepAssessmentData) => {
    setAncPrepData(data);
    toast({
      title: "ANC PrEP Assessment Saved",
      description: "PrEP assessment data has been saved successfully.",
    });
  };

  // Function to check if PrEP should be shown (HIV-discordant couple)
  const shouldShowPrEP = () => {
    if (!hivTestingData) return false;
    
    // Check if client is HIV-negative and partner is HIV-positive
    const clientNegative = hivTestingData.determine === 'Non-reactive' || 
                          hivTestingData.lastTestResult === 'Negative';
    const partnerPositive = hivTestingData.partnerHivStatus === 'Positive';
    
    return clientNegative && partnerPositive;
  };

  const handleSavePOCTests = (data: POCTestData[]) => {
    setPocTestsData(data);
    
    // Update Recent Data Summary with investigation results using correct field mapping
    const completedTests = data.filter(test => test.results?.value && test.results?.resultStatus !== 'pending').length;
    const pendingTests = data.filter(test => !test.results?.value || test.results?.resultStatus === 'pending').length;
    const investigationSummary = data.length > 0 
      ? `${completedTests} completed, ${pendingTests} pending`
      : 'No tests conducted';
    
    updateRecentDataSummary({
      investigations: investigationSummary,
      pocTests: data
    });
    
    toast({
      title: "POC Tests Updated",
      description: `${data.length} POC test(s) have been saved successfully.`,
    });
  };

  // Laboratory Tests handler
  const handleSaveLaboratoryTests = (data: any) => {
    setLaboratoryTestsData(data);
    
    // Update Recent Data Summary with HTS status from lab results
    if (data.hiv_status) {
      updateRecentDataSummary({
        testResult: data.hiv_status,
        testDate: data.test_date || new Date().toISOString().split('T')[0]
      });
    }
    
    toast({
      title: "Laboratory Tests Saved",
      description: "All laboratory test results have been saved successfully.",
    });
  };

  // Health Education handler
  const handleSaveHealthEducation = (data: any) => {
    setHealthEducationData(data);
    toast({
      title: "Health Education Saved",
      description: "All health education and counseling records have been saved successfully.",
    });
  };

  // Interventions & Treatments handler
  const handleSaveInterventionsTreatments = (data: InterventionsTreatmentsData) => {
    setInterventionsData(data);
    updateInterventionsTreatmentsStatus(data);
    
    // Update Recent Data Summary with treatment plan using correct field mapping
    const treatmentSummary = [];
    
    // Check nutrition supplements
    const nutritionGiven = [];
    if (data.iron_given === 'yes') nutritionGiven.push('Iron');
    if (data.folic_acid_given === 'yes') nutritionGiven.push('Folic Acid');
    if (data.calcium_given === 'yes') nutritionGiven.push('Calcium');
    if (nutritionGiven.length > 0) {
      treatmentSummary.push(`${nutritionGiven.length} nutrition supplements given`);
    }
    
    // Check immunizations 
    const immunizations = [];
    if (data.tt1_given === 'yes') immunizations.push('TT1');
    if (data.tt2_given === 'yes') immunizations.push('TT2');
    if (data.tt3_given === 'yes') immunizations.push('TT3');
    if (data.tt4_given === 'yes') immunizations.push('TT4');
    if (data.tt5_given === 'yes') immunizations.push('TT5');
    if (immunizations.length > 0) {
      treatmentSummary.push(`${immunizations.length} immunizations given`);
    }
    
    // Check preventive therapy
    if (data.ipt_given === 'yes') {
      treatmentSummary.push('IPT therapy given');
    }
    
    updateRecentDataSummary({
      treatmentPlan: treatmentSummary.length > 0 ? treatmentSummary.join(', ') : 'No active interventions',
      activeMedications: nutritionGiven
    });
    
    toast({
      title: "Interventions & Treatments Saved",
      description: "All nutrition, preventive therapy, and immunization data have been saved successfully.",
    });
  };

  // Prescription trigger callback for interventions
  const handleTriggerPrescription = (drugData: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    category: string;
    itemPerDose: string;
    timePerUnit: string;
    frequencyUnit: string;
    durationUnit: string;
    instructions?: string;
  }) => {
    setPrePopulatedDrug(drugData);
    setShowPrescriptionModal(true);
    toast({
      title: "Prescription Modal Opened",
      description: `${drugData.name} has been pre-populated in the prescription form.`,
    });
  };

  // Prescription modal handlers
  const handlePrescriptionSaveComplete = () => {
    setShowPrescriptionModal(false);
    setPrePopulatedDrug(null);
    
    // Update Recent Data Summary with medication plan from prescription
    if (prescriptionData?.medications) {
      updateRecentDataSummary({
        activeMedications: prescriptionData.medications,
        treatmentPlan: prescriptionData.medications.length > 0 
          ? `${prescriptionData.medications.length} medications prescribed` 
          : 'No active prescriptions'
      });
    }
    
    toast({
      title: "Prescription Saved",
      description: "Prescription has been saved successfully.",
    });
  };

  const handleClosePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setPrePopulatedDrug(null);
  };

  // Enhanced behavioral counselling status display with Given-When-Then tracking
  const updateBehavioralCounsellingStatus = (data: BehavioralCounsellingData) => {
    const caffeineStatus = document.getElementById('behavioral_caffeine_status');
    const tobaccoStatus = document.getElementById('behavioral_tobacco_status');
    const secondhandStatus = document.getElementById('behavioral_secondhand_status');
    const alcoholStatus = document.getElementById('behavioral_alcohol_status');
    const overallStatus = document.getElementById('behavioral_overall_status');

    // Update traditional behavioral counselling status
    if (caffeineStatus) {
      caffeineStatus.textContent = data.caffeine_counselling ? 
        (data.caffeine_counselling === 'done' ? 'Done' : 'Not done') : 'Not applicable';
    }
    if (tobaccoStatus) {
      tobaccoStatus.textContent = data.tobacco_counselling ? 
        (data.tobacco_counselling === 'done' ? 'Done' : 'Not done') : 'Not applicable';
    }
    if (secondhandStatus) {
      secondhandStatus.textContent = data.second_hand_smoking ? 
        (data.second_hand_smoking === 'done' ? 'Done' : 'Not done') : 'Not applicable';
    }
    if (alcoholStatus) {
      alcoholStatus.textContent = data.alcohol_substance_counselling ? 
        (data.alcohol_substance_counselling === 'done' ? 'Done' : 'Not done') : 'Not applicable';
    }

    // Calculate overall status including Given-When-Then sessions
    if (overallStatus) {
      const completedCounselling = [
        data.caffeine_counselling,
        data.tobacco_counselling,
        data.second_hand_smoking,
        data.alcohol_substance_counselling
      ].filter(status => status === 'done').length;
      
      const totalRequired = [
        data.caffeine_counselling,
        data.tobacco_counselling,
        data.second_hand_smoking,
        data.alcohol_substance_counselling
      ].filter(status => status).length;

      // Add Given-When-Then session tracking
      const completedSessions = data.counseling_sessions?.filter(session => 
        session.completion_status === 'completed'
      ).length || 0;
      
      const totalSessions = data.counseling_sessions?.length || 0;
      
      // Update preventative care status displays
      const nutritionSupplementationDisplay = document.getElementById('nutrition_supplementation_status');
      const preventiveTherapyDisplay = document.getElementById('preventive_therapy_status');
      const immunisationDisplay = document.getElementById('immunisation_status');
      const clinicalSessionsDisplay = document.getElementById('clinical_counselling_sessions');

      // Check nutrition supplementation completion
      if (nutritionSupplementationDisplay) {
        const ironCompleted = data.elemental_iron_andfolic_acid === 'given';
        const calciumCompleted = data.calcium_supplementation === 'given';
        const nutritionCompleted = ironCompleted && calciumCompleted;
        
        nutritionSupplementationDisplay.textContent = nutritionCompleted ? 'Completed' : 
          (ironCompleted || calciumCompleted ? 'Partially completed' : 'Not completed');
        nutritionSupplementationDisplay.className = nutritionCompleted ? 'text-green-600' : 
          (ironCompleted || calciumCompleted ? 'text-yellow-600' : 'text-gray-500');
      }

      // Check preventive therapy completion
      if (preventiveTherapyDisplay) {
        const malariaCompleted = data.malaria_prevention_counselling === 'done';
        const itnCompleted = data.itn_issued === 'yes';
        const cptCompleted = data.cpt_cotrimoxazole === 'yes';
        const dewormingCompleted = data.deworming_mebendazole === 'yes';
        
        const completedItems = [malariaCompleted, itnCompleted, cptCompleted, dewormingCompleted].filter(Boolean).length;
        const totalItems = 4;
        
        preventiveTherapyDisplay.textContent = completedItems === totalItems ? 'Completed' : 
          (completedItems > 0 ? `${completedItems}/${totalItems} completed` : 'Not completed');
        preventiveTherapyDisplay.className = completedItems === totalItems ? 'text-green-600' : 
          (completedItems > 0 ? 'text-yellow-600' : 'text-gray-500');
      }

      // Check immunisation status
      if (immunisationDisplay) {
        const ttcvCompleted = data.ttcv_immunisation && data.ttcv_immunisation !== 'not_done';
        
        immunisationDisplay.textContent = ttcvCompleted ? 'TTCV completed' : 'Not completed';
        immunisationDisplay.className = ttcvCompleted ? 'text-green-600' : 'text-gray-500';
      }

      // Update Given-When-Then session tracking
      if (clinicalSessionsDisplay) {
        const allSessions = data.counseling_sessions || [];
        const completedSessions = allSessions.filter(s => s.completion_status === 'completed').length;
        
        clinicalSessionsDisplay.textContent = `${completedSessions}/${allSessions.length} sessions`;
        clinicalSessionsDisplay.className = completedSessions === allSessions.length && allSessions.length > 0 ? 'text-green-600' : 'text-gray-500';
      }
      
      const totalCompleted = completedCounselling + completedSessions;
      const totalAll = totalRequired + totalSessions;

      if (totalAll === 0) {
        overallStatus.textContent = 'Ready for assessment';
        overallStatus.className = 'text-blue-600 font-medium';
      } else if (totalCompleted === totalAll) {
        overallStatus.textContent = `All completed (${totalCompleted}/${totalAll})`;
        overallStatus.className = 'text-green-600 font-medium';
      } else {
        overallStatus.textContent = `${totalCompleted}/${totalAll} completed`;
        overallStatus.className = 'text-orange-600 font-medium';
      }
    }
  };

  // Preventive and Promotive Intervention status update function
  const updateInterventionsTreatmentsStatus = (data: InterventionsTreatmentsData) => {
    const nutritionStatus = document.getElementById('nutrition_supplementation_status');
    const ironStatus = document.getElementById('iron_status');
    const folicAcidStatus = document.getElementById('folic_acid_status');
    const calciumStatus = document.getElementById('calcium_status');
    const preventiveStatus = document.getElementById('preventive_therapy_status');
    const immunisationStatus = document.getElementById('immunisation_status');
    const overallInterventionsStatus = document.getElementById('overall_interventions_status');

    // Update individual nutrition supplementation status
    if (ironStatus) {
      const ironCompleted = data.iron_given === 'yes';
      ironStatus.textContent = ironCompleted ? 'Completed' : 'Not completed';
      ironStatus.className = ironCompleted ? 'text-green-600' : 'text-gray-500';
    }

    if (folicAcidStatus) {
      const folicAcidCompleted = data.folic_acid_given === 'yes';
      folicAcidStatus.textContent = folicAcidCompleted ? 'Completed' : 'Not completed';
      folicAcidStatus.className = folicAcidCompleted ? 'text-green-600' : 'text-gray-500';
    }

    if (calciumStatus) {
      const calciumCompleted = data.calcium_given === 'yes';
      calciumStatus.textContent = calciumCompleted ? 'Completed' : 'Not completed';
      calciumStatus.className = calciumCompleted ? 'text-green-600' : 'text-gray-500';
    }

    // Update overall nutrition supplementation status
    if (nutritionStatus) {
      const ironCompleted = data.iron_given === 'yes';
      const folicAcidCompleted = data.folic_acid_given === 'yes';
      const calciumCompleted = data.calcium_given === 'yes';
      const nutritionCompleted = ironCompleted && folicAcidCompleted && calciumCompleted;
      
      const completedCount = [ironCompleted, folicAcidCompleted, calciumCompleted].filter(Boolean).length;
      const totalCount = 3;
      
      nutritionStatus.textContent = nutritionCompleted ? 'Completed' : 
        (completedCount > 0 ? `${completedCount}/${totalCount} completed` : 'Not completed');
      nutritionStatus.className = nutritionCompleted ? 'text-green-600' : 
        (completedCount > 0 ? 'text-yellow-600' : 'text-gray-500');
    }

    // Update preventive therapy status
    if (preventiveStatus) {
      const dewormingCompleted = data.deworming_mebendazole === 'yes';
      
      preventiveStatus.textContent = dewormingCompleted ? 'Completed' : 'Not completed';
      preventiveStatus.className = dewormingCompleted ? 'text-green-600' : 'text-gray-500';
    }

    // Update immunisation status
    if (immunisationStatus) {
      const ttcvCompleted = data.ttcv_immunisation && data.ttcv_immunisation !== 'not_done';
      
      immunisationStatus.textContent = ttcvCompleted ? 'TTCV completed' : 'Not completed';
      immunisationStatus.className = ttcvCompleted ? 'text-green-600' : 'text-gray-500';
    }

    // Update overall interventions status
    if (overallInterventionsStatus) {
      const totalCompleted = [
        data.iron_given === 'yes',
        data.folic_acid_given === 'yes',
        data.calcium_given === 'yes',
        data.deworming_mebendazole === 'yes',
        data.ttcv_immunisation && data.ttcv_immunisation !== 'not_done'
      ].filter(Boolean).length;
      
      const totalRequired = 5;
      
      if (totalCompleted === 0) {
        overallInterventionsStatus.textContent = 'Ready for assessment';
        overallInterventionsStatus.className = 'text-blue-600 font-medium';
      } else if (totalCompleted === totalRequired) {
        overallInterventionsStatus.textContent = `All completed (${totalCompleted}/${totalRequired})`;
        overallInterventionsStatus.className = 'text-green-600 font-medium';
      } else {
        overallInterventionsStatus.textContent = `${totalCompleted}/${totalRequired} completed`;
        overallInterventionsStatus.className = 'text-orange-600 font-medium';
      }
    }
  };

  // Medical History CDSS evaluation removed - now using trigger-based modals only

  // Handle CDSS acknowledgment from medical history
  // Form trigger handlers
  const handleCaffeineIntakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setSubstanceUseFormData(prev => {
      const currentCaffeine = prev.caffeineIntake || [];
      const updatedCaffeine = checked 
        ? [...currentCaffeine, value]
        : currentCaffeine.filter(item => item !== value);
      
      const updatedData = {
        ...prev,
        caffeineIntake: updatedCaffeine
      };
      
      // Check if this change should trigger CDSS modal
      if (checked && ['more_than_2_cups_coffee', 'more_than_4_cups_tea', 'energy_drinks'].includes(value)) {
        triggerCDSSModalFromForm('caffeineIntake', value, updatedData);
      }
      
      return updatedData;
    });
  };

  const handleTobaccoSmokeChange = (value: 'yes' | 'no' | 'recently_quit') => {
    setSubstanceUseFormData(prev => {
      const updatedData = {
        ...prev,
        tobaccoSmoking: value
      };
      
      // Check if this change should trigger CDSS modal
      if (['yes', 'recently_quit'].includes(value)) {
        triggerCDSSModalFromForm('tobaccoSmoking', value, updatedData);
      }
      
      return updatedData;
    });
  };

  const handleTobaccoSniffChange = (value: 'yes' | 'no' | 'recently_quit') => {
    setSubstanceUseFormData(prev => {
      const updatedData = {
        ...prev,
        tobaccoSniffing: value
      };
      
      // Check if this change should trigger CDSS modal
      if (['yes', 'recently_quit'].includes(value)) {
        triggerCDSSModalFromForm('tobaccoSniffing', value, updatedData);
      }
      
      return updatedData;
    });
  };

  const handleHouseholdSmokingChange = (value: 'yes' | 'no') => {
    setSubstanceUseFormData(prev => {
      const updatedData = {
        ...prev,
        householdSmoking: value
      };
      
      // Check if this change should trigger CDSS modal
      if (value === 'yes') {
        triggerCDSSModalFromForm('householdSmoking', value, updatedData);
      }
      
      return updatedData;
    });
  };

  const handleClinicalEnquiryChange = (value: 'yes' | 'no') => {
    setSubstanceUseFormData(prev => {
      const updatedData = {
        ...prev,
        clinicalEnquiry: value
      };
      
      // Check if this change should trigger CDSS modal
      if (value === 'yes') {
        triggerCDSSModalFromForm('clinicalEnquiry', value, updatedData);
      }
      
      return updatedData;
    });
  };

  const handleSubstanceUseChangeNew = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setSubstanceUseFormData(prev => {
      const currentSubstances = prev.substanceUse || [];
      const updatedSubstances = checked 
        ? [...currentSubstances, value]
        : currentSubstances.filter(item => item !== value);
      
      const updatedData = {
        ...prev,
        substanceUse: updatedSubstances
      };
      
      // Check if this change should trigger CDSS modal
      if (checked && ['alcohol', 'marijuana', 'cocaine', 'injectable_drugs'].includes(value)) {
        triggerCDSSModalFromForm('substanceUse', value, updatedData);
      }
      
      return updatedData;
    });
  };

  // Function to trigger CDSS modal based on form triggers
  const triggerCDSSModalFromForm = (fieldName: string, value: string, formData: any) => {
    // Generate CDSS alerts based on current form state
    const evaluation = evaluateBehavioralCounsellingRequirements({
      daily_caffeine_intake: formData.caffeineIntake?.some((item: string) => 
        ['more_than_2_cups_coffee', 'more_than_4_cups_tea', 'energy_drinks'].includes(item)
      ) ? 'high' : undefined,
      tobacco_use_smoking: formData.tobaccoSmoking,
      tobacco_use_sniffing: formData.tobaccoSniffing,
      anyone_smokes_in_household: formData.householdSmoking,
      uses_alcohol_substances: formData.substanceUse?.filter((item: string) => item !== 'none')
    });

    // Find the relevant alert for this trigger
    const relevantAlert = evaluation.alerts.find(alert => {
      if (fieldName === 'caffeineIntake') return alert.type === 'caffeine';
      if (fieldName === 'tobaccoSmoking' || fieldName === 'tobaccoSniffing') return alert.type === 'tobacco';
      if (fieldName === 'householdSmoking') return alert.type === 'secondhand_smoke';
      if (fieldName === 'substanceUse' || fieldName === 'clinicalEnquiry') return alert.type === 'alcohol_substance';
      return false;
    });

    if (relevantAlert) {
      // Convert to CDSSTriggeredAlert format
      const triggeredAlert: CDSSTriggeredAlert = {
        id: relevantAlert.id,
        type: relevantAlert.type,
        title: relevantAlert.title,
        message: relevantAlert.message,
        counsellingGuidance: relevantAlert.counsellingGuidance,
        severity: relevantAlert.severity,
        triggerCondition: `Form selection: ${fieldName} = ${value}`
      };

      setCurrentCDSSAlert(triggeredAlert);
      setShowCDSSTriggeredModal(true);
    }
  };

  const handleMedicalHistoryCDSSAcknowledgment = (alertType: CDSSAlert['type']) => {
    // Map alert type to behavioral counselling field and update status
    const fieldMapping = {
      caffeine: 'caffeine_counselling',
      tobacco: 'tobacco_counselling', 
      secondhand_smoke: 'second_hand_smoking',
      alcohol_substance: 'alcohol_substance_counselling',
      ipv: 'ipv_counselling'
    };

    const fieldName = fieldMapping[alertType];
    if (fieldName) {
      const updatedData = {
        ...behavioralCounsellingData,
        [fieldName]: 'done'
      };
      
      setBehavioralCounsellingData(updatedData);
      updateBehavioralCounsellingStatus(updatedData);
      
      toast({
        title: "Counselling Acknowledged",
        description: `${alertType.replace('_', ' ')} counselling has been marked as completed.`,
        duration: 3000,
      });
    }
  };

  // Initialize CDSS evaluation on component mount
  React.useEffect(() => {
    // Medical history CDSS evaluation removed - now using trigger-based modals only
  }, []);


  const [showCurrentPregnancyDialog, setShowCurrentPregnancyDialog] = useState(false);
  const [showObstetricHistoryDialog, setShowObstetricHistoryDialog] = useState(false);
  
  // Obstetric History State Management
  const [obstetricHistory, setObstetricHistory] = useState({
    gravida: '',
    para: '',
    abortions: '',
    livingChildren: ''
  });
  const [obstetricValidationErrors, setObstetricValidationErrors] = useState<Record<string, string>>({});
  const [showMedicalHistoryDialog, setShowMedicalHistoryDialog] = useState(false);
  const [showStandardAssessmentDialog, setShowStandardAssessmentDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);

  // Medical risk level calculation for pre-existing conditions
  const updateMedicalRiskLevel = (event: any) => {
    const medicalRiskDisplay = document.getElementById('medical-risk-level-display');
    const medicalRiskRecommendations = document.getElementById('medical-risk-recommendations');
    
    if (!medicalRiskDisplay || !medicalRiskRecommendations) return;
    
    // Get all checked medical conditions
    const checkedConditions = Array.from(document.querySelectorAll('#pre-existing-condition-options input[type="checkbox"]:checked')).map((cb: any) => cb.value);
    
    let finalRiskLevel = 'Low Medical Risk';
    let finalRiskColor = 'text-green-600';
    let recommendations: string[] = [];
    
    // Determine medical risk level based on conditions
    const hasHighRiskConditions = checkedConditions.some(condition => 
      ['cardiac_condition', 'diabetes_mellitus', 'renal_failure', 'epilepsy', 'hypertension', 'severe_anaemia', 'coagulopathy', 'renal_disease', 'sickle_cell'].includes(condition)
    );
    
    const hasModerateRiskConditions = checkedConditions.some(condition => 
      ['asthma', 'hyperthyroidism', 'rh_negative'].includes(condition)
    );
    
    if (hasHighRiskConditions) {
      finalRiskLevel = 'High Medical Risk Pregnancy';
      finalRiskColor = 'text-red-600';
      recommendations = [
        'Immediate specialist consultation required',
        'Multidisciplinary care team involvement',
        'Enhanced antenatal monitoring protocol',
        'Pre-conception counseling for future pregnancies',
        'Medication review and optimization',
        'Delivery planning at tertiary care facility'
      ];
    } else if (hasModerateRiskConditions || checkedConditions.length >= 2) {
      finalRiskLevel = 'Moderate Medical Risk Pregnancy';
      finalRiskColor = 'text-orange-600';
      recommendations = [
        'Specialist consultation recommended',
        'Enhanced monitoring schedule',
        'Regular medication review',
        'Patient education on warning signs',
        'Delivery planning discussion'
      ];
    } else if (checkedConditions.length >= 1) {
      finalRiskLevel = 'Increased Medical Risk Pregnancy';
      finalRiskColor = 'text-yellow-600';
      recommendations = [
        'Consider specialist consultation',
        'Standard plus monitoring protocol',
        'Regular assessment of medical condition'
      ];
    }
    
    medicalRiskDisplay.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="font-semibold ${finalRiskColor}">${finalRiskLevel}</span>
        <span class="text-xs bg-gray-100 px-2 py-1 rounded">${checkedConditions.length} condition(s) identified</span>
      </div>
    `;
    
    medicalRiskRecommendations.innerHTML = `
      <div class="space-y-1">
        <p class="font-medium text-gray-700">Medical Management Recommendations:</p>
        <ul class="space-y-1">
          ${recommendations.map(rec => `<li class="flex items-start space-x-1"><span class="text-blue-600 text-xs">•</span><span>${rec}</span></li>`).join('')}
        </ul>
      </div>
    `;
  };

  // Routine referral checklist progress calculation
  const updateRoutineChecklistProgress = () => {
    const progressDisplay = document.getElementById('routine-checklist-progress');
    const progressBar = document.getElementById('routine-checklist-progress-bar');
    const checkedItems = document.querySelectorAll('input[name="routine_checklist"]:checked').length;
    const totalItems = 12;
    const percentage = (checkedItems / totalItems) * 100;
    
    if (progressDisplay) {
      progressDisplay.textContent = `${checkedItems}/${totalItems} items completed`;
    }
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  };

  // Risk level calculation for obstetric history
  const updateRiskLevel = (event: any, riskLevel: string) => {
    const riskDisplay = document.getElementById('risk-level-display');
    const riskRecommendations = document.getElementById('risk-recommendations');
    const riskContainer = document.getElementById('risk-stratification');
    
    if (!riskDisplay || !riskRecommendations || !riskContainer) return;
    
    // Get all checked complications
    const checkedComplications = Array.from(document.querySelectorAll('#complications-risk-grid input[type="checkbox"]:checked')).map((cb: any) => cb.value);
    
    let finalRiskLevel = 'Low Risk';
    let finalRiskColor = 'text-green-600';
    let recommendations: string[] = [];
    
    // Determine overall risk level based on complications
    const hasHighRisk = checkedComplications.some(comp => 
      ['preeclampsia', 'placental_abruption', 'placenta_previa', 'postpartum_hemorrhage', 'fetal_loss'].includes(comp)
    );
    
    const hasModerateRisk = checkedComplications.some(comp => 
      ['gestational_diabetes', 'premature_labor', 'cesarean_section', 'prolonged_labor', 'infections'].includes(comp)
    );
    
    if (hasHighRisk) {
      finalRiskLevel = 'High Risk Pregnancy';
      finalRiskColor = 'text-red-600';
      recommendations = [
        'Immediate specialist obstetric consultation required',
        'Enhanced monitoring protocol - weekly visits',
        'Delivery planning at tertiary care facility',
        'Consider antenatal corticosteroids if indicated',
        'Patient education on danger signs'
      ];
    } else if (hasModerateRisk || checkedComplications.length >= 2) {
      finalRiskLevel = 'Moderate Risk Pregnancy';
      finalRiskColor = 'text-orange-600';
      recommendations = [
        'Specialist consultation within 2 weeks',
        'Enhanced monitoring - bi-weekly visits',
        'Delivery planning discussion',
        'Patient education on warning signs'
      ];
    } else if (checkedComplications.length >= 1) {
      finalRiskLevel = 'Increased Risk Pregnancy';
      finalRiskColor = 'text-yellow-600';
      recommendations = [
        'Consider specialist consultation',
        'Standard plus monitoring protocol',
        'Regular assessment of identified risk factors'
      ];
    }
    
    riskDisplay.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="font-semibold ${finalRiskColor}">${finalRiskLevel}</span>
        <span class="text-xs bg-gray-100 px-2 py-1 rounded">${checkedComplications.length} risk factor(s) identified</span>
      </div>
    `;
    
    riskRecommendations.innerHTML = `
      <div class="space-y-1">
        <p class="font-medium text-gray-700">Recommended Actions:</p>
        <ul class="space-y-1">
          ${recommendations.map(rec => `<li class="flex items-start space-x-1"><span class="text-blue-600 text-xs">•</span><span>${rec}</span></li>`).join('')}
        </ul>
      </div>
    `;
    
    // Update container background color based on risk level
    if (hasHighRisk) {
      riskContainer.className = 'p-3 border rounded bg-red-50 border-red-300';
    } else if (hasModerateRisk) {
      riskContainer.className = 'p-3 border rounded bg-orange-50 border-orange-300';
    } else {
      riskContainer.className = 'p-3 border rounded bg-yellow-50 border-yellow-300';
    }
  };

  // Define updateChecklistRelevance function with useCallback for optimization
  const updateChecklistRelevance = useCallback(() => {
    const selectedReasons = Array.from(document.querySelectorAll('input[name="referral_reasons"]:checked')).map((cb: any) => cb.value);
    
    // Define checklist section requirements based on emergency conditions
    const checklistRequirements: { [key: string]: string[] } = {
      // Critical conditions requiring ALL sections
      'convulsions': ['communication', 'procedures', 'medications', 'vitals', 'special', 'final'],
      'severe_bleeding': ['communication', 'procedures', 'medications', 'vitals', 'special', 'final'],
      'unconscious': ['communication', 'procedures', 'medications', 'vitals', 'special', 'final'],
      'severe_headache_bp': ['communication', 'procedures', 'medications', 'vitals', 'final'],
      
      // Moderate conditions requiring selected sections
      'high_fever': ['communication', 'procedures', 'medications', 'vitals', 'final'],
      'severe_anemia': ['communication', 'procedures', 'medications', 'vitals', 'final'],
      'prolonged_labor': ['communication', 'procedures', 'vitals', 'special', 'final'],
      'fetal_distress': ['communication', 'procedures', 'vitals', 'final'],
      
      // Less critical conditions requiring basic sections
      'grand_multiparity': ['communication', 'procedures', 'vitals', 'final'],
      'other': ['communication', 'final']
    };
    
    // Determine required sections based on selected reasons
    let requiredSections = new Set<string>();
    selectedReasons.forEach(reason => {
      if (checklistRequirements[reason]) {
        checklistRequirements[reason].forEach(section => requiredSections.add(section));
      }
    });
    
    // Update checklist section visibility and styling
    const sections = {
      'communication': 'border-green-500',
      'procedures': 'border-orange-500', 
      'medications': 'border-purple-500',
      'vitals': 'border-red-500',
      'special': 'border-yellow-500',
      'final': 'border-blue-500'
    };
    
    Object.entries(sections).forEach(([sectionKey, borderClass]) => {
      const section = document.querySelector('.' + borderClass);
      if (section) {
        const isRequired = requiredSections.has(sectionKey);
        const header = section.querySelector('h4');
        
        if (isRequired) {
          // Show and highlight required sections
          (section as HTMLElement).style.opacity = '1';
          (section as HTMLElement).style.borderWidth = '2px';
          (section as HTMLElement).style.borderStyle = 'solid';
          if (header && !header.innerHTML.includes('*REQUIRED*')) {
            header.innerHTML += ' <span style="color: red; font-weight: bold;">*REQUIRED*</span>';
          }
        } else {
          // Dim optional sections
          (section as HTMLElement).style.opacity = '0.6';
          (section as HTMLElement).style.borderWidth = '1px';
          (section as HTMLElement).style.borderStyle = 'dashed';
          (section as HTMLElement).style.borderColor = '#ccc';
          if (header) {
            header.innerHTML = header.innerHTML.replace(/ <span style="color: red; font-weight: bold;">\*REQUIRED\*<\/span>/g, '');
            if (!header.innerHTML.includes('(Optional)')) {
              header.innerHTML += ' <span style="color: gray; font-size: 0.75rem;">(Optional)</span>';
            }
          }
        }
      }
    });
    
    // Update progress calculation based on required sections only
    const updateProgress = () => {
      let completed = 0;
      let totalRequired = 0;
      
      // Count only required checklist items
      const allCheckboxes = document.querySelectorAll('input[name="maternal_checklist"]');
      allCheckboxes.forEach(checkbox => {
        const section = checkbox.closest('.bg-white.rounded.p-3');
        if (section && (section as HTMLElement).style.opacity === '1') {
          totalRequired++;
          if ((checkbox as HTMLInputElement).checked) completed++;
        }
      });
      
      // Count required vital signs
      const vitalInputs = document.querySelectorAll('input[name="checklist_bp"], input[name="checklist_pulse"], input[name="checklist_temp"], input[name="checklist_rr"]');
      if (requiredSections.has('vitals')) {
        totalRequired += vitalInputs.length;
        vitalInputs.forEach(input => {
          if ((input as HTMLInputElement).value) completed++;
        });
      }
      
      // Count clotting test if procedures required
      const clottingTest = document.querySelector('select[name="clotting_test_result"]') as HTMLSelectElement;
      if (requiredSections.has('procedures') && clottingTest) {
        totalRequired++;
        if (clottingTest.value) completed++;
      }
      
      // Update progress display
      const progressText = document.getElementById('checklist-progress');
      const progressBar = document.getElementById('checklist-progress-bar');
      
      if (progressText) {
        progressText.textContent = totalRequired > 0 
          ? `${completed}/${totalRequired} required items completed`
          : 'No required items based on emergency conditions';
      }
      
      if (progressBar) {
        const percentage = totalRequired > 0 ? (completed / totalRequired) * 100 : 0;
        (progressBar as HTMLElement).style.width = percentage + '%';
        
        if (percentage === 100 && totalRequired > 0) {
          progressBar.className = 'bg-green-500 h-2 rounded-full transition-all duration-300';
        } else if (percentage >= 50) {
          progressBar.className = 'bg-yellow-500 h-2 rounded-full transition-all duration-300';
        } else {
          progressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
        }
      }
    };
    
    // Store required sections globally for validation
    (window as any).currentRequiredSections = requiredSections;
    
    // Display relevance summary
    const checklistDiv = document.getElementById('maternal-emergency-checklist');
    if (checklistDiv) {
      let summaryDiv = document.getElementById('checklist-relevance-summary');
      if (!summaryDiv) {
        summaryDiv = document.createElement('div');
        summaryDiv.id = 'checklist-relevance-summary';
        summaryDiv.className = 'mb-3 p-3 bg-blue-100 border border-blue-300 rounded text-sm';
        const targetContainer = checklistDiv.querySelector('.border.rounded-lg');
        if (targetContainer) {
          targetContainer.insertBefore(summaryDiv, targetContainer.firstChild);
        }
      }
      
      if (selectedReasons.length === 0) {
        summaryDiv.innerHTML = '<strong>No emergency conditions selected:</strong> Checklist is optional for routine referrals.';
      } else {
        const conditionTypes = selectedReasons.map(reason => {
          if (['convulsions', 'severe_bleeding', 'unconscious'].includes(reason)) return 'Critical';
          if (['high_fever', 'severe_anemia', 'prolonged_labor', 'fetal_distress'].includes(reason)) return 'Moderate';
          if (['grand_multiparity'].includes(reason)) return 'Less Critical';
          return 'Other';
        });
        
        const uniqueTypes = Array.from(new Set(conditionTypes));
        summaryDiv.innerHTML = `<strong>Emergency Level:</strong> ${uniqueTypes.join(', ')} → <strong>${requiredSections.size}</strong> sections required out of 6 total.`;
      }
    }
    
    // Call updateProgress to refresh the display
    updateProgress();
    
    // Enhanced debugging logs
    console.log(`=== CHECKLIST RELEVANCE UPDATE ===`);
    console.log(`Selected conditions:`, selectedReasons);
    console.log(`Required sections (${requiredSections.size}):`, Array.from(requiredSections));
    console.log(`Sections found in DOM:`, Object.keys(sections).map(key => {
      const found = document.querySelector('.' + sections[key]);
      return `${key}: ${found ? 'FOUND' : 'NOT FOUND'}`;
    }));
    console.log(`================================`);
  }, []);

  // Attach to window object when component mounts
  useEffect(() => {
    (window as any).updateChecklistRelevance = updateChecklistRelevance;
    
    // Cleanup on unmount
    return () => {
      delete (window as any).updateChecklistRelevance;
    };
  }, [updateChecklistRelevance]);

  // Global functions for dynamic pregnancy sections
  useEffect(() => {
    (window as any).generatePregnancySection = (pregnancyNum: number) => {
      return `
        <div class="border-b pb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Pregnancy ${pregnancyNum} Details</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Date of Delivery/Termination -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">Date of Delivery/Termination</label>
              <input 
                type="date" 
                id="preg${pregnancyNum}_delivery_date"
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                max="${new Date().toISOString().split('T')[0]}"
              />
            </div>

            <!-- Estimated Date of Delivery/Termination -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">Estimated date of delivery/termination</label>
              <input 
                type="date" 
                id="preg${pregnancyNum}_estimated_delivery"
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>

            <!-- Gestational Age -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">Gestational age (months) *</label>
              <input 
                type="number" 
                id="preg${pregnancyNum}_gestational_age"
                min="1" 
                max="10" 
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="Enter months..."
                onchange="handleGestationalAgeChange(${pregnancyNum}, this.value)"
              />
            </div>

            <!-- Mode of Delivery - Conditional Field -->
            <div id="preg${pregnancyNum}_mode_delivery_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Mode of delivery *</label>
              <select 
                id="preg${pregnancyNum}_mode_delivery"
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onchange="handleModeOfDeliveryChange(${pregnancyNum}, this.value)"
              >
                <option value="">Select mode...</option>
                <option value="normal_vertex">Normal Vertex Delivery</option>
                <option value="assisted_vaginal">Assisted Vaginal Delivery</option>
                <option value="assisted_breech">Assisted Breech delivery</option>
                <option value="c_section">C-section</option>
              </select>
            </div>

            <!-- Type of Labour - Conditional Field -->
            <div id="preg${pregnancyNum}_labour_type_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Type of labour *</label>
              <select 
                id="preg${pregnancyNum}_labour_type"
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onchange="handleLabourTypeChange(${pregnancyNum}, this.value)"
              >
                <option value="">Select type...</option>
                <option value="induced">Induced</option>
                <option value="spontaneous">Spontaneous</option>
              </select>
            </div>

            <!-- Type of Assisted Vaginal Delivery - Conditional Field -->
            <div id="preg${pregnancyNum}_assisted_vaginal_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Type of assisted vaginal delivery *</label>
              <select class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                <option value="">Select type...</option>
                <option value="forceps">Forceps</option>
                <option value="vacuum">Vacuum</option>
              </select>
            </div>

            <!-- Type of C-section - Conditional Field -->
            <div id="preg${pregnancyNum}_csection_type_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Type of C-section *</label>
              <select class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                <option value="">Select type...</option>
                <option value="planned">Planned/Elective</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <!-- Outcome - Conditional Field -->
            <div id="preg${pregnancyNum}_outcome_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Outcome *</label>
              <select 
                id="preg${pregnancyNum}_outcome" 
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onchange="handleOutcomeChange(${pregnancyNum}, this.value)"
              >
                <option value="">Select outcome...</option>
              </select>
            </div>

            <!-- Birth Weight - Only for Live Births at ≥7 months -->
            <div id="preg${pregnancyNum}_birth_weight_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Birth Weight (kg) *</label>
              <input 
                type="number" 
                step="0.1" 
                min="0.5" 
                max="6.0"
                placeholder="e.g., 3.2"
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onchange="handleBirthWeightChange(${pregnancyNum}, this.value)"
              />
              <div id="preg${pregnancyNum}_weight_classification" style="display: none;"></div>
            </div>

            <!-- Place of Delivery - Only for Live Births at ≥7 months -->
            <div id="preg${pregnancyNum}_place_delivery_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Place of Delivery *</label>
              <select 
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onchange="handlePlaceOfDeliveryChange(${pregnancyNum}, this.value)"
              >
                <option value="">Select place...</option>
                <option value="hospital">Hospital</option>
                <option value="health_center">Health Center</option>
                <option value="home">Home</option>
                <option value="traditional_healer">Traditional Healer</option>
                <option value="en_route">En route to facility</option>
                <option value="other">Other (specify)</option>
              </select>
              <div id="preg${pregnancyNum}_delivery_risk" style="display: none;"></div>
            </div>

            <!-- Baby's Current Status - Only for Live Births at ≥7 months -->
            <div id="preg${pregnancyNum}_baby_status_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Baby's Current Status *</label>
              <select 
                class="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onchange="handleBabyStatusChange(${pregnancyNum}, this.value)"
              >
                <option value="">Select status...</option>
                <option value="alive_well">Alive and well</option>
                <option value="alive_complications">Alive with complications</option>
                <option value="deceased">Deceased</option>
                <option value="unknown">Unknown</option>
              </select>
              <div id="preg${pregnancyNum}_status_alert" style="display: none;"></div>
            </div>

            <!-- Clinical Rules Display -->
            <div id="preg${pregnancyNum}_clinical_rules_display" style="display: none;"></div>

            <!-- Sex of Infant - Conditional Field -->
            <div id="preg${pregnancyNum}_sex_infant_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Sex of infant *</label>
              <select class="w-full border rounded p-2">
                <option value="">Select sex...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>
      `;
    };

    (window as any).handleGestationalAgeChange = (pregnancyNum: number, months: string) => {
      const monthsInt = parseInt(months);
      const modeOfDeliveryField = document.getElementById(`preg${pregnancyNum}_mode_delivery_field`);
      const outcomeField = document.getElementById(`preg${pregnancyNum}_outcome_field`);
      const outcomeSelect = document.getElementById(`preg${pregnancyNum}_outcome`) as HTMLSelectElement;
      const birthWeightField = document.getElementById(`preg${pregnancyNum}_birth_weight_field`);
      const placeOfDeliveryField = document.getElementById(`preg${pregnancyNum}_place_delivery_field`);
      const babyStatusField = document.getElementById(`preg${pregnancyNum}_baby_status_field`);
      const clinicalRulesDisplay = document.getElementById(`preg${pregnancyNum}_clinical_rules_display`);
      
      // Clinical Business Rules: Given-When-Then Logic
      // GIVEN: Gestational age is entered
      // WHEN: Different gestational age thresholds are met
      // THEN: Appropriate fields are shown/hidden with relevant options
      
      if (modeOfDeliveryField && outcomeField && outcomeSelect) {
        if (monthsInt < 6) {
          // GIVEN: Gestational age < 6 months
          // WHEN: User enters gestational age below 6 months
          // THEN: Only abortion/miscarriage outcome is available
          modeOfDeliveryField.style.display = 'none';
          outcomeField.style.display = 'block';
          outcomeSelect.innerHTML = '<option value="">Select outcome...</option><option value="abortion">Abortion/Miscarriage</option>';
          
          // Hide birth-related fields for early pregnancy loss
          if (birthWeightField) birthWeightField.style.display = 'none';
          if (placeOfDeliveryField) placeOfDeliveryField.style.display = 'none';
          if (babyStatusField) babyStatusField.style.display = 'none';
          
          if (clinicalRulesDisplay) {
            clinicalRulesDisplay.innerHTML = `
              <div class="text-xs bg-red-50 border border-red-200 rounded p-2 mt-2">
                <strong>Clinical Rule Applied:</strong> Gestational age &lt; 6 months indicates early pregnancy loss. 
                Birth weight, delivery location, and baby status are not applicable.
              </div>
            `;
            clinicalRulesDisplay.style.display = 'block';
          }
          
        } else if (monthsInt >= 7) {
          // GIVEN: Gestational age >= 7 months (viable pregnancy)
          // WHEN: User enters gestational age 7+ months
          // THEN: Mode of delivery and outcome fields are available, birth fields only for live births
          modeOfDeliveryField.style.display = 'block';
          outcomeField.style.display = 'block';
          outcomeSelect.innerHTML = '<option value="">Select outcome...</option><option value="live_birth">Live birth</option><option value="still_birth">Still birth</option>';
          
          // Add onChange handler to outcome select
          outcomeSelect.onchange = () => (window as any).handleOutcomeChange(pregnancyNum, outcomeSelect.value);
          
          // Always hide birth-related fields initially - they only show for live births
          if (birthWeightField) birthWeightField.style.display = 'none';
          if (placeOfDeliveryField) placeOfDeliveryField.style.display = 'none';
          if (babyStatusField) babyStatusField.style.display = 'none';
          
          if (clinicalRulesDisplay) {
            clinicalRulesDisplay.innerHTML = `
              <div class="text-xs bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                <strong>Clinical Rule Applied:</strong> Gestational age ≥ 7 months indicates viable pregnancy. 
                Birth Weight, Place of Delivery, and Baby's Status only display for live birth outcomes.
              </div>
            `;
            clinicalRulesDisplay.style.display = 'block';
          }
          
        } else {
          // GIVEN: Gestational age = 6 months (borderline viability)
          // WHEN: User enters exactly 6 months
          // THEN: Fields are hidden pending further clarification
          modeOfDeliveryField.style.display = 'none';
          outcomeField.style.display = 'none';
          if (birthWeightField) birthWeightField.style.display = 'none';
          if (placeOfDeliveryField) placeOfDeliveryField.style.display = 'none';
          if (babyStatusField) babyStatusField.style.display = 'none';
          
          if (clinicalRulesDisplay) {
            clinicalRulesDisplay.innerHTML = `
              <div class="text-xs bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                <strong>Clinical Rule Applied:</strong> Gestational age = 6 months represents borderline viability. 
                Please verify exact gestational age for appropriate field display.
              </div>
            `;
            clinicalRulesDisplay.style.display = 'block';
          }
        }
      }
    };

    // New function to handle pregnancy outcome changes
    (window as any).handleOutcomeChange = (pregnancyNum: number, outcome: string) => {
      const birthWeightField = document.getElementById(`preg${pregnancyNum}_birth_weight_field`);
      const placeOfDeliveryField = document.getElementById(`preg${pregnancyNum}_place_delivery_field`);
      const babyStatusField = document.getElementById(`preg${pregnancyNum}_baby_status_field`);
      const clinicalRulesDisplay = document.getElementById(`preg${pregnancyNum}_clinical_rules_display`);
      const gestationalAge = parseInt((document.getElementById(`preg${pregnancyNum}_gestational_age`) as HTMLInputElement)?.value || '0');
      
      // Clinical Business Rules: Given-When-Then Logic for Pregnancy Outcomes
      // GIVEN: Pregnancy outcome is selected for viable pregnancy (≥7 months)
      // WHEN: Live birth outcome is chosen
      // THEN: Birth Weight, Place of Delivery, and Baby's Status are displayed
      
      if (gestationalAge >= 7) {
        if (outcome === 'live_birth') {
          // GIVEN: Live birth outcome selected
          // WHEN: Baby was born alive
          // THEN: Birth weight, delivery location, and current status are required
          if (birthWeightField) birthWeightField.style.display = 'block';
          if (placeOfDeliveryField) placeOfDeliveryField.style.display = 'block';
          if (babyStatusField) babyStatusField.style.display = 'block';
          
          if (clinicalRulesDisplay) {
            clinicalRulesDisplay.innerHTML = `
              <div class="text-xs bg-green-50 border border-green-200 rounded p-2 mt-2">
                <strong>Live Birth Outcome:</strong> Birth Weight, Place of Delivery, and Baby's Current Status 
                are now displayed for comprehensive live birth assessment.
              </div>
            `;
          }
          
        } else if (outcome === 'still_birth') {
          // GIVEN: Stillbirth outcome selected
          // WHEN: Baby was born without signs of life
          // THEN: Birth-related fields remain hidden, focus on maternal care
          if (birthWeightField) birthWeightField.style.display = 'none';
          if (placeOfDeliveryField) placeOfDeliveryField.style.display = 'none';
          if (babyStatusField) babyStatusField.style.display = 'none';
          
          if (clinicalRulesDisplay) {
            clinicalRulesDisplay.innerHTML = `
              <div class="text-xs bg-gray-50 border border-gray-300 rounded p-2 mt-2">
                <strong>Stillbirth Outcome:</strong> Birth Weight, Place of Delivery, and Baby's Status 
                are not applicable for stillbirth. Focus on maternal support and bereavement counseling.
                <div class="mt-1 text-xs text-gray-600">
                  • Provide emotional support and counseling<br>
                  • Investigate potential causes<br>
                  • Arrange follow-up care for mother
                </div>
              </div>
            `;
          }
          
        } else {
          // GIVEN: No outcome selected yet
          // WHEN: User hasn't made a selection
          // THEN: Hide birth fields and show guidance
          if (birthWeightField) birthWeightField.style.display = 'none';
          if (placeOfDeliveryField) placeOfDeliveryField.style.display = 'none';
          if (babyStatusField) babyStatusField.style.display = 'none';
          
          if (clinicalRulesDisplay) {
            clinicalRulesDisplay.innerHTML = `
              <div class="text-xs bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                <strong>Clinical Rule:</strong> Birth Weight, Place of Delivery, and Baby's Status only appear for live birth outcomes.
              </div>
            `;
          }
        }
      }
    };

    (window as any).handleModeOfDeliveryChange = (pregnancyNum: number, mode: string) => {
      const labourTypeField = document.getElementById(`preg${pregnancyNum}_labour_type_field`);
      const assistedVaginalField = document.getElementById(`preg${pregnancyNum}_assisted_vaginal_field`);
      const csectionTypeField = document.getElementById(`preg${pregnancyNum}_csection_type_field`);
      
      // Hide all conditional fields first
      if (labourTypeField) labourTypeField.style.display = 'none';
      if (assistedVaginalField) assistedVaginalField.style.display = 'none';
      if (csectionTypeField) csectionTypeField.style.display = 'none';
      
      // Show appropriate fields based on selection
      if (mode === 'normal_vertex' || mode === 'assisted_breech') {
        if (labourTypeField) labourTypeField.style.display = 'block';
      } else if (mode === 'assisted_vaginal') {
        if (assistedVaginalField) assistedVaginalField.style.display = 'block';
      } else if (mode === 'c_section') {
        if (csectionTypeField) csectionTypeField.style.display = 'block';
      }
    };

    (window as any).handleLabourTypeChange = (pregnancyNum: number, labourType: string) => {
      const sexInfantField = document.getElementById(`preg${pregnancyNum}_sex_infant_field`);
      
      if (sexInfantField) {
        if (labourType === 'induced' || labourType === 'spontaneous') {
          sexInfantField.style.display = 'block';
        } else {
          sexInfantField.style.display = 'none';
        }
      }
    };

    // Clinical Business Rules for Birth Weight Classification
    (window as any).handleBirthWeightChange = (pregnancyNum: number, weight: string) => {
      const weightKg = parseFloat(weight);
      const gestationalAge = parseInt((document.getElementById(`preg${pregnancyNum}_gestational_age`) as HTMLInputElement)?.value || '0');
      const outcome = (document.getElementById(`preg${pregnancyNum}_outcome`) as HTMLSelectElement)?.value;
      const weightClassificationDiv = document.getElementById(`preg${pregnancyNum}_weight_classification`);
      
      // GIVEN: Birth weight is entered for live birth outcome in viable pregnancy
      // WHEN: Weight falls into specific ranges
      // THEN: Classification and clinical recommendations are provided
      if (weightClassificationDiv && weightKg > 0 && gestationalAge >= 7 && outcome === 'live_birth') {
        let classification = '';
        let riskLevel = '';
        let color = '';
        let clinicalAction = '';
        
        if (weightKg < 1.5) {
          classification = 'Extremely Low Birth Weight (ELBW)';
          riskLevel = 'Critical Risk - Immediate NICU';
          color = 'text-red-700 bg-red-100';
          clinicalAction = 'Requires immediate specialized neonatal intensive care';
        } else if (weightKg < 2.5) {
          classification = 'Low Birth Weight (LBW)';
          riskLevel = 'High Risk - Enhanced monitoring';
          color = 'text-orange-700 bg-orange-100';
          clinicalAction = 'Requires close monitoring and potential special care';
        } else if (weightKg >= 2.5 && weightKg <= 4.0) {
          classification = 'Normal Birth Weight';
          riskLevel = 'Standard Risk - Routine care';
          color = 'text-green-700 bg-green-100';
          clinicalAction = 'Standard newborn care protocols apply';
        } else if (weightKg > 4.0) {
          classification = 'Macrosomia (Large for Gestational Age)';
          riskLevel = 'Increased Risk - Monitor complications';
          color = 'text-blue-700 bg-blue-100';
          clinicalAction = 'Monitor for birth trauma, hypoglycemia, and feeding difficulties';
        }
        
        weightClassificationDiv.innerHTML = `
          <div class="text-xs ${color} border rounded p-2 mt-1">
            <div class="font-medium">${classification}</div>
            <div class="text-xs mt-1">${riskLevel}</div>
            <div class="text-xs mt-1 italic">${clinicalAction}</div>
          </div>
        `;
        weightClassificationDiv.style.display = 'block';
      } else if (weightClassificationDiv) {
        weightClassificationDiv.style.display = 'none';
      }
    };

    // Clinical Business Rules for Place of Delivery
    (window as any).handlePlaceOfDeliveryChange = (pregnancyNum: number, place: string) => {
      const deliveryRiskDiv = document.getElementById(`preg${pregnancyNum}_delivery_risk`);
      const gestationalAge = parseInt((document.getElementById(`preg${pregnancyNum}_gestational_age`) as HTMLInputElement)?.value || '0');
      const outcome = (document.getElementById(`preg${pregnancyNum}_outcome`) as HTMLSelectElement)?.value;
      
      // GIVEN: Place of delivery is selected for live birth in viable pregnancy
      // WHEN: Different delivery locations are chosen
      // THEN: Risk assessment and recommendations are provided
      if (deliveryRiskDiv && gestationalAge >= 7 && outcome === 'live_birth') {
        let riskAssessment = '';
        let recommendations = '';
        let color = '';
        
        switch (place) {
          case 'hospital':
            riskAssessment = 'Optimal delivery setting';
            recommendations = 'Standard protocols, emergency services available';
            color = 'text-green-700 bg-green-100';
            break;
          case 'health_center':
            riskAssessment = 'Appropriate for low-risk deliveries';
            recommendations = 'Ensure referral protocols in place for complications';
            color = 'text-blue-700 bg-blue-100';
            break;
          case 'home':
            riskAssessment = 'Higher risk - Limited emergency support';
            recommendations = 'Ensure skilled birth attendant, emergency transport plan';
            color = 'text-orange-700 bg-orange-100';
            break;
          case 'traditional_healer':
            riskAssessment = 'High risk - No medical support';
            recommendations = 'Counsel on risks, encourage facility delivery for future pregnancies';
            color = 'text-red-700 bg-red-100';
            break;
          case 'en_route':
            riskAssessment = 'Emergency delivery - Unplanned';
            recommendations = 'Assess for complications, provide immediate postpartum care';
            color = 'text-purple-700 bg-purple-100';
            break;
        }
        
        deliveryRiskDiv.innerHTML = `
          <div class="text-xs ${color} border rounded p-2 mt-1">
            <div class="font-medium">Risk Assessment: ${riskAssessment}</div>
            <div class="text-xs mt-1 italic">${recommendations}</div>
          </div>
        `;
        deliveryRiskDiv.style.display = 'block';
      } else if (deliveryRiskDiv) {
        deliveryRiskDiv.style.display = 'none';
      }
    };

    // Clinical Business Rules for Baby's Current Status
    (window as any).handleBabyStatusChange = (pregnancyNum: number, status: string) => {
      const statusAlertDiv = document.getElementById(`preg${pregnancyNum}_status_alert`);
      const gestationalAge = parseInt((document.getElementById(`preg${pregnancyNum}_gestational_age`) as HTMLInputElement)?.value || '0');
      const outcome = (document.getElementById(`preg${pregnancyNum}_outcome`) as HTMLSelectElement)?.value;
      
      // GIVEN: Baby's current status is selected for live birth
      // WHEN: Different status options are chosen
      // THEN: Appropriate alerts and actions are displayed
      if (statusAlertDiv && gestationalAge >= 7 && outcome === 'live_birth') {
        let alertMessage = '';
        let clinicalAction = '';
        let color = '';
        
        switch (status) {
          case 'alive_well':
            alertMessage = 'Baby is alive and well';
            clinicalAction = 'Continue routine follow-up care, immunization schedule';
            color = 'text-green-700 bg-green-100';
            break;
          case 'alive_complications':
            alertMessage = 'Baby alive with complications';
            clinicalAction = 'Immediate assessment required, consider specialist referral';
            color = 'text-orange-700 bg-orange-100';
            break;
          case 'deceased':
            alertMessage = 'Baby deceased after live birth';
            clinicalAction = 'Bereavement counseling, investigate cause of death, family support';
            color = 'text-red-700 bg-red-100';
            break;
          case 'unknown':
            alertMessage = 'Baby status unknown';
            clinicalAction = 'Urgent follow-up required to determine current status';
            color = 'text-gray-700 bg-gray-100';
            break;
        }
        
        statusAlertDiv.innerHTML = `
          <div class="text-xs ${color} border rounded p-2 mt-1">
            <div class="font-medium">${alertMessage}</div>
            <div class="text-xs mt-1 italic">${clinicalAction}</div>
          </div>
        `;
        statusAlertDiv.style.display = 'block';
      } else if (statusAlertDiv) {
        statusAlertDiv.style.display = 'none';
      }
    };
  }, []);
  
  // Urgent notification modal states
  const [showUrgentNotification, setShowUrgentNotification] = useState(false);
  const [urgentNotificationData, setUrgentNotificationData] = useState<{
    type: 'critical' | 'warning' | 'urgent';
    title: string;
    message: string;
    condition: string;
    recommendations: string[];
    requiresReferral: boolean;
  } | null>(null);

  // Function to trigger urgent notifications
  const showUrgentAlert = (data: {
    type: 'critical' | 'warning' | 'urgent';
    title: string;
    message: string;
    condition: string;
    recommendations: string[];
    requiresReferral: boolean;
  }) => {
    setUrgentNotificationData(data);
    setShowUrgentNotification(true);
  };

  // Process danger signs and trigger appropriate alerts
  const processDangerSigns = (signs: string[]) => {
    if (signs.length === 0) return;

    // Determine the most critical sign and trigger appropriate alert
    const criticalSigns = ["Severe hypertension", "Convulsing", "Unconscious"];
    const urgentSigns = ["Pre-eclampsia symptoms with hypertension", "Severe headache", "Visual disturbance"];
    
    let alertType: 'critical' | 'urgent' | 'warning' = 'warning';
    let title = "Health Alert";
    let message = "Abnormal vital signs detected";
    let recommendations: string[] = [];
    let requiresReferral = false;

    // Check for critical conditions
    if (signs.some(sign => criticalSigns.includes(sign))) {
      alertType = 'critical';
      title = "CRITICAL: Immediate Medical Attention Required";
      message = "Severe conditions detected that require immediate intervention";
      recommendations = [
        "Stop current procedures immediately",
        "Call emergency medical team",
        "Prepare for immediate referral to higher-level facility",
        "Monitor vital signs continuously",
        "Ensure IV access is established",
        "Document all findings thoroughly"
      ];
      requiresReferral = true;
    }
    // Check for urgent conditions
    else if (signs.some(sign => urgentSigns.includes(sign))) {
      alertType = 'urgent';
      title = "URGENT: Pre-eclampsia Risk Detected";
      message = "High-risk pregnancy condition requiring immediate assessment";
      recommendations = [
        "Conduct complete pre-eclampsia assessment",
        "Perform urine dipstick for proteinuria",
        "Check reflexes and assess for clonus",
        "Consider magnesium sulfate if indicated",
        "Prepare for possible referral",
        "Notify senior clinician immediately"
      ];
      requiresReferral = true;
    }
    // Other warning conditions
    else {
      alertType = 'warning';
      title = "Clinical Monitoring Required";
      message = "Vital signs indicate need for enhanced monitoring";
      recommendations = [
        "Increase monitoring frequency",
        "Reassess vital signs in 15-30 minutes",
        "Document findings in clinical notes",
        "Consider additional diagnostic tests",
        "Schedule follow-up assessment"
      ];
      requiresReferral = false;
    }

    showUrgentAlert({
      type: alertType,
      title: title,
      message: message,
      condition: `Detected signs: ${signs.join(', ')}`,
      recommendations: recommendations,
      requiresReferral: requiresReferral
    });
  };

  // Handle urgent notification acknowledgment
  const handleAcknowledgeNotification = () => {
    setShowUrgentNotification(false);
    setUrgentNotificationData(null);
    toast({
      title: "Alert Acknowledged",
      description: "Clinical alert has been acknowledged.",
    });
  };

  // Handle record closure when danger signs lead to referral or facility management
  const handleRecordClosure = (reason: string) => {
    setRecordClosed(true);
    setRecordClosureReason(reason);
    toast({
      title: "Record Closed",
      description: "Antenatal record has been closed due to emergency action.",
      variant: "destructive",
    });
  };

  // Red danger signs that require modal alerts and block navigation
  const redDangerSigns = [
    'Convulsing',
    'Fever', 
    'Severe headache',
    'Visual disturbance',
    'Imminent delivery',
    'Looks very ill',
    'Severe vomiting',
    'Severe abdominal pain',
    'Unconscious'
  ];

  // Handle tab navigation - allow free navigation between sections
  const handleTabNavigation = (targetTab: string) => {
    setActiveTab(targetTab);
  };

  // Handle referral initiation
  const handleInitiateReferral = () => {
    setShowUrgentNotification(false);
    setShowEmergencyReferralDialog(true);
    toast({
      title: "Referral Initiated",
      description: "Emergency referral process has been started.",
    });
  };
  
  // Add useEffect for Client Profile tab conditional logic
  useEffect(() => {
    // Only run when clientProfile tab is active
    if (activeTab === 'clientProfile') {
      // Use setTimeout to ensure DOM elements are available
      setTimeout(() => {
        // LMP known handlers
        const lmpYes = document.getElementById('lmp_yes') as HTMLInputElement;
        const lmpNo = document.getElementById('lmp_no') as HTMLInputElement;
        const lmpDateField = document.getElementById('lmp_date_field');
        const optionLmp = document.getElementById('option_lmp');
        
        if (lmpYes && lmpNo && lmpDateField && optionLmp) {
          lmpYes.addEventListener('change', () => {
            lmpDateField.style.display = 'block';
            optionLmp.style.display = 'block';
          });
          
          lmpNo.addEventListener('change', () => {
            lmpDateField.style.display = 'none';
            optionLmp.style.display = 'none';
          });
        }
        
        // Ultrasound done handlers
        const usYes = document.getElementById('us_yes') as HTMLInputElement;
        const usNo = document.getElementById('us_no') as HTMLInputElement;
        const usDateField = document.getElementById('us_date_field');
        const gaUltrasoundField = document.getElementById('ga_ultrasound_field');
        const optionUltrasound = document.getElementById('option_ultrasound');
        
        if (usYes && usNo && usDateField && gaUltrasoundField && optionUltrasound) {
          usYes.addEventListener('change', () => {
            usDateField.style.display = 'block';
            gaUltrasoundField.style.display = 'block';
            optionUltrasound.style.display = 'block';
          });
          
          usNo.addEventListener('change', () => {
            usDateField.style.display = 'none';
            gaUltrasoundField.style.display = 'none';
            optionUltrasound.style.display = 'none';
          });
        }
        
        // Previous pregnancies handler
        const previousPregnancies = document.getElementById('previous_pregnancies') as HTMLInputElement;
        const pregnancyHistoryContainer = document.getElementById('pregnancy_history_container');
        
        if (previousPregnancies && pregnancyHistoryContainer) {
          previousPregnancies.addEventListener('change', () => {
            if (parseInt(previousPregnancies.value) > 0) {
              pregnancyHistoryContainer.style.display = 'block';
            } else {
              pregnancyHistoryContainer.style.display = 'none';
            }
          });
        }
        
        // Gestational age handlers
        const gaMonths = document.getElementById('ga_months') as HTMLInputElement;
        const modeDeliveryField = document.getElementById('mode_delivery_field');
        const outcomeField = document.getElementById('outcome_field');
        const outcomeOptions = document.querySelectorAll('.outcome-option') as NodeListOf<HTMLOptionElement>;
        
        if (gaMonths && modeDeliveryField && outcomeField) {
          gaMonths.addEventListener('change', () => {
            const months = parseInt(gaMonths.value);
            
            if (months >= 7) {
              modeDeliveryField.style.display = 'block';
              outcomeField.style.display = 'block';
              
              // Show only live birth and still birth options for >= 7 months
              outcomeOptions.forEach(option => {
                if (option.value === 'live' || option.value === 'still') {
                  option.style.display = 'block';
                } else {
                  option.style.display = 'none';
                }
              });
            } else if (months > 0 && months < 7) {
              modeDeliveryField.style.display = 'none';
              outcomeField.style.display = 'block';
              
              // Show only miscarriage/abortion option for < 7 months
              outcomeOptions.forEach(option => {
                if (option.value === 'miscarriage') {
                  option.style.display = 'block';
                } else {
                  option.style.display = 'none';
                }
              });
            } else {
              modeDeliveryField.style.display = 'none';
              outcomeField.style.display = 'none';
            }
          });
        }
        
        // Mode of delivery handlers
        const modeDelivery = document.getElementById('mode_delivery') as HTMLSelectElement;
        const typeLabourField = document.getElementById('type_labour_field');
        const typeAvdField = document.getElementById('type_avd_field');
        const typeCsectionField = document.getElementById('type_csection_field');
        const infantSexField = document.getElementById('infant_sex_field');
        
        if (modeDelivery && typeLabourField && typeAvdField && typeCsectionField && infantSexField) {
          modeDelivery.addEventListener('change', () => {
            // Hide all fields first
            typeLabourField.style.display = 'none';
            typeAvdField.style.display = 'none';
            typeCsectionField.style.display = 'none';
            infantSexField.style.display = 'none';
            
            // Show relevant fields based on selection
            if (modeDelivery.value === 'nvd' || modeDelivery.value === 'abd') {
              typeLabourField.style.display = 'block';
              infantSexField.style.display = 'block';
            } else if (modeDelivery.value === 'avd') {
              typeAvdField.style.display = 'block';
            } else if (modeDelivery.value === 'cs') {
              typeCsectionField.style.display = 'block';
            }
          });
        }
        
        // Complications - other field
        const complOther = document.getElementById('compl_other') as HTMLInputElement;
        const otherComplicationField = document.getElementById('other_complication_field');
        
        if (complOther && otherComplicationField) {
          complOther.addEventListener('change', () => {
            if (complOther.checked) {
              otherComplicationField.style.display = 'block';
            } else {
              otherComplicationField.style.display = 'none';
            }
          });
        }
      }, 100);
    }
  }, [activeTab]);

  // Handle danger sign mode change with sync
  const handleDangerSignModeChange = (mode: 'none' | 'present') => {
    setDangerSignMode(mode);
    if (mode === 'none') {
      setSelectedDangerSigns([]);
      setSharedReferralReasons([]);
      setDangerSignsConfirmed(false);
      setShowEmergencyReferralAuto(false);
      handleNoneDangerSigns();
      
      // Update Latest Encounter data to show no danger signs
      updateLatestEncounterData('dangerSigns', {
        dangerSigns: [],
        dangerSignsPresent: false,
        assessmentDate: new Date().toISOString()
      });
      
      // Clear emergency referral when no danger signs
      setTimeout(() => {
        const emergencyNoRadio = document.getElementById('refNo') as HTMLInputElement;
        if (emergencyNoRadio) {
          emergencyNoRadio.checked = true;
          emergencyNoRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 100);
    } else if (mode === 'present') {
      // If switching to present mode and we have selected danger signs, sync them
      if (selectedDangerSigns.length > 0) {
        setTimeout(() => {
          syncDangerSignsToReferral(selectedDangerSigns);
        }, 100);
      }
    }
  };

  // Handler for saving Client Profile data
  const handleSaveClientProfile = () => {
    // You would collect all form data here
    // For now, just show a toast message
    toast({
      title: "Client Profile Saved",
      description: "Client profile information has been saved successfully.",
    });
  };

  // Handler for saving ANC Visit data (unified for both initial and routine)
  const handleSaveAncVisit = (data: any) => {
    console.log("ANC Visit Data:", data);
    const visitTypeLabel = data.visitInfo?.visitType === "routine" ? "Routine" : "Initial";
    toast({
      title: `${visitTypeLabel} ANC Visit Saved`,
      description: `Contact ${currentContactNumber} examination and clinical recommendations recorded successfully.`,
    });
    setShowInitialVisitDialog(false);
    // Increment contact number for routine visits
    if (data.visitInfo?.visitType === "routine") {
      setCurrentContactNumber(prev => prev + 1);
    }
  };

  const handleSaveVitalSigns = (data: any) => {
    console.log('Saving vital signs data:', data);
    
    // Calculate BMI from height and weight
    let calculatedBmi = null;
    if (data.height && data.weight) {
      const heightInMeters = parseFloat(data.height) / 100;
      const weightInKg = parseFloat(data.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        calculatedBmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      }
    }
    
    // Update Recent Data Summary with vitals using correct field names
    updateRecentDataSummary({
      vitals: {
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseFloat(data.height) : null,
        bmi: calculatedBmi ? parseFloat(calculatedBmi) : null,
        bp: data.systolic_blood_pressure && data.diastolic_blood_pressure 
          ? `${data.systolic_blood_pressure}/${data.diastolic_blood_pressure}` 
          : null,
        temperature: data.temperature ? parseFloat(data.temperature) : null
      }
    });
    
    toast({
      title: "Vital Signs Saved",
      description: "Vital signs and measurements have been recorded successfully.",
    });
  };

  const handleSaveFetalAssessment = (data: any) => {
    console.log('Saving fetal assessment data:', data);
    toast({
      title: "Fetal Assessment Saved",
      description: "Fetal assessment has been recorded successfully.",
    });
  };


  




  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header replicated from PrEP module */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src={Coat_of_arms_of_Zambia_svg} alt="Logo" className="h-9" />
              <h1>
                <span className="text-[#00A651]">Smart</span>
                <span className="text-[#0072BC]">Care</span>
                <span className="text-[#0072BC] font-bold">PRO</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="rounded-full px-3 py-1.5 bg-[#3898EC] text-white flex items-center space-x-1 hover:bg-[#3080D0] border-0"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm">Search Patient</span>
                </Button>
              </div>
              
              <Button variant="outline" className="rounded-full px-3 py-1.5 bg-white text-[#0072BC] flex items-center space-x-1 hover:bg-slate-50 border-[#0072BC]">
                <span className="text-sm">Patient Services</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              <div className="flex items-center px-3 py-1.5 border border-[#0072BC] rounded-full bg-blue-50 cursor-pointer hover:bg-blue-100">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <div className="font-medium text-sm text-[#0072BC]">
                  No Facility Selected
                </div>
                <svg className="h-3 w-3 ml-1 text-[#0072BC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-[#0072BC] p-0.5 text-white hover:bg-[#0060a0]">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full text-center py-1 text-sm font-medium tracking-wider text-[#e31025]" style={{ backgroundColor: "#f2f9ff" }}>
          <span className="text-[#f50541]">Prototype Portal</span>
        </div>
      </header>
      <div className="w-full px-4 py-2 pt-4">
        {/* Page Title with Go Back */}
        <div className="flex items-center justify-center mb-2 relative">
          <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-800 absolute left-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <h1 className="text-xl font-bold text-blue-800">ANC Service Initial Visit</h1>
        </div>
        {/* Patient Info Bar */}
        <div className="rounded-md p-3 mb-4 bg-blue-50 shadow-md border border-blue-100">
        <div className="grid grid-cols-7 gap-4">
          <div className="col-span-1">
            <h2 className="text-blue-700 font-bold text-lg">{patient.name}</h2>
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-500">Date of Birth</p>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <p className="text-sm">{patient.dateOfBirth}</p>
            </div>
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-500">Sex</p>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <p className="text-sm">{patient.sex}</p>
            </div>
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-500">Cellphone</p>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <p className="text-sm">{patient.cellphone}</p>
            </div>
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-500">NHPN</p>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-sm">{patient.nhpn}</p>
            </div>
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-500">NRC</p>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <p className="text-sm">{patient.nrc}</p>
            </div>
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-500">Mother's Name</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p className="text-sm">{patient.mothersName}</p>
              </div>
              <div className="relative" ref={actionsDropdownRef}>
                <Button 
                  onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full px-4 py-2 text-sm flex items-center gap-1"
                >
                  Actions <ChevronDown size={16} className={`transition-transform ${isActionsDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {isActionsDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-t-lg">
                      <h3 className="font-semibold text-sm">Patients Actions</h3>
                    </div>
                    <div className="py-2">
                      <button 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          // TODO: Navigate to POC tests
                          toast({ title: "Have POC", description: "Point of Care tests functionality" });
                        }}
                      >
                        Have POC
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          // TODO: Navigate to prescription dispensation
                          toast({ title: "Prescription Dispensation", description: "Prescription dispensation functionality" });
                        }}
                      >
                        Prescription Dispensation
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          // TODO: Navigate to add encounter
                          toast({ title: "Add Encounter (OPD)", description: "Add OPD encounter functionality" });
                        }}
                      >
                        Add Encounter (OPD)
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          // TODO: Navigate to order tests
                          toast({ title: "Order Tests", description: "Order tests functionality" });
                        }}
                      >
                        Order Tests
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Closure Banner */}
      {recordClosed && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Antenatal Record Closed</h3>
              <p className="text-red-700 text-sm mt-1">{recordClosureReason}</p>
              <p className="text-red-600 text-xs mt-2">
                This record cannot be continued as the patient has been referred or is being managed at the facility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`w-full ${recordClosed ? 'opacity-50 pointer-events-none' : ''}`}>
        <Tabs value={activeTab} onValueChange={handleTabNavigation} className="w-full">
          
          {/* ANC Header Dock - positioned where section headers were */}
          <ANCHeaderDock 
            currentTab={activeTab}
            onTabChange={handleTabNavigation}
          />

          {/* Aligned Three-Column Layout - Completely Flush */}
          <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Left Sidebar - Latest Encounter */}
            <div className="w-full lg:w-80 order-2 lg:order-1 border-r border-gray-200 bg-white">
              <LatestEncounterCard 
                activeSection={activeTab}
                encounterData={latestEncounterData}
              />
            </div>
            
            {/* Main Content - Center */}
            <div className="flex-1 min-w-0 order-1 lg:order-2 border-r border-gray-200 bg-white">

            <TabsContent value="rapidAssessment">
              <AnimatePresence mode="wait">
                <motion.div
                  key="rapidAssessment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <ANCCardWrapper>
                    <div className="p-4 space-y-4">
                {/* Contact Date Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                  <h3 className="font-semibold">Gather Client Details</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                      Edit Record
                    </Button>
                    <Button 
                      className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                      onClick={() => {
                        setShowContactDialog(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      Add Record
                    </Button>

                  </div>
                </div>

                <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                  <DialogContent className="bg-white/98 backdrop-blur-3xl border border-white/20 ring-1 ring-white/40 shadow-2xl rounded-3xl max-w-4xl max-h-[95vh] overflow-y-auto" 
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 10px 25px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                    }}>
                    
                    <DialogTitle>Gather Client Details</DialogTitle>
                    <form id="patient-details-form-data">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Contact Date <span className="text-red-500">*</span></label>
                        <input 
                          type="date" 
                          className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                          id="contact_date"
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            updateLatestEncounterData('clientDetails', {
                              contactDate: e.target.value || 'Not recorded'
                            });
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Reason for Facility Visit <span className="text-red-500">*</span></label>
                        <select 
                          className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                          id="reason_for_visit"
                          required
                          onChange={(e) => {
                            const value = e.target.value;
                            const additionalReasonField = document.getElementById('additional-reason-field');
                            const healthConcernField = document.getElementById('health-concern-field');

                            // Reset visibility
                            if (additionalReasonField) additionalReasonField.style.display = 'none';
                            if (healthConcernField) healthConcernField.style.display = 'none';

                            // Apply business rules
                            if (value === 'specific_complaint') {
                              if (healthConcernField) healthConcernField.style.display = 'block';
                            }
                            if (value === 'additional_contact') {
                              if (additionalReasonField) additionalReasonField.style.display = 'block';
                            }
                          }}
                        >
                          <option value="">Select</option>
                          <option value="first_anc">First antenatal care contact</option>
                          <option value="scheduled_anc">Scheduled antenatal care contact</option>
                          <option value="specific_complaint">Specific complaint</option>
                          <option value="additional_contact">Additional non-scheduled contact</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Safe Motherhood No. field - auto-generated with editable serial number */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Safe Motherhood No. <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            className="flex-1 border-2 border-gray-300 rounded p-2 bg-gray-50 text-black" 
                            value={safeMotherhoodNumber}
                            id="safe_motherhood_no"
                            required
                            readOnly
                            title="Auto-generated Safe Motherhood Number based on facility code"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const newSerial = prompt("Enter serial number (4 digits):", serialNumber);
                              if (newSerial && /^\d{4}$/.test(newSerial)) {
                                setSerialNumber(newSerial);
                              } else if (newSerial) {
                                toast({
                                  title: "Invalid Serial Number",
                                  description: "Serial number must be exactly 4 digits.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Edit Serial
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Format: PP-DD-FF-YYYY-NNNN-SC (Auto-generated from facility code {facilityCode})
                          </p>
                          <p className="text-xs text-blue-600">
                            Serial: {serialNumber} (editable)
                          </p>
                        </div>
                      </div>

                      {/* Woman wants to receive reminders during pregnancy */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Does the client consent to receive SMS reminders during pregnancy?</label>
                        <select 
                          className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                          value={wantsReminders}
                          onChange={(e) => setWantsReminders(e.target.value as "" | "yes" | "no")}
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>

                      {/* Persons the client lives with (co-habitants) */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Person(s) the client lives with (Co-habitants)</label>
                        
                        {/* Multi-select dropdown */}
                        <div className="relative">
                          <select 
                            className="w-full border-2 border-gray-300 rounded p-2 appearance-none bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value && !coHabitants.includes(value)) {
                                if (value === "No one") {
                                  // If "No one" is selected, clear all other selections
                                  setCoHabitants(["No one"]);
                                  setOtherCoHabitant(""); // Clear "Other" text field
                                } else if (!coHabitants.includes("No one")) {
                                  // Only add other options if "No one" is not already selected
                                  setCoHabitants([...coHabitants, value]);
                                }
                              }
                              e.target.value = ""; // Reset dropdown
                            }}
                          >
                            <option value="">Select co-habitants...</option>
                            {["No one", "Parent(s)", "Guardian", "Sibling(s)", "Partner", "Extended Family", "Friends", "Other"]
                              .filter(option => {
                                // Don't show options that are already selected
                                if (coHabitants.includes(option)) return false;
                                // If "No one" is selected, don't show other options
                                if (coHabitants.includes("No one") && option !== "No one") return false;
                                // If other options are selected, don't show "No one"
                                if (coHabitants.length > 0 && !coHabitants.includes("No one") && option === "No one") return false;
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

                        {/* Selected items displayed as tags */}
                        {coHabitants.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {coHabitants.map((item, index) => (
                              <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                <span>{item}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCoHabitants(coHabitants.filter(h => h !== item));
                                    if (item === "Other") {
                                      setOtherCoHabitant("");
                                    }
                                  }}
                                  className="ml-2 text-red-600 hover:text-red-800"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Conditional text box for "Other" */}
                        {coHabitants.includes("Other") && (
                          <div className="mt-3">
                            <input 
                              type="text" 
                              placeholder="Please specify other co-habitants..."
                              value={otherCoHabitant}
                              onChange={(e) => setOtherCoHabitant(e.target.value)}
                              className="w-full border-2 border-gray-300 rounded p-2 text-sm text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Origin field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Origin</label>
                        <select 
                          className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                          value={origin}
                          onChange={(e) => {
                            setOrigin(e.target.value);
                            updateLatestEncounterData('clientDetails', {
                              origin: e.target.value || 'Not specified'
                            });
                          }}
                        >
                          <option value="">Select origin...</option>
                          <option value="From within 5 KM, within catchment area">From within 5 KM, within catchment area</option>
                          <option value="From more than 5 KM, within catchment area">From more than 5 KM, within catchment area</option>
                          <option value="From within district but outside catchment area">From within district but outside catchment area</option>
                          <option value="From outside district">From outside district</option>
                          <option value="From outside province">From outside province</option>
                          <option value="From outside Zambia">From outside Zambia</option>
                          <option value="Unknown">Unknown</option>
                        </select>
                      </div>

                      {/* Came as a couple field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Came as a Couple? <span className="text-red-500">*</span></label>
                        <select 
                          className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                          value={cameAsCouple}
                          onChange={(e) => {
                            setCameAsCouple(e.target.value as "" | "yes" | "no");
                            updateLatestEncounterData('clientDetails', {
                              cameAsCouple: e.target.value === "yes"
                            });
                          }}
                          required
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>

                      {/* Patient Relationship Manager - Enhanced relationship binding system */}
                      <div className="col-span-2">
                        <PatientRelationshipManager 
                          patientId={patient.id}
                          patientName={patient.name}
                          cameAsCouple={cameAsCouple}
                          moduleContext="anc"
                          patientGender={patient.sex}
                        />
                      </div>

                      {/* Reason for additional contact - conditionally shown */}
                      <div id="additional-reason-field" className="space-y-2 col-span-2" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Reason for additional contact (specify)</label>
                        <input type="text" className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
                        onClick={() => setShowContactDialog(false)}
                      >
                        Close
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                        onClick={(e) => {
                          e.preventDefault();
                          const form = document.getElementById('patient-details-form-data') as HTMLFormElement;
                          if (form.checkValidity()) {
                            // Save logic here
                            toast({
                              title: "Client Details Saved",
                              description: "Client details have been recorded successfully.",
                            });
                          } else {
                            form.reportValidity();
                          }
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Danger Signs & Health Concerns Section */}
              <div className="mb-4">
                {/* Sync Notification */}
                {syncNotification && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                    ✓ {syncNotification}
                  </div>
                )}
                
                <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                  <h3 className="font-semibold">Danger Signs & Health Concerns</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                      Edit Record
                    </Button>
                    <Button 
                      className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                      onClick={() => {
                        setSelectedDangerSigns([]);
                        setShowDangerSignsDialog(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      Add Record
                    </Button>
                  </div>
                </div>

                <Dialog open={showDangerSignsDialog} onOpenChange={setShowDangerSignsDialog}>
                  <DialogContent className="bg-white/95 backdrop-blur-2xl border border-gray-200/50 ring-1 ring-white/30 rounded-2xl font-sans max-w-4xl tooltip-parent" style={{ boxShadow: '0 4px 9px hsla(223.58deg, 50.96%, 59.22%, 0.65)', overflow: 'visible' }}>
                    <DialogTitle className="text-lg font-semibold text-gray-800 mb-3">Danger Signs & Health Concerns</DialogTitle>
                    <form id="danger-signs-form-data">
                      <div className="space-y-4">
                        <div>
                        <label className="block text-sm font-medium mb-3">Danger Signs Assessment</label>
                        
                        {/* Primary Danger Signs Selection */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="danger_mode_none" 
                              name="danger_sign_mode"
                              value="none"
                              checked={dangerSignMode === 'none'}
                              onChange={(e) => handleDangerSignModeChange(e.target.value as 'none' | 'present')}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <label htmlFor="danger_mode_none" className="text-sm font-medium text-[#120f0f]">None - No danger signs present</label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="danger_mode_present" 
                              name="danger_sign_mode"
                              value="present"
                              checked={dangerSignMode === 'present'}
                              onChange={(e) => handleDangerSignModeChange(e.target.value as 'none' | 'present')}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <label htmlFor="danger_mode_present" className="text-sm font-medium text-red-700">Danger signs present</label>
                          </div>
                        </div>

                        {/* Detailed Danger Signs (only shown when "present" is selected) */}
                        {dangerSignMode === 'present' && (
                          <div className="mt-2 p-3 border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-800 text-base">Select specific danger signs:</h4>
                              {selectedDangerSigns.length > 0 && (
                                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {selectedDangerSigns.length} danger sign{selectedDangerSigns.length > 1 ? 's' : ''} selected
                                </span>
                              )}
                            </div>
                            
                            {/* Bleeding and Delivery Issues */}
                            <div className="mb-2 p-2 rounded-lg bg-white/30 backdrop-blur-sm transition-all duration-200 hover:bg-white/40" style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.2)' }}>
                              <h5 className="text-xs font-semibold text-gray-800 mb-1.5 pb-0.5 border-b border-gray-200/50">Bleeding & Delivery</h5>
                              <div className="grid grid-cols-3 gap-1.5">
                                <DangerSignWithTooltip
                                  id="danger_bleeding"
                                  name="danger_sign_bleeding"
                                  value="Vaginal bleeding"
                                  checked={selectedDangerSigns.includes('Vaginal bleeding')}
                                  onChange={handleDangerSignsChange}
                                  label="Vaginal bleeding"
                                  description={enhancedDangerSignDescriptions['Vaginal bleeding']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_draining"
                                  name="danger_sign_draining"
                                  value="Draining"
                                  checked={selectedDangerSigns.includes('Draining')}
                                  onChange={handleDangerSignsChange}
                                  label="Draining"
                                  description={enhancedDangerSignDescriptions['Draining']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_imminent_delivery"
                                  name="danger_sign_imminent_delivery"
                                  value="Imminent delivery"
                                  checked={selectedDangerSigns.includes('Imminent delivery')}
                                  onChange={handleDangerSignsChange}
                                  label="Imminent delivery"
                                  description={enhancedDangerSignDescriptions['Imminent delivery']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_labour"
                                  name="danger_sign_labour"
                                  value="Labour"
                                  checked={selectedDangerSigns.includes('Labour')}
                                  onChange={handleDangerSignsChange}
                                  label="Labour"
                                  description={enhancedDangerSignDescriptions['Labour']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                              </div>
                            </div>

                            {/* Neurological Signs */}
                            <div className="mb-2 p-2 rounded-lg bg-white/30 backdrop-blur-sm transition-all duration-200 hover:bg-white/40" style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.2)' }}>
                              <h5 className="text-xs font-semibold text-gray-800 mb-1.5 pb-0.5 border-b border-gray-200/50">Neurological</h5>
                              <div className="grid grid-cols-3 gap-1.5">
                                <DangerSignWithTooltip
                                  id="danger_convulsions"
                                  name="danger_sign_convulsions"
                                  value="Convulsing"
                                  checked={selectedDangerSigns.includes('Convulsing')}
                                  onChange={handleDangerSignsChange}
                                  label="Convulsing"
                                  description={enhancedDangerSignDescriptions['Convulsing']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="severe_headache"
                                  name="danger_sign_severe_headache"
                                  value="Severe headache"
                                  checked={selectedDangerSigns.includes('Severe headache')}
                                  onChange={handleDangerSignsChange}
                                  label="Severe headache"
                                  description={enhancedDangerSignDescriptions['Severe headache']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="visual_disturbance"
                                  name="danger_sign_visual_disturbance"
                                  value="Visual disturbance"
                                  checked={selectedDangerSigns.includes('Visual disturbance')}
                                  onChange={handleDangerSignsChange}
                                  label="Visual disturbance"
                                  description={enhancedDangerSignDescriptions['Visual disturbance']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_unconscious"
                                  name="danger_sign_unconscious"
                                  value="Unconscious"
                                  checked={selectedDangerSigns.includes('Unconscious')}
                                  onChange={handleDangerSignsChange}
                                  label="Unconscious"
                                  description={enhancedDangerSignDescriptions['Unconscious']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                              </div>
                            </div>

                            {/* Systemic Signs */}
                            <div className="mb-2 p-2 rounded-lg bg-white/30 backdrop-blur-sm transition-all duration-200 hover:bg-white/40" style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.2)' }}>
                              <h5 className="text-xs font-semibold text-gray-800 mb-1.5 pb-0.5 border-b border-gray-200/50">Systemic</h5>
                              <div className="grid grid-cols-3 gap-1.5">
                                <DangerSignWithTooltip
                                  id="fever"
                                  name="danger_sign_fever"
                                  value="Fever"
                                  checked={selectedDangerSigns.includes('Fever')}
                                  onChange={handleDangerSignsChange}
                                  label="Fever"
                                  description={enhancedDangerSignDescriptions['Fever']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_looks_very_ill"
                                  name="danger_sign_looks_very_ill"
                                  value="Looks very ill"
                                  checked={selectedDangerSigns.includes('Looks very ill')}
                                  onChange={handleDangerSignsChange}
                                  label="Looks very ill"
                                  description={enhancedDangerSignDescriptions['Looks very ill']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_severe_vomiting"
                                  name="danger_sign_severe_vomiting"
                                  value="Severe vomiting"
                                  checked={selectedDangerSigns.includes('Severe vomiting')}
                                  onChange={handleDangerSignsChange}
                                  label="Severe vomiting"
                                  description={enhancedDangerSignDescriptions['Severe vomiting']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_severe_abdominal_pain"
                                  name="danger_sign_severe_abdominal_pain"
                                  value="Severe abdominal pain"
                                  checked={selectedDangerSigns.includes('Severe abdominal pain')}
                                  onChange={handleDangerSignsChange}
                                  label="Severe abdominal pain"
                                  description={enhancedDangerSignDescriptions['Severe abdominal pain']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                                <DangerSignWithTooltip
                                  id="danger_other"
                                  name="danger_sign_other"
                                  value="Other"
                                  checked={selectedDangerSigns.includes('Other')}
                                  onChange={handleDangerSignsChange}
                                  label="Other"
                                  description={enhancedDangerSignDescriptions['Other']}
                                  onInfoClick={handleDangerSignInfoClick}
                                />
                              </div>
                            </div>
                            
                            {/* Confirmation Button */}
                            {selectedDangerSigns.length > 0 && !dangerSignsConfirmed && (
                              <div className="mt-3 flex justify-center">
                                <Button 
                                  onClick={handleDangerSignConfirmation}
                                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                                >
                                  Confirm Selection ({selectedDangerSigns.length} danger sign{selectedDangerSigns.length > 1 ? 's' : ''})
                                </Button>
                              </div>
                            )}
                            
                            {/* Confirmation Status */}
                            {dangerSignsConfirmed && selectedDangerSigns.length > 0 && (
                              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-sm text-green-800 font-medium">
                                    Danger signs confirmed: {selectedDangerSigns.join(', ')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        </div>
                      </div>



                      {/* Decision Support Alert - Only trigger after confirmation */}
                      {dangerSignMode === 'present' && selectedDangerSigns.length > 0 && dangerSignsConfirmed && (
                        <AncDecisionSupportAlert 
                          dangerSigns={selectedDangerSigns} 
                          onRecordClosure={handleRecordClosure}
                          onDangerSignsAcknowledged={handleDangerSignsAcknowledgement}
                        />
                      )}

                      <div id="health-concern-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium mb-2">Health Concern(s)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="abnormal_discharge" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="abnormal_discharge" className="text-sm">Abnormal vaginal discharge</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="constipation" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="constipation" className="text-sm">Constipation</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="cough" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="cough" className="text-sm">Cough</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="diarrhoea" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="diarrhoea" className="text-sm">Diarrhoea</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="dizziness" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="dizziness" className="text-sm">Dizziness</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="no_fetal_movement" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="no_fetal_movement" className="text-sm">No fetal movement</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="reduced_fetal_movement" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="reduced_fetal_movement" className="text-sm">Reduced fetal movement</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="fever_concern" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="fever_concern" className="text-sm">Fever</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="flu_symptoms" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="flu_symptoms" className="text-sm">Flu symptoms</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="fluid_loss" className="rounded border-gray-300 text-blue-600" />
                            <label htmlFor="fluid_loss" className="text-sm">Fluid loss (draining)</label>
                          </div>
                        </div>
                      </div>
                    </form>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
                        onClick={() => setShowDangerSignsDialog(false)}
                      >
                        Close
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                        onClick={(e) => {
                          e.preventDefault();
                          
                          // Check if "None" is selected (indicates safe to continue)
                          const isDangerSignsNone = dangerSignMode === 'none';
                          
                          if (isDangerSignsNone) {
                            // Green toaster for safe to continue
                            toast({
                              title: "✓ Safe to Continue",
                              description: "No danger signs detected. Proceed with routine ANC care.",
                              variant: "success",
                            });
                          } else {
                            // Regular toaster for when danger signs are present
                            toast({
                              title: "Danger Signs Recorded",
                              description: "Danger signs have been documented. Please follow appropriate protocols.",
                            });
                          }
                          
                          setShowDangerSignsDialog(false);
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>



              {/* Emergency Referral Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                  <h3 className="font-semibold">Emergency Referral</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                      Edit Record
                    </Button>
                    <Button 
                      id="emergency-referral-add-button"
                      className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                      onClick={() => {
                        setShowEmergencyReferralDialog(true);
                        
                        // Enhanced Emergency Detection Logic
                        setTimeout(() => {
                          // Get current clinical values for emergency screening
                          const systolicBP = parseInt((document.getElementById('systolic_bp_exam') as HTMLInputElement)?.value || '0');
                          const diastolicBP = parseInt((document.getElementById('diastolic_bp_exam') as HTMLInputElement)?.value || '0');
                          const hemoglobin = parseFloat((document.getElementById('hemoglobin') as HTMLInputElement)?.value || '0');
                          const temperature = parseFloat((document.getElementById('temperature') as HTMLInputElement)?.value || '0');
                          const gravida = parseInt((document.getElementById('gravida_display') as HTMLElement)?.textContent || '0');
                          const gestationalAge = parseInt((document.getElementById('gestational_age_display') as HTMLElement)?.textContent || '0');
                          
                          // Auto-detected emergency conditions
                          const emergencyConditions: string[] = [];
                          const autoSelectedReasons: string[] = [];
                          
                          // Severe Preeclampsia/Eclampsia Detection (MOH Guidelines)
                          if ((systolicBP >= 160 || diastolicBP >= 110) && gestationalAge >= 20) {
                            emergencyConditions.push('Severe Preeclampsia - Immediate referral required');
                            autoSelectedReasons.push('severe_headache_bp');
                          }
                          
                          // Severe Anemia Detection (<8 g/dL)
                          if (hemoglobin > 0 && hemoglobin < 8.0) {
                            emergencyConditions.push('Severe Anemia (<8 g/dL) - Referral to 2nd level required');
                            autoSelectedReasons.push('looks_very_ill');
                          }
                          
                          // High Fever with Systemic Illness
                          if (temperature >= 38.5) {
                            emergencyConditions.push('High Fever - Infectious disease management needed');
                            autoSelectedReasons.push('high_fever');
                          }
                          
                          // Grand Multiparity Risk Assessment
                          if (gravida >= 5) {
                            emergencyConditions.push('Grand Multiparity - Routine referral recommended');
                            autoSelectedReasons.push('pre_existing');
                          }
                          
                          // Multiple Pregnancy Detection (if IUGR flagged)
                          const iugrDetected = selectedDangerSigns.some(sign => 
                            sign.toLowerCase().includes('growth') || sign.toLowerCase().includes('iugr')
                          );
                          if (iugrDetected && gestationalAge >= 34) {
                            emergencyConditions.push('Multiple Pregnancy + IUGR - Referral ≥34 weeks required');
                            autoSelectedReasons.push('imminent_delivery');
                          }

                          // Display emergency conditions alert if any detected
                          if (emergencyConditions.length > 0) {
                            const alertDiv = document.getElementById('emergency-conditions-alert');
                            if (alertDiv) {
                              alertDiv.innerHTML = `
                                <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                  <h4 class="text-red-800 font-medium mb-2">⚠️ Emergency Conditions Detected</h4>
                                  <ul class="text-sm text-red-700 space-y-1">
                                    ${emergencyConditions.map(condition => `<li>• ${condition}</li>`).join('')}
                                  </ul>
                                </div>
                              `;
                              alertDiv.style.display = 'block';
                            }
                          }
                          
                          // Auto-populate referral reasons based on danger signs and emergency conditions
                          const dangerSignMapping: { [key: string]: string } = {
                            'Convulsions': 'convulsions',
                            'Severe vaginal bleeding': 'severe_bleeding',
                            'Severe headache': 'severe_headache_bp',
                            'Visual disturbance': 'severe_headache_bp',
                            'Unconscious': 'unconscious',
                            'Imminent delivery': 'imminent_delivery',
                            'Severe abdominal pain': 'severe_abdominal_pain',
                            'High fever': 'high_fever',
                            'Severe vomiting': 'severe_vomiting',
                            'Labour complications': 'labour_complications',
                            'Looks very ill': 'looks_very_ill'
                          };

                          // Auto-check checkboxes for detected danger signs
                          selectedDangerSigns.forEach((dangerSign: string) => {
                            const checkboxValue = dangerSignMapping[dangerSign];
                            if (checkboxValue) {
                              autoSelectedReasons.push(checkboxValue);
                            }
                          });

                          // Remove duplicates and apply selections
                          const uniqueReasons = [...new Set(autoSelectedReasons)];
                          uniqueReasons.forEach(reason => {
                            const checkbox = document.querySelector(`input[name="referral_reasons"][value="${reason}"]`) as HTMLInputElement;
                            if (checkbox) {
                              checkbox.checked = true;
                              checkbox.dispatchEvent(new Event('change'));
                            }
                          });
                          
                          // Set referral urgency indicator
                          const urgencyField = document.getElementById('referral-urgency-indicator');
                          if (urgencyField && emergencyConditions.length > 0) {
                            urgencyField.innerHTML = `
                              <div class="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium">
                                🚨 EMERGENCY REFERRAL - Immediate transfer required
                              </div>
                            `;
                            urgencyField.style.display = 'block';
                          }
                        }, 100);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      Add Record
                    </Button>
                  </div>
                </div>

                <Dialog open={showEmergencyReferralDialog} onOpenChange={setShowEmergencyReferralDialog}>
                  <DialogContent className="bg-white/85 backdrop-blur-2xl border border-white/30 ring-1 ring-white/20 shadow-xl rounded-2xl max-w-3xl max-h-[85vh] overflow-y-auto" 
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.80) 100%)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.08)'
                    }}>
                    <DialogTitle>Emergency Referral</DialogTitle>
                    
                    
                    {/* Emergency Conditions Alert */}
                    <div id="emergency-conditions-alert" style={{ display: 'none' }}></div>
                    
                    {/* Referral Urgency Indicator */}
                    <div id="referral-urgency-indicator" style={{ display: 'none' }}></div>
                    
                    <form id="emergency-referral-form-data">
                    
                    {/* Intelligent Checklist Relevance System */}
                    <script>
                      {`
                        window.updateChecklistRelevance = function() {
                          const selectedReasons = Array.from(document.querySelectorAll('input[name="referral_reasons"]:checked')).map(cb => cb.value);
                          
                          // Define checklist section requirements based on emergency conditions
                          const checklistRequirements = {
                            // Critical conditions requiring ALL sections
                            'convulsions': ['communication', 'procedures', 'medications', 'vitals', 'special', 'final'],
                            'severe_bleeding': ['communication', 'procedures', 'medications', 'vitals', 'special', 'final'],
                            'unconscious': ['communication', 'procedures', 'medications', 'vitals', 'special', 'final'],
                            'severe_headache_bp': ['communication', 'procedures', 'medications', 'vitals', 'final'],
                            
                            // Moderate conditions requiring selected sections
                            'high_fever': ['communication', 'procedures', 'medications', 'vitals', 'final'],
                            'severe_anemia': ['communication', 'procedures', 'medications', 'vitals', 'final'],
                            'prolonged_labor': ['communication', 'procedures', 'vitals', 'special', 'final'],
                            'fetal_distress': ['communication', 'procedures', 'vitals', 'final'],
                            
                            // Less critical conditions requiring basic sections
                            'grand_multiparity': ['communication', 'procedures', 'vitals', 'final'],
                            'other': ['communication', 'final']
                          };
                          
                          // Determine required sections based on selected reasons
                          let requiredSections = new Set();
                          selectedReasons.forEach(reason => {
                            if (checklistRequirements[reason]) {
                              checklistRequirements[reason].forEach(section => requiredSections.add(section));
                            }
                          });
                          
                          // Update checklist section visibility and styling
                          const sections = {
                            'communication': 'border-green-500',
                            'procedures': 'border-orange-500', 
                            'medications': 'border-purple-500',
                            'vitals': 'border-red-500',
                            'special': 'border-yellow-500',
                            'final': 'border-blue-500'
                          };
                          
                          Object.entries(sections).forEach(([sectionKey, borderClass]) => {
                            const section = document.querySelector('.' + borderClass);
                            if (section) {
                              const isRequired = requiredSections.has(sectionKey);
                              const header = section.querySelector('h4');
                              
                              if (isRequired) {
                                // Show and highlight required sections
                                section.style.opacity = '1';
                                section.style.borderWidth = '2px';
                                section.style.borderStyle = 'solid';
                                if (header && !header.innerHTML.includes('*REQUIRED*')) {
                                  header.innerHTML += ' <span style="color: red; font-weight: bold;">*REQUIRED*</span>';
                                }
                              } else {
                                // Dim optional sections
                                section.style.opacity = '0.6';
                                section.style.borderWidth = '1px';
                                section.style.borderStyle = 'dashed';
                                section.style.borderColor = '#ccc';
                                if (header) {
                                  header.innerHTML = header.innerHTML.replace(/ <span style="color: red; font-weight: bold;">\*REQUIRED\*<\/span>/g, '');
                                  if (!header.innerHTML.includes('(Optional)')) {
                                    header.innerHTML += ' <span style="color: gray; font-size: 0.75rem;">(Optional)</span>';
                                  }
                                }
                              }
                            }
                          });
                          
                          // Update progress calculation based on required sections only
                          const updateProgress = () => {
                            let completed = 0;
                            let totalRequired = 0;
                            
                            // Count only required checklist items
                            const allCheckboxes = document.querySelectorAll('input[name="maternal_checklist"]');
                            allCheckboxes.forEach(checkbox => {
                              const section = checkbox.closest('.bg-white.rounded.p-3');
                              if (section && section.style.opacity === '1') {
                                totalRequired++;
                                if (checkbox.checked) completed++;
                              }
                            });
                            
                            // Count required vital signs
                            const vitalInputs = document.querySelectorAll('input[name="checklist_bp"], input[name="checklist_pulse"], input[name="checklist_temp"], input[name="checklist_rr"]');
                            if (requiredSections.has('vitals')) {
                              totalRequired += vitalInputs.length;
                              vitalInputs.forEach(input => {
                                if (input.value) completed++;
                              });
                            }
                            
                            // Count clotting test if procedures required
                            const clottingTest = document.querySelector('select[name="clotting_test_result"]');
                            if (requiredSections.has('procedures') && clottingTest) {
                              totalRequired++;
                              if (clottingTest.value) completed++;
                            }
                            
                            // Update progress display
                            const progressText = document.getElementById('checklist-progress');
                            const progressBar = document.getElementById('checklist-progress-bar');
                            
                            if (progressText) {
                              progressText.textContent = totalRequired > 0 
                                ? \`\${completed}/\${totalRequired} required items completed\`
                                : 'No emergency conditions selected - checklist optional';
                            }
                            
                            if (progressBar && totalRequired > 0) {
                              const percentage = (completed / totalRequired) * 100;
                              progressBar.style.width = \`\${percentage}%\`;
                              
                              if (percentage === 100) {
                                progressBar.className = 'bg-green-600 h-2 rounded-full transition-all duration-300';
                              } else if (percentage >= 75) {
                                progressBar.className = 'bg-yellow-500 h-2 rounded-full transition-all duration-300';
                              } else {
                                progressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
                              }
                            }
                          };
                          
                          // Store required sections globally for validation
                          window.currentRequiredSections = requiredSections;
                          
                          // Display relevance summary
                          const checklistDiv = document.getElementById('maternal-emergency-checklist');
                          if (checklistDiv) {
                            let summaryDiv = document.getElementById('checklist-relevance-summary');
                            if (!summaryDiv) {
                              summaryDiv = document.createElement('div');
                              summaryDiv.id = 'checklist-relevance-summary';
                              summaryDiv.className = 'mb-3 p-3 bg-blue-100 border border-blue-300 rounded text-sm';
                              checklistDiv.querySelector('.border.rounded-lg').insertBefore(summaryDiv, checklistDiv.querySelector('.flex.items-center.justify-between'));
                            }
                            
                            if (selectedReasons.length === 0) {
                              summaryDiv.innerHTML = '<strong>No emergency conditions selected:</strong> Checklist is optional for routine referrals.';
                            } else {
                              const sectionNames = {
                                'communication': 'Communication & Coordination',
                                'procedures': 'Pre-Referral Procedures', 
                                'medications': 'IV Fluids & Medications',
                                'vitals': 'Vital Signs Monitoring',
                                'special': 'Special Procedures',
                                'final': 'Final Steps'
                              };
                              
                              const requiredList = Array.from(requiredSections).map(s => sectionNames[s]).join(', ');
                              summaryDiv.innerHTML = \`<strong>Based on selected emergency conditions:</strong> Required sections - \${requiredList}\`;
                            }
                          }
                          
                          // Update progress after visibility changes
                          setTimeout(updateProgress, 100);
                        };
                      `}
                    </script>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2" id="emergency-referral-field">
                        <label className="block text-sm font-medium">Emergency Referral</label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="refYes" 
                              name="emergency_referral" 
                              value="yes"
                              className="border-gray-300 text-blue-600"
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const reasonsField = document.getElementById('reasons-for-referral-field');
                                const treatmentField = document.getElementById('treatment-before-referral-field');
                                const facilityField = document.getElementById('receiving-facility-field');
                                const providerNameField = document.getElementById('provider-name-field-referral');
                                const providerPhoneField = document.getElementById('provider-phone-field');
                                const referralDateField = document.getElementById('referral-date-field');
                                const referralNotesField = document.getElementById('referral-notes-field');
                                const checklistField = document.getElementById('maternal-emergency-checklist');

                                if (reasonsField) reasonsField.style.display = isChecked ? 'block' : 'none';
                                if (treatmentField) treatmentField.style.display = isChecked ? 'block' : 'none';
                                if (facilityField) facilityField.style.display = isChecked ? 'block' : 'none';
                                if (providerNameField) providerNameField.style.display = isChecked ? 'block' : 'none';
                                if (providerPhoneField) providerPhoneField.style.display = isChecked ? 'block' : 'none';
                                if (referralDateField) referralDateField.style.display = isChecked ? 'block' : 'none';
                                if (referralNotesField) referralNotesField.style.display = isChecked ? 'block' : 'none';
                                if (checklistField) checklistField.style.display = isChecked ? 'block' : 'none';
                                
                                // Update Latest Encounter data
                                if (isChecked) {
                                  updateLatestEncounterData('emergencyReferral', {
                                    emergencyReferral: true,
                                    checklistCompleted: false,
                                    feedbackReceived: false
                                  });
                                }

                                // Initialize checklist progress tracking when shown
                                if (isChecked && checklistField) {
                                  // Initialize and trigger checklist relevance analysis
                                  setTimeout(() => {
                                    updateChecklistRelevance();
                                  }, 100);
                                  
                                  setTimeout(() => {
                                    const initializeChecklistTracking = () => {
                                      const checkboxes = document.querySelectorAll('input[name="maternal_checklist"]');
                                      const selectInputs = document.querySelectorAll('select[name="clotting_test_result"]');
                                      const textInputs = document.querySelectorAll('input[name="checklist_bp"], input[name="checklist_pulse"], input[name="checklist_temp"], input[name="checklist_rr"], input[name="blood_loss_ml"]');
                                      
                                      const updateProgress = () => {
                                        let completed = 0;
                                        const total = 22;
                                        
                                        // Check checkboxes
                                        checkboxes.forEach((checkbox: any) => {
                                          const statusElement = document.getElementById(checkbox.value + '_status');
                                          if (checkbox.checked) {
                                            completed++;
                                            if (statusElement) statusElement.innerHTML = '✅';
                                          } else {
                                            if (statusElement) statusElement.innerHTML = '❌';
                                          }
                                        });
                                        
                                        // Check select inputs
                                        selectInputs.forEach((select: any) => {
                                          const statusElement = document.getElementById('clotting_test_status');
                                          if (select.value) {
                                            completed++;
                                            if (statusElement) statusElement.innerHTML = '✅';
                                          } else {
                                            if (statusElement) statusElement.innerHTML = '❌';
                                          }
                                        });
                                        
                                        // Check vital signs inputs
                                        const vitalSignsCompleted = Array.from(textInputs).filter((input: any) => input.value).length;
                                        completed += vitalSignsCompleted;
                                        
                                        textInputs.forEach((input: any) => {
                                          const statusElement = document.getElementById(input.name + '_status');
                                          if (input.value) {
                                            if (statusElement) statusElement.innerHTML = '✅';
                                          } else {
                                            if (statusElement) statusElement.innerHTML = '❌';
                                          }
                                        });
                                        
                                        // Update progress display
                                        const progressText = document.getElementById('checklist-progress');
                                        const progressBar = document.getElementById('checklist-progress-bar');
                                        
                                        if (progressText) {
                                          progressText.textContent = `${completed}/${total} items completed`;
                                        }
                                        
                                        if (progressBar) {
                                          const percentage = (completed / total) * 100;
                                          progressBar.style.width = `${percentage}%`;
                                          
                                          if (percentage === 100) {
                                            progressBar.className = 'bg-green-600 h-2 rounded-full transition-all duration-300';
                                          } else if (percentage >= 75) {
                                            progressBar.className = 'bg-yellow-500 h-2 rounded-full transition-all duration-300';
                                          } else {
                                            progressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
                                          }
                                        }
                                      };
                                      
                                      // Add event listeners
                                      checkboxes.forEach(checkbox => {
                                        checkbox.addEventListener('change', updateProgress);
                                      });
                                      
                                      selectInputs.forEach(select => {
                                        select.addEventListener('change', updateProgress);
                                      });
                                      
                                      textInputs.forEach(input => {
                                        input.addEventListener('input', updateProgress);
                                      });
                                      
                                      // Initial update
                                      updateProgress();
                                    };
                                    
                                    initializeChecklistTracking();
                                  }, 200);
                                }
                              }}
                            />
                            <label htmlFor="refYes" className="text-sm">Yes</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="refNo" 
                              name="emergency_referral" 
                              value="no"
                              className="border-gray-300 text-blue-600"
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const reasonsField = document.getElementById('reasons-for-referral-field');
                                const treatmentField = document.getElementById('treatment-before-referral-field');
                                const facilityField = document.getElementById('receiving-facility-field');
                                const providerNameField = document.getElementById('provider-name-field-referral');
                                const providerPhoneField = document.getElementById('provider-phone-field');
                                const referralDateField = document.getElementById('referral-date-field');
                                const referralNotesField = document.getElementById('referral-notes-field');

                                if (reasonsField) reasonsField.style.display = 'none';
                                if (treatmentField) treatmentField.style.display = 'none';
                                if (facilityField) facilityField.style.display = 'none';
                                if (providerNameField) providerNameField.style.display = 'none';
                                if (providerPhoneField) providerPhoneField.style.display = 'none';
                                if (referralDateField) referralDateField.style.display = 'none';
                                if (referralNotesField) referralNotesField.style.display = 'none';
                                
                                // Update Latest Encounter data
                                if (isChecked) {
                                  updateLatestEncounterData('emergencyReferral', {
                                    emergencyReferral: false,
                                    checklistCompleted: false,
                                    feedbackReceived: false
                                  });
                                }
                              }}
                            />
                            <label htmlFor="refNo" className="text-sm">No</label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 col-span-2" id="reasons-for-referral-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Reasons for referral <span className="text-red-500">*</span></label>
                        <div className="border rounded-lg p-4 bg-gray-50 max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-1 gap-2">
                            {/* Danger Sign Based Reasons */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">Emergency/Danger Sign Based</h4>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="convulsions"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Convulsions/Seizures - Immediate transfer required</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="severe_bleeding"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Severe vaginal bleeding - Emergency obstetric care</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="severe_headache_bp"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Severe headache with visual disturbance - Suspected preeclampsia</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="unconscious"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Unconscious patient - Critical care needed</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="imminent_delivery"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Imminent delivery - Delivery complications expected</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="severe_abdominal_pain"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Severe abdominal pain - Surgical evaluation required</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="high_fever"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">High fever with systemic illness - Infectious disease management</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="severe_vomiting"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Severe vomiting with dehydration - IV fluid management</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="labour_complications"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Labour complications - Obstetric intervention needed</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="looks_very_ill"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Patient appears critically ill - Comprehensive assessment</span>
                              </label>
                              
                              <label className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded">
                                <input 
                                  type="checkbox" 
                                  value="draining"
                                  className="mt-1 border-gray-300 text-blue-600"
                                  onChange={createReferralCheckboxHandler()}
                                  name="referral_reasons"
                                />
                                <span className="text-sm">Draining/Amniotic fluid leak - Risk of infection</span>
                              </label>
                            </div>
                            {/* Standard Clinical Reasons moved to Routine Referral section */}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Select all applicable reasons for referral</p>
                      </div>

                      {/* Other reason field (conditionally shown) */}
                      <div id="other-reason-field" className="space-y-2" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Specify other reason</label>
                        <input type="text" className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                      </div>

                      {/* Pre-existing Medical Conditions (conditionally shown) */}
                      <div id="pre-existing-condition-options" className="space-y-3 col-span-2 border border-red-200 rounded-lg p-4 bg-red-50" style={{ display: 'none' }}>
                        <h4 className="text-sm font-semibold text-red-700">Pre-existing Medical Conditions</h4>
                        <p className="text-xs text-red-600">Select all applicable medical conditions (multiple selections allowed)</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="asthma" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Asthma</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="cardiac_condition" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Cardiac condition</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="diabetes_mellitus" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Diabetes mellitus</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="renal_failure" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Renal failure</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="epilepsy" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Epilepsy</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="hypertension" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Hypertension</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="hyperthyroidism" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Hyperthyroidism</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="severe_anaemia" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Moderate to severe anaemia (&lt;8g/dl)</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="coagulopathy" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Previous or current coagulopathy (eg DVT)</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="renal_disease" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Renal disease</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="sickle_cell" 
                              className="rounded border-gray-300 text-red-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-red-700 font-medium">Sickle cell disease</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="rh_negative" 
                              className="rounded border-gray-300 text-orange-600"
                              onChange={(e) => updateMedicalRiskLevel(e)}
                            />
                            <span className="text-orange-700 font-medium">RH negative</span>
                          </label>
                          <label className="flex items-center space-x-2 text-sm p-2 hover:bg-yellow-100 rounded border">
                            <input 
                              type="checkbox" 
                              value="other_medical" 
                              className="rounded border-gray-300 text-yellow-600"
                              onChange={(e) => {
                                const otherMedicalField = document.getElementById('other-medical-condition-field');
                                if (otherMedicalField) {
                                  otherMedicalField.style.display = e.target.checked ? 'block' : 'none';
                                }
                                updateMedicalRiskLevel(e);
                              }}
                            />
                            <span className="text-yellow-700 font-medium">Other (specify)</span>
                          </label>
                        </div>

                        {/* Other medical condition details */}
                        <div id="other-medical-condition-field" className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded" style={{ display: 'none' }}>
                          <label className="block text-sm font-medium text-yellow-800">Specify other medical condition</label>
                          <textarea 
                            className="w-full border-2 border-gray-300 rounded p-2 text-sm h-16 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" 
                            placeholder="Describe the other pre-existing medical condition..."
                          ></textarea>
                        </div>

                        {/* Medical Risk Assessment Display */}
                        <div id="medical-risk-assessment" className="p-3 border rounded bg-white">
                          <h6 className="text-sm font-semibold mb-2 text-red-700">Medical Risk Assessment</h6>
                          <div id="medical-risk-level-display" className="text-sm mb-2"></div>
                          <div id="medical-risk-recommendations" className="text-xs"></div>
                        </div>
                      </div>

                      {/* Preeclampsia options (conditionally shown) */}
                      <div id="preeclampsia-options" className="space-y-2 col-span-2" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Preeclampsia complications</label>
                        <select className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                          <option value="">Select</option>
                          <option value="severe_hypertension">Severe hypertension</option>
                          <option value="renal_dysfunction">Renal dysfunction</option>
                          <option value="liver_involvement">Liver involvement</option>
                          <option value="neurological_complications">Neurological complications</option>
                          <option value="haematological_complications">Haematological complications</option>
                        </select>
                      </div>



                      {/* Client Health History Information - Standalone Section for All Referrals */}
                      <div className="space-y-4 col-span-2 border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-blue-700">Client Health History Information</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Required for all referrals</span>
                        </div>
                        
                        {/* Business Rule: Current Pregnancy Information */}
                        <div className="mt-2 p-3 border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl space-y-3" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
                          <h4 className="font-semibold text-gray-800 text-base">Current Pregnancy Information</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">Gestational age (weeks) <span className="text-red-500">*</span></label>
                              <input 
                                type="number" 
                                id="current_ga_weeks"
                                min="4" 
                                max="42" 
                                className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                required
                                onChange={(e) => {
                                  const gaWeeks = parseInt(e.target.value);
                                  const trimesterInfo = document.getElementById('trimester-info');
                                  const riskAssessment = document.getElementById('ga-risk-assessment');
                                  
                                  if (trimesterInfo && riskAssessment) {
                                    let trimester = '';
                                    let riskLevel = '';
                                    let riskColor = '';
                                    
                                    if (gaWeeks >= 4 && gaWeeks <= 13) {
                                      trimester = 'First Trimester (4-13 weeks)';
                                      riskLevel = 'Standard monitoring required';
                                      riskColor = 'text-green-600';
                                    } else if (gaWeeks >= 14 && gaWeeks <= 27) {
                                      trimester = 'Second Trimester (14-27 weeks)';
                                      riskLevel = 'Standard monitoring required';
                                      riskColor = 'text-green-600';
                                    } else if (gaWeeks >= 28 && gaWeeks <= 36) {
                                      trimester = 'Third Trimester (28-36 weeks)';
                                      riskLevel = 'Enhanced monitoring required';
                                      riskColor = 'text-orange-600';
                                    } else if (gaWeeks >= 37) {
                                      trimester = 'Term Pregnancy (37+ weeks)';
                                      riskLevel = 'Delivery preparation required';
                                      riskColor = 'text-red-600';
                                    }
                                    
                                    trimesterInfo.textContent = trimester;
                                    riskAssessment.textContent = riskLevel;
                                    riskAssessment.className = `text-xs font-medium ${riskColor}`;
                                  }
                                }}
                              />
                              <div id="trimester-info" className="text-xs text-gray-600"></div>
                              <div id="ga-risk-assessment" className="text-xs font-medium"></div>
                            </div>
                            
                            
                          </div>
                        </div>

                        {/* Enhanced Obstetric History Assessment - Clean Modal Style */}
                        <div className="mt-2 p-3 border-l-4 border-gray-300 bg-white/60 backdrop-blur-md rounded-r-xl space-y-3" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
                          <h4 className="font-semibold text-gray-800 text-base">Enhanced Obstetric History Assessment</h4>
                          <p className="text-sm text-gray-600">Complete obstetric assessment including basic information and detailed pregnancy history</p>
                          
                          {/* Obstetric Assessment Section */}
                          <div>
                            <h5 className="text-sm font-medium mb-3">Obstetric Assessment</h5>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <label className="block text-xs font-medium">Gravida (Total pregnancies) <span className="text-red-500">*</span></label>
                                <input 
                                  type="number" 
                                  id="emergency_gravida"
                                  min="1" 
                                  max="20" 
                                  className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <label className="block text-xs font-medium">Para (Live births) <span className="text-red-500">*</span></label>
                                <input 
                                  type="number" 
                                  id="emergency_para"
                                  min="0" 
                                  max="15" 
                                  className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <label className="block text-xs font-medium">Abortions/Miscarriages <span className="text-red-500">*</span></label>
                                <input 
                                  type="number" 
                                  id="emergency_abortions"
                                  min="0" 
                                  max="10" 
                                  className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <label className="block text-xs font-medium">Living children <span className="text-red-500">*</span></label>
                                <input 
                                  type="number" 
                                  id="emergency_living_children"
                                  min="0" 
                                  max="15" 
                                  className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* No. of previous pregnancies (excluding current) */}
                          <div className="space-y-1">
                            <label className="block text-sm font-medium">No. of previous pregnancies (excluding current) <span className="text-red-500">*</span></label>
                            <input 
                              type="number" 
                              id="emergency_previous_pregnancies"
                              min="0" 
                              max="19" 
                              className="w-20 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                              placeholder="0"
                            />
                          </div>

                          {/* Additional Clinical Notes */}
                          <div className="space-y-1">
                            <label className="block text-sm font-medium">Additional Clinical Notes</label>
                            <textarea 
                              id="emergency_clinical_notes"
                              className="w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none h-16"
                              placeholder="Any additional obstetric history information, risk factors, or clinical observations..."
                            ></textarea>
                          </div>
                        </div>

                        {/* Emergency Referral Buttons */}
                        <div className="flex gap-4 mt-6">
                          <button 
                            type="button" 
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            Submit Emergency Referral
                          </button>
                          <button 
                            type="button" 
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                          >
                            Facility Management
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {activeSection === 'prepAssessment' && (
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-6 text-gray-800">PrEP Risk Assessment</h3>
                      <PrEPAssessmentModal 
                        isOpen={true} 
                        onClose={() => setActiveSection('overview')} 
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ANCPage;
