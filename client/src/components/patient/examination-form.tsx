import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExaminationForm({ patientId }: { patientId: number }) {
  const form = useForm();

  const onSubmit = async (data: any) => {
    // Submit examination data
  };

  return (
    <Card>
      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">General Assessment</TabsTrigger>
          <TabsTrigger value="systems">System Examination</TabsTrigger>
          <TabsTrigger value="glasgow">Glasgow Coma Scale</TabsTrigger>
          <TabsTrigger value="dsd">DSD Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stable">Stable</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pallor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pallor</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="edema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edema</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </TabsContent>

        <TabsContent value="systems">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="physical_system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical System</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </TabsContent>

        <TabsContent value="glasgow">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="eye_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eye Score</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="4" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verbal_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verbal Score</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motor_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor Score</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="6" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </TabsContent>

        <TabsContent value="dsd">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="stable_on_care"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is Client Stable On Care</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="should_continue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Should Continue DSD</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="refer_clinician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Should Refer to Clinician</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardContent className="flex justify-end space-x-2 pt-6">
        <Button variant="outline">Back</Button>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Save</Button>
      </CardContent>
    </Card>
  );
}
