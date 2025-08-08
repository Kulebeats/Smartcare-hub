import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtDialog } from "./art-dialog-new";
import { Calendar, Clipboard, Activity, Heart, UserCheck } from "lucide-react";
import type { ArtForm } from "./art-dialog-new";

export function ArtCard() {
  const [open, setOpen] = useState(false);
  const [lastVisit, setLastVisit] = useState<ArtForm | null>(null);

  const handleSave = (data: ArtForm) => {
    console.log("Saving ART visit:", data);
    setLastVisit(data);
    setOpen(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-[#0072BC] text-xl font-bold">Antiretroviral Therapy (ART)</CardTitle>
              <CardDescription>
                Manage HIV treatment records and follow-up visits
              </CardDescription>
            </div>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-[#0072BC] hover:bg-blue-700"
            >
              Record ART Visit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lastVisit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-[#0072BC] font-medium mb-2">
                  <Calendar className="h-5 w-5" />
                  <h3>Enrollment</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Date:</span> {lastVisit.enrollment.date}</p>
                  <p><span className="font-medium">Facility:</span> {lastVisit.enrollment.facilityName}</p>
                  <p><span className="font-medium">Type:</span> {lastVisit.enrollment.enrollmentType}</p>
                  <p><span className="font-medium">Regimen:</span> {
                    lastVisit.enrollment.regimenCode === "Other" 
                      ? lastVisit.enrollment.otherRegimen 
                      : lastVisit.enrollment.regimenCode
                  }</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-[#0072BC] font-medium mb-2">
                  <Activity className="h-5 w-5" />
                  <h3>Clinical Assessment</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">WHO Stage:</span> {lastVisit.clinicalAssessment.whoStage}</p>
                  <p><span className="font-medium">Functional Status:</span> {lastVisit.clinicalAssessment.functionalStatus}</p>
                  <p><span className="font-medium">BMI:</span> {lastVisit.clinicalAssessment.bmi} kg/m²</p>
                  <p><span className="font-medium">Weight:</span> {lastVisit.clinicalAssessment.weight} kg</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-[#0072BC] font-medium mb-2">
                  <Clipboard className="h-5 w-5" />
                  <h3>Laboratory Results</h3>
                </div>
                <div className="text-sm space-y-1">
                  {lastVisit.labResults.cd4Count && <p><span className="font-medium">CD4 Count:</span> {lastVisit.labResults.cd4Count} cells/mm³</p>}
                  {lastVisit.labResults.viralLoad && <p><span className="font-medium">Viral Load:</span> {lastVisit.labResults.viralLoad} copies/ml</p>}
                  <p><span className="font-medium">TB Status:</span> {lastVisit.labResults.tbStatus}</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center gap-2 text-[#0072BC] font-medium mb-2">
                  <Heart className="h-5 w-5" />
                  <h3>Treatment Plan</h3>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">ARV Dispensed:</span> {
                      lastVisit.treatmentPlan.arvDispensed === "Other" 
                        ? lastVisit.treatmentPlan.otherArvDispensed 
                        : lastVisit.treatmentPlan.arvDispensed
                    }
                  </p>
                  <p><span className="font-medium">Quantity:</span> {lastVisit.treatmentPlan.quantityDispensed} tablets</p>
                  <p><span className="font-medium">Duration:</span> {lastVisit.treatmentPlan.durationInMonths} months</p>
                  <p><span className="font-medium">Next Appointment:</span> {lastVisit.treatmentPlan.nextAppointmentDate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">No ART Visits Recorded</h3>
              <p className="text-sm text-gray-500 mb-4">Click the button above to record a new ART visit</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ArtDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onSave={handleSave} 
      />
    </>
  );
}