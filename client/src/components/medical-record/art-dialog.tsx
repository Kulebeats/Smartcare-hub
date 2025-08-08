import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ART_REGIMENS = [
  "TDF + 3TC + DTG",
  "TDF + 3TC + EFV",
  "TDF + FTC + DTG",
  "ABC + 3TC + DTG",
  "AZT + 3TC + DTG",
  "AZT + 3TC + NVP",
  "TAF + FTC + DTG",
  "Other",
] as const;

const ENROLLMENT_TYPES = [
  "New",
  "Transfer In",
  "Restart Treatment",
] as const;

const WHO_CLINICAL_STAGES = [
  "Stage 1",
  "Stage 2",
  "Stage 3",
  "Stage 4",
] as const;

const ARV_ADHERENCE_LEVELS = [
  "Good (>95%)",
  "Fair (85-95%)",
  "Poor (<85%)",
] as const;

const artFormSchema = z.object({
  enrollment: z.object({
    date: z.string(),
    facilityName: z.string().min(1, "Facility name is required"),
    enrollmentType: z.enum(ENROLLMENT_TYPES),
    artNumber: z.string().min(1, "ART number is required"),
    regimenCode: z.enum(ART_REGIMENS),
    otherRegimen: z.string().optional(),
  }),
  clinicalAssessment: z.object({
    whoStage: z.enum(WHO_CLINICAL_STAGES),
    functionalStatus: z.enum(["Working", "Ambulatory", "Bedridden"]),
    weight: z.number().min(0, "Weight must be a positive number"),
    height: z.number().min(0, "Height must be a positive number"),
    bmi: z.number().min(0, "BMI must be a positive number").optional(),
    pregnancyStatus: z.enum(["Not Pregnant", "Pregnant", "Breastfeeding", "Not Applicable"]),
    familyPlanningMethod: z.string().optional(),
  }),
  labResults: z.object({
    cd4Count: z.number().min(0, "CD4 count must be a positive number").optional(),
    cd4Percentage: z.number().min(0, "CD4 percentage must be a positive number").max(100, "CD4 percentage must not exceed 100").optional(),
    viralLoad: z.number().min(0, "Viral load must be a positive number").optional(),
    viralLoadDate: z.string().optional(),
    tbStatus: z.enum(["No signs", "Suspect", "On treatment", "Not assessed"]),
    tbTreatmentStartDate: z.string().optional(),
  }),
  treatmentPlan: z.object({
    arvDispensed: z.enum(ART_REGIMENS),
    otherArvDispensed: z.string().optional(),
    quantityDispensed: z.number().min(0, "Quantity must be a positive number"),
    durationInMonths: z.number().min(1, "Duration must be at least 1 month"),
    nextAppointmentDate: z.string(),
    adherenceLevel: z.enum(ARV_ADHERENCE_LEVELS),
    adherenceCounseling: z.boolean(),
  }),
  supportServices: z.object({
    nutritionalSupport: z.boolean(),
    psychosocialSupport: z.boolean(),
    communityLinkage: z.boolean(),
    otherSupport: z.string().optional(),
  }),
});

export type ArtForm = z.infer<typeof artFormSchema>;

export function ArtDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ArtForm) => void;
}) {
  const [selectedTab, setSelectedTab] = useState("enrollment");
  
  const form = useForm<ArtForm>({
    resolver: zodResolver(artFormSchema),
    defaultValues: {
      enrollment: {
        date: new Date().toISOString().slice(0, 10),
        facilityName: "Chilenje Mini Hospital",
        enrollmentType: "New",
        artNumber: "",
        regimenCode: "TDF + 3TC + DTG",
        otherRegimen: "",
      },
      clinicalAssessment: {
        whoStage: "Stage 1",
        functionalStatus: "Working",
        weight: 0,
        height: 0,
        bmi: 0,
        pregnancyStatus: "Not Applicable",
        familyPlanningMethod: "",
      },
      labResults: {
        cd4Count: undefined,
        cd4Percentage: undefined,
        viralLoad: undefined,
        viralLoadDate: "",
        tbStatus: "No signs",
        tbTreatmentStartDate: "",
      },
      treatmentPlan: {
        arvDispensed: "TDF + 3TC + DTG",
        otherArvDispensed: "",
        quantityDispensed: 60,
        durationInMonths: 2,
        nextAppointmentDate: "",
        adherenceLevel: "Good (>95%)",
        adherenceCounseling: false,
      },
      supportServices: {
        nutritionalSupport: false,
        psychosocialSupport: false,
        communityLinkage: false,
        otherSupport: "",
      },
    },
  });

  const { control, watch, setValue } = form;
  const watchRegimenCode = watch("enrollment.regimenCode");
  const watchArvDispensed = watch("treatmentPlan.arvDispensed");
  const watchWeight = watch("clinicalAssessment.weight");
  const watchHeight = watch("clinicalAssessment.height");
  const watchTbStatus = watch("labResults.tbStatus");

  // Calculate BMI whenever weight or height changes
  useEffect(() => {
    if (watchWeight > 0 && watchHeight > 0) {
      const heightInMeters = watchHeight / 100;
      const bmi = watchWeight / (heightInMeters * heightInMeters);
      setValue("clinicalAssessment.bmi", Math.round(bmi * 10) / 10);
    }
  }, [watchWeight, watchHeight, setValue]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0072BC]">
            Antiretroviral Therapy (ART)
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                <TabsTrigger value="clinical">Clinical Assessment</TabsTrigger>
                <TabsTrigger value="labs">Laboratory Results</TabsTrigger>
                <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
                <TabsTrigger value="support">Support Services</TabsTrigger>
              </TabsList>

              <TabsContent value="enrollment" className="space-y-4">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">ART Enrollment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="enrollment.date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enrollment Date</FormLabel>
                            <Input type="date" {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="enrollment.facilityName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facility Name</FormLabel>
                            <Input {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="enrollment.enrollmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enrollment Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select enrollment type" />
                              </SelectTrigger>
                              <SelectContent>
                                {ENROLLMENT_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="enrollment.artNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ART Number</FormLabel>
                            <Input {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="enrollment.regimenCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regimen Code</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select regimen" />
                              </SelectTrigger>
                              <SelectContent>
                                {ART_REGIMENS.map((regimen) => (
                                  <SelectItem key={regimen} value={regimen}>
                                    {regimen}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      {watchRegimenCode === "Other" && (
                        <FormField
                          control={control}
                          name="enrollment.otherRegimen"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specify Other Regimen</FormLabel>
                              <Input {...field} />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-4">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Clinical Assessment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="clinicalAssessment.whoStage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WHO Clinical Stage</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select WHO stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {WHO_CLINICAL_STAGES.map((stage) => (
                                  <SelectItem key={stage} value={stage}>
                                    {stage}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="clinicalAssessment.functionalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Functional Status</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Working">Working</SelectItem>
                                <SelectItem value="Ambulatory">Ambulatory</SelectItem>
                                <SelectItem value="Bedridden">Bedridden</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="clinicalAssessment.weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <Input 
                              type="number" 
                              step="0.1" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? 0 : value);
                              }}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="clinicalAssessment.height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <Input 
                              type="number" 
                              step="0.1" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? 0 : value);
                              }}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="clinicalAssessment.bmi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>BMI</FormLabel>
                            <Input type="number" {...field} disabled />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="clinicalAssessment.pregnancyStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pregnancy Status</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Pregnant">Not Pregnant</SelectItem>
                                <SelectItem value="Pregnant">Pregnant</SelectItem>
                                <SelectItem value="Breastfeeding">Breastfeeding</SelectItem>
                                <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="clinicalAssessment.familyPlanningMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Family Planning Method</FormLabel>
                            <Input {...field} />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="labs" className="space-y-4">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Laboratory Results</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="labResults.cd4Count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CD4 Count (cells/mm³)</FormLabel>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? undefined : value);
                              }}
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="labResults.cd4Percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CD4 Percentage (%)</FormLabel>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? undefined : value);
                              }}
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="labResults.viralLoad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Viral Load (copies/ml)</FormLabel>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? undefined : value);
                              }}
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="labResults.viralLoadDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Viral Load Date</FormLabel>
                            <Input type="date" {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="labResults.tbStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TB Status</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select TB status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="No signs">No signs</SelectItem>
                                <SelectItem value="Suspect">Suspect</SelectItem>
                                <SelectItem value="On treatment">On treatment</SelectItem>
                                <SelectItem value="Not assessed">Not assessed</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      {watchTbStatus === "On treatment" && (
                        <FormField
                          control={control}
                          name="labResults.tbTreatmentStartDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>TB Treatment Start Date</FormLabel>
                              <Input type="date" {...field} />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="treatment" className="space-y-4">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Treatment Plan</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="treatmentPlan.arvDispensed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ARV Dispensed</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select ARV dispensed" />
                              </SelectTrigger>
                              <SelectContent>
                                {ART_REGIMENS.map((regimen) => (
                                  <SelectItem key={regimen} value={regimen}>
                                    {regimen}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      {watchArvDispensed === "Other" && (
                        <FormField
                          control={control}
                          name="treatmentPlan.otherArvDispensed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specify Other ARV</FormLabel>
                              <Input {...field} />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={control}
                        name="treatmentPlan.quantityDispensed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity Dispensed</FormLabel>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? 0 : value);
                              }}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="treatmentPlan.durationInMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (months)</FormLabel>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? 1 : value);
                              }}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="treatmentPlan.nextAppointmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next Appointment Date</FormLabel>
                            <Input type="date" {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="treatmentPlan.adherenceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adherence Level</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select adherence level" />
                              </SelectTrigger>
                              <SelectContent>
                                {ARV_ADHERENCE_LEVELS.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="treatmentPlan.adherenceCounseling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormLabel>Adherence Counseling</FormLabel>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Support Services</h3>
                    <div className="space-y-4">
                      <FormField
                        control={control}
                        name="supportServices.nutritionalSupport"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormLabel>Nutritional Support</FormLabel>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="supportServices.psychosocialSupport"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormLabel>Psychosocial Support</FormLabel>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="supportServices.communityLinkage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormLabel>Community Linkage</FormLabel>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="supportServices.otherSupport"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other Support</FormLabel>
                            <Textarea {...field} placeholder="Specify other support services provided" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0072BC] hover:bg-blue-700">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}