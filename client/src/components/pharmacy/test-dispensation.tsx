import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, AlertCircle, TestTube } from 'lucide-react';

interface TestResult {
  component: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}

const TestDispensation = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Check localStorage prescriptions
    try {
      const prescriptions = localStorage.getItem('prescriptions');
      if (prescriptions) {
        const parsed = JSON.parse(prescriptions);
        results.push({
          component: 'LocalStorage Prescriptions',
          status: Array.isArray(parsed) ? 'pass' : 'fail',
          message: `Found ${Array.isArray(parsed) ? parsed.length : 0} prescriptions`
        });
      } else {
        results.push({
          component: 'LocalStorage Prescriptions',
          status: 'fail',
          message: 'No prescriptions found in localStorage'
        });
      }
    } catch (error) {
      results.push({
        component: 'LocalStorage Prescriptions',
        status: 'fail',
        message: 'Error reading localStorage'
      });
    }

    // Test 2: Check component imports
    try {
      const ClientDetailsCard = await import('@/components/core/card/ClientDetailsCard');
      results.push({
        component: 'ClientDetailsCard',
        status: ClientDetailsCard.default ? 'pass' : 'fail',
        message: ClientDetailsCard.default ? 'Component loaded successfully' : 'Component failed to load'
      });
    } catch (error) {
      results.push({
        component: 'ClientDetailsCard',
        status: 'fail',
        message: 'Failed to import component'
      });
    }

    try {
      const PharmacyDispenseDetails = await import('@/components/pharmacy/PharmacyDispenseDetails');
      results.push({
        component: 'PharmacyDispenseDetails',
        status: PharmacyDispenseDetails.default ? 'pass' : 'fail',
        message: PharmacyDispenseDetails.default ? 'Component loaded successfully' : 'Component failed to load'
      });
    } catch (error) {
      results.push({
        component: 'PharmacyDispenseDetails',
        status: 'fail',
        message: 'Failed to import component'
      });
    }

    try {
      const DataSummaryList = await import('@/components/shared/data-summary/DataSummaryList');
      results.push({
        component: 'DataSummaryList',
        status: DataSummaryList.default ? 'pass' : 'fail',
        message: DataSummaryList.default ? 'Component loaded successfully' : 'Component failed to load'
      });
    } catch (error) {
      results.push({
        component: 'DataSummaryList',
        status: 'fail',
        message: 'Failed to import component'
      });
    }

    // Test 3: Check hook
    try {
      const useWindowWidth = await import('@/hooks/shared/useWindow');
      results.push({
        component: 'useWindowWidth Hook',
        status: useWindowWidth.default ? 'pass' : 'fail',
        message: useWindowWidth.default ? 'Hook loaded successfully' : 'Hook failed to load'
      });
    } catch (error) {
      results.push({
        component: 'useWindowWidth Hook',
        status: 'fail',
        message: 'Failed to import hook'
      });
    }

    // Test 4: Check window width detection
    try {
      const width = window.innerWidth;
      results.push({
        component: 'Window Width Detection',
        status: width > 0 ? 'pass' : 'fail',
        message: `Current window width: ${width}px`
      });
    } catch (error) {
      results.push({
        component: 'Window Width Detection',
        status: 'fail',
        message: 'Failed to detect window width'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Package className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Dispensation System Test Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Tests: {testResults.length} | 
              Pass: {testResults.filter(r => r.status === 'pass').length} | 
              Fail: {testResults.filter(r => r.status === 'fail').length}
            </span>
            <Button onClick={runTests} disabled={isRunning} size="sm">
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </div>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium text-sm">{result.component}</p>
                    <p className="text-xs text-gray-600">{result.message}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(result.status)}>
                  {result.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestDispensation;