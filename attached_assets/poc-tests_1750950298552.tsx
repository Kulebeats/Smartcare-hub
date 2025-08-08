import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Beaker } from "lucide-react";
import { pocTests } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const pocTestFormSchema = z.object({
  searchTest: z.string().min(1, "Test selection is required"),
  orderNumber: z.string(),
  orderPriority: z.string().min(1, "Priority is required"),
  orderDate: z.string().min(1, "Date is required"),
  testQuantity: z.string().min(1, "Test quantity is required"),
  sampleQuantity: z.string().min(1, "Sample quantity is required"),
  imagingDetails: z.string().optional(),
  additionalComments: z.string().optional(),
});

const resultFormSchema = z.object({
  resultDate: z.string().min(1, "Result date is required"),
  resultOption: z.string().min(1, "Result option is required"),
  resultStatus: z.string().min(1, "Result status is required"),
  resultComment: z.string().optional(),
});

type POCTestForm = z.infer<typeof pocTestFormSchema>;
type ResultForm = z.infer<typeof resultFormSchema>;

interface POCTestsProps {
  patientId: number;
}

export function POCTests({ patientId }: POCTestsProps) {
  const [showResults, setShowResults] = useState(false);
  const [selectedTest, setSelectedTest] = useState("");

  const form = useForm<POCTestForm>({
    resolver: zodResolver(pocTestFormSchema),
    defaultValues: {
      orderNumber: generateOrderNumber(),
      orderDate: new Date().toISOString().split('T')[0],
    },
  });

  const resultForm = useForm<ResultForm>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      resultDate: new Date().toISOString().split('T')[0],
    },
  });

  function generateOrderNumber() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function onSubmit(data: POCTestForm) {
    console.log(data);
    setSelectedTest(data.searchTest);
    setShowResults(true);
  }

  function onResultSubmit(data: ResultForm) {
    console.log("Result data:", data);
    setShowResults(false);
    // Here we would save the result data
  }

  return (
    <div>
      {!showResults && (
        <Card>
          <CardHeader>
            <CardTitle>New Test Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="searchTest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Search Test <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test" />
                        </SelectTrigger>
                        <SelectContent>
                          {pocTests.map((test) => (
                            <SelectItem key={test.id} value={test.id}>
                              {test.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Order Priority <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Order Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="testQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Test Quantity <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter Test Quantity" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sampleQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Sample Quantity <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter Sample Quantity" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imagingDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imaging Test Details (If imaging test selected)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Imaging Test Details"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Additional comments"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Add To Cart
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Add Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Facility: Chongwe District Hospital</p>
              <p className="text-sm font-medium">Test: {selectedTest}</p>
            </div>

            <Form {...resultForm}>
              <form onSubmit={resultForm.handleSubmit(onResultSubmit)} className="space-y-4">
                <FormField
                  control={resultForm.control}
                  name="resultDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Result Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={resultForm.control}
                  name="resultOption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Result Option</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select result option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                          <SelectItem value="inconclusive">Inconclusive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={resultForm.control}
                  name="resultStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Result Status <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="final">Final</SelectItem>
                          <SelectItem value="preliminary">Preliminary</SelectItem>
                          <SelectItem value="amended">Amended</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={resultForm.control}
                  name="resultComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment On Result</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Comment On Result"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResults(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add To Cart
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}