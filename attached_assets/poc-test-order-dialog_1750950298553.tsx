import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Edit2, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const pocTestOrderSchema = z.object({
  selectTest: z.string().min(1, "Please select a test"),
  orderNumber: z.string(),
  orderPriority: z.string().min(1, "Please select order priority"),
  orderDate: z.date({
    required_error: "Please select an order date",
  }),
  testQuantity: z.number().min(1, "Test quantity must be at least 1"),
  sampleQuantity: z.number().min(1, "Sample quantity must be at least 1"),
  additionalComments: z.string().optional(),
});

const testResultSchema = z.object({
  resultStatus: z.string().min(1, "Please select result status"),
  numericResult: z.string().optional(),
  measuringUnit: z.string().optional(),
  resultComment: z.string().optional(),
});

type POCTestOrderForm = z.infer<typeof pocTestOrderSchema>;
type TestResultForm = z.infer<typeof testResultSchema>;

interface TestEntry {
  id: string;
  selectTest: string;
  orderNumber: string;
  orderPriority: string;
  orderDate: Date;
  testQuantity: number;
  sampleQuantity: number;
  additionalComments: string;
  result?: TestResultForm;
}

interface POCTestOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const testOptions = [
  "Fasting blood sugar",
  "Glucose dipstick (+s)",
  "Glucose dipstick (mmol/L)",
  "Haemoglobin",
  "Haemoglobin A1C percent",
  "Hepatitis B core antibody IgM (HBcAb)",
  "Hepatitis B surface-antibody (HBsAb)",
  "Low Density Lipoproteins (LDL)",
  "Malaria RDT",
  "Pregnancy RDT",
  "Random blood sugar",
  "Syphilis RDT",
];

const priorityOptions = [
  "Regular",
  "Urgent",
  "Emergency",
];

const resultStatusOptions = [
  "Normal",
  "Abnormal",
  "Critical",
  "Pending",
  "Invalid",
];

function generateOrderNumber(): string {
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return `ORD-${randomNum}`;
}

export function POCTestOrderDialog({ open, onClose, onSave }: POCTestOrderDialogProps) {
  const [testEntries, setTestEntries] = useState<TestEntry[]>([]);
  const [currentStep, setCurrentStep] = useState<'entry' | 'results'>('entry');
  const [orderNumber] = useState(generateOrderNumber());

  const form = useForm<POCTestOrderForm>({
    resolver: zodResolver(pocTestOrderSchema),
    defaultValues: {
      selectTest: "",
      orderNumber: orderNumber,
      orderPriority: "",
      orderDate: new Date(),
      testQuantity: 1,
      sampleQuantity: 1,
      additionalComments: "",
    },
  });

  const addToCart = (data: POCTestOrderForm) => {
    const newEntry: TestEntry = {
      id: `test-${Date.now()}`,
      selectTest: data.selectTest,
      orderNumber: data.orderNumber,
      orderPriority: data.orderPriority,
      orderDate: data.orderDate,
      testQuantity: data.testQuantity,
      sampleQuantity: data.sampleQuantity,
      additionalComments: data.additionalComments || "",
    };
    
    setTestEntries(prev => [...prev, newEntry]);
    
    // Reset form for next entry
    form.reset({
      selectTest: "",
      orderNumber: generateOrderNumber(),
      orderPriority: "",
      orderDate: new Date(),
      testQuantity: 1,
      sampleQuantity: 1,
      additionalComments: "",
    });
  };

  const removeTestEntry = (id: string) => {
    setTestEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const proceedToResults = () => {
    setCurrentStep('results');
  };

  const saveTestResults = () => {
    onSave(testEntries);
    handleClose();
  };

  const handleClose = () => {
    setTestEntries([]);
    setCurrentStep('entry');
    onClose();
    form.reset({
      selectTest: "",
      orderNumber: generateOrderNumber(),
      orderPriority: "",
      orderDate: new Date(),
      testQuantity: 1,
      sampleQuantity: 1,
      additionalComments: "",
    });
  };

  const updateTestResult = (testId: string, result: TestResultForm) => {
    setTestEntries(prev => prev.map(entry => 
      entry.id === testId ? { ...entry, result } : entry
    ));
  };

  // Test Result Entry Card Component
  const TestResultEntryCard = ({ entry, index, onUpdateResult }: {
    entry: TestEntry;
    index: number;
    onUpdateResult: (result: TestResultForm) => void;
  }) => {
    const [resultStatus, setResultStatus] = useState(entry.result?.resultStatus || "");
    const [numericResult, setNumericResult] = useState(entry.result?.numericResult || "");
    const [measuringUnit, setMeasuringUnit] = useState(entry.result?.measuringUnit || "");
    const [resultComment, setResultComment] = useState(entry.result?.resultComment || "");

    const handleResultUpdate = () => {
      const result: TestResultForm = {
        resultStatus,
        numericResult,
        measuringUnit,
        resultComment,
      };
      onUpdateResult(result);
    };

    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Test Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium">Test</p>
              <p>{entry.selectTest}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Priority</p>
              <p className="capitalize">{entry.orderPriority}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Order Date</p>
              <p>{format(entry.orderDate, "yyyy-MM-dd")}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Test Quantity</p>
              <p>{entry.testQuantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Sample Quantity</p>
              <p>{entry.sampleQuantity}</p>
            </div>
          </div>

          <Separator />

          {/* Test Result Entry */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Result Entry</h3>
            
            {/* Numeric Result */}
            <div>
              <label className="text-sm font-medium">Numeric Result</label>
              <Input
                value={numericResult}
                onChange={(e) => {
                  setNumericResult(e.target.value);
                  handleResultUpdate();
                }}
                placeholder="Enter numeric result"
              />
            </div>

            {/* Measuring Unit */}
            <div>
              <label className="text-sm font-medium">Measuring Unit</label>
              <Input
                value={measuringUnit}
                onChange={(e) => {
                  setMeasuringUnit(e.target.value);
                  handleResultUpdate();
                }}
                placeholder="mmol/L"
                disabled
              />
            </div>

            {/* Result Status */}
            <div>
              <label className="text-sm font-medium">Result Status</label>
              <Select value={resultStatus} onValueChange={(value) => {
                setResultStatus(value);
                handleResultUpdate();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Normal" />
                </SelectTrigger>
                <SelectContent>
                  {resultStatusOptions.map((status) => (
                    <SelectItem key={status} value={status.toLowerCase()}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Result Comment */}
            <div>
              <label className="text-sm font-medium">Result Comment</label>
              <Textarea
                value={resultComment}
                onChange={(e) => {
                  setResultComment(e.target.value);
                  handleResultUpdate();
                }}
                placeholder="Enter comment related to the test result"
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Test Order</DialogTitle>
        </DialogHeader>

{currentStep === 'entry' ? (
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addToCart)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Select Test */}
                  <FormField
                    control={form.control}
                    name="selectTest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Select Test
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {testOptions.map((test) => (
                              <SelectItem key={test} value={test}>
                                {test}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Order Number */}
                  <FormField
                    control={form.control}
                    name="orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Order Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Order Priority */}
                  <FormField
                    control={form.control}
                    name="orderPriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Order Priority
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityOptions.map((priority) => (
                              <SelectItem key={priority} value={priority.toLowerCase()}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Order Date */}
                  <FormField
                    control={form.control}
                    name="orderDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Order Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  {/* Test Quantity */}
                  <FormField
                    control={form.control}
                    name="testQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Test Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Sample Quantity */}
                  <FormField
                    control={form.control}
                    name="sampleQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Sample Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Comments */}
                <FormField
                  control={form.control}
                  name="additionalComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Additional Comments
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter Additional Comments"
                          className="min-h-[100px] resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="px-6 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Add to Cart
                  </Button>
                </div>
              </form>
            </Form>

            {/* Test Entries Cart */}
            {testEntries.length > 0 && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Test Cart ({testEntries.length} items)</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {testEntries.map((entry) => (
                    <Card key={entry.id} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium">{entry.selectTest}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Priority: {entry.orderPriority}</p>
                              <p>Order Date: {format(entry.orderDate, "dd/MM/yyyy")}</p>
                              <p>Test Qty: {entry.testQuantity} | Sample Qty: {entry.sampleQuantity}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTestEntry(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  onClick={proceedToResults}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Proceed to Result Entry ({testEntries.length} tests)
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {testEntries.map((entry, index) => (
              <TestResultEntryCard
                key={entry.id}
                entry={entry}
                index={index}
                onUpdateResult={(result: TestResultForm) => updateTestResult(entry.id, result)}
              />
            ))}
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={saveTestResults}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                Save Test Result
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}