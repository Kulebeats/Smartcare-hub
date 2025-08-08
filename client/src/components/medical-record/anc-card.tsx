import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AncInitialDialog } from "./anc-initial-dialog";
import { Calendar, Clipboard, Activity, TestTube, Stethoscope, Pill, UserCheck } from "lucide-react";
import type { AncInitialForm } from "./anc-initial-dialog";

export function AncCard() {
  const [open, setOpen] = useState(false);
  const [lastVisit, setLastVisit] = useState<AncInitialForm | null>(null);

  const handleSave = (data: AncInitialForm) => {
    console.log("Saving ANC initial visit:", data);
    setLastVisit(data);
    setOpen(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-blue-700 text-xl font-bold">Antenatal Care (ANC)</CardTitle>
              <CardDescription>
                Manage antenatal care visits and follow-ups
              </CardDescription>
            </div>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2 px-4 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Add Encounter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lastVisit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <Calendar className="h-5 w-5" />
                  <h3>Patient Information</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Visit Date:</span> {lastVisit.patientInfo.visitDate}</p>
                  <p><span className="font-medium">LMP:</span> {lastVisit.patientInfo.lastMenstrualPeriod}</p>
                  <p><span className="font-medium">EDD:</span> {lastVisit.patientInfo.estimatedDeliveryDate}</p>
                  <p><span className="font-medium">Gestational Age:</span> {lastVisit.patientInfo.gestationalAge} weeks</p>
                  <p><span className="font-medium">Gravida:</span> {lastVisit.patientInfo.gravida} | <span className="font-medium">Parity:</span> {lastVisit.patientInfo.parity}</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <Activity className="h-5 w-5" />
                  <h3>Vital Signs</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Weight:</span> {lastVisit.vitalSigns.weight} kg</p>
                  <p><span className="font-medium">Height:</span> {lastVisit.vitalSigns.height} cm</p>
                  <p><span className="font-medium">BMI:</span> {lastVisit.vitalSigns.bmi} kg/m²</p>
                  <p><span className="font-medium">BP:</span> {lastVisit.vitalSigns.bloodPressure}</p>
                  <p><span className="font-medium">Temperature:</span> {lastVisit.vitalSigns.temperature}°C</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <TestTube className="h-5 w-5" />
                  <h3>Lab Results</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Blood Group:</span> {lastVisit.labResults.bloodGroup} {lastVisit.labResults.rhFactor}</p>
                  <p><span className="font-medium">HIV Status:</span> {lastVisit.labResults.hivStatus}</p>
                  {lastVisit.labResults.hemoglobin && <p><span className="font-medium">Hemoglobin:</span> {lastVisit.labResults.hemoglobin} g/dL</p>}
                  <p><span className="font-medium">Syphilis:</span> {lastVisit.labResults.syphilisScreening}</p>
                  <p><span className="font-medium">Hepatitis B:</span> {lastVisit.labResults.hepatitisB}</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <Pill className="h-5 w-5" />
                  <h3>Treatment Plan</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Medications:</span> 
                    {[
                      lastVisit.treatment.ironSupplementation ? "Iron Supplements" : null,
                      lastVisit.treatment.folicAcid ? "Folic Acid" : null,
                      lastVisit.treatment.tetanusToxoid ? "Tetanus Toxoid" : null,
                      lastVisit.treatment.malariaPreventionTreatment ? "Malaria Prophylaxis" : null
                    ].filter(Boolean).join(", ") || "None"}
                  </p>
                  <p><span className="font-medium">Next Appointment:</span> {lastVisit.treatment.nextAppointmentDate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">No ANC Visits Recorded</h3>
              <p className="text-sm text-gray-500 mb-4">Click the "Add Encounter" button to record a new ANC visit</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AncInitialDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onSave={handleSave} 
      />
    </>
  );
}