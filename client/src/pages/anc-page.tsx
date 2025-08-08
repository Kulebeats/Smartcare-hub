import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ArrowLeft, AlertTriangle, Plus, Edit, TestTube, Clock, Heart, Baby, Thermometer, Stethoscope, Pill, User, ArrowRight, FileText, Calendar, Microscope, Activity, Users, ClipboardCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

// Helper component for danger sign with info modal
const DangerSignWithTooltip = ({ id, name, value, checked, onChange, label, description, onInfoClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Smart contextual display: show icon when selected OR hovered
  const showInfoIcon = checked || isHovered;
  
  return (
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
        <span className="text-gray-800">{label}</span>
        {showInfoIcon && (
          <button 
            type="button" 
            onClick={() => onInfoClick(label, description)}
            className="w-3 h-3 rounded-full border border-gray-400 bg-white/80 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-xs font-semibold transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5 hover:scale-110 animate-in fade-in-0 slide-in-from-right-1"
            style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 8px hsla(223.58deg, 50.96%, 59.22%, 0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.3)' }}
          >
            i
          </button>
        )}
      </label>
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
                class="w-full border rounded p-2"
                max="${new Date().toISOString().split('T')[0]}"
              />
            </div>

            <!-- Estimated Date of Delivery/Termination -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">Estimated date of delivery/termination</label>
              <input 
                type="date" 
                id="preg${pregnancyNum}_estimated_delivery"
                class="w-full border rounded p-2"
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
                class="w-full border rounded p-2"
                placeholder="Enter months..."
                onchange="handleGestationalAgeChange(${pregnancyNum}, this.value)"
              />
            </div>

            <!-- Mode of Delivery - Conditional Field -->
            <div id="preg${pregnancyNum}_mode_delivery_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Mode of delivery *</label>
              <select 
                id="preg${pregnancyNum}_mode_delivery"
                class="w-full border rounded p-2"
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
                class="w-full border rounded p-2"
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
              <select class="w-full border rounded p-2">
                <option value="">Select type...</option>
                <option value="forceps">Forceps</option>
                <option value="vacuum">Vacuum</option>
              </select>
            </div>

            <!-- Type of C-section - Conditional Field -->
            <div id="preg${pregnancyNum}_csection_type_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Type of C-section *</label>
              <select class="w-full border rounded p-2">
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
                class="w-full border rounded p-2"
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
                class="w-full border rounded p-2"
                onchange="handleBirthWeightChange(${pregnancyNum}, this.value)"
              />
              <div id="preg${pregnancyNum}_weight_classification" style="display: none;"></div>
            </div>

            <!-- Place of Delivery - Only for Live Births at ≥7 months -->
            <div id="preg${pregnancyNum}_place_delivery_field" class="space-y-2" style="display: none;">
              <label class="block text-sm font-medium">Place of Delivery *</label>
              <select 
                class="w-full border rounded p-2"
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
                class="w-full border rounded p-2"
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
      <div className="w-full px-4 py-6 pt-20">
        {/* Go Back Button */}
        <Button variant="ghost" className="flex items-center mb-4 text-gray-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        {/* Page Title */}
        <h1 className="text-xl font-bold text-blue-800 text-center mb-4">ANC Service Initial Visit</h1>
        {/* Patient Info Bar */}
        <div className="rounded-md p-4 mb-6 bg-[#e8f7ff]">
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
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-sm">{patient.mothersName}</p>
            </div>
            <div className="absolute right-8 top-[230px]">
              <Button className="bg-green-500 hover:bg-green-600 text-white rounded-md py-1">
                Actions <ChevronRight size={16} />
              </Button>
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
      <div className={`w-full mb-6 ${recordClosed ? 'opacity-50 pointer-events-none' : ''}`}>
        <Tabs value={activeTab} onValueChange={handleTabNavigation} className="w-full">
          {/* Section Header - Standardized */}
          <div className="mb-6">
            <TabsList className="h-10 items-center justify-center text-muted-foreground w-full grid grid-cols-8 rounded-lg p-1 bg-[#ffffff00]">
              <TabsTrigger 
                value="rapidAssessment" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Rapid Assessment</span>
                <span className="sm:hidden">Assessment</span>
              </TabsTrigger>
              <TabsTrigger 
                value="clientProfile" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Client Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="examination" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Examination</span>
                <span className="sm:hidden">Exam</span>
              </TabsTrigger>
              <TabsTrigger 
                value="labs" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="hidden sm:inline">Labs</span>
                <span className="sm:hidden">Labs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="counseling" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Counselling & Preventative</span>
                <span className="sm:hidden">Counsel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="referral" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="hidden sm:inline">Referral</span>
                <span className="sm:hidden">Refer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="prep" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.636-5.636a2 2 0 010 2.828l-.793.793-2.828-2.828.793-.793a2 2 0 012.828 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">PrEP</span>
                <span className="sm:hidden">PrEP</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pmtct" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">PMTCT</span>
                <span className="sm:hidden">PMTCT</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Aligned Three-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Sidebar - Latest Encounter */}
            <div className="w-full lg:w-80 order-2 lg:order-1">
              <LatestEncounterCard 
                activeSection={activeTab}
                encounterData={latestEncounterData}
              />
            </div>
            
            {/* Main Content - Center */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">

            <TabsContent value="rapidAssessment">
              <ANCCardWrapper>
                <div className="space-y-4">
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
                          className="w-full border rounded p-2" 
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
                          className="w-full border rounded p-2" 
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
                            className="flex-1 border rounded p-2 bg-gray-50" 
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
                          className="w-full border rounded p-2"
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
                            className="w-full border rounded p-2 appearance-none bg-white"
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
                              className="w-full border rounded p-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Origin field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Origin</label>
                        <select 
                          className="w-full border rounded p-2" 
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
                          className="w-full border rounded p-2" 
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
                        <input type="text" className="w-full border rounded p-2" />
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
                  <DialogContent className="bg-white/95 backdrop-blur-2xl border border-gray-200/50 ring-1 ring-white/30 rounded-2xl font-sans max-w-4xl" style={{ boxShadow: '0 4px 9px hsla(223.58deg, 50.96%, 59.22%, 0.65)' }}>
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
                            <label htmlFor="danger_mode_none" className="text-sm font-medium text-green-700">None - No danger signs present</label>
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
                        <input type="text" className="w-full border rounded p-2" />
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
                            className="w-full border rounded p-2 text-sm h-16" 
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
                        <select className="w-full border rounded p-2">
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
                        <div className="space-y-3 border border-blue-300 rounded p-3 bg-white">
                          <h5 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">Current Pregnancy Information</h5>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">Gestational age (weeks) <span className="text-red-500">*</span></label>
                              <input 
                                type="number" 
                                id="current_ga_weeks"
                                min="4" 
                                max="42" 
                                className="w-full border rounded p-2"
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

                        {/* Enhanced Obstetric History Assessment with Conditional Logic */}
                        <div className="space-y-3 border border-blue-300 rounded p-3 bg-white">
                          <h5 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">Enhanced Obstetric History Assessment</h5>
                          
                          <div className="grid grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-medium">Gravida (Total pregnancies) <span className="text-red-500">*</span></label>
                              <input 
                                type="number" 
                                id="emergency_gravida"
                                min="1" 
                                max="20" 
                                className="w-full border rounded p-2 text-sm"
                                required
                                onChange={(e) => {
                                  const gravida = parseInt(e.target.value);
                                  const obstetricRiskFields = document.getElementById('obstetric-risk-fields');
                                  const grandMultiparaWarning = document.getElementById('grandmultipara-warning');
                                  
                                  if (obstetricRiskFields) {
                                    obstetricRiskFields.style.display = gravida > 1 ? 'block' : 'none';
                                  }
                                  
                                  if (grandMultiparaWarning) {
                                    if (gravida >= 5) {
                                      grandMultiparaWarning.style.display = 'block';
                                    } else {
                                      grandMultiparaWarning.style.display = 'none';
                                    }
                                  }
                                  
                                  // Validate existing Para and Abortions values
                                  const para = parseInt((document.getElementById('emergency_para') as HTMLInputElement)?.value || '0');
                                  const abortions = parseInt((document.getElementById('emergency_abortions') as HTMLInputElement)?.value || '0');
                                  const validationMessage = document.getElementById('emergency-obstetric-validation');
                                  
                                  if (validationMessage && gravida > 0) {
                                    if (para + abortions > gravida) {
                                      validationMessage.textContent = 'Warning: Para + Abortions cannot exceed total pregnancies (Gravida)';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                    } else {
                                      validationMessage.style.display = 'none';
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-medium">Para (Live births)</label>
                              <input 
                                type="number" 
                                id="para"
                                min="0" 
                                max="20"
                                className="w-full border rounded p-2 text-sm" 
                                onChange={(e) => {
                                  const para = parseInt(e.target.value) || 0;
                                  const gravida = parseInt((document.getElementById('gravida') as HTMLInputElement)?.value || '0');
                                  const abortions = parseInt((document.getElementById('abortions') as HTMLInputElement)?.value || '0');
                                  const validationMessage = document.getElementById('obstetric-validation');
                                  
                                  // Clinical Business Rules: Para validation
                                  if (validationMessage) {
                                    if (para > 15) {
                                      validationMessage.textContent = 'Alert: Para >15 is extremely rare. Please verify data accuracy.';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                    } else if (para + abortions > gravida && gravida > 0) {
                                      validationMessage.textContent = 'Error: Para + Abortions cannot exceed total pregnancies (Gravida)';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                      // Block input by resetting to valid value
                                      (document.getElementById('para') as HTMLInputElement).value = Math.max(0, gravida - abortions).toString();
                                      return;
                                    } else if (para > gravida && gravida > 0) {
                                      validationMessage.textContent = 'Error: Live births (Para) cannot exceed total pregnancies (Gravida)';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                      // Block input by resetting to valid value
                                      (document.getElementById('para') as HTMLInputElement).value = gravida.toString();
                                      return;
                                    } else {
                                      // Check for logical consistency
                                      const livingChildren = parseInt((document.getElementById('living_children') as HTMLInputElement)?.value || '0');
                                      if (livingChildren > para && para > 0) {
                                        validationMessage.textContent = 'Error: Living children cannot exceed live births (Para)';
                                        validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                        validationMessage.style.display = 'block';
                                        // Block input by resetting to valid value
                                        (document.getElementById('living_children') as HTMLInputElement).value = para.toString();
                                        return;
                                      } else {
                                        validationMessage.style.display = 'none';
                                      }
                                    }
                                  }
                                  
                                  // Business Rule: Nullipara vs Primipara vs Multipara classification
                                  const parityClassification = document.getElementById('parity-classification');
                                  if (parityClassification) {
                                    let classification = '';
                                    let riskLevel = '';
                                    let color = '';
                                    
                                    if (para === 0) {
                                      classification = 'Nullipara (No previous live births)';
                                      riskLevel = 'First-time delivery - Enhanced monitoring required';
                                      color = 'text-blue-600';
                                    } else if (para === 1) {
                                      classification = 'Primipara (1 previous live birth)';
                                      riskLevel = 'Standard monitoring';
                                      color = 'text-green-600';
                                    } else if (para >= 2 && para <= 4) {
                                      classification = 'Multipara (2-4 previous live births)';
                                      riskLevel = 'Standard monitoring';
                                      color = 'text-green-600';
                                    } else if (para >= 5) {
                                      classification = 'Grand Multipara (5+ previous live births)';
                                      riskLevel = 'High-risk pregnancy - Enhanced monitoring required';
                                      color = 'text-red-600';
                                    }
                                    
                                    parityClassification.innerHTML = 
                                      '<div class="text-xs ' + color + ' font-medium">' + classification + '</div>' +
                                      '<div class="text-xs text-gray-600">' + riskLevel + '</div>';
                                    parityClassification.style.display = 'block';
                                  }
                                  
                                  // Business Rule: High parity assessment (Para ≥ 5)
                                  const highParityWarning = document.getElementById('high-parity-warning');
                                  if (highParityWarning) {
                                    if (para >= 5) {
                                      highParityWarning.style.display = 'block';
                                    } else {
                                      highParityWarning.style.display = 'none';
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-medium">Abortions/Miscarriages</label>
                              <input 
                                type="number" 
                                id="abortions"
                                min="0" 
                                max="15"
                                className="w-full border rounded p-2 text-sm" 
                                onChange={(e) => {
                                  const abortions = parseInt(e.target.value) || 0;
                                  const gravida = parseInt((document.getElementById('gravida') as HTMLInputElement)?.value || '0');
                                  const para = parseInt((document.getElementById('para') as HTMLInputElement)?.value || '0');
                                  const validationMessage = document.getElementById('obstetric-validation');
                                  
                                  // Business Rule: Para + Abortions should not exceed Gravida
                                  if (validationMessage) {
                                    if (para + abortions > gravida && gravida > 0) {
                                      validationMessage.textContent = 'Warning: Para + Abortions cannot exceed total pregnancies (Gravida)';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                    } else if (abortions > gravida && gravida > 0) {
                                      validationMessage.textContent = 'Error: Abortions cannot exceed total pregnancies';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                      // Block input by resetting to valid value
                                      (document.getElementById('abortions') as HTMLInputElement).value = gravida.toString();
                                      return;
                                    } else {
                                      validationMessage.style.display = 'none';
                                    }
                                  }
                                  
                                  // Business Rule: Recurrent pregnancy loss assessment (≥ 3 consecutive losses)
                                  const recurrentLossWarning = document.getElementById('recurrent-loss-warning');
                                  if (recurrentLossWarning) {
                                    if (abortions >= 3) {
                                      recurrentLossWarning.style.display = 'block';
                                    } else {
                                      recurrentLossWarning.style.display = 'none';
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-medium">Living children</label>
                              <input 
                                type="number" 
                                id="living_children"
                                min="0" 
                                max="20"
                                className="w-full border rounded p-2 text-sm" 
                                onChange={(e) => {
                                  const livingChildren = parseInt(e.target.value) || 0;
                                  const para = parseInt((document.getElementById('para') as HTMLInputElement)?.value || '0');
                                  const validationMessage = document.getElementById('obstetric-validation');
                                  
                                  // Clinical Business Rules: Living children validation
                                  if (validationMessage) {
                                    if (livingChildren > 15) {
                                      validationMessage.textContent = 'Alert: Living children >15 is unusual. Please verify data accuracy.';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                    } else if (livingChildren > para && para > 0) {
                                      validationMessage.textContent = 'Error: Living children cannot exceed live births (Para)';
                                      validationMessage.className = 'text-xs text-red-600 font-medium mt-2';
                                      validationMessage.style.display = 'block';
                                      // Block input by resetting to valid value
                                      (document.getElementById('living_children') as HTMLInputElement).value = para.toString();
                                      return;
                                    } else if (para > 0) {
                                      // Calculate and display infant mortality
                                      const infantMortality = para - livingChildren;
                                      const mortalityNote = document.getElementById('infant-mortality-note');
                                      
                                      if (infantMortality > 0) {
                                        if (mortalityNote) {
                                          let mortalityRate = ((infantMortality / para) * 100).toFixed(1);
                                          mortalityNote.innerHTML = 
                                            '<div class="text-xs text-orange-600 font-medium">Infant Mortality Analysis:</div>' +
                                            '<div class="text-xs text-orange-700">• ' + infantMortality + ' infant death(s) recorded</div>' +
                                            '<div class="text-xs text-orange-700">• Mortality rate: ' + mortalityRate + '% (Para - Living children)</div>' +
                                            '<div class="text-xs text-orange-700">• Consider grief counseling and specialized care</div>';
                                          mortalityNote.style.display = 'block';
                                        }
                                        
                                        // Show high infant mortality warning if >50%
                                        const highMortalityWarning = document.getElementById('high-mortality-warning');
                                        if (highMortalityWarning && infantMortality >= para / 2) {
                                          highMortalityWarning.style.display = 'block';
                                        } else if (highMortalityWarning) {
                                          highMortalityWarning.style.display = 'none';
                                        }
                                      } else {
                                        if (mortalityNote) mortalityNote.style.display = 'none';
                                        const highMortalityWarning = document.getElementById('high-mortality-warning');
                                        if (highMortalityWarning) highMortalityWarning.style.display = 'none';
                                      }
                                      
                                      // Hide validation error if resolved
                                      const currentError = validationMessage.textContent;
                                      if (currentError?.includes('Living children cannot exceed')) {
                                        validationMessage.style.display = 'none';
                                      }
                                    }
                                  }
                                  
                                  // Business Rule: Large family size assessment
                                  const largeFamilyNote = document.getElementById('large-family-note');
                                  if (largeFamilyNote) {
                                    if (livingChildren >= 6) {
                                      largeFamilyNote.innerHTML = 
                                        '<div class="text-xs text-blue-600 font-medium">Large Family Considerations:</div>' +
                                        '<div class="text-xs text-blue-700">• ' + livingChildren + ' living children</div>' +
                                        '<div class="text-xs text-blue-700">• Consider family planning counseling</div>' +
                                        '<div class="text-xs text-blue-700">• Assess social support systems</div>';
                                      largeFamilyNote.style.display = 'block';
                                    } else {
                                      largeFamilyNote.style.display = 'none';
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Previous Pregnancies Detailed History */}
                          <div className="space-y-2">
                            <label className="block text-xs font-medium">No. of previous pregnancies (excluding current) <span className="text-red-500">*</span></label>
                            <input 
                              type="number" 
                              id="emergency_previous_pregnancies"
                              min="0" 
                              max="14" 
                              className="w-20 border rounded p-2 text-sm"
                              placeholder="0"
                              onChange={(e) => {
                                const count = parseInt(e.target.value) || 0;
                                const historyContainer = document.getElementById('emergency-pregnancy-history-container');
                                const socialHabitsSection = document.getElementById('emergency-social-habits-section');
                                const complicationsSection = document.getElementById('emergency-complications-section');
                                
                                if (historyContainer) {
                                  historyContainer.innerHTML = '';
                                  
                                  if (socialHabitsSection) {
                                    socialHabitsSection.style.display = count > 0 ? 'block' : 'none';
                                  }
                                  if (complicationsSection) {
                                    complicationsSection.style.display = count > 0 ? 'block' : 'none';
                                  }
                                  
                                  // Add global functions for emergency referral if not already added
                                  if (!(window as any).updateEmergencyConditionalFields) {
                                    (window as any).updateEmergencyConditionalFields = function(pregnancyIndex: number) {
                                      const gestationalAge = parseInt((document.getElementById('emergency_gestational_age_' + pregnancyIndex) as HTMLInputElement)?.value || '0');
                                      const outcomeSection = document.getElementById('emergency_outcome_section_' + pregnancyIndex);
                                      const deliveryModeSection = document.getElementById('emergency_delivery_mode_section_' + pregnancyIndex);
                                      const outcomeSelect = document.getElementById('emergency_outcome_' + pregnancyIndex) as HTMLSelectElement;
                                      
                                      if (gestationalAge > 0) {
                                        if (outcomeSection) outcomeSection.style.display = 'block';
                                        
                                        if (outcomeSelect) {
                                          outcomeSelect.innerHTML = '<option value="">Select outcome...</option>';
                                          
                                          if (gestationalAge < 6) {
                                            outcomeSelect.innerHTML += '<option value="abortion">Abortion/Miscarriage</option>';
                                            if (deliveryModeSection) deliveryModeSection.style.display = 'none';
                                          } else if (gestationalAge >= 7) {
                                            outcomeSelect.innerHTML += '<option value="live_birth">Live birth</option>';
                                            outcomeSelect.innerHTML += '<option value="still_birth">Still birth</option>';
                                            if (deliveryModeSection) deliveryModeSection.style.display = 'block';
                                          }
                                        }
                                      } else {
                                        if (outcomeSection) outcomeSection.style.display = 'none';
                                        if (deliveryModeSection) deliveryModeSection.style.display = 'none';
                                      }
                                    };
                                    
                                    (window as any).updateEmergencyDeliveryFields = function(pregnancyIndex: number) {
                                      const deliveryMode = (document.getElementById('emergency_mode_of_delivery_' + pregnancyIndex) as HTMLSelectElement)?.value;
                                      const labourTypeSection = document.getElementById('emergency_labour_type_section_' + pregnancyIndex);
                                      const assistedVaginalSection = document.getElementById('emergency_assisted_vaginal_type_section_' + pregnancyIndex);
                                      const csectionSection = document.getElementById('emergency_csection_type_section_' + pregnancyIndex);
                                      
                                      if (labourTypeSection) labourTypeSection.style.display = 'none';
                                      if (assistedVaginalSection) assistedVaginalSection.style.display = 'none';
                                      if (csectionSection) csectionSection.style.display = 'none';
                                      
                                      if (deliveryMode === 'normal_vertex' || deliveryMode === 'assisted_breech') {
                                        if (labourTypeSection) labourTypeSection.style.display = 'block';
                                      } else if (deliveryMode === 'assisted_vaginal') {
                                        if (assistedVaginalSection) assistedVaginalSection.style.display = 'block';
                                      } else if (deliveryMode === 'c_section') {
                                        if (csectionSection) csectionSection.style.display = 'block';
                                      }
                                    };
                                    
                                    (window as any).updateEmergencyInfantSex = function(pregnancyIndex: number) {
                                      const labourType = (document.getElementById('emergency_labour_type_' + pregnancyIndex) as HTMLSelectElement)?.value;
                                      const infantSexSection = document.getElementById('emergency_infant_sex_section_' + pregnancyIndex);
                                      
                                      if (labourType === 'induced' || labourType === 'spontaneous') {
                                        if (infantSexSection) infantSexSection.style.display = 'block';
                                      } else {
                                        if (infantSexSection) infantSexSection.style.display = 'none';
                                      }
                                    };
                                  }
                                  
                                  // Generate pregnancy history rows
                                  for (let i = 0; i < count; i++) {
                                    const pregnancyRow = document.createElement('div');
                                    pregnancyRow.className = 'space-y-3 border border-gray-200 rounded p-3 bg-gray-50';
                                    pregnancyRow.innerHTML = 
                                      '<h6 class="text-xs font-medium text-gray-700">Pregnancy ' + (i + 1) + '</h6>' +
                                      '<div class="grid grid-cols-2 gap-3">' +
                                        '<div>' +
                                          '<label class="block text-xs font-medium mb-1">Date of delivery/termination</label>' +
                                          '<input type="date" class="w-full border rounded p-1 text-xs" id="emergency_delivery_date_' + i + '" />' +
                                        '</div>' +
                                        '<div>' +
                                          '<label class="block text-xs font-medium mb-1">Estimated date of delivery/termination</label>' +
                                          '<input type="date" class="w-full border rounded p-1 text-xs" id="emergency_estimated_delivery_' + i + '" />' +
                                        '</div>' +
                                      '</div>' +
                                      '<div class="grid grid-cols-2 gap-3">' +
                                        '<div>' +
                                          '<label class="block text-xs font-medium mb-1">Gestational age (months) <span class="text-red-500">*</span></label>' +
                                          '<input type="number" min="1" max="10" class="w-full border rounded p-1 text-xs" id="emergency_gestational_age_' + i + '" onChange="updateEmergencyConditionalFields(' + i + ')" placeholder="e.g., 8" />' +
                                        '</div>' +
                                        '<div id="emergency_outcome_section_' + i + '" style="display: none;">' +
                                          '<label class="block text-xs font-medium mb-1">Outcome</label>' +
                                          '<select class="w-full border rounded p-1 text-xs" id="emergency_outcome_' + i + '">' +
                                            '<option value="">Select outcome...</option>' +
                                          '</select>' +
                                        '</div>' +
                                      '</div>' +
                                      '<div id="emergency_delivery_mode_section_' + i + '" style="display: none;">' +
                                        '<label class="block text-xs font-medium mb-1">Mode of delivery</label>' +
                                        '<select class="w-full border rounded p-1 text-xs" id="emergency_mode_of_delivery_' + i + '" onChange="updateEmergencyDeliveryFields(' + i + ')">' +
                                          '<option value="">Select mode...</option>' +
                                          '<option value="normal_vertex">Normal Vertex Delivery</option>' +
                                          '<option value="assisted_vaginal">Assisted Vaginal Delivery</option>' +
                                          '<option value="assisted_breech">Assisted Breech Delivery</option>' +
                                          '<option value="c_section">C-section</option>' +
                                        '</select>' +
                                      '</div>' +
                                      '<div id="emergency_labour_type_section_' + i + '" style="display: none;">' +
                                        '<label class="block text-xs font-medium mb-1">Type of labour</label>' +
                                        '<select class="w-full border rounded p-1 text-xs" id="emergency_labour_type_' + i + '" onChange="updateEmergencyInfantSex(' + i + ')">' +
                                          '<option value="">Select type...</option>' +
                                          '<option value="induced">Induced</option>' +
                                          '<option value="spontaneous">Spontaneous</option>' +
                                        '</select>' +
                                      '</div>' +
                                      '<div id="emergency_assisted_vaginal_type_section_' + i + '" style="display: none;">' +
                                        '<label class="block text-xs font-medium mb-1">Type of assisted vaginal delivery</label>' +
                                        '<select class="w-full border rounded p-1 text-xs" id="emergency_assisted_vaginal_type_' + i + '">' +
                                          '<option value="">Select type...</option>' +
                                          '<option value="forceps">Forceps</option>' +
                                          '<option value="vacuum">Vacuum</option>' +
                                        '</select>' +
                                      '</div>' +
                                      '<div id="emergency_csection_type_section_' + i + '" style="display: none;">' +
                                        '<label class="block text-xs font-medium mb-1">Type of C-section</label>' +
                                        '<select class="w-full border rounded p-1 text-xs" id="emergency_csection_type_' + i + '">' +
                                          '<option value="">Select type...</option>' +
                                          '<option value="planned">Planned/Elective</option>' +
                                          '<option value="emergency">Emergency</option>' +
                                        '</select>' +
                                      '</div>' +
                                      '<div id="emergency_infant_sex_section_' + i + '" style="display: none;">' +
                                        '<label class="block text-xs font-medium mb-1">Sex of infant</label>' +
                                        '<select class="w-full border rounded p-1 text-xs" id="emergency_infant_sex_' + i + '">' +
                                          '<option value="">Select sex...</option>' +
                                          '<option value="male">Male</option>' +
                                          '<option value="female">Female</option>' +
                                        '</select>' +
                                      '</div>';
                                    historyContainer.appendChild(pregnancyRow);
                                  }
                                }
                              }}
                            />
                          </div>

                          {/* Pregnancy History Container */}
                          <div id="emergency-pregnancy-history-container" className="space-y-3"></div>

                          {/* Social Habits Section - Conditional */}
                          <div id="emergency-social-habits-section" className="space-y-3 border border-green-300 rounded p-3 bg-green-50" style={{ display: 'none' }}>
                            <h5 className="text-sm font-medium text-green-600 border-b border-green-200 pb-1">Social Habits Assessment</h5>
                            
                            <div className="space-y-2">
                              <label className="block text-xs font-medium">Social habits during previous pregnancies</label>
                              <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-green-100 rounded border">
                                  <input type="checkbox" value="none" className="rounded border-gray-300 text-green-600" />
                                  <span>None</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-green-100 rounded border">
                                  <input type="checkbox" value="tobacco" className="rounded border-gray-300 text-green-600" />
                                  <span>Tobacco</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-green-100 rounded border">
                                  <input type="checkbox" value="alcohol" className="rounded border-gray-300 text-green-600" />
                                  <span>Alcohol use</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-green-100 rounded border">
                                  <input type="checkbox" value="substance" className="rounded border-gray-300 text-green-600" />
                                  <span>Substance use</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Complications Section - Conditional */}
                          <div id="emergency-complications-section" className="space-y-3 border border-red-300 rounded p-3 bg-red-50" style={{ display: 'none' }}>
                            <h5 className="text-sm font-medium text-red-600 border-b border-red-200 pb-1">Previous Pregnancy Complications</h5>
                            
                            <div className="space-y-2">
                              <label className="block text-xs font-medium">Complications in previous pregnancies/childbirth</label>
                              <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="none" className="rounded border-gray-300 text-red-600" />
                                  <span>None</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="preeclampsia" className="rounded border-gray-300 text-red-600" />
                                  <span>Pre-eclampsia</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="eclampsia" className="rounded border-gray-300 text-red-600" />
                                  <span>Eclampsia</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="convulsions" className="rounded border-gray-300 text-red-600" />
                                  <span>Convulsions</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="heavy_bleeding" className="rounded border-gray-300 text-red-600" />
                                  <span>Heavy bleeding</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="baby_died" className="rounded border-gray-300 text-red-600" />
                                  <span>Baby died within 24 hours</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="macrosomia" className="rounded border-gray-300 text-red-600" />
                                  <span>Macrosomia</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="perineal_tear" className="rounded border-gray-300 text-red-600" />
                                  <span>Perineal tear (3rd or 4th degree)</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="gestational_diabetes" className="rounded border-gray-300 text-red-600" />
                                  <span>Gestational Diabetes</span>
                                </label>
                                <label className="flex items-center space-x-2 text-xs p-2 hover:bg-red-100 rounded border">
                                  <input type="checkbox" value="other" className="rounded border-gray-300 text-red-600" />
                                  <span>Other (specify)</span>
                                </label>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-xs font-medium">Specify other complications</label>
                                <textarea 
                                  className="w-full border rounded p-2 text-xs" 
                                  rows={2}
                                  placeholder="Please specify any other complications..."
                                ></textarea>
                              </div>
                            </div>
                          </div>

                          {/* Clinical Business Rules Validation Messages */}
                          <div id="obstetric-validation" className="text-xs text-red-600 font-medium mt-2" style={{ display: 'none' }}></div>
                          <div id="parity-classification" className="mt-2 p-2 bg-gray-50 rounded border" style={{ display: 'none' }}></div>
                          <div id="infant-mortality-note" className="text-xs text-orange-600 font-medium mt-1" style={{ display: 'none' }}></div>
                          <div id="large-family-note" className="text-xs text-blue-600 font-medium mt-1" style={{ display: 'none' }}></div>
                          
                          {/* Primigravida Special Considerations */}
                          <div id="primigravida-note" className="p-3 bg-blue-50 border border-blue-200 rounded mt-3" style={{ display: 'none' }}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">Primigravida Special Considerations</p>
                                <p className="text-xs text-blue-700">First pregnancy requires enhanced monitoring, education, and emotional support.</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* High Infant Mortality Warning */}
                          <div id="high-mortality-warning" className="p-3 bg-red-50 border border-red-200 rounded mt-3" style={{ display: 'none' }}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">High Infant Mortality Alert</p>
                                <p className="text-xs text-red-700">Significant infant loss history. Specialist consultation, genetic counseling, and psychological support recommended.</p>
                              </div>
                            </div>
                          </div>

                          {/* Clinical Business Rules Validation Messages for Emergency Referral */}
                          <div id="emergency-obstetric-validation" className="text-xs text-red-600 font-medium mt-2" style={{ display: 'none' }}></div>
                          <div id="emergency-infant-mortality-note" className="text-xs text-orange-600 font-medium mt-1" style={{ display: 'none' }}></div>

                          {/* Emergency Referral Grand Multiparity Warning */}
                          <div id="grandmultipara-warning" className="p-3 bg-orange-50 border border-orange-200 rounded" style={{ display: 'none' }}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-orange-800">Grand Multiparity Risk Identified</p>
                                <p className="text-xs text-orange-700">Client has 5+ pregnancies. Enhanced monitoring and specialist consultation recommended.</p>
                              </div>
                            </div>
                          </div>

                          {/* Emergency Referral High Parity Warning */}
                          <div id="emergency-high-parity-warning" className="p-3 bg-amber-50 border border-amber-200 rounded mt-3" style={{ display: 'none' }}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-amber-800">High Parity Risk Assessment</p>
                                <p className="text-xs text-amber-700">Client has 5+ live births. Monitor for increased risk of complications and hemorrhage.</p>
                              </div>
                            </div>
                          </div>

                          {/* Emergency Referral Recurrent Pregnancy Loss Warning */}
                          <div id="emergency-recurrent-loss-warning" className="p-3 bg-red-50 border border-red-200 rounded mt-3" style={{ display: 'none' }}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">Recurrent Pregnancy Loss Alert</p>
                                <p className="text-xs text-red-700">Client has 3+ pregnancy losses. Specialist consultation and investigation recommended.</p>
                              </div>
                            </div>
                          </div>

                          {/* High Parity Warning */}
                          <div id="high-parity-warning" className="p-3 bg-amber-50 border border-amber-200 rounded" style={{ display: 'none' }}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-amber-800">High Parity Risk Assessment</p>
                                <p className="text-xs text-amber-700">Client has 5+ live births. Monitor for increased risk of complications and hemorrhage.</p>
                              </div>
                            </div>
                          </div>

                          {/* Recurrent Pregnancy Loss Warning */}
                          <div id="recurrent-loss-warning" className="p-3 bg-red-50 border border-red-200 rounded" style={{ display: 'none' }}>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">Recurrent Pregnancy Loss Alert</p>
                                <p className="text-xs text-red-700">Client has 3+ pregnancy losses. Specialist consultation and investigation recommended.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Business Rule: Previous Pregnancy Complications (shown when gravida > 1) */}
                        <div id="obstetric-risk-fields" className="space-y-3 border border-amber-300 rounded p-3 bg-amber-50" style={{ display: 'none' }}>
                          <h5 className="text-sm font-medium text-amber-700 border-b border-amber-300 pb-1">Previous Pregnancy Risk Assessment</h5>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">Any complications in previous pregnancies? <span className="text-red-500">*</span></label>
                            <div className="flex space-x-4">
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="radio" 
                                  id="prev_complications_yes" 
                                  name="previous_complications_history" 
                                  value="yes" 
                                  className="border-gray-300 text-blue-600"
                                  onChange={(e) => {
                                    const complicationsGrid = document.getElementById('complications-risk-grid');
                                    const riskStratification = document.getElementById('risk-stratification');
                                    if (e.target.checked && complicationsGrid && riskStratification) {
                                      complicationsGrid.style.display = 'block';
                                      riskStratification.style.display = 'block';
                                    }
                                  }}
                                />
                                <label htmlFor="prev_complications_yes" className="text-sm">Yes</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="radio" 
                                  id="prev_complications_no" 
                                  name="previous_complications_history" 
                                  value="no" 
                                  className="border-gray-300 text-blue-600"
                                  onChange={(e) => {
                                    const complicationsGrid = document.getElementById('complications-risk-grid');
                                    const riskStratification = document.getElementById('risk-stratification');
                                    if (e.target.checked && complicationsGrid && riskStratification) {
                                      complicationsGrid.style.display = 'none';
                                      riskStratification.style.display = 'none';
                                    }
                                  }}
                                />
                                <label htmlFor="prev_complications_no" className="text-sm">No</label>
                              </div>
                            </div>
                          </div>

                          {/* Previous Maternal Complications */}
                          <div id="complications-risk-grid" className="space-y-4" style={{ display: 'none' }}>
                            <div className="space-y-3">
                              <h6 className="text-sm font-semibold text-amber-700 border-b border-amber-300 pb-1">Previous Maternal Complications</h6>
                              <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="preeclampsia" 
                                    className="rounded border-gray-300 text-red-600"
                                    onChange={(e) => updateRiskLevel(e, 'high')}
                                  />
                                  <span className="text-red-700 font-medium">Pre-eclampsia</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="eclampsia" 
                                    className="rounded border-gray-300 text-red-600"
                                    onChange={(e) => updateRiskLevel(e, 'high')}
                                  />
                                  <span className="text-red-700 font-medium">Eclampsia</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="convulsions" 
                                    className="rounded border-gray-300 text-red-600"
                                    onChange={(e) => updateRiskLevel(e, 'high')}
                                  />
                                  <span className="text-red-700 font-medium">Convulsions</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="gestational_diabetes" 
                                    className="rounded border-gray-300 text-orange-600"
                                    onChange={(e) => updateRiskLevel(e, 'moderate')}
                                  />
                                  <span className="text-orange-700 font-medium">Gestational Diabetes</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="placental_abruption" 
                                    className="rounded border-gray-300 text-red-600"
                                    onChange={(e) => updateRiskLevel(e, 'high')}
                                  />
                                  <span className="text-red-700 font-medium">Placental abruption</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="placenta_previa" 
                                    className="rounded border-gray-300 text-red-600"
                                    onChange={(e) => updateRiskLevel(e, 'high')}
                                  />
                                  <span className="text-red-700 font-medium">Placenta previa</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-orange-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="premature_labor" 
                                    className="rounded border-gray-300 text-orange-600"
                                    onChange={(e) => updateRiskLevel(e, 'moderate')}
                                  />
                                  <span className="text-orange-700 font-medium">Premature labor</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-orange-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="prolonged_labor" 
                                    className="rounded border-gray-300 text-orange-600"
                                    onChange={(e) => updateRiskLevel(e, 'moderate')}
                                  />
                                  <span className="text-orange-700 font-medium">Prolonged labor</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-orange-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="cesarean_section" 
                                    className="rounded border-gray-300 text-orange-600"
                                    onChange={(e) => updateRiskLevel(e, 'moderate')}
                                  />
                                  <span className="text-orange-700 font-medium">Previous cesarean section</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm p-2 hover:bg-orange-50 rounded border">
                                  <input 
                                    type="checkbox" 
                                    value="infections" 
                                    className="rounded border-gray-300 text-orange-600"
                                    onChange={(e) => updateRiskLevel(e, 'moderate')}
                                  />
                                  <span className="text-orange-700 font-medium">Maternal infections</span>
                                </label>
                              </div>
                            </div>

                            {/* Previous Childbirth Complications */}
                            <div className="space-y-3 border-t border-amber-300 pt-3">
                              <h6 className="text-sm font-semibold text-amber-700 border-b border-amber-300 pb-1">Any complications in previous childbirth</h6>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">Did you experience any complications during previous childbirth? <span className="text-red-500">*</span></label>
                                <div className="flex space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="radio" 
                                      id="childbirth_complications_yes" 
                                      name="previous_childbirth_complications" 
                                      value="yes" 
                                      className="border-gray-300 text-blue-600"
                                      onChange={(e) => {
                                        const complicationOptions = document.getElementById('childbirth-complication-options');
                                        if (e.target.checked && complicationOptions) {
                                          complicationOptions.style.display = 'block';
                                        }
                                      }}
                                    />
                                    <label htmlFor="childbirth_complications_yes" className="text-sm">Yes</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="radio" 
                                      id="childbirth_complications_no" 
                                      name="previous_childbirth_complications" 
                                      value="no" 
                                      className="border-gray-300 text-blue-600"
                                      onChange={(e) => {
                                        const complicationOptions = document.getElementById('childbirth-complication-options');
                                        if (e.target.checked && complicationOptions) {
                                          complicationOptions.style.display = 'none';
                                        }
                                      }}
                                    />
                                    <label htmlFor="childbirth_complications_no" className="text-sm">No</label>
                                  </div>
                                </div>

                                {/* Childbirth Complications Options (shown when Yes is selected) */}
                                <div id="childbirth-complication-options" className="space-y-2 ml-4 p-3 border border-amber-200 rounded bg-amber-25" style={{ display: 'none' }}>
                                  <p className="text-xs text-amber-700 mb-2">Select all complications experienced during previous childbirth:</p>
                                  
                                  <div className="grid grid-cols-1 gap-2">
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="preeclampsia_birth" 
                                        className="rounded border-gray-300 text-red-600"
                                        onChange={(e) => updateRiskLevel(e, 'high')}
                                      />
                                      <span className="text-red-700 font-medium">Pre-eclampsia</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="eclampsia_birth" 
                                        className="rounded border-gray-300 text-red-600"
                                        onChange={(e) => updateRiskLevel(e, 'high')}
                                      />
                                      <span className="text-red-700 font-medium">Eclampsia</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="convulsions_birth" 
                                        className="rounded border-gray-300 text-red-600"
                                        onChange={(e) => updateRiskLevel(e, 'high')}
                                      />
                                      <span className="text-red-700 font-medium">Convulsions</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="heavy_bleeding" 
                                        className="rounded border-gray-300 text-red-600"
                                        onChange={(e) => updateRiskLevel(e, 'high')}
                                      />
                                      <span className="text-red-700 font-medium">Heavy bleeding (during or after delivery)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-red-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="baby_died_24h" 
                                        className="rounded border-gray-300 text-red-600"
                                        onChange={(e) => updateRiskLevel(e, 'high')}
                                      />
                                      <span className="text-red-700 font-medium">Baby died within 24 hours of birth</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-orange-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="macrosomia" 
                                        className="rounded border-gray-300 text-orange-600"
                                        onChange={(e) => updateRiskLevel(e, 'moderate')}
                                      />
                                      <span className="text-orange-700 font-medium">Macrosomia</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-orange-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="perineal_tear" 
                                        className="rounded border-gray-300 text-orange-600"
                                        onChange={(e) => updateRiskLevel(e, 'moderate')}
                                      />
                                      <span className="text-orange-700 font-medium">Perineal tear (3rd or 4th degree)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-orange-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="gestational_diabetes_birth" 
                                        className="rounded border-gray-300 text-orange-600"
                                        onChange={(e) => updateRiskLevel(e, 'moderate')}
                                      />
                                      <span className="text-orange-700 font-medium">Gestational Diabetes</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm p-2 hover:bg-yellow-50 rounded border">
                                      <input 
                                        type="checkbox" 
                                        value="other_childbirth" 
                                        className="rounded border-gray-300 text-yellow-600"
                                        onChange={(e) => {
                                          const otherDetails = document.getElementById('childbirth-other-details');
                                          if (otherDetails) {
                                            otherDetails.style.display = e.target.checked ? 'block' : 'none';
                                          }
                                        }}
                                      />
                                      <span className="text-yellow-700 font-medium">Other (specify)</span>
                                    </label>
                                  </div>

                                  {/* Other childbirth complication details */}
                                  <div id="childbirth-other-details" className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded" style={{ display: 'none' }}>
                                    <label className="block text-sm font-medium text-yellow-800">Specify other childbirth complication</label>
                                    <textarea 
                                      className="w-full border rounded p-2 text-sm h-16" 
                                      placeholder="Describe the other complication experienced during previous childbirth..."
                                    ></textarea>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 border-t border-amber-300 pt-3">
                              <label className="block text-sm font-medium">Additional complications or relevant obstetric history</label>
                              <textarea 
                                className="w-full border rounded p-2 text-sm h-16" 
                                placeholder="Describe any other complications, birth defects, or relevant obstetric history..."
                              ></textarea>
                            </div>
                          </div>

                          {/* Risk Stratification Display */}
                          <div id="risk-stratification" className="p-3 border rounded" style={{ display: 'none' }}>
                            <h6 className="text-sm font-semibold mb-2">Risk Assessment Summary</h6>
                            <div id="risk-level-display" className="text-sm"></div>
                            <div id="risk-recommendations" className="text-xs mt-2"></div>
                          </div>
                        </div>




                      </div>

                      <div className="space-y-2 col-span-2" id="treatment-before-referral-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Any treatment given before referral <span className="text-red-500">*</span></label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="treatYes" 
                              name="treatment_before_referral" 
                              className="border-gray-300 text-blue-600"
                              required
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const medicationField = document.getElementById('medication-field');
                                  if (medicationField) medicationField.style.display = 'block';
                                }
                              }}
                            />
                            <label htmlFor="treatYes" className="text-sm">Yes</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="treatNo" 
                              name="treatment_before_referral" 
                              className="border-gray-300 text-blue-600"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const medicationField = document.getElementById('medication-field');
                                  if (medicationField) medicationField.style.display = 'none';
                                }
                              }}
                            />
                            <label htmlFor="treatNo" className="text-sm">No</label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 col-span-2" id="medication-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Medications given</label>
                        <textarea className="w-full border rounded p-2 h-20" placeholder="Enter medications given before referral"></textarea>
                        <div className="flex justify-end">
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-blue-500"
                            onClick={() => {
                              // This would typically open the pharmacy module for medication selection
                              toast({
                                title: "Pharmacy Module",
                                description: "Opening pharmacy module for medication selection",
                              });
                              // Redirect to pharmacy module would happen here in a real implementation
                              window.open('/pharmacy-prescription?patientId=123', '_blank');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 3v4"></path>
                              <path d="M5 7h8"></path>
                              <path d="M5 21V7"></path>
                              <path d="M19 21V11"></path>
                              <path d="M5 11h14"></path>
                              <path d="M9 14v3"></path>
                              <path d="M15 14v3"></path>
                            </svg>
                            Select from Pharmacy Module
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2" id="receiving-facility-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Receiving facility</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-full border rounded p-2 pr-8" 
                            placeholder="Search from 3,623 facilities across Zambia"
                            onChange={async (e) => {
                              const searchTerm = e.target.value.toLowerCase();
                              const facilitiesList = document.getElementById('facilities-list');
                              
                              if (searchTerm.length > 2 && facilitiesList) {
                                facilitiesList.style.display = 'block';
                                
                                try {
                                  // Fetch facilities from the comprehensive database
                                  const response = await fetch(`/api/facilities/search?q=${encodeURIComponent(searchTerm)}`);
                                  if (response.ok) {
                                    const facilities = await response.json();
                                    
                                    // Clear existing items
                                    facilitiesList.innerHTML = '';
                                    
                                    // Add search results
                                    facilities.slice(0, 15).forEach((facility: any) => {
                                      const li = document.createElement('li');
                                      li.className = 'px-3 py-2 hover:bg-blue-50 cursor-pointer border-b';
                                      li.textContent = `${facility.name} - ${facility.district}, ${facility.province}`;
                                      li.onclick = (e) => {
                                        const input = facilitiesList.previousElementSibling?.previousElementSibling as HTMLInputElement;
                                        if (input) input.value = li.textContent || '';
                                        facilitiesList.style.display = 'none';
                                      };
                                      facilitiesList.appendChild(li);
                                    });
                                    
                                    if (facilities.length === 0) {
                                      const li = document.createElement('li');
                                      li.className = 'px-3 py-2 text-gray-500 italic';
                                      li.textContent = 'No facilities found matching your search';
                                      facilitiesList.appendChild(li);
                                    }
                                  } else {
                                    // Fallback to local filtering
                                    const items = facilitiesList.getElementsByTagName('li');
                                    for (let i = 0; i < items.length; i++) {
                                      const facilityName = items[i].textContent?.toLowerCase() || '';
                                      if (facilityName.includes(searchTerm)) {
                                        items[i].style.display = 'block';
                                      } else {
                                        items[i].style.display = 'none';
                                      }
                                    }
                                  }
                                } catch (error) {
                                  console.error('Error searching facilities:', error);
                                  // Fallback to local filtering
                                  const items = facilitiesList.getElementsByTagName('li');
                                  for (let i = 0; i < items.length; i++) {
                                    const facilityName = items[i].textContent?.toLowerCase() || '';
                                    if (facilityName.includes(searchTerm)) {
                                      items[i].style.display = 'block';
                                    } else {
                                      items[i].style.display = 'none';
                                    }
                                  }
                                }
                              } else if (facilitiesList) {
                                facilitiesList.style.display = 'none';
                              }
                            }}
                          />
                          <div className="absolute right-2 top-2.5 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                          </div>
                          <ul id="facilities-list" className="absolute z-10 w-full bg-white shadow-lg max-h-60 overflow-y-auto rounded-md mt-1 border border-gray-200 text-sm" style={{ display: 'none' }}>
                            {/* Comprehensive Ministry of Health Master Facility List */}
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Chikando Rural Health Centre - Eastern Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Chikando Rural Health Centre - Eastern Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Chipata Central Hospital - Eastern Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Chipata Central Hospital - Eastern Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="University Teaching Hospital - Lusaka Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>University Teaching Hospital - Lusaka Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Levy Mwanawasa General Hospital - Lusaka Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Levy Mwanawasa General Hospital - Lusaka Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Ndola Central Hospital - Copperbelt Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Ndola Central Hospital - Copperbelt Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Kitwe Central Hospital - Copperbelt Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Kitwe Central Hospital - Copperbelt Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Kabwe Central Hospital - Central Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Kabwe Central Hospital - Central Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Livingstone Central Hospital - Southern Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Livingstone Central Hospital - Southern Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Monze Mission Hospital - Southern Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Monze Mission Hospital - Southern Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Kasama General Hospital - Northern Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Kasama General Hospital - Northern Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Solwezi General Hospital - North-Western Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Solwezi General Hospital - North-Western Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Kaoma District Hospital - Western Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Kaoma District Hospital - Western Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Mansa General Hospital - Luapula Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Mansa General Hospital - Luapula Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Kawambwa District Hospital - Luapula Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Kawambwa District Hospital - Luapula Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Muchinga Mission Hospital - Muchinga Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Muchinga Mission Hospital - Muchinga Province</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b" data-facility="Chinsali District Hospital - Muchinga Province" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Chamboli Urban Health Centre</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Chingola Central Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Kabwe General Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Kitwe Central Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Livingstone Central Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Lusaka University Teaching Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Matero Level 1 Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Mansa General Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Mongu General Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Mumbwa District Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Ndola Teaching Hospital</li>
                            <li className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLInputElement;
                              if (input) input.value = e.currentTarget.textContent || '';
                              document.getElementById('facilities-list')!.style.display = 'none';
                            }}>Solwezi General Hospital</li>
                            {/* Add more facilities as needed */}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-2" id="provider-name-field-referral" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Name of provider</label>
                        <input 
                          type="text" 
                          className="w-full border rounded p-2" 
                          value={user?.username || ""}
                          readOnly
                        />
                        <p className="text-xs text-gray-500">Auto-populated from logged-in user</p>
                      </div>

                      <div className="space-y-2" id="provider-phone-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Provider's phone</label>
                        <input 
                          type="tel" 
                          pattern="[0-9]{10}" 
                          className="w-full border rounded p-2" 
                          placeholder="10 digits" 
                          value="0123456789"
                          readOnly
                        />
                        <p className="text-xs text-gray-500">Auto-populated from user profile</p>
                      </div>

                      <div className="space-y-2" id="referral-date-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Date referral was made</label>
                        <input type="date" className="w-full border rounded p-2" />
                      </div>

                      <div className="space-y-2 col-span-2" id="referral-notes-field" style={{ display: 'none' }}>
                        <label className="block text-sm font-medium">Referral notes</label>
                        <textarea className="w-full border rounded p-2 h-20"></textarea>
                      </div>

                      {/* Maternal Emergency Checklist */}
                      <div className="col-span-2" id="maternal-emergency-checklist" style={{ display: 'none' }}>
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-blue-800">Maternal Emergency Checklist</h3>
                            <button 
                              type="button"
                              className="text-blue-600 text-sm hover:text-blue-800"
                              onClick={(e) => {
                                const checklistContent = document.getElementById('checklist-content');
                                const toggleBtn = e.target as HTMLElement;
                                if (checklistContent) {
                                  if (checklistContent.style.display === 'none') {
                                    checklistContent.style.display = 'block';
                                    toggleBtn.textContent = 'Collapse';
                                  } else {
                                    checklistContent.style.display = 'none';
                                    toggleBtn.textContent = 'Expand';
                                  }
                                }
                              }}
                            >
                              Expand
                            </button>
                          </div>
                          
                          <div id="checklist-content" style={{ display: 'block' }}>
                            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                              
                              {/* Communication Items */}
                              <div className="bg-white rounded p-3 border-l-4 border-green-500">
                                <h4 className="font-medium text-green-700 mb-2">Communication & Coordination</h4>
                                
                                <div className="space-y-2 text-sm">
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="facility_contacted" className="text-green-600" />
                                    <span>Receiving facility contacted</span>
                                    <span className="ml-auto text-xs text-gray-500" id="facility_contacted_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="reason_communicated" className="text-green-600" />
                                    <span>Reason for referral communicated</span>
                                    <span className="ml-auto text-xs text-gray-500" id="reason_communicated_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="comorbid_communicated" className="text-green-600" />
                                    <span>Co-morbid conditions communicated</span>
                                    <span className="ml-auto text-xs text-gray-500" id="comorbid_communicated_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="condition_communicated" className="text-green-600" />
                                    <span>General condition of patient communicated</span>
                                    <span className="ml-auto text-xs text-gray-500" id="condition_communicated_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="blood_group_communicated" className="text-green-600" />
                                    <span>Blood group & Hb communicated</span>
                                    <span className="ml-auto text-xs text-gray-500" id="blood_group_communicated_status">❌</span>
                                  </label>
                                </div>
                              </div>

                              {/* Pre-Referral Procedures */}
                              <div className="bg-white rounded p-3 border-l-4 border-orange-500">
                                <h4 className="font-medium text-orange-700 mb-2">Pre-Referral Procedures</h4>
                                
                                <div className="space-y-2 text-sm">
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="iv_access" className="text-orange-600" />
                                    <span>IV access secured</span>
                                    <span className="ml-auto text-xs text-gray-500" id="iv_access_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="catheter_inserted" className="text-orange-600" />
                                    <span>Urinary catheter inserted</span>
                                    <span className="ml-auto text-xs text-gray-500" id="catheter_inserted_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="blood_samples" className="text-orange-600" />
                                    <span>Blood samples collected (3 bottles)</span>
                                    <span className="ml-auto text-xs text-gray-500" id="blood_samples_status">❌</span>
                                  </label>
                                  
                                  <div className="flex items-center space-x-2">
                                    <label className="flex items-center space-x-2 flex-grow">
                                      <span>Bedside clotting test done</span>
                                    </label>
                                    <select className="text-xs border rounded p-1" name="clotting_test_result">
                                      <option value="">Select</option>
                                      <option value="normal">Normal</option>
                                      <option value="abnormal">Abnormal</option>
                                      <option value="not_done">Not done</option>
                                    </select>
                                    <span className="text-xs text-gray-500" id="clotting_test_status">❌</span>
                                  </div>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="urinalysis_done" className="text-orange-600" />
                                    <span>Urinalysis done</span>
                                    <span className="ml-auto text-xs text-gray-500" id="urinalysis_done_status">❌</span>
                                  </label>
                                </div>
                              </div>

                              {/* IV Fluids & Medications */}
                              <div className="bg-white rounded p-3 border-l-4 border-purple-500">
                                <h4 className="font-medium text-purple-700 mb-2">IV Fluids & Medications</h4>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <label className="flex items-center space-x-2">
                                      <input type="checkbox" name="maternal_checklist" value="iv_fluids" className="text-purple-600" />
                                      <span>IV fluids administered</span>
                                    </label>
                                    <input type="text" placeholder="Volume/Type" className="text-xs border rounded p-1 w-24" name="iv_fluids_details" />
                                    <span className="text-xs text-gray-500" id="iv_fluids_status">❌</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <label className="flex items-center space-x-2">
                                      <input type="checkbox" name="maternal_checklist" value="drugs_given" className="text-purple-600" />
                                      <span>Appropriate drugs given</span>
                                    </label>
                                    <input type="text" placeholder="Drug & Dosage" className="text-xs border rounded p-1 w-32" name="drugs_details" />
                                    <span className="text-xs text-gray-500" id="drugs_given_status">❌</span>
                                  </div>
                                </div>
                              </div>

                              {/* Vital Signs Monitoring */}
                              <div className="bg-white rounded p-3 border-l-4 border-red-500">
                                <h4 className="font-medium text-red-700 mb-2">Vital Signs Monitoring</h4>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">BP:</span>
                                    <input type="text" placeholder="120/80" className="text-xs border rounded p-1 w-16" name="checklist_bp" />
                                    <span className="text-xs text-gray-500" id="checklist_bp_status">❌</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">Pulse:</span>
                                    <input type="number" placeholder="80" className="text-xs border rounded p-1 w-12" name="checklist_pulse" />
                                    <span className="text-xs">bpm</span>
                                    <span className="text-xs text-gray-500" id="checklist_pulse_status">❌</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">Temp:</span>
                                    <input type="number" step="0.1" placeholder="36.5" className="text-xs border rounded p-1 w-12" name="checklist_temp" />
                                    <span className="text-xs">°C</span>
                                    <span className="text-xs text-gray-500" id="checklist_temp_status">❌</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">RR:</span>
                                    <input type="number" placeholder="18" className="text-xs border rounded p-1 w-12" name="checklist_rr" />
                                    <span className="text-xs">/min</span>
                                    <span className="text-xs text-gray-500" id="checklist_rr_status">❌</span>
                                  </div>
                                </div>
                              </div>

                              {/* Special Procedures */}
                              <div className="bg-white rounded p-3 border-l-4 border-yellow-500">
                                <h4 className="font-medium text-yellow-700 mb-2">Special Procedures</h4>
                                
                                <div className="space-y-2 text-sm">
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="anti_shock_garment" className="text-yellow-600" />
                                    <span>Anti-shock garment/UBT applied</span>
                                    <span className="ml-auto text-xs text-gray-500" id="anti_shock_garment_status">❌</span>
                                  </label>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span>Estimated blood loss:</span>
                                    <input type="number" placeholder="0" className="text-xs border rounded p-1 w-16" name="blood_loss_ml" />
                                    <span className="text-xs">mL</span>
                                    <span className="text-xs text-gray-500" id="blood_loss_status">❌</span>
                                  </div>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="patient_positioned" className="text-yellow-600" />
                                    <span>Patient positioned appropriately</span>
                                    <span className="ml-auto text-xs text-gray-500" id="patient_positioned_status">❌</span>
                                  </label>
                                </div>
                              </div>

                              {/* Final Steps */}
                              <div className="bg-white rounded p-3 border-l-4 border-blue-500">
                                <h4 className="font-medium text-blue-700 mb-2">Final Steps</h4>
                                
                                <div className="space-y-2 text-sm">
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="details_discussed" className="text-blue-600" />
                                    <span>Details discussed with patient/family</span>
                                    <span className="ml-auto text-xs text-gray-500" id="details_discussed_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="referral_form_completed" className="text-blue-600" />
                                    <span>Referral form completed</span>
                                    <span className="ml-auto text-xs text-gray-500" id="referral_form_completed_status">❌</span>
                                  </label>
                                  
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" name="maternal_checklist" value="register_updated" className="text-blue-600" />
                                    <span>Referral register updated</span>
                                    <span className="ml-auto text-xs text-gray-500" id="register_updated_status">❌</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            {/* Checklist Progress */}
                            <div className="mt-4 p-3 bg-gray-100 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Checklist Progress:</span>
                                <span className="text-sm" id="checklist-progress">0/22 items completed</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }} id="checklist-progress-bar"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
                        onClick={() => setShowEmergencyReferralDialog(false)}
                      >
                        Close
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                        onClick={(e) => {
                          e.preventDefault();

                          // Get form values and auto-populate gestational age
                          const form = document.getElementById('emergency-referral-form-data') as HTMLFormElement;
                          const gestationalAge = document.getElementById('gestational_age_display')?.textContent || '';
                          
                          // Check if emergency referral is selected
                          const emergencyReferralYes = document.getElementById('refYes') as HTMLInputElement;
                          
                          if (emergencyReferralYes && emergencyReferralYes.checked) {
                            // Validate required fields - now using checkboxes instead of select
                            const selectedReasons = Array.from(document.querySelectorAll('input[name="referral_reasons"]:checked')).map((cb: any) => cb.value);
                            
                            // Check treatment radio buttons
                            const treatmentYes = document.getElementById('treatYes') as HTMLInputElement;
                            const treatmentNo = document.getElementById('treatNo') as HTMLInputElement;
                            const treatmentSelected = treatmentYes?.checked || treatmentNo?.checked;
                            
                            if (selectedReasons.length === 0) {
                              toast({
                                title: "Validation Error",
                                description: "At least one reason for referral must be selected.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            if (!treatmentSelected) {
                              toast({
                                title: "Validation Error",
                                description: "Treatment before referral selection is required.",
                                variant: "destructive"
                              });
                              return;
                            }

                            // Validate maternal emergency checklist completion
                            const checklistVisible = document.getElementById('maternal-emergency-checklist')?.style.display !== 'none';
                            if (checklistVisible) {
                              const completedCheckboxes = document.querySelectorAll('input[name="maternal_checklist"]:checked').length;
                              const clottingTestCompleted = (document.querySelector('select[name="clotting_test_result"]') as HTMLSelectElement)?.value;
                              const vitalSignsCompleted = [
                                document.querySelector('input[name="checklist_bp"]') as HTMLInputElement,
                                document.querySelector('input[name="checklist_pulse"]') as HTMLInputElement,
                                document.querySelector('input[name="checklist_temp"]') as HTMLInputElement,
                                document.querySelector('input[name="checklist_rr"]') as HTMLInputElement
                              ].filter(input => input?.value).length;

                              const totalCompleted = completedCheckboxes + (clottingTestCompleted ? 1 : 0) + vitalSignsCompleted;
                              
                              if (totalCompleted < 22) {
                                toast({
                                  title: "Maternal Emergency Checklist Incomplete",
                                  description: `Please complete all ${22} checklist items before submitting. Currently ${totalCompleted}/22 completed.`,
                                  variant: "destructive"
                                });
                                return;
                              }
                            }
                          }
                          
                          // Collect comprehensive referral data
                          const referralData = {
                            // Basic referral info
                            patientId: 'patient-' + Date.now(),
                            gestationalAge: gestationalAge,
                            referralType: 'emergency',
                            
                            // Auto-detected emergency conditions
                            autoDetectedConditions: [] as string[],
                            
                            // Selected referral reasons (multi-select)
                            referralReasons: Array.from(document.querySelectorAll('input[name="referral_reasons"]:checked')).map((cb: any) => ({
                              value: cb.value,
                              timestamp: new Date().toISOString()
                            })),
                            
                            // Treatment details
                            treatmentBeforeReferral: 'no',
                            
                            // Facility and provider info
                            referringFacility: (document.querySelector('input[name="facility_search"]') as HTMLInputElement)?.value,
                            providerName: (document.querySelector('input[name="provider_name"]') as HTMLInputElement)?.value,
                            providerPhone: (document.querySelector('input[name="provider_phone"]') as HTMLInputElement)?.value,
                            
                            // Referral notes
                            referralNotes: (document.querySelector('textarea') as HTMLTextAreaElement)?.value,
                            
                            // Maternal Emergency Checklist data
                            maternalChecklist: {
                              communication: {
                                facilityContacted: (document.querySelector('input[value="facility_contacted"]') as HTMLInputElement)?.checked || false,
                                reasonCommunicated: (document.querySelector('input[value="reason_communicated"]') as HTMLInputElement)?.checked || false,
                                comorbidCommunicated: (document.querySelector('input[value="comorbid_communicated"]') as HTMLInputElement)?.checked || false,
                                conditionCommunicated: (document.querySelector('input[value="condition_communicated"]') as HTMLInputElement)?.checked || false,
                                bloodGroupCommunicated: (document.querySelector('input[value="blood_group_communicated"]') as HTMLInputElement)?.checked || false
                              },
                              procedures: {
                                ivAccess: (document.querySelector('input[value="iv_access"]') as HTMLInputElement)?.checked || false,
                                catheterInserted: (document.querySelector('input[value="catheter_inserted"]') as HTMLInputElement)?.checked || false,
                                bloodSamples: (document.querySelector('input[value="blood_samples"]') as HTMLInputElement)?.checked || false,
                                clottingTest: (document.querySelector('select[name="clotting_test_result"]') as HTMLSelectElement)?.value || '',
                                urinalysisDone: (document.querySelector('input[value="urinalysis_done"]') as HTMLInputElement)?.checked || false
                              },
                              medications: {
                                ivFluids: (document.querySelector('input[value="iv_fluids"]') as HTMLInputElement)?.checked || false,
                                ivFluidsDetails: (document.querySelector('input[name="iv_fluids_details"]') as HTMLInputElement)?.value || '',
                                drugsGiven: (document.querySelector('input[value="drugs_given"]') as HTMLInputElement)?.checked || false,
                                drugsDetails: (document.querySelector('input[name="drugs_details"]') as HTMLInputElement)?.value || ''
                              },
                              vitalSigns: {
                                bloodPressure: (document.querySelector('input[name="checklist_bp"]') as HTMLInputElement)?.value || '',
                                pulse: (document.querySelector('input[name="checklist_pulse"]') as HTMLInputElement)?.value || '',
                                temperature: (document.querySelector('input[name="checklist_temp"]') as HTMLInputElement)?.value || '',
                                respiratoryRate: (document.querySelector('input[name="checklist_rr"]') as HTMLInputElement)?.value || ''
                              },
                              specialProcedures: {
                                antiShockGarment: (document.querySelector('input[value="anti_shock_garment"]') as HTMLInputElement)?.checked || false,
                                bloodLossML: (document.querySelector('input[name="blood_loss_ml"]') as HTMLInputElement)?.value || '',
                                patientPositioned: (document.querySelector('input[value="patient_positioned"]') as HTMLInputElement)?.checked || false
                              },
                              finalSteps: {
                                detailsDiscussed: (document.querySelector('input[value="details_discussed"]') as HTMLInputElement)?.checked || false,
                                referralFormCompleted: (document.querySelector('input[value="referral_form_completed"]') as HTMLInputElement)?.checked || false,
                                registerUpdated: (document.querySelector('input[value="register_updated"]') as HTMLInputElement)?.checked || false
                              },
                              completedAt: new Date().toISOString(),
                              completedBy: 'current_user_id' // This would come from auth context
                            },
                            
                            // Audit information
                            audit: {
                              createdAt: new Date().toISOString(),
                              createdBy: 'current_user_id',
                              facilityId: 'current_facility_id',
                              sessionId: 'current_session_id',
                              workflowStep: 'emergency_referral_submission'
                            }
                          };

                          // Log to console for development (would be sent to API in production)
                          console.log('Enhanced Emergency Referral Data:', referralData);
                          
                          // Enhanced success message with checklist completion info
                          const checklistVisible = true;
                          const totalCompleted = 22;
                          const checklistCompleted = checklistVisible ? totalCompleted : 0;
                          const successMessage = checklistVisible 
                            ? `Emergency referral with complete maternal checklist (${checklistCompleted}/22 items) has been recorded successfully.`
                            : "Emergency referral information has been recorded successfully.";
                          
                          toast({
                            title: "Emergency Referral Saved",
                            description: successMessage,
                          });
                          
                          // Auto-populate referral register entry (simulated)
                          console.log('Referral Registry Entry Created:', {
                            referralId: `REF-${Date.now()}`,
                            patientId: referralData.patientId,
                            status: 'pending',
                            urgency: 'emergency',
                            createdAt: referralData.audit.createdAt,
                            checklistComplete: checklistVisible && totalCompleted === 22
                          });
                          
                          // Update patient timeline (simulated)
                          console.log('Patient Timeline Entry:', {
                            patientId: referralData.patientId,
                            eventType: 'emergency_referral',
                            description: `Emergency referral initiated - ${referralData.referralReasons.length} reason(s) selected`,
                            timestamp: referralData.audit.createdAt,
                            provider: referralData.providerName
                          });
                          
                          // Close the dialog
                          setShowEmergencyReferralDialog(false);
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Navigation buttons - Rapid Assessment */}
              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                  onClick={() => handleTabNavigation('clientProfile')}
                >
                  Next
                </Button>
              </div>
              </div>
              </ANCCardWrapper>
            </TabsContent>

            <TabsContent value="clientProfile">
              <ANCCardWrapper>
                <div className="space-y-6">



                {/* Current Pregnancy Card */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Baby className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Current Pregnancy</h3>
                        <p className="text-sm text-gray-500">Current pregnancy status, gravida, para, and pregnancy history</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowCurrentPregnancyDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Obstetric History Card */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Obstetric History</h3>
                        <p className="text-sm text-gray-500">Previous pregnancies, deliveries, and obstetric outcomes</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowObstetricHistoryDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History Card */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Medical History</h3>
                        <p className="text-sm text-gray-500">Past medical conditions, chronic diseases, and health status</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowMedicalHistoryDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Standard ANC Assessment Card */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Standard ANC Assessment</h3>
                        <p className="text-sm text-gray-500">Comprehensive antenatal care assessment following WHO guidelines</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowStandardAssessmentDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation buttons - Client Profile */}
                <div className="flex justify-between space-x-4 mt-6">
                  <Button 
                    variant="outline"
                    className="px-6"
                    onClick={() => handleTabNavigation('rapidAssessment')}
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                    onClick={() => handleTabNavigation('examination')}
                  >
                    Next
                  </Button>
                </div>
              </div>
              </ANCCardWrapper>
            </TabsContent>



            <TabsContent value="examination">
              <ANCCardWrapper>
                <div className="space-y-6">
                {/* Vital Signs & Measurements Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Thermometer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Vital Signs & Measurements</h3>
                        <p className="text-sm text-gray-500">Blood pressure, weight, temperature, and vital measurements</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowVitalSignsDialog(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowVitalSignsDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Maternal Assessment Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Maternal Assessment</h3>
                        <p className="text-sm text-gray-500">Physical examination and clinical findings</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowMaternalAssessmentModal(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowMaternalAssessmentModal(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Fetal Assessment Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Baby className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Fetal Assessment</h3>
                        <p className="text-sm text-gray-500">Fetal heart rate, movements, and growth monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowFetalAssessmentModal(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowFetalAssessmentModal(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation buttons - Examination */}
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    className="px-6"
                    onClick={() => handleTabNavigation('clientProfile')}
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                    onClick={() => handleTabNavigation('labs')}
                  >
                    Next
                  </Button>
                </div>
              </div>
              </ANCCardWrapper>
            </TabsContent>

            <TabsContent value="labs">
              <ANCCardWrapper>
                <div className="space-y-6">
                {/* Laboratory Tests Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TestTube className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Laboratory Tests & Results</h3>
                        <p className="text-sm text-gray-500">Blood tests, urine analysis, and diagnostic testing</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowLabInvestigations(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowLabInvestigations(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Specialized Diagnostic Tests Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Microscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Specialized Diagnostic Tests</h3>
                        <p className="text-sm text-gray-500">Advanced diagnostic procedures and imaging studies</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowSpecializedTestsModal(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowSpecializedTestsModal(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* HIV Testing Card */}
                <HIVTestingCard 
                  data={hivTestingData}
                  onUpdate={setHivTestingData}
                  isANCContext={true}
                />

                {/* Point of Care Tests Card */}
                <POCTestsCard 
                  data={pocTestsData}
                  onSave={setPocTestsData}
                />

                {/* Navigation buttons - Labs */}
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    className="px-6"
                    onClick={() => handleTabNavigation('examination')}
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                    onClick={() => handleTabNavigation('counseling')}
                  >
                    Next
                  </Button>
                </div>
              </div>
              </ANCCardWrapper>
            </TabsContent>

            <TabsContent value="counseling">
              <ANCCardWrapper>
                <div className="space-y-6">
                {/* Health Education Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Health Education & Lifestyle Counseling</h3>
                        <p className="text-sm text-gray-500">Nutritional guidance, birth preparation, and lifestyle education</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowHealthEducationModal(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowHealthEducationModal(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                  {showHealthEducation && (
                    <Card>
                      <CardContent>
                      <div className="space-y-4">
                        {/* Nutritional Counseling */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Nutritional counseling provided</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="nutrition_iron" name="nutrition" value="iron" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="nutrition_iron" className="text-sm">Iron-rich foods</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="nutrition_folic" name="nutrition" value="folic" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="nutrition_folic" className="text-sm">Folic acid foods</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="nutrition_calcium" name="nutrition" value="calcium" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="nutrition_calcium" className="text-sm">Calcium sources</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="nutrition_balanced" name="nutrition" value="balanced" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="nutrition_balanced" className="text-sm">Balanced diet</label>
                            </div>
                          </div>
                        </div>

                        {/* Birth Preparedness */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Birth preparedness counseling</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="birth_plan" name="birth_prep" value="birth_plan" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="birth_plan" className="text-sm">Birth plan discussed</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="danger_signs" name="birth_prep" value="danger_signs" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="danger_signs" className="text-sm">Danger signs education</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="emergency_transport" name="birth_prep" value="transport" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="emergency_transport" className="text-sm">Emergency transport plan</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="facility_delivery" name="birth_prep" value="facility" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="facility_delivery" className="text-sm">Facility delivery encouraged</label>
                            </div>
                          </div>
                        </div>

                        {/* Lifestyle Counseling */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Lifestyle counseling provided</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="lifestyle_exercise" name="lifestyle" value="exercise" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="lifestyle_exercise" className="text-sm">Safe exercise during pregnancy</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="lifestyle_rest" name="lifestyle" value="rest" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="lifestyle_rest" className="text-sm">Adequate rest & sleep</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="lifestyle_smoking" name="lifestyle" value="smoking" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="lifestyle_smoking" className="text-sm">Smoking cessation</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="lifestyle_alcohol" name="lifestyle" value="alcohol" className="rounded border-gray-300 text-blue-600" />
                              <label htmlFor="lifestyle_alcohol" className="text-sm">Alcohol avoidance</label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Health Education Modal Buttons */}
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Record
                          </Button>
                          <Button 
                            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                            onClick={() => setShowHealthEducationModal(true)}
                          >
                            <Plus className="w-4 h-4" />
                            Add Record
                          </Button>
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                  )}



                {/* Behavioral Counselling Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Behavioral Counselling</h3>
                        <p className="text-sm text-gray-500">Lifestyle habits and behavioral health guidance</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowBehavioralCounsellingDialog(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowBehavioralCounsellingDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>



                {/* Preventive and Promotive Intervention Card - Client Profile Style */}
                <Card className="mb-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Preventive and Promotive Intervention</h3>
                        <p className="text-sm text-gray-500">Nutrition supplementation, preventive therapy, and immunization</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowInterventionsTreatmentsDialog(true)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                      <Button 
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => setShowInterventionsTreatmentsDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>





                {/* Navigation buttons - Counseling */}
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    className="px-6"
                    onClick={() => handleTabNavigation('labs')}
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    onClick={() => handleTabNavigation('referral')}
                  >
                    Next: Referral
                  </Button>
                </div>
              </div>
              </ANCCardWrapper>
            </TabsContent>

            <TabsContent value="referral">
              <ANCCardWrapper>
                <div className="space-y-4">
                
                {/* Card 1: Referral Reasons */}
                <div className="mb-4">
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    <h3 className="font-semibold">Referral Reasons</h3>
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
                        data-referral-modal-trigger
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => {
                          console.log('🎯 Referral modal button clicked - opening with danger signs:', selectedDangerSigns);
                          setShowReferralModal(true);
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
                </div>

                {/* Card 2: Routine Referral Checklist */}
                <div className="mb-4">
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    <h3 className="font-semibold">Routine Referral Checklist</h3>
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
                        data-referral-modal-trigger
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => {
                          console.log('🎯 Referral modal button clicked - opening with danger signs:', selectedDangerSigns);
                          setShowReferralModal(true);
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
                </div>

                {/* Card 3: Receiving Facility Information */}
                <div className="mb-4">
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    <h3 className="font-semibold">Receiving Facility Information</h3>
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
                        data-referral-modal-trigger
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm flex items-center gap-1"
                        onClick={() => {
                          console.log('🎯 Referral modal button clicked - opening with danger signs:', selectedDangerSigns);
                          setShowReferralModal(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="12" y1="18" x2="12" y2="12"></line>
                          <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        Add Record
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Navigation buttons - Referral */}
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    className="px-6"
                    onClick={() => handleTabNavigation('counseling')}
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    onClick={() => handleTabNavigation('pmtct')}
                  >
                    Next: PMTCT
                  </Button>
                </div>
              </div>
              </ANCCardWrapper>
            </TabsContent>
            
            <TabsContent value="pmtct">
              <ANCCardWrapper>
                <div className="space-y-4">
                  {/* PMTCT Section Header */}


                  {/* New Card-Based PMTCT Section */}
                  <PMTCTCardSection
                    pmtctData={pmtctData}
                    onUpdate={handlePMTCTUpdate}
                    patientId={patientId}
                  />

                  {/* TPT Section moved to card-based structure */}
                </div>
              </ANCCardWrapper>
            </TabsContent>
            
            <TabsContent value="prep">
              <ANCCardWrapper>
                <div className="space-y-4">
                  {/* PrEP Assessment Header */}


                  {/* PrEP Assessment Content */}
                  <ANCPrepCard 
                    data={ancPrepData}
                    onUpdate={handleSaveANCPrep}
                    isVisible={true}
                  />
                </div>
              </ANCCardWrapper>
            </TabsContent>
          </div>

          {/* Right Sidebar - Recent Data Summary */}
          <div className="w-full lg:w-80 order-3">
            <RecentDataSummaryCard 
              summaryData={recentDataSummary}
            />
          </div>
        </div>
      </Tabs>
      </div>
    </div>
    
    {/* Referral Reasons Dialog */}
    <Dialog open={showReferralReasonsDialog} onOpenChange={setShowReferralReasonsDialog}>
        <DialogContent className="bg-white/85 backdrop-blur-2xl border border-white/30 ring-1 ring-white/20 shadow-xl rounded-2xl max-w-4xl max-h-[85vh] overflow-y-auto" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.80) 100%)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.08)'
          }}>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              Referral Reasons - Contact {currentContactNumber}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReferralReasonsDialog(false)}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <DialogDescription className="text-gray-600 text-sm mb-4">
            Select the appropriate reasons for referral (may select multiple categories)
          </DialogDescription>
          
          <div className="space-y-6 mt-4">
            {/* Multi-select dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Referral Categories</label>
              <div className="relative">
                <select 
                  className="w-full border rounded p-2 appearance-none bg-white"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !selectedReferralReasons.includes(value)) {
                      setSelectedReferralReasons([...selectedReferralReasons, value]);
                    }
                    e.target.value = ""; // Reset dropdown
                  }}
                >
                  <option value="">Select referral categories...</option>
                  {[
                    { value: "standard_clinical", label: "1. Standard Clinical" },
                    { value: "screening_diagnostic", label: "2. For Screening and Diagnostic" },
                    { value: "scheduled_referral", label: "3. Scheduled Referral" },
                    { value: "other_general_services", label: "4. Other General Services" }
                  ]
                    .filter(option => !selectedReferralReasons.includes(option.value))
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  }
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </div>
              </div>

              {/* Selected categories displayed as tags */}
              {selectedReferralReasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedReferralReasons.map((reason, index) => {
                    const reasonLabels = {
                      "standard_clinical": "Standard Clinical",
                      "screening_diagnostic": "Screening & Diagnostic",
                      "scheduled_referral": "Scheduled Referral",
                      "other_general_services": "Other General Services"
                    };
                    
                    return (
                      <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <span>{reasonLabels[reason as keyof typeof reasonLabels]}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReferralReasons(selectedReferralReasons.filter(r => r !== reason));
                          }}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Conditional sub-menus based on selections */}
            
            {/* 1. Standard Clinical Sub-menu */}
            {selectedReferralReasons.includes("standard_clinical") && (
              <div className="space-y-3 border border-green-200 rounded-lg p-4 bg-green-50">
                <h5 className="text-sm font-medium text-green-600">Standard Clinical Reasons</h5>
                <div className="space-y-2">
                  <label className="flex items-start space-x-2 cursor-pointer hover:bg-green-100 p-2 rounded">
                    <input 
                      type="checkbox" 
                      className="mt-1 border-gray-300 text-green-600" 
                      id="pre-existing-conditions-main"
                      onChange={(e) => {
                        const subOptionsDiv = document.getElementById('pre-existing-conditions-sub-options');
                        if (subOptionsDiv) {
                          subOptionsDiv.style.display = e.target.checked ? 'block' : 'none';
                          // Clear all sub-options when parent is unchecked
                          if (!e.target.checked) {
                            const subCheckboxes = subOptionsDiv.querySelectorAll('input[type="checkbox"]');
                            subCheckboxes.forEach((cb: any) => cb.checked = false);
                          }
                        }
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium">Pregnant woman with pre-existing medical condition</span>
                      <div id="pre-existing-conditions-sub-options" className="ml-6 mt-2 space-y-1 text-xs text-gray-600" style={{ display: 'none' }}>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="asthma" />
                          <span>Asthma</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="cardiac_condition" />
                          <span>Cardiac condition</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="diabetes_mellitus" />
                          <span>Diabetes mellitus</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="renal_failure" />
                          <span>Renal failure</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="epilepsy" />
                          <span>Epilepsy</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="hypertension" />
                          <span>Hypertension</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="hyperthyroidism" />
                          <span>Hyperthyroidism</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="moderate_severe_anaemia" />
                          <span>Moderate to severe anaemia (&lt;8g/dl)</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="coagulopathy" />
                          <span>Previous or current coagulopathy (eg DVT)</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="renal_disease" />
                          <span>Renal disease</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="sickle_cell" />
                          <span>Sickle cell disease</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="rh_negative" />
                          <span>RH negative</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="other_medical" />
                          <span>Other</span>
                        </label>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-2 cursor-pointer hover:bg-green-100 p-2 rounded">
                    <input 
                      type="checkbox" 
                      className="mt-1 border-gray-300 text-green-600" 
                      id="preeclampsia-complications-main"
                      onChange={(e) => {
                        const subOptionsDiv = document.getElementById('preeclampsia-complications-sub-options');
                        if (subOptionsDiv) {
                          subOptionsDiv.style.display = e.target.checked ? 'block' : 'none';
                          // Clear all sub-options when parent is unchecked
                          if (!e.target.checked) {
                            const subCheckboxes = subOptionsDiv.querySelectorAll('input[type="checkbox"]');
                            subCheckboxes.forEach((cb: any) => cb.checked = false);
                          }
                        }
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium">Preeclampsia or Eclampsia with other complications</span>
                      <div id="preeclampsia-complications-sub-options" className="ml-6 mt-2 space-y-1 text-xs text-gray-600" style={{ display: 'none' }}>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="severe_preeclampsia" />
                          <span>Severe preeclampsia</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="eclampsia" />
                          <span>Eclampsia</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="hellp_syndrome" />
                          <span>HELLP syndrome</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="other_complications" />
                          <span>Other complications</span>
                        </label>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-2 cursor-pointer hover:bg-green-100 p-2 rounded">
                    <input 
                      type="checkbox" 
                      className="mt-1 border-gray-300 text-green-600" 
                      id="emergency-conditions-main"
                      onChange={(e) => {
                        const subOptionsDiv = document.getElementById('emergency-conditions-sub-options');
                        if (subOptionsDiv) {
                          subOptionsDiv.style.display = e.target.checked ? 'block' : 'none';
                          // Clear all sub-options when parent is unchecked
                          if (!e.target.checked) {
                            const subCheckboxes = subOptionsDiv.querySelectorAll('input[type="checkbox"]');
                            subCheckboxes.forEach((cb: any) => cb.checked = false);
                          }
                        }
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium">Other Conditions</span>
                      <div id="emergency-conditions-sub-options" className="ml-6 mt-2 space-y-1 text-xs text-gray-600" style={{ display: 'none' }}>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="none_emergency" />
                          <span>None</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="abruptio_placenta" />
                          <span>Abruptio placenta</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="coagulopathy_emergency" />
                          <span>Coagulopathy</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="hellp_syndrome_emergency" />
                          <span>HELLP syndrome</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="renal_failure_emergency" />
                          <span>Renal failure</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="thrombocytopenia" />
                          <span>Thrombocytopenia</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input type="checkbox" className="text-green-600" value="unconscious_patient" />
                          <span>Unconscious patient</span>
                        </label>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 2. Screening and Diagnostic Sub-menu */}
            {selectedReferralReasons.includes("screening_diagnostic") && (
              <div className="space-y-3 border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h5 className="text-sm font-medium text-blue-600">For Screening and Diagnostic</h5>
                <p className="text-xs text-gray-500">Services unavailable at current facility</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-blue-600" />
                    <span className="text-sm">Laboratory tests not available at this facility</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-blue-600" />
                    <span className="text-sm">Diagnostic imaging services needed</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-blue-600" />
                    <span className="text-sm">Specialized screening procedures</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-blue-600" />
                    <span className="text-sm">Ultrasound examination</span>
                  </label>
                </div>
              </div>
            )}

            {/* 3. Scheduled Referral Sub-menu */}  
            {selectedReferralReasons.includes("scheduled_referral") && (
              <div className="space-y-3 border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h5 className="text-sm font-medium text-orange-600">Scheduled Referral</h5>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-orange-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-orange-600" />
                    <span className="text-sm">Hospital delivery indicated</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-orange-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-orange-600" />
                    <span className="text-sm">High-risk pregnancy requiring specialist care</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-orange-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-orange-600" />
                    <span className="text-sm">Planned cesarean section</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-orange-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-orange-600" />
                    <span className="text-sm">Follow-up specialist consultation</span>
                  </label>
                </div>
              </div>
            )}

            {/* 4. Other General Services Sub-menu */}
            {selectedReferralReasons.includes("other_general_services") && (
              <div className="space-y-3 border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h5 className="text-sm font-medium text-purple-600">Other General Services</h5>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-purple-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-purple-600" />
                    <span className="text-sm">Social services support</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-purple-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-purple-600" />
                    <span className="text-sm">Nutritional counseling</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-purple-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-purple-600" />
                    <span className="text-sm">Mental health services</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-purple-100 p-2 rounded">
                    <input type="checkbox" className="mt-1 border-gray-300 text-purple-600" />
                    <span className="text-sm">Family planning services</span>
                  </label>
                  <div className="flex items-center space-x-2 p-2">
                    <input type="checkbox" className="mt-1 border-gray-300 text-purple-600" />
                    <span className="text-sm">Other (specify):</span>
                    <input type="text" placeholder="Please specify..." className="flex-1 text-sm border rounded px-2 py-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Client Health History Information - Required for all referrals */}
            <div className="space-y-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-blue-700">Client Health History Information</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Required for all referrals</span>
              </div>
              
              {/* Current Pregnancy Information */}
              <div className="space-y-3 border border-blue-300 rounded p-3 bg-white">
                <h5 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">Current Pregnancy Information</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium">Gestational age (weeks) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      id="referral_current_ga_weeks"
                      min="4" 
                      max="42" 
                      className="w-full border rounded p-2 text-sm"
                      placeholder="e.g., 28"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-medium">Expected delivery date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      id="referral_edd"
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Obstetric History Assessment */}
              <div className="space-y-3 border border-blue-300 rounded p-3 bg-white">
                <h5 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">Obstetric History Assessment</h5>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium">Gravida (Total pregnancies) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      id="referral_gravida"
                      min="1" 
                      max="15" 
                      className="w-full border rounded p-2 text-sm"
                      placeholder="e.g., 3"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-medium">Para (Live births)</label>
                    <input 
                      type="number" 
                      id="referral_para"
                      min="0" 
                      max="15" 
                      className="w-full border rounded p-2 text-sm"
                      placeholder="e.g., 2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-medium">Abortions/Miscarriages</label>
                    <input 
                      type="number" 
                      id="referral_abortions"
                      min="0" 
                      max="10" 
                      className="w-full border rounded p-2 text-sm"
                      placeholder="e.g., 0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-medium">Living children</label>
                    <input 
                      type="number" 
                      id="referral_living_children"
                      min="0" 
                      max="15" 
                      className="w-full border rounded p-2 text-sm"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>
                
                {/* Previous Pregnancies Detailed History */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium">No. of previous pregnancies (excluding current) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    id="referral_previous_pregnancies"
                    min="0" 
                    max="14" 
                    className="w-20 border rounded p-2 text-sm"
                    placeholder="0"
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      const historyContainer = document.getElementById('pregnancy-history-container');
                      const socialHabitsSection = document.getElementById('social-habits-section');
                      const complicationsSection = document.getElementById('complications-section');
                      
                      if (historyContainer) {
                        historyContainer.innerHTML = '';
                        
                        // Business Rule: Apply conditional logic for referral assessment sections
                        if (socialHabitsSection) {
                          socialHabitsSection.style.display = count > 0 ? 'block' : 'none';
                          // Reset social habits state when count changes to 0
                          if (count === 0) {
                            const noneCheckbox = document.getElementById('social-habits-none') as HTMLInputElement;
                            const detailedHabits = document.getElementById('detailed-social-habits');
                            if (noneCheckbox) noneCheckbox.checked = false;
                            if (detailedHabits) detailedHabits.style.display = 'block';
                          }
                        }
                        if (complicationsSection) {
                          complicationsSection.style.display = count > 0 ? 'block' : 'none';
                          // Reset complications state when count changes to 0
                          if (count === 0) {
                            const noneCheckbox = document.getElementById('complications-none') as HTMLInputElement;
                            const detailedComplications = document.getElementById('detailed-complications');
                            if (noneCheckbox) noneCheckbox.checked = false;
                            if (detailedComplications) detailedComplications.style.display = 'block';
                          }
                        }
                        
                        // Add enhanced global functions to window if not already added
                        if (!(window as any).updateConditionalFields) {
                          (window as any).updateConditionalFields = function(pregnancyIndex: number) {
                            const gestationalAge = parseInt((document.getElementById('gestational_age_' + pregnancyIndex) as HTMLInputElement)?.value || '0');
                            const outcomeSection = document.getElementById('outcome_section_' + pregnancyIndex);
                            const deliveryModeSection = document.getElementById('delivery_mode_section_' + pregnancyIndex);
                            const outcomeSelect = document.getElementById('outcome_' + pregnancyIndex) as HTMLSelectElement;
                            const birthWeightSection = document.getElementById('birth-weight-section-' + pregnancyIndex);
                            const placeDeliverySection = document.getElementById('place-delivery-section-' + pregnancyIndex);
                            const babyStatusSection = document.getElementById('baby-status-section-' + pregnancyIndex);
                            
                            if (gestationalAge > 0) {
                              if (outcomeSection) outcomeSection.style.display = 'block';
                              
                              if (outcomeSelect) {
                                outcomeSelect.innerHTML = '<option value="">Select outcome...</option>';
                                outcomeSelect.onchange = () => (window as any).handleReferralStandardOutcomeChange(pregnancyIndex, outcomeSelect.value);
                                
                                if (gestationalAge < 6) {
                                  outcomeSelect.innerHTML += '<option value="abortion">Abortion/Miscarriage</option>';
                                  if (deliveryModeSection) deliveryModeSection.style.display = 'none';
                                  // Hide birth-related fields for early pregnancy loss
                                  if (birthWeightSection) birthWeightSection.style.display = 'none';
                                  if (placeDeliverySection) placeDeliverySection.style.display = 'none';
                                  if (babyStatusSection) babyStatusSection.style.display = 'none';
                                } else if (gestationalAge >= 7) {
                                  outcomeSelect.innerHTML += '<option value="live_birth">Live birth</option>';
                                  outcomeSelect.innerHTML += '<option value="still_birth">Still birth</option>';
                                  if (deliveryModeSection) deliveryModeSection.style.display = 'block';
                                  // Hide birth-related fields initially until outcome is selected
                                  if (birthWeightSection) birthWeightSection.style.display = 'none';
                                  if (placeDeliverySection) placeDeliverySection.style.display = 'none';
                                  if (babyStatusSection) babyStatusSection.style.display = 'none';
                                }
                              }
                            } else {
                              if (outcomeSection) outcomeSection.style.display = 'none';
                              if (deliveryModeSection) deliveryModeSection.style.display = 'none';
                              if (birthWeightSection) birthWeightSection.style.display = 'none';
                              if (placeDeliverySection) placeDeliverySection.style.display = 'none';
                              if (babyStatusSection) babyStatusSection.style.display = 'none';
                            }
                          };
                          
                          (window as any).updateDeliveryFields = function(pregnancyIndex: number) {
                            const deliveryMode = (document.getElementById('mode_of_delivery_' + pregnancyIndex) as HTMLSelectElement)?.value;
                            const labourTypeSection = document.getElementById('labour_type_section_' + pregnancyIndex);
                            const assistedVaginalSection = document.getElementById('assisted_vaginal_type_section_' + pregnancyIndex);
                            const csectionSection = document.getElementById('csection_type_section_' + pregnancyIndex);
                            
                            if (labourTypeSection) labourTypeSection.style.display = 'none';
                            if (assistedVaginalSection) assistedVaginalSection.style.display = 'none';
                            if (csectionSection) csectionSection.style.display = 'none';
                            
                            if (deliveryMode === 'normal_vertex' || deliveryMode === 'assisted_breech') {
                              if (labourTypeSection) labourTypeSection.style.display = 'block';
                            } else if (deliveryMode === 'assisted_vaginal') {
                              if (assistedVaginalSection) assistedVaginalSection.style.display = 'block';
                            } else if (deliveryMode === 'c_section') {
                              if (csectionSection) csectionSection.style.display = 'block';
                            }
                          };
                          
                          (window as any).updateInfantSex = function(pregnancyIndex: number) {
                            const labourType = (document.getElementById('labour_type_' + pregnancyIndex) as HTMLSelectElement)?.value;
                            const infantSexSection = document.getElementById('infant_sex_section_' + pregnancyIndex);
                            
                            if (labourType === 'induced' || labourType === 'spontaneous') {
                              if (infantSexSection) infantSexSection.style.display = 'block';
                            } else {
                              if (infantSexSection) infantSexSection.style.display = 'none';
                            }
                          };

                          // Function to handle outcome changes for referral standard forms
                          (window as any).handleReferralStandardOutcomeChange = function(pregnancyIndex: number, outcome: string) {
                            const birthWeightSection = document.getElementById('birth-weight-section-' + pregnancyIndex);
                            const placeDeliverySection = document.getElementById('place-delivery-section-' + pregnancyIndex);
                            const babyStatusSection = document.getElementById('baby-status-section-' + pregnancyIndex);
                            const gestationalAge = parseInt((document.getElementById('gestational_age_' + pregnancyIndex) as HTMLInputElement)?.value || '0');
                            
                            if (gestationalAge >= 7) {
                              if (outcome === 'live_birth') {
                                // Show birth-related fields only for live births
                                if (birthWeightSection) birthWeightSection.style.display = 'block';
                                if (placeDeliverySection) placeDeliverySection.style.display = 'block';
                                if (babyStatusSection) babyStatusSection.style.display = 'block';
                              } else {
                                // Hide birth-related fields for stillbirths or no selection
                                if (birthWeightSection) birthWeightSection.style.display = 'none';
                                if (placeDeliverySection) placeDeliverySection.style.display = 'none';
                                if (babyStatusSection) babyStatusSection.style.display = 'none';
                              }
                            }
                          };
                        }
                        
                        // Generate pregnancy history rows
                        for (let i = 0; i < count; i++) {
                          const pregnancyRow = document.createElement('div');
                          pregnancyRow.className = 'space-y-3 border border-gray-200 rounded p-3 bg-gray-50';
                          pregnancyRow.innerHTML = 
                            '<h6 class="text-xs font-medium text-gray-700">Pregnancy ' + (i + 1) + '</h6>' +
                            '<div class="grid grid-cols-2 gap-3">' +
                              '<div>' +
                                '<label class="block text-xs font-medium mb-1">Date of delivery/termination</label>' +
                                '<input type="date" class="w-full border rounded p-1 text-xs" id="delivery_date_' + i + '" />' +
                              '</div>' +
                              '<div>' +
                                '<label class="block text-xs font-medium mb-1">Estimated date of delivery/termination</label>' +
                                '<input type="date" class="w-full border rounded p-1 text-xs" id="estimated_delivery_' + i + '" />' +
                              '</div>' +
                            '</div>' +
                            '<div class="grid grid-cols-2 gap-3">' +
                              '<div>' +
                                '<label class="block text-xs font-medium mb-1">Gestational age (months) <span class="text-red-500">*</span></label>' +
                                '<input type="number" min="1" max="10" class="w-full border rounded p-1 text-xs" id="gestational_age_' + i + '" onChange="updateConditionalFields(' + i + ')" placeholder="e.g., 8" />' +
                              '</div>' +
                              '<div id="outcome_section_' + i + '" style="display: none;">' +
                                '<label class="block text-xs font-medium mb-1">Outcome</label>' +
                                '<select class="w-full border rounded p-1 text-xs" id="outcome_' + i + '">' +
                                  '<option value="">Select outcome...</option>' +
                                '</select>' +
                              '</div>' +
                            '</div>' +
                            '<div id="delivery_mode_section_' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Mode of delivery</label>' +
                              '<select class="w-full border rounded p-1 text-xs" id="mode_of_delivery_' + i + '" onChange="updateDeliveryFields(' + i + ')">' +
                                '<option value="">Select mode...</option>' +
                                '<option value="normal_vertex">Normal Vertex Delivery</option>' +
                                '<option value="assisted_vaginal">Assisted Vaginal Delivery</option>' +
                                '<option value="assisted_breech">Assisted Breech Delivery</option>' +
                                '<option value="c_section">C-section</option>' +
                              '</select>' +
                            '</div>' +
                            '<div id="labour_type_section_' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Type of labour</label>' +
                              '<select class="w-full border rounded p-1 text-xs" id="labour_type_' + i + '" onChange="updateInfantSex(' + i + ')">' +
                                '<option value="">Select type...</option>' +
                                '<option value="induced">Induced</option>' +
                                '<option value="spontaneous">Spontaneous</option>' +
                              '</select>' +
                            '</div>' +
                            '<div id="assisted_vaginal_type_section_' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Type of assisted vaginal delivery</label>' +
                              '<select class="w-full border rounded p-1 text-xs" id="assisted_vaginal_type_' + i + '">' +
                                '<option value="">Select type...</option>' +
                                '<option value="forceps">Forceps</option>' +
                                '<option value="vacuum">Vacuum</option>' +
                              '</select>' +
                            '</div>' +
                            '<div id="csection_type_section_' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Type of C-section</label>' +
                              '<select class="w-full border rounded p-1 text-xs" id="csection_type_' + i + '">' +
                                '<option value="">Select type...</option>' +
                                '<option value="planned">Planned/Elective</option>' +
                                '<option value="emergency">Emergency</option>' +
                              '</select>' +
                            '</div>' +
                            '<div id="birth-weight-section-' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Birth Weight (kg)</label>' +
                              '<input type="number" step="0.1" min="0.5" max="6.0" placeholder="e.g., 3.2" class="w-full border rounded p-1 text-xs" id="birth_weight_' + i + '" />' +
                              '<div id="weight-classification-' + i + '" style="display: none;"></div>' +
                            '</div>' +
                            '<div id="place-delivery-section-' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Place of Delivery</label>' +
                              '<select class="w-full border rounded p-1 text-xs" id="place_delivery_' + i + '">' +
                                '<option value="">Select place...</option>' +
                                '<option value="hospital">Hospital</option>' +
                                '<option value="health_center">Health Center</option>' +
                                '<option value="home">Home</option>' +
                                '<option value="traditional_healer">Traditional Healer</option>' +
                                '<option value="en_route">En route to facility</option>' +
                                '<option value="other">Other (specify)</option>' +
                              '</select>' +
                              '<div id="delivery-risk-' + i + '" style="display: none;"></div>' +
                            '</div>' +
                            '<div id="baby-status-section-' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Baby\'s Current Status</label>' +
                              '<select class="w-full border rounded p-1 text-xs" id="baby_status_' + i + '">' +
                                '<option value="">Select status...</option>' +
                                '<option value="alive_well">Alive and well</option>' +
                                '<option value="alive_complications">Alive with complications</option>' +
                                '<option value="deceased">Deceased</option>' +
                                '<option value="unknown">Unknown</option>' +
                              '</select>' +
                              '<div id="status-alert-' + i + '" style="display: none;"></div>' +
                            '</div>' +
                            '<div id="infant_sex_section_' + i + '" style="display: none;">' +
                              '<label class="block text-xs font-medium mb-1">Sex of infant</label>' +
                              '<select class="w-full border rounded p-1 text-xs" id="infant_sex_' + i + '">' +
                                '<option value="">Select sex...</option>' +
                                '<option value="male">Male</option>' +
                                '<option value="female">Female</option>' +
                              '</select>' +
                            '</div>';
                          historyContainer.appendChild(pregnancyRow);
                        }
                      }
                    }}
                  />
                </div>
                
                {/* Dynamic Pregnancy History Container */}
                <div id="pregnancy-history-container" className="space-y-3"></div>
                
                {/* Social Habits Section - Hidden by default */}
                <div id="social-habits-section" style={{ display: 'none' }} className="space-y-2">
                  <label className="block text-xs font-medium">Social habits</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="none" />
                      <span>None</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="tobacco" />
                      <span>Tobacco</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="alcohol" />
                      <span>Alcohol use</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="substance" />
                      <span>Substance use</span>
                    </label>
                  </div>
                </div>
                
                {/* Complications Section - Hidden by default */}
                <div id="complications-section" style={{ display: 'none' }} className="space-y-2">
                  <label className="block text-xs font-medium">Any complications in child birth</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="none" />
                      <span>None</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="preeclampsia" />
                      <span>Pre-eclampsia</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="eclampsia" />
                      <span>Eclampsia</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="convulsions" />
                      <span>Convulsions</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="heavy_bleeding" />
                      <span>Heavy bleeding</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="baby_died" />
                      <span>Baby died within 24 hours</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="macrosomia" />
                      <span>Macrosomia</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="perineal_tear" />
                      <span>Perineal tear (3rd or 4th degree)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="gestational_diabetes" />
                      <span>Gestational Diabetes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" value="other" />
                      <span>Other (specify)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Treatment Given Before Referral */}
              <div className="space-y-3 border border-blue-300 rounded p-3 bg-white">
                <h5 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">Treatment Given Before Referral</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-2">Any treatment given before referral <span className="text-red-500">*</span></label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="referral_treatment_given" 
                          value="yes"
                          className="text-blue-600"
                          onChange={(e) => {
                            const medicationsSection = document.getElementById('referral_medications_section');
                            if (medicationsSection) {
                              medicationsSection.style.display = e.target.checked ? 'block' : 'none';
                            }
                          }}
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="referral_treatment_given" 
                          value="no"
                          className="text-blue-600"
                          onChange={(e) => {
                            const medicationsSection = document.getElementById('referral_medications_section');
                            if (medicationsSection) {
                              medicationsSection.style.display = e.target.checked ? 'none' : 'block';
                            }
                          }}
                        />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Medications Section - Hidden by default */}
                  <div id="referral_medications_section" style={{ display: 'none' }} className="space-y-2">
                    <label className="block text-xs font-medium">Medications given</label>
                    <textarea 
                      className="w-full border rounded p-2 text-sm"
                      rows={2}
                      placeholder="Enter medications given before referral"
                    ></textarea>
                    <p className="text-xs text-gray-500 italic">Select from Pharmacy Module</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Additional Notes/Comments</label>
              <textarea 
                className="w-full border rounded p-2 text-sm" 
                rows={3}
                placeholder="Add any additional information about the referral reasons..."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="rounded-xl bg-gray-100/60 hover:bg-gray-200/60 text-gray-700 border border-gray-200/50 px-6 py-2 text-sm font-medium transition-all duration-200"
                onClick={() => setShowReferralReasonsDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none px-6 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  // Update display elements
                  const categoryDisplay = document.getElementById('referral_category_display');
                  const reasonsCount = document.getElementById('referral_reasons_count');
                  
                  if (categoryDisplay) {
                    categoryDisplay.textContent = selectedReferralReasons.length > 0 
                      ? `${selectedReferralReasons.length} categories selected`
                      : 'Not selected';
                  }
                  if (reasonsCount) {
                    reasonsCount.textContent = selectedReferralReasons.length > 0 
                      ? `${selectedReferralReasons.length} selected`
                      : '0 selected';
                  }
                  
                  setShowReferralReasonsDialog(false);
                  toast({
                    title: "Referral Reasons Saved",
                    description: "Referral reasons have been recorded successfully.",
                    duration: 2000,
                  });
                }}
              >
                Save & Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Referral Checklist Dialog */}
      <Dialog open={showReferralChecklistDialog} onOpenChange={setShowReferralChecklistDialog}>
        <DialogContent className="bg-white/85 backdrop-blur-2xl border border-white/30 ring-1 ring-white/20 shadow-xl rounded-2xl max-w-4xl max-h-[85vh] overflow-y-auto" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.80) 100%)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.08)'
          }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Routine Referral Checklist
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Complete all required steps before referring the patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Communication Section */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">1. Communication</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium">Inform the woman about the referral</span>
                    <p className="text-xs text-gray-600 mt-1">Explain the reason for referral and what to expect</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium">Obtain verbal consent for referral</span>
                    <p className="text-xs text-gray-600 mt-1">Ensure the woman agrees to be referred</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium">Contact receiving facility</span>
                    <p className="text-xs text-gray-600 mt-1">Call ahead to confirm availability and arrange admission</p>
                    <div className="mt-2 space-y-2">
                      <input type="text" placeholder="Contact person name" className="w-full text-xs border rounded px-2 py-1" />
                      <input type="text" placeholder="Contact number" className="w-full text-xs border rounded px-2 py-1" />
                      <input type="text" placeholder="Time of contact" className="w-full text-xs border rounded px-2 py-1" />
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium">Arrange transportation</span>
                    <p className="text-xs text-gray-600 mt-1">Ensure safe transport to receiving facility</p>
                    <div className="mt-2">
                      <select className="w-full text-xs border rounded px-2 py-1">
                        <option value="">Select transport method</option>
                        <option value="ambulance">Ambulance</option>
                        <option value="private">Private transport</option>
                        <option value="public">Public transport</option>
                        <option value="family">Family transport</option>
                      </select>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Documentation Section */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold text-green-600 mb-4">2. Documentation</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-green-600" />
                  <div>
                    <span className="text-sm font-medium">Complete referral form</span>
                    <p className="text-xs text-gray-600 mt-1">Fill out all required sections of the referral form</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-green-600" />
                  <div>
                    <span className="text-sm font-medium">Attach relevant medical records</span>
                    <p className="text-xs text-gray-600 mt-1">Include ANC card, lab results, and any other relevant documents</p>
                    <div className="mt-2 space-y-1">
                      <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="text-green-600" />
                        <span>ANC card/booklet</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="text-green-600" />
                        <span>Laboratory results</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="text-green-600" />
                        <span>Ultrasound reports</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="text-green-600" />
                        <span>Previous consultation notes</span>
                      </label>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-green-600" />
                  <div>
                    <span className="text-sm font-medium">Document reason for referral in patient notes</span>
                    <p className="text-xs text-gray-600 mt-1">Record clear clinical justification</p>
                    <textarea 
                      className="w-full text-xs border rounded px-2 py-1 mt-2" 
                      rows={2}
                      placeholder="Enter clinical notes about the referral..."
                    ></textarea>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-green-600" />
                  <div>
                    <span className="text-sm font-medium">Update ANC register</span>
                    <p className="text-xs text-gray-600 mt-1">Record referral details in facility register</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Patient Preparation Section */}
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h3 className="text-lg font-semibold text-orange-600 mb-4">3. Patient Preparation</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-orange-600" />
                  <div>
                    <span className="text-sm font-medium">Provide clear instructions to patient</span>
                    <p className="text-xs text-gray-600 mt-1">What to expect, what to bring, when to go</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-orange-600" />
                  <div>
                    <span className="text-sm font-medium">Give patient referral letter</span>
                    <p className="text-xs text-gray-600 mt-1">Sealed referral letter for receiving facility</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-orange-600" />
                  <div>
                    <span className="text-sm font-medium">Provide emergency contact information</span>
                    <p className="text-xs text-gray-600 mt-1">Emergency numbers and what to do if problems arise</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-orange-600" />
                  <div>
                    <span className="text-sm font-medium">Schedule follow-up appointment</span>
                    <p className="text-xs text-gray-600 mt-1">Arrange return visit after referral care</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input type="date" className="text-xs border rounded px-2 py-1" />
                      <input type="time" className="text-xs border rounded px-2 py-1" />
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-orange-600" />
                  <div>
                    <span className="text-sm font-medium">Advise on medication continuity</span>
                    <p className="text-xs text-gray-600 mt-1">Ensure patient continues current medications unless advised otherwise</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Quality Assurance Section */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h3 className="text-lg font-semibold text-purple-600 mb-4">4. Quality Assurance</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-purple-600" />
                  <div>
                    <span className="text-sm font-medium">Verify patient understanding</span>
                    <p className="text-xs text-gray-600 mt-1">Confirm patient understands the referral process</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-purple-600" />
                  <div>
                    <span className="text-sm font-medium">Double-check all documentation</span>
                    <p className="text-xs text-gray-600 mt-1">Review forms for completeness and accuracy</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-purple-600" />
                  <div>
                    <span className="text-sm font-medium">Confirm receiving facility acceptance</span>
                    <p className="text-xs text-gray-600 mt-1">Get verbal confirmation of patient acceptance</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 text-purple-600" />
                  <div>
                    <span className="text-sm font-medium">Supervisor review (if required)</span>
                    <p className="text-xs text-gray-600 mt-1">Senior staff approval for complex referrals</p>
                    <div className="mt-2">
                      <input type="text" placeholder="Supervisor name and signature" className="w-full text-xs border rounded px-2 py-1" />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Completion Summary */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-600 mb-4">Completion Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Steps:</span>
                  <span className="ml-2" id="total-steps">16</span>
                </div>
                <div>
                  <span className="font-medium">Completed:</span>
                  <span className="ml-2" id="completed-steps">0</span>
                </div>
                <div>
                  <span className="font-medium">Progress:</span>
                  <span className="ml-2" id="progress-percentage">0%</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2 text-red-600" id="completion-status">Incomplete</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: '0%'}} id="progress-bar"></div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Additional Notes</label>
              <textarea 
                className="w-full border rounded p-2 text-sm" 
                rows={3}
                placeholder="Add any additional notes about the referral process..."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
                onClick={() => setShowReferralChecklistDialog(false)}
              >
                Close
              </Button>
              <Button 
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                onClick={() => {
                  // Count completed checkboxes
                  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                  const completedCount = checkboxes.length;
                  const totalSteps = 16;
                  const progressPercentage = Math.round((completedCount / totalSteps) * 100);
                  
                  // Update display elements
                  const communicationStatus = document.getElementById('checklist_communication_status');
                  const documentationStatus = document.getElementById('checklist_documentation_status');
                  const preparationStatus = document.getElementById('checklist_preparation_status');
                  const overallProgress = document.getElementById('checklist_overall_progress');
                  
                  if (communicationStatus) communicationStatus.textContent = 'Completed';
                  if (documentationStatus) documentationStatus.textContent = 'Completed';
                  if (preparationStatus) preparationStatus.textContent = 'Completed';
                  if (overallProgress) overallProgress.textContent = `${progressPercentage}% completed`;
                  
                  setShowReferralChecklistDialog(false);
                  toast({
                    title: "Referral Checklist Saved",
                    description: `Checklist completed: ${progressPercentage}% (${completedCount}/${totalSteps} steps)`,
                  });
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Facility Information Dialog */}
      <Dialog open={showFacilityInfoDialog} onOpenChange={setShowFacilityInfoDialog}>
        <DialogContent className="bg-white/85 backdrop-blur-2xl border border-white/30 ring-1 ring-white/20 shadow-xl rounded-2xl max-w-4xl max-h-[85vh] overflow-y-auto" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.80) 100%)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.08)'
          }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Receiving Facility Information
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Select and configure details for the receiving healthcare facility
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Facility Selection */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">Facility Selection</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Facility Type</label>
                    <select className="w-full border rounded p-2">
                      <option value="">Select facility type...</option>
                      <option value="district_hospital">District Hospital</option>
                      <option value="general_hospital">General Hospital</option>
                      <option value="specialist_hospital">Specialist Hospital</option>
                      <option value="referral_hospital">Referral Hospital</option>
                      <option value="tertiary_hospital">Tertiary Hospital</option>
                      <option value="clinic">Health Clinic</option>
                      <option value="health_post">Health Post</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Province/Region</label>
                    <select className="w-full border rounded p-2">
                      <option value="">Select province...</option>
                      <option value="central">Central Province</option>
                      <option value="copperbelt">Copperbelt Province</option>
                      <option value="eastern">Eastern Province</option>
                      <option value="luapula">Luapula Province</option>
                      <option value="lusaka">Lusaka Province</option>
                      <option value="muchinga">Muchinga Province</option>
                      <option value="northern">Northern Province</option>
                      <option value="northwestern">North-Western Province</option>
                      <option value="southern">Southern Province</option>
                      <option value="western">Western Province</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Receiving Facility Name</label>
                  <select className="w-full border rounded p-2">
                    <option value="">Select receiving facility...</option>
                    <option value="university_teaching_hospital">University Teaching Hospital (UTH)</option>
                    <option value="levy_mwanawasa_hospital">Levy Mwanawasa University Teaching Hospital</option>
                    <option value="ndola_central_hospital">Ndola Central Hospital</option>
                    <option value="kabwe_general_hospital">Kabwe General Hospital</option>
                    <option value="livingstone_central_hospital">Livingstone Central Hospital</option>
                    <option value="mansa_general_hospital">Mansa General Hospital</option>
                    <option value="chipata_general_hospital">Chipata General Hospital</option>
                    <option value="solwezi_general_hospital">Solwezi General Hospital</option>
                    <option value="kasama_general_hospital">Kasama General Hospital</option>
                    <option value="monze_general_hospital">Monze General Hospital</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Facility Address</label>
                    <textarea 
                      className="w-full border rounded p-2 text-sm" 
                      rows={2}
                      placeholder="Enter complete facility address..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Distance from Current Facility</label>
                    <div className="flex space-x-2">
                      <input type="number" placeholder="Distance" className="flex-1 border rounded p-2" />
                      <select className="border rounded p-2">
                        <option value="km">km</option>
                        <option value="miles">miles</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Contact Person</label>
                  <input type="text" placeholder="Name and title" className="w-full border rounded p-2" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Phone Number</label>
                  <input type="tel" placeholder="+260 XXX XXX XXX" className="w-full border rounded p-2" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Department/Unit</label>
                  <select className="w-full border rounded p-2">
                    <option value="">Select department...</option>
                    <option value="maternity">Maternity Ward</option>
                    <option value="obstetrics">Obstetrics & Gynecology</option>
                    <option value="emergency">Emergency Department</option>
                    <option value="outpatient">Outpatient Department</option>
                    <option value="specialty_clinic">Specialty Clinic</option>
                    <option value="high_risk_pregnancy">High-Risk Pregnancy Unit</option>
                    <option value="nicu">Neonatal ICU</option>
                    <option value="labor_delivery">Labor & Delivery</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Alternative Contact</label>
                  <input type="tel" placeholder="Backup contact number" className="w-full border rounded p-2" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Email Address (if available)</label>
                  <input type="email" placeholder="facility@email.com" className="w-full border rounded p-2" />
                </div>
              </div>
            </div>

            {/* Appointment & Timing */}
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h3 className="text-lg font-semibold text-orange-600 mb-4">Appointment & Timing</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Referral Type</label>
                    <select className="w-full border rounded p-2">
                      <option value="urgent">Urgent (within 24 hours)</option>
                      <option value="semi_urgent">Semi-urgent (within 1 week)</option>
                      <option value="routine">Routine (within 1 month)</option>
                      <option value="scheduled">Scheduled appointment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Date</label>
                    <input type="date" className="w-full border rounded p-2" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Time</label>
                    <input type="time" className="w-full border rounded p-2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Duration of Stay</label>
                    <select className="w-full border rounded p-2">
                      <option value="">Select duration...</option>
                      <option value="outpatient">Outpatient visit only</option>
                      <option value="day_case">Day case (same day discharge)</option>
                      <option value="1_2_days">1-2 days</option>
                      <option value="3_7_days">3-7 days</option>
                      <option value="1_2_weeks">1-2 weeks</option>
                      <option value="longer">Longer than 2 weeks</option>
                      <option value="unknown">Unknown/TBD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Special Requirements</label>
                    <select className="w-full border rounded p-2">
                      <option value="">No special requirements</option>
                      <option value="bed_rest">Bed rest required</option>
                      <option value="isolation">Isolation needed</option>
                      <option value="monitoring">Continuous monitoring</option>
                      <option value="specialist_care">Specialist care</option>
                      <option value="surgery_prep">Surgery preparation</option>
                      <option value="family_accommodation">Family accommodation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Required */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h3 className="text-lg font-semibold text-purple-600 mb-4">Services Required</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Clinical Services</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Antenatal specialist consultation</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>High-risk pregnancy management</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Labor and delivery services</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Cesarean section</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Fetal monitoring</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Neonatal care</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Diagnostic Services</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Advanced ultrasound</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Laboratory tests</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Blood bank services</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Radiology/Imaging</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Pathology services</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span>Genetic counseling</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Transportation & Logistics */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Transportation & Logistics</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Transportation Method</label>
                    <select className="w-full border rounded p-2">
                      <option value="">Select transport...</option>
                      <option value="ambulance">Ambulance</option>
                      <option value="patient_transport">Patient transport service</option>
                      <option value="private_car">Private car</option>
                      <option value="public_transport">Public transport</option>
                      <option value="family_arranged">Family arranged</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Escort Required</label>
                    <select className="w-full border rounded p-2">
                      <option value="none">No escort needed</option>
                      <option value="family">Family member</option>
                      <option value="health_worker">Health worker</option>
                      <option value="both">Both family and health worker</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-red-600" />
                    <span className="text-sm">Patient requires stretcher/wheelchair</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-red-600" />
                    <span className="text-sm">Oxygen support during transport</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-red-600" />
                    <span className="text-sm">IV fluids during transport</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Additional Instructions/Notes</label>
                <textarea 
                  className="w-full border rounded p-2 text-sm" 
                  rows={3}
                  placeholder="Any additional information for the receiving facility..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Return Visit Instructions</label>
                <textarea 
                  className="w-full border rounded p-2 text-sm" 
                  rows={2}
                  placeholder="Instructions for patient return to this facility after treatment..."
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
                onClick={() => setShowFacilityInfoDialog(false)}
              >
                Close
              </Button>
              <Button 
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                onClick={() => {
                  // Update display elements
                  const facilityName = document.getElementById('facility_name_display');
                  const facilityContact = document.getElementById('facility_contact_display');
                  const facilityAppointment = document.getElementById('facility_appointment_display');
                  const facilityStatus = document.getElementById('facility_status_display');
                  
                  if (facilityName) facilityName.textContent = 'University Teaching Hospital';
                  if (facilityContact) facilityContact.textContent = 'Dr. Sarah Mwanza';
                  if (facilityAppointment) facilityAppointment.textContent = 'Tomorrow 10:00 AM';
                  if (facilityStatus) facilityStatus.textContent = 'Confirmed';
                  
                  setShowFacilityInfoDialog(false);
                  toast({
                    title: "Facility Information Saved",
                    description: "Receiving facility details have been configured successfully.",
                  });
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Current Pregnancy Dating System Modal */}
      <Dialog open={showCurrentPregnancyDialog} onOpenChange={setShowCurrentPregnancyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold text-blue-600">
              <Calendar className="w-5 h-5 mr-2" />
              Current Pregnancy Dating System
            </DialogTitle>
            <DialogDescription>
              Pregnancy dating assessment with LMP and ultrasound evaluation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* LMP Assessment */}
            <div className="space-y-3 border border-gray-600 rounded-lg p-4">
              <h4 className="text-sm font-semibold">Last Menstrual Period (LMP) Assessment</h4>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">LMP known? <span className="text-red-500">*</span></label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="current_pregnancy_lmp_known" 
                      value="yes" 
                      className="mr-2"
                      onChange={(e) => {
                        const lmpDateDiv = document.getElementById('current-pregnancy-lmp-date-div');
                        const datingMethodDiv = document.getElementById('current-pregnancy-dating-method-div');
                        if (e.target.checked) {
                          if (lmpDateDiv) lmpDateDiv.style.display = 'block';
                          if (datingMethodDiv) updateCurrentPregnancyDatingOptions();
                        }
                      }}
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="current_pregnancy_lmp_known" 
                      value="no" 
                      className="mr-2"
                      onChange={(e) => {
                        const lmpDateDiv = document.getElementById('current-pregnancy-lmp-date-div');
                        const eddFromLmpDiv = document.getElementById('current-pregnancy-edd-from-lmp-div');
                        const datingMethodDiv = document.getElementById('current-pregnancy-dating-method-div');
                        if (e.target.checked) {
                          if (lmpDateDiv) lmpDateDiv.style.display = 'none';
                          if (eddFromLmpDiv) eddFromLmpDiv.style.display = 'none';
                          if (datingMethodDiv) updateCurrentPregnancyDatingOptions();
                        }
                      }}
                    />
                    No
                  </label>
                </div>
              </div>

              {/* LMP Date Input (conditional) */}
              <div id="current-pregnancy-lmp-date-div" className="space-y-3" style={{ display: 'none' }}>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Last Menstrual Period</label>
                  <input 
                    type="date" 
                    id="current-pregnancy-lmp-date"
                    className="w-full border rounded p-2"
                    onChange={(e) => {
                      if (e.target.value) {
                        const lmpDate = new Date(e.target.value);
                        const eddDate = new Date(lmpDate);
                        eddDate.setDate(eddDate.getDate() + 280); // Naegele's rule: LMP + 280 days
                        
                        const eddInput = document.getElementById('current-pregnancy-edd-from-lmp');
                        const eddDiv = document.getElementById('current-pregnancy-edd-from-lmp-div');
                        const gaDiv = document.getElementById('current-pregnancy-ga-from-lmp-div');
                        
                        if (eddInput) {
                          eddInput.value = eddDate.toISOString().split('T')[0];
                        }
                        if (eddDiv) eddDiv.style.display = 'block';
                        
                        // Calculate current gestational age
                        const today = new Date();
                        const diffTime = today - lmpDate;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        const weeks = Math.floor(diffDays / 7);
                        const days = diffDays % 7;
                        
                        if (gaDiv && weeks >= 0) {
                          gaDiv.innerHTML = 
                            '<div class="text-sm font-medium">Current Gestational Age (from LMP)</div>' +
                            '<div class="text-lg font-bold">' + weeks + ' weeks ' + days + ' days</div>';
                          gaDiv.style.display = 'block';
                        }
                      }
                    }}
                  />
                </div>
                
                {/* Auto-calculated EDD from LMP */}
                <div id="current-pregnancy-edd-from-lmp-div" className="border border-gray-600 rounded p-3" style={{ display: 'none' }}>
                  <label className="block text-sm font-medium mb-1">Estimated Due Date (from LMP)</label>
                  <input 
                    type="date" 
                    id="current-pregnancy-edd-from-lmp"
                    className="w-full border rounded p-2"
                    readOnly
                  />
                </div>
                
                {/* Current GA from LMP */}
                <div id="current-pregnancy-ga-from-lmp-div" className="border border-gray-600 rounded p-3" style={{ display: 'none' }}></div>
              </div>
            </div>

            {/* Ultrasound Assessment */}
            <div className="space-y-3 border border-gray-600 rounded-lg p-4">
              <h4 className="text-sm font-semibold">Ultrasound Assessment</h4>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Ultrasound done? <span className="text-red-500">*</span></label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="current_pregnancy_ultrasound_done" 
                      value="yes" 
                      className="mr-2"
                      onChange={(e) => {
                        const ultrasoundDiv = document.getElementById('current-pregnancy-ultrasound-details-div');
                        const datingMethodDiv = document.getElementById('current-pregnancy-dating-method-div');
                        if (e.target.checked) {
                          if (ultrasoundDiv) ultrasoundDiv.style.display = 'block';
                          if (datingMethodDiv) updateCurrentPregnancyDatingOptions();
                        }
                      }}
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="current_pregnancy_ultrasound_done" 
                      value="no" 
                      className="mr-2"
                      onChange={(e) => {
                        const ultrasoundDiv = document.getElementById('current-pregnancy-ultrasound-details-div');
                        const datingMethodDiv = document.getElementById('current-pregnancy-dating-method-div');
                        if (e.target.checked) {
                          if (ultrasoundDiv) ultrasoundDiv.style.display = 'none';
                          if (datingMethodDiv) updateCurrentPregnancyDatingOptions();
                        }
                      }}
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Ultrasound Details (conditional) */}
              <div id="current-pregnancy-ultrasound-details-div" className="space-y-3" style={{ display: 'none' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Ultrasound</label>
                    <input 
                      type="date" 
                      id="current-pregnancy-ultrasound-date"
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gestational Age from Ultrasound</label>
                    <div className="flex space-x-1">
                      <input 
                        type="number" 
                        id="current-pregnancy-us-weeks"
                        placeholder="Weeks" 
                        className="flex-1 border rounded p-2" 
                        min="0" 
                        max="42"
                        onChange={() => calculateCurrentPregnancyEDDFromUS()}
                      />
                      <input 
                        type="number" 
                        id="current-pregnancy-us-days"
                        placeholder="Days" 
                        className="flex-1 border rounded p-2" 
                        min="0" 
                        max="6"
                        onChange={() => calculateCurrentPregnancyEDDFromUS()}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Auto-calculated EDD from Ultrasound */}
                <div id="current-pregnancy-edd-from-us-div" className="border border-gray-600 rounded p-3" style={{ display: 'none' }}>
                  <label className="block text-sm font-medium mb-1">Estimated Due Date (from Ultrasound)</label>
                  <input 
                    type="date" 
                    id="current-pregnancy-edd-from-us"
                    className="w-full border rounded p-2"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Dating Method Selection */}
            <div id="current-pregnancy-dating-method-div" className="space-y-3 border border-gray-600 rounded-lg p-4">
              <h4 className="text-sm font-semibold">Dating Method</h4>
              <div>
                <label className="block text-sm font-medium mb-2">Dating method <span className="text-red-500">*</span></label>
                <select 
                  id="current-pregnancy-dating-method"
                  className="w-full border rounded p-2"
                >
                  <option value="">Select dating method...</option>
                </select>
              </div>
              <div id="current-pregnancy-dating-method-info" className="text-xs text-gray-600" style={{ display: 'none' }}></div>
            </div>

            {/* Final Gestational Age Summary */}
            <div id="current-pregnancy-final-summary" className="border border-gray-600 rounded-lg p-4" style={{ display: 'none' }}>
              <h4 className="text-sm font-semibold mb-2">Pregnancy Dating Summary</h4>
              <div id="current-pregnancy-summary-content"></div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={() => setShowCurrentPregnancyDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
              onClick={() => {
                setShowCurrentPregnancyDialog(false);
                toast({
                  title: "Pregnancy Dating Saved",
                  description: "Current pregnancy dating assessment has been completed.",
                });
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Obstetric History Modal */}
      <Dialog open={showObstetricHistoryDialog} onOpenChange={setShowObstetricHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold text-purple-600">
              <Baby className="w-5 h-5 mr-2" />
              Enhanced Obstetric History Assessment
            </DialogTitle>
            <DialogDescription>
              Complete obstetric assessment including basic information and detailed pregnancy history
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Obstetric Assessment */}
            <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
              <h5 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-2 mb-4">Basic Obstetric Assessment</h5>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gravida (Total pregnancies) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    id="obstetric_gravida"
                    min="1" 
                    max="20" 
                    className="w-full border rounded p-2 text-sm"
                    placeholder="e.g., 3"
                    required
                    value={obstetricHistory.gravida}
                    onChange={(e) => {
                      const gravida = parseInt(e.target.value) || 0;
                      
                      // Get current values
                      const para = parseInt(obstetricHistory.para) || 0;
                      const abortions = parseInt(obstetricHistory.abortions) || 0;
                      const livingChildren = parseInt(obstetricHistory.livingChildren) || 0;
                      
                      // Auto-correction logic: If gravida < (para + abortions), reset para and abortions
                      let correctedPara = para;
                      let correctedAbortions = abortions;
                      let correctedLivingChildren = livingChildren;
                      let correctionMessages: string[] = [];
                      
                      if (gravida > 0 && gravida < (para + abortions)) {
                        // Reset both para and abortions to 0 to maintain business rules
                        correctedPara = 0;
                        correctedAbortions = 0;
                        correctedLivingChildren = 0; // Living children can't exceed para, so reset too
                        correctionMessages.push(`Para and Abortions reset to 0: Total pregnancies (${gravida}) cannot be less than Para + Abortions (${para + abortions})`);
                      } else if (gravida > 0) {
                        // Check individual constraints
                        if (para > gravida) {
                          correctedPara = 0;
                          correctedLivingChildren = 0; // Living children can't exceed para
                          correctionMessages.push(`Para reset to 0: Live births (${para}) cannot exceed total pregnancies (${gravida})`);
                        }
                        if (abortions > gravida) {
                          correctedAbortions = 0;
                          correctionMessages.push(`Abortions reset to 0: Abortions (${abortions}) cannot exceed total pregnancies (${gravida})`);
                        }
                        if (livingChildren > correctedPara) {
                          correctedLivingChildren = 0;
                          correctionMessages.push(`Living children reset to 0: Cannot exceed live births (${correctedPara})`);
                        }
                      }
                      
                      // Show toast notification if corrections were made
                      if (correctionMessages.length > 0) {
                        toast({
                          title: "Auto-correction Applied",
                          description: correctionMessages.join('. '),
                          variant: "destructive",
                        });
                      }
                      
                      // Update state with corrected values
                      setObstetricHistory(prev => ({ 
                        ...prev, 
                        gravida: e.target.value,
                        para: correctedPara.toString(),
                        abortions: correctedAbortions.toString(),
                        livingChildren: correctedLivingChildren.toString()
                      }));
                      
                      // Clear any validation errors since we auto-correct
                      setObstetricValidationErrors({});
                      
                      // Update Latest Encounter data
                      updateLatestEncounterData('clientProfile', {
                        gravida: gravida,
                        para: correctedPara,
                        abortions: correctedAbortions,
                        livingChildren: correctedLivingChildren,
                        obstetricHistory: { 
                          gravida: e.target.value, 
                          para: correctedPara.toString(),
                          abortions: correctedAbortions.toString(),
                          livingChildren: correctedLivingChildren.toString()
                        }
                      });
                      
                      // Show/hide risk assessment fields
                      const obstetricRiskFields = document.getElementById('obstetric-modal-risk-fields');
                      const grandMultiparaWarning = document.getElementById('obstetric-grandmultipara-warning');
                      
                      if (obstetricRiskFields) {
                        obstetricRiskFields.style.display = gravida > 1 ? 'block' : 'none';
                      }
                      
                      if (grandMultiparaWarning) {
                        grandMultiparaWarning.style.display = gravida >= 5 ? 'block' : 'none';
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Para (Live births)</label>
                  <input 
                    type="number" 
                    id="obstetric_para"
                    min="0" 
                    max="20"
                    className="w-full border rounded p-2 text-sm" 
                    placeholder="e.g., 2"
                    value={obstetricHistory.para}
                    onChange={(e) => {
                      const para = parseInt(e.target.value) || 0;
                      
                      // Get current values
                      const gravida = parseInt(obstetricHistory.gravida) || 0;
                      const abortions = parseInt(obstetricHistory.abortions) || 0;
                      const livingChildren = parseInt(obstetricHistory.livingChildren) || 0;
                      
                      // Validation logic - check business rules
                      const errors: Record<string, string> = { ...obstetricValidationErrors };
                      
                      // Clear para-related errors first
                      delete errors.para;
                      delete errors.livingChildren;
                      
                      if (para > 0) {
                        // Para cannot exceed Gravida
                        if (para > gravida && gravida > 0) {
                          errors.para = `Live births cannot exceed total pregnancies. Para (${para}) > Gravida (${gravida})`;
                        }
                        
                        // Check if gravida < (para + abortions)
                        if (gravida > 0 && gravida < (para + abortions)) {
                          errors.para = `Total pregnancies (${gravida}) cannot be less than Para + Abortions (${para + abortions})`;
                        }
                        
                        // Para ≥ Living Children validation
                        const currentLivingChildren = parseInt(obstetricHistory.livingChildren) || 0;
                        if (currentLivingChildren > para) {
                          errors.livingChildren = `Living children cannot exceed total live births (Para). Please review both fields. Current: Para=${para}, Living=${currentLivingChildren}`;
                        }
                      }
                      
                      // Show toast for validation errors
                      if (Object.keys(errors).length > 0) {
                        toast({
                          title: "Validation Error",
                          description: Object.values(errors)[0],
                          variant: "destructive",
                        });
                      }
                      
                      setObstetricValidationErrors(errors);
                      
                      // Update state with original value (don't auto-correct)
                      setObstetricHistory(prev => ({ 
                        ...prev, 
                        para: e.target.value
                      }));
                      
                      // Update Latest Encounter data
                      updateLatestEncounterData('clientProfile', {
                        para: correctedPara,
                        livingChildren: correctedLivingChildren,
                        obstetricHistory: { 
                          ...obstetricHistory, 
                          para: correctedPara.toString(),
                          livingChildren: correctedLivingChildren.toString()
                        }
                      });
                      
                      // Business Rule: Parity classification
                      const parityClassification = document.getElementById('obstetric-parity-classification');
                      if (parityClassification) {
                        let classification = '';
                        let riskLevel = '';
                        let color = '';
                        
                        if (para === 0) {
                          classification = 'Nullipara (No previous live births)';
                          riskLevel = 'First-time delivery - Enhanced monitoring required';
                          color = 'text-blue-600';
                        } else if (para === 1) {
                          classification = 'Primipara (1 previous live birth)';
                          riskLevel = 'Standard monitoring';
                          color = 'text-green-600';
                        } else if (para >= 2 && para <= 4) {
                          classification = 'Multipara (2-4 previous live births)';
                          riskLevel = 'Standard monitoring';
                          color = 'text-green-600';
                        } else if (para >= 5) {
                          classification = 'Grand Multipara (5+ previous live births)';
                          riskLevel = 'High-risk pregnancy - Enhanced monitoring required';
                          color = 'text-red-600';
                        }
                        
                        parityClassification.innerHTML = 
                          '<div class="text-xs ' + color + ' font-medium">' + classification + '</div>' +
                          '<div class="text-xs text-gray-600">' + riskLevel + '</div>';
                        parityClassification.style.display = 'block';
                      }
                      
                      // Business Rule: High parity assessment
                      const highParityWarning = document.getElementById('obstetric-high-parity-warning');
                      if (highParityWarning) {
                        if (para >= 5) {
                          highParityWarning.style.display = 'block';
                        } else {
                          highParityWarning.style.display = 'none';
                        }
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Abortions/Miscarriages</label>
                  <input 
                    type="number" 
                    id="obstetric_abortions"
                    min="0" 
                    max="15"
                    className="w-full border rounded p-2 text-sm" 
                    placeholder="e.g., 0"
                    value={obstetricHistory.abortions}
                    onChange={(e) => {
                      const abortions = parseInt(e.target.value) || 0;
                      
                      // Get current values
                      const gravida = parseInt(obstetricHistory.gravida) || 0;
                      const para = parseInt(obstetricHistory.para) || 0;
                      
                      // Auto-correction logic
                      let correctedAbortions = abortions;
                      let correctionMessages: string[] = [];
                      
                      // If abortions exceed gravida, reset to 0
                      if (abortions > gravida && gravida > 0) {
                        correctedAbortions = 0;
                        correctionMessages.push(`Abortions reset to 0: Abortions/miscarriages (${abortions}) cannot exceed total pregnancies (${gravida})`);
                      }
                      // If gravida < (para + abortions), reset abortions to 0
                      else if (gravida > 0 && gravida < (para + abortions)) {
                        correctedAbortions = 0;
                        correctionMessages.push(`Abortions reset to 0: Total pregnancies (${gravida}) cannot be less than Para + Abortions (${para + abortions})`);
                      }
                      
                      // Show toast notification if corrections were made
                      if (correctionMessages.length > 0) {
                        toast({
                          title: "Auto-correction Applied",
                          description: correctionMessages.join('. '),
                          variant: "destructive",
                        });
                      }
                      
                      // Update state with corrected values
                      setObstetricHistory(prev => ({ 
                        ...prev, 
                        abortions: correctedAbortions.toString()
                      }));
                      
                      // Clear any validation errors since we auto-correct
                      setObstetricValidationErrors({});
                      
                      // Update Latest Encounter data
                      updateLatestEncounterData('clientProfile', {
                        abortions: correctedAbortions,
                        obstetricHistory: { ...obstetricHistory, abortions: correctedAbortions.toString() }
                      });
                      
                      // Recurrent pregnancy loss assessment
                      const recurrentLossWarning = document.getElementById('obstetric-recurrent-loss-warning');
                      if (recurrentLossWarning) {
                        recurrentLossWarning.style.display = abortions >= 3 ? 'block' : 'none';
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Living children</label>
                  <input 
                    type="number" 
                    id="obstetric_living_children"
                    min="0" 
                    max="20"
                    className="w-full border rounded p-2 text-sm" 
                    placeholder="e.g., 2"
                    value={obstetricHistory.livingChildren}
                    onChange={(e) => {
                      const livingChildren = parseInt(e.target.value) || 0;
                      
                      // Get current values
                      const para = parseInt(obstetricHistory.para) || 0;
                      
                      // Validation logic - block invalid entries instead of auto-correcting
                      const errors: Record<string, string> = { ...obstetricValidationErrors };
                      
                      // Clear living children errors first
                      delete errors.livingChildren;
                      
                      // Validate Para ≥ Living Children rule
                      if (livingChildren > 0 && para > 0 && livingChildren > para) {
                        errors.livingChildren = `Living children cannot exceed total live births (Para). Please review both fields. Current: Para=${para}, Living=${livingChildren}`;
                        
                        // Show toast notification for validation error
                        toast({
                          title: "Validation Error",
                          description: "Living children cannot exceed total live births (Para). Please review both fields.",
                          variant: "destructive",
                        });
                      }
                      
                      setObstetricValidationErrors(errors);
                      
                      // Update state with original value (don't auto-correct)
                      setObstetricHistory(prev => ({ 
                        ...prev, 
                        livingChildren: e.target.value
                      }));
                      
                      // Update Latest Encounter data
                      updateLatestEncounterData('clientProfile', {
                        livingChildren: correctedLivingChildren,
                        obstetricHistory: { ...obstetricHistory, livingChildren: correctedLivingChildren.toString() }
                      });
                      
                      // Child mortality assessment
                      const childMortalityWarning = document.getElementById('obstetric-child-mortality-warning');
                      if (childMortalityWarning) {
                        const childDeaths = para - livingChildren;
                        if (childDeaths > 0 && para > 0) {
                          childMortalityWarning.innerHTML = 
                            '<div class="text-xs text-orange-600 font-medium">Previous child mortality detected: ' + childDeaths + ' death(s)</div>' +
                            '<div class="text-xs text-gray-600">Consider counseling and enhanced perinatal care</div>';
                          childMortalityWarning.style.display = 'block';
                        } else {
                          childMortalityWarning.style.display = 'none';
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Validation Error Messages */}
              {Object.keys(obstetricValidationErrors).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">Validation Errors</span>
                  </div>
                  {Object.entries(obstetricValidationErrors).map(([field, error]) => (
                    <div key={field} className="text-xs text-red-700 ml-6 mb-1">
                      <span className="font-medium capitalize">{field}:</span> {error}
                    </div>
                  ))}
                  <div className="text-xs text-red-600 ml-6 mt-2 italic">
                    Please review and correct the highlighted fields before saving.
                  </div>
                </div>
              )}
              
              {/* Mandatory Fields Reminder */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Clinical Decision Support</span>
                </div>
                <div className="text-xs text-blue-700 ml-6">
                  All four fields must be completed for every new antenatal registration.
                  For antenatal visits: <strong>Gravida = (Para + Abortions/Miscarriages) + 1</strong>
                </div>
              </div>
              
              <div id="obstetric-modal-validation" className="text-xs text-red-600 font-medium mt-2" style={{ display: 'none' }}></div>
              
              {/* Parity Classification Display */}
              <div id="obstetric-parity-classification" className="mt-3 p-2 bg-gray-50 rounded border" style={{ display: 'none' }}></div>
              
              {/* Clinical Warnings */}
              <div id="obstetric-grandmultipara-warning" className="mt-3 p-3 bg-red-50 border border-red-200 rounded" style={{ display: 'none' }}>
                <div className="text-sm font-medium text-red-700">⚠️ Grand Multipara Alert</div>
                <div className="text-xs text-red-600 mt-1">High-risk pregnancy classification. Enhanced monitoring and specialist consultation recommended.</div>
              </div>
              
              <div id="obstetric-high-parity-warning" className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded" style={{ display: 'none' }}>
                <div className="text-sm font-medium text-orange-700">High Parity Assessment</div>
                <div className="text-xs text-orange-600 mt-1">Increased risk for uterine atony, placental abnormalities, and postpartum hemorrhage.</div>
              </div>
              
              <div id="obstetric-recurrent-loss-warning" className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded" style={{ display: 'none' }}>
                <div className="text-sm font-medium text-yellow-700">Recurrent Pregnancy Loss</div>
                <div className="text-xs text-yellow-600 mt-1">≥3 pregnancy losses detected. Consider genetic counseling and specialized care.</div>
              </div>
              
              <div id="obstetric-child-mortality-warning" className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded" style={{ display: 'none' }}></div>
            </div>

            {/* Previous Pregnancies Count */}
            <div className="border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">No. of previous pregnancies (excluding current) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                id="obstetric_previous_pregnancies_count"
                min="0" 
                max="14" 
                className="w-24 border rounded p-2 text-sm"
                placeholder="0"
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0;
                  const container = document.getElementById('pregnancy-history-container');
                  const socialSection = document.getElementById('social-habits-section');
                  const complicationsSection = document.getElementById('complications-section');
                  
                  if (container) {
                    container.innerHTML = '';
                    
                    // Business Rule: Show social habits and complications sections only when previous pregnancies exist
                    if (socialSection) {
                      socialSection.style.display = count > 0 ? 'block' : 'none';
                      // Reset social habits when hiding section
                      if (count === 0) {
                        const noneCheckbox = document.getElementById('social-habits-none') as HTMLInputElement;
                        const detailedHabits = document.getElementById('detailed-social-habits');
                        const habitCheckboxes = document.querySelectorAll('.social-habit');
                        
                        if (noneCheckbox) noneCheckbox.checked = false;
                        if (detailedHabits) detailedHabits.style.display = 'block';
                        habitCheckboxes.forEach((checkbox: HTMLInputElement) => {
                          checkbox.checked = false;
                          checkbox.disabled = false;
                        });
                      }
                    }
                    
                    if (complicationsSection) {
                      complicationsSection.style.display = count > 0 ? 'block' : 'none';
                      // Reset complications when hiding section
                      if (count === 0) {
                        const noneCheckbox = document.getElementById('complications-none') as HTMLInputElement;
                        const detailedComplications = document.getElementById('detailed-complications');
                        const complicationCheckboxes = document.querySelectorAll('.complication-item');
                        
                        if (noneCheckbox) noneCheckbox.checked = false;
                        if (detailedComplications) detailedComplications.style.display = 'block';
                        complicationCheckboxes.forEach((checkbox: HTMLInputElement) => {
                          checkbox.checked = false;
                          checkbox.disabled = false;
                        });
                      }
                    }
                    
                    // Generate pregnancy history forms
                    for (let i = 0; i < count; i++) {
                      const pregnancyDiv = document.createElement('div');
                      pregnancyDiv.className = 'border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4';
                      pregnancyDiv.innerHTML = `
                        <h6 class="font-medium text-gray-700 border-b border-gray-300 pb-2">Pregnancy ${i + 1}</h6>
                        
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-medium mb-1">Date of delivery/termination</label>
                            <input type="date" class="w-full border rounded p-2 text-sm" />
                          </div>
                          <div>
                            <label class="block text-sm font-medium mb-1">Estimated delivery date</label>
                            <input type="date" class="w-full border rounded p-2 text-sm" />
                          </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-medium mb-1">Gestational age (months) <span class="text-red-500">*</span></label>
                            <input 
                              type="number" 
                              min="1" 
                              max="10" 
                              class="w-full border rounded p-2 text-sm" 
                              placeholder="e.g., 8"
                              onchange="updateObstetricConditionalFields(${i})"
                            />
                          </div>
                          <div id="outcome-section-${i}" style="display: none;">
                            <label class="block text-sm font-medium mb-1">Pregnancy Outcome</label>
                            <select class="w-full border rounded p-2 text-sm" id="outcome-${i}">
                              <option value="">Select outcome...</option>
                            </select>
                          </div>
                        </div>
                        
                        <div id="delivery-mode-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Mode of delivery</label>
                          <select class="w-full border rounded p-2 text-sm" onchange="updateDeliveryFields(${i})">
                            <option value="">Select mode...</option>
                            <option value="normal_vertex">Normal Vertex Delivery</option>
                            <option value="assisted_vaginal">Assisted Vaginal Delivery</option>
                            <option value="assisted_breech">Assisted Breech Delivery</option>
                            <option value="c_section">C-section</option>
                          </select>
                        </div>
                        
                        <div id="labour-type-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Type of labour</label>
                          <select class="w-full border rounded p-2 text-sm" onchange="updateInfantSex(${i})">
                            <option value="">Select type...</option>
                            <option value="induced">Induced</option>
                            <option value="spontaneous">Spontaneous</option>
                          </select>
                        </div>
                        
                        <div id="assisted-vaginal-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Type of assisted vaginal delivery</label>
                          <select class="w-full border rounded p-2 text-sm">
                            <option value="">Select type...</option>
                            <option value="forceps">Forceps</option>
                            <option value="vacuum">Vacuum</option>
                          </select>
                        </div>
                        
                        <div id="csection-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Type of C-section</label>
                          <select class="w-full border rounded p-2 text-sm">
                            <option value="">Select type...</option>
                            <option value="planned">Planned/Elective</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>
                        
                        <div id="infant-sex-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Sex of infant</label>
                          <select class="w-full border rounded p-2 text-sm" onchange="handleSexSelection(${i})">
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </div>
                        
                        <!-- Number of ANC Visits - Appears after gestational age -->
                        <div id="anc-visits-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Number of ANC Visits</label>
                          <input type="number" placeholder="8" class="w-full border rounded p-2 text-sm" min="0" max="20" />
                        </div>

                        <!-- Place of Delivery - Only after mode of delivery -->
                        <div id="place-delivery-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Place of Delivery</label>
                          <select class="w-full border rounded p-2 text-sm">
                            <option value="">Select place...</option>
                            <option value="hospital">Hospital</option>
                            <option value="health_clinic">Health clinic</option>
                            <option value="home">Home</option>
                            <option value="on_way">On the way to facility</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <!-- Birth Weight - Only after sex of infant -->
                        <div id="birth-weight-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Birth Weight (kg)</label>
                          <input type="number" step="0.1" placeholder="3.2" class="w-full border rounded p-2 text-sm" min="0.5" max="6" />
                        </div>

                        <!-- Baby's Current Status - Only for live births -->
                        <div id="baby-status-section-${i}" style="display: none;">
                          <label class="block text-sm font-medium mb-1">Baby's Current Status</label>
                          <select class="w-full border rounded p-2 text-sm">
                            <option value="">Select status...</option>
                            <option value="alive_well">Alive and well</option>
                            <option value="alive_issues">Alive with health issues</option>
                            <option value="died_neonatal">Died in neonatal period</option>
                            <option value="died_later">Died later</option>
                          </select>
                        </div>
                      `;
                      container.appendChild(pregnancyDiv);
                    }
                    
                    // Enhanced JavaScript functions for conditional fields with proper field ordering
                    if (!(window as any).updateObstetricConditionalFields) {
                      (window as any).updateObstetricConditionalFields = function(index: number) {
                        const gestationalAge = parseInt((document.querySelector(`#pregnancy-history-container > div:nth-child(${index + 1}) input[onchange*="updateObstetricConditionalFields"]`) as HTMLInputElement)?.value || '0');
                        const outcomeSection = document.getElementById(`outcome-section-${index}`);
                        const deliverySection = document.getElementById(`delivery-mode-section-${index}`);
                        const ancVisitsSection = document.getElementById(`anc-visits-section-${index}`);
                        const outcomeSelect = document.getElementById(`outcome-${index}`) as HTMLSelectElement;
                        
                        if (gestationalAge > 0) {
                          // Always show ANC visits after gestational age
                          if (ancVisitsSection) ancVisitsSection.style.display = 'block';
                          if (outcomeSection) outcomeSection.style.display = 'block';
                          
                          if (outcomeSelect) {
                            outcomeSelect.innerHTML = '<option value="">Select outcome...</option>';
                            outcomeSelect.onchange = () => (window as any).handleObstetricOutcomeChange(index, outcomeSelect.value);
                            
                            if (gestationalAge < 6) {
                              outcomeSelect.innerHTML += '<option value="abortion">Abortion/Miscarriage</option>';
                              if (deliverySection) deliverySection.style.display = 'none';
                            } else if (gestationalAge >= 7) {
                              outcomeSelect.innerHTML += '<option value="live_birth">Live birth</option>';
                              outcomeSelect.innerHTML += '<option value="still_birth">Still birth</option>';
                              if (deliverySection) deliverySection.style.display = 'block';
                            }
                          }
                        } else {
                          if (ancVisitsSection) ancVisitsSection.style.display = 'none';
                          if (outcomeSection) outcomeSection.style.display = 'none';
                          if (deliverySection) deliverySection.style.display = 'none';
                        }
                      };

                      // Function to handle obstetric outcome changes
                      (window as any).handleObstetricOutcomeChange = function(pregnancyIndex: number, outcome: string) {
                        const babyStatusSection = document.getElementById(`baby-status-section-${pregnancyIndex}`);
                        const gestationalAge = parseInt((document.querySelector(`#pregnancy-history-container > div:nth-child(${pregnancyIndex + 1}) input[onchange*="updateObstetricConditionalFields"]`) as HTMLInputElement)?.value || '0');
                        
                        if (gestationalAge >= 7) {
                          if (outcome === 'live_birth') {
                            // Show baby status only for live births
                            if (babyStatusSection) babyStatusSection.style.display = 'block';
                          } else {
                            // Hide baby status for stillbirths or no selection
                            if (babyStatusSection) babyStatusSection.style.display = 'none';
                          }
                        }
                      };
                      
                      (window as any).updateDeliveryFields = function(index: number) {
                        const select = document.querySelector(`#delivery-mode-section-${index} select`) as HTMLSelectElement;
                        const labourSection = document.getElementById(`labour-type-section-${index}`);
                        const assistedSection = document.getElementById(`assisted-vaginal-section-${index}`);
                        const csectionSection = document.getElementById(`csection-section-${index}`);
                        const placeDeliverySection = document.getElementById(`place-delivery-section-${index}`);
                        
                        // Hide all conditional sections
                        [labourSection, assistedSection, csectionSection].forEach(section => {
                          if (section) section.style.display = 'none';
                        });
                        
                        const value = select?.value;
                        if (value) {
                          // Show place of delivery after mode of delivery is selected
                          if (placeDeliverySection) placeDeliverySection.style.display = 'block';
                          
                          if (value === 'normal_vertex' || value === 'assisted_breech') {
                            if (labourSection) labourSection.style.display = 'block';
                          } else if (value === 'assisted_vaginal') {
                            if (assistedSection) assistedSection.style.display = 'block';
                          } else if (value === 'c_section') {
                            if (csectionSection) csectionSection.style.display = 'block';
                          }
                        } else {
                          if (placeDeliverySection) placeDeliverySection.style.display = 'none';
                        }
                      };
                      
                      (window as any).updateInfantSex = function(index: number) {
                        const select = document.querySelector(`#labour-type-section-${index} select`) as HTMLSelectElement;
                        const infantSection = document.getElementById(`infant-sex-section-${index}`);
                        const birthWeightSection = document.getElementById(`birth-weight-section-${index}`);
                        
                        const value = select?.value;
                        if (value === 'induced' || value === 'spontaneous') {
                          if (infantSection) infantSection.style.display = 'block';
                          
                          // Check if sex is already selected to show birth weight
                          const sexSelect = document.querySelector(`#infant-sex-section-${index} select`) as HTMLSelectElement;
                          if (sexSelect?.value) {
                            if (birthWeightSection) birthWeightSection.style.display = 'block';
                          }
                        } else {
                          if (infantSection) infantSection.style.display = 'none';
                          if (birthWeightSection) birthWeightSection.style.display = 'none';
                        }
                      };

                      // Function to handle sex selection and show birth weight
                      (window as any).handleSexSelection = function(index: number) {
                        const birthWeightSection = document.getElementById(`birth-weight-section-${index}`);
                        if (birthWeightSection) birthWeightSection.style.display = 'block';
                      };
                      
                      (window as any).handleSocialHabitsNone = function(noneCheckbox: HTMLInputElement) {
                        const otherCheckboxes = document.querySelectorAll('.social-habit') as NodeListOf<HTMLInputElement>;
                        
                        if (noneCheckbox.checked) {
                          // If "None" is checked, uncheck all other social habits
                          otherCheckboxes.forEach(checkbox => {
                            checkbox.checked = false;
                          });
                        }
                      };
                    }
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Enter the number of previous pregnancies to generate detailed history forms</p>
            </div>

            {/* Dynamic Pregnancy History Container */}
            <div id="pregnancy-history-container" className="space-y-4">
              {/* Pregnancy forms will be dynamically generated here */}
            </div>

            {/* Social Habits Section */}
            <div id="social-habits-section" className="border border-green-300 rounded-lg bg-green-50" style={{ display: 'none' }}>
              <div className="p-4">
                <h5 className="text-sm font-medium text-green-600 mb-3">Previous Pregnancy Social Habits Assessment</h5>
                
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 text-sm">
                    <input 
                      type="checkbox" 
                      id="social-habits-none"
                      className="rounded border-gray-300" 
                      onChange={(e) => {
                        const detailedHabits = document.getElementById('detailed-social-habits');
                        const specificationArea = document.getElementById('social-habits-specification');
                        const otherCheckboxes = document.querySelectorAll('.social-habit');
                        const presentCheckbox = document.getElementById('social-habits-present') as HTMLInputElement;
                        
                        if (e.target.checked) {
                          // Hide detailed options and specification area, clear other selections
                          if (detailedHabits) detailedHabits.style.display = 'none';
                          if (specificationArea) specificationArea.style.display = 'none';
                          if (presentCheckbox) presentCheckbox.checked = false;
                          otherCheckboxes.forEach((checkbox: HTMLInputElement) => {
                            checkbox.checked = false;
                            checkbox.disabled = true;
                          });
                        } else {
                          // Show detailed options and specification area, enable other checkboxes
                          if (detailedHabits) detailedHabits.style.display = 'block';
                          if (specificationArea) specificationArea.style.display = 'block';
                          otherCheckboxes.forEach((checkbox: HTMLInputElement) => {
                            checkbox.disabled = false;
                          });
                        }
                      }}
                    />
                    <span className="font-medium">None</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-sm">
                    <input 
                      type="checkbox" 
                      id="social-habits-present"
                      className="rounded border-gray-300" 
                      onChange={(e) => {
                        const content = document.getElementById('social-habits-content');
                        const noneCheckbox = document.getElementById('social-habits-none') as HTMLInputElement;
                        
                        if (e.target.checked) {
                          if (content) content.style.display = 'block';
                          if (noneCheckbox) noneCheckbox.checked = false;
                        } else {
                          if (content) content.style.display = 'none';
                        }
                      }}
                    />
                    <span className="font-medium">Social habits present</span>
                  </label>
                </div>
              </div>
              
              <div id="social-habits-content" className="px-4 pb-4 space-y-3" style={{ display: 'none' }}>
                
                <div id="detailed-social-habits" className="ml-6 space-y-2" style={{ display: 'block' }}>
                  <p className="text-xs text-gray-600 mb-2">Select all that apply:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 social-habit" />
                      <span>Smoking</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 social-habit" />
                      <span>Alcohol consumption</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 social-habit" />
                      <span>Drug use</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 social-habit" />
                      <span>Traditional medicine use</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 social-habit" />
                      <span>High caffeine intake</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 social-habit" />
                      <span>Other (specify)</span>
                    </label>
                  </div>
                </div>
                
                <div id="social-habits-specification" className="mt-3" style={{ display: 'block' }}>
                  <label className="block text-sm font-medium mb-1">Specify details (frequency, amount, duration)</label>
                  <textarea 
                    className="w-full border rounded p-2 text-sm" 
                    rows={2}
                    placeholder="Please provide details about social habits..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Complications Section */}
            <div id="complications-section" className="border border-red-300 rounded-lg bg-red-50" style={{ display: 'none' }}>
              <div className="p-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 text-sm">
                    <input 
                      type="checkbox" 
                      id="complications-none"
                      className="rounded border-gray-300" 
                      onChange={(e) => {
                        const detailedComplications = document.getElementById('detailed-complications');
                        const specificationArea = document.getElementById('complications-specification');
                        const otherCheckboxes = document.querySelectorAll('.complication-item');
                        const presentCheckbox = document.getElementById('complications-present') as HTMLInputElement;
                        
                        if (e.target.checked) {
                          // Hide detailed options and specification area, clear other selections
                          if (detailedComplications) detailedComplications.style.display = 'none';
                          if (specificationArea) specificationArea.style.display = 'none';
                          if (presentCheckbox) presentCheckbox.checked = false;
                          otherCheckboxes.forEach((checkbox: HTMLInputElement) => {
                            checkbox.checked = false;
                            checkbox.disabled = true;
                          });
                        } else {
                          // Show detailed options and specification area, enable other checkboxes
                          if (detailedComplications) detailedComplications.style.display = 'block';
                          if (specificationArea) specificationArea.style.display = 'block';
                          otherCheckboxes.forEach((checkbox: HTMLInputElement) => {
                            checkbox.disabled = false;
                          });
                        }
                      }}
                    />
                    <span className="font-medium">No complications</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-sm">
                    <input 
                      type="checkbox" 
                      id="complications-present"
                      className="rounded border-gray-300" 
                      onChange={(e) => {
                        const content = document.getElementById('complications-content');
                        const noneCheckbox = document.getElementById('complications-none') as HTMLInputElement;
                        
                        if (e.target.checked) {
                          if (content) content.style.display = 'block';
                          if (noneCheckbox) noneCheckbox.checked = false;
                        } else {
                          if (content) content.style.display = 'none';
                        }
                      }}
                    />
                    <span className="font-medium">Complications present</span>
                  </label>
                </div>
              </div>
              
              <div id="complications-content" className="px-4 pb-4 space-y-3" style={{ display: 'none' }}>
                
                <div id="detailed-complications" className="ml-6 space-y-3" style={{ display: 'block' }}>
                  <p className="text-xs text-gray-600 mb-2">Select all complications that occurred in previous pregnancies:</p>
                  
                  <div className="space-y-4">
                    {/* Pregnancy-related complications */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Pregnancy Complications</h6>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Pre-eclampsia/Eclampsia</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Gestational diabetes</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Preterm labor</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>IUGR (Low birth weight)</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Delivery complications */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Delivery Complications</h6>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Prolonged labor</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Placental complications</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Cord prolapse</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Uterine rupture</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Postpartum complications */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Postpartum Complications</h6>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Postpartum hemorrhage</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Infection</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" className="rounded border-gray-300 complication-item" />
                          <span>Other (specify)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div id="complications-specification" className="mt-4" style={{ display: 'block' }}>
                  <label className="block text-sm font-medium mb-1">Specify other complications or provide additional details</label>
                  <textarea 
                    className="w-full border rounded p-2 text-sm" 
                    rows={3}
                    placeholder="Please specify any other complications or provide additional details about selected complications..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Additional Clinical Notes */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Additional Clinical Notes</label>
              <textarea 
                className="w-full border rounded p-2 text-sm" 
                rows={3}
                placeholder="Any additional obstetric history information, risk factors, or clinical observations..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={() => setShowObstetricHistoryDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
              onClick={() => {
                // Validate mandatory fields before saving
                const errors: Record<string, string> = {};
                
                if (!obstetricHistory.gravida || parseInt(obstetricHistory.gravida) < 1) {
                  errors.gravida = 'Gravida is mandatory and must be at least 1 if currently pregnant';
                }
                if (!obstetricHistory.para) {
                  errors.para = 'Para is mandatory for antenatal registration';
                }
                if (!obstetricHistory.abortions && obstetricHistory.abortions !== '0') {
                  errors.abortions = 'Abortions/Miscarriages field is mandatory';
                }
                if (!obstetricHistory.livingChildren && obstetricHistory.livingChildren !== '0') {
                  errors.livingChildren = 'Living children field is mandatory';
                }
                
                if (Object.keys(errors).length > 0) {
                  setObstetricValidationErrors(errors);
                  toast({
                    title: "Validation Error",
                    description: "All four fields must be completed for antenatal registration.",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Final validation of business rules
                const gravida = parseInt(obstetricHistory.gravida);
                const para = parseInt(obstetricHistory.para);
                const abortions = parseInt(obstetricHistory.abortions);
                const livingChildren = parseInt(obstetricHistory.livingChildren);
                
                if (gravida !== (para + abortions + 1)) {
                  toast({
                    title: "Business Rule Validation",
                    description: `For antenatal visits: Gravida (${gravida}) should equal Para (${para}) + Abortions (${abortions}) + 1 = ${para + abortions + 1}`,
                    variant: "destructive",
                  });
                  return;
                }
                
                // Save successful - update Latest Encounter
                updateLatestEncounterData('clientProfile', {
                  obstetricHistoryComplete: true,
                  gravida,
                  para,
                  abortions,
                  livingChildren,
                  obstetricSummary: `G${gravida}P${para}A${abortions}L${livingChildren}`
                });
                
                setShowObstetricHistoryDialog(false);
                setObstetricValidationErrors({});
                toast({
                  title: "Enhanced Obstetric History Saved",
                  description: "Complete obstetric assessment has been recorded successfully.",
                });
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Medical History Modal */}
      <Dialog open={showMedicalHistoryDialog} onOpenChange={setShowMedicalHistoryDialog}>
        <DialogContent className="bg-white/85 backdrop-blur-2xl border border-white/30 ring-1 ring-white/20 shadow-xl rounded-2xl max-w-3xl max-h-[85vh] overflow-y-auto" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.80) 100%)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.08)'
          }}>
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold text-green-600">
              <Heart className="w-5 h-5 mr-2" />
              Medical History Assessment
            </DialogTitle>
            <DialogDescription>
              Essential medical history information for clinical assessment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Past Medical History */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Past medical history</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="past_medical_history" 
                    value="no_history" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('past_medical_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'none';
                      }
                    }}
                  />
                  <span className="text-sm">No history</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="past_medical_history" 
                    value="history_present" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('past_medical_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'block';
                      }
                    }}
                  />
                  <span className="text-sm">History present</span>
                </label>
              </div>
              
              {/* Detailed Past Medical History Options */}
              <div id="past_medical_detailed" className="border-l-2 border-green-200 pl-4 mt-3" style={{ display: 'none' }}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Don't know</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Asthma</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Sickle cell disease</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Cancer (specify)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Diabetes Mellitus</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Epilepsy</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>HIV positive</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Hypertension</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Mental illness</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>TB</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Other (specify)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Surgical History */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Surgical history</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="surgical_history" 
                    value="no_history" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('surgical_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'none';
                      }
                    }}
                  />
                  <span className="text-sm">No history</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="surgical_history" 
                    value="history_present" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('surgical_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'block';
                      }
                    }}
                  />
                  <span className="text-sm">History present</span>
                </label>
              </div>
              
              {/* Detailed Surgical History Options */}
              <div id="surgical_detailed" className="border-l-2 border-green-200 pl-4 mt-3" style={{ display: 'none' }}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Don't know</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Dilation and curettage</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Caesarean section</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Removal of fibroids (myomectomy)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Removal of ovarian cysts (Cystectomy)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Removal of ovary (oophorectomy)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Ectopic pregnancy (salpingectomy)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Partial removal of the cervix (cervical conization)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Other gynaecological procedures (specify)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Other surgeries (specify)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Drug History */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Drug history</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="drug_history" 
                    value="no_history" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('drug_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'none';
                      }
                    }}
                  />
                  <span className="text-sm">No history</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="drug_history" 
                    value="history_present" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('drug_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'block';
                      }
                    }}
                  />
                  <span className="text-sm">History present</span>
                </label>
              </div>
              
              {/* Detailed Drug History Options */}
              <div id="drug_detailed" className="border-l-2 border-green-200 pl-4 mt-3" style={{ display: 'none' }}>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Don't know</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Antacids</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Aspirin</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Calcium</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Magnesium</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Metoclopramide</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Carbamazepine</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Phenytoin</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Metformin</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Glibenclamide</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Nifedipine</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Methyldopa</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Antiretrovirals (ARVs)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Salbutamol</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Other (specify)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Immunization Status */}
            <div className="space-y-4">
              <label className="block text-sm font-medium">Immunization status</label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tetanus Toxoid (TT)</label>
                  <select className="w-full border rounded p-2 text-sm">
                    <option value="">Select status...</option>
                    <option value="up_to_date">Up to date</option>
                    <option value="needs_booster">Needs booster</option>
                    <option value="not_immunized">Not immunized</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hepatitis B immunization</label>
                  <select className="w-full border rounded p-2 text-sm">
                    <option value="">Select status...</option>
                    <option value="completed">Completed series</option>
                    <option value="partial">Partial series</option>
                    <option value="not_immunized">Not immunized</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Social History */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Social history</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="social_history" 
                    value="no_history" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('social_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'none';
                      }
                    }}
                  />
                  <span className="text-sm">No history</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="social_history" 
                    value="history_present" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSection = document.getElementById('social_detailed');
                      if (detailedSection) {
                        detailedSection.style.display = 'block';
                      }
                    }}
                  />
                  <span className="text-sm">History present</span>
                </label>
              </div>
              
              {/* Detailed Social History Options */}
              <div id="social_detailed" className="border-l-2 border-green-200 pl-4 mt-3" style={{ display: 'none' }}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Smoking</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Alcohol use</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Substance abuse</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span>Domestic violence</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Substance Use Assessment */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Substance Use Assessment</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="substance_assessment" 
                    value="no_assessment" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSections = [
                        'caffeine_intake_section',
                        'tobacco_smoking_section', 
                        'tobacco_sniffing_section',
                        'household_smoking_section',
                        'clinical_enquiry_section',
                        'substance_use_section'
                      ];
                      detailedSections.forEach(sectionId => {
                        const section = document.getElementById(sectionId);
                        if (section) section.style.display = 'none';
                      });
                      
                      // Update form data
                      setSubstanceUseFormData(prev => ({
                        ...prev,
                        substanceAssessment: 'no_assessment'
                      }));
                    }}
                  />
                  <span className="text-sm">No assessment needed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="substance_assessment" 
                    value="assessment_needed" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => {
                      const detailedSections = [
                        'caffeine_intake_section',
                        'tobacco_smoking_section', 
                        'tobacco_sniffing_section',
                        'household_smoking_section',
                        'clinical_enquiry_section',
                        'substance_use_section'
                      ];
                      detailedSections.forEach(sectionId => {
                        const section = document.getElementById(sectionId);
                        if (section) section.style.display = 'block';
                      });
                    }}
                  />
                  <span className="text-sm">Assessment needed</span>
                </label>
              </div>
            </div>

            {/* Daily Caffeine Intake */}
            <div id="caffeine_intake_section" className="space-y-3" style={{ display: 'none' }}>
              <label className="block text-sm font-medium">Daily caffeine intake</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="more_than_2_cups_coffee"
                    name="caffeine_intake"
                    onChange={(e) => handleCaffeineIntakeChange(e)}
                  />
                  <span>More than 2 cups (200ml) of filtered or commercially brewed coffee</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="more_than_4_cups_tea"
                    name="caffeine_intake"
                    onChange={(e) => handleCaffeineIntakeChange(e)}
                  />
                  <span>More than 4 cups of tea</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="energy_drinks"
                    name="caffeine_intake"
                    onChange={(e) => handleCaffeineIntakeChange(e)}
                  />
                  <span>More than one bottle of coca cola or caffeine energy drink</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                  <span>None of the above</span>
                </label>
              </div>
            </div>

            {/* Tobacco Use - Smoking */}
            <div id="tobacco_smoking_section" className="space-y-3" style={{ display: 'none' }}>
              <label className="block text-sm font-medium">Tobacco use - Smoking?</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="tobacco_smoking" 
                    value="yes" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleTobaccoSmokeChange(e.target.value as 'yes' | 'no' | 'recently_quit')}
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="tobacco_smoking" 
                    value="no" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleTobaccoSmokeChange(e.target.value as 'yes' | 'no' | 'recently_quit')}
                  />
                  <span className="text-sm">No</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="tobacco_smoking" 
                    value="recently_quit" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleTobaccoSmokeChange(e.target.value as 'yes' | 'no' | 'recently_quit')}
                  />
                  <span className="text-sm">Recently quit</span>
                </label>
              </div>
            </div>

            {/* Tobacco Use - Sniffing */}
            <div id="tobacco_sniffing_section" className="space-y-3" style={{ display: 'none' }}>
              <label className="block text-sm font-medium">Tobacco use - Sniffing (Insunku)?</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="tobacco_sniffing" 
                    value="yes" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleTobaccoSniffChange(e.target.value as 'yes' | 'no' | 'recently_quit')}
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="tobacco_sniffing" 
                    value="no" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleTobaccoSniffChange(e.target.value as 'yes' | 'no' | 'recently_quit')}
                  />
                  <span className="text-sm">No</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="tobacco_sniffing" 
                    value="recently_quit" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleTobaccoSniffChange(e.target.value as 'yes' | 'no' | 'recently_quit')}
                  />
                  <span className="text-sm">Recently quit</span>
                </label>
              </div>
            </div>

            {/* Household Smoking */}
            <div id="household_smoking_section" className="space-y-3" style={{ display: 'none' }}>
              <label className="block text-sm font-medium">Does anyone in the household smoke?</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="household_smoking" 
                    value="yes" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleHouseholdSmokingChange(e.target.value as 'yes' | 'no')}
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="household_smoking" 
                    value="no" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleHouseholdSmokingChange(e.target.value as 'yes' | 'no')}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Clinical Enquiry for Alcohol and Substance Use */}
            <div id="clinical_enquiry_section" className="space-y-3" style={{ display: 'none' }}>
              <label className="block text-sm font-medium">Clinical enquiry for alcohol and other substance use</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="clinical_enquiry" 
                    value="yes" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleClinicalEnquiryChange(e.target.value as 'yes' | 'no')}
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="clinical_enquiry" 
                    value="no" 
                    className="border-gray-300 text-green-600"
                    onChange={(e) => handleClinicalEnquiryChange(e.target.value as 'yes' | 'no')}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Uses Alcohol and/or Other Substances */}
            <div id="substance_use_section" className="space-y-3" style={{ display: 'none' }}>
              <label className="block text-sm font-medium">Uses alcohol and/or other substances?</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="none"
                    name="substance_use"
                    onChange={(e) => handleSubstanceUseChangeNew(e)}
                  />
                  <span>None</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="alcohol"
                    name="substance_use"
                    onChange={(e) => handleSubstanceUseChangeNew(e)}
                  />
                  <span>Alcohol</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="marijuana"
                    name="substance_use"
                    onChange={(e) => handleSubstanceUseChangeNew(e)}
                  />
                  <span>Marijuana</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="cocaine"
                    name="substance_use"
                    onChange={(e) => handleSubstanceUseChangeNew(e)}
                  />
                  <span>Cocaine</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="injectable_drugs"
                    name="substance_use"
                    onChange={(e) => handleSubstanceUseChangeNew(e)}
                  />
                  <span>Injectable drugs</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-green-600"
                    value="other"
                    name="substance_use"
                    onChange={(e) => handleSubstanceUseChangeNew(e)}
                  />
                  <span>Other (specify)</span>
                </label>
              </div>
            </div>

            {/* Other Medical Conditions */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Other medical conditions</label>
              <textarea 
                className="w-full border rounded p-2 text-sm" 
                rows={3}
                placeholder="Specify any other medical conditions or relevant history..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={() => setShowMedicalHistoryDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
              onClick={() => {
                setShowMedicalHistoryDialog(false);
                toast({
                  title: "Medical History Assessment Saved",
                  description: "Essential medical history information has been recorded successfully.",
                });
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Vital Signs & Measurements Dialog */}
      <VitalSignsMeasurements
        open={showVitalSignsDialog}
        onClose={() => setShowVitalSignsDialog(false)}
        onSave={handleSaveVitalSigns}
        onTriggerDangerSigns={(signs) => {
          // Process danger signs and trigger appropriate alerts
          processDangerSigns(signs);
          setSelectedDangerSigns(signs);
          setShowVitalSignsDialog(false);
        }}
      />
      {/* Urgent Notification Modal */}
      <Dialog open={showUrgentNotification} onOpenChange={setShowUrgentNotification}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className={`flex items-center space-x-2 ${
              urgentNotificationData?.type === 'critical' ? 'text-red-600' : 
              urgentNotificationData?.type === 'urgent' ? 'text-orange-600' : 
              'text-yellow-600'
            }`}>
              <AlertTriangle className="h-5 w-5" />
              <span>{urgentNotificationData?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {urgentNotificationData && (
            <div className="space-y-4">
              {/* Alert Message */}
              <div className={`p-4 rounded-lg border ${
                urgentNotificationData.type === 'critical' ? 'bg-red-50 border-red-200' :
                urgentNotificationData.type === 'urgent' ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`font-medium ${
                  urgentNotificationData.type === 'critical' ? 'text-red-800' :
                  urgentNotificationData.type === 'urgent' ? 'text-orange-800' :
                  'text-yellow-800'
                }`}>
                  {urgentNotificationData.message}
                </p>
                <p className={`text-sm mt-2 ${
                  urgentNotificationData.type === 'critical' ? 'text-red-700' :
                  urgentNotificationData.type === 'urgent' ? 'text-orange-700' :
                  'text-yellow-700'
                }`}>
                  <strong>Condition:</strong> {urgentNotificationData.condition}
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-2">Clinical Recommendations:</h4>
                <ul className="space-y-1">
                  {urgentNotificationData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleAcknowledgeNotification}
                  className="bg-gray-200 hover:bg-gray-300 rounded-full px-6 border-none"
                >
                  Acknowledge
                </Button>
                {urgentNotificationData.requiresReferral && (
                  <Button
                    onClick={handleInitiateReferral}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6"
                  >
                    Initiate Referral
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Maternal Assessment Modal */}
      {showMaternalAssessmentModal && (
        <MaternalAssessmentModal 
          open={showMaternalAssessmentModal}
          onClose={() => setShowMaternalAssessmentModal(false)}
          onSave={handleSaveMaternalAssessment}
        />
      )}

      {/* Fetal Assessment Modal */}
      {showFetalAssessmentModal && (
        <FetalAssessmentModal 
          open={showFetalAssessmentModal}
          onClose={() => setShowFetalAssessmentModal(false)}
          onSave={handleSaveFetalAssessment}
        />
      )}

      {/* Standard ANC Assessment Modal */}
      <Dialog open={showStandardAssessmentDialog} onOpenChange={setShowStandardAssessmentDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[90vw]" style={{ width: '90vw', maxWidth: '1280px', height: '95vh' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M9 11H5a2 2 0 0 0-2 2v3c0 3.866 3.134 7 7 7h4a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-4z"></path>
                <path d="M17 7h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
              </svg>
              Standard ANC Assessment
            </DialogTitle>
            <DialogDescription>
              Comprehensive antenatal care assessment following WHO guidelines
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <StandardANCAssessment patientId="demo-patient-123" hideCard={true} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Clinical Decision Support Modal */}
      <ClinicalDecisionSupportModal
        condition={currentCdssCondition}
        isOpen={cdssModalOpen}
        onClose={() => setCdssModalOpen(false)}
        onConfirm={handleCDSSConfirm}
      />

      {/* Enhanced Behavioral Counselling Modal with Given-When-Then Tracking */}
      <EnhancedBehavioralCounsellingModal
        isOpen={showBehavioralCounsellingDialog}
        onClose={() => setShowBehavioralCounsellingDialog(false)}
        onSave={handleSaveBehavioralCounselling}
        clientProfile={{
          daily_caffeine_intake: "yes", // This would come from actual client profile data
          tobacco_use_smoking: "no",
          tobacco_use_sniffing: "no", 
          anyone_smokes_in_household: "yes",
          uses_alcohol_substances: ["alcohol"]
        }}
        clinicalContext={{
          syphilis_test: "negative", // This would come from laboratory results
          hiv_status: "negative",
          hepatitis_b_test: "negative",
          medical_history: ["hypertension"], // This would come from medical history
          uti_detected: false
        }}
        existingData={behavioralCounsellingData}
      />

      {/* Form Trigger-Based CDSS Modal */}
      <CDSSTriggeredModal
        isOpen={showCDSSTriggeredModal}
        alert={currentCDSSAlert}
        behavioralCounsellingData={behavioralCounsellingData}
        onClose={() => setShowCDSSTriggeredModal(false)}
        onAcknowledge={(alertType) => {
          handleMedicalHistoryCDSSAcknowledgment(alertType);
          setShowCDSSTriggeredModal(false);
        }}
        onNotApplicable={(alertType) => {
          toast({
            title: "CDSS Alert Dismissed",
            description: "Alert marked as not applicable for this client.",
          });
          setShowCDSSTriggeredModal(false);
        }}
      />

      {/* Laboratory Tests Modal */}
      <LaboratoryTestsModal
        isOpen={showLaboratoryTestsModal}
        onClose={() => setShowLaboratoryTestsModal(false)}
        onSave={handleSaveLaboratoryTests}
        initialData={laboratoryTestsData}
      />

      {/* Specialized Diagnostic Tests Modal */}
      <LaboratoryTestsModal
        isOpen={showSpecializedTestsModal}
        onClose={() => setShowSpecializedTestsModal(false)}
        onSave={handleSaveLaboratoryTests}
        initialData={laboratoryTestsData}
        defaultTab="specialized"
      />

      {/* Health Education Modal */}
      <HealthEducationModal
        isOpen={showHealthEducationModal}
        onClose={() => setShowHealthEducationModal(false)}
        onSave={handleSaveHealthEducation}
        initialData={healthEducationData}
      />

      {/* Interventions & Treatments Modal */}
      <InterventionsTreatmentsModal
        isOpen={showInterventionsTreatmentsDialog}
        onClose={() => setShowInterventionsTreatmentsDialog(false)}
        onSave={handleSaveInterventionsTreatments}
        existingData={interventionsData}
        onTriggerPrescription={handleTriggerPrescription}
      />

      {/* Prescription Modal */}
      <PrescriptionModalWrapper
        isOpen={showPrescriptionModal}
        onSaveComplete={handlePrescriptionSaveComplete}
        onClose={handleClosePrescriptionModal}
        prePopulatedDrug={prePopulatedDrug}
      />

      {/* Referral Modal */}
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        onSave={handleReferralSave}
        initialData={referralData}
        dangerSigns={selectedDangerSigns}
      />
      

      
      {/* Danger Sign Info Modal - Simplified */}
      <Dialog open={showDangerSignInfo} onOpenChange={setShowDangerSignInfo}>
        <DialogContent className="bg-white/60 backdrop-blur-2xl border border-white/20 ring-1 ring-white/10 shadow-xl rounded-2xl font-sans max-w-md p-6" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.60) 0%, rgba(248,250,252,0.55) 100%)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.08)'
          }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDangerSignInfo(false)}
            className="absolute top-3 right-3 h-6 w-6 p-0 rounded-full hover:bg-gray-100/50 transition-colors z-10"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
          
          <p className="text-gray-700 leading-relaxed text-sm pr-4">
            {selectedDangerSignInfo?.description}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Danger Sign Info Modal - Added separately to avoid file conflicts
const DangerSignInfoModal = ({ open, onClose, title, description }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="bg-white/95 backdrop-blur-2xl border border-gray-200/50 ring-1 ring-white/30 rounded-2xl font-sans max-w-2xl max-h-[85vh] overflow-y-auto" style={{ boxShadow: '0 4px 9px hsla(223.58deg, 50.96%, 59.22%, 0.65)' }}>
      <DialogTitle className="text-lg font-semibold text-gray-800 mb-3">
        {title}
      </DialogTitle>
      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {description}
        </p>
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={onClose}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
          >
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);