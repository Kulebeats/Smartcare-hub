import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, User, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { StandardANCAssessment } from '@/components/medical-record/standard-anc-assessment';
import { RapidAssessment } from '@/components/medical-record/rapid-assessment';

interface ANCFollowupPageProps {}

export default function ANCFollowupPage(): JSX.Element {
  const [, params] = useRoute('/patients/:patientId/anc/followup');
  const patientId = params?.patientId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock patient data for demo
  const patient = {
    id: patientId || 'demo-patient-123',
    first_name: 'Demo',
    last_name: 'Patient',
    date_of_birth: '1990-05-15',
    phone_number: '+260971234567'
  };

  // Mock ANC records
  const ancRecords = {
    records: [
      {
        id: '1',
        created_at: '2024-12-15T10:00:00Z',
        visit_number: 1,
        recommendations: ['Iron supplementation', 'Calcium supplementation']
      },
      {
        id: '2', 
        created_at: '2024-12-22T14:30:00Z',
        visit_number: 2,
        recommendations: ['Continue medications', 'Schedule next visit']
      }
    ]
  };

  const patientLoading = false;
  const recordsLoading = false;

  // Calculate current visit number
  const visitNumber = ancRecords?.records ? ancRecords.records.length + 1 : 1;
  const isFollowupVisit = visitNumber > 1;

  // Get last visit date for scheduling context
  const lastVisitDate = ancRecords?.records && ancRecords.records.length > 0 
    ? new Date(ancRecords.records[ancRecords.records.length - 1].created_at).toLocaleDateString()
    : null;

  // Mock save function for demo
  const saveAssessmentMutation = {
    mutate: (data: any) => {
      console.log('Saving assessment data:', data);
      toast({
        title: "ANC Follow-up Saved",
        description: `Visit ${visitNumber} assessment has been successfully recorded.`,
        variant: "success",
      });
    },
    isPending: false
  };

  if (patientLoading || recordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Patient not found</p>
          <Link href="/patients">
            <Button variant="outline">Back to Patients</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/patients/${patientId}`}>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Patient</span>
                </Button>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{patient.first_name} {patient.last_name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Visit {visitNumber}</span>
              </div>
              {lastVisitDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last visit: {lastVisitDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ANC Follow-up Assessment</h1>
              <p className="text-gray-600 mt-2">
                {isFollowupVisit 
                  ? `Follow-up visit ${visitNumber} for ${patient.first_name} ${patient.last_name}`
                  : `Initial ANC assessment for ${patient.first_name} ${patient.last_name}`
                }
              </p>
            </div>
            
            {/* Visit Status Indicator */}
            <div className="flex items-center space-x-2">
              {isFollowupVisit ? (
                <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Follow-up Visit</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Initial Visit</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visit Schedule Information */}
        {isFollowupVisit && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900">ANC Visit Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Current Visit:</span>
                  <span className="ml-2 text-blue-700">Contact {visitNumber}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Previous Visits:</span>
                  <span className="ml-2 text-blue-700">{visitNumber - 1} completed</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Last Visit:</span>
                  <span className="ml-2 text-blue-700">{lastVisitDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinical Assessment - Direct Display */}
        <div className="space-y-6">
            {/* Rapid Assessment - First section for follow-up visits */}
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Rapid Assessment - Visit {visitNumber}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Priority Check</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RapidAssessment
                  patientId={patientId!}
                  onComplete={(data) => {
                    console.log('Rapid assessment completed:', data);
                  }}
                />
              </CardContent>
            </Card>

            {/* Full Clinical Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Comprehensive Assessment - Visit {visitNumber}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Follow-up</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Includes Previous Behavior & Symptom Persistence Assessment
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StandardANCAssessment
                  patientId={patientId!}
                  onSave={(data) => {
                    saveAssessmentMutation.mutate(data);
                  }}
                  isFollowupVisit={true}
                  visitNumber={visitNumber}
                  visitType="scheduled_anc"
                />
              </CardContent>
            </Card>

          {/* Visit History Section */}
          <Card>
            <CardHeader>
              <CardTitle>Previous ANC Visits</CardTitle>
            </CardHeader>
            <CardContent>
              {ancRecords?.records && ancRecords.records.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ancRecords.records.map((record: any, index: number) => (
                    <div key={record.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Visit {index + 1}</h4>
                        <span className="text-xs text-gray-600">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Assessment completed</p>
                        {record.recommendations && (
                          <p className="mt-1">
                            Recommendations: {record.recommendations.length} items
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No previous ANC visits recorded</p>
                  <p className="text-xs mt-1">This will be the first ANC contact</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}