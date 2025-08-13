"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { X, Calculator, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AncDecisionSupportAlert } from "./anc-decision-support"

interface VitalsData {
  // Blood Pressure
  systolic_blood_pressure: string
  diastolic_blood_pressure: string
  sbp_after_10_to_15_minutes: string
  dbp_after_10_to_15_minutes: string
  any_symptoms_of_pre_elampsia: string[]
  urine_dipstick: string
  unable_to_record_bp: boolean
  unable_to_record_bp_reasons: string[]
  unable_to_record_bp_other: string

  // Height & Weight
  height: string
  weight: string

  // Vitals
  temperature: string
  second_temperature: string
  pulse_rate: string
  second_pulse_rate: string
  unrecordable_below_pulse_rate: string[]
  respiratory_rate: string
  second_respiratory_rate: string

  // Additional fields from form
  date: string
  time: string
  oxygen_saturation: string
  muac: string
  muac_score: string
  abdominal_circumference: string
  head_circumference: string
  hc_score: string
  note: string
}

interface VitalSignsMeasurementsProps {
  open: boolean
  onClose: () => void
  onSave: (data: VitalsData) => void
  onTriggerDangerSigns?: (signs: string[]) => void
}

export const VitalSignsMeasurements: React.FC<VitalSignsMeasurementsProps> = ({ open, onClose, onSave, onTriggerDangerSigns }) => {
  const [formData, setFormData] = useState<VitalsData>({
    systolic_blood_pressure: "",
    diastolic_blood_pressure: "",
    sbp_after_10_to_15_minutes: "",
    dbp_after_10_to_15_minutes: "",
    any_symptoms_of_pre_elampsia: [],
    urine_dipstick: "",
    unable_to_record_bp: false,
    unable_to_record_bp_reasons: [],
    unable_to_record_bp_other: "",
    height: "",
    weight: "",
    temperature: "",
    second_temperature: "",
    pulse_rate: "",
    second_pulse_rate: "",
    unrecordable_below_pulse_rate: [],
    respiratory_rate: "",
    second_respiratory_rate: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0,5), // 24-hour format HH:MM
    oxygen_saturation: "",
    muac: "",
    muac_score: "",
    abdominal_circumference: "",
    head_circumference: "",
    hc_score: "",
    note: "",
  })

  const [bmi, setBmi] = useState<string>("")
  const [timeError, setTimeError] = useState<string>("")

  const [canShowFollowUpBP, setCanShowFollowUpBP] = useState<boolean>(false)
  const [highRiskAlert, setHighRiskAlert] = useState<boolean>(false)
  const [dangerSignsTriggered, setDangerSignsTriggered] = useState<boolean>(false)
  const [saveWarningShown, setSaveWarningShown] = useState<boolean>(false)
  const [currentDangerSigns, setCurrentDangerSigns] = useState<string[]>([])
  const [showDangerSignsAlert, setShowDangerSignsAlert] = useState<boolean>(false)

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (formData.height && formData.weight) {
      const heightInMeters = Number.parseFloat(formData.height) / 100
      const weightInKg = Number.parseFloat(formData.weight)
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmiValue = weightInKg / (heightInMeters * heightInMeters)
        setBmi(bmiValue.toFixed(1))
      }
    } else {
      setBmi("")
    }
  }, [formData.height, formData.weight])

  // Enhanced BP Business Rules
  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120) {
      return { category: "hypertensive_crisis", severity: "critical", color: "red" }
    } else if (systolic >= 140 || diastolic >= 90) {
      return { category: "stage_2_hypertension", severity: "high", color: "red" }
    } else if (systolic >= 130 || diastolic >= 80) {
      return { category: "stage_1_hypertension", severity: "moderate", color: "orange" }
    } else if (systolic >= 120 && diastolic < 80) {
      return { category: "elevated", severity: "mild", color: "yellow" }
    } else if (systolic < 90 || diastolic < 60) {
      return { category: "hypotension", severity: "low", color: "blue" }
    } else {
      return { category: "normal", severity: "normal", color: "green" }
    }
  }

  // Enhanced BMI Business Rules
  const getBMICategory = (bmi: number) => {
    if (bmi < 16) {
      return { category: "severely_underweight", severity: "critical", color: "red", risk: "high" }
    } else if (bmi < 18.5) {
      return { category: "underweight", severity: "moderate", color: "orange", risk: "moderate" }
    } else if (bmi < 25) {
      return { category: "normal", severity: "normal", color: "green", risk: "low" }
    } else if (bmi < 30) {
      return { category: "overweight", severity: "mild", color: "yellow", risk: "moderate" }
    } else if (bmi < 35) {
      return { category: "obesity_class_1", severity: "moderate", color: "orange", risk: "high" }
    } else if (bmi < 40) {
      return { category: "obesity_class_2", severity: "high", color: "red", risk: "high" }
    } else {
      return { category: "obesity_class_3", severity: "critical", color: "red", risk: "very_high" }
    }
  }

  // Get BMI status message and recommendations
  const getBMIStatusMessage = (bmi: number) => {
    const category = getBMICategory(bmi)
    const messages = {
      severely_underweight: {
        status: "CRITICAL: Severely Underweight",
        description: "BMI below 16 - Immediate nutritional assessment required",
        recommendations: ["Immediate medical evaluation", "Nutritional counseling", "Monitor for eating disorders"],
        pregnancyNote: "High risk for pregnancy complications - specialized care needed",
      },
      underweight: {
        status: "MODERATE: Underweight",
        description: "BMI 16-18.4 - Below healthy weight range",
        recommendations: ["Nutritional assessment", "Weight gain plan", "Monitor nutritional status"],
        pregnancyNote: "May need additional weight gain monitoring during pregnancy",
      },
      normal: {
        status: "Normal Weight",
        description: "BMI 18.5-24.9 - Healthy weight range",
        recommendations: ["Maintain current weight", "Continue healthy lifestyle"],
        pregnancyNote: "Optimal BMI range for pregnancy",
      },
      overweight: {
        status: "MILD: Overweight",
        description: "BMI 25-29.9 - Above healthy weight range",
        recommendations: ["Weight management counseling", "Lifestyle modifications", "Regular monitoring"],
        pregnancyNote: "Monitor for gestational diabetes and hypertension",
      },
      obesity_class_1: {
        status: "MODERATE: Obesity Class I",
        description: "BMI 30-34.9 - Moderate obesity",
        recommendations: [
          "Weight management program",
          "Dietary counseling",
          "Exercise plan",
          "Regular health monitoring",
        ],
        pregnancyNote: "Increased risk of pregnancy complications - enhanced monitoring required",
      },
      obesity_class_2: {
        status: "HIGH: Obesity Class II",
        description: "BMI 35-39.9 - Severe obesity",
        recommendations: [
          "Intensive weight management",
          "Medical evaluation",
          "Consider bariatric consultation",
          "Comorbidity screening",
        ],
        pregnancyNote: "High risk pregnancy - specialist care recommended",
      },
      obesity_class_3: {
        status: "CRITICAL: Obesity Class III",
        description: "BMI ≥40 - Extreme obesity",
        recommendations: [
          "Immediate medical evaluation",
          "Bariatric surgery consultation",
          "Intensive lifestyle intervention",
          "Comprehensive health assessment",
        ],
        pregnancyNote: "Very high risk pregnancy - multidisciplinary care team required",
      },
    }
    return { ...messages[category.category], category }
  }

  // Check if initial BP requires follow-up measurement
  const requiresFollowUpBP = () => {
    const sbp = Number.parseInt(formData.systolic_blood_pressure)
    const dbp = Number.parseInt(formData.diastolic_blood_pressure)
    if (sbp > 0 && dbp > 0) {
      const category = getBPCategory(sbp, dbp)
      return category.severity !== "normal"
    }
    return false
  }

  // Check if BP values are abnormal (for pre-eclampsia screening)
  const isBPAbnormal = () => {
    const sbp = Number.parseInt(formData.sbp_after_10_to_15_minutes)
    const dbp = Number.parseInt(formData.dbp_after_10_to_15_minutes)
    if (sbp > 0 && dbp > 0) {
      // Pre-eclampsia threshold: ≥140/90 mmHg
      return sbp >= 140 || dbp >= 90
    }
    return false
  }

  // Check if second BP reading is significantly different from first
  const hasSignificantBPChange = () => {
    const initialSbp = Number.parseInt(formData.systolic_blood_pressure)
    const initialDbp = Number.parseInt(formData.diastolic_blood_pressure)
    const followUpSbp = Number.parseInt(formData.sbp_after_10_to_15_minutes)
    const followUpDbp = Number.parseInt(formData.dbp_after_10_to_15_minutes)

    if (initialSbp > 0 && initialDbp > 0 && followUpSbp > 0 && followUpDbp > 0) {
      const sbpDiff = Math.abs(initialSbp - followUpSbp)
      const dbpDiff = Math.abs(initialDbp - followUpDbp)
      // Significant change: >10 mmHg difference
      return sbpDiff > 10 || dbpDiff > 10
    }
    return false
  }

  // Get BP status message
  const getBPStatusMessage = (systolic: number, diastolic: number) => {
    const category = getBPCategory(systolic, diastolic)
    const messages = {
      hypertensive_crisis: "CRITICAL: Hypertensive Crisis - Immediate medical attention required",
      stage_2_hypertension: "HIGH: Stage 2 Hypertension - Follow-up measurement recommended",
      stage_1_hypertension: "MODERATE: Stage 1 Hypertension - Monitor closely",
      elevated: "MILD: Elevated Blood Pressure - Lifestyle modifications recommended",
      hypotension: "LOW: Hypotension - Monitor for symptoms",
      normal: "Normal Blood Pressure",
    }
    return { message: messages[category.category], color: category.color }
  }

  // Check if temperature is abnormal
  const isTemperatureAbnormal = () => {
    const temp = Number.parseFloat(formData.temperature)
    return temp < 36.1 || temp > 37.2
  }

  // Check if pulse rate is abnormal
  const isPulseRateAbnormal = () => {
    const pulse = Number.parseInt(formData.pulse_rate)
    return pulse < 60 || pulse > 100
  }

  // Check if second pulse rate is abnormal
  const isSecondPulseRateAbnormal = () => {
    const pulse = Number.parseInt(formData.second_pulse_rate)
    return pulse < 60 || pulse > 100
  }

  // Check if respiratory rate is abnormal
  const isRespiratoryRateAbnormal = () => {
    const rate = Number.parseInt(formData.respiratory_rate)
    return rate < 12 || rate > 20
  }

  // Real-time BP danger signs detection
  const checkBPDangerSigns = (sbp: string, dbp: string, isInitial: boolean = false) => {
    const systolic = Number.parseInt(sbp)
    const diastolic = Number.parseInt(dbp)
    
    // Different thresholds for initial vs follow-up BP
    const threshold = isInitial ? { systolic: 180, diastolic: 120 } : { systolic: 160, diastolic: 110 }
    
    if (systolic >= threshold.systolic || diastolic >= threshold.diastolic) {
      if (!dangerSignsTriggered) {
        setDangerSignsTriggered(true)
        const dangerType = isInitial ? "Severe hypertensive crisis" : "Severe hypertension"
        setCurrentDangerSigns([dangerType])
        setShowDangerSignsAlert(true)
      }
    }
  }

  const handleInputChange = (field: keyof VitalsData, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Check for immediate danger signs on BP field changes
    if (field === "systolic_blood_pressure" && typeof value === "string") {
      checkBPDangerSigns(value, formData.diastolic_blood_pressure, true)
    } else if (field === "diastolic_blood_pressure" && typeof value === "string") {
      checkBPDangerSigns(formData.systolic_blood_pressure, value, true)
    } else if (field === "sbp_after_10_to_15_minutes" && typeof value === "string") {
      checkBPDangerSigns(value, formData.dbp_after_10_to_15_minutes, false)
    } else if (field === "dbp_after_10_to_15_minutes" && typeof value === "string") {
      checkBPDangerSigns(formData.sbp_after_10_to_15_minutes, value, false)
    }
  }

  const handleMultiSelectChange = (field: keyof VitalsData, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value],
        }
      } else {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        }
      }
    })
  }

  // Validate time format and check 20-minute follow-up requirement
  const validateTime = (timeValue: string) => {
    if (!timeValue) {
      setTimeError("Time is required")
      return false
    }

    // Basic time format validation for HTML time input (HH:MM 24-hour format)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(timeValue)) {
      setTimeError("Please enter a valid time")
      return false
    }

    // Check if follow-up BP measurements require 10-15 minute wait
    if (requiresFollowUpBP() && (formData.sbp_after_10_to_15_minutes || formData.dbp_after_10_to_15_minutes)) {
      const initialTime = formData.time
      const followUpTime = timeValue
      
      if (initialTime && followUpTime && initialTime !== followUpTime) {
        const timeDiff = calculateTimeDifference(initialTime, followUpTime)
        if (timeDiff < 10 && timeDiff >= 0) {
          const initialTimeFormatted = formatTimeForDisplay(initialTime)
          setTimeError(`Follow-up BP measurement requires at least 10 minutes after initial time`)
          showFollowUpBPToast(initialTimeFormatted)
          return false
        }
        if (timeDiff > 15 && timeDiff >= 0) {
          const initialTimeFormatted = formatTimeForDisplay(initialTime)
          setTimeError(`Follow-up BP measurement should be taken within 15 minutes of initial measurement`)
          showFollowUpBPToast(initialTimeFormatted)
          return false
        }
        if (timeDiff > 15 && timeDiff >= 0) {
          const initialTimeFormatted = formatTimeForDisplay(initialTime)
          setTimeError(`Follow-up BP measurement should be taken within 15 minutes of initial measurement`)
          showFollowUpBPToast(initialTimeFormatted)
          return false
        }
      }
    }

    setTimeError("")
    return true
  }

  // Convert 24-hour time to 12-hour display format
  const formatTimeForDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Calculate time difference in minutes (24-hour format)
  const calculateTimeDifference = (startTime: string, endTime: string) => {
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const startMinutes = parseTime(startTime)
    const endMinutes = parseTime(endTime)
    
    // Handle same day time difference
    let diff = endMinutes - startMinutes
    // Handle next day scenarios (if end time is earlier, assume next day)
    if (diff < 0) {
      diff += 24 * 60
    }
    
    return diff
  }

  // Show detailed clinical information modal
  const showClinicalInfoModal = (initialTime: string) => {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg mx-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Clinical Recommendation</h3>
          </div>
          <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <p class="text-gray-600 mb-6">Based on the assessment of blood pressure measurements</p>
        
        <div class="mb-6">
          <h4 class="font-medium text-gray-900 mb-2">WHO Timing Guidelines:</h4>
          <ul class="text-gray-600 text-sm space-y-1">
            <li>• Follow-up BP measurement required after initial reading</li>
            <li>• Wait 10-15 minutes between measurements</li>
            <li>• Initial time recorded: ${initialTime}</li>
          </ul>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg mb-6">
          <h4 class="font-medium text-green-800 mb-2">Recommendation:</h4>
          <p class="text-green-700 text-sm">Follow WHO guidelines for accurate hypertension assessment. The 10-15 minute interval ensures proper rest and accurate readings for clinical decision making.</p>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="flex items-start space-x-2">
            <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span class="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h4 class="font-medium text-blue-800 mb-1">Clinical Decision Support Information</h4>
              <p class="text-blue-700 text-sm">This timing requirement helps differentiate between white coat hypertension and persistent hypertension, ensuring appropriate clinical management and treatment decisions.</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onclick="this.parentElement.parentElement.parentElement.remove()">Save</button>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Remove modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }

  // Show toast notification for follow-up BP timing requirement
  const showFollowUpBPToast = (initialTime: string) => {
    // Create toast notification with full green theme
    const toastContainer = document.createElement('div')
    toastContainer.className = 'fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md'
    toastContainer.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-green-900 font-medium text-sm mb-1">Clinical Recommendation</h4>
            <p class="text-green-700 text-sm">Follow-up BP measurement should be taken 10-15 minutes after the initial time (${initialTime}).</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 ml-4">

          <button class="text-green-400 hover:text-green-600" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `
    

    
    document.body.appendChild(toastContainer)
    
    // Auto-remove toast after 8 seconds
    setTimeout(() => {
      if (toastContainer.parentNode) {
        toastContainer.remove()
      }
    }, 8000)
  }

  const handleSave = () => {
    // Validate required time field
    if (!validateTime(formData.time)) {
      return
    }
    
    // Show warning if danger signs were triggered but user is trying to save without addressing
    if (dangerSignsTriggered && !saveWarningShown) {
      setSaveWarningShown(true)
      const warningModal = document.createElement('div')
      warningModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      warningModal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Danger Signs Detected</h3>
          </div>
          <p class="text-gray-600 mb-6">Severe hypertension was detected during this assessment. Please ensure appropriate action has been taken before saving.</p>
          <div class="flex justify-end space-x-3">
            <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onclick="window.proceedWithSave()">Save Anyway</button>
          </div>
        </div>
      `
      
      // Add proceed function to window
      window.proceedWithSave = () => {
        warningModal.remove()
        delete window.proceedWithSave
        onSave(formData)
        onClose()
      }
      
      document.body.appendChild(warningModal)
      return
    }
    
    // Check for other danger signs (non-BP) before saving
    const dangerSigns = detectDangerSigns()
    if (dangerSigns.length > 0 && onTriggerDangerSigns) {
      onTriggerDangerSigns(dangerSigns)
      return // Don't close the dialog yet, let the danger signs modal handle it
    }
    
    onSave(formData)
    onClose()
  }

  // Detect danger signs based on vital signs (excluding BP if already triggered)
  const detectDangerSigns = (): string[] => {
    const signs: string[] = []
    
    // Parse BP values (needed for multiple checks)
    const sbp = Number.parseInt(formData.systolic_blood_pressure)
    const dbp = Number.parseInt(formData.diastolic_blood_pressure)
    const followUpSbp = Number.parseInt(formData.sbp_after_10_to_15_minutes)
    const followUpDbp = Number.parseInt(formData.dbp_after_10_to_15_minutes)
    
    // Skip BP danger signs if already triggered immediately
    if (!dangerSignsTriggered) {
      // Check for severe hypertension (≥160/110 for follow-up, ≥180/120 for initial)
      if ((sbp >= 180 || dbp >= 120) || (followUpSbp >= 160 || followUpDbp >= 110)) {
        signs.push("Severe hypertension")
      }
    }
    
    // Check for pre-eclampsia (BP ≥140/90 + symptoms)
    if ((sbp >= 140 || dbp >= 90 || followUpSbp >= 140 || followUpDbp >= 90) && 
        formData.any_symptoms_of_pre_elampsia.length > 0) {
      signs.push("Pre-eclampsia symptoms with hypertension")
    }
    
    // Check for severe symptoms regardless of BP
    const severeSymptoms = formData.any_symptoms_of_pre_elampsia.filter(symptom => 
      ["Severe headache", "Visual disturbance", "Convulsing", "Unconscious"].includes(symptom)
    )
    if (severeSymptoms.length > 0) {
      signs.push(...severeSymptoms)
    }
    
    // Check temperature extremes
    const temp = Number.parseFloat(formData.temperature)
    const secondTemp = Number.parseFloat(formData.second_temperature)
    if (temp >= 38.0 || secondTemp >= 38.0) {
      signs.push("Fever")
    }
    if (temp <= 35.0 || secondTemp <= 35.0) {
      signs.push("Hypothermia")
    }
    
    // Check pulse rate extremes
    const pulse = Number.parseInt(formData.pulse_rate)
    const secondPulse = Number.parseInt(formData.second_pulse_rate)
    if (pulse >= 120 || secondPulse >= 120) {
      signs.push("Tachycardia")
    }
    if (pulse <= 50 || secondPulse <= 50) {
      signs.push("Bradycardia")
    }
    
    // Check respiratory rate
    const respRate = Number.parseInt(formData.respiratory_rate)
    const secondRespRate = Number.parseInt(formData.second_respiratory_rate)
    if (respRate >= 24 || secondRespRate >= 24) {
      signs.push("Tachypnea")
    }
    if (respRate <= 12 || secondRespRate <= 12) {
      signs.push("Bradypnea")
    }
    
    // Check oxygen saturation
    const o2Sat = Number.parseInt(formData.oxygen_saturation)
    if (o2Sat < 95 && o2Sat > 0) {
      signs.push("Low oxygen saturation")
    }
    
    // Check MUAC for malnutrition
    const muac = Number.parseFloat(formData.muac)
    if (muac < 21 && muac > 0) {
      signs.push("Severe malnutrition")
    } else if (muac < 23 && muac > 0) {
      signs.push("Malnutrition risk")
    }
    
    return signs
  }

  if (!open) return null

  return (
    <>
      {/* Danger Signs Alert Modal */}
      {showDangerSignsAlert && (
        <AncDecisionSupportAlert 
          dangerSigns={currentDangerSigns}
          onRecordClosure={(reason) => {
            console.log("Danger signs addressed:", reason)
            setShowDangerSignsAlert(false)
          }}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Vital Signs & Measurements</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 rounded-full px-6 border-none"
            >
              Close
            </Button>
          </CardHeader>

        <CardContent className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-red-600">Time * (Required)</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => {
                  handleInputChange("time", e.target.value)
                  // Delay validation to allow for follow-up BP entry
                  setTimeout(() => validateTime(e.target.value), 100)
                }}
                className={`border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none ${timeError ? "border-red-500" : ""}`}
                required
              />
              {timeError && <p className="text-red-500 text-sm mt-1">{timeError}</p>}
              <p className="text-gray-500 text-xs">Current time: {formatTimeForDisplay(new Date().toTimeString().slice(0,5))}</p>
            </div>
          </div>

          {/* Height & Weight Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Height & Weight</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Enter Weight (kg)"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="Enter Height (cm)"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>BMI</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={bmi}
                    readOnly
                    placeholder="Auto-calculated"
                    className={`border-2 rounded p-2 text-black focus:outline-none ${
                      bmi && getBMICategory(Number.parseFloat(bmi)).severity === "critical"
                        ? "border-red-500 bg-red-50"
                        : bmi && getBMICategory(Number.parseFloat(bmi)).severity === "high"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-300"
                    }`}
                  />
                  <Calculator className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* BMI Status Indicator */}
            {bmi && (
              <div className="mt-4">
                <div
                  className={`p-4 rounded-lg border ${
                    getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                      ? "bg-red-50 border-red-200"
                      : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                        ? "bg-orange-50 border-orange-200"
                        : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                          ? "bg-red-500"
                          : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                            ? "bg-orange-500"
                            : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className={`font-medium ${
                            getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                              ? "text-red-900"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                                ? "text-orange-900"
                                : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                  ? "text-yellow-900"
                                  : "text-green-900"
                          }`}
                        >
                          {getBMIStatusMessage(Number.parseFloat(bmi)).status}
                        </h4>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                              ? "bg-red-100 text-red-800"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                                ? "bg-orange-100 text-orange-800"
                                : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          BMI: {bmi}
                        </span>
                      </div>

                      <p
                        className={`text-sm mb-3 ${
                          getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                            ? "text-red-700"
                            : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                              ? "text-orange-700"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                ? "text-yellow-700"
                                : "text-green-700"
                        }`}
                      >
                        {getBMIStatusMessage(Number.parseFloat(bmi)).description}
                      </p>

                      {/* Pregnancy-specific note */}
                      <div
                        className={`p-3 rounded-md mb-3 ${
                          getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                            ? "bg-red-100 border border-red-200"
                            : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                              ? "bg-orange-100 border border-orange-200"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                ? "bg-yellow-100 border border-yellow-200"
                                : "bg-green-100 border border-green-200"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                              ? "text-red-800"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                                ? "text-orange-800"
                                : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                  ? "text-yellow-800"
                                  : "text-green-800"
                          }`}
                        >
                          Pregnancy Consideration:
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                              ? "text-red-700"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                                ? "text-orange-700"
                                : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                  ? "text-yellow-700"
                                  : "text-green-700"
                          }`}
                        >
                          {getBMIStatusMessage(Number.parseFloat(bmi)).pregnancyNote}
                        </p>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <p
                          className={`text-sm font-medium mb-2 ${
                            getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                              ? "text-red-800"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                                ? "text-orange-800"
                                : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                  ? "text-yellow-800"
                                  : "text-green-800"
                          }`}
                        >
                          Recommendations:
                        </p>
                        <ul
                          className={`text-sm space-y-1 ${
                            getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "red"
                              ? "text-red-700"
                              : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "orange"
                                ? "text-orange-700"
                                : getBMIStatusMessage(Number.parseFloat(bmi)).category.color === "yellow"
                                  ? "text-yellow-700"
                                  : "text-green-700"
                          }`}
                        >
                          {getBMIStatusMessage(Number.parseFloat(bmi)).recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-xs mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Critical BMI Alert */}
                      {getBMIStatusMessage(Number.parseFloat(bmi)).category.severity === "critical" && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                          <p className="font-bold text-red-900 flex items-center">CRITICAL BMI ALERT</p>
                          <p className="text-sm text-red-800 mt-1">
                            This BMI level requires immediate medical attention and specialized care planning.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Blood Pressure Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Blood Pressure</h3>

            {!formData.unable_to_record_bp && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">Systolic Blood Pressure (SBP)(mmHg) *</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="Enter Systolic (mmHg)"
                      value={formData.systolic_blood_pressure}
                      onChange={(e) => handleInputChange("systolic_blood_pressure", e.target.value)}
                      className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">Diastolic Blood Pressure (DBP)(mmHg) *</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="Enter Diastolic (mmHg)"
                      value={formData.diastolic_blood_pressure}
                      onChange={(e) => handleInputChange("diastolic_blood_pressure", e.target.value)}
                      className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Unable to record BP checkbox - Only show when both BP fields are empty */}
                {!formData.systolic_blood_pressure && !formData.diastolic_blood_pressure && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="unable_to_record_bp"
                      checked={formData.unable_to_record_bp}
                      onCheckedChange={(checked) => handleInputChange("unable_to_record_bp", checked as boolean)}
                    />
                    <Label htmlFor="unable_to_record_bp">Unable to record BP (Blood pressure cannot be taken)</Label>
                  </div>
                )}

                {/* BP Status Indicator */}
                {formData.systolic_blood_pressure && formData.diastolic_blood_pressure && (
                  <div
                    className={`p-3 rounded-lg border ${
                      getBPStatusMessage(
                        Number.parseInt(formData.systolic_blood_pressure),
                        Number.parseInt(formData.diastolic_blood_pressure),
                      ).color === "red"
                        ? "bg-red-50 border-red-200 text-red-800"
                        : getBPStatusMessage(
                              Number.parseInt(formData.systolic_blood_pressure),
                              Number.parseInt(formData.diastolic_blood_pressure),
                            ).color === "orange"
                          ? "bg-orange-50 border-orange-200 text-orange-800"
                          : getBPStatusMessage(
                                Number.parseInt(formData.systolic_blood_pressure),
                                Number.parseInt(formData.diastolic_blood_pressure),
                              ).color === "yellow"
                            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                            : getBPStatusMessage(
                                  Number.parseInt(formData.systolic_blood_pressure),
                                  Number.parseInt(formData.diastolic_blood_pressure),
                                ).color === "blue"
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : "bg-green-50 border-green-200 text-green-800"
                    }`}
                  >
                    <p className="font-medium">
                      {
                        getBPStatusMessage(
                          Number.parseInt(formData.systolic_blood_pressure),
                          Number.parseInt(formData.diastolic_blood_pressure),
                        ).message
                      }
                    </p>
                    <p className="text-sm mt-1">
                      Reading: {formData.systolic_blood_pressure}/{formData.diastolic_blood_pressure} mmHg
                    </p>
                  </div>
                )}

                {/* Follow-up BP Section - Always show when initial BP requires follow-up */}
                {requiresFollowUpBP() && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">i</span>
                      </div>
                      <h4 className="font-medium text-blue-900">
                        Follow-up BP Measurement (After 10-15 minutes rest)
                      </h4>
                    </div>
                    <p className="text-blue-700 text-sm">Recommended waiting 10-15 minutes between measurements for accurate assessment.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sbp_followup">Follow-up Systolic BP (mmHg)</Label>
                        <Input
                          id="sbp_followup"
                          type="number"
                          placeholder="Enter Systolic (mmHg)"
                          value={formData.sbp_after_10_to_15_minutes}
                          onChange={(e) => {
                            handleInputChange("sbp_after_10_to_15_minutes", e.target.value)
                            // Check for danger signs on follow-up BP
                            if (e.target.value) {
                              checkBPDangerSigns(e.target.value, formData.dbp_after_10_to_15_minutes, false)
                            }
                            // Show toast notification when user enters data but timing isn't met
                            if (e.target.value && formData.time) {
                              const timeDiff = calculateTimeDifference(formData.time, formData.time)
                              if (timeDiff < 20) {
                                showFollowUpBPToast(formatTimeForDisplay(formData.time))
                              }
                            }
                          }}
                          className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dbp_followup">Follow-up Diastolic BP (mmHg)</Label>
                        <Input
                          id="dbp_followup"
                          type="number"
                          placeholder="Enter Diastolic (mmHg)"
                          value={formData.dbp_after_10_to_15_minutes}
                          onChange={(e) => {
                            handleInputChange("dbp_after_10_to_15_minutes", e.target.value)
                            // Check for danger signs on follow-up BP
                            if (e.target.value) {
                              checkBPDangerSigns(formData.sbp_after_10_to_15_minutes, e.target.value, false)
                            }
                            // Show toast notification when user enters data but timing isn't met
                            if (e.target.value && formData.time) {
                              const timeDiff = calculateTimeDifference(formData.time, formData.time)
                              if (timeDiff < 20) {
                                showFollowUpBPToast(formatTimeForDisplay(formData.time))
                              }
                            }
                          }}
                          className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                    </div>
                    {/* Follow-up BP Status */}
                    {formData.sbp_after_10_to_15_minutes && formData.dbp_after_10_to_15_minutes && (
                      <div className="mt-4">
                        <div
                          className={`p-3 rounded-lg border ${
                            isBPAbnormal()
                              ? "bg-red-50 border-red-200 text-red-800"
                              : "bg-green-50 border-green-200 text-green-800"
                          }`}
                        >
                          <p className="font-medium">
                            Follow-up Reading: {formData.sbp_after_10_to_15_minutes}/
                            {formData.dbp_after_10_to_15_minutes} mmHg
                          </p>
                          <p className="text-sm mt-1">
                            {isBPAbnormal()
                              ? "ABNORMAL: BP remains elevated (≥140/90 mmHg) - Pre-eclampsia screening required"
                              : "NORMAL: BP has normalized"}
                          </p>
                          {hasSignificantBPChange() && (
                            <p className="text-sm mt-1 font-medium">
                              Significant change from initial reading detected
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pre-eclampsia screening - Only show if follow-up BP is abnormal */}
                {isBPAbnormal() && (
                  <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h4 className="font-medium text-red-900">Pre-eclampsia Screening Required</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-4">
                      Blood pressure remains ≥140/90 mmHg after rest. Please complete pre-eclampsia assessment.
                    </p>

                    <div className="space-y-2">
                      <Label className="text-red-900 font-medium">Any symptoms of severe pre-eclampsia:</Label>
                      <div className="space-y-2">
                        {[
                          "None",
                          "Severe headache",
                          "Visual disturbance",
                          "Epigastric pain",
                          "Dizziness",
                          "Vomitting",
                        ].map((symptom) => (
                          <div key={symptom} className="flex items-center space-x-2">
                            <Checkbox
                              id={symptom}
                              checked={formData.any_symptoms_of_pre_elampsia.includes(symptom)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectChange("any_symptoms_of_pre_elampsia", symptom, checked as boolean)
                              }
                            />
                            <Label htmlFor={symptom} className="text-red-800">
                              {symptom}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urine_dipstick" className="text-red-900 font-medium">
                        Urine dipstick result - protein:
                      </Label>
                      <Select
                        value={formData.urine_dipstick}
                        onValueChange={(value) => handleInputChange("urine_dipstick", value)}
                      >
                        <SelectTrigger className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                          <SelectValue placeholder="Select protein level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="+">+ (Trace)</SelectItem>
                          <SelectItem value="2+">2+ (Mild)</SelectItem>
                          <SelectItem value="3+">3+ (Moderate)</SelectItem>
                          <SelectItem value="4+">4+ (Severe)</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.urine_dipstick && formData.urine_dipstick !== "None" && (
                        <p className="text-sm text-red-700 mt-1">
                          Proteinuria detected - Consider immediate medical evaluation
                        </p>
                      )}
                    </div>

                    {/* Risk Assessment */}
                    {(formData.any_symptoms_of_pre_elampsia.length > 1 ||
                      (formData.any_symptoms_of_pre_elampsia.length === 1 &&
                        !formData.any_symptoms_of_pre_elampsia.includes("None")) ||
                      (formData.urine_dipstick && formData.urine_dipstick !== "None")) && (
                      <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="font-bold text-red-900">HIGH RISK ALERT</p>
                        <p className="text-sm text-red-800 mt-1">
                          Patient shows signs of severe pre-eclampsia. Immediate medical attention recommended.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* High Risk Pre-eclampsia Alert */}
          {highRiskAlert && (
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-semibold mb-2">HIGH RISK ALERT</div>
                <div>Patient shows signs of severe pre-eclampsia. Immediate medical attention recommended.</div>
                <div className="mt-2 text-sm">
                  This will trigger the danger signs assessment for comprehensive evaluation.
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Vitals Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Vitals</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C) *</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="Enter Temperature (°C)"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange("temperature", e.target.value)}
                  className="border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pulse_rate">Pulse rate (bpm)</Label>
                <Input
                  id="pulse_rate"
                  type="number"
                  placeholder="Enter Pulse Rate (bpm)"
                  value={formData.pulse_rate}
                  onChange={(e) => handleInputChange("pulse_rate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="respiratory_rate">Respiratory rate</Label>
                <Input
                  id="respiratory_rate"
                  type="number"
                  placeholder="Enter Respiratory Rate"
                  value={formData.respiratory_rate}
                  onChange={(e) => handleInputChange("respiratory_rate", e.target.value)}
                />
              </div>
            </div>

            {/* Second temperature if first is abnormal */}
            {isTemperatureAbnormal() && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <Label htmlFor="second_temperature">Second Temperature after 30 minutes (°C)</Label>
                  <Input
                    id="second_temperature"
                    type="number"
                    step="0.1"
                    placeholder="Enter Second Temperature (°C)"
                    value={formData.second_temperature}
                    onChange={(e) => handleInputChange("second_temperature", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Second pulse rate if first is abnormal */}
            {isPulseRateAbnormal() && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <Label htmlFor="second_pulse_rate">Second Pulse rate (bpm)</Label>
                  <Input
                    id="second_pulse_rate"
                    type="number"
                    placeholder="Enter Second Pulse Rate (bpm)"
                    value={formData.second_pulse_rate}
                    onChange={(e) => handleInputChange("second_pulse_rate", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Unrecordable below pulse rate if second pulse rate is abnormal */}
            {isSecondPulseRateAbnormal() && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="space-y-2">
                  <Label>Unrecordable below pulse rate:</Label>
                  <div className="space-y-2">
                    {["Vomiting", "Diarrhoea", "Severe hypertension and other"].map((reason) => (
                      <div key={reason} className="flex items-center space-x-2">
                        <Checkbox
                          id={reason}
                          checked={formData.unrecordable_below_pulse_rate.includes(reason)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange("unrecordable_below_pulse_rate", reason, checked as boolean)
                          }
                        />
                        <Label htmlFor={reason}>{reason}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Second respiratory rate if first is abnormal */}
            {isRespiratoryRateAbnormal() && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <Label htmlFor="second_respiratory_rate">Second respiratory rate</Label>
                  <Input
                    id="second_respiratory_rate"
                    type="number"
                    placeholder="Enter Second Respiratory Rate"
                    value={formData.second_respiratory_rate}
                    onChange={(e) => handleInputChange("second_respiratory_rate", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                <Input
                  id="oxygen_saturation"
                  type="number"
                  placeholder="Enter Oxygen Saturation (%)"
                  value={formData.oxygen_saturation}
                  onChange={(e) => handleInputChange("oxygen_saturation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="muac">MUAC (Mid-Upper Arm Circumference)</Label>
                <Input
                  id="muac"
                  placeholder="Enter MUAC (cm) - Maternal nutrition assessment"
                  value={formData.muac}
                  onChange={(e) => handleInputChange("muac", e.target.value)}
                />
                <p className="text-xs text-gray-600">Normal: ≥23cm for pregnant women</p>
                {formData.muac && Number.parseFloat(formData.muac) < 23 && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-900">MUAC Alert</p>
                    <p className="text-sm text-orange-700 mt-1">
                      MUAC &lt;23cm indicates risk of maternal malnutrition. Nutritional assessment recommended.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="abdominal_circumference">Abdominal Circumference (cm)</Label>
                <Input
                  id="abdominal_circumference"
                  type="number"
                  step="0.1"
                  placeholder="Enter Abdominal Circumference (cm)"
                  value={formData.abdominal_circumference}
                  onChange={(e) => handleInputChange("abdominal_circumference", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter Note"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 rounded-full px-6 border-none"
            >
              Close
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}