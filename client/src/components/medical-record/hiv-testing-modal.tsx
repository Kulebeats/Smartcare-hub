import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { HIVTestingData } from "@/shared/schema"

interface HIVTestingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: HIVTestingData) => void
  initialData?: HIVTestingData
  isANCContext?: boolean
}

export function HIVTestingModal({ isOpen, onClose, onSave, initialData, isANCContext = false }: HIVTestingModalProps) {
  const [lastTestedDate, setLastTestedDate] = useState<Date | undefined>(
    initialData?.lastTestedDate ? new Date(initialData.lastTestedDate) : undefined
  )
  const [partnerLastTestedDate, setPartnerLastTestedDate] = useState<Date | undefined>(
    initialData?.partnerLastTestedDate ? new Date(initialData.partnerLastTestedDate) : undefined
  )
  const [testDate, setTestDate] = useState<Date | undefined>(
    initialData?.testDate ? new Date(initialData.testDate) : undefined
  )
  const [dnaPcrDate, setDnaPcrDate] = useState<Date | undefined>(
    initialData?.dnaPcrSampleCollectionDate ? new Date(initialData.dnaPcrSampleCollectionDate) : undefined
  )
  // ANC-specific prefill logic
  const getANCPrefillData = () => {
    if (isANCContext && !initialData) {
      return {
        clientType: "Single adult",
        visitType: "PITC" as const,
        servicePoint: "PMTCT",
        sourceOfClient: "Facility",
        reasonForTesting: "ANC /Pregnant",
      }
    }
    return {}
  }

  const ancPrefillData = getANCPrefillData()

  const [formData, setFormData] = useState<Partial<HIVTestingData>>({
    clientType: initialData?.clientType || ancPrefillData.clientType || "",
    visitType: initialData?.visitType || ancPrefillData.visitType || undefined,
    servicePoint: initialData?.servicePoint || ancPrefillData.servicePoint || "",
    sourceOfClient: initialData?.sourceOfClient || ancPrefillData.sourceOfClient || "",
    reasonForTesting: initialData?.reasonForTesting || ancPrefillData.reasonForTesting || "",
    lastTestResult: initialData?.lastTestResult || undefined,
    partnerHivStatus: initialData?.partnerHivStatus || undefined,
    patientCounselled: initialData?.patientCounselled || undefined,
    consentObtained: initialData?.consentObtained || undefined,
    reasonForNotTesting: initialData?.reasonForNotTesting || undefined,
    otherReasons: initialData?.otherReasons || "",
    // Multi-stage testing fields
    determine: initialData?.determine || undefined,
    bioline: initialData?.bioline || undefined,
    hivType: initialData?.hivType || undefined,
    testNo: initialData?.testNo || "",
    dnaPcrSampleCollected: initialData?.dnaPcrSampleCollected || undefined,
    clientReceivedResults: initialData?.clientReceivedResults || undefined,
    consentToReceiveSMSAlerts: initialData?.consentToReceiveSMSAlerts || undefined,
    postTestAssessment: initialData?.postTestAssessment || [],
    // Legacy field for backward compatibility
    testResult: initialData?.testResult || undefined,
    resultGiven: initialData?.resultGiven || undefined,
    postTestCounsellingDone: initialData?.postTestCounsellingDone || undefined,
    referralMade: initialData?.referralMade || undefined,
    referralLocation: initialData?.referralLocation || "",
  })

  const clientTypeOptions = [
    "OPD",
    "Retest", 
    "PMTCT Child",
    "Non PMTCT Child",
    "Come as a Couple",
    "Single adult",
    "Second party or perpetrator",
    "New"
  ]

  const servicePointOptions = [
    "Malnutrition",
    "Pediatrics", 
    "IPD",
    "Emergency",
    "TB",
    "STI",
    "Under five",
    "HTS Fixed",
    "VMMC",
    "HIV Care and Treatment",
    "Labour and Delivery",
    "OTHER",
    "PMTCT",
    "OPD",
    "HTS Community"
  ]

  const sourceOfClientOptions = ["Community", "Facility"]
  const visitTypeOptions = ["PITC", "PreP", "CICT/VCT", "Index"]

  const reasonForTestingOptions = [
    "Planning to have a baby",
    "Planning to get married", 
    "Partner Tested and advised",
    "ANC /Pregnant",
    "Partner HIV Positive",
    "Other reason",
    "Worried about partners behavior",
    "Just to make sure",
    "Sick"
  ]

  const testResultOptions = [
    "Positive",
    "Negative", 
    "Indeterminant"
  ]

  const handleConsentChange = (value: "Yes" | "No") => {
    // Clear reason for not testing when consent is Yes
    if (value === 'Yes') {
      setFormData({
        ...formData,
        consentObtained: value,
        reasonForNotTesting: undefined
      })
    } else if (formData.consentObtained === 'Yes' && value === 'No') {
      setFormData({
        ...formData,
        consentObtained: value,
        // Clear multi-stage testing fields
        determine: undefined,
        bioline: undefined,
        hivType: undefined,
        testNo: "",
        dnaPcrSampleCollected: undefined,
        clientReceivedResults: undefined,
        consentToReceiveSMSAlerts: undefined,
        postTestAssessment: [],
        // Clear legacy fields
        testResult: undefined,
        resultGiven: undefined,
        postTestCounsellingDone: undefined,
        referralMade: undefined,
        referralLocation: ""
      })
      setTestDate(undefined)
      setDnaPcrDate(undefined)
    } else {
      setFormData({ ...formData, consentObtained: value })
    }
  }

  const handleDetermineChange = (value: "Reactive" | "Non-reactive") => {
    setFormData(prev => ({
      ...prev,
      determine: value,
      // Clear dependent fields when changing determine
      bioline: undefined,
      hivType: undefined,
      // Clear non-reactive specific fields when switching to reactive
      ...(value === "Reactive" && {
        testNo: "",
        dnaPcrSampleCollected: undefined,
        clientReceivedResults: undefined,
        consentToReceiveSMSAlerts: undefined,
        postTestAssessment: []
      })
    }))
    
    // Clear DNA PCR date if switching to reactive
    if (value === "Reactive") {
      setDnaPcrDate(undefined)
    }
  }

  const handleBiolineChange = (value: "Reactive" | "Non-reactive") => {
    setFormData(prev => ({
      ...prev,
      bioline: value,
      // Clear HIV Type when changing bioline
      hivType: undefined
    }))
  }

  const handlePostTestAssessmentChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      postTestAssessment: checked
        ? [...(prev.postTestAssessment || []), option]
        : (prev.postTestAssessment || []).filter(item => item !== option)
    }))
  }

  const handleSave = () => {
    const finalData: HIVTestingData = {
      ...formData,
      lastTestedDate,
      partnerLastTestedDate,
      testDate: formData.consentObtained === 'Yes' ? testDate : undefined,
      dnaPcrSampleCollectionDate: formData.consentObtained === 'Yes' && formData.determine === 'Non-reactive' ? dnaPcrDate : undefined,
      testStatus: formData.consentObtained === 'Yes' ? 
        (formData.determine || formData.testResult ? 'completed' : 'in_progress') : 'completed'
    } as HIVTestingData

    onSave(finalData)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-gray-800">HIV Test Services</DialogTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Pretest Assessment</h2>

            <div className="grid grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="space-y-2">
                <Label htmlFor="clientType" className="text-sm font-medium">
                  Client Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.clientType}
                  onValueChange={(value) => setFormData({ ...formData, clientType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="---Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitType" className="text-sm font-medium">
                  Visit Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.visitType}
                  onValueChange={(value) => setFormData({ ...formData, visitType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="---Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicePoint" className="text-sm font-medium">
                  Service Point <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.servicePoint}
                  onValueChange={(value) => setFormData({ ...formData, servicePoint: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="---Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePointOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2 */}
              <div className="space-y-2">
                <Label htmlFor="sourceOfClient" className="text-sm font-medium">
                  Source of Client <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.sourceOfClient}
                  onValueChange={(value) => setFormData({ ...formData, sourceOfClient: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="---Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOfClientOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForTesting" className="text-sm font-medium">
                  Reason for Testing <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.reasonForTesting}
                  onValueChange={(value) => setFormData({ ...formData, reasonForTesting: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="---Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonForTestingOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastTestedDate" className="text-sm font-medium">
                  Last Tested Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {lastTestedDate ? format(lastTestedDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={lastTestedDate} 
                      onSelect={(date) => {
                        setLastTestedDate(date);
                        if (!date) {
                          setFormData(prev => ({ ...prev, lastTestResult: undefined }));
                        }
                      }} 
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Row 3 */}
              {/* Only show Last Test Result when Last Tested Date is selected */}
              {lastTestedDate && (
                <div className="space-y-2">
                  <Label htmlFor="lastTestResult" className="text-sm font-medium">
                    Last Test Result
                  </Label>
                  <Select
                    value={formData.lastTestResult}
                    onValueChange={(value) => setFormData({ ...formData, lastTestResult: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="---Select---" />
                    </SelectTrigger>
                    <SelectContent>
                      {testResultOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="partnerLastTestedDate" className="text-sm font-medium">
                  {"Partner's Last Tested Date"}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {partnerLastTestedDate ? format(partnerLastTestedDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={partnerLastTestedDate}
                      onSelect={(date) => {
                        setPartnerLastTestedDate(date);
                        if (!date) {
                          setFormData(prev => ({ ...prev, partnerHivStatus: undefined }));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Only show Partner's HIV Status when Partner's Last Tested Date is selected */}
              {partnerLastTestedDate && (
                <div className="space-y-2">
                  <Label htmlFor="partnerHivStatus" className="text-sm font-medium">
                    {"Partner's HIV Status"}
                  </Label>
                  <Select
                    value={formData.partnerHivStatus}
                    onValueChange={(value) => setFormData({ ...formData, partnerHivStatus: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="---Select---" />
                    </SelectTrigger>
                    <SelectContent>
                      {testResultOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Row 4 */}
              <div className="space-y-2">
                <Label htmlFor="patientCounselled" className="text-sm font-medium">
                  Patient Counselled <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.patientCounselled}
                  onValueChange={(value) => setFormData({ ...formData, patientCounselled: value as "Yes" | "No" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consentObtained" className="text-sm font-medium">
                  Consent Obtained <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.consentObtained}
                  onValueChange={handleConsentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Only show Reason for Not Testing when consent is No */}
              {formData.consentObtained === 'No' && (
                <div className="space-y-2">
                  <Label htmlFor="reasonForNotTesting" className="text-sm font-medium">
                    Reason for Not Testing
                  </Label>
                  <Select
                    value={formData.reasonForNotTesting}
                    onValueChange={(value) => setFormData({ ...formData, reasonForNotTesting: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="---Select---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client_refused">Client Refused</SelectItem>
                      <SelectItem value="no_consent">No Consent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Other Reasons Textarea - Only show when reason for not testing is "other" */}
              {formData.reasonForNotTesting === 'other' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="otherReasons" className="text-sm font-medium">
                    Other Reasons / Additional Notes
                  </Label>
                  <Textarea
                    id="otherReasons"
                    placeholder="Enter other reasons or additional notes..."
                    value={formData.otherReasons}
                    onChange={(e) => setFormData({ ...formData, otherReasons: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </div>

            {/* Test Results Section - Only show when consent is obtained */}
            {formData.consentObtained === 'Yes' && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Test & Results</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="testNo" className="text-sm font-medium">
                      Test No <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="text"
                      id="testNo"
                      value={formData.testNo || ""}
                      onChange={(e) => setFormData({ ...formData, testNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter test number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="determine" className="text-sm font-medium">
                      Determine <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.determine}
                      onValueChange={handleDetermineChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="---Select---" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reactive">Reactive</SelectItem>
                        <SelectItem value="Non-reactive">Non-reactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bioline - Show only when Determine is Reactive */}
                  {formData.determine === 'Reactive' && (
                    <div className="space-y-2">
                      <Label htmlFor="bioline" className="text-sm font-medium">
                        Bioline <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.bioline}
                        onValueChange={handleBiolineChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="---Select---" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Reactive">Reactive</SelectItem>
                          <SelectItem value="Non-reactive">Non-reactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* HIV Type - Show only when both Determine and Bioline are Reactive */}
                  {formData.determine === 'Reactive' && formData.bioline === 'Reactive' && (
                    <div className="space-y-2">
                      <Label htmlFor="hivType" className="text-sm font-medium">
                        HIV Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.hivType}
                        onValueChange={(value) => setFormData({ ...formData, hivType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="---Select---" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIV-1">HIV-1</SelectItem>
                          <SelectItem value="HIV-2">HIV-2</SelectItem>
                          <SelectItem value="HIV-1&2">HIV-1&2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Additional fields for Non-reactive Determine results */}
                {formData.determine === 'Non-reactive' && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Additional Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dnaPcrSampleCollected" className="text-sm font-medium">
                          DNA PCR Sample Collected
                        </Label>
                        <Select
                          value={formData.dnaPcrSampleCollected}
                          onValueChange={(value) => setFormData({ ...formData, dnaPcrSampleCollected: value as "Yes" | "No" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dnaPcrSampleCollectionDate" className="text-sm font-medium">
                          DNA PCR Sample Collection Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dnaPcrDate ? format(dnaPcrDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={dnaPcrDate} onSelect={setDnaPcrDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clientReceivedResults" className="text-sm font-medium">
                          Client Received Results <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.clientReceivedResults}
                          onValueChange={(value) => setFormData({ ...formData, clientReceivedResults: value as "Yes" | "No" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consentToReceiveSMSAlerts" className="text-sm font-medium">
                          Consent to Receive SMS Alerts <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.consentToReceiveSMSAlerts}
                          onValueChange={(value) => setFormData({ ...formData, consentToReceiveSMSAlerts: value as "Yes" | "No" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Post Test Assessment Checkboxes */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Post Test Assessment</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* None option first */}
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.postTestAssessment?.includes('None') || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // If None is selected, clear all other options and set only None
                                setFormData(prev => ({ ...prev, postTestAssessment: ['None'] }));
                              } else {
                                // If None is unchecked, remove it from the array
                                setFormData(prev => ({
                                  ...prev,
                                  postTestAssessment: prev.postTestAssessment?.filter(item => item !== 'None') || []
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">None</span>
                        </label>

                        {/* Other options - only show if None is not selected */}
                        {!(formData.postTestAssessment?.includes('None')) && [
                          'Indeterminate HIV test',
                          'HIV negative with TB',
                          'Sex worker',
                          'Breastfeeding mother',
                          'Unknown sexual partner status',
                          'HIV negative pregnant mother',
                          'Discordant sexual partner',
                          'IDUs',
                          'HIV negative with STIs'
                        ].map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.postTestAssessment?.includes(option) || false}
                              onChange={(e) => handlePostTestAssessmentChange(option, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resultGiven" className="text-sm font-medium">Client Recieved Results </Label>
                    <Select
                      value={formData.resultGiven}
                      onValueChange={(value) => setFormData({ ...formData, resultGiven: value as "Yes" | "No" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="---Select---" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postTestCounsellingDone" className="text-sm font-medium">
                      Post-test Counselling Done
                    </Label>
                    <Select
                      value={formData.postTestCounsellingDone}
                      onValueChange={(value) => setFormData({ ...formData, postTestCounsellingDone: value as "Yes" | "No" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="---Select---" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralMade" className="text-sm font-medium">Consent to Receive SMS Alerts </Label>
                    <Select
                      value={formData.referralMade}
                      onValueChange={(value) => setFormData({ ...formData, referralMade: value as "Yes" | "No" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="---Select---" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
            >
              Close
            </Button>
            <Button 
              onClick={handleSave} 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}