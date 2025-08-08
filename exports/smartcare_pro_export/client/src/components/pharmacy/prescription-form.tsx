import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PrescriptionForm({ patientId }: { patientId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm();

  const onSubmit = async (data: any) => {
    // Submit prescription data
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pharmacy Prescription</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General Drugs</TabsTrigger>
              <TabsTrigger value="arv">ARVs & ATT drugs</TabsTrigger>
              <TabsTrigger value="custom">Custom drugs</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="general_drug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>General Drug *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter General Drug" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Dosage" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="item_per_dose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Per Dose *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Item Per Dose" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Frequency" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time_unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Per (Time Unit) *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="--Select--" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="day">Day</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                                <SelectItem value="month">Month</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency_unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency Unit (if not Time Unit) *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="--Select--" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prn">PRN</SelectItem>
                                <SelectItem value="stat">STAT</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Duration" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration_unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration Unit</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="--Select--" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="weeks">Weeks</SelectItem>
                                <SelectItem value="months">Months</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="route"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Route *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="--Select--" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="oral">Oral</SelectItem>
                                <SelectItem value="iv">IV</SelectItem>
                                <SelectItem value="im">IM</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Quantity" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add to Cart</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="arv" className="mt-4">
              {/* ARV specific form fields */}
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              {/* Custom drug form fields */}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
