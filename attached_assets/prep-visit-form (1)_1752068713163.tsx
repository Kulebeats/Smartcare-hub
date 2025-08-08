"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserIcon, ClipboardIcon, TestTubeIcon, PillIcon, CalendarDaysIcon } from "lucide-react"

export default function Component() {
  const [formData, setFormData] = useState({
    visitReason: "",
    contactWithHIV: false,
    exposureDate: "",
    currentlyOnPrep: false,
    prepDosingType: "",
    currentPrepRegimen: "",
    prepHistory: "",
    prepStartDate: "",
    stoppedPrep: false,
    prepStopDate: "",
    riskFactors: [] as string[],
    acuteSymptoms: [] as string[],
    partnerTreatmentStatus: [] as string[],
    eligibleForPrep: false,
    offeredPrep: false,
    recommendedTests: [] as string[],
    creatinineTestDate: "",
    creatinineResult: "",
    contraindications: [] as string[],
    prescribedAtInitialVisit: false,
    daysPrescribed: "",
    adherenceCounselling: false,
    followUpDate: "",
    followUpType: "",
    preventionServices: [] as string[],
    condomsDistributed: "",
    hivSelfTestKits: false,
    numberOfKits: "",
  })

  const visitReasons = [
    { value: "first-time", label: "First time counselling on PrEP" },
    { value: "follow-up", label: "Follow-up appointment for PrEP" },
    { value: "restarting", label: "Restarting PrEP" },
    { value: "pep-counselling", label: "Counselling on PEP" },
    { value: "side-effects", label: "Unscheduled visit for side effects" },
  ]

  const prepRegimens = [
    { value: "tdf-ftc", label: "TDF-FTC" },
    { value: "tdf", label: "TDF" },
    { value: "tdf-3tc", label: "TDF + 3TC" },
    { value: "dvr", label: "Dapivirine vaginal ring (DVR)" },
    { value: "cab-la", label: "CAB-LA" },
  ]

  const riskFactors = [
    { value: "no-condom", label: "No condom use during sex with more than one partner in the past 6 months" },
    { value: "sti-history", label: "Sexually transmitted infection (STI) in the past 6 months" },
    { value: "partner-risk", label: "A sexual partner in the past 6 months had one or more HIV risk factors" },
    { value: "client-request", label: "PrEP requested by client" },
  ]

  const acuteSymptoms = [
    { value: "fever", label: "Fever" },
    { value: "sore-throat", label: "Sore throat" },
    { value: "aches", label: "Aches" },
    { value: "pains", label: "Pains" },
    { value: "swollen-glands", label: "Swollen glands" },
    { value: "mouth-sores", label: "Mouth sores" },
    { value: "headaches", label: "Headaches" },
    { value: "rash", label: "Rash" },
  ]

  const recommendedTests = [
    { value: "serum-creatinine", label: "Serum creatinine test" },
    { value: "hep-b-surface", label: "Hepatitis B surface antigen" },
    { value: "hep-c-antibody", label: "Hepatitis C antibody" },
    { value: "rapid-plasma", label: "Rapid plasma reagin" },
    { value: "sti-screening", label: "Other screening for STIs" },
    { value: "pregnancy", label: "Pregnancy testing" },
    { value: "vaccination", label: "Review vaccination history" },
  ]

  const preventionServices = [
    { value: "condoms", label: "Male and female condoms and condom-compatible lubricants" },
    { value: "harm-reduction", label: "Harm reduction for people who inject drugs" },
    { value: "behavioral", label: "Behavioural interventions to support risk reduction" },
    { value: "contraception", label: "Contraception and family planning" },
    { value: "cervical-screening", label: "Cervical cancer screening and treatment" },
    { value: "sti-testing", label: "STI testing and treatment" },
  ]

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">HIV PrEP Visit Management</h1>
        <p className="text-muted-foreground">Comprehensive client assessment and care coordination</p>
      </div>

      <Tabs defaultValue="visit-info" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="visit-info" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Visit Info
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClipboardIcon className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <TestTubeIcon className="w-4 h-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTubeIcon className="w-4 h-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="prescribe" className="flex items-center gap-2">
            <PillIcon className="w-4 h-4" />
            Prescribe
          </TabsTrigger>
          <TabsTrigger value="follow-up" className="flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4" />
            Follow-up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visit-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Information</CardTitle>
              <CardDescription>Basic information about the client's visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visit-reason">
                  Reason for PrEP visit <Badge variant="destructive">Required</Badge>
                </Label>
                <Select
                  value={formData.visitReason}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, visitReason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason for visit" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="three-month-visit"
                  checked={formData.visitReason === "three-month"}
                  onCheckedChange={(checked) =>
                    checked && setFormData((prev) => ({ ...prev, visitReason: "three-month" }))
                  }
                />
                <Label htmlFor="three-month-visit">3-month PrEP visit</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client History</CardTitle>
              <CardDescription>Capture and update client's medical and exposure history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact-hiv"
                    checked={formData.contactWithHIV}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, contactWithHIV: !!checked }))}
                  />
                  <Label htmlFor="contact-hiv">Contact with and (suspected) exposure to HIV</Label>
                </div>

                {formData.contactWithHIV && (
                  <div className="space-y-2">
                    <Label htmlFor="exposure-date">Date/time of suspected exposure to HIV</Label>
                    <Input
                      id="exposure-date"
                      type="datetime-local"
                      value={formData.exposureDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, exposureDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="currently-prep"
                    checked={formData.currentlyOnPrep}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, currentlyOnPrep: !!checked }))}
                  />
                  <Label htmlFor="currently-prep">Currently on PrEP</Label>
                </div>

                {formData.currentlyOnPrep && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>PrEP dosing type</Label>
                      <RadioGroup
                        value={formData.prepDosingType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, prepDosingType: value }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="daily" id="daily" />
                          <Label htmlFor="daily">Daily oral PrEP</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="event-driven" id="event-driven" />
                          <Label htmlFor="event-driven">Event-driven PrEP (ED-PrEP)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Current PrEP regimen</Label>
                      <Select
                        value={formData.currentPrepRegimen}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, currentPrepRegimen: value }))}
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
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PrEP history</Label>
                  <RadioGroup
                    value={formData.prepHistory}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, prepHistory: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="first-time" id="first-time-user" />
                      <Label htmlFor="first-time-user">First-time user</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="repeat" id="repeat-user" />
                      <Label htmlFor="repeat-user">Repeat user</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prep-start-date">PrEP start date</Label>
                  <Input
                    id="prep-start-date"
                    type="date"
                    value={formData.prepStartDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, prepStartDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Evaluate signs of substantial risk of HIV infection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Signs of substantial risk of HIV infection <Badge variant="destructive">Required</Badge>
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {riskFactors.map((factor) => (
                    <div key={factor.value} className="flex items-start space-x-2">
                      <Checkbox
                        id={factor.value}
                        checked={formData.riskFactors.includes(factor.value)}
                        onCheckedChange={(checked) => handleArrayChange("riskFactors", factor.value, !!checked)}
                      />
                      <Label htmlFor={factor.value} className="text-sm leading-5">
                        {factor.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Acute HIV infection symptoms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {acuteSymptoms.map((symptom) => (
                    <div key={symptom.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom.value}
                        checked={formData.acuteSymptoms.includes(symptom.value)}
                        onCheckedChange={(checked) => handleArrayChange("acuteSymptoms", symptom.value, !!checked)}
                      />
                      <Label htmlFor={symptom.value} className="text-sm">
                        {symptom.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eligible-prep"
                    checked={formData.eligibleForPrep}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, eligibleForPrep: !!checked }))}
                  />
                  <Label htmlFor="eligible-prep">Eligible for PrEP</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="offered-prep"
                    checked={formData.offeredPrep}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, offeredPrep: !!checked }))}
                  />
                  <Label htmlFor="offered-prep">Offered PrEP</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Tests</CardTitle>
              <CardDescription>Screenings and diagnostics for PrEP users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Recommended tests</Label>
                <div className="grid grid-cols-1 gap-3">
                  {recommendedTests.map((test) => (
                    <div key={test.value} className="flex items-start space-x-2">
                      <Checkbox
                        id={test.value}
                        checked={formData.recommendedTests.includes(test.value)}
                        onCheckedChange={(checked) => handleArrayChange("recommendedTests", test.value, !!checked)}
                      />
                      <Label htmlFor={test.value} className="text-sm leading-5">
                        {test.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {formData.recommendedTests.includes("serum-creatinine") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="creatinine-date">Serum creatinine test date</Label>
                    <Input
                      id="creatinine-date"
                      type="date"
                      value={formData.creatinineTestDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, creatinineTestDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creatinine-result">Serum creatinine test result</Label>
                    <Input
                      id="creatinine-result"
                      type="number"
                      placeholder="mg/dL"
                      value={formData.creatinineResult}
                      onChange={(e) => setFormData((prev) => ({ ...prev, creatinineResult: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescribe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Information</CardTitle>
              <CardDescription>PrEP prescription details and contraindications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prescribed-initial"
                    checked={formData.prescribedAtInitialVisit}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, prescribedAtInitialVisit: !!checked }))
                    }
                  />
                  <Label htmlFor="prescribed-initial">Prescribed PrEP at initial visit</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="days-prescribed">Number of days prescribed</Label>
                  <Input
                    id="days-prescribed"
                    type="number"
                    placeholder="Days"
                    value={formData.daysPrescribed}
                    onChange={(e) => setFormData((prev) => ({ ...prev, daysPrescribed: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adherence-counselling"
                  checked={formData.adherenceCounselling}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, adherenceCounselling: !!checked }))}
                />
                <Label htmlFor="adherence-counselling">Adherence counselling provided</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="follow-up" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Follow-up & Prevention Services</CardTitle>
              <CardDescription>Schedule follow-up appointments and provide prevention services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="follow-up-date">Date/time of follow-up appointment</Label>
                  <Input
                    id="follow-up-date"
                    type="datetime-local"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type of follow-up appointment</Label>
                  <RadioGroup
                    value={formData.followUpType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, followUpType: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="retesting" id="retesting" />
                      <Label htmlFor="retesting">Retesting for HIV</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scheduled-prep" id="scheduled-prep" />
                      <Label htmlFor="scheduled-prep">Scheduled follow-up appointment for PrEP</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Prevention services offered and referrals</Label>
                <div className="grid grid-cols-1 gap-3">
                  {preventionServices.map((service) => (
                    <div key={service.value} className="flex items-start space-x-2">
                      <Checkbox
                        id={service.value}
                        checked={formData.preventionServices.includes(service.value)}
                        onCheckedChange={(checked) => handleArrayChange("preventionServices", service.value, !!checked)}
                      />
                      <Label htmlFor={service.value} className="text-sm leading-5">
                        {service.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condoms-distributed">Condoms distributed</Label>
                  <Input
                    id="condoms-distributed"
                    type="number"
                    placeholder="Number"
                    value={formData.condomsDistributed}
                    onChange={(e) => setFormData((prev) => ({ ...prev, condomsDistributed: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hiv-self-test"
                    checked={formData.hivSelfTestKits}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, hivSelfTestKits: !!checked }))}
                  />
                  <Label htmlFor="hiv-self-test">HIV self-test kits accepted</Label>
                </div>

                {formData.hivSelfTestKits && (
                  <div className="space-y-2">
                    <Label htmlFor="number-kits">Number of HIV self-test kits distributed</Label>
                    <Input
                      id="number-kits"
                      type="number"
                      placeholder="Number"
                      value={formData.numberOfKits}
                      onChange={(e) => setFormData((prev) => ({ ...prev, numberOfKits: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Save Draft</Button>
        <Button>Complete Visit</Button>
      </div>
    </div>
  )
}
