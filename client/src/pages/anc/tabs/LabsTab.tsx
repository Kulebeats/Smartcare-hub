/**
 * Labs & Tests Tab Component
 * Handles laboratory investigations and test results
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flask, AlertTriangle, CheckCircle, Calendar, Loader2 } from 'lucide-react';
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { safeLog } from '@/utils/anc/safe-logger';

interface LabsTabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
  onBack?: () => void;
}

interface LabTest {
  id: string;
  name: string;
  category: 'routine' | 'special' | 'imaging';
  required: boolean;
  trimesterSpecific?: number[];
  normalRange?: string;
}

const LAB_TESTS: LabTest[] = [
  // Routine tests
  { id: 'hb', name: 'Hemoglobin (Hb)', category: 'routine', required: true, normalRange: '11-16 g/dL' },
  { id: 'bloodGroup', name: 'Blood Group & Rh', category: 'routine', required: true },
  { id: 'urinalysis', name: 'Urinalysis', category: 'routine', required: true },
  { id: 'glucose', name: 'Random Blood Glucose', category: 'routine', required: false, normalRange: '70-140 mg/dL' },
  { id: 'vdrl', name: 'VDRL/RPR (Syphilis)', category: 'routine', required: true },
  { id: 'hiv', name: 'HIV Test', category: 'routine', required: true },
  { id: 'hepB', name: 'Hepatitis B (HBsAg)', category: 'routine', required: false },
  { id: 'hepC', name: 'Hepatitis C', category: 'routine', required: false },
  
  // Special tests
  { id: 'ogtt', name: 'Oral Glucose Tolerance Test', category: 'special', required: false, trimesterSpecific: [2] },
  { id: 'malaria', name: 'Malaria Test', category: 'special', required: false },
  { id: 'tb', name: 'TB Screening', category: 'special', required: false },
  { id: 'cd4', name: 'CD4 Count', category: 'special', required: false },
  { id: 'viralLoad', name: 'Viral Load', category: 'special', required: false },
  
  // Imaging
  { id: 'ultrasound', name: 'Obstetric Ultrasound', category: 'imaging', required: false, trimesterSpecific: [1, 2, 3] },
  { id: 'xray', name: 'Chest X-Ray', category: 'imaging', required: false }
];

export const LabsTab: React.FC<LabsTabProps> = ({
  patientId,
  encounterId,
  onNext,
  onBack
}) => {
  const {
    state,
    saveEncounter,
    currentTrimester
  } = useAncEncounter({ patientId, encounterId });
  
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testDates, setTestDates] = useState<Record<string, string>>({});
  const [pendingTests, setPendingTests] = useState<Set<string>>(new Set());
  
  const handleTestToggle = (testId: string) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
      // Remove from pending if unchecked
      const newPending = new Set(pendingTests);
      newPending.delete(testId);
      setPendingTests(newPending);
    } else {
      newSelected.add(testId);
      // Add to pending by default
      const newPending = new Set(pendingTests);
      newPending.add(testId);
      setPendingTests(newPending);
    }
    setSelectedTests(newSelected);
  };
  
  const handleResultEntry = (testId: string, field: string, value: any) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value
      }
    }));
    
    // Remove from pending if result entered
    if (value) {
      const newPending = new Set(pendingTests);
      newPending.delete(testId);
      setPendingTests(newPending);
    }
  };
  
  const handleTestDateChange = (testId: string, date: string) => {
    setTestDates(prev => ({
      ...prev,
      [testId]: date
    }));
  };
  
  const getTestsByCategory = (category: string) => {
    return LAB_TESTS.filter(test => {
      if (test.category !== category) return false;
      if (test.trimesterSpecific && currentTrimester) {
        return test.trimesterSpecific.includes(currentTrimester);
      }
      return true;
    });
  };
  
  const handleSaveAndNext = async () => {
    const labData = {
      orderedTests: Array.from(selectedTests),
      pendingTests: Array.from(pendingTests),
      completedTests: Object.keys(testResults).filter(id => 
        testResults[id] && !pendingTests.has(id)
      ),
      results: testResults,
      testDates
    };
    
    safeLog.clinical('Lab tests saved', {
      patientId,
      encounterId,
      orderedCount: selectedTests.size,
      pendingCount: pendingTests.size,
      completedCount: labData.completedTests.length
    });
    
    const result = await saveEncounter();
    if (result.success) {
      onNext?.();
    }
  };
  
  const requiredTestsMissing = LAB_TESTS
    .filter(test => test.required && !selectedTests.has(test.id))
    .map(test => test.name);
  
  return (
    <div className="space-y-6">
      {/* Required Tests Alert */}
      {requiredTestsMissing.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Required tests not ordered:</strong>
            <ul className="mt-2 list-disc list-inside text-sm">
              {requiredTestsMissing.map(test => (
                <li key={test}>{test}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Routine Laboratory Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flask className="w-5 h-5 text-blue-600" />
            <span>Routine Laboratory Tests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTestsByCategory('routine').map(test => (
              <div key={test.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={test.id}
                    checked={selectedTests.has(test.id)}
                    onCheckedChange={() => handleTestToggle(test.id)}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={test.id} className="flex items-center space-x-2">
                      <span>{test.name}</span>
                      {test.required && (
                        <span className="text-xs text-red-600 font-semibold">[REQUIRED]</span>
                      )}
                      {test.normalRange && (
                        <span className="text-xs text-gray-500">Normal: {test.normalRange}</span>
                      )}
                    </Label>
                    
                    {selectedTests.has(test.id) && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        <div>
                          <Label className="text-xs">Test Date</Label>
                          <Input
                            type="date"
                            value={testDates[test.id] || ''}
                            onChange={(e) => handleTestDateChange(test.id, e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        
                        {test.id === 'hb' && (
                          <div>
                            <Label className="text-xs">Result (g/dL)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="5"
                              max="20"
                              value={testResults[test.id]?.value || ''}
                              onChange={(e) => handleResultEntry(test.id, 'value', e.target.value)}
                              placeholder="e.g., 12.5"
                            />
                          </div>
                        )}
                        
                        {test.id === 'bloodGroup' && (
                          <>
                            <div>
                              <Label className="text-xs">Blood Group</Label>
                              <Select 
                                value={testResults[test.id]?.group || ''}
                                onValueChange={(value) => handleResultEntry(test.id, 'group', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="AB">AB</SelectItem>
                                  <SelectItem value="O">O</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Rh Factor</Label>
                              <Select 
                                value={testResults[test.id]?.rh || ''}
                                onValueChange={(value) => handleResultEntry(test.id, 'rh', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="positive">Positive (+)</SelectItem>
                                  <SelectItem value="negative">Negative (-)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        
                        {(test.id === 'hiv' || test.id === 'vdrl' || test.id === 'hepB' || test.id === 'hepC') && (
                          <div>
                            <Label className="text-xs">Result</Label>
                            <Select 
                              value={testResults[test.id]?.result || ''}
                              onValueChange={(value) => handleResultEntry(test.id, 'result', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="negative">Negative</SelectItem>
                                <SelectItem value="positive">Positive</SelectItem>
                                <SelectItem value="indeterminate">Indeterminate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {test.id === 'urinalysis' && (
                          <>
                            <div>
                              <Label className="text-xs">Protein</Label>
                              <Select 
                                value={testResults[test.id]?.protein || ''}
                                onValueChange={(value) => handleResultEntry(test.id, 'protein', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="negative">Negative</SelectItem>
                                  <SelectItem value="trace">Trace</SelectItem>
                                  <SelectItem value="1+">1+</SelectItem>
                                  <SelectItem value="2+">2+</SelectItem>
                                  <SelectItem value="3+">3+</SelectItem>
                                  <SelectItem value="4+">4+</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Glucose</Label>
                              <Select 
                                value={testResults[test.id]?.glucose || ''}
                                onValueChange={(value) => handleResultEntry(test.id, 'glucose', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="negative">Negative</SelectItem>
                                  <SelectItem value="trace">Trace</SelectItem>
                                  <SelectItem value="1+">1+</SelectItem>
                                  <SelectItem value="2+">2+</SelectItem>
                                  <SelectItem value="3+">3+</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        
                        {test.id === 'glucose' && (
                          <div>
                            <Label className="text-xs">Result (mg/dL)</Label>
                            <Input
                              type="number"
                              min="50"
                              max="500"
                              value={testResults[test.id]?.value || ''}
                              onChange={(e) => handleResultEntry(test.id, 'value', e.target.value)}
                              placeholder="e.g., 95"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={pendingTests.has(test.id)}
                            onCheckedChange={(checked) => {
                              const newPending = new Set(pendingTests);
                              if (checked) {
                                newPending.add(test.id);
                              } else {
                                newPending.delete(test.id);
                              }
                              setPendingTests(newPending);
                            }}
                          />
                          <Label className="text-xs">Pending</Label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedTests.has(test.id) && (
                    <div className="mt-1">
                      {pendingTests.has(test.id) ? (
                        <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                      ) : testResults[test.id] ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Special Investigations */}
      <Card>
        <CardHeader>
          <CardTitle>Special Investigations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTestsByCategory('special').map(test => (
              <div key={test.id} className="flex items-center space-x-3">
                <Checkbox
                  id={test.id}
                  checked={selectedTests.has(test.id)}
                  onCheckedChange={() => handleTestToggle(test.id)}
                />
                <Label htmlFor={test.id} className="flex-1">{test.name}</Label>
                {selectedTests.has(test.id) && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={testDates[test.id] || ''}
                      onChange={(e) => handleTestDateChange(test.id, e.target.value)}
                      className="w-32"
                    />
                    <Checkbox
                      checked={pendingTests.has(test.id)}
                      onCheckedChange={(checked) => {
                        const newPending = new Set(pendingTests);
                        if (checked) {
                          newPending.add(test.id);
                        } else {
                          newPending.delete(test.id);
                        }
                        setPendingTests(newPending);
                      }}
                    />
                    <span className="text-xs">Pending</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Imaging Studies */}
      <Card>
        <CardHeader>
          <CardTitle>Imaging Studies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTestsByCategory('imaging').map(test => (
              <div key={test.id} className="flex items-center space-x-3">
                <Checkbox
                  id={test.id}
                  checked={selectedTests.has(test.id)}
                  onCheckedChange={() => handleTestToggle(test.id)}
                />
                <Label htmlFor={test.id} className="flex-1">{test.name}</Label>
                {selectedTests.has(test.id) && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={testDates[test.id] || ''}
                      onChange={(e) => handleTestDateChange(test.id, e.target.value)}
                      className="w-32"
                    />
                    <Checkbox
                      checked={pendingTests.has(test.id)}
                      onCheckedChange={(checked) => {
                        const newPending = new Set(pendingTests);
                        if (checked) {
                          newPending.add(test.id);
                        } else {
                          newPending.delete(test.id);
                        }
                        setPendingTests(newPending);
                      }}
                    />
                    <span className="text-xs">Pending</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Test Summary */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{selectedTests.size}</div>
              <div className="text-sm text-gray-600">Tests Ordered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{pendingTests.size}</div>
              <div className="text-sm text-gray-600">Pending Results</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(testResults).filter(id => 
                  testResults[id] && !pendingTests.has(id)
                ).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleSaveAndNext}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Save & Next
        </Button>
      </div>
    </div>
  );
};