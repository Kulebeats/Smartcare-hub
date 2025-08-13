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
import { X, Stethoscope, AlertTriangle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MaternalAssessmentData {
  // Physical Examination
  pallor_present: 'yes' | 'no' | ''
  respiratory_exam: 'not_done' | 'normal' | 'abnormal' | ''
  respiratory_exam_abnormal: string[]
  oximetry: string
  cardiac_exam: 'not_done' | 'normal' | 'abnormal' | ''
  cardiac_exam_abnormal: string[]
  
  // Breast/Pelvic Examinations
  breast_exam: 'not_done' | 'normal' | 'abnormal' | ''
  breast_exam_abnormal: string[]
  pelvic_exam: 'not_done' | 'normal' | 'abnormal' | ''
  pelvic_exam_test: string[]
  speculum_exam: 'not_done' | 'normal' | 'abnormal' | ''
  speculum_exam_abnormal: string[]
  
  // Oedema Assessment
  oedema_present: 'yes' | 'no' | ''
  oedema_type: string[]
  unilateral_or_bilateral: 'bilateral' | 'unilateral' | ''
  other_oedema_symptoms: string[]
  oedema_severity: '' | '+' | '++' | '+++' | '++++'
  
  // Other Assessments
  varicose_veins: 'yes' | 'no' | ''
  varicose_type: string[]
  
  // IPV Screening
  ipv_status: 'presenting' | 'not_presenting' | ''
  presenting_signs_conditions: string[]
  other_signs: string
}

interface MaternalAssessmentModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: MaternalAssessmentData) => void
  initialData?: Partial<MaternalAssessmentData>
}

export const MaternalAssessmentModal: React.FC<MaternalAssessmentModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState<MaternalAssessmentData>({
    // Physical Examination
    pallor_present: '',
    respiratory_exam: '',
    respiratory_exam_abnormal: [],
    cardiac_exam: '',
    cardiac_exam_abnormal: [],
    
    // Breast/Pelvic Examinations
    breast_exam: '',
    breast_exam_abnormal: [],
    pelvic_exam: '',
    pelvic_exam_test: [],
    speculum_exam: '',
    speculum_exam_abnormal: [],
    
    // Oedema Assessment
    oedema_present: '',
    oedema_type: [],
    unilateral_or_bilateral: '',
    other_oedema_symptoms: [],
    oedema_severity: '',
    
    // Other Assessments
    varicose_veins: '',
    varicose_type: [],
    
    // IPV Screening
    ipv_status: '',
    presenting_signs_conditions: [],
    other_signs: '',
    ...initialData
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showClinicalAlerts, setShowClinicalAlerts] = useState(false)

  // Update form data helper
  const updateFormData = (key: keyof MaternalAssessmentData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Handle checkbox arrays
  const handleCheckboxArray = (key: keyof MaternalAssessmentData, value: string, checked: boolean) => {
    const currentArray = formData[key] as string[]
    if (checked) {
      updateFormData(key, [...currentArray, value])
    } else {
      updateFormData(key, currentArray.filter(item => item !== value))
    }
  }

  // Validation function
  const validateForm = (): boolean => {
    const errors: string[] = []
    
    if (!formData.pallor_present) {
      errors.push("Pallor assessment is required")
    }

    if (!formData.respiratory_exam) {
      errors.push("Respiratory examination is required")
    }

    if (formData.respiratory_exam === 'abnormal' && formData.respiratory_exam_abnormal.length === 0) {
      errors.push("Please specify abnormal respiratory findings")
    }

    if (formData.oximetry && (parseInt(formData.oximetry) < 70 || parseInt(formData.oximetry) > 100)) {
      errors.push("Oximetry reading should be between 70-100%")
    }

    if (!formData.cardiac_exam) {
      errors.push("Cardiac examination is required")
    }

    if (formData.cardiac_exam === 'abnormal' && formData.cardiac_exam_abnormal.length === 0) {
      errors.push("Please specify abnormal cardiac findings")
    }

    if (!formData.breast_exam) {
      errors.push("Breast examination is required")
    }

    if (!formData.oedema_present) {
      errors.push("Oedema assessment is required")
    }

    if (formData.oedema_present === 'yes' && formData.oedema_type.length === 0) {
      errors.push("Please specify type of oedema")
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  // Check for clinical alerts
  useEffect(() => {
    const alerts = []
    
    if (formData.pallor_present === "yes") {
      alerts.push("Pallor detected - consider anemia screening")
    }
    
    if (formData.respiratory_exam === "abnormal") {
      alerts.push("Abnormal respiratory findings - further assessment required")
    }
    
    if (formData.oximetry && parseInt(formData.oximetry) < 92) {
      alerts.push("Low oxygen saturation - urgent intervention needed")
    }
    
    if (formData.cardiac_exam === "abnormal") {
      alerts.push("Abnormal cardiac findings - cardiology consultation recommended")
    }
    
    if (formData.oedema_present === "yes" && formData.oedema_type.includes("Pitting ankle oedema")) {
      alerts.push("Pitting oedema detected - monitor for pre-eclampsia")
    }
    
    if (formData.presenting_signs_conditions.length > 0 && !formData.presenting_signs_conditions.includes("Not presenting signs or conditions for IPV")) {
      alerts.push("IPV indicators present - provide appropriate support and resources")
    }

    setShowClinicalAlerts(alerts.length > 0)
  }, [formData])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" />
            <span>Maternal Physical Examination </span>
          </CardTitle>
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
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-medium mb-2">Please correct the following:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Clinical Alerts */}
          {showClinicalAlerts && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="font-medium">Clinical Attention Required</div>
                <div className="text-sm mt-1">Abnormal findings detected - review and consider further assessment</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Form Content */}
          <div className="space-y-6">
            
            {/* Physical Examination Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b pb-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Physical Examination</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pallor Present */}
                <div>
                  <Label className="text-sm font-medium">Pallor present? *</Label>
                  <Select 
                    value={formData.pallor_present} 
                    onValueChange={(value) => updateFormData('pallor_present', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Respiratory Exam */}
                <div>
                  <Label className="text-sm font-medium">Respiratory exam *</Label>
                  <Select 
                    value={formData.respiratory_exam} 
                    onValueChange={(value) => updateFormData('respiratory_exam', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_done">Not done</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Abnormal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cardiac Exam */}
                <div>
                  <Label className="text-sm font-medium">Cardiac exam *</Label>
                  <Select 
                    value={formData.cardiac_exam} 
                    onValueChange={(value) => updateFormData('cardiac_exam', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_done">Not done</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Abnormal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Respiratory Abnormal (conditional) */}
              {formData.respiratory_exam === 'abnormal' && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4">
                  <Label className="text-sm font-medium text-amber-800">Respiratory exam: abnormal</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Dyspnoea', 'Cough', 'Rapid breathing', 'Slow breathing', 'Wheezing', 'Rales', 'Other (specify)'].map((finding) => (
                      <div key={finding} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`respiratory_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                          checked={formData.respiratory_exam_abnormal.includes(finding)}
                          onCheckedChange={(checked) => handleCheckboxArray('respiratory_exam_abnormal', finding, checked as boolean)}
                        />
                        <Label htmlFor={`respiratory_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                          {finding}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cardiac Abnormal (conditional) */}
              {formData.cardiac_exam === 'abnormal' && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4">
                  <Label className="text-sm font-medium text-amber-800">Cardiac exam: abnormal</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Heart murmur', 'Weak pulse', 'Tachycardia', 'Arrhythmia', 'Cyanosis', 'Cold sweats', 'Other (specify)'].map((finding) => (
                      <div key={finding} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cardiac_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                          checked={formData.cardiac_exam_abnormal.includes(finding)}
                          onCheckedChange={(checked) => handleCheckboxArray('cardiac_exam_abnormal', finding, checked as boolean)}
                        />
                        <Label htmlFor={`cardiac_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                          {finding}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Breast and Pelvic Examinations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Specialized Examinations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Breast Exam */}
                <div>
                  <Label className="text-sm font-medium">Breast exam *</Label>
                  <Select 
                    value={formData.breast_exam} 
                    onValueChange={(value) => updateFormData('breast_exam', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_done">Not done</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Abnormal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pelvic Exam */}
                <div>
                  <Label className="text-sm font-medium">Pelvic exam (visual)</Label>
                  <Select 
                    value={formData.pelvic_exam} 
                    onValueChange={(value) => updateFormData('pelvic_exam', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_done">Not done</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Abnormal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Speculum Exam */}
                <div>
                  <Label className="text-sm font-medium">Speculum exam</Label>
                  <Select 
                    value={formData.speculum_exam} 
                    onValueChange={(value) => updateFormData('speculum_exam', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_done">Not done</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Abnormal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Breast Abnormal (conditional) */}
              {formData.breast_exam === 'abnormal' && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4">
                  <Label className="text-sm font-medium text-amber-800">Breast exam: abnormal</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Nodule', 'Discharge', 'Flushing', 'Local pain', 'Bleeding', 'Increased temperature', 'Other (specify)'].map((finding) => (
                      <div key={finding} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`breast_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                          checked={formData.breast_exam_abnormal.includes(finding)}
                          onCheckedChange={(checked) => handleCheckboxArray('breast_exam_abnormal', finding, checked as boolean)}
                        />
                        <Label htmlFor={`breast_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                          {finding}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pelvic Exam Test (conditional) */}
              {formData.pelvic_exam === 'abnormal' && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4">
                  <Label className="text-sm font-medium text-amber-800">Pelvic exam test: abnormal findings</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {[
                      'Abnormal vaginal discharge',
                      'Evidence of amniotic fluid',
                      'Foul-smelling vaginal discharge',
                      'Clusters of erythematous papules',
                      'Vescles',
                      'Genital Ulcer',
                      'Genital pain',
                      'Lymphadenopathy (pelvic)(unilateral)(bilateral)',
                      'Cervical friability',
                      'Mucopurulent cervicitis',
                      'Curd-like vaginal discharge',
                      'Other (specify)'
                    ].map((finding) => (
                      <div key={finding} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`pelvic_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                          checked={formData.pelvic_exam_test.includes(finding)}
                          onCheckedChange={(checked) => handleCheckboxArray('pelvic_exam_test', finding, checked as boolean)}
                        />
                        <Label htmlFor={`pelvic_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                          {finding}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speculum Abnormal (conditional) */}
              {formData.speculum_exam === 'abnormal' && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4">
                  <Label className="text-sm font-medium text-amber-800">Speculum exam: abnormal</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      'Cervix inflammed (appears red)',
                      'Cervix has curd-like discharge',
                      'Cervix draining liquor from internal os',
                      'Cervical lesion',
                      'Foul cervical discharge',
                      'Cervix dilated',
                      'Other specify'
                    ].map((finding) => (
                      <div key={finding} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`speculum_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                          checked={formData.speculum_exam_abnormal.includes(finding)}
                          onCheckedChange={(checked) => handleCheckboxArray('speculum_exam_abnormal', finding, checked as boolean)}
                        />
                        <Label htmlFor={`speculum_${finding.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                          {finding}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Oedema Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Circulatory Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Oedema Present */}
                <div>
                  <Label className="text-sm font-medium">Oedema present? *</Label>
                  <Select 
                    value={formData.oedema_present} 
                    onValueChange={(value) => updateFormData('oedema_present', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Varicose Veins */}
                <div>
                  <Label className="text-sm font-medium">Varicose veins?</Label>
                  <Select 
                    value={formData.varicose_veins} 
                    onValueChange={(value) => updateFormData('varicose_veins', value)}
                  >
                    <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Oedema Details (conditional) */}
              {formData.oedema_present === 'yes' && (
                <div className="space-y-4 bg-blue-50 border border-blue-200 rounded p-4">
                  <Label className="text-sm font-medium text-blue-800">Oedema Assessment Details</Label>
                  
                  {/* Oedema Type */}
                  <div>
                    <Label className="text-sm font-medium">Oedema type *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Pitting ankle oedema', 'Oedema of the hands and feet', 'Pitting lower oedema', 'Leg swelling', 'Varicose veins'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`oedema_type_${type.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                            checked={formData.oedema_type.includes(type)}
                            onCheckedChange={(checked) => handleCheckboxArray('oedema_type', type, checked as boolean)}
                          />
                          <Label htmlFor={`oedema_type_${type.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unilateral or Bilateral */}
                    <div>
                      <Label className="text-sm font-medium">Unilateral or bilateral?</Label>
                      <Select 
                        value={formData.unilateral_or_bilateral} 
                        onValueChange={(value) => updateFormData('unilateral_or_bilateral', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bilateral">Bilateral</SelectItem>
                          <SelectItem value="unilateral">Unilateral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Oedema Severity */}
                    <div>
                      <Label className="text-sm font-medium">Oedema severity</Label>
                      <Select 
                        value={formData.oedema_severity} 
                        onValueChange={(value) => updateFormData('oedema_severity', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+">+ (Mild)</SelectItem>
                          <SelectItem value="++">++ (Moderate)</SelectItem>
                          <SelectItem value="+++">+++ (Severe)</SelectItem>
                          <SelectItem value="++++">++++ (Very Severe)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Other Oedema Symptoms */}
                  <div>
                    <Label className="text-sm font-medium">Any other oedema symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['None', 'Leg pain', 'Pain on the affected area', 'Warmth on the affected area', 'Redness'].map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`oedema_symptom_${symptom.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                            checked={formData.other_oedema_symptoms.includes(symptom)}
                            onCheckedChange={(checked) => handleCheckboxArray('other_oedema_symptoms', symptom, checked as boolean)}
                          />
                          <Label htmlFor={`oedema_symptom_${symptom.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                            {symptom}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Varicose Veins Details (conditional) */}
              {formData.varicose_veins === 'yes' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <Label className="text-sm font-medium text-blue-800">Varicose type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Leg pain', 'Leg redness', 'Other specify'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`varicose_${type.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                          checked={formData.varicose_type.includes(type)}
                          onCheckedChange={(checked) => handleCheckboxArray('varicose_type', type, checked as boolean)}
                        />
                        <Label htmlFor={`varicose_${type.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* IPV Screening Signs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Intimate Partner Violence (IPV) Screening</h3>
              
              <div>
                <Label className="text-sm font-medium">Presenting signs/conditions</Label>
                <Select
                  value={formData.ipv_status || ''}
                  onValueChange={(value) => {
                    updateFormData('ipv_status', value);
                    // Clear detailed signs when switching to "Not Presenting"
                    if (value === 'not_presenting') {
                      updateFormData('presenting_signs_conditions', []);
                      updateFormData('other_signs', '');
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_presenting">Not Presenting</SelectItem>
                    <SelectItem value="presenting">Presenting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Detailed Signs (only show when "Presenting" is selected) */}
              {formData.ipv_status === 'presenting' && (
                <div className="bg-orange-50 border border-orange-200 rounded p-4">
                  <Label className="text-sm font-medium text-orange-800">IPV Signs/Conditions Present</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {[
                      'Traumatic injury or implausible explanations',
                      'Intrusive partner or husband present at consultations',
                      'Signs of depression and anxiety',
                      'Self-harm or suicidal',
                      'Unexplained or repeated genital ulcers or injuries',
                      'Other (specify)'
                    ].map((sign) => (
                      <div key={sign} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`ipv_${sign.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                          checked={formData.presenting_signs_conditions.includes(sign)}
                          onCheckedChange={(checked) => handleCheckboxArray('presenting_signs_conditions', sign, checked as boolean)}
                        />
                        <Label htmlFor={`ipv_${sign.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} className="text-sm">
                          {sign}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Other Signs (conditional) */}
                  {formData.presenting_signs_conditions.includes('Other (specify)') && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-orange-800">Other signs or symptoms indicative of violence - specify</Label>
                      <Textarea
                        placeholder="Describe other signs or symptoms..."
                        value={formData.other_signs}
                        onChange={(e) => updateFormData('other_signs', e.target.value)}
                        className="mt-1 border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={onClose}
            >
              Close
            </Button>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MaternalAssessmentModal