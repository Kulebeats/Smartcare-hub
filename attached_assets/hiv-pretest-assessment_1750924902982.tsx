"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"

export default function HIVPretestAssessment() {
  const [isOpen, setIsOpen] = useState(false)
  const [lastTestedDate, setLastTestedDate] = useState<Date>()
  const [partnerLastTestedDate, setPartnerLastTestedDate] = useState<Date>()
  const [formData, setFormData] = useState({
    clientType: "",
    visitType: "",
    servicePoint: "",
    sourceOfClient: "",
    reasonForTesting: "",
    lastTestResult: "",
    partnerHivStatus: "",
    patientCounselled: "",
    consentObtained: "",
    reasonForNotTesting: "",
    otherReasons: "",
  })

  const clientTypeOptions = [
    "OPD",
    "Retest",
    "PMTCT Child",
    "Non PMTCT Child",
    "Come as a Couple",
    "Single adult",
    "Second party or perpetrator",
    "Null 1",
    "Null 2",
    "New",
    "Null 4",
    "Null 6",
    "Null 3",
    "Null 5",
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
    "HTS Community",
  ]

  const sourceOfClientOptions = ["Index", "PrEP", "PITC", "VMMC", "CICT/VCT"]

  const reasonForTestingOptions = [
    "Planning to have a baby",
    "Planning to get married",
    "Partner Tested and advised",
    "ANC /Pregnant",
    "Partner HIV Positive",
    "Other reason",
    "Worried about partners behavior",
    "Just to make sure",
    "Sick",
  ]

  const lastTestResultOptions = [
    "Positive",
    "Negative",
    "Indeterminant",
    "Refused test or result",
    "Never tested",
    "I Don't know",
  ]

  const partnerHivStatusOptions = [
    "Positive",
    "Negative",
    "Indeterminant",
    "Refused test or result",
    "Never tested",
    "I Don't know",
  ]

  const handleSave = () => {
    console.log("Form data:", formData)
    console.log("Last tested date:", lastTestedDate)
    console.log("Partner last tested date:", partnerLastTestedDate)
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="p-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Open HIV Test Services</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
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
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Facility">Facility</SelectItem>
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
                      <Calendar mode="single" selected={lastTestedDate} onSelect={setLastTestedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Row 3 */}
                <div className="space-y-2">
                  <Label htmlFor="lastTestResult" className="text-sm font-medium">
                    Last Test Result
                  </Label>
                  <Select
                    value={formData.lastTestResult}
                    onValueChange={(value) => setFormData({ ...formData, lastTestResult: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="---Select---" />
                    </SelectTrigger>
                    <SelectContent>
                      {lastTestResultOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                        onSelect={setPartnerLastTestedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerHivStatus" className="text-sm font-medium">
                    {"Partner's HIV Status"}
                  </Label>
                  <Select
                    value={formData.partnerHivStatus}
                    onValueChange={(value) => setFormData({ ...formData, partnerHivStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="---Select---" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnerHivStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 4 */}
                <div className="space-y-2">
                  <Label htmlFor="patientCounselled" className="text-sm font-medium">
                    Patient Counselled <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.patientCounselled}
                    onValueChange={(value) => setFormData({ ...formData, patientCounselled: value })}
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
                    onValueChange={(value) => setFormData({ ...formData, consentObtained: value })}
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
                  <Label htmlFor="reasonForNotTesting" className="text-sm font-medium">
                    Reason for Not Testing <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.reasonForNotTesting}
                    onValueChange={(value) => setFormData({ ...formData, reasonForNotTesting: value })}
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
              </div>

              {/* Other Reasons Textarea */}
              <div className="mt-4 space-y-2">
                <Label htmlFor="otherReasons" className="text-sm font-medium">
                  Other Reasons
                </Label>
                <Textarea
                  id="otherReasons"
                  placeholder="Enter Other Reasons"
                  value={formData.otherReasons}
                  onChange={(e) => setFormData({ ...formData, otherReasons: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
