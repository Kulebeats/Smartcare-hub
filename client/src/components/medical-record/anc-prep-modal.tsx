import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ANCPrepAssessmentData, POCTestData } from "@/shared/schema"
import PrepDynamicAlertModal from "./prep-dynamic-alert-modal"
import PrepEligibilityModal from "./prep-eligibility-modal"
import PrepDeferralModal from "./prep-deferral-modal"
import { POCTestOrderDialog } from "./poc-test-order-dialog"
import { AlertTriangle, Lock, Shield } from 'lucide-react'

import { useToast } from "@/hooks/use-toast"

interface ANCPrepModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ANCPrepAssessmentData) => void
  initialData?: ANCPrepAssessmentData
}

export function ANCPrepModal({ isOpen, onClose, onSave, initialData }: ANCPrepModalProps) {
  const [formData, setFormData] = useState<ANCPrepAssessmentData>({
    eligible_for_prep: initialData?.eligible_for_prep || false,
    offered_prep: initialData?.offered_prep || false,
    prep_accepted: initialData?.prep_accepted || false,
    risk_factors: initialData?.risk_factors || [],
    acute_hiv_symptoms: initialData?.acute_hiv_symptoms || [],
    prep_history: initialData?.prep_history || undefined,
    previous_prep_use: initialData?.previous_prep_use || false,
    previous_prep_stop_date: initialData?.previous_prep_stop_date || "",
    contraindications: initialData?.contraindications || [],
    creatinine_test_required: initialData?.creatinine_test_required || false,
    creatinine_test_date: initialData?.creatinine_test_date || "",
    creatinine_result: initialData?.creatinine_result || "",
    recommended_tests: initialData?.recommended_tests || [],
    prescribed_at_initial_visit: initialData?.prescribed_at_initial_visit || false,
    prep_regimen: initialData?.prep_regimen || "",
    days_prescribed: initialData?.days_prescribed || "",
    adherence_counselling: initialData?.adherence_counselling || false,
    follow_up_date: initialData?.follow_up_date || "",
    follow_up_type: initialData?.follow_up_type || "",
    prevention_services: initialData?.prevention_services || [],
    condoms_distributed: initialData?.condoms_distributed || "",
    hiv_self_test_kits: initialData?.hiv_self_test_kits || false,
    number_of_kits: initialData?.number_of_kits || "",
    notes: initialData?.notes || "",
    assessed_by: initialData?.assessed_by || "",
    assessment_date: initialData?.assessment_date || ""
  })

  // Unified assessment data structure (combines UI and calculation needs)
  const [assessmentData, setAssessmentData] = useState({
    // Client Risk Factors (using schema field names)
    inconsistent_condom_use: "" as "yes" | "no" | "",
    condom_reasons: [] as string[],
    condom_other_reason: "",
    multiple_partners: "" as "yes" | "no" | "",
    recent_sti: "" as "yes" | "no" | "",
    sti_types: [] as string[],

    // Partner Risk Factors (using schema field names)
    partner_hiv_status_known: "" as "yes" | "no" | "",
    partner_hiv_status: "" as "positive" | "negative" | "unknown" | "",
    partner_not_on_art: "" as "yes" | "no" | "",
    partner_detectable_viral_load: "" as "yes" | "no" | "",
    partner_multiple_partners: "" as "yes" | "no" | "",
    partner_injection_drug_use: "" as "yes" | "no" | "",

    // Pregnancy Modifiers (using schema field names)
    pregnancy_trimester: "" as "first" | "second" | "third" | "",
    plans_to_breastfeed: "" as "yes" | "no" | "unsure" | "",

    // Contraindications
    kidney_problems: false,
    bone_density_issues: false,
    drug_allergies: false,
    medication_interactions: false,

    // CLINICAL SAFETY SCREENING (Enhanced Eligibility Assessment)
    // A. Risk Reduction Counseling
    risk_reduction_counseling_provided: "" as "yes" | "no" | "",
    
    // Enhanced Risk Reduction Counseling (Section A)
    risk_reduction_counselling_provided: "" as "yes" | "no" | "",
    counselling_not_provided_reasons: [] as string[],
    counselling_not_provided_other: "",
    
    // Client Interest in PrEP (Section B)
    client_interested_in_prep: "" as "yes" | "no" | "",
    lack_of_interest_reasons: [] as string[],
    lack_of_interest_other: "",
    
    // Planned Next Steps/Follow-Up (Section C)
    planned_next_steps: [] as string[],
    planned_next_steps_other: "",
    next_counselling_date: "",
    
    // B. Baseline Clinical Safety and Labs
    urinalysis_performed: "" as "yes" | "no" | "",
    urinalysis_normal: "" as "yes" | "no" | "",
    creatinine_confirmed: "" as "yes" | "no" | "pending" | "",
    hepatitis_b_screening: "" as "yes" | "no" | "pending" | "",
    hepatitis_b_screening_result: "" as "reactive" | "non_reactive" | "",
    syphilis_screening_performed: "" as "yes" | "no" | "pending" | "",
    syphilis_screening_result: "" as "reactive" | "non_reactive" | "",
    
    // C. Acute HIV Symptoms Assessment
    acute_hiv_symptoms: "" as "yes" | "no" | "",
    acute_symptoms_list: [] as string[],
    
    // D. Medical History Contraindications
    kidney_disease_history: "" as "yes" | "no" | "unknown" | "",
    drug_allergy_tenofovir: "" as "yes" | "no" | "",
    
    // Clinical eligibility determination
    eligibility_complete: false,
    eligibility_contraindications: [] as string[],
    prep_eligible: null as boolean | null
  })

  const [calculatedRisk, setCalculatedRisk] = useState({
    level: "Unknown",
    score: 0,
    recommendations: [] as string[],
    contraindications: [] as string[],
    followUpFrequency: "Monthly",
    clinicalActions: [] as string[],
    shouldShowModal: false,
    shouldShowToast: false
  })

  const [showClinicalDecisionModal, setShowClinicalDecisionModal] = useState(false) // Risk-based modal
  const [showEligibilityModal, setShowEligibilityModal] = useState(false) // Eligibility-based modal
  
  // Separate state for eligibility data and clinical recommendations
  const [eligibilityData, setEligibilityData] = useState({
    eligible: null as boolean | null,
    reason: "",
    status: "pending" as "eligible" | "excluded" | "incomplete" | "pending" | "low_risk"
  })
  
  const [clinicalRecommendations, setClinicalRecommendations] = useState({
    decision: "pending" as "eligible" | "contraindicated" | "conditional" | "pending",
    clinicalContext: "",
    immediateActions: [] as string[],
    monitoringRequirements: [] as string[],
    followUpTimeline: "",
    safetyConsiderations: [] as string[],
    alternativeOptions: [] as string[],
    protocolReferences: [] as string[],
    screeningGuidance: [] as string[]
  })
  const [showRiskDecisionModal, setShowRiskDecisionModal] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("assessment")
  const [modalManuallyClosed, setModalManuallyClosed] = useState(false)
  
  // Enhanced modal state management to prevent interference
  const [isChildModalTransition, setIsChildModalTransition] = useState(false)
  const [lastUserInteraction, setLastUserInteraction] = useState<'main' | 'child' | null>(null)
  
  // Deferral Modal State Management
  const [showDeferralModal, setShowDeferralModal] = useState(false)
  const [deferralAcknowledged, setDeferralAcknowledged] = useState(false)
  
  // POC Tests integration state
  const [showPOCTestsModal, setShowPOCTestsModal] = useState(false)
  const [baselineTestFollowUp, setBaselineTestFollowUp] = useState({
    urinalysis_test_now: false,
    creatinine_test_now: false,
    hepatitis_b_test_now: false,
    syphilis_test_now: false
  })

  // Toast notification state - tracks if toast has been shown for current session
  const [clinicalSafetyToastShown, setClinicalSafetyToastShown] = useState(false)

  // Conditional Section Visibility State - Progressive Disclosure for PrEP Assessment
  const [visibleSections, setVisibleSections] = useState({
    sectionA: true,  // Always visible - Risk Reduction Counseling
    sectionB: true,  // Always visible - Client Interest Assessment  
    sectionC: false, // Conditional - Follow-up steps (only if client NOT interested)
    sectionD: false, // Conditional - Acute HIV Symptoms (only if client IS interested)
    sectionE: false, // Conditional - Medical History (only if client IS interested)
    sectionF: true   // Always visible - Clinical Safety Assessment (when requirements met)
  })

  // Given-When-Then workflow state for Eligibility tab
  const [eligibilityWorkflow, setEligibilityWorkflow] = useState({
    currentStep: 0,
    completedSteps: [] as number[],
    medicalHistory: {
      contraindications: [] as string[],
      eligible: null as boolean | null,
      notes: ""
    },
    acuteSymptoms: {
      hasSymptoms: null as boolean | null,
      symptoms: [] as string[],
      recommendation: "",
      testingRequired: false
    },
    baselineInvestigations: {
      testsOrdered: [] as string[],
      followUpRequired: false,
      notes: "",
      safeToStart: null as boolean | null
    }
  })

  const { toast } = useToast()

  // Business Rule: Conditional Section Visibility Handler
  const updateSectionVisibility = (clientInterested: "yes" | "no" | "") => {
    console.log("🔄 SECTION VISIBILITY UPDATE:", { clientInterested, currentSections: visibleSections })
    
    setVisibleSections(prev => {
      const newVisibility = {
        ...prev,
        // Section C (Follow-up) - Only show if client NOT interested in PrEP
        sectionC: clientInterested === "no",
        // Section D (Acute HIV Symptoms) - Only show if client IS interested in PrEP  
        sectionD: clientInterested === "yes",
        // Section E (Medical History) - Only show if client IS interested in PrEP
        sectionE: clientInterested === "yes"
      }
      
      console.log("✅ SECTIONS UPDATED:", { 
        previous: prev, 
        new: newVisibility,
        changedSections: {
          sectionC: prev.sectionC !== newVisibility.sectionC,
          sectionD: prev.sectionD !== newVisibility.sectionD,
          sectionE: prev.sectionE !== newVisibility.sectionE
        }
      })
      
      return newVisibility
    })
  }

  // Clinical Safety Availability Check
  const isClinicalSafetyAvailable = () => {
    return assessmentData.risk_reduction_counselling_provided === "yes" && 
           assessmentData.client_interested_in_prep === "yes"
  }

  // Enhanced toast for clinical safety requirements
  const showClinicalSafetyToast = () => {
    let missingRequirements = []
    
    if (assessmentData.risk_reduction_counselling_provided !== "yes") {
      missingRequirements.push("Complete Section A - Risk reduction counseling")
    }
    
    if (assessmentData.client_interested_in_prep !== "yes") {
      missingRequirements.push("Complete Section B - Client interest assessment")
    }
    
    toast({
      title: "Clinical Safety Assessment Not Available",
      description: `${missingRequirements.join(" and ")} to proceed with clinical safety checks`,
      duration: 5000, // Extended duration (1 second longer than usual)
      variant: "default"
    })
  }

  // Tab eligibility checks
  const canAccessPrescription = assessmentData.prep_eligible === true
  const canAccessFollowUp = assessmentData.prep_eligible === true

  // Handle tab change with eligibility checks
  const handleTabChangeWithRestrictions = (value: string) => {
    if ((value === "prescription" && !canAccessPrescription) || 
        (value === "follow-up" && !canAccessFollowUp)) {
      toast({
        title: "Access Restricted",
        description: "Complete eligibility assessment with 'Yes, eligible for PrEP' to access this tab",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    handleTabChange(value)
  }

  // Toast notification for clinical safety requirements when accessing eligibility tab
  useEffect(() => {
    if (activeTab === "eligibility" && !isClinicalSafetyAvailable() && !clinicalSafetyToastShown) {
      const timer = setTimeout(() => {
        showClinicalSafetyToast()
        setClinicalSafetyToastShown(true)
      }, 300) // Small delay to ensure tab transition completes
      
      return () => clearTimeout(timer)
    }
  }, [activeTab, assessmentData.risk_reduction_counselling_provided, assessmentData.client_interested_in_prep, clinicalSafetyToastShown])

  // Reset toast state when requirements are met
  useEffect(() => {
    if (isClinicalSafetyAvailable()) {
      setClinicalSafetyToastShown(false)
    }
  }, [assessmentData.risk_reduction_counselling_provided, assessmentData.client_interested_in_prep])

  // Synchronize modal state with risk calculation (only if not manually closed)
  useEffect(() => {
    console.log("🔄 MODAL SYNC CHECK:", {
      shouldShowModal: calculatedRisk?.shouldShowModal,
      currentModalState: showClinicalDecisionModal,
      modalManuallyClosed: modalManuallyClosed,
      riskLevel: calculatedRisk?.level,
      riskScore: calculatedRisk?.score
    });
    
    if (calculatedRisk?.shouldShowModal && !showClinicalDecisionModal && !modalManuallyClosed) {
      console.log("🔄 MODAL SYNC: Opening modal due to risk calculation");
      handleChildModalStateChange('clinical', true);
    }
  }, [calculatedRisk, showClinicalDecisionModal, modalManuallyClosed])

  // Safety guard: Reset modal state when assessment is cleared
  useEffect(() => {
    const completionStatus = getCompletionStatus();
    if (!completionStatus.isComplete && showClinicalDecisionModal) {
      console.log("🔄 SAFETY GUARD: Resetting modal state - assessment cleared");
      setShowClinicalDecisionModal(false);
    }
  }, [assessmentData, showClinicalDecisionModal])

  // Reset manual close flag when assessment data changes (new assessment)
  useEffect(() => {
    if (modalManuallyClosed) {
      console.log("🔄 RESET: Resetting manual close flag for new assessment");
      setModalManuallyClosed(false);
    }
  }, [assessmentData.inconsistent_condom_use, assessmentData.multiple_partners, assessmentData.recent_sti])

  // Component cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 CLEANUP: Resetting modal state on component unmount");
      setShowClinicalDecisionModal(false);
      setCalculatedRisk({
        level: "Unknown",
        score: 0,
        recommendations: [],
        contraindications: [],
        followUpFrequency: "Monthly",
        clinicalActions: [],
        shouldShowModal: false,
        shouldShowToast: false
      });
    };
  }, [])

  // Toast notification functions
  const showMandatoryFieldsToast = (missingFields: string[]) => {
    toast({
      title: "Missing Required Fields",
      description: `Please complete: ${missingFields.join(', ')}`,
      variant: "destructive",
      duration: 5000,
    })
  }

  // Function to validate mandatory fields and return missing field names
  const validateMandatoryFields = () => {
    const completionStatus = getCompletionStatus()
    return completionStatus.missingFields
  }

  // Helper function to validate that required reason fields are filled
  const validateCounselingSection = () => {
    // Section A: If counseling not provided, at least one reason must be selected
    if (assessmentData.risk_reduction_counselling_provided === "no") {
      if (!assessmentData.counselling_not_provided_reasons?.length) {
        return { valid: false, section: "A", message: "Please select at least one reason why counseling was not provided" }
      }
      // If "other" is selected, the text field must be filled
      if (assessmentData.counselling_not_provided_reasons.includes("other") && !assessmentData.counselling_not_provided_other?.trim()) {
        return { valid: false, section: "A", message: "Please specify the other reason for not providing counseling" }
      }
    }
    
    // Section B: If client not interested, at least one reason must be selected
    if (assessmentData.client_interested_in_prep === "no") {
      if (!assessmentData.lack_of_interest_reasons?.length) {
        return { valid: false, section: "B", message: "Please select at least one reason for lack of interest in PrEP" }
      }
      // If "other" is selected, the text field must be filled
      if (assessmentData.lack_of_interest_reasons.includes("other") && !assessmentData.lack_of_interest_other?.trim()) {
        return { valid: false, section: "B", message: "Please specify the other reason for lack of interest" }
      }
    }
    
    // Section C: At least one next step must be selected
    if (!assessmentData.planned_next_steps?.length) {
      return { valid: false, section: "C", message: "Please select at least one planned next step or follow-up action" }
    }
    
    // If "other" is selected in next steps, the text field must be filled
    if (assessmentData.planned_next_steps.includes("other") && !assessmentData.planned_next_steps_other?.trim()) {
      return { valid: false, section: "C", message: "Please specify the other planned next steps" }
    }
    
    return { valid: true, section: null, message: null }
  }

  // Helper function to determine if clinical safety checks should be blocked
  const shouldBlockClinicalSafety = () => {
    const validation = validateCounselingSection()
    if (!validation.valid) return { blocked: true, reason: validation.message }
    
    // Block if counseling not provided or client not interested
    if (assessmentData.risk_reduction_counselling_provided === "no" || 
        assessmentData.client_interested_in_prep === "no") {
      return { blocked: true, reason: "Clinical safety assessment requires completed counseling and client interest" }
    }
    
    return { blocked: false, reason: null }
  }



  const showTabChangePreventedToast = (targetTab: string) => {
    const completionStatus = getCompletionStatus()
    if (completionStatus.missingFields.length > 0) {
      toast({
        title: "Complete Required Fields First",
        description: `Please complete ${completionStatus.missingFields.length} required field(s): ${completionStatus.missingFields.join(', ')}`,
        variant: "destructive",
        duration: 6000,
      })
    }
  }

  // Tab change handler with validation
  const handleTabChange = (newTab: string) => {
    // Allow navigation to assessment tab (no restrictions)
    if (newTab === "assessment") {
      setActiveTab(newTab)
      return
    }

    // For other tabs, check if mandatory fields are completed
    const completionStatus = getCompletionStatus()
    if (!completionStatus.isComplete) {
      showTabChangePreventedToast(newTab)
      return // Prevent tab change
    }

    setActiveTab(newTab)
  }

  // Clinical Safety Screening and Eligibility Assessment
  const evaluateEligibilityAndSafety = (assessment: typeof assessmentData) => {
    const contraindications: string[] = []
    const recommendations: string[] = []
    let eligible = true

    // A. Risk Reduction Counseling - Required
    if (assessment.risk_reduction_counseling_provided !== "yes") {
      recommendations.push("Risk reduction counseling must be provided and client interest confirmed before PrEP initiation")
    }

    // B. Baseline Clinical Safety and Labs
    if (assessment.urinalysis_performed === "yes" && assessment.urinalysis_normal === "no") {
      contraindications.push("Abnormal urinalysis - defer PrEP until further renal assessment")
      eligible = false
      recommendations.push("Defer PrEP until further renal assessment is complete")
    }

    if (assessment.creatinine_confirmed === "no") {
      contraindications.push("Creatinine clearance <50 ml/min")
      eligible = false
      recommendations.push("PrEP contraindicated - refer for nephrology consultation")
    }

    if (assessment.hepatitis_b_screening === "yes") {
      recommendations.push("Hepatitis B positive clients can start PrEP but require ongoing monitoring")
      recommendations.push("If PrEP is stopped, refer for hepatitis B care due to risk of flare")
    }



    // C. Acute HIV Symptoms Assessment
    if (assessment.acute_hiv_symptoms === "yes" && assessment.acute_symptoms_list.length >= 2) {
      contraindications.push("Acute HIV symptoms present - defer PrEP pending HIV RNA testing")
      eligible = false
      recommendations.push("Defer PrEP and perform HIV RNA or antigen/antibody testing immediately")
    }

    // D. Medical History Contraindications
    if (assessment.kidney_disease_history === "yes") {
      contraindications.push("History of kidney disease - defer PrEP")
      eligible = false
      recommendations.push("Defer PrEP and refer for further renal assessment")
      recommendations.push("Repeat renal testing after two weeks if recently abnormal")
    }

    if (assessment.drug_allergy_tenofovir === "yes") {
      contraindications.push("Allergy to tenofovir/emtricitabine - absolute contraindication")
      eligible = false
      recommendations.push("PrEP contraindicated - do not initiate")
    }

    return {
      eligible,
      contraindications,
      recommendations,
      canProceedToPrescription: eligible && contraindications.length === 0
    }
  }

  // Updated risk calculation for ANC clients according to specified 20-point scoring system
  const calculateANCPrepRisk = (assessment: typeof formData) => {
    // CRITICAL FIX: Check if assessment is complete before calculating risk
    const completionStatus = getCompletionStatus();
    
    // Return default state if assessment is incomplete
    if (!completionStatus.isComplete) {
      return {
        level: "Unknown",
        score: 0,
        recommendations: [],
        contraindications: [],
        followUpFrequency: "Monthly",
        clinicalActions: [],
        shouldShowModal: false, // KEY FIX: Don't show modal for incomplete assessments
        shouldShowToast: false
      };
    }
    
    let riskScore = 0
    const recommendations: string[] = []
    const contraindications: string[] = []

    // CLIENT RISK FACTORS (7 points maximum)
    // Inconsistent condom use: 2 points
    if (assessment.inconsistent_condom_use === "no") {
      riskScore += 2
      recommendations.push("Provide intensive counseling on consistent condom use during pregnancy")
      if (assessment.condom_reasons && assessment.condom_reasons.length > 0) {
        recommendations.push(`Address specific barriers: ${assessment.condom_reasons.join(", ")}`)
      }
    }

    // Multiple sexual partners: 2 points
    if (assessment.multiple_partners === "yes") {
      riskScore += 2
      recommendations.push("Counsel on reducing number of sexual partners")
      recommendations.push("Emphasize importance of partner reduction during pregnancy")
    }

    // Recent STI: 3 points
    if (assessment.recent_sti === "yes") {
      riskScore += 3
      recommendations.push("Ensure complete STI treatment before PrEP initiation")
      if (assessment.sti_types && assessment.sti_types.length > 0) {
        recommendations.push(`Follow up on ${assessment.sti_types.join(", ")} treatment completion`)
      }
    }

    // PARTNER RISK FACTORS (11 points maximum)
    // HIV-positive partner not on ART: 3 points
    if (assessment.partner_not_on_art === "yes") {
      riskScore += 3
      recommendations.push("Urgent partner linkage to HIV care and ART initiation")
      recommendations.push("Provide partner ART adherence support and education")
    }

    // HIV-positive partner with detectable viral load: 3 points
    if (assessment.partner_detectable_viral_load === "yes") {
      riskScore += 3
      recommendations.push("Partner viral load monitoring and ART adherence support")
      recommendations.push("Recent detectable viral load - intensify partner support")
    }

    // Partner with multiple partners: 2 points
    if (assessment.partner_multiple_partners === "yes") {
      riskScore += 2
      recommendations.push("Counsel on partner risk reduction and safer sex practices")
      recommendations.push("Address partner multiple sexual relationships")
    }

    // Partner uses injection drugs: 3 points
    if (assessment.partner_injection_drug_use === "yes") {
      riskScore += 3
      recommendations.push("Partner substance abuse counseling and harm reduction")
      recommendations.push("Urgent partner injection drug use intervention and testing")
    }

    // PREGNANCY MODIFIERS (2 points maximum)
    // Second or third trimester: 1 point
    if (assessment.pregnancy_trimester === "second" || assessment.pregnancy_trimester === "third") {
      riskScore += 1
    }

    // Plans to breastfeed: 1 point
    if (assessment.plans_to_breastfeed === "yes") {
      riskScore += 1
    }

    // Cap the score at maximum of 20 points
    riskScore = Math.min(riskScore, 20)

    // CONTRAINDICATIONS (CDC 2025, Zambian guidelines)
    if (assessment.kidney_problems) {
      contraindications.push("Kidney function assessment required (eGFR <60)")
      recommendations.push("Defer PrEP until kidney function evaluated - Alternative prevention methods")
      recommendations.push("Nephrology consultation required before PrEP consideration")
    }

    if (assessment.bone_density_issues) {
      contraindications.push("Bone density evaluation required")
      recommendations.push("Defer PrEP until bone health evaluated - Use alternative prevention")
      recommendations.push("Endocrinology consultation for bone health assessment")
    }

    if (assessment.drug_allergies) {
      contraindications.push("Drug allergy assessment required")
      recommendations.push("Allergy evaluation required before PrEP - Consider alternative prevention")
      recommendations.push("Document specific drug allergies and alternative regimen options")
    }

    // PREGNANCY-SPECIFIC CLINICAL SCENARIOS - Only when PrEP is indicated (moderate or high risk)
    if (riskScore >= 5) {
      if (assessment.pregnancy_trimester === "first" && assessment.plans_to_breastfeed === "yes") {
        recommendations.push("SCENARIO: First trimester, plans to breastfeed - Start PrEP now with monthly follow-up and postpartum continuation through CWC")
      }

      if (assessment.pregnancy_trimester === "third" && riskScore >= 10 && assessment.plans_to_breastfeed === "yes") {
        recommendations.push("SCENARIO: Third trimester, high risk, plans to breastfeed - Initiate PrEP now with postpartum handover instructions and 6-week continuation")
      }

      if (assessment.pregnancy_trimester === "second" && assessment.plans_to_breastfeed === "unsure") {
        recommendations.push("SCENARIO: Second trimester, unsure about breastfeeding - Initiate PrEP if risk score ≥ moderate, reassess at delivery")
      }
    }

    if (assessment.plans_to_breastfeed === "yes" && (assessment.partner_not_on_art === "yes" || assessment.partner_detectable_viral_load === "yes")) {
      recommendations.push("SCENARIO: Breastfeeding planned with partner HIV risk - Initiate PrEP with adherence support and viral suppression monitoring")
    }

    // DETERMINE RISK LEVEL ACCORDING TO REVISED 20-POINT SCORING SYSTEM
    let riskLevel = "Unknown"
    let followUpFrequency = "Monthly"

    if (contraindications.length > 0) {
      riskLevel = "Contraindicated"
      followUpFrequency = "Immediate specialist referral"
    } else if (riskScore >= 10) {
      // High Risk (≥10 points): Strongly recommend and initiate PrEP with enhanced adherence support
      riskLevel = "High Risk"
      followUpFrequency = "Monthly follow-up"
      recommendations.push("Strongly recommend and initiate PrEP with enhanced adherence support")
      recommendations.push("Intensive adherence counseling and monitoring")
    } else if (riskScore >= 5) {
      // Moderate Risk (5-9 points): Offer PrEP; provide focused counselling and schedule close follow-up
      riskLevel = "Moderate Risk"
      followUpFrequency = "Monthly follow-up"
      recommendations.push("Offer PrEP; provide focused counselling and schedule close follow-up")
      recommendations.push("Regular adherence support and risk reduction counseling")
    } else {
      // Low Risk (0-4 points): Reassess at 28 weeks or if new exposure occurs
      riskLevel = "Low Risk"
      followUpFrequency = "Reassess at 28 weeks"
      recommendations.push("Reassess at 28 weeks or if new exposure occurs")
      recommendations.push("Continue risk reduction counseling and prevention education")
    }

    // CONDITIONAL PREGNANCY AND BREASTFEEDING RECOMMENDATIONS - Only when PrEP is indicated and not covered by scenarios
    if (riskScore >= 5 && contraindications.length === 0) {
      // Add general trimester guidance only if specific scenarios don't apply
      const hasSpecificScenario = (assessment.pregnancy_trimester === "first" && assessment.plans_to_breastfeed === "yes") ||
                                 (assessment.pregnancy_trimester === "third" && riskScore >= 10 && assessment.plans_to_breastfeed === "yes") ||
                                 (assessment.pregnancy_trimester === "second" && assessment.plans_to_breastfeed === "unsure")

      if (!hasSpecificScenario) {
        // General trimester-specific recommendations - only for high risk (≥10 points)
        if (riskScore >= 10) {
          if (assessment.pregnancy_trimester === "third") {
            recommendations.push("Third trimester: Final window for PrEP initiation. Prioritize postpartum handover and 6-week follow-up")
          } else if (assessment.pregnancy_trimester === "second") {
            recommendations.push("Second trimester: Still eligible for PrEP. May need faster follow-up and adherence counseling")
          } else if (assessment.pregnancy_trimester === "first") {
            recommendations.push("First trimester: Optimal timing for PrEP initiation with maximum prevention benefit across pregnancy and breastfeeding")
          }
        }

        // General breastfeeding recommendations - only when PrEP is actually indicated
        if (riskScore >= 10) {
          if (assessment.plans_to_breastfeed === "yes") {
            recommendations.push("Plans to breastfeed: Recommend PrEP continuation postpartum until breastfeeding ends")
          } else if (assessment.plans_to_breastfeed === "no") {
            recommendations.push("Not breastfeeding: Consider safe PrEP discontinuation at 6-12 weeks postpartum")
          } else if (assessment.plans_to_breastfeed === "unsure") {
            recommendations.push("Unsure about breastfeeding: Reassess at delivery for continuation decision")
          }
        } else if (riskScore >= 5) {
          // Moderate risk - more conservative recommendations
          if (assessment.plans_to_breastfeed === "yes") {
            recommendations.push("Plans to breastfeed: Discuss PrEP benefits/risks and postpartum options")
          } else if (assessment.plans_to_breastfeed === "unsure") {
            recommendations.push("Unsure about breastfeeding: Discuss PrEP timing and delivery reassessment")
          }
        }
      }
    }

    // ZAMBIAN GUIDELINE SPECIFIC RECOMMENDATIONS - Only for specific partner risk factors
    if (assessment.partner_hiv_status === "positive") {
      recommendations.push("Couple HIV testing and counseling")

      // Only add viral load monitoring if partner has detectable VL or not on ART
      if (assessment.partner_not_on_art === "no") {
        recommendations.push("Urgent partner ART linkage - high transmission risk")
      } else if (assessment.partner_detectable_viral_load === "yes") {
        recommendations.push("Partner HIV viral load monitoring and ART adherence support")
      } else if (assessment.partner_not_on_art === "yes" && assessment.partner_detectable_viral_load === "no") {
        recommendations.push("Continue partner ART adherence support - low transmission risk")
      }
    }

    // PREGNANCY MONITORING (WHO 2024) - Only if PrEP is being considered/initiated
    if ((assessment.pregnancy_trimester || assessment.pregnancy_trimester) && riskScore >= 5) {
      recommendations.push("Monthly pregnancy monitoring during PrEP use")
      recommendations.push("Fetal growth assessment if on PrEP")
    }

    // Generate clinical actions based on risk level
    const clinicalActions: string[] = []
    
    if (riskLevel === "High Risk") {
      clinicalActions.push("Strongly recommend PrEP initiation with comprehensive adherence support")
      clinicalActions.push("Schedule intensive monthly follow-up appointments")
      clinicalActions.push("Provide partner HIV testing and linkage to care")
      clinicalActions.push("Implement pregnancy monitoring protocol during PrEP use")
      if (contraindications.length === 0) {
        clinicalActions.push("Prescribe PrEP regimen and provide adherence counseling")
      }
    } else if (riskLevel === "Moderate Risk") {
      clinicalActions.push("Offer PrEP counseling and discuss benefits/risks")
      clinicalActions.push("Provide comprehensive risk reduction education")
      clinicalActions.push("Schedule monthly follow-up for adherence support")
      clinicalActions.push("Assess partner HIV status and provide couple counseling")
    }

    return {
      level: riskLevel,
      score: riskScore,
      recommendations: [...new Set(recommendations)], // Remove duplicates
      contraindications,
      followUpFrequency,
      clinicalActions,
      shouldShowModal: riskLevel !== "Contraindicated", // Show modal for all risk levels
      shouldShowToast: false // Always use modal instead of toast
    }
  }

  // Assessment completion validation with unified data structure
  const validateAssessmentCompletion = (assessment: typeof assessmentData) => {
    // Use the same logic as getCompletionStatus for consistency
    const completionStatus = getCompletionStatus();
    
    console.log("=== ASSESSMENT COMPLETION VALIDATION ===");
    console.log("Field values:", {
      inconsistent_condom_use: assessment.inconsistent_condom_use,
      multiple_partners: assessment.multiple_partners,
      recent_sti: assessment.recent_sti,
      partner_hiv_status_known: assessment.partner_hiv_status_known,
      partner_hiv_status: assessment.partner_hiv_status,
      partner_not_on_art: assessment.partner_not_on_art,
      partner_detectable_viral_load: assessment.partner_detectable_viral_load,
      partner_multiple_partners: assessment.partner_multiple_partners,
      partner_injection_drug_use: assessment.partner_injection_drug_use,
      pregnancy_trimester: assessment.pregnancy_trimester,
      plans_to_breastfeed: assessment.plans_to_breastfeed
    });
    console.log("Missing fields:", completionStatus.missingFields);
    
    const isComplete = completionStatus.isComplete;
    console.log("Assessment complete:", isComplete);
    
    return isComplete;
  };

  // SEPARATE COMPLETION FUNCTIONS: Risk Assessment vs Eligibility
  
  // Risk Assessment Completion (20-point scoring fields only)
  const getRiskAssessmentCompletion = () => {
    const riskAssessmentFields = [
      { key: 'inconsistent_condom_use', label: 'Consistent condom use' },
      { key: 'multiple_partners', label: 'Multiple partners' },
      { key: 'recent_sti', label: 'Recent STI diagnosis' },
      { key: 'partner_hiv_status_known', label: 'Partner HIV status knowledge' },
      { key: 'partner_hiv_status', label: 'Partner HIV status', conditional: () => assessmentData.partner_hiv_status_known === "yes" },
      { key: 'partner_not_on_art', label: 'Partner ART status', conditional: () => assessmentData.partner_hiv_status === "positive" },
      { key: 'partner_detectable_viral_load', label: 'Partner viral load', conditional: () => assessmentData.partner_hiv_status === "positive" },
      { key: 'partner_multiple_partners', label: 'Partner multiple partners' },
      { key: 'partner_injection_drug_use', label: 'Partner injection drugs' },
      { key: 'pregnancy_trimester', label: 'Current trimester' },
      { key: 'plans_to_breastfeed', label: 'Plans to breastfeed' }
    ];

    const applicableFields = riskAssessmentFields.filter(field => !field.conditional || field.conditional());
    
    const completedFields = applicableFields.filter(field => {
      const value = assessmentData[field.key];
      return value !== "" && value !== null && value !== undefined;
    });
    
    const missingFields = applicableFields.filter(field => {
      const value = assessmentData[field.key];
      return value === "" || value === null || value === undefined;
    });
    
    return {
      isComplete: missingFields.length === 0,
      completedCount: completedFields.length,
      totalCount: applicableFields.length,
      missingFields: missingFields.map(f => f.label)
    };
  };

  // Eligibility Section Completion (for eligibility tab only)
  const getEligibilityCompletion = () => {
    const eligibilityFields = [];

    // Section A & B are always required (counseling and client interest)
    eligibilityFields.push(
      { key: 'risk_reduction_counselling_provided', label: 'Risk reduction counseling provided' },
      { key: 'client_interested_in_prep', label: 'Client interest in PrEP' }
    );

    // Section C fields (only required if section C is visible - client NOT interested)
    if (visibleSections.sectionC) {
      eligibilityFields.push(
        { key: 'planned_next_steps', label: 'Planned next steps', arrayValidation: true }
      );
    }

    // Section D fields (only required if section D is visible - client IS interested)  
    if (visibleSections.sectionD) {
      eligibilityFields.push(
        { key: 'acute_hiv_symptoms', label: 'Acute HIV symptoms assessment' }
      );
    }

    // Section E fields (only required if section E is visible - client IS interested)
    if (visibleSections.sectionE) {
      eligibilityFields.push(
        { key: 'kidney_disease_history', label: 'Kidney disease history' }
      );
    }

    // Section F fields - Baseline Safety Screening
    eligibilityFields.push(
      { key: 'urinalysis_performed', label: 'Urinalysis performed' },
      { key: 'hepatitis_b_screening', label: 'Hepatitis B screening performed' },
      { key: 'syphilis_screening_performed', label: 'Syphilis screening performed' }
    );

    // Conditional result fields - only required when screening was performed
    if (assessmentData.hepatitis_b_screening === "yes") {
      eligibilityFields.push(
        { key: 'hepatitis_b_screening_result', label: 'Hepatitis B screening result' }
      );
    }

    if (assessmentData.syphilis_screening_performed === "yes") {
      eligibilityFields.push(
        { key: 'syphilis_screening_result', label: 'Syphilis screening result' }
      );
    }

    const applicableFields = eligibilityFields;
    
    const completedFields = applicableFields.filter(field => {
      const value = assessmentData[field.key];
      
      // Handle array validation for fields like planned_next_steps
      if (field.arrayValidation) {
        return Array.isArray(value) && value.length > 0;
      }
      
      return value !== "" && value !== null && value !== undefined;
    });
    
    const missingFields = applicableFields.filter(field => {
      const value = assessmentData[field.key];
      
      // Handle array validation for fields like planned_next_steps
      if (field.arrayValidation) {
        return !Array.isArray(value) || value.length === 0;
      }
      
      return value === "" || value === null || value === undefined;
    });
    
    return {
      isComplete: missingFields.length === 0,
      completedCount: completedFields.length,
      totalCount: applicableFields.length,
      missingFields: missingFields.map(f => f.label)
    };
  };

  // COMPREHENSIVE CLINICAL RECOMMENDATION ENGINE
  const generateClinicalRecommendations = (eligibilityData: any, screeningResults: any, riskData: any) => {
    const recommendations = {
      decision: "pending" as "eligible" | "contraindicated" | "conditional" | "pending",
      clinicalContext: "",
      immediateActions: [] as string[],
      monitoringRequirements: [] as string[],
      followUpTimeline: "",
      safetyConsiderations: [] as string[],
      alternativeOptions: [] as string[],
      protocolReferences: [] as string[],
      screeningGuidance: [] as string[]
    };

    // Handle screening result guidance
    if (assessmentData.syphilis_screening_result === "reactive") {
      recommendations.screeningGuidance.push("Syphilis positive - Complete benzathine penicillin treatment course before PrEP initiation");
      recommendations.immediateActions.push("Initiate syphilis treatment with benzathine penicillin 2.4 million units IM");
      recommendations.followUpTimeline = "Reassess for PrEP eligibility after completing syphilis treatment (typically 1-4 weeks)";
    }

    if (assessmentData.hepatitis_b_screening_result === "reactive") {
      recommendations.screeningGuidance.push("Hepatitis B positive - PrEP can be started with enhanced monitoring");
      recommendations.monitoringRequirements.push("Monitor ALT every 3 months during PrEP use");
      recommendations.safetyConsiderations.push("If PrEP is discontinued, refer immediately for hepatitis B care to prevent flare");
    }

    // Main eligibility determination
    if (eligibilityData.status === "excluded") {
      recommendations.decision = "contraindicated";
      
      if (eligibilityData.reason.includes("Renal function concerns")) {
        recommendations.clinicalContext = "Abnormal renal function detected through urinalysis or reported kidney problems. PrEP containing tenofovir requires normal kidney function for safe use.";
        recommendations.immediateActions = [
          "Order serum creatinine and calculate eGFR",
          "Refer to nephrology if eGFR <60 mL/min/1.73m²",
          "Investigate and treat underlying renal condition"
        ];
        recommendations.alternativeOptions = [
          "Focus on intensive risk reduction counseling",
          "Provide condoms and safer sex education",
          "Consider partner-based interventions (partner testing, ART initiation)"
        ];
        recommendations.followUpTimeline = "Reassess kidney function in 3 months; consider PrEP if function normalizes";
        recommendations.protocolReferences = ["WHO PrEP Guidelines 2017", "Zambian ART Guidelines 2020"];
      }

      if (eligibilityData.reason.includes("acute HIV symptoms")) {
        recommendations.clinicalContext = "Multiple acute HIV symptoms present suggest possible acute HIV infection. HIV testing required before PrEP initiation.";
        recommendations.immediateActions = [
          "Perform HIV rapid test immediately",
          "If negative, order HIV RNA/DNA PCR for acute infection",
          "Counsel on window period and repeat testing"
        ];
        recommendations.followUpTimeline = "Repeat HIV testing in 2-4 weeks if initial tests negative";
        recommendations.protocolReferences = ["WHO HIV Testing Guidelines", "Zambian HTS Guidelines"];
      }

      if (eligibilityData.reason.includes("drug allergy")) {
        recommendations.clinicalContext = "Known allergy to tenofovir or emtricitabine components of PrEP regimen.";
        recommendations.immediateActions = [
          "Document specific allergy details",
          "Consider allergy testing if uncertainty exists"
        ];
        recommendations.alternativeOptions = [
          "Alternative PrEP regimens if available",
          "Enhanced behavioral interventions",
          "Partner-focused prevention strategies"
        ];
      }

    } else if (eligibilityData.status === "eligible") {
      recommendations.decision = "eligible";
      
      if (riskData.score >= 10) {
        recommendations.clinicalContext = `High HIV acquisition risk identified (${riskData.score}/20 points). Strong clinical indication for PrEP initiation with comprehensive support.`;
        recommendations.immediateActions = [
          "Initiate PrEP (TDF/FTC) with first dose today",
          "Provide intensive adherence counseling",
          "Schedule 1-month follow-up appointment",
          "Provide emergency contact information"
        ];
        recommendations.monitoringRequirements = [
          "Monthly follow-up for first 3 months",
          "HIV testing every 3 months",
          "Creatinine monitoring every 6 months",
          "STI screening every 6 months"
        ];
        recommendations.followUpTimeline = "1 month (adherence check), 3 months (HIV/STI screening), then quarterly";
      } else if (riskData.score >= 5) {
        recommendations.clinicalContext = `Moderate HIV acquisition risk identified (${riskData.score}/20 points). PrEP recommended with focused counseling and support.`;
        recommendations.immediateActions = [
          "Offer PrEP initiation with counseling",
          "Provide risk reduction education",
          "Schedule follow-up in 1 month"
        ];
        recommendations.monitoringRequirements = [
          "Follow-up in 1 month for adherence assessment",
          "HIV testing every 3 months",
          "STI screening every 6 months"
        ];
        recommendations.followUpTimeline = "1 month (adherence), then quarterly monitoring";
      }
      
      recommendations.safetyConsiderations = [
        "Monitor for side effects (nausea, headache) in first month",
        "Emphasize consistent daily dosing",
        "Address any adherence barriers promptly"
      ];
      recommendations.protocolReferences = ["WHO PrEP Guidelines 2017", "Zambian PrEP Implementation Guidelines"];

    } else if (eligibilityData.status === "low_risk") {
      recommendations.decision = "conditional";
      recommendations.clinicalContext = `Lower HIV acquisition risk identified (${riskData.score}/20 points). Focus on risk reduction counseling with PrEP as option if risk increases.`;
      recommendations.immediateActions = [
        "Provide comprehensive risk reduction counseling",
        "Discuss safer sex practices and consistent condom use",
        "Assess partner HIV status and linkage to care"
      ];
      recommendations.alternativeOptions = [
        "Intensive behavioral counseling",
        "Partner HIV testing and treatment",
        "Regular risk reassessment"
      ];
      recommendations.followUpTimeline = "3-6 months for risk reassessment";
    }

    return recommendations;
  };

  // WHO/ZCG AUTOMATIC ELIGIBILITY DETERMINATION
  const calculateAutomaticEligibility = () => {
    // Step 1: Check if risk assessment is complete (minimum requirement)
    const riskCompletion = getRiskAssessmentCompletion();
    
    // Allow pending status when assessment incomplete
    if (!riskCompletion.isComplete || !assessmentData.client_interested_in_prep) {
      return {
        eligible: null,
        reason: "Assessment incomplete - continue completing fields",
        status: "pending"
      };
    }

    // Step 2: ABSOLUTE EXCLUSIONS (Auto "No, defer PrEP")
    const exclusions = [];
    
    // Acute HIV Symptoms - ≥2 symptoms with unconfirmed status
    if (assessmentData.acute_symptoms_list && assessmentData.acute_symptoms_list.length >= 2) {
      exclusions.push("≥2 acute HIV symptoms present");
    }
    
    // Renal Function - abnormal urinalysis or kidney problems
    if (assessmentData.kidney_problems || 
        (assessmentData.urinalysis_performed === "yes" && assessmentData.urinalysis_normal === "no")) {
      exclusions.push("Renal function concerns (abnormal urinalysis or kidney problems)");
    }
    
    // Drug Allergies - Known allergy to tenofovir or emtricitabine
    if (assessmentData.drug_allergies) {
      exclusions.push("Known allergy to tenofovir or emtricitabine");
    }
    
    // Client Willingness - Client declines
    if (assessmentData.client_interested_in_prep === "no") {
      exclusions.push("Client declined PrEP");
    }

    // Step 3: REQUIRED SAFETY ASSESSMENTS (defer if missing critical ones)
    const criticalMissing = [];
    
    // Urinalysis - critical for renal screening
    if (assessmentData.urinalysis_performed !== "yes") {
      criticalMissing.push("Urinalysis required for safety screening");
    }
    
    // Risk-reduction counseling - WHO requirement
    if (assessmentData.risk_reduction_counselling_provided !== "yes") {
      criticalMissing.push("Risk-reduction counseling required");
    }

    // Step 4: Apply WHO/ZCG decision logic
    if (exclusions.length > 0) {
      return {
        eligible: false,
        reason: `Exclusion criteria: ${exclusions.join("; ")}`,
        status: "excluded"
      };
    }
    
    if (criticalMissing.length > 0) {
      return {
        eligible: false,
        reason: `Critical requirements missing: ${criticalMissing.join("; ")}`,
        status: "incomplete"
      };
    }
    
    // Step 5: Risk-based eligibility (when safety criteria met)
    const riskScore = currentRisk.score;
    
    if (riskScore >= 5) { // Moderate or High Risk
      return {
        eligible: true,
        reason: riskScore >= 10 ? 
          "High risk (≥10 points) - Strongly recommend PrEP initiation" :
          "Moderate risk (5-9 points) - Offer PrEP with focused counseling",
        status: "eligible"
      };
    } else {
      return {
        eligible: false,
        reason: "Low risk (0-4 points) - Reassess at 28 weeks or if new exposure",
        status: "low_risk"
      };
    }
  };

  // Main completion function - USE RISK ASSESSMENT ONLY for modal triggers
  const getCompletionStatus = () => {
    const riskCompletion = getRiskAssessmentCompletion();
    
    console.log("=== RISK ASSESSMENT COMPLETION CHECK ===");
    console.log("Risk assessment complete:", riskCompletion.isComplete);
    console.log("Completed fields:", riskCompletion.completedCount, "/", riskCompletion.totalCount);
    console.log("Missing fields:", riskCompletion.missingFields);
    
    return riskCompletion;
  };

  // Calculate risk whenever assessment data changes (for real-time display only)
  // Real-time risk calculation using useMemo for performance
  const currentRisk = useMemo(() => {
    const calculationData = {
      ...formData,
      ...assessmentData
    }
    
    // For real-time display, show partial risk calculation even when incomplete
    let riskScore = 0
    
    // CLIENT RISK FACTORS
    if (assessmentData.inconsistent_condom_use === "no") {
      riskScore += 2
    }
    if (assessmentData.multiple_partners === "yes") {
      riskScore += 2
    }
    if (assessmentData.recent_sti === "yes") {
      riskScore += 3
    }
    
    // PARTNER RISK FACTORS
    if (assessmentData.partner_not_on_art === "yes") {
      riskScore += 3
    }
    if (assessmentData.partner_detectable_viral_load === "yes") {
      riskScore += 3
    }
    if (assessmentData.partner_multiple_partners === "yes") {
      riskScore += 2
    }
    if (assessmentData.partner_injection_drug_use === "yes") {
      riskScore += 3
    }
    
    // PREGNANCY MODIFIERS
    if (assessmentData.pregnancy_trimester === "second" || assessmentData.pregnancy_trimester === "third") {
      riskScore += 1
    }
    if (assessmentData.plans_to_breastfeed === "yes") {
      riskScore += 1
    }
    
    // Determine risk level based on score - CORRECTED THRESHOLDS
    let level = "Unknown"
    if (riskScore === 0 && getCompletionStatus().completedCount === 0) {
      level = "Unknown"
    } else if (riskScore >= 10) {
      level = "High Risk" // Consistent with calculateANCPrepRisk format
    } else if (riskScore >= 5) {
      level = "Moderate Risk" // Consistent with calculateANCPrepRisk format  
    } else {
      level = "Low Risk" // Consistent with calculateANCPrepRisk format
    }
    
    return {
      score: riskScore,
      level,
      shouldShowModal: false, // Keep existing modal logic intact
      shouldShowToast: false
    }
  }, [assessmentData, formData])

  // REAL-TIME AUTO-ELIGIBILITY CALCULATION
  const autoEligibility = useMemo(() => {
    const result = calculateAutomaticEligibility();
    console.log("=== AUTO-ELIGIBILITY CALCULATION ===");
    console.log("Eligibility status:", result.status);
    console.log("Eligible:", result.eligible);
    console.log("Reason:", result.reason);
    return result;
  }, [assessmentData, currentRisk])

  // AUTO-POPULATE ELIGIBLE_FOR_PREP FIELD
  useEffect(() => {
    if (autoEligibility.eligible !== null) {
      setAssessmentData(prev => ({
        ...prev,
        eligible_for_prep: autoEligibility.eligible
      }));
      console.log("🔄 AUTO-POPULATED eligible_for_prep:", autoEligibility.eligible);
    }
  }, [autoEligibility.eligible])

  // Check if Sections B, D, and E are complete before allowing deferral modal
  const areRequiredSectionsComplete = () => {
    // Section B: Client Interest Assessment
    const sectionBComplete = assessmentData.risk_reduction_counselling_provided && 
                            assessmentData.client_interested_in_prep;
    
    // Section D: Acute HIV Symptoms (only required if client interested)
    const sectionDComplete = assessmentData.client_interested_in_prep !== "yes" || 
                             assessmentData.acute_hiv_symptoms;
    
    // Section E: Medical History (only required if client interested)  
    const sectionEComplete = assessmentData.client_interested_in_prep !== "yes" ||
                             (assessmentData.kidney_disease_history !== undefined &&
                              assessmentData.bone_density_problems !== undefined &&
                              assessmentData.drug_allergies_history !== undefined);
    
    return sectionBComplete && sectionDComplete && sectionEComplete;
  };

  // DEFERRAL MODAL TRIGGER LOGIC - Only after required sections complete
  useEffect(() => {
    const sectionsComplete = areRequiredSectionsComplete();
    
    console.log("🚫 DEFERRAL MODAL CHECK:", {
      eligible: autoEligibility.eligible,
      acknowledged: deferralAcknowledged,
      modalOpen: showDeferralModal,
      status: autoEligibility.status,
      reason: autoEligibility.reason,
      sectionsComplete,
      sectionB: assessmentData.risk_reduction_counselling_provided && assessmentData.client_interested_in_prep,
      sectionD: assessmentData.client_interested_in_prep !== "yes" || assessmentData.acute_hiv_symptoms,
      sectionE: assessmentData.client_interested_in_prep !== "yes" || 
               (assessmentData.kidney_disease_history !== undefined && assessmentData.bone_density_problems !== undefined)
    });
    
    if (autoEligibility.eligible === false && 
        !deferralAcknowledged && 
        !showDeferralModal && 
        sectionsComplete) {
      console.log("🚫 TRIGGERING DEFERRAL MODAL: All conditions met, required sections complete");
      handleChildModalStateChange('deferral', true);
    } else if (autoEligibility.eligible === false && !sectionsComplete) {
      console.log("🚫 DEFERRAL MODAL DEFERRED: Waiting for Sections B, D, E completion");
    }
  }, [autoEligibility, deferralAcknowledged, showDeferralModal, assessmentData.risk_reduction_counselling_provided, 
      assessmentData.client_interested_in_prep, assessmentData.acute_hiv_symptoms, 
      assessmentData.kidney_disease_history, assessmentData.bone_density_problems, assessmentData.drug_allergies_history])

  // DEFERRAL ACKNOWLEDGMENT HANDLER
  const handleDeferralAcknowledgment = () => {
    console.log("🚫 DEFERRAL ACKNOWLEDGED: Clinician has reviewed deferral decision");
    setDeferralAcknowledged(true);
    handleChildModalStateChange('deferral', false);
  }

  // Completion status for real-time display
  const completionStatus = useMemo(() => {
    return getCompletionStatus()
  }, [assessmentData])

  // Assessment completion flag
  const isAssessmentComplete = useMemo(() => {
    return completionStatus.isComplete
  }, [completionStatus])

  // Section F access control - requires BOTH risk assessment AND eligibility sections D/E completion
  const canAccessSectionF = useMemo(() => {
    const riskComplete = completionStatus.isComplete;
    const eligibilityCompletion = getEligibilityCompletion();
    
    // Check if sections D and E are required and completed
    let sectionsComplete = true;
    
    // Section D (Acute HIV) is required when client is interested in PrEP
    if (visibleSections.sectionD) {
      const hasAcuteHivAssessment = assessmentData.acute_hiv_symptoms && 
                                   Array.isArray(assessmentData.acute_hiv_symptoms) && 
                                   assessmentData.acute_hiv_symptoms.length > 0;
      if (!hasAcuteHivAssessment) {
        sectionsComplete = false;
      }
    }
    
    // Section E (Medical History) is required when client is interested in PrEP
    if (visibleSections.sectionE) {
      const hasMedicalHistory = assessmentData.kidney_disease_history !== "" && 
                               assessmentData.kidney_disease_history !== null && 
                               assessmentData.kidney_disease_history !== undefined;
      if (!hasMedicalHistory) {
        sectionsComplete = false;
      }
    }
    
    return riskComplete && sectionsComplete;
  }, [completionStatus, assessmentData, visibleSections])

  // Handle Section F interaction attempts
  const handleSectionFAttempt = () => {
    if (!canAccessSectionF) {
      const missingSections = [];
      
      // Check what's missing and build appropriate message
      if (!completionStatus.isComplete) {
        toast({
          title: "Complete Risk Assessment First",
          description: `Please complete all ${completionStatus.totalCount - completionStatus.completedCount} remaining risk assessment questions before determining eligibility.`,
          variant: "destructive"
        });
        return;
      }
      
      // If risk assessment is complete, check eligibility sections
      if (visibleSections.sectionD && (!assessmentData.acute_hiv_symptoms || !Array.isArray(assessmentData.acute_hiv_symptoms) || assessmentData.acute_hiv_symptoms.length === 0)) {
        missingSections.push("Section D: Acute HIV Symptoms Assessment");
      }
      
      if (visibleSections.sectionE && (!assessmentData.kidney_disease_history || assessmentData.kidney_disease_history === "")) {
        missingSections.push("Section E: Medical History Contraindications");
      }
      
      if (missingSections.length > 0) {
        toast({
          title: "Complete Required Sections",
          description: `Please complete: ${missingSections.join(" and ")}`,
          variant: "destructive"
        });
      }
    }
  }

  useEffect(() => {
    // Use unified assessmentData directly for calculation
    const calculationData = {
      ...formData,
      ...assessmentData // Unified data structure eliminates mapping complexity
    }
    
    const riskResult = calculateANCPrepRisk(calculationData)
    setCalculatedRisk(riskResult)
    console.log("=== RISK CALCULATION DEBUG ===")
    console.log("Assessment data:", assessmentData)
    console.log("Calculation result:", riskResult)
    // Remove automatic modal/toast triggers - only update risk display
  }, [assessmentData, formData])
  
  // Separate useEffect for eligibility assessment and clinical recommendations
  useEffect(() => {
    const eligibilityResult = autoEligibility;
    setEligibilityData(eligibilityResult);
    
    // Generate clinical recommendations if we have eligibility data and screening results
    if (eligibilityResult && eligibilityResult.status !== "pending") {
      const screeningResults = {
        syphilis: assessmentData.syphilis_screening_result,
        hepatitis_b: assessmentData.hepatitis_b_screening_result
      };
      
      const recommendations = generateClinicalRecommendations(eligibilityResult, screeningResults, calculatedRisk);
      setClinicalRecommendations(recommendations);
      
      console.log("=== CLINICAL RECOMMENDATIONS DEBUG ===");
      console.log("Eligibility:", eligibilityResult);
      console.log("Screening:", screeningResults);
      console.log("Recommendations:", recommendations);
    }
  }, [autoEligibility, assessmentData.syphilis_screening_result, assessmentData.hepatitis_b_screening_result, calculatedRisk])

  // Real-time completion check - ONLY for status display, NO modal triggering
  useEffect(() => {
    const completionStatus = getCompletionStatus();
    console.log("=== REAL-TIME COMPLETION CHECK ===");
    console.log("Completion status:", completionStatus);
    console.log("Calculated risk:", calculatedRisk);
    console.log("Current modal state:", showClinicalDecisionModal);
    
    // REMOVED: Modal triggering to prevent conflicts with manual triggers
    // Only display completion status for debugging
    if (!completionStatus.isComplete) {
      console.log("⏳ WAITING: Assessment not complete -", completionStatus.missingFields.length, "fields missing");
    }
  }, [assessmentData, showClinicalDecisionModal])

  // Auto-open eligibility modal when eligibility section is complete
  useEffect(() => {
    const eligibilityCompletion = validateEligibilityCompletion();
    console.log("=== ELIGIBILITY AUTO-OPEN CHECK ===");
    console.log("Eligibility completion:", eligibilityCompletion);
    console.log("Current eligibility modal state:", showEligibilityModal);
    console.log("Current clinical modal state:", showClinicalDecisionModal);
    
    // Auto-open eligibility modal when eligibility section is complete
    if (eligibilityCompletion.isComplete && !showEligibilityModal && !showClinicalDecisionModal) {
      console.log("🔄 AUTO-OPENING: Eligibility recommendations modal");
      handleChildModalStateChange('eligibility', true);
      
      toast({
        title: "Eligibility Assessment Complete",
        description: "View clinical recommendations and next steps",
        duration: 3000,
      });
    }
  }, [assessmentData, showEligibilityModal, showClinicalDecisionModal])

  // Handle completion-based modal/toast triggers with enhanced debugging
  const handleAssessmentCompletion = (updatedAssessment: typeof assessmentData) => {
    console.log("=== ASSESSMENT COMPLETION HANDLER ===");
    console.log("Updated assessment:", updatedAssessment);
    
    const isComplete = validateAssessmentCompletion(updatedAssessment);
    console.log("Assessment complete:", isComplete);
    
    if (isComplete) {
      // Reset manual close flag for new assessments
      setModalManuallyClosed(false);
      console.log("🔄 RESET: Manual close flag cleared for new assessment");
      
      // Use unified assessmentData directly for calculation
      const calculationData = {
        ...formData,
        ...updatedAssessment // Unified data structure eliminates mapping complexity
      }
      
      const riskResult = calculateANCPrepRisk(calculationData);
      console.log("Risk calculation result:", riskResult);
      console.log("Risk result shouldShowModal:", riskResult.shouldShowModal);
      console.log("Risk result shouldShowToast:", riskResult.shouldShowToast);
      
      // Update the calculated risk state
      setCalculatedRisk(riskResult);
      
      // Modal will be triggered by the useEffect that watches calculatedRisk changes
      console.log("Risk result updated - modal will be triggered by useEffect if shouldShowModal is true");
      
      // Show toast for low risk only
      if (riskResult.shouldShowToast) {
        console.log("Triggering low risk toast");
        toast({
          title: "Low Risk Assessment",
          description: "Reassess at 28 weeks or upon emergence of new exposure risk",
          variant: "default",
          duration: 4000
        });
      }
    } else {
      console.log("Assessment not complete, skipping modal/toast triggers");
    }
  };

  // Given-When-Then workflow steps definition
  const eligibilitySteps = [
    {
      id: 'medical-history',
      title: 'Medical History & Contraindications',
      subtitle: 'After HIV-negative result + risk assessment, before prescribing PrEP',
      givenWhenThen: {
        given: 'Client has completed risk assessment with HIV-negative result',
        when: 'Medical history and contraindications are assessed',
        then: 'PrEP eligibility is determined or contraindications are identified'
      },
      icon: '🏥',
      color: 'blue'
    },
    {
      id: 'acute-symptoms',
      title: 'Acute HIV Symptoms Screening',
      subtitle: 'At first PrEP eligibility check and before each new PrEP initiation',
      givenWhenThen: {
        given: 'Client is presenting for PrEP assessment',
        when: 'Acute HIV symptoms are screened',
        then: 'HIV testing is recommended or PrEP eligibility is confirmed'
      },
      icon: '🔍',
      color: 'orange'
    },
    {
      id: 'baseline-investigations',
      title: 'Baseline Investigations',
      subtitle: 'At PrEP initiation (or drawn and followed up before first refill if delay needed)',
      givenWhenThen: {
        given: 'Client is eligible for PrEP',
        when: 'Baseline investigations are ordered',
        then: 'Safe PrEP initiation is confirmed or follow-up is scheduled'
      },
      icon: '🧪',
      color: 'green'
    }
  ]

  // Handle step completion
  const handleStepCompletion = (stepIndex: number) => {
    setEligibilityWorkflow(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(stepIndex) 
        ? prev.completedSteps 
        : [...prev.completedSteps, stepIndex]
    }))
  }

  // Handle POC Tests integration
  const handleTestNowRequest = (testType: string) => {
    console.log(`🧪 POC Test request for: ${testType}`)
    
    // Set the follow-up flag to show the "test now" option
    setBaselineTestFollowUp(prev => {
      const newState = {
        ...prev,
        [`${testType}_test_now`]: true
      }
      console.log(`🔄 Updated baselineTestFollowUp:`, newState)
      return newState
    })
  }

  const handleOrderPOCTest = (testType: string) => {
    console.log(`Opening POC Tests modal for: ${testType}`)
    
    // Pre-select the appropriate test in POC interface
    const testMapping = {
      'urinalysis_performed': 'Urinalysis',
      'creatinine_confirmed': 'Serum Creatinine', 
      'hepatitis_b_screening': 'Hepatitis B Surface Antigen',
      'syphilis_screening_performed': 'Syphilis Tests'
    }
    
    // Open POC Tests modal with pre-selected test
    handleChildModalStateChange('poc', true)
  }

  const handlePOCTestsClose = () => {
    handleChildModalStateChange('poc', false)
  }

  const handlePOCTestsSave = (tests: POCTestData[]) => {
    console.log("POC Tests ordered:", tests)
    
    // Update PrEP assessment to reflect that tests have been ordered
    tests.forEach(test => {
      const testName = test.selectTest
      if (testName === 'Urinalysis') {
        setAssessmentData(prev => ({ ...prev, urinalysis_performed: 'pending' }))
      } else if (testName === 'Serum Creatinine') {
        setAssessmentData(prev => ({ ...prev, creatinine_confirmed: 'pending' }))
      } else if (testName === 'Hepatitis B Surface Antigen') {
        setAssessmentData(prev => ({ ...prev, hepatitis_b_screening: 'pending' }))
      } else if (testName === 'Syphilis Tests') {
        setAssessmentData(prev => ({ ...prev, syphilis_screening_performed: 'pending' }))
      }
    })
    
    // Show success toast
    toast({
      title: "Tests Ordered",
      description: `${tests.length} test(s) have been ordered successfully`,
      variant: "default",
    })
    
    handleChildModalStateChange('poc', false)
  }

  // Handle PrEP initiation from risk decision modal
  const handlePrepInitiation = () => {
    console.log("PrEP initiation requested - Opening prescription tab")
    // Switch to prescription tab automatically
    setActiveTab("prescription")
    // Update form data to reflect PrEP initiation
    setAssessmentData(prev => ({
      ...prev,
      prescribed_at_initial_visit: true,
      adherence_counselling: true
    }))
  }

  // Enhanced modal close handler with manual close flag
  const handleModalClose = () => {
    console.log("🔘 MODAL CLOSE: Setting manual close flag");
    setModalManuallyClosed(true);
    handleChildModalStateChange('clinical', false);
  }

  // Handle follow-up scheduling from risk decision modal
  const handleFollowUpScheduling = () => {
    console.log("Follow-up scheduling requested - Opening follow-up tab")
    // Switch to follow-up tab automatically
    setActiveTab("follow-up")
    // Set appropriate follow-up type based on risk level
    const followUpType = calculatedRisk.level === "High Risk" ? "scheduled-prep" : "retesting"
    setAssessmentData(prev => ({
      ...prev,
      follow_up_type: followUpType
    }))
  }

  // Handle actions from dynamic alert modal
  const handleDynamicAlertAction = (action: string) => {
    console.log("Dynamic alert action:", action)
    
    switch (action) {
      case 'INITIATE_PREP':
        console.log("PrEP initiation requested - Navigating to eligibility tab")
        
        // Set navigation flag to prevent modal closure
        setIsNavigating(true)
        
        // Close ONLY the alert modal, keep main PrEP modal open
        setShowClinicalDecisionModal(false)
        setModalManuallyClosed(true) // Prevent alert from reopening
        
        // Switch to eligibility tab (main modal stays open)
        setActiveTab("eligibility")
        
        // Update form data to reflect PrEP initiation intent
        setAssessmentData(prev => ({
          ...prev,
          offered_prep: true,
          prep_accepted: true
        }))
        
        // Show confirmation toast
        toast({
          title: "Navigated to Eligibility Assessment",
          description: "Complete the clinical safety screening to determine PrEP eligibility",
          duration: 4000,
        })
        
        // Clear navigation flag after a brief delay
        setTimeout(() => {
          setIsNavigating(false)
          console.log("Navigation complete - main modal should remain open")
        }, 1000)
        break
      
      case 'SCHEDULE_REASSESSMENT':
        console.log("Reassessment scheduled - Opening follow-up tab")
        // Switch to follow-up tab for reassessment scheduling
        setActiveTab("follow-up")
        // Set follow-up type for reassessment
        setAssessmentData(prev => ({
          ...prev,
          follow_up_type: "retesting"
        }))
        // Close the modal with manual close flag
        setModalManuallyClosed(true)
        setShowClinicalDecisionModal(false)
        break
      
      default:
        console.log("Unknown action:", action)
        break
    }
  }

  // Enhanced child modal state management to prevent main modal interference
  const handleChildModalStateChange = (childModalName: string, isOpen: boolean) => {
    console.log(`🔄 CHILD MODAL STATE: ${childModalName} -> ${isOpen}`)
    
    // Set transition flag to prevent main modal interference
    setIsChildModalTransition(true)
    setLastUserInteraction('child')
    
    // Update child modal state
    switch(childModalName) {
      case 'eligibility':
        setShowEligibilityModal(isOpen)
        break
      case 'clinical':
        setShowClinicalDecisionModal(isOpen)
        break
      case 'poc':
        setShowPOCTestsModal(isOpen)
        break
      case 'deferral':
        setShowDeferralModal(isOpen)
        break
    }
    
    // Reset transition flag after state update
    setTimeout(() => {
      setIsChildModalTransition(false)
    }, 100)
  }

  // Enhanced event isolation for child modal interactions
  const handleChildModalEvents = (event: React.MouseEvent | React.KeyboardEvent) => {
    // Stop propagation to prevent triggering parent modal handlers
    event.stopPropagation()
    setLastUserInteraction('child')
  }

  const handleEligibilityAction = (action: string) => {
    console.log("🔘 Eligibility action:", action)
    
    switch (action) {
      case 'INITIATE_PREP_AND_PRESCRIBE':
        console.log("PrEP initiation approved - continuing to prescription workflow")
        
        // Update assessment data to reflect PrEP initiation
        setAssessmentData(prev => ({
          ...prev,
          offered_prep: true,
          prep_accepted: true,
          prep_eligible: true
        }))
        
        // Close eligibility modal with enhanced state management
        handleChildModalStateChange('eligibility', false)
        
        // Switch to eligibility tab to complete prescription details
        setActiveTab("eligibility")
        
        // Scroll to prescription section
        setTimeout(() => {
          const prescriptionSection = document.querySelector('[data-section="prescription"]');
          if (prescriptionSection) {
            prescriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
        
        toast({
          title: "PrEP Initiation & Prescription",
          description: "Complete prescription details in the eligibility tab",
          duration: 4000,
        })
        break
      
      case 'DEFER_PREP':
        console.log("PrEP deferred due to contraindications")
        
        // Update assessment data
        setAssessmentData(prev => ({
          ...prev,
          offered_prep: true,
          prep_accepted: false,
          prep_eligible: false
        }))
        
        // Close eligibility modal and show deferral modal with enhanced state management
        handleChildModalStateChange('eligibility', false)
        setTimeout(() => handleChildModalStateChange('deferral', true), 150)
        
        toast({
          title: "PrEP Deferred",
          description: "Address contraindications before PrEP eligibility",
          duration: 4000,
        })
        break
      
      case 'REASSESS_LATER':
        console.log("PrEP reassessment scheduled")
        
        // Update assessment data
        setAssessmentData(prev => ({
          ...prev,
          offered_prep: true,
          prep_accepted: false, // Conditional acceptance
          prep_eligible: null  // Pending reassessment
        }))
        
        // Close eligibility modal and switch to follow-up tab with enhanced state management
        handleChildModalStateChange('eligibility', false)
        setActiveTab("follow-up")
        
        toast({
          title: "Reassessment Scheduled",
          description: "Complete follow-up arrangements in the follow-up tab",
          duration: 4000,
        })
        break
      
      case 'DOCUMENT_ASSESSMENT':
        console.log("Documenting eligibility assessment")
        
        // Close eligibility modal with enhanced state management
        handleChildModalStateChange('eligibility', false)
        
        toast({
          title: "Assessment Documented",
          description: "Eligibility assessment has been recorded",
          duration: 3000,
        })
        break

      case 'SCHEDULE_FOLLOWUP':
        console.log("🔘 Schedule Follow-up Assessment")
        
        // Close eligibility modal with enhanced state management
        handleChildModalStateChange('eligibility', false)
        
        // Navigate to follow-up tab for appointment scheduling
        setActiveTab("follow-up")
        
        toast({
          title: "Follow-up Assessment",
          description: "Schedule next PrEP assessment visit in the follow-up tab",
          duration: 4000,
        })
        break
      
      default:
        console.log("Unknown eligibility action:", action)
        break
    }
  }

  // Handle step navigation
  const handleStepNavigation = (stepIndex: number) => {
    setEligibilityWorkflow(prev => ({
      ...prev,
      currentStep: stepIndex
    }))
  }

  // Handle risk assessment changes
  const handleRiskAssessmentChange = (field: string, value: boolean) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Field completion toast notification
  // Field completion toast removed - focusing on missing field guidance only

  // Simplified modal state setter - removed complex locking mechanism
  const setModalState = (newState: boolean, reason: string) => {
    console.log(`🔒 MODAL STATE CHANGE: ${newState} - Reason: ${reason}`);
    setShowClinicalDecisionModal(newState);
  };

  // Simplified modal trigger function with proper state synchronization removed

  // Enhanced validation function for counseling and client interest requirements
  const validateCounselingRequirements = () => {
    const errors: string[] = [];
    
    // Section A: Risk Reduction Counseling validation
    if (assessmentData.risk_reduction_counselling_provided === "no") {
      if (!assessmentData.counselling_not_provided_reasons?.length) {
        errors.push("Please select at least one reason why counseling was not provided.");
      }
      
      if (assessmentData.counselling_not_provided_reasons?.includes('other') && 
          !assessmentData.counselling_not_provided_other?.trim()) {
        errors.push("Please specify the other reason for not providing counseling.");
      }
    }
    
    // Section B: Client Interest validation
    if (assessmentData.client_interested_in_prep === "no") {
      if (!assessmentData.lack_of_interest_reasons?.length) {
        errors.push("Please select at least one reason for lack of interest in PrEP.");
      }
      
      if (assessmentData.lack_of_interest_reasons?.includes('other') && 
          !assessmentData.lack_of_interest_other?.trim()) {
        errors.push("Please specify the other reason for lack of interest.");
      }
    }
    
    // Section C: Planned Next Steps validation (always required)
    if (!assessmentData.planned_next_steps?.length) {
      errors.push("Please select at least one planned next step for follow-up.");
    }
    
    if (assessmentData.planned_next_steps?.includes('other') && 
        !assessmentData.planned_next_steps_other?.trim()) {
      errors.push("Please specify the other planned next steps.");
    }
    
    // Date validation for counseling-related follow-up
    if ((assessmentData.planned_next_steps?.includes('schedule_future_counselling') || 
         assessmentData.planned_next_steps?.includes('offer_prep_next_anc')) &&
        !assessmentData.next_counselling_date) {
      errors.push("Please provide a date for the scheduled counseling follow-up.");
    }
    
    return errors;
  };

  // PHASE 2: Enhanced save button handler
  const handleSave = async () => {
    console.log("💾 SAVE BUTTON CLICKED");
    try {
      setIsLoading(true);
      
      // Validate basic form requirements
      if (!assessmentData) {
        toast({
          title: "Error",
          description: "No assessment data to save.",
          variant: "destructive",
        });
        return;
      }

      // Validate counseling and client interest requirements
      const counselingErrors = validateCounselingRequirements();
      if (counselingErrors.length > 0) {
        toast({
          title: "Counseling Assessment Incomplete",
          description: counselingErrors.join(" "),
          variant: "destructive",
        });
        return;
      }

      // Simulate save process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Assessment Saved",
        description: "ANC PrEP assessment has been saved successfully.",
      });

      // PHASE 2: Check if modal should trigger after save
      console.log("💾 SAVE BUTTON: Checking if modal should trigger after save");
      const completionStatus = getCompletionStatus();
      console.log("💾 SAVE COMPLETION STATUS:", completionStatus);
      
      if (completionStatus.isComplete) {
        console.log("💾 SAVE TRIGGER: Assessment is complete, calculating risk");
        
        const calculationData = {
          ...formData,
          ...assessmentData
        };
        
        const riskResult = calculateANCPrepRisk(calculationData);
        console.log("💾 SAVE RISK CALCULATION:", riskResult);
        
        // Update risk state, modal will be triggered by useEffect
        setCalculatedRisk(riskResult);
        console.log("💾 SAVE: Risk state updated, modal will trigger via useEffect");
      } else {
        console.log("💾 SAVE: Assessment not complete, no modal trigger");
      }
      
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // PHASE 3: Enhanced field completion tracking with ANY field trigger
  const handleFieldCompletion = (fieldName: string, value: any, displayName: string) => {
    const previousValue = assessmentData[fieldName as keyof typeof assessmentData]
    
    // Update the field value first
    setAssessmentData(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Field completion toast removed - focusing on missing field guidance only
    
    // PHASE 3: Immediate completion check after field change
    const updatedAssessment = {
      ...assessmentData,
      [fieldName]: value
    }
    
    console.log("=== FIELD COMPLETION HANDLER ===");
    console.log("Field updated:", fieldName, "->", value);
    
    // Immediate completion check - React 18 automatically batches updates
    const completionStatus = getCompletionStatus();
    console.log("⚡ IMMEDIATE FIELD COMPLETION STATUS:", completionStatus);
    
    if (completionStatus.isComplete) {
      console.log("⚡ FIELD COMPLETION: Assessment became complete, triggering modal immediately");
      
      // Force risk calculation and modal trigger
      const calculationData = {
        ...formData,
        ...updatedAssessment
      };
      
      const riskResult = calculateANCPrepRisk(calculationData);
      console.log("⚡ FIELD COMPLETION RISK CALCULATION:", riskResult);
      
      // Update risk state, modal will be triggered by useEffect
      setCalculatedRisk(riskResult);
      console.log("⚡ FIELD COMPLETION: Risk state updated, modal will trigger via useEffect");
      
      // DIRECT MODAL TRIGGER - Force modal open if risk warrants it
      if (riskResult.shouldShowModal && !modalManuallyClosed) {
        console.log("🚀 DIRECT MODAL TRIGGER: Forcing modal open immediately");
        handleChildModalStateChange('clinical', true);
      }
      
      // Assessment completion toast removed - focusing on missing field guidance only
    } else {
      console.log("⚡ FIELD COMPLETION: Assessment not complete yet");
    }
    
    // Continue with existing assessment completion logic
    console.log("About to call handleAssessmentCompletion with:", updatedAssessment);
    handleAssessmentCompletion(updatedAssessment);
  }

  const riskFactors = [
    { value: "no-condom", label: "No condom use during sex with more than one partner in the past 6 months" },
    { value: "sti-history", label: "Sexually transmitted infection (STI) in the past 6 months" },
    { value: "partner-risk", label: "A sexual partner in the past 6 months had one or more HIV risk factors" },
    { value: "client-request", label: "PrEP requested by client" },
    { value: "hiv-positive-partner", label: "HIV-positive partner (discordant relationship)" }
  ]

  const acuteSymptoms = [
    { value: "fever", label: "Fever" },
    { value: "sore-throat", label: "Sore throat" },
    { value: "aches", label: "Aches" },
    { value: "pains", label: "Pains" },
    { value: "swollen-glands", label: "Swollen glands" },
    { value: "mouth-sores", label: "Mouth sores" },
    { value: "headaches", label: "Headaches" },
    { value: "rash", label: "Rash" }
  ]

  const recommendedTests = [
    { value: "serum-creatinine", label: "Serum creatinine test" },
    { value: "hep-b-surface", label: "Hepatitis B surface antigen" },
    { value: "hep-c-antibody", label: "Hepatitis C antibody" },
    { value: "rapid-plasma", label: "Rapid plasma reagin" },
    { value: "sti-screening", label: "Other screening for STIs" },
    { value: "pregnancy", label: "Pregnancy testing" },
    { value: "vaccination", label: "Review vaccination history" }
  ]

  const prepRegimens = [
    { 
      value: "tdf-ftc", 
      label: "TDF/FTC 300/200mg (First-Line - Preferred)", 
      dose: "1 tablet, once daily",
      fullName: "Tenofovir disoproxil fumarate 300mg + Emtricitabine 200mg",
      population: "All adults, including pregnant and breastfeeding women",
      safety: "Safe throughout pregnancy and breastfeeding. No dose adjustment needed.",
      guideline: "Zambian CGs 2023 - Preferred regimen for all populations",
      duration: "Continuous, as long as risk persists"
    },
    { 
      value: "tdf-3tc", 
      label: "TDF/3TC 300/300mg (Alternative)", 
      dose: "1 tablet, once daily",
      fullName: "Tenofovir disoproxil fumarate 300mg + Lamivudine 300mg",
      population: "All adults, including pregnant and breastfeeding women",
      safety: "Safe throughout pregnancy and breastfeeding. No dose adjustment needed.",
      guideline: "Zambian CGs 2023 - Alternative if FTC unavailable",
      duration: "Continuous, as long as risk persists"
    },
    { 
      value: "cab-la", 
      label: "CAB-LA (Cabotegravir Long-Acting)", 
      dose: "600mg IM every 2 months after oral lead-in",
      fullName: "Cabotegravir long-acting injectable",
      population: "Adults - Special consideration required",
      safety: "Limited data in pregnancy. Consult specialist.",
      guideline: "Emerging option - Follow updated Zambian guidelines",
      duration: "Every 2 months, as long as risk persists"
    }
  ]

  const preventionServices = [
    { value: "condoms", label: "Male and female condoms and condom-compatible lubricants" },
    { value: "behavioral", label: "Behavioural interventions to support risk reduction" },
    { value: "contraception", label: "Contraception and family planning" },
    { value: "cervical-screening", label: "Cervical cancer screening and treatment" },
    { value: "sti-testing", label: "STI testing and treatment" }
  ]

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setAssessmentData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }

  // Eligibility Assessment Completion Validation
  const validateEligibilityCompletion = () => {
    // Core mandatory fields that are always required
    const mandatoryFields = [
      assessmentData.risk_reduction_counselling_provided, // Section A
      assessmentData.client_interested_in_prep, // Section B
    ]

    // Section C fields (only required if section C is visible - client NOT interested)
    if (visibleSections.sectionC) {
      mandatoryFields.push(assessmentData.planned_next_steps?.length > 0 ? "completed" : null);
    }

    // Section D fields (only required if section D is visible - client IS interested)  
    if (visibleSections.sectionD) {
      mandatoryFields.push(assessmentData.acute_hiv_symptoms?.length > 0 ? "completed" : null);
    }

    // Section E fields (only required if section E is visible - client IS interested)
    if (visibleSections.sectionE) {
      mandatoryFields.push(assessmentData.kidney_disease_history);
    }

    // Section F fields - Baseline Safety Screening (always required)
    mandatoryFields.push(
      assessmentData.urinalysis_performed,
      assessmentData.hepatitis_b_screening,
      assessmentData.syphilis_screening_performed
    );

    // Additional mandatory fields based on responses
    const additionalMandatory = []
    
    if (assessmentData.hepatitis_b_screening === "yes") {
      additionalMandatory.push(assessmentData.hepatitis_b_screening_result)
    }
    
    if (assessmentData.syphilis_screening_performed === "yes") {
      additionalMandatory.push(assessmentData.syphilis_screening_result)
    }

    const allFields = [...mandatoryFields, ...additionalMandatory]
    const completedFields = allFields.filter(field => field && field !== "" && field !== null).length
    const totalFields = allFields.length

    const isComplete = completedFields === totalFields && totalFields > 0

    console.log("=== ELIGIBILITY ASSESSMENT COMPLETION ===")
    console.log("Mandatory fields:", mandatoryFields)
    console.log("Additional fields:", additionalMandatory)
    console.log("Completed:", completedFields, "/", totalFields)
    console.log("Is complete:", isComplete)

    return {
      isComplete,
      completedCount: completedFields,
      totalCount: totalFields,
      missingFields: allFields.filter(field => !field || field === "" || field === null)
    }
  }

  // PrEP Drug Selection Handler with Auto-Population
  const handlePrepDrugSelection = (selectedValue: string) => {
    const selectedRegimen = prepRegimens.find(regimen => regimen.value === selectedValue)
    
    if (selectedRegimen) {
      console.log("🔘 PrEP Drug Selected:", selectedRegimen.label)
      
      // Auto-populate assessment data with Zambian CG 2023 guidance
      setAssessmentData((prev) => ({
        ...prev,
        prep_regimen: selectedValue,
        // Auto-populate dosing information
        prep_dose: selectedRegimen.dose,
        prep_frequency: "Once daily",
        prep_duration: selectedRegimen.duration,
        // Clinical guidance
        prep_safety_notes: selectedRegimen.safety,
        prep_population_guidance: selectedRegimen.population,
        prep_guideline_reference: selectedRegimen.guideline
      }))

      // Show success toast with clinical guidance and contraindications
      toast({
        title: "PrEP Regimen Selected",
        description: `${selectedRegimen.label} - ${selectedRegimen.dose}`,
        duration: 4000,
      })

      // Show contraindications reminder toast
      setTimeout(() => {
        toast({
          title: "Important Contraindications (Zambian CGs 2023)",
          description: "Do NOT use: TAF-based regimens or DTG for PrEP. TDF/FTC is first-line for all populations including pregnancy.",
          duration: 6000,
          variant: "destructive"
        })
      }, 1000)
    }
  }



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate mandatory fields
    const validationErrors = validateMandatoryFields()
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        })
      })
      return
    }

    onSave(formData)
    onClose()
  }



  // Calculate if required data is present
  const hasRequiredData = validateMandatoryFields().length === 0

  return (
    <>
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Track main modal interaction
        setLastUserInteraction('main')
        
        // Prevent closure during navigation
        if (!open && isNavigating) {
          console.log("🔘 DIALOG CLOSE PREVENTED: Navigation in progress")
          return
        }
        
        // Prevent closure during child modal transitions
        if (!open && isChildModalTransition) {
          console.log("🔘 DIALOG CLOSE PREVENTED: Child modal transition in progress")
          return
        }
        
        // Enhanced child modal detection with user interaction context
        const hasActiveChildModals = showClinicalDecisionModal || showEligibilityModal || showPOCTestsModal || showDeferralModal
        
        // Only prevent closure if child modals are open AND this is a user-initiated close attempt
        if (!open && hasActiveChildModals && lastUserInteraction === 'main') {
          console.log("🔘 DIALOG CLOSE PREVENTED: User attempting to close main modal with active child modal")
          
          // Provide user feedback about active child modal
          toast({
            title: "Active Modal",
            description: "Please close the current assessment modal before closing the main form",
            duration: 3000,
          })
          return
        }
        
        // Allow closure if programmatic or child modal initiated the close
        if (!open) {
          console.log("🔘 DIALOG CLOSE: Normal closure - reason:", 
            hasActiveChildModals ? 'Child modal closure' : 'User explicit close')
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-6xl w-[90vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            ANC PrEP Assessment - Initial Visit
          </DialogTitle>
          <DialogDescription>
            Complete the comprehensive PrEP assessment including risk factors, eligibility screening, counseling documentation, and client interest evaluation.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChangeWithRestrictions} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
            <TabsTrigger value="eligibility" className="relative">
              Eligibility
              {(() => {
                const eligibilityCompletion = validateEligibilityCompletion();
                return eligibilityCompletion.isComplete ? (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">✓</span>
                  </span>
                ) : eligibilityCompletion.completedCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                    {eligibilityCompletion.completedCount}
                  </span>
                ) : null;
              })()}
            </TabsTrigger>
            <TabsTrigger 
              value="prescription" 
              disabled={!canAccessPrescription}
              className={!canAccessPrescription ? "opacity-50 cursor-not-allowed" : ""}
            >
              <div className="flex items-center space-x-1">
                <span>Prescription</span>
                {!canAccessPrescription && <Lock className="h-3 w-3" />}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="follow-up" 
              disabled={!canAccessFollowUp}
              className={!canAccessFollowUp ? "opacity-50 cursor-not-allowed" : ""}
            >
              <div className="flex items-center space-x-1">
                <span>Follow-up</span>
                {!canAccessFollowUp && <Lock className="h-3 w-3" />}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eligibility" className="space-y-6">
            <div className="space-y-6">

            {/* Auto-Eligibility Status Display */}
            <div className={`border rounded-lg p-4 ${
              autoEligibility.status === 'eligible' ? 'bg-green-50 border-green-200' :
              autoEligibility.status === 'excluded' || autoEligibility.status === 'incomplete' || autoEligibility.status === 'low_risk' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    autoEligibility.status === 'eligible' ? 'bg-green-500' :
                    autoEligibility.status === 'excluded' || autoEligibility.status === 'incomplete' || autoEligibility.status === 'low_risk' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <h3 className={`font-medium ${
                      autoEligibility.status === 'eligible' ? 'text-green-900' :
                      autoEligibility.status === 'excluded' || autoEligibility.status === 'incomplete' || autoEligibility.status === 'low_risk' ? 'text-red-900' :
                      'text-yellow-900'
                    }`}>
                      {autoEligibility.eligible === true ? '✅ Yes, eligible for PrEP' :
                       autoEligibility.eligible === false ? '❌ No, defer PrEP' :
                       '🔄 Eligibility Assessment Pending'}
                    </h3>
                    <p className={`text-sm ${
                      autoEligibility.status === 'eligible' ? 'text-green-700' :
                      autoEligibility.status === 'excluded' || autoEligibility.status === 'incomplete' || autoEligibility.status === 'low_risk' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {autoEligibility.reason}
                    </p>
                  </div>
                </div>
                {autoEligibility.status === 'pending' && (
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Complete risk assessment for determination
                  </span>
                )}
              </div>
            </div>

            {/* A. Risk Reduction Counseling - Enhanced Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">A. Risk Reduction Counseling Documentation</h4>
              <div className="space-y-6">
                
                {/* Section A: Risk Reduction Counseling Provided */}
                <div className="space-y-4">
                  <h5 className="font-medium text-blue-900">A. Risk Reduction Counseling Provided</h5>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Was risk reduction counseling provided during this encounter?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.risk_reduction_counselling_provided}
                      onValueChange={(value) => setAssessmentData(prev => ({ 
                        ...prev, 
                        risk_reduction_counselling_provided: value as "yes" | "no",
                        counselling_not_provided_reasons: value === "yes" ? [] : prev.counselling_not_provided_reasons
                      }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="counseling-provided-yes" />
                        <Label htmlFor="counseling-provided-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="counseling-provided-no" />
                        <Label htmlFor="counseling-provided-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                    
                    {assessmentData.risk_reduction_counselling_provided === "no" && (
                      <div className="mt-3 space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <Label className="text-sm font-medium text-gray-900">
                          Please indicate the reason(s) counseling was not provided: <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                          {[
                            { value: 'client_declined', label: 'Client declined counseling' },
                            { value: 'time_resource_constraints', label: 'Time/resource constraints (e.g., clinic busy)' },
                            { value: 'language_communication_barrier', label: 'Language or communication barrier' },
                            { value: 'client_not_ready', label: 'Client was not ready to discuss' },
                            { value: 'provider_did_not_offer', label: 'Provider did not offer' },
                            { value: 'other', label: 'Other (specify)' }
                          ].map((reason) => (
                            <div key={reason.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`counseling-reason-${reason.value}`}
                                checked={assessmentData.counselling_not_provided_reasons?.includes(reason.value) || false}
                                onCheckedChange={(checked) => {
                                  setAssessmentData(prev => ({
                                    ...prev,
                                    counselling_not_provided_reasons: checked
                                      ? [...(prev.counselling_not_provided_reasons || []), reason.value]
                                      : (prev.counselling_not_provided_reasons || []).filter(r => r !== reason.value)
                                  }))
                                }}
                              />
                              <Label htmlFor={`counseling-reason-${reason.value}`} className="text-sm">{reason.label}</Label>
                            </div>
                          ))}
                        </div>
                        
                        {assessmentData.counselling_not_provided_reasons?.includes('other') && (
                          <div className="mt-2">
                            <Input
                              placeholder="Please specify other reason..."
                              value={assessmentData.counselling_not_provided_other}
                              onChange={(e) => setAssessmentData(prev => ({ 
                                ...prev, 
                                counselling_not_provided_other: e.target.value 
                              }))}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B: Client Interest in PrEP */}
                <div className="space-y-4">
                  <h5 className="font-medium text-blue-900">B. Client Interest in PrEP Confirmed</h5>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Did the client express interest in starting PrEP after counseling?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.client_interested_in_prep}
                      onValueChange={(value) => {
                        // BUSINESS RULE: Trigger section visibility update
                        updateSectionVisibility(value as "yes" | "no")
                        
                        setAssessmentData(prev => ({ 
                          ...prev, 
                          client_interested_in_prep: value as "yes" | "no",
                          lack_of_interest_reasons: value === "yes" ? [] : prev.lack_of_interest_reasons,
                          // Handle conditional logic based on client interest
                          ...(value === "yes" && {
                            // Clear Section C follow-up data when client becomes interested
                            planned_next_steps: [],
                            planned_next_steps_other: "",
                            next_counselling_date: "",
                            // Reset eligibility determination when client becomes interested
                            prep_eligible: null
                          }),
                          // Auto-fill eligibility determination when client NOT interested
                          ...(value === "no" && {
                            prep_eligible: false // "No, defer PrEP"
                          })
                        }))
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="interest-yes" />
                        <Label htmlFor="interest-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="interest-no" />
                        <Label htmlFor="interest-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                    
                    {assessmentData.client_interested_in_prep === "no" && (
                      <div className="mt-3 space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Label className="text-sm font-medium text-gray-900">
                          Please indicate the primary reason for lack of interest: <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                          {[
                            { value: 'does_not_perceive_risk', label: 'Client does not perceive self at risk' },
                            { value: 'prefers_other_methods', label: 'Prefers other prevention methods (e.g., condoms)' },
                            { value: 'concerned_side_effects_stigma', label: 'Concerned about side effects or stigma' },
                            { value: 'discuss_with_partner', label: 'Wants to discuss with partner first' },
                            { value: 'decide_later_visit', label: 'Will decide at a later visit' },
                            { value: 'other', label: 'Other (specify)' }
                          ].map((reason) => (
                            <div key={reason.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`interest-reason-${reason.value}`}
                                checked={assessmentData.lack_of_interest_reasons?.includes(reason.value) || false}
                                onCheckedChange={(checked) => {
                                  setAssessmentData(prev => ({
                                    ...prev,
                                    lack_of_interest_reasons: checked
                                      ? [...(prev.lack_of_interest_reasons || []), reason.value]
                                      : (prev.lack_of_interest_reasons || []).filter(r => r !== reason.value)
                                  }))
                                }}
                              />
                              <Label htmlFor={`interest-reason-${reason.value}`} className="text-sm">{reason.label}</Label>
                            </div>
                          ))}
                        </div>
                        
                        {assessmentData.lack_of_interest_reasons?.includes('other') && (
                          <div className="mt-2">
                            <Input
                              placeholder="Please specify other reason..."
                              value={assessmentData.lack_of_interest_other}
                              onChange={(e) => setAssessmentData(prev => ({ 
                                ...prev, 
                                lack_of_interest_other: e.target.value 
                              }))}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section C: Planned Next Steps/Follow-Up - Only show if client NOT interested in PrEP */}
                {visibleSections.sectionC && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-blue-900">C. Planned Next Steps/Follow-Up</h5>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      What follow-up or next steps are planned? <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-2">
                      {[
                        { value: 'schedule_future_counselling', label: 'Schedule for future counseling' },
                        { value: 'refer_peer_educator', label: 'Refer to peer educator/counselor' },
                        { value: 'provide_educational_materials', label: 'Provide educational materials' },
                        { value: 'offer_prep_next_anc', label: 'Offer PrEP counseling at next ANC visit' },
                        { value: 'no_further_action', label: 'No further action needed' },
                        { value: 'other', label: 'Other (specify)' }
                      ].map((step) => (
                        <div key={step.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`next-step-${step.value}`}
                            checked={assessmentData.planned_next_steps?.includes(step.value) || false}
                            onCheckedChange={(checked) => {
                              setAssessmentData(prev => ({
                                ...prev,
                                planned_next_steps: checked
                                  ? [...(prev.planned_next_steps || []), step.value]
                                  : (prev.planned_next_steps || []).filter(s => s !== step.value)
                              }))
                            }}
                          />
                          <Label htmlFor={`next-step-${step.value}`} className="text-sm">{step.label}</Label>
                        </div>
                      ))}
                    </div>
                    
                    {assessmentData.planned_next_steps?.includes('other') && (
                      <div className="mt-2">
                        <Input
                          placeholder="Please specify other next steps..."
                          value={assessmentData.planned_next_steps_other}
                          onChange={(e) => setAssessmentData(prev => ({ 
                            ...prev, 
                            planned_next_steps_other: e.target.value 
                          }))}
                        />
                      </div>
                    )}
                    
                    {(assessmentData.planned_next_steps?.includes('schedule_future_counselling') || 
                      assessmentData.planned_next_steps?.includes('offer_prep_next_anc')) && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-sm font-medium text-gray-900">
                          Next planned date for follow-up or counseling:
                        </Label>
                        <Input
                          type="date"
                          value={assessmentData.next_counselling_date}
                          onChange={(e) => setAssessmentData(prev => ({ 
                            ...prev, 
                            next_counselling_date: e.target.value 
                          }))}
                        />
                      </div>
                    )}
                  </div>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Safety Assessment - Available when requirements met */}
            {isClinicalSafetyAvailable() ? (
              /* B. Baseline Clinical Safety and Labs */
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">B. Baseline Clinical Safety and Labs</h4>
                <div className="space-y-6">
                
                {/* Urinalysis */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Has urinalysis been performed and were the results normal?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={assessmentData.urinalysis_performed}
                    onValueChange={(value) => {
                      setAssessmentData(prev => ({ 
                        ...prev, 
                        urinalysis_performed: value as "yes" | "no"
                      }))
                      // Show follow-up question for "No" responses
                      if (value === "no") {
                        handleTestNowRequest("urinalysis_performed")
                      } else {
                        // Clear follow-up if changing to "Yes"
                        setBaselineTestFollowUp(prev => ({
                          ...prev,
                          urinalysis_test_now: false
                        }))
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="urinalysis-yes" />
                      <Label htmlFor="urinalysis-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="urinalysis-no" />
                      <Label htmlFor="urinalysis-no" className="text-sm">No</Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Follow-up question for "No" response */}
                  {assessmentData.urinalysis_performed === "no" && (
                    <div className="ml-6 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-sm font-medium text-blue-900 mb-2 block">
                        Would you like to order urinalysis now?
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleOrderPOCTest("urinalysis_performed")}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Order Test Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("Not now clicked")}
                          className="text-gray-600"
                        >
                          Not Now
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {assessmentData.urinalysis_performed === "yes" && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-sm font-medium">Were the urinalysis results normal?</Label>
                      <RadioGroup
                        value={assessmentData.urinalysis_normal}
                        onValueChange={(value) => setAssessmentData(prev => ({ 
                          ...prev, 
                          urinalysis_normal: value as "yes" | "no"
                        }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="urinalysis-normal-yes" />
                          <Label htmlFor="urinalysis-normal-yes" className="text-sm">Yes, normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="urinalysis-normal-no" />
                          <Label htmlFor="urinalysis-normal-no" className="text-sm">No, abnormal</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  
                  {assessmentData.urinalysis_performed === "yes" && assessmentData.urinalysis_normal === "no" && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Clinical Question:</strong> We need to check kidney function again before PrEP. Can you repeat creatinine in 2 weeks?
                      </p>
                    </div>
                  )}
                </div>

                {/* Creatinine */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Has serum creatinine or creatinine clearance (&gt;50 ml/min) been confirmed?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={assessmentData.creatinine_confirmed}
                    onValueChange={(value) => {
                      setAssessmentData(prev => ({ 
                        ...prev, 
                        creatinine_confirmed: value as "yes" | "no" | "pending"
                      }))
                      // Show follow-up question for "No" responses
                      if (value === "no") {
                        handleTestNowRequest("creatinine_confirmed")
                      } else {
                        setBaselineTestFollowUp(prev => ({
                          ...prev,
                          creatinine_test_now: false
                        }))
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="creatinine-yes" />
                      <Label htmlFor="creatinine-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="creatinine-no" />
                      <Label htmlFor="creatinine-no" className="text-sm">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pending" id="creatinine-pending" />
                      <Label htmlFor="creatinine-pending" className="text-sm">Pending</Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Follow-up question for "No" response */}
                  {assessmentData.creatinine_confirmed === "no" && (
                    <div className="ml-6 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-sm font-medium text-blue-900 mb-2 block">
                        Would you like to order serum creatinine test now?
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleOrderPOCTest("creatinine_confirmed")}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Order Test Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("Creatinine test - Not now clicked")}
                          className="text-gray-600"
                        >
                          Not Now
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {assessmentData.creatinine_confirmed === "no" && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Clinical Question:</strong> Creatinine clearance is below 50 ml/min. PrEP should not be started - refer for nephrology consultation.
                      </p>
                    </div>
                  )}
                </div>

                {/* Hepatitis B */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Has Hepatitis B surface antigen screening been performed?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={assessmentData.hepatitis_b_screening}
                    onValueChange={(value) => {
                      setAssessmentData(prev => ({ 
                        ...prev, 
                        hepatitis_b_screening: value as "yes" | "no" | "pending"
                      }))
                      // Show follow-up question for "No" responses
                      if (value === "no") {
                        handleTestNowRequest("hepatitis_b_screening")
                      } else {
                        setBaselineTestFollowUp(prev => ({
                          ...prev,
                          hepatitis_b_test_now: false
                        }))
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="hepatitis-yes" />
                      <Label htmlFor="hepatitis-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="hepatitis-no" />
                      <Label htmlFor="hepatitis-no" className="text-sm">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pending" id="hepatitis-pending" />
                      <Label htmlFor="hepatitis-pending" className="text-sm">Pending</Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Follow-up question for "No" response */}
                  {assessmentData.hepatitis_b_screening === "no" && (
                    <div className="ml-6 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-sm font-medium text-blue-900 mb-2 block">
                        Would you like to order Hepatitis B screening now?
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleOrderPOCTest("hepatitis_b_screening")}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Order Test Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("Hepatitis B test - Not now clicked")}
                          className="text-gray-600"
                        >
                          Not Now
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Follow-up question for "Yes" response - Result inquiry */}
                  {assessmentData.hepatitis_b_screening === "yes" && (
                    <div className="ml-6 mt-3 space-y-3">
                      <Label className="text-sm font-medium text-gray-900">
                        What were the Hepatitis B screening results?
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <RadioGroup
                        value={assessmentData.hepatitis_b_screening_result || ""}
                        onValueChange={(value) => setAssessmentData(prev => ({ 
                          ...prev, 
                          hepatitis_b_screening_result: value as "reactive" | "non_reactive" | ""
                        }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reactive" id="hep-b-reactive" />
                          <Label htmlFor="hep-b-reactive" className="text-sm">Reactive/Positive</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="non_reactive" id="hep-b-non-reactive" />
                          <Label htmlFor="hep-b-non-reactive" className="text-sm">Non-reactive/Negative</Label>
                        </div>
                      </RadioGroup>
                      
                      {assessmentData.hepatitis_b_screening_result === "reactive" && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            <strong>Clinical Decision:</strong> Hepatitis B positive - PrEP can be started but requires ongoing monitoring. If PrEP is stopped, refer for hepatitis B care.
                          </p>
                        </div>
                      )}
                      
                      {assessmentData.hepatitis_b_screening_result === "non_reactive" && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>Clinical Decision:</strong> Hepatitis B negative - No contraindication to PrEP initiation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Syphilis Screening */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Has syphilis screening (RPR/RST) been performed?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={assessmentData.syphilis_screening_performed}
                    onValueChange={(value) => {
                      setAssessmentData(prev => ({ 
                        ...prev, 
                        syphilis_screening_performed: value as "yes" | "no" | "pending"
                      }))
                      // Show follow-up question for "No" responses
                      if (value === "no") {
                        handleTestNowRequest("syphilis_screening_performed")
                      } else {
                        setBaselineTestFollowUp(prev => ({
                          ...prev,
                          syphilis_test_now: false
                        }))
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="syphilis-yes" />
                      <Label htmlFor="syphilis-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="syphilis-no" />
                      <Label htmlFor="syphilis-no" className="text-sm">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pending" id="syphilis-pending" />
                      <Label htmlFor="syphilis-pending" className="text-sm">Pending</Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Follow-up question for "No" response */}
                  {assessmentData.syphilis_screening_performed === "no" && (
                    <div className="ml-6 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-sm font-medium text-blue-900 mb-2 block">
                        Would you like to order syphilis screening now?
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleOrderPOCTest("syphilis_screening_performed")}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Order Test Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("Syphilis test - Not now clicked")}
                          className="text-gray-600"
                        >
                          Not Now
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Follow-up question for "Yes" response - Result inquiry */}
                  {assessmentData.syphilis_screening_performed === "yes" && (
                    <div className="ml-6 mt-3 space-y-3">
                      <Label className="text-sm font-medium text-gray-900">
                        What were the syphilis screening (RPR/RST) results?
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <RadioGroup
                        value={assessmentData.syphilis_screening_result || ""}
                        onValueChange={(value) => setAssessmentData(prev => ({ 
                          ...prev, 
                          syphilis_screening_result: value as "reactive" | "non_reactive" | ""
                        }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reactive" id="syphilis-reactive" />
                          <Label htmlFor="syphilis-reactive" className="text-sm">Reactive/Positive</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="non_reactive" id="syphilis-non-reactive" />
                          <Label htmlFor="syphilis-non-reactive" className="text-sm">Non-reactive/Negative</Label>
                        </div>
                      </RadioGroup>
                      
                      {assessmentData.syphilis_screening_result === "reactive" && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            <strong>Clinical Decision:</strong> Syphilis positive - Treat before starting PrEP. Ensure complete treatment course before PrEP initiation.
                          </p>
                        </div>
                      )}
                      
                      {assessmentData.syphilis_screening_result === "non_reactive" && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>Clinical Decision:</strong> Syphilis negative - No contraindication to PrEP initiation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            ) : null}

            {/* D. Acute HIV Symptoms Assessment - Only show if client IS interested in PrEP */}
            {visibleSections.sectionD && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">D. Acute HIV Symptoms Assessment</h4>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Does client have any acute HIV symptoms?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={assessmentData.acute_hiv_symptoms}
                    onValueChange={(value) => setAssessmentData(prev => ({ 
                      ...prev, 
                      acute_hiv_symptoms: value as "yes" | "no",
                      acute_symptoms_list: value === "no" ? [] : prev.acute_symptoms_list
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="symptoms-yes" />
                      <Label htmlFor="symptoms-yes" className="text-sm">Yes, has symptoms</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="symptoms-no" />
                      <Label htmlFor="symptoms-no" className="text-sm">No symptoms</Label>
                    </div>
                  </RadioGroup>
                </div>

                {assessmentData.acute_hiv_symptoms === "yes" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select symptoms present:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Fever", "Sore throat", "Muscle aches", "Swollen glands", "Rash", "Headache", "Fatigue", "Night sweats"].map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`symptom-${symptom}`}
                            checked={assessmentData.acute_symptoms_list.includes(symptom)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  acute_symptoms_list: [...prev.acute_symptoms_list, symptom]
                                }))
                              } else {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  acute_symptoms_list: prev.acute_symptoms_list.filter(s => s !== symptom)
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={`symptom-${symptom}`} className="text-sm">{symptom}</Label>
                        </div>
                      ))}
                    </div>
                    
                    {assessmentData.acute_symptoms_list.length >= 2 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Clinical Question</p>
                        <p className="text-sm text-red-700">
                          <strong>IF</strong> multiple acute symptoms are present,<br />
                          <strong>THEN</strong> defer PrEP and perform HIV RNA or antigen/antibody testing immediately.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )} {/* End conditional wrapper for Acute HIV Symptoms Assessment */}

            {/* E. Medical History Contraindications - Only show if client IS interested in PrEP */}
            {visibleSections.sectionE && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">E. Medical History Contraindications</h4>
              <div className="space-y-6">
                
                {/* Kidney Disease */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Does the client have a known history of renal disease or eGFR &lt;60 ml/min/1.73m²?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={assessmentData.kidney_disease_history}
                    onValueChange={(value) => setAssessmentData(prev => ({ 
                      ...prev, 
                      kidney_disease_history: value as "yes" | "no" | "unknown"
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="kidney-yes" />
                      <Label htmlFor="kidney-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="kidney-no" />
                      <Label htmlFor="kidney-no" className="text-sm">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id="kidney-unknown" />
                      <Label htmlFor="kidney-unknown" className="text-sm">Unknown</Label>
                    </div>
                  </RadioGroup>
                  
                  {assessmentData.kidney_disease_history === "yes" && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Clinical Question:</strong> Defer PrEP, repeat test in 2 weeks, and refer for further renal assessment.
                      </p>
                    </div>
                  )}
                </div>

                {/* Drug Allergies */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Has the client ever had an allergic reaction to tenofovir or emtricitabine?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={assessmentData.drug_allergy_tenofovir}
                    onValueChange={(value) => setAssessmentData(prev => ({ 
                      ...prev, 
                      drug_allergy_tenofovir: value as "yes" | "no"
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="allergy-yes" />
                      <Label htmlFor="allergy-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="allergy-no" />
                      <Label htmlFor="allergy-no" className="text-sm">No</Label>
                    </div>
                  </RadioGroup>
                  
                  {assessmentData.drug_allergy_tenofovir === "yes" && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Clinical Question:</strong> PrEP is contraindicated due to drug allergy - do not start PrEP.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )} {/* End conditional wrapper for Medical History Contraindications */}

            {/* Eligibility Status Display - Before Section F */}
            {autoEligibility.eligible !== null && (
              <div className={`border rounded-lg p-4 mb-6 ${
                autoEligibility.eligible === true 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    autoEligibility.eligible === true ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <h4 className={`font-medium ${
                    autoEligibility.eligible === true ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {autoEligibility.eligible === true 
                      ? '✅ Yes, eligible for PrEP' 
                      : '❌ No, defer PrEP'
                    }
                  </h4>
                </div>
                <p className={`text-sm mt-2 ${
                  autoEligibility.eligible === true ? 'text-green-700' : 'text-red-700'
                }`}>
                  {autoEligibility.reason}
                </p>
              </div>
            )}

            {/* Clinical Recommendations Button - Before Section F */}
            {eligibilityData.status !== "pending" && (
              <div className="mb-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEligibilityModal(true)}
                  className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 px-6 py-2 font-medium"
                >
                  View Clinical Eligibility Recommendations
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  View comprehensive clinical guidance and recommended actions
                </p>
              </div>
            )}

            {/* F. Eligibility Summary */}
            <div 
              className={`border border-gray-200 rounded-lg p-6 cursor-pointer ${!canAccessSectionF ? 'bg-gray-100 opacity-75' : 'bg-gray-50'}`}
              onClick={handleSectionFAttempt}
            >
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <span>F. Eligibility Determination</span>
                {!canAccessSectionF && (
                  <Lock className="h-4 w-4 text-amber-600" />
                )}
              </h4>
              
              {/* Show auto-fill notification when client not interested */}
              {canAccessSectionF && assessmentData.client_interested_in_prep === "no" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-blue-700">
                      <strong>Auto-filled:</strong> Eligibility set to "No, defer PrEP" based on client interest assessment
                    </p>
                  </div>
                </div>
              )}
              
              <div className={`space-y-4 ${!canAccessSectionF ? 'pointer-events-none opacity-50' : ''}`}>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Based on the clinical safety screening above, is the client eligible for PrEP?</Label>
                  <RadioGroup
                    value={assessmentData.prep_eligible === null ? "" : assessmentData.prep_eligible.toString()}
                    onValueChange={(value) => {
                      if (canAccessSectionF) {
                        setAssessmentData(prev => ({ 
                          ...prev, 
                          prep_eligible: value === "" ? null : value === "true"
                        }))
                      } else {
                        handleSectionFAttempt();
                      }
                    }}
                    disabled={!canAccessSectionF}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="eligible-yes" disabled={!canAccessSectionF} />
                      <Label htmlFor="eligible-yes" className={`text-sm ${!canAccessSectionF ? 'text-gray-400' : ''}`}>Yes, eligible for PrEP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="eligible-no" disabled={!canAccessSectionF} />
                      <Label htmlFor="eligible-no" className={`text-sm ${!canAccessSectionF ? 'text-gray-400' : ''}`}>No, defer PrEP</Label>
                    </div>
                  </RadioGroup>
                </div>

                {canAccessSectionF && assessmentData.prep_eligible === true && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Clinical Decision:</strong> Client is eligible for PrEP initiation. Proceed to prescription tab.
                    </p>
                  </div>
                )}

                {canAccessSectionF && assessmentData.prep_eligible === false && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Clinical Decision:</strong> PrEP is deferred due to clinical contraindications. Address concerns and reassess.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <div className="space-y-6">
              {/* Real-Time Risk Score Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">
                    {isAssessmentComplete ? "Final Risk Score" : "Preliminary Risk Score"}
                  </h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900">
                      {currentRisk.score}/20
                    </div>
                    <div className="text-xs text-blue-600">points</div>
                  </div>
                </div>
                
                {/* Risk Level Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Risk Level: {currentRisk.level}</span>
                    <span>{completionStatus.completedCount}/{completionStatus.totalCount} fields completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        currentRisk.score >= 10 ? 'bg-red-500' :
                        currentRisk.score >= 5 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((currentRisk.score / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Risk Level Badge */}
                <div className="mt-3 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentRisk.score >= 10 ? 'bg-red-100 text-red-800' :
                    currentRisk.score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {currentRisk.level} Risk
                  </span>
                  {!isAssessmentComplete && (
                    <span className="text-xs text-gray-500">
                      Complete all fields for final assessment
                    </span>
                  )}
                </div>
              </div>

              {/* Client Risk Factors */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Client Risk Factors</h4>
                <div className="space-y-6">
                  
                  {/* Condom use consistency */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Has the client used condoms consistently with all sexual partners in the past 6 months (before and during pregnancy)?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.inconsistent_condom_use}
                      onValueChange={(value) => {
                        handleFieldCompletion("inconsistent_condom_use", value, "Consistent condom use assessment")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="condom-use-yes" />
                        <Label htmlFor="condom-use-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="condom-use-no" />
                        <Label htmlFor="condom-use-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                    
                    {assessmentData.inconsistent_condom_use === "no" && (
                      <div className="mt-3 space-y-3">
                        <Label className="text-sm font-medium text-gray-900">
                          What were the reasons for not using condoms? (Select all that apply)
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="partner-refused"
                              checked={assessmentData.condom_reasons?.includes('partner_refused') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  condom_reasons: checked
                                    ? [...(prev.condom_reasons || []), 'partner_refused']
                                    : (prev.condom_reasons || []).filter(r => r !== 'partner_refused')
                                }))
                              }}
                            />
                            <Label htmlFor="partner-refused" className="text-sm">Partner refused</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="condoms-not-available"
                              checked={assessmentData.condom_reasons?.includes('not_available') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  condom_reasons: checked
                                    ? [...(prev.condom_reasons || []), 'not_available']
                                    : (prev.condom_reasons || []).filter(r => r !== 'not_available')
                                }))
                              }}
                            />
                            <Label htmlFor="condoms-not-available" className="text-sm">Condoms not available</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="trying-to-conceive"
                              checked={assessmentData.condom_reasons?.includes('trying_to_conceive') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  condom_reasons: checked
                                    ? [...(prev.condom_reasons || []), 'trying_to_conceive']
                                    : (prev.condom_reasons || []).filter(r => r !== 'trying_to_conceive')
                                }))
                              }}
                            />
                            <Label htmlFor="trying-to-conceive" className="text-sm">Was trying to conceive at the time</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="trusted-partner"
                              checked={assessmentData.condom_reasons?.includes('trusted_partner') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  condom_reasons: checked
                                    ? [...(prev.condom_reasons || []), 'trusted_partner']
                                    : (prev.condom_reasons || []).filter(r => r !== 'trusted_partner')
                                }))
                              }}
                            />
                            <Label htmlFor="trusted-partner" className="text-sm">Trusted partner</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="other-reason"
                              checked={assessmentData.condom_reasons?.includes('other') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  condom_reasons: checked
                                    ? [...(prev.condom_reasons || []), 'other']
                                    : (prev.condom_reasons || []).filter(r => r !== 'other')
                                }))
                              }}
                            />
                            <Label htmlFor="other-reason" className="text-sm">Other:</Label>
                          </div>
                          {assessmentData.condom_reasons?.includes('other') && (
                            <div className="ml-6">
                              <Input
                                placeholder="Please specify..."
                                value={assessmentData.condom_other_reason || ''}
                                onChange={(e) => setAssessmentData(prev => ({ ...prev, condom_other_reason: e.target.value }))}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                        
                        
                      </div>
                    )}
                  </div>

                  {/* Multiple sexual partners */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Has client reported multiple sexual partners in the past 6 months? (Weight: 2 points)
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.multiple_partners}
                      onValueChange={(value) => {
                        handleFieldCompletion("multiple_partners", value, "Multiple sexual partners assessment")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="multiple-partners-yes" />
                        <Label htmlFor="multiple-partners-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="multiple-partners-no" />
                        <Label htmlFor="multiple-partners-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                    
                    
                  </div>

                  {/* Recent STI diagnosis */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Has client been diagnosed/treated for any STI in last 6 months?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.recent_sti}
                      onValueChange={(value) => {
                        handleFieldCompletion("recent_sti", value, "STI diagnosis assessment")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="recent-sti-yes" />
                        <Label htmlFor="recent-sti-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="recent-sti-no" />
                        <Label htmlFor="recent-sti-no" className="text-sm">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unknown" id="recent-sti-unknown" />
                        <Label htmlFor="recent-sti-unknown" className="text-sm">Unknown</Label>
                      </div>
                    </RadioGroup>
                    
                    {assessmentData.recent_sti === "yes" && (
                      <div className="mt-3 space-y-3">
                        <Label className="text-sm font-medium text-gray-900">
                          Which STI? (Select all that apply)
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-syphilis"
                              checked={assessmentData.sti_types?.includes('syphilis') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'syphilis']
                                    : (prev.sti_types || []).filter(t => t !== 'syphilis')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-syphilis" className="text-sm">Syphilis</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-gonorrhea"
                              checked={assessmentData.sti_types?.includes('gonorrhea') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'gonorrhea']
                                    : (prev.sti_types || []).filter(t => t !== 'gonorrhea')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-gonorrhea" className="text-sm">Gonorrhea</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-herpes"
                              checked={assessmentData.sti_types?.includes('herpes') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'herpes']
                                    : (prev.sti_types || []).filter(t => t !== 'herpes')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-herpes" className="text-sm">Herpes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-chlamydia"
                              checked={assessmentData.sti_types?.includes('chlamydia') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'chlamydia']
                                    : (prev.sti_types || []).filter(t => t !== 'chlamydia')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-chlamydia" className="text-sm">Chlamydia</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-trichomonas"
                              checked={assessmentData.sti_types?.includes('trichomonas') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'trichomonas']
                                    : (prev.sti_types || []).filter(t => t !== 'trichomonas')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-trichomonas" className="text-sm">Trichomonas</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-hpv"
                              checked={assessmentData.sti_types?.includes('hpv') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'hpv']
                                    : (prev.sti_types || []).filter(t => t !== 'hpv')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-hpv" className="text-sm">HPV (Human Papillomavirus)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-hepatitis-b"
                              checked={assessmentData.sti_types?.includes('hepatitis_b') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'hepatitis_b']
                                    : (prev.sti_types || []).filter(t => t !== 'hepatitis_b')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-hepatitis-b" className="text-sm">Hepatitis B</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-pelvic-inflammatory"
                              checked={assessmentData.sti_types?.includes('pelvic_inflammatory_disease') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'pelvic_inflammatory_disease']
                                    : (prev.sti_types || []).filter(t => t !== 'pelvic_inflammatory_disease')
                                }))
                              }}
                            />
                            <Label htmlFor="sti-pelvic-inflammatory" className="text-sm">Pelvic Inflammatory Disease (PID)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sti-other"
                              checked={assessmentData.sti_types?.includes('other') || false}
                              onCheckedChange={(checked) => {
                                setAssessmentData(prev => ({
                                  ...prev,
                                  sti_types: checked
                                    ? [...(prev.sti_types || []), 'other']
                                    : (prev.sti_types || []).filter(t => t !== 'other'),
                                  // Clear the other STI text when unchecking
                                  sti_other_specify: checked ? prev.sti_other_specify : ""
                                }))
                              }}
                            />
                            <Label htmlFor="sti-other" className="text-sm">Other (specify)</Label>
                          </div>
                        </div>
                        
                        {/* Other STI specification text box */}
                        {assessmentData.sti_types?.includes('other') && (
                          <div className="mt-3">
                            <Input
                              placeholder="Please specify the other STI..."
                              value={assessmentData.sti_other_specify || ""}
                              onChange={(e) => setAssessmentData(prev => ({ 
                                ...prev, 
                                sti_other_specify: e.target.value 
                              }))}
                              className="w-full"
                            />
                          </div>
                        )}
                        
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Partner Risk Factors */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Partner Risk Factors</h4>
                <div className="space-y-6">
                  
                  {/* Primary Question: Does client know partner's HIV status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Does the client know her partner's HIV status?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.partner_hiv_status_known}
                      onValueChange={(value) => {
                        setAssessmentData(prev => ({ 
                          ...prev, 
                          partner_hiv_status_known: value,
                          // Clear downstream fields when changing this answer
                          partner_hiv_status: value === "no" ? "" : prev.partner_hiv_status,
                          partner_not_on_art: value === "no" ? "" : prev.partner_not_on_art,
                          partner_detectable_viral_load: value === "no" ? "" : prev.partner_detectable_viral_load
                        }))
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="partner-hiv-status-known-yes" />
                        <Label htmlFor="partner-hiv-status-known-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="partner-hiv-status-known-no" />
                        <Label htmlFor="partner-hiv-status-known-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Conditional: If client knows partner's status, ask what it is */}
                  {assessmentData.partner_hiv_status_known === "yes" && (
                    <div className="ml-6 border-l-2 border-blue-200 pl-4 space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-900">
                          What is the partner's HIV status?
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <RadioGroup
                          value={assessmentData.partner_hiv_status}
                          onValueChange={(value) => {
                            setAssessmentData(prev => ({ 
                              ...prev, 
                              partner_hiv_status: value,
                              // Clear HIV-positive specific fields if not positive
                              partner_not_on_art: value === "positive" ? prev.partner_not_on_art : "",
                              partner_detectable_viral_load: value === "positive" ? prev.partner_detectable_viral_load : ""
                            }))
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="positive" id="partner-hiv-positive" />
                            <Label htmlFor="partner-hiv-positive" className="text-sm">Positive</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="negative" id="partner-hiv-negative" />
                            <Label htmlFor="partner-hiv-negative" className="text-sm">Negative</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unknown" id="partner-hiv-unknown" />
                            <Label htmlFor="partner-hiv-unknown" className="text-sm">Unknown</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Conditional: If partner is HIV-positive, ask about ART and viral load */}
                      {assessmentData.partner_hiv_status === "positive" && (
                        <div className="ml-6 border-l-2 border-red-200 pl-4 space-y-6">
                          
                          {/* ART Status */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-900">
                              Is the partner currently taking ART?
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <RadioGroup
                              value={assessmentData.partner_not_on_art === "yes" ? "no" : assessmentData.partner_not_on_art === "no" ? "yes" : ""}
                              onValueChange={(value) => {
                                // Convert the answer to the existing field structure
                                const fieldValue = value === "yes" ? "no" : value === "no" ? "yes" : value
                                handleFieldCompletion("partner_not_on_art", fieldValue, "Partner ART status")
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="partner-art-yes" />
                                <Label htmlFor="partner-art-yes" className="text-sm">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="partner-art-no" />
                                <Label htmlFor="partner-art-no" className="text-sm">No</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unknown" id="partner-art-unknown" />
                                <Label htmlFor="partner-art-unknown" className="text-sm">Unknown</Label>
                              </div>
                            </RadioGroup>
                            
                            
                          </div>

                          {/* Viral Load Status */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-900">
                              Has the partner had a detectable viral load in the last 6 months?
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <RadioGroup
                              value={assessmentData.partner_detectable_viral_load}
                              onValueChange={(value) => {
                                handleFieldCompletion("partner_detectable_viral_load", value, "Partner viral load status")
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="partner-detectable-yes" />
                                <Label htmlFor="partner-detectable-yes" className="text-sm">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="partner-detectable-no" />
                                <Label htmlFor="partner-detectable-no" className="text-sm">No</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unknown" id="partner-detectable-unknown" />
                                <Label htmlFor="partner-detectable-unknown" className="text-sm">Unknown</Label>
                              </div>
                            </RadioGroup>
                            
                            
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Partner multiple partners */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Has client's partner reported having multiple sexual partners?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.partner_multiple_partners}
                      onValueChange={(value) => {
                        handleFieldCompletion("partner_multiple_partners", value, "Partner multiple partners assessment")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="partner-multiple-yes" />
                        <Label htmlFor="partner-multiple-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="partner-multiple-no" />
                        <Label htmlFor="partner-multiple-no" className="text-sm">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unsure" id="partner-multiple-unsure" />
                        <Label htmlFor="partner-multiple-unsure" className="text-sm">Unsure</Label>
                      </div>
                    </RadioGroup>
                    
                    
                  </div>

                  {/* Partner injection drug use */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Has client's partner engaged in injection drug use with needle sharing?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.partner_injection_drug_use}
                      onValueChange={(value) => {
                        handleFieldCompletion("partner_injection_drug_use", value, "Partner injection drug use assessment")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="partner-injection-yes" />
                        <Label htmlFor="partner-injection-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="partner-injection-no" />
                        <Label htmlFor="partner-injection-no" className="text-sm">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unknown" id="partner-injection-unknown" />
                        <Label htmlFor="partner-injection-unknown" className="text-sm">Don't know</Label>
                      </div>
                    </RadioGroup>
                    
                    
                  </div>
                </div>
              </div>

              {/* Pregnancy Modifiers */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Pregnancy-Specific Risk Modifiers</h4>
                <div className="space-y-6">
                  
                  {/* Pregnancy trimester */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Which trimester is client currently in?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.pregnancy_trimester}
                      onValueChange={(value) => {
                        handleFieldCompletion("pregnancy_trimester", value, "Pregnancy trimester assessment")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="first" id="trimester-first" />
                        <Label htmlFor="trimester-first" className="text-sm">First trimester (0-13 weeks)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="second" id="trimester-second" />
                        <Label htmlFor="trimester-second" className="text-sm">Second trimester (14-27 weeks)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="third" id="trimester-third" />
                        <Label htmlFor="trimester-third" className="text-sm">Third trimester (28+ weeks)</Label>
                      </div>
                    </RadioGroup>
                    

                    
                    
                    
                    
                  </div>

                  {/* Breastfeeding plans */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900">
                      Does client plan to breastfeed after delivery?
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={assessmentData.plans_to_breastfeed}
                      onValueChange={(value) => {
                        handleFieldCompletion("plans_to_breastfeed", value, "Breastfeeding plans assessment")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="breastfeed-yes" />
                        <Label htmlFor="breastfeed-yes" className="text-sm">Yes, plans to breastfeed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="breastfeed-no" />
                        <Label htmlFor="breastfeed-no" className="text-sm">No, will not breastfeed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unsure" id="breastfeed-unsure" />
                        <Label htmlFor="breastfeed-unsure" className="text-sm">Unsure/undecided</Label>
                      </div>
                    </RadioGroup>
                    
                    
                    
                    
                  </div>
                </div>
              </div>

              {/* Risk Score Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-4">Risk Assessment Score</h4>
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {calculatedRisk.score}/20
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        calculatedRisk.level === 'High Risk' ? 'bg-red-100 text-red-800' :
                        calculatedRisk.level === 'Moderate Risk' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {calculatedRisk.level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          calculatedRisk.score >= 10 ? 'bg-red-500' :
                          calculatedRisk.score >= 5 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(calculatedRisk.score / 20) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low (0-4)</span>
                      <span>Moderate (5-9)</span>
                      <span>High (10+)</span>
                    </div>
                  </div>
                </div>

              </div>


            </div>
          </TabsContent>

          <TabsContent value="prescription" className="space-y-6" data-section="prescription">
            {!canAccessPrescription ? (
              <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
                <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Prescription Access Restricted</h3>
                <p className="text-gray-600 mb-4">
                  Complete eligibility assessment with "Yes, eligible for PrEP" to access prescription functionality.
                </p>
                <div className="text-sm text-gray-500">
                  Current eligibility status: {assessmentData.prep_eligible === false ? "No, defer PrEP" : "Not assessed"}
                </div>
              </div>
            ) : (
              <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-3">Initial Prescription</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prescribed-initial"
                    checked={assessmentData.prescribed_at_initial_visit}
                    onCheckedChange={(checked) => setAssessmentData((prev) => ({ ...prev, prescribed_at_initial_visit: !!checked }))}
                  />
                  <Label htmlFor="prescribed-initial" className="font-medium">Prescribed PrEP at initial visit</Label>
                </div>

                {assessmentData.prescribed_at_initial_visit && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>PrEP Regimen</Label>
                      <Select
                        value={assessmentData.prep_regimen}
                        onValueChange={handlePrepDrugSelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select regimen" />
                        </SelectTrigger>
                        <SelectContent>
                          {prepRegimens.map((regimen) => (
                            <SelectItem key={regimen.value} value={regimen.value}>
                              {regimen.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="days-prescribed">Number of days prescribed</Label>
                      <Input
                        id="days-prescribed"
                        type="number"
                        placeholder="Days"
                        value={assessmentData.days_prescribed}
                        onChange={(e) => setAssessmentData((prev) => ({ ...prev, days_prescribed: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Clinical Guidance Display - Auto-populated from Zambian CG 2023 */}
                {assessmentData.prep_regimen && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Clinical Guidance (Zambian CGs 2023)
                    </h4>
                    
                    {(() => {
                      const selectedRegimen = prepRegimens.find(r => r.value === assessmentData.prep_regimen)
                      if (!selectedRegimen) return null
                      
                      return (
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium text-green-800">Full Name:</span>
                            <span className="text-green-700 ml-2">{selectedRegimen.fullName}</span>
                          </div>
                          
                          <div>
                            <span className="font-medium text-green-800">Dosing:</span>
                            <span className="text-green-700 ml-2">{selectedRegimen.dose}</span>
                          </div>
                          
                          <div>
                            <span className="font-medium text-green-800">Population:</span>
                            <span className="text-green-700 ml-2">{selectedRegimen.population}</span>
                          </div>
                          
                          <div>
                            <span className="font-medium text-green-800">Safety:</span>
                            <span className="text-green-700 ml-2">{selectedRegimen.safety}</span>
                          </div>
                          
                          <div>
                            <span className="font-medium text-green-800">Duration:</span>
                            <span className="text-green-700 ml-2">{selectedRegimen.duration}</span>
                          </div>
                          
                          <div className="bg-green-100 border border-green-300 rounded p-2 mt-3">
                            <span className="font-medium text-green-800">Guideline Reference:</span>
                            <span className="text-green-700 ml-2">{selectedRegimen.guideline}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Adherence Counseling</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adherence-counseling"
                    checked={assessmentData.adherence_counselling}
                    onCheckedChange={(checked) => setAssessmentData((prev) => ({ ...prev, adherence_counselling: !!checked }))}
                  />
                  <Label htmlFor="adherence-counseling" className="font-medium">Adherence counseling provided</Label>
                </div>

                {assessmentData.adherence_counselling && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Adherence Counseling Components:</strong>
                    </p>
                    <ul className="text-sm text-blue-600 mt-2 space-y-1">
                      <li>• Importance of daily medication adherence</li>
                      <li>• Timing of medication administration</li>
                      <li>• Side effect management</li>
                      <li>• Missed dose instructions</li>
                      <li>• Follow-up appointment scheduling</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="follow-up" className="space-y-6">
            {!canAccessFollowUp ? (
              <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
                <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Follow-up Access Restricted</h3>
                <p className="text-gray-600 mb-4">
                  Complete eligibility assessment with "Yes, eligible for PrEP" to access follow-up functionality.
                </p>
                <div className="text-sm text-gray-500">
                  Current eligibility status: {assessmentData.prep_eligible === false ? "No, defer PrEP" : "Not assessed"}
                </div>
              </div>
            ) : (
              <>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">Follow-up Planning</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="follow-up-date">Follow-up appointment date</Label>
                    <Input
                      id="follow-up-date"
                      type="date"
                      value={assessmentData.follow_up_date}
                      onChange={(e) => setAssessmentData((prev) => ({ ...prev, follow_up_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type of follow-up</Label>
                    <RadioGroup
                      value={assessmentData.follow_up_type}
                      onValueChange={(value) => setAssessmentData((prev) => ({ ...prev, follow_up_type: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="retesting" id="retesting" />
                        <Label htmlFor="retesting">Retesting for HIV</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scheduled-prep" id="scheduled-prep" />
                        <Label htmlFor="scheduled-prep">Scheduled PrEP follow-up</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Assessment Documentation</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessment-notes">Assessment notes</Label>
                    <Textarea
                      id="assessment-notes"
                      placeholder="Document clinical findings, decisions, and follow-up plan..."
                      value={assessmentData.notes}
                      onChange={(e) => setAssessmentData((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assessed-by">Assessed by</Label>
                      <Input
                        id="assessed-by"
                        placeholder="Healthcare provider name"
                        value={assessmentData.assessed_by}
                        onChange={(e) => setAssessmentData((prev) => ({ ...prev, assessed_by: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assessment-date">Assessment date</Label>
                      <Input
                        id="assessment-date"
                        type="date"
                        value={assessmentData.assessment_date}
                        onChange={(e) => setAssessmentData((prev) => ({ ...prev, assessment_date: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-full bg-gray-200 hover:bg-gray-300"
          >
            Close
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={!hasRequiredData || isLoading}
            className="rounded-full bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dynamic Alert Modal - Show for all risk levels when assessment is complete */}
    <div onClick={handleChildModalEvents} onKeyDown={handleChildModalEvents}>
      <PrepDynamicAlertModal
        riskInfo={calculatedRisk}
        open={showClinicalDecisionModal}
        onClose={handleModalClose}
        onAction={handleDynamicAlertAction}
        maxScore={20}
        protocol="ANC PrEP Assessment"
      />
    </div>

    {/* Eligibility Modal - Show for eligibility assessment and clinical recommendations */}
    <div onClick={handleChildModalEvents} onKeyDown={handleChildModalEvents}>
      <PrepEligibilityModal
        eligibilityData={eligibilityData}
        clinicalRecommendations={clinicalRecommendations}
        open={showEligibilityModal}
        onClose={() => handleChildModalStateChange('eligibility', false)}
        onAction={handleEligibilityAction}
        protocol="PrEP Eligibility Assessment"
      />
    </div>

    {/* POC Tests Modal Integration */}
    <div onClick={handleChildModalEvents} onKeyDown={handleChildModalEvents}>
      <POCTestOrderDialog
        open={showPOCTestsModal}
        onClose={handlePOCTestsClose}
        onSave={handlePOCTestsSave}
      />
    </div>

    {/* PrEP Deferral Modal - Triggered when eligibility is denied */}
    <div onClick={handleChildModalEvents} onKeyDown={handleChildModalEvents}>
      <PrepDeferralModal
        open={showDeferralModal}
        onClose={() => handleChildModalStateChange('deferral', false)}
        exclusionCriteria={autoEligibility.reason ? [autoEligibility.reason] : []}
        onAcknowledge={handleDeferralAcknowledgment}
      />
    </div>

  </>
  )
}
