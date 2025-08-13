import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, Pill, TestTube, Heart, Syringe } from 'lucide-react';

interface RecentDataSummaryProps {
  summaryData: {
    vitals?: {
      weight?: number;
      height?: number;
      bmi?: number;
      bp?: string;
      temperature?: number;
    };
    gestationalAge?: number;
    htsStatus?: string;
    testDate?: string;
    testResult?: string;
    hivType?: string;
    diagnoses?: string[];
    activeMedications?: string[];
    treatmentPlan?: string;
    nextAppointment?: string;
  };
}

export function RecentDataSummaryCard({ summaryData }: RecentDataSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Vitals Card */}
      <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 enhanced-card">
        <CardHeader className="pb-2 pt-3 px-4 enhanced-card-header">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Weight(kg):</span>
              <span className="font-medium text-gray-900">{summaryData.vitals?.weight || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Height(cm):</span>
              <span className="font-medium text-gray-900">{summaryData.vitals?.height || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">BMI:</span>
              <span className="font-medium text-gray-900">{summaryData.vitals?.bmi?.toFixed(1) || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">BP:</span>
              <span className="font-medium text-gray-900">{summaryData.vitals?.bp || '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HTS Status Card */}
      <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 enhanced-card">
        <CardHeader className="pb-2 pt-3 px-4 enhanced-card-header">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <TestTube className="w-4 h-4 text-green-500" />
            HTS Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Test Date:</span>
              <span className="font-medium text-gray-900">{summaryData.testDate || 'Not tested'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Test Result:</span>
              <span className={`font-medium ${
                summaryData.testResult === 'Positive' ? 'text-red-600' : 
                summaryData.testResult === 'Negative' ? 'text-green-600' : 
                'text-gray-900'
              }`}>
                {summaryData.testResult || '-'}
              </span>
            </div>
            {summaryData.hivType && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">HIV Type:</span>
                <span className="font-medium text-gray-900">{summaryData.hivType}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Card - Only show if diagnoses exist */}
      {summaryData.diagnoses && summaryData.diagnoses.length > 0 && (
        <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <div className="space-y-2">
              <div className="text-xs text-gray-600">NTS / ICD 11:</div>
              <ul className="list-disc list-inside text-xs text-gray-700">
                {summaryData.diagnoses.map((diagnosis, index) => (
                  <li key={index}>{diagnosis}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Plan Card */}
      <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-blue-500" />
            Treatment Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Treatment Plan:</span>
              <span className="font-medium text-gray-900">
                {summaryData.treatmentPlan || 'No active treatment plan'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Plan Card - Only show if medications exist */}
      {summaryData.activeMedications && summaryData.activeMedications.length > 0 && (
        <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-orange-500" />
              Medication Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <div className="space-y-2">
              <div className="text-xs text-gray-600">LAR Connected:</div>
              <ul className="list-disc list-inside text-xs text-gray-700">
                {summaryData.activeMedications.map((medication, index) => (
                  <li key={index}>{medication}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investigation Card - Always show as per screenshot */}
      <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <TestTube className="w-4 h-4 text-blue-500" />
            Investigation
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-gray-900">
                {summaryData.investigations || 'Pending'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Appointment Card - Only show if appointment exists */}
      {summaryData.nextAppointment && (
        <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Next Visit
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Scheduled:</span>
                <span className="font-medium text-blue-700">{summaryData.nextAppointment}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}