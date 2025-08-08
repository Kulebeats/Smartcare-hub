"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { X, Baby, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FetalAssessmentData {
  // Fetal Measurements
  symphysial_fundal_height: string
  estimated_ga_from_sfh: string
  fetal_heart_rate: string
  second_fetal_heart_rate: string
  
  // Fetal Position & Presentation
  fetal_lie: 'longitudinal' | 'transverse' | 'oblique' | 'undetermined' | ''
  fetal_presentation: 'breech' | 'cephalic' | 'undetermined' | ''
  descent: string
  
  // Fetal Status
  fetal_movement_felt: 'yes' | 'no' | ''
  no_of_foetus: '1' | '2' | 'multiple' | ''
  no_of_foetus_unknown: boolean
  fetal_heartbeat: 'present' | 'absent' | ''
}

interface FetalAssessmentModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: FetalAssessmentData) => void
  initialData?: Partial<FetalAssessmentData>
}

export const FetalAssessmentModal: React.FC<FetalAssessmentModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState<FetalAssessmentData>({
    // Fetal Measurements
    symphysial_fundal_height: '',
    estimated_ga_from_sfh: '',
    fetal_heart_rate: '',
    second_fetal_heart_rate: '',
    
    // Fetal Position & Presentation
    fetal_lie: '',
    fetal_presentation: '',
    descent: '',
    
    // Fetal Status
    fetal_movement_felt: '',
    no_of_foetus: '',
    no_of_foetus_unknown: false,
    fetal_heartbeat: '',
    ...initialData
  })

  const [showFhrAlert, setShowFhrAlert] = useState(false)
  const [showHospitalReferral, setShowHospitalReferral] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Update form data helper
  const updateFormData = (key: keyof FetalAssessmentData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Handle SFH calculation
  const handleSfhChange = (value: string) => {
    updateFormData('symphysial_fundal_height', value)
    const sfhValue = parseInt(value)
    if (sfhValue > 0) {
      const estimatedGA = Math.max(0, sfhValue - 3)
      updateFormData('estimated_ga_from_sfh', `${estimatedGA} weeks 0 days`)
    } else {
      updateFormData('estimated_ga_from_sfh', '')
    }
  }

  // Handle FHR validation
  const handleFhrChange = (value: string, isSecond = false) => {
    const field = isSecond ? 'second_fetal_heart_rate' : 'fetal_heart_rate'
    updateFormData(field, value)
    
    const fhr = parseInt(value)
    if (fhr && (fhr < 120 || fhr > 160)) {
      setShowFhrAlert(true)
      
      // Check if both readings are abnormal for hospital referral
      if (isSecond) {
        const firstFhr = parseInt(formData.fetal_heart_rate)
        if (firstFhr && (firstFhr < 120 || firstFhr > 160) && (fhr < 120 || fhr > 160)) {
          setShowHospitalReferral(true)
        }
      }
    } else {
      if (!isSecond) {
        setShowFhrAlert(false)
        setShowHospitalReferral(false)
        updateFormData('second_fetal_heart_rate', '')
      }
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: string[] = []
    
    if (!formData.symphysial_fundal_height) {
      errors.push('Symphysial-Fundal Height is required')
    }
    
    if (!formData.fetal_heart_rate) {
      errors.push('Fetal Heart Rate is required')
    }
    
    if (!formData.fetal_lie) {
      errors.push('Fetal Lie is required')
    }
    
    if (!formData.fetal_presentation) {
      errors.push('Fetal Presentation is required')
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

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center">
            <Baby className="w-6 h-6 mr-2 text-blue-600" />
            Fetal Assessment
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Fetal Measurements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Fetal Measurements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Symphysial-Fundal Height (cm) *</Label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={formData.symphysial_fundal_height}
                    onChange={(e) => handleSfhChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                {/* Estimated GA Display */}
                {formData.estimated_ga_from_sfh && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="text-sm font-medium text-green-600">Estimated GA from SFH</div>
                    <div className="text-lg font-bold text-green-700">{formData.estimated_ga_from_sfh}</div>
                    <div className="text-xs text-gray-500">
                      Based on SFH measurement of {formData.symphysial_fundal_height} cm
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Fetal Heart Rate (bpm) *</Label>
                <Input
                  type="number"
                  placeholder="140"
                  value={formData.fetal_heart_rate}
                  onChange={(e) => handleFhrChange(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* FHR Alert */}
              {showFhrAlert && (
                <Alert className="border-orange-300 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium text-orange-800">Abnormal Fetal Heart Rate</div>
                      <p className="text-sm text-orange-700">
                        Fetal heart rate out of normal range (120-160). Please have the woman lay on her left side for 15 minutes and check again.
                      </p>
                      <div>
                        <Label className="text-sm font-medium text-orange-800">Second fetal heart rate (bpm) *</Label>
                        <Input
                          type="number"
                          placeholder="140"
                          value={formData.second_fetal_heart_rate}
                          onChange={(e) => handleFhrChange(e.target.value, true)}
                          className="mt-1 w-full"
                        />
                        <p className="text-xs text-orange-600 mt-1">Required after abnormal first reading</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Hospital Referral Alert */}
              {showHospitalReferral && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">REFER TO HOSPITAL</div>
                    <p className="text-sm mt-1">
                      Fetal heart rate is abnormal after two readings. The woman should be referred to hospital.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Fetal Position & Presentation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Fetal Position & Presentation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Fetal Lie *</Label>
                  <Select
                    value={formData.fetal_lie}
                    onValueChange={(value) => updateFormData('fetal_lie', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select fetal lie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="longitudinal">Longitudinal</SelectItem>
                      <SelectItem value="transverse">Transverse</SelectItem>
                      <SelectItem value="oblique">Oblique</SelectItem>
                      <SelectItem value="undetermined">Undetermined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Fetal Presentation *</Label>
                  <Select
                    value={formData.fetal_presentation}
                    onValueChange={(value) => updateFormData('fetal_presentation', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select presentation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breech">Breech</SelectItem>
                      <SelectItem value="cephalic">Cephalic</SelectItem>
                      <SelectItem value="undetermined">Undetermined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Descent</Label>
                <Select
                  value={formData.descent}
                  onValueChange={(value) => updateFormData('descent', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select descent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5/5">5/5</SelectItem>
                    <SelectItem value="4/5">4/5</SelectItem>
                    <SelectItem value="3/5">3/5</SelectItem>
                    <SelectItem value="2/5">2/5</SelectItem>
                    <SelectItem value="1/5">1/5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Fetal Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Fetal Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Fetal Movement felt?</Label>
                  <Select
                    value={formData.fetal_movement_felt}
                    onValueChange={(value) => updateFormData('fetal_movement_felt', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Fetal heartbeat present?</Label>
                  <Select
                    value={formData.fetal_heartbeat}
                    onValueChange={(value) => updateFormData('fetal_heartbeat', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">No. of Foetus</Label>
                  <Select
                    value={formData.no_of_foetus}
                    onValueChange={(value) => updateFormData('no_of_foetus', value)}
                    disabled={formData.no_of_foetus_unknown}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="multiple">Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center mt-6">
                  <Checkbox
                    id="no_of_foetus_unknown"
                    checked={formData.no_of_foetus_unknown}
                    onCheckedChange={(checked) => {
                      updateFormData('no_of_foetus_unknown', checked)
                      if (checked) {
                        updateFormData('no_of_foetus', '')
                      }
                    }}
                  />
                  <Label htmlFor="no_of_foetus_unknown" className="ml-2 text-sm font-medium">
                    No of foetus unknown
                  </Label>
                </div>
              </div>
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
  )
}

export default FetalAssessmentModal