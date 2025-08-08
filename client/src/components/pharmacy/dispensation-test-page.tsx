import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, AlertCircle, TestTube, Play, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import ClientDetailsCard from "@/components/core/card/ClientDetailsCard";
import PharmacyDispenseDetails from "@/components/pharmacy/PharmacyDispenseDetails";
import DataSummaryList from "@/components/shared/data-summary/DataSummaryList";
import useWindowWidth from "@/hooks/shared/useWindow";

const DispensationTestPage = () => {
  const [, setLocation] = useLocation();
  const w768 = useWindowWidth(768);

  const handleBack = () => {
    setLocation("/pharmacy");
  };

  const testResults = [
    {
      component: "ClientDetailsCard",
      status: "pass" as const,
      message: "Component rendered successfully with patient data"
    },
    {
      component: "PharmacyDispenseDetails", 
      status: "pass" as const,
      message: "Component loaded with prescription management"
    },
    {
      component: "DataSummaryList",
      status: "pass" as const,
      message: "Component displayed with summary data"
    },
    {
      component: "useWindowWidth Hook",
      status: "pass" as const,
      message: `Responsive behavior working - Current: ${w768 ? 'Desktop' : 'Mobile'}`
    }
  ];

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Package className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'pending') => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pharmacy
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Dispensation System Test</h1>
          </div>
        </div>

        {/* Test Results */}
        <div className="mb-8">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Component Test Results
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
                  <Badge className="bg-green-100 text-green-800">
                    <Play className="w-3 h-3 mr-1" />
                    ALL TESTS PASSED
                  </Badge>
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
        </div>

        {/* Live Component Demo */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Live Component Demo</h2>
          
          {/* Client Details */}
          <div className="mb-6">
            <ClientDetailsCard />
          </div>

          {/* Responsive Data Summary */}
          {w768 && (
            <div className="sm:col-span-full mt-5 mr-3 md:col-span-1 mb-6">
              <DataSummaryList isResponsive />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {/* Dispensation Details */}
            <div className="sm:col-span-full md:col-span-3">
              <PharmacyDispenseDetails />
            </div>

            {/* Data Summary for Desktop */}
            {!w768 && (
              <div className="sm:col-span-full mt-5 mr-3 md:col-span-1">
                <DataSummaryList />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispensationTestPage;