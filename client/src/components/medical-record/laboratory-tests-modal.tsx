import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TestTube, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LabTestResult {
  id: string;
  testName: string;
  result: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  dateOrdered: string;
  dateCompleted?: string;
  unit: string;
  orderedBy: string;
  notes?: string;
}

interface LaboratoryTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  defaultTab?: 'routine' | 'specialized';
}

export default function LaboratoryTestsModal({ isOpen, onClose, onSave, initialData, defaultTab = 'routine' }: LaboratoryTestsModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [labResults, setLabResults] = useState<LabTestResult[]>([
    {
      id: '1',
      testName: 'Hemoglobin',
      result: '',
      referenceRange: '≥11.0 g/dL',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: 'g/dL',
      orderedBy: 'Current User'
    },
    {
      id: '2',
      testName: 'Syphilis Screening (VDRL/RPR)',
      result: '',
      referenceRange: 'Non-reactive',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: '',
      orderedBy: 'Current User'
    },
    {
      id: '3',
      testName: 'HIV Testing',
      result: '',
      referenceRange: 'Non-reactive',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: '',
      orderedBy: 'Current User'
    },
    {
      id: '4',
      testName: 'Urine Analysis - Protein',
      result: '',
      referenceRange: 'Negative/Trace',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: '',
      orderedBy: 'Current User'
    },
    {
      id: '5',
      testName: 'Blood Group & Rh Factor',
      result: '',
      referenceRange: 'ABO/Rh typing',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: '',
      orderedBy: 'Current User'
    }
  ]);

  const [specializedTests, setSpecializedTests] = useState<LabTestResult[]>([
    {
      id: 'sp1',
      testName: 'Oral Glucose Tolerance Test (OGTT)',
      result: '',
      referenceRange: 'Fasting: <92 mg/dL, 1hr: <180 mg/dL, 2hr: <153 mg/dL',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: 'mg/dL',
      orderedBy: 'Current User'
    },
    {
      id: 'sp2',
      testName: 'Hepatitis B Surface Antigen',
      result: '',
      referenceRange: 'Non-reactive',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: '',
      orderedBy: 'Current User'
    },
    {
      id: 'sp3',
      testName: 'Complete Blood Count (CBC)',
      result: '',
      referenceRange: 'WBC: 4-11, PLT: 150-450',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: '×10³/μL',
      orderedBy: 'Current User'
    },
    {
      id: 'sp4',
      testName: 'Liver Function Tests',
      result: '',
      referenceRange: 'ALT: <40 U/L, AST: <40 U/L',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: 'U/L',
      orderedBy: 'Current User'
    },
    {
      id: 'sp5',
      testName: 'Renal Function Panel',
      result: '',
      referenceRange: 'Creatinine: 0.6-1.1 mg/dL',
      status: 'pending',
      dateOrdered: new Date().toISOString().split('T')[0],
      unit: 'mg/dL',
      orderedBy: 'Current User'
    }
  ]);

  const updateTestResult = (testId: string, field: string, value: string, isSpecialized = false) => {
    const updateFunction = isSpecialized ? setSpecializedTests : setLabResults;
    const currentTests = isSpecialized ? specializedTests : labResults;
    
    updateFunction(currentTests.map(test => 
      test.id === testId 
        ? { 
            ...test, 
            [field]: value,
            status: field === 'result' && value ? determineStatus(test.testName, value) : test.status,
            dateCompleted: field === 'result' && value ? new Date().toISOString().split('T')[0] : test.dateCompleted
          }
        : test
    ));
  };

  const determineStatus = (testName: string, result: string): 'normal' | 'abnormal' | 'critical' => {
    const resultLower = result.toLowerCase();
    
    // Hemoglobin status
    if (testName === 'Hemoglobin') {
      const hb = parseFloat(result);
      if (hb < 7.0) return 'critical';
      if (hb < 11.0) return 'abnormal';
      return 'normal';
    }
    
    // HIV and Syphilis status
    if (testName.includes('HIV') || testName.includes('Syphilis')) {
      if (resultLower.includes('positive') || resultLower.includes('reactive')) return 'critical';
      return 'normal';
    }
    
    // Protein in urine
    if (testName.includes('Protein')) {
      if (resultLower.includes('3+') || resultLower.includes('4+')) return 'critical';
      if (resultLower.includes('1+') || resultLower.includes('2+')) return 'abnormal';
      return 'normal';
    }
    
    // OGTT
    if (testName.includes('OGTT')) {
      const glucose = parseFloat(result);
      if (glucose >= 200) return 'critical';
      if (glucose >= 140) return 'abnormal';
      return 'normal';
    }
    
    return 'normal';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'abnormal': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      normal: 'bg-green-100 text-green-800',
      abnormal: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSave = () => {
    const labData = {
      routineTests: labResults,
      specializedTests: specializedTests,
      lastUpdated: new Date().toISOString()
    };
    
    onSave(labData);
    toast({
      title: "Laboratory Tests Saved",
      description: "All laboratory test results have been saved successfully.",
    });
    onClose();
  };

  const TestResultCard = ({ test, isSpecialized = false }: { test: LabTestResult; isSpecialized?: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <TestTube className="w-4 h-4 mr-2 text-blue-600" />
            {test.testName}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon(test.status)}
            {getStatusBadge(test.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Test Result</label>
            <input
              type="text"
              value={test.result}
              onChange={(e) => updateTestResult(test.id, 'result', e.target.value, isSpecialized)}
              placeholder="Enter result..."
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            {test.unit && (
              <span className="text-xs text-gray-500 mt-1">Unit: {test.unit}</span>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Completed</label>
            <input
              type="date"
              value={test.dateCompleted || ''}
              onChange={(e) => updateTestResult(test.id, 'dateCompleted', e.target.value, isSpecialized)}
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Reference Range</label>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {test.referenceRange}
          </div>
        </div>
        
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Clinical Notes</label>
          <textarea
            value={test.notes || ''}
            onChange={(e) => updateTestResult(test.id, 'notes', e.target.value, isSpecialized)}
            placeholder="Add clinical interpretation or notes..."
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-blue-600" />
            Laboratory Tests & Results Management
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'routine' | 'specialized')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routine">Routine Tests</TabsTrigger>
            <TabsTrigger value="specialized">Specialized Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="routine" className="mt-4">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Mandatory First Contact Tests</h3>
                <p className="text-sm text-blue-700">
                  These tests are required for all first ANC visits according to WHO guidelines.
                </p>
              </div>
              
              {labResults.map(test => (
                <TestResultCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specialized" className="mt-4">
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">Specialized Diagnostic Tests</h3>
                <p className="text-sm text-purple-700">
                  Additional tests based on clinical indication, risk factors, or gestational age.
                </p>
              </div>
              
              {specializedTests.map(test => (
                <TestResultCard key={test.id} test={test} isSpecialized={true} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6 py-2"
          >
            Close
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6 py-2"
          >
            Save Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}