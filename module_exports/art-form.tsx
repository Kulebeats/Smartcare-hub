import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

export default function ARTForm({ patientId }: { patientId: number }) {
  const [activeTab, setActiveTab] = useState("complaints");
  const form = useForm();

  const onSubmit = async (data: any) => {
    // Submit ART follow-up data
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Latest Adult Follow Up</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b p-0">
            <TabsTrigger value="complaints" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Complaints & Histories
            </TabsTrigger>
            <TabsTrigger value="examination" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Examination & Diagnosis
            </TabsTrigger>
            <TabsTrigger value="plan" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complaints">
            <CardContent className="space-y-4 pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="presenting_complaints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presenting Complaints</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tb_symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TB Constitutional Symptoms</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="review_systems"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review of Systems</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Back</Button>
                    <Button onClick={() => setActiveTab("examination")}>Next</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </TabsContent>

          <TabsContent value="examination">
            <CardContent className="space-y-4 pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="general_assessment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Assessment</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WHO Diagnosis</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setActiveTab("complaints")}>
                      Back
                    </Button>
                    <Button onClick={() => setActiveTab("plan")}>Next</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </TabsContent>

          <TabsContent value="plan">
            <CardContent className="space-y-4 pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="art_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ART Treatment Plan</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="treatment_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Plan</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setActiveTab("examination")}>
                      Back
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
