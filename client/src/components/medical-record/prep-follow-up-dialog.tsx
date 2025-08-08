
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

// Define form schema for PrEP Follow-Up Visit
const prepFollowUpSchema = z.object({
  visitDate: z.string({
    required_error: "Visit date is required",
  }),
  visitType: z.string({
    required_error: "Visit type is required",
  }),
  hivTestDate: z.string({
    required_error: "HIV test date is required",
  }),
  hivTestResult: z.string({
    required_error: "HIV test result is required",
  }),
  weight: z.string().optional(),
  systolicBp: z.string().optional(),
  diastolicBp: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  adherenceLevel: z.string({
    required_error: "Adherence level is required",
  }),
  missedDoses: z.string().optional(),
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

type PrepFollowUpForm = z.infer<typeof prepFollowUpSchema>;

const visitTypeOptions = [
  { value: "scheduled", label: "Scheduled Visit" },
  { value: "unscheduled", label: "Unscheduled Visit" },
  { value: "refill", label: "Refill Only" },
];

const sideEffectOptions = [
  { value: "nausea", label: "Nausea" },
  { value: "headache", label: "Headache" },
  { value: "dizziness", label: "Dizziness" },
  { value: "fatigue", label: "Fatigue" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "rash", label: "Rash" },
  { value: "renal_abnormalities", label: "Renal Abnormalities" },
];

const adherenceLevelOptions = [
  { value: "excellent", label: "Excellent (>95%)" },
  { value: "good", label: "Good (80-95%)" },
  { value: "fair", label: "Fair (60-80%)" },
  { value: "poor", label: "Poor (<60%)" },
];

const regimenOptions = [
  { value: "tdf_ftc", label: "TDF/FTC (Truvada) once daily" },
  { value: "tdf_3tc", label: "TDF/3TC once daily" },
  { value: "taf_ftc", label: "TAF/FTC once daily" },
];

interface PrepFollowUpDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PrepFollowUpForm) => void;
}

export function PrepFollowUpDialog({
  open,
  onClose,
  onSave,
}: PrepFollowUpDialogProps) {
  const [activeTab, setActiveTab] = useState("visit-info");

  const form = useForm<PrepFollowUpForm>({
    resolver: zodResolver(prepFollowUpSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      visitType: "scheduled",
      hivTestDate: new Date().toISOString().split('T')[0],
      hivTestResult: "negative",
      weight: "",
      systolicBp: "",
      diastolicBp: "",
      sideEffects: [],
      adherenceLevel: "excellent",
      missedDoses: "0",
      regimenPrescribed: "tdf_ftc",
      dosage: "1 tablet",
      supplyDuration: "30",
      nextVisitDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      clinicalNotes: "",
    },
  });

  const handleSubmit = (data: PrepFollowUpForm) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0072BC]">
            PrEP Follow-Up Visit
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="visit-info">Visit Information</TabsTrigger>
                <TabsTrigger value="clinical-assessment">Clinical Assessment</TabsTrigger>
                <TabsTrigger value="prescription">Prescription & Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="visit-info" className="space-y-4">
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
                    name="visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {visitTypeOptions.map((option) => (
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <FormField
                  control={form.control}
                  name="sideEffects"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Side Effects</FormLabel>
                        <FormDescription>
                          Select all side effects experienced since last visit.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sideEffectOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="sideEffects"
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
                </div>

                <FormField
                  control={form.control}
                  name="adherenceLevel"
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
                          {adherenceLevelOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="missedDoses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Missed Doses</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                {activeTab !== "visit-info" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (activeTab === "clinical-assessment") {
                        setActiveTab("visit-info");
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
                      if (activeTab === "visit-info") {
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
