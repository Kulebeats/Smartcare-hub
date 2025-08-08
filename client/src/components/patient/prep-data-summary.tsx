
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DataCategory = 'vitals' | 'hts' | 'diagnosis' | 'treatment';

interface DataSummaryProps {
  category: DataCategory;
  title: string;
  data: Record<string, string | number>;
  icon?: React.ReactNode;
}

export function DataSummaryCard({ category, title, data, icon }: DataSummaryProps) {
  return (
    <div className="data-summary-card">
      <div className="data-summary-header">
        <div className="data-summary-title">
          {icon}
          {title}
        </div>
        <button className="text-xs text-[#0072BC] hover:underline">
          Preview
        </button>
      </div>
      <div className="data-summary-content">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="data-summary-item">
            <span className="data-summary-label">{key}</span>
            <span className="data-summary-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PrepDataSummary() {
  const vitalsData = {
    'Weight(kg)': '45',
    'Height(cm)': '165',
    'BMI': '16.53'
  };
  
  const htsData = {
    'Test Date': '8-Apr-2025',
    'Test Result': 'Negative',
    'HIV Type': ''
  };
  
  const diagnosisData = {
    'NTD': 'Uncomplicated malaria',
    'ICD 11': ''
  };
  
  const treatmentData = {
    'Treatment Plan': ''
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-[#0072BC]">Recent Data Summary</h3>
      
      <DataSummaryCard 
        category="vitals" 
        title="Vitals" 
        data={vitalsData}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
            <circle cx="20" cy="10" r="2"></circle>
          </svg>
        }
      />
      
      <DataSummaryCard 
        category="hts" 
        title="HTS Status" 
        data={htsData}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="m8 14 1-1 2 2 5-5 1 1-6 6Z"></path>
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="M22 7H2"></path>
          </svg>
        }
      />
      
      <DataSummaryCard 
        category="diagnosis" 
        title="Diagnosis" 
        data={diagnosisData}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="m3 8 4-4 4 4"></path>
            <path d="M7 4v16"></path>
            <path d="m21 16-4 4-4-4"></path>
            <path d="M17 20V4"></path>
          </svg>
        }
      />
      
      <DataSummaryCard 
        category="treatment" 
        title="Treatment Plan" 
        data={treatmentData}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M19 10V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"></path>
            <path d="M21 15H13"></path>
            <path d="m16 10-2 2 2 2"></path>
            <path d="M16 18H7"></path>
            <path d="M7 14h2"></path>
            <path d="M7 10h4"></path>
          </svg>
        }
      />
    </div>
  );
}
