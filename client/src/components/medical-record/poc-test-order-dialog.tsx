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
import { CalendarIcon, Edit2, Trash2, Info } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { POCTestData, pocTestTypes, pocTestPriorities, pocTestResultStatuses, syphilisTestSubtypes } from "@shared/schema";
import { ClinicalDecisionSupportModal, CDSSCondition } from "./clinical-decision-support-modal";
import { evaluatePOCTestResult } from "./poc-tests-cdss";

const pocTestOrderSchema = z.object({
  selectTest: z.string().min(1, "Please select a test"),
  syphilisSubtype: z.string().optional(),
  orderNumber: z.string(),
  orderPriority: z.enum(['routine', 'urgent', 'emergency']),
  orderDate: z.date({
    required_error: "Please select an order date",
  }),
  testQuantity: z.number().min(1, "Test quantity must be at least 1"),
  sampleQuantity: z.number().min(1, "Sample quantity must be at least 1"),
  additionalComments: z.string().optional(),
}).refine(
  (data) => {
    // Require syphilis subtype if syphilis_tests is selected
    if (data.selectTest === 'syphilis_tests' && !data.syphilisSubtype) {
      return false;
    }
    return true;
  },
  {
    message: "Syphilis test type is required when Syphilis Tests is selected",
    path: ["syphilisSubtype"],
  }
);

const testResultSchema = z.object({
  resultStatus: z.enum(['normal', 'abnormal', 'critical', 'pending', 'invalid']),
  numericResult: z.string().optional(),
  measuringUnit: z.string().optional(),
  resultComment: z.string().optional(),
  resultDate: z.date({
    required_error: "Please select a result date",
  }),
});

type POCTestOrderForm = z.infer<typeof pocTestOrderSchema>;
type TestResultForm = z.infer<typeof testResultSchema>;

interface TestEntry extends POCTestOrderForm {
  id: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  result?: TestResultForm;
}

interface POCTestOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: POCTestData[]) => void;
}

function generateOrderNumber(): string {
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return `POC-${randomNum}`;
}

export function POCTestOrderDialog({ open, onClose, onSave }: POCTestOrderDialogProps) {
  const [testEntries, setTestEntries] = useState<TestEntry[]>([]);
  const [currentStep, setCurrentStep] = useState<'entry' | 'results'>('entry');
  const [selectedTestInfo, setSelectedTestInfo] = useState<typeof pocTestTypes[0] | null>(null);
  const [showCDSSModal, setShowCDSSModal] = useState(false);
  const [currentCDSSCondition, setCurrentCDSSCondition] = useState<CDSSCondition | null>(null);

  const form = useForm<POCTestOrderForm>({
    resolver: zodResolver(pocTestOrderSchema),
    defaultValues: {
      selectTest: "",
      syphilisSubtype: "",
      orderNumber: generateOrderNumber(),
      orderPriority: "routine",
      orderDate: new Date(),
      testQuantity: 1,
      sampleQuantity: 1,
      additionalComments: "",
    },
  });

  const addToCart = (data: POCTestOrderForm) => {
    const newEntry: TestEntry = {
      id: `test-${Date.now()}`,
      ...data,
      status: 'ordered',
    };
    
    setTestEntries(prev => [...prev, newEntry]);
    
    // Reset form for next entry
    form.reset({
      selectTest: "",
      syphilisSubtype: "",
      orderNumber: generateOrderNumber(),
      orderPriority: "routine",
      orderDate: new Date(),
      testQuantity: 1,
      sampleQuantity: 1,
      additionalComments: "",
    });
    setSelectedTestInfo(null);
  };

  const removeTestEntry = (id: string) => {
    setTestEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const proceedToResults = () => {
    setCurrentStep('results');
  };

  const saveTestResults = () => {
    const finalData: POCTestData[] = testEntries.map(entry => ({
      id: entry.id,
      selectTest: entry.selectTest === 'syphilis_tests' && entry.syphilisSubtype 
        ? entry.syphilisSubtype // Use subtype as the actual test name
        : entry.selectTest,
      orderNumber: entry.orderNumber,
      orderPriority: entry.orderPriority,
      orderDate: entry.orderDate,
      testQuantity: entry.testQuantity,
      sampleQuantity: entry.sampleQuantity,
      additionalComments: entry.additionalComments,
      status: entry.result ? 'completed' : 'ordered',
      result: entry.result,
    }));
    
    // Check for CDSS alerts on completed tests
    finalData.forEach(test => {
      if (test.result && test.result.numericResult) {
        const condition = evaluatePOCTestResult(test.selectTest, parseFloat(test.result.numericResult));
        if (condition) {
          setCurrentCDSSCondition(condition);
          setShowCDSSModal(true);
        }
      }
    });
    
    onSave(finalData);
    handleClose();
  };

  const handleClose = () => {
    setTestEntries([]);
    setCurrentStep('entry');
    setSelectedTestInfo(null);
    onClose();
    form.reset({
      selectTest: "",
      syphilisSubtype: "",
      orderNumber: generateOrderNumber(),
      orderPriority: "routine",
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
    
    // Evaluate result for CDSS alerts
    const testEntry = testEntries.find(entry => entry.id === testId);
    if (testEntry && result.numericResult) {
      const condition = evaluatePOCTestResult(testEntry.selectTest, parseFloat(result.numericResult));
      if (condition) {
        setCurrentCDSSCondition(condition);
        setShowCDSSModal(true);
      }
    }
  };

  const handleCDSSClose = () => {
    setShowCDSSModal(false);
    setCurrentCDSSCondition(null);
  };

  const handleTestSelection = (testId: string) => {
    const testInfo = pocTestTypes.find(test => test.id === testId);
    setSelectedTestInfo(testInfo || null);
    form.setValue('selectTest', testId);
    
    // Clear syphilis subtype if not a syphilis test
    if (testId !== 'syphilis_tests') {
      form.setValue('syphilisSubtype', '');
    }
  };

  // Test Result Entry Card Component
  const TestResultEntryCard = ({ entry, index, onUpdateResult }: {
    entry: TestEntry;
    index: number;
    onUpdateResult: (result: TestResultForm) => void;
  }) => {
    const [resultData, setResultData] = useState<TestResultForm>({
      resultStatus: entry.result?.resultStatus || 'normal',
      numericResult: entry.result?.numericResult || '',
      measuringUnit: entry.result?.measuringUnit || '',
      resultComment: entry.result?.resultComment || '',
      resultDate: entry.result?.resultDate || new Date(),
    });

    const testInfo = pocTestTypes.find(test => test.id === entry.selectTest);

    const handleResultUpdate = (field: keyof TestResultForm, value: any) => {
      const updatedData = { ...resultData, [field]: value };
      setResultData(updatedData);
      onUpdateResult(updatedData);
    };

    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Test #{index + 1} Results
            <Badge variant="outline">{entry.orderPriority}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium">Test</p>
              <p className="text-sm">
                {entry.selectTest === 'syphilis_tests' && entry.syphilisSubtype 
                  ? syphilisTestSubtypes.find(s => s.value === entry.syphilisSubtype)?.label || entry.selectTest
                  : testInfo?.name || entry.selectTest}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Order Date</p>
              <p className="text-sm">{format(entry.orderDate, "yyyy-MM-dd")}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Order Number</p>
              <p className="text-sm">{entry.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Expected Unit</p>
              <p className="text-sm">{testInfo?.unit || 'Various'}</p>
            </div>
          </div>

          {/* Reference Ranges */}
          {testInfo && (
            <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-900 mb-2">Reference Ranges</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="font-medium text-green-700">Normal: </span>
                  <span className="text-green-600">{testInfo.normalRange}</span>
                </div>
                <div>
                  <span className="font-medium text-yellow-700">Abnormal: </span>
                  <span className="text-yellow-600">{testInfo.abnormalRange}</span>
                </div>
                <div>
                  <span className="font-medium text-red-700">Critical: </span>
                  <span className="text-red-600">{testInfo.criticalRange}</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Test Result Entry */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Result Entry</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Result Date */}
              <div>
                <label className="text-sm font-medium">Result Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {resultData.resultDate ? format(resultData.resultDate, "dd-MM-yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={resultData.resultDate}
                      onSelect={(date) => handleResultUpdate('resultDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Result Status */}
              <div>
                <label className="text-sm font-medium">Result Status *</label>
                <Select 
                  value={resultData.resultStatus} 
                  onValueChange={(value) => handleResultUpdate('resultStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {pocTestResultStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Numeric Result */}
              <div>
                <label className="text-sm font-medium">Numeric Result</label>
                <Input
                  value={resultData.numericResult}
                  onChange={(e) => handleResultUpdate('numericResult', e.target.value)}
                  placeholder="Enter numeric result"
                />
              </div>

              {/* Measuring Unit */}
              <div>
                <label className="text-sm font-medium">Measuring Unit</label>
                <Input
                  value={resultData.measuringUnit || testInfo?.unit || ''}
                  onChange={(e) => handleResultUpdate('measuringUnit', e.target.value)}
                  placeholder={testInfo?.unit || 'Enter unit'}
                />
              </div>
            </div>

            {/* Result Comment */}
            <div>
              <label className="text-sm font-medium">Result Comment</label>
              <Textarea
                value={resultData.resultComment}
                onChange={(e) => handleResultUpdate('resultComment', e.target.value)}
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
          <DialogTitle className="text-xl font-semibold">
            {currentStep === 'entry' ? 'New Test Order' : 'Enter Test Results'}
          </DialogTitle>
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
                          Select Test *
                        </FormLabel>
                        <Select onValueChange={handleTestSelection} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {pocTestTypes.map((test) => (
                              <SelectItem key={test.id} value={test.id}>
                                {test.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Syphilis Test Subtype - Only show if syphilis_tests is selected */}
                  {form.watch('selectTest') === 'syphilis_tests' && (
                    <FormField
                      control={form.control}
                      name="syphilisSubtype"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Syphilis Test Type *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select test type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {syphilisTestSubtypes.map((subtype) => (
                                <SelectItem key={subtype.value} value={subtype.value}>
                                  {subtype.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}

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
                          Order Priority *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pocTestPriorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
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
                          Order Date *
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
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
                          Test Quantity *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter Test Quantity"
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
                          Sample Quantity *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter Sample Quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Test Information Display */}
                {selectedTestInfo && (
                  <div className="p-4 bg-blue-50 rounded border">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">{selectedTestInfo.name}</h4>
                        <p className="text-sm text-blue-700 mt-1">{selectedTestInfo.description}</p>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Unit: </span>{selectedTestInfo.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                          placeholder="Enter additional comments"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add To Cart
                  </Button>
                </div>
              </form>
            </Form>

            {/* Cart Display */}
            {testEntries.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-medium">Test Cart ({testEntries.length})</h3>
                <div className="space-y-2">
                  {testEntries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {entry.selectTest === 'syphilis_tests' && entry.syphilisSubtype 
                              ? syphilisTestSubtypes.find(s => s.value === entry.syphilisSubtype)?.label || entry.selectTest
                              : pocTestTypes.find(t => t.id === entry.selectTest)?.name || entry.selectTest}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {entry.orderPriority}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {entry.orderNumber} • {format(entry.orderDate, "MMM dd, yyyy")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                  <Button 
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                    onClick={proceedToResults}
                  >
                    Proceed to Results ({testEntries.length})
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              Enter results for the ordered tests. Fields marked with * are required.
            </div>
            
            {testEntries.map((entry, index) => (
              <TestResultEntryCard
                key={entry.id}
                entry={entry}
                index={index}
                onUpdateResult={(result) => updateTestResult(entry.id, result)}
              />
            ))}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('entry')}
              >
                Back to Order
              </Button>
              <Button onClick={saveTestResults}>
                Save All Results
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      
      {/* CDSS Modal */}
      <ClinicalDecisionSupportModal
        condition={currentCDSSCondition}
        isOpen={showCDSSModal}
        onClose={handleCDSSClose}
        onConfirm={() => {
          // Handle CDSS confirmation if needed
          handleCDSSClose();
        }}
      />
    </Dialog>
  );
}