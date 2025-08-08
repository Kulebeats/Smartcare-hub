import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInYears } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ribbon, TestTube, FileText } from "lucide-react";
import { HIVTestingCard } from "@/components/medical-record/hiv-testing-card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function HTSPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [hivTestingData, setHivTestingData] = useState(null);
  
  // Extract patientId from URL query parameters
  const urlParams = new URLSearchParams(location.split("?")[1]);
  const patientId = urlParams.get('patientId');
  
  // Fetch patient data from API
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['/api/patients', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }
      return response.json();
    },
    enabled: !!patientId
  });

  const handleSaveHIVTesting = (data: any) => {
    setHivTestingData(data);
    toast({
      title: "HIV Testing Data Saved",
      description: "HIV testing information has been successfully recorded.",
    });
  };

  const handleBackToServices = () => {
    if (patientId) {
      setLocation(`/service-selection?patientId=${patientId}`);
    } else {
      setLocation('/service-selection');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !patient) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">
              {error ? 'Failed to load patient information.' : 'No patient selected.'}
              Please return to patient search and try again.
            </p>
            <Button 
              onClick={() => setLocation('/client-search')}
              className="mt-4"
              variant="outline"
            >
              Return to Patient Search
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            onClick={handleBackToServices}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
          <Ribbon className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">HIV Testing Services (HTS)</h1>
        </div>

        {/* Patient Information Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <h3 className="text-lg font-semibold">{patient.firstName} {patient.surname}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-sm">
                    {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd-MMM-yyyy') : 'Unknown'} 
                    {patient.dateOfBirth && ` (${differenceInYears(new Date(), new Date(patient.dateOfBirth))}Y)`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Sex</p>
                  <p className="text-sm">{patient.sex || 'Unknown'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">Cellphone</p>
                  <p className="text-sm">{patient.cellphoneNumber || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">NUPIN</p>
                  <p className="text-sm">{patient.nupin || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">NRC</p>
                  <p className="text-sm">{patient.nrc || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Mother's Name</p>
                  <p className="text-sm">{patient.mothersName || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HIV Testing Services */}
        <div className="space-y-6">
          {/* HIV Testing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-500" />
                HIV Testing & Counseling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HIVTestingCard 
                onUpdate={handleSaveHIVTesting}
                data={hivTestingData}
              />
            </CardContent>
          </Card>

          {/* Additional HTS Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                HTS Counseling & Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Pre-Test Counseling</h4>
                    <p className="text-sm text-blue-700">
                      Comprehensive counseling about HIV testing, risk assessment, and prevention methods.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Post-Test Counseling</h4>
                    <p className="text-sm text-green-700">
                      Result disclosure, interpretation, and follow-up care planning based on test results.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Risk Assessment</h4>
                    <p className="text-sm text-purple-700">
                      Evaluation of individual risk factors and personalized prevention strategies.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Linkage to Care</h4>
                    <p className="text-sm text-orange-700">
                      Connection to appropriate care services based on test results and individual needs.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleBackToServices}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
          
          <Button 
            onClick={() => {
              toast({
                title: "HTS Session Complete",
                description: "HIV testing services session has been completed successfully.",
              });
              // Could navigate to another service or back to services
            }}
            className="flex items-center gap-2"
          >
            <Ribbon className="h-4 w-4" />
            Complete Session
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}