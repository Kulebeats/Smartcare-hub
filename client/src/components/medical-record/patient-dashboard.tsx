import React, { useState, ReactNode } from 'react';
import { Shield, Pill, Activity, Heart, Folder, BarChart2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { RiskAssessmentVisualization } from "@/components/patient/risk-assessment-visualization";
import { RiskAssessmentDialog } from "@/components/patient/risk-assessment-dialog";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
}

function ServiceCard({ icon, title, onClick }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-100 transition duration-200" onClick={onClick}>
      <div className="flex flex-col items-center text-center">
        <div className="text-blue-500 mb-3">{icon}</div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
    </div>
  );
}

interface PatientInfoProps {
  patientName: string;
  patientId: string;
  dob: string;
  sex: string;
  cellphone: string;
  nupn: string;
  nrc: string;
  artNumber: string;
}

function PatientInfo({ patientName, patientId, dob, sex, cellphone, nupn, nrc, artNumber }: PatientInfoProps) {
  return (
    <div className="patient-info-card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-[#0072BC]">{patientName}</h2>
          <span className="text-sm text-gray-500">ID: {patientId}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-8 px-3">View History</Button>
          <Button size="sm" variant="default" className="text-xs h-8 px-3 bg-[#00A651] hover:bg-[#008541]">Actions</Button>
        </div>
      </div>
      <div className="patient-info-grid">
        <div className="patient-info-item">
          <p className="patient-info-label">Date of Birth</p>
          <p className="patient-info-value"><span className="text-[#0072BC]">📅</span> {dob}</p>
        </div>
        <div className="patient-info-item">
          <p className="patient-info-label">Sex</p>
          <p className="patient-info-value"><span className="text-[#0072BC]">⚧</span> {sex}</p>
        </div>
        <div className="patient-info-item">
          <p className="patient-info-label">Cellphone</p>
          <p className="patient-info-value"><span className="text-[#0072BC]">📱</span> {cellphone}</p>
        </div>
        <div className="patient-info-item">
          <p className="patient-info-label">NUPN</p>
          <p className="patient-info-value"><span className="text-[#0072BC]">🆔</span> {nupn}</p>
        </div>
        <div className="patient-info-item">
          <p className="patient-info-label">NRC</p>
          <p className="patient-info-value"><span className="text-[#0072BC]">🪪</span> {nrc}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium">ART Number</p>
          <p className="flex items-center"><span className="mr-1">🏥</span> {artNumber}</p>
        </div>
      </div>
    </div>
  );
}

// Sample patient data that includes medical test information
const samplePatientData = {
  patientDetails: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1985-03-30",
    sex: "Male",
  },
  medicalTests: {
    cd4Count: 350,
    viralLoad: 900,
    alt: 60,
    ast: 55,
    creatinine: 1.1,
  },
  coMorbidities: {
    tuberculosis: false,
    diabetesMellitus: true,
    hypertension: false,
    mentalIllness: false,
    renalDisease: false,
    liverDisease: false,
    stroke: false,
    cardiovascularDisease: false,
    seizures: false,
    allergies: true
  }
};

export function PatientDashboard() {
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  
  const handleServiceSelection = (service: string) => {
    console.log(`Selected service: ${service}`);
    // Add your service selection logic here
  };

  return (
    <div className="space-y-6">
      <PatientInfo 
        patientName="John Doe" 
        patientId="12345" 
        dob="30-Mar-1985 (39y)" 
        sex="Male" 
        cellphone="+260 987654321" 
        nupn="00498-05300-8" 
        nrc="272222/22/1" 
        artNumber="987654463245332"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-sm overflow-y-auto max-h-[600px]">
            <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 pb-2">Risk Assessment</h2>
            <RiskAssessmentVisualization 
              patientData={samplePatientData} 
              showDetails={false}
              onViewFullReport={() => setShowRiskDialog(true)}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white p-4 rounded-lg shadow-sm overflow-y-auto max-h-[300px]">
            <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 pb-2">Quick Services</h2>
            <div className="grid grid-cols-2 gap-3">
              <ServiceCard 
                icon={<Shield className="h-6 w-6" />} 
                title="ART Services" 
                onClick={() => handleServiceSelection('art')} 
              />
              <ServiceCard 
                icon={<Pill className="h-6 w-6" />} 
                title="Pharmacy" 
                onClick={() => handleServiceSelection('pharmacy')} 
              />
              <ServiceCard 
                icon={<Activity className="h-6 w-6" />} 
                title="Viral Load" 
                onClick={() => handleServiceSelection('viral-load')} 
              />
              <ServiceCard 
                icon={<BarChart2 className="h-6 w-6" />} 
                title="Reports" 
                onClick={() => handleServiceSelection('reports')} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-y-auto max-h-[400px]">
          <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 pb-2">Recent Visits</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">ART Follow-up</span>
                <span className="text-gray-500 text-sm">March 15, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Routine check-up, medication refill</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">Pharmacovigilance</span>
                <span className="text-gray-500 text-sm">February 28, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Adverse reaction monitoring</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">Laboratory Tests</span>
                <span className="text-gray-500 text-sm">February 28, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">CD4 count, viral load, liver function</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">Clinical Assessment</span>
                <span className="text-gray-500 text-sm">January 15, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">General health assessment</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">Treatment Plan Review</span>
                <span className="text-gray-500 text-sm">January 05, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">6-month treatment evaluation</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-y-auto max-h-[400px]">
          <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 pb-2">Upcoming Appointments</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">ART Follow-up</span>
                <span className="text-gray-500 text-sm">April 15, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Regular check-up, medication refill</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">Viral Load Test</span>
                <span className="text-gray-500 text-sm">May 10, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">6-month viral load monitoring</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">CD4 Count</span>
                <span className="text-gray-500 text-sm">May 10, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Immune system monitoring</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between">
                <span className="font-medium">Pharmacy Refill</span>
                <span className="text-gray-500 text-sm">June 05, 2025</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Medication refill only</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Risk Assessment Dialog */}
      <RiskAssessmentDialog 
        open={showRiskDialog} 
        onClose={() => setShowRiskDialog(false)}
        patientData={samplePatientData}
      />
    </div>
  );
}

export default PatientDashboard;