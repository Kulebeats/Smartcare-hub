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
    <Card className="border-2 border-blue-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <span>Recent Data Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vitals Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <Heart className="w-4 h-4 text-red-500" />
            Vitals
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Weight(kg):</span>
              <span className="ml-2 font-medium">{summaryData.vitals?.weight || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600">Height(cm):</span>
              <span className="ml-2 font-medium">{summaryData.vitals?.height || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600">BMI:</span>
              <span className="ml-2 font-medium">{summaryData.vitals?.bmi?.toFixed(1) || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600">BP:</span>
              <span className="ml-2 font-medium">{summaryData.vitals?.bp || '-'}</span>
            </div>
          </div>
        </div>

        {/* HTS Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <TestTube className="w-4 h-4 text-green-500" />
            HTS Status
          </div>
          <div className="text-sm">
            <div>
              <span className="text-gray-600">Test Date:</span>
              <span className="ml-2 font-medium">{summaryData.testDate || 'Not tested'}</span>
            </div>
            <div>
              <span className="text-gray-600">Test Result:</span>
              <span className={`ml-2 font-medium ${
                summaryData.testResult === 'Positive' ? 'text-red-600' : 
                summaryData.testResult === 'Negative' ? 'text-green-600' : 
                'text-gray-600'
              }`}>
                {summaryData.testResult || '-'}
              </span>
            </div>
            {summaryData.hivType && (
              <div>
                <span className="text-gray-600">HIV Type:</span>
                <span className="ml-2 font-medium">{summaryData.hivType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        {summaryData.diagnoses && summaryData.diagnoses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Activity className="w-4 h-4 text-purple-500" />
              Diagnosis
            </div>
            <div className="text-sm">
              <div className="text-gray-600 mb-1">NTS / ICD 11:</div>
              <ul className="list-disc list-inside text-xs text-gray-700">
                {summaryData.diagnoses.map((diagnosis, index) => (
                  <li key={index}>{diagnosis}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Treatment Plan */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <Syringe className="w-4 h-4 text-blue-500" />
            Treatment Plan
          </div>
          <div className="text-sm">
            <div className="text-gray-600">Treatment Plan:</div>
            <div className="text-xs text-gray-700 mt-1">
              {summaryData.treatmentPlan || 'No active treatment plan'}
            </div>
          </div>
        </div>

        {/* Medication Plan */}
        {summaryData.activeMedications && summaryData.activeMedications.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Pill className="w-4 h-4 text-orange-500" />
              Medication Plan
            </div>
            <div className="text-sm">
              <div className="text-gray-600 mb-1">LAR Connected:</div>
              <ul className="list-disc list-inside text-xs text-gray-700">
                {summaryData.activeMedications.map((medication, index) => (
                  <li key={index}>{medication}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Next Appointment */}
        {summaryData.nextAppointment && (
          <div className="p-2 bg-blue-50 rounded">
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">
                Next Visit: {summaryData.nextAppointment}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}