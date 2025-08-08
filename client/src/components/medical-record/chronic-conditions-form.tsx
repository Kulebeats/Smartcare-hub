import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const chronicConditionSchema = z.object({
  ntgLevel1: z.string().min(1, "NTG Level 1 is required"),
  ntgLevel2: z.string().optional(),
  ntgLevel3: z.string().optional(),
  icd11: z.string().min(1, "ICD 11 code is required"),
  condition: z.string().min(1, "Condition is required"),
  dateDiagnosed: z.string().min(1, "Date diagnosed is required"),
  stillOngoing: z.boolean().default(false),
  dateResolved: z.string().optional(),
  certainty: z.string().min(1, "Certainty is required"),
  comments: z.string().optional(),
});

type ChronicConditionForm = z.infer<typeof chronicConditionSchema>;

interface ChronicConditionFormProps {
  onSave: (data: ChronicConditionForm) => void;
}

const certaintyOptions = [
  { value: "confirmed", label: "Confirmed" },
  { value: "suspected", label: "Suspected" },
  { value: "probable", label: "Probable" },
  { value: "refuted", label: "Refuted" },
];

export function ChronicConditionForm({ onSave }: ChronicConditionFormProps) {
  const [isOngoing, setIsOngoing] = useState(false);

  const form = useForm<ChronicConditionForm>({
    resolver: zodResolver(chronicConditionSchema),
    defaultValues: {
      stillOngoing: false,
    },
  });

  const handleSubmit = (data: ChronicConditionForm) => {
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chronic / Non Chronic Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="ntgLevel1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NTG Level 1 *</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Search" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="level1_option1">Level 1 Option 1</SelectItem>
                          <SelectItem value="level1_option2">Level 1 Option 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ntgLevel2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NTG Level 2</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Search" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="level2_option1">Level 2 Option 1</SelectItem>
                          <SelectItem value="level2_option2">Level 2 Option 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ntgLevel3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NTG Level 3</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Search" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="level3_option1">Level 3 Option 1</SelectItem>
                          <SelectItem value="level3_option2">Level 3 Option 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="icd11"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ICD 11</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Search ICD 11" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="icd11_code1">ICD-11 Code 1</SelectItem>
                        <SelectItem value="icd11_code2">ICD-11 Code 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition *</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="condition1">Condition 1</SelectItem>
                      <SelectItem value="condition2">Condition 2</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="dateDiagnosed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Diagnosed *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stillOngoing"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setIsOngoing(checked as boolean);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Still Ongoing</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {!isOngoing && (
                <FormField
                  control={form.control}
                  name="dateResolved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Resolved</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="certainty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certainty *</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="--Select--" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {certaintyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter Comments"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save Condition
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
