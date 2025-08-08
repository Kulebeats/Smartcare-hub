import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define form schema for PrEP Initial Assessment
const prepInitialSchema = z.object({
  visitDate: z.string({
    required_error: "Visit date is required",
  }),
  hivTestDate: z.string({
    required_error: "HIV test date is required",
  }),
  hivTestResult: z.string({
    required_error: "HIV test result is required",
  }),
  riskFactors: z.array(z.string()).optional(),
  hasAllergies: z.boolean().default(false),
  allergies: z.string().optional(),
  hasMedicalConditions: z.boolean().default(false),
  medicalConditions: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  systolicBp: z.string().optional(),
  diastolicBp: z.string().optional(),
  pulseRate: z.string().optional(),
  creatinine: z.string().optional(),
  creatinineClearance: z.string().optional(),
  hepatitisB: z.string().optional(),
  hepatitisC: z.string().optional(),
  isEligible: z.boolean().default(true),
  notEligibleReason: z.string().optional(),
  regimenPrescribed: z.string({
    required_error: "Regimen is required",
  }),
  dosage: z.string({
    required_error: "Dosage is required",
  }),
  supplyDuration: z.string({
    required_error: "Supply duration is required",
  }),
  nextVisitDate: z.string({
    required_error: "Next visit date is required",
  }),
  clinicalNotes: z.string().optional(),
});

type PrepInitialForm = z.infer<typeof prepInitialSchema>;

const riskFactorOptions = [
  { value: "msm", label: "Men who have sex with men (MSM)" },
  { value: "fsw", label: "Female sex worker (FSW)" },
  { value: "discordant_couple", label: "HIV discordant couple" },
  { value: "multiple_partners", label: "Multiple sexual partners" },
  { value: "sti_history", label: "Recent history of STI" },
  { value: "inconsistent_condom", label: "Inconsistent condom use" },
  { value: "injecting_drug", label: "Injecting drug use" },
];

const regimenOptions = [
  { value: "tdf_ftc", label: "TDF/FTC (Truvada) once daily" },
  { value: "tdf_3tc", label: "TDF/3TC once daily" },
  { value: "taf_ftc", label: "TAF/FTC once daily" },
];

interface PrepInitialDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PrepInitialForm) => void;
}

export function PrepInitialDialog({
  open,
  onClose,
  onSave,
}: PrepInitialDialogProps) {
  const [activeTab, setActiveTab] = useState("patient-info");

  const form = useForm<PrepInitialForm>({
    resolver: zodResolver(prepInitialSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      hivTestDate: new Date().toISOString().split('T')[0],
      hivTestResult: "negative",
      riskFactors: [],
      hasAllergies: false,
      allergies: "",
      hasMedicalConditions: false,
      medicalConditions: "",
      weight: "",
      height: "",
      systolicBp: "",
      diastolicBp: "",
      pulseRate: "",
      creatinine: "",
      creatinineClearance: "",
      hepatitisB: "negative",
      hepatitisC: "negative",
      isEligible: true,
      notEligibleReason: "",
      regimenPrescribed: "tdf_ftc",
      dosage: "1 tablet",
      supplyDuration: "30",
      nextVisitDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      clinicalNotes: "",
    },
  });

  const handleSubmit = (data: PrepInitialForm) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0072BC]">
            PrEP Initial Assessment
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="patient-info">Patient Information</TabsTrigger>
                <TabsTrigger value="clinical-assessment">Clinical Assessment</TabsTrigger>
                <TabsTrigger value="prescription">Prescription & Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="patient-info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hivTestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HIV Test Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hivTestResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HIV Test Result</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="negative" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Negative
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="positive" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Positive
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="indeterminate" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Indeterminate
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskFactors"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Risk Factors</FormLabel>
                        <FormDescription>
                          Select all applicable risk factors.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {riskFactorOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="riskFactors"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), option.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hasAllergies"
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
                            Has Known Allergies
                          </FormLabel>
                          <FormDescription>
                            Check if patient has any known allergies.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasMedicalConditions"
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
                            Has Medical Conditions
                          </FormLabel>
                          <FormDescription>
                            Check if patient has any pre-existing medical conditions.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("hasAllergies") && (
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List all known allergies"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("hasMedicalConditions") && (
                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List all pre-existing medical conditions"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="clinical-assessment" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="systolicBp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Systolic BP (mmHg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diastolicBp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diastolic BP (mmHg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pulseRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pulse Rate (bpm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="creatinine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creatinine (μmol/L)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creatinineClearance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creatinine Clearance (mL/min)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hepatitisB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hepatitis B Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Hepatitis B Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hepatitisC"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hepatitis C Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Hepatitis C Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isEligible"
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
                          Patient Eligible for PrEP
                        </FormLabel>
                        <FormDescription>
                          Check if patient meets all eligibility criteria for PrEP.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!form.watch("isEligible") && (
                  <FormField
                    control={form.control}
                    name="notEligibleReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason Not Eligible</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain why patient is not eligible"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="prescription" className="space-y-4">
                <FormField
                  control={form.control}
                  name="regimenPrescribed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regimen Prescribed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select regimen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regimenOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplyDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supply Duration (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nextVisitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Visit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clinicalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinical Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional clinical notes"
                          className="resize-none min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <div className="flex space-x-2">
                {activeTab !== "patient-info" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (activeTab === "clinical-assessment") {
                        setActiveTab("patient-info");
                      } else if (activeTab === "prescription") {
                        setActiveTab("clinical-assessment");
                      }
                    }}
                  >
                    Previous
                  </Button>
                )}
                {activeTab !== "prescription" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (activeTab === "patient-info") {
                        setActiveTab("clinical-assessment");
                      } else if (activeTab === "clinical-assessment") {
                        setActiveTab("prescription");
                      }
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit">Submit</Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}