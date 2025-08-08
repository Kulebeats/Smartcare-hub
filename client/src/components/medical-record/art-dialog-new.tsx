import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ART Form Schema
const artFormSchema = z.object({
  enrollment: z.object({
    date: z.string(),
    facilityName: z.string(),
    enrollmentType: z.string(),
    artNumber: z.string(),
    regimenCode: z.string(),
    otherRegimen: z.string().optional(),
    artNaive: z.boolean().optional(),
    pastMedicalHistory: z.string().optional(),
  }),
  clinicalAssessment: z.object({
    whoStage: z.string(),
    functionalStatus: z.string(),
    weight: z.number(),
    height: z.number(),
    bmi: z.number(),
    pregnancyStatus: z.string(),
    familyPlanningMethod: z.string().optional(),
  }),
  labResults: z.object({
    cd4Count: z.number().optional(),
    cd4Percentage: z.number().optional(),
    viralLoad: z.number().optional(),
    viralLoadDate: z.string().optional(),
    tbStatus: z.string(),
    tbTreatmentStartDate: z.string().optional(),
  }),
  treatmentPlan: z.object({
    arvDispensed: z.string(),
    otherArvDispensed: z.string().optional(),
    quantityDispensed: z.number(),
    durationInMonths: z.number(),
    nextAppointmentDate: z.string(),
    adherenceLevel: z.string(),
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
        artNaive: false,
        pastMedicalHistory: "",
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
        adherenceLevel: "Good",
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

  const watchRegimenCode = form.watch("enrollment.regimenCode");
  const watchArvDispensed = form.watch("treatmentPlan.arvDispensed");
  const watchWeight = form.watch("clinicalAssessment.weight");
  const watchHeight = form.watch("clinicalAssessment.height");
  const watchTbStatus = form.watch("labResults.tbStatus");
  const watchArtNaive = form.watch("enrollment.artNaive");

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (watchWeight > 0 && watchHeight > 0) {
      const heightInMeters = watchHeight / 100;
      const bmi = watchWeight / (heightInMeters * heightInMeters);
      form.setValue("clinicalAssessment.bmi", Math.round(bmi * 10) / 10);
    }
  }, [watchWeight, watchHeight, form]);

  const handleSubmit = (data: ArtForm) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0072BC]">
            Antiretroviral Therapy (ART)
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <div className="flex flex-col">
                <div className="sticky top-0 bg-white py-2 z-10">
                  <TabsList className="grid grid-cols-5 w-full mb-4">
                    <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                    <TabsTrigger value="clinical">Clinical Assessment</TabsTrigger>
                    <TabsTrigger value="labs">Laboratory Results</TabsTrigger>
                    <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
                    <TabsTrigger value="support">Support Services</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="enrollment">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">ART Enrollment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="enrollment.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Enrollment Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="enrollment.facilityName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facility Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="enrollment.enrollmentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Enrollment Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select enrollment type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="New">New</SelectItem>
                                  <SelectItem value="Transfer In">Transfer In</SelectItem>
                                  <SelectItem value="Restart">Restart</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="enrollment.artNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ART Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="enrollment.artNaive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  ART Naive (No previous ART experience)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        {watchArtNaive && (
                          <FormField
                            control={form.control}
                            name="enrollment.pastMedicalHistory"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Past Medical History</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter patient's past medical history"
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name="enrollment.regimenCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Regimen Code</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select regimen code" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="TDF + 3TC + DTG">TDF + 3TC + DTG</SelectItem>
                                  <SelectItem value="TDF + 3TC + EFV">TDF + 3TC + EFV</SelectItem>
                                  <SelectItem value="AZT + 3TC + NVP">AZT + 3TC + NVP</SelectItem>
                                  <SelectItem value="AZT + 3TC + LPV/r">AZT + 3TC + LPV/r</SelectItem>
                                  <SelectItem value="ABC + 3TC + DTG">ABC + 3TC + DTG</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {watchRegimenCode === "Other" && (
                          <FormField
                            control={form.control}
                            name="enrollment.otherRegimen"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specify Other Regimen</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="clinical">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Clinical Assessment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="clinicalAssessment.whoStage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WHO Clinical Stage</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select WHO stage" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Stage 1">Stage 1</SelectItem>
                                  <SelectItem value="Stage 2">Stage 2</SelectItem>
                                  <SelectItem value="Stage 3">Stage 3</SelectItem>
                                  <SelectItem value="Stage 4">Stage 4</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalAssessment.functionalStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Functional Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select functional status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Working">Working</SelectItem>
                                  <SelectItem value="Ambulatory">Ambulatory</SelectItem>
                                  <SelectItem value="Bedridden">Bedridden</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalAssessment.weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalAssessment.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (cm)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalAssessment.bmi"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>BMI (kg/m²)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  disabled 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalAssessment.pregnancyStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pregnancy Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select pregnancy status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                                  <SelectItem value="Not Pregnant">Not Pregnant</SelectItem>
                                  <SelectItem value="Pregnant">Pregnant</SelectItem>
                                  <SelectItem value="Breastfeeding">Breastfeeding</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalAssessment.familyPlanningMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Family Planning Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select family planning method (if applicable)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">None</SelectItem>
                                  <SelectItem value="Condoms">Condoms</SelectItem>
                                  <SelectItem value="Pills">Pills</SelectItem>
                                  <SelectItem value="Injectable">Injectable</SelectItem>
                                  <SelectItem value="Implant">Implant</SelectItem>
                                  <SelectItem value="IUD">IUD</SelectItem>
                                  <SelectItem value="Sterilization">Sterilization</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="labs">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Laboratory Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="labResults.cd4Count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CD4 Count (cells/mm³)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="labResults.cd4Percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CD4 Percentage (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="labResults.viralLoad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Viral Load (copies/mL)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="labResults.viralLoadDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Viral Load Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="labResults.tbStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>TB Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select TB status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="No signs">No signs</SelectItem>
                                  <SelectItem value="TB suspected">TB suspected</SelectItem>
                                  <SelectItem value="TB confirmed">TB confirmed</SelectItem>
                                  <SelectItem value="On TB treatment">On TB treatment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {(watchTbStatus === "TB confirmed" || watchTbStatus === "On TB treatment") && (
                          <FormField
                            control={form.control}
                            name="labResults.tbTreatmentStartDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>TB Treatment Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="treatment">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Treatment Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="treatmentPlan.arvDispensed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ARV Dispensed</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ARV dispensed" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="TDF + 3TC + DTG">TDF + 3TC + DTG</SelectItem>
                                  <SelectItem value="TDF + 3TC + EFV">TDF + 3TC + EFV</SelectItem>
                                  <SelectItem value="AZT + 3TC + NVP">AZT + 3TC + NVP</SelectItem>
                                  <SelectItem value="AZT + 3TC + LPV/r">AZT + 3TC + LPV/r</SelectItem>
                                  <SelectItem value="ABC + 3TC + DTG">ABC + 3TC + DTG</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {watchArvDispensed === "Other" && (
                          <FormField
                            control={form.control}
                            name="treatmentPlan.otherArvDispensed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specify Other ARV</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name="treatmentPlan.quantityDispensed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity Dispensed</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="treatmentPlan.durationInMonths"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (months)</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 month</SelectItem>
                                  <SelectItem value="2">2 months</SelectItem>
                                  <SelectItem value="3">3 months</SelectItem>
                                  <SelectItem value="6">6 months</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="treatmentPlan.nextAppointmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Next Appointment Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="treatmentPlan.adherenceLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adherence Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select adherence level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Good">Good (Above 95%)</SelectItem>
                                  <SelectItem value="Fair">Fair (85-94%)</SelectItem>
                                  <SelectItem value="Poor">Poor (Below 85%)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="treatmentPlan.adherenceCounseling"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Adherence Counseling Provided
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="support">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-[#0072BC]">Support Services</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="supportServices.nutritionalSupport"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Nutritional Support
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="supportServices.psychosocialSupport"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Psychosocial Support
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="supportServices.communityLinkage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Community Linkage
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="supportServices.otherSupport"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Other Support (specify)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter any other support services provided"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}