import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { PharmacovigilanceForm } from "./pharmacovigilance-dialog";
import { jsPDF } from "jspdf";

interface ClinicalSummaryDialogProps {
  open: boolean;
  onClose: () => void;
  data: PharmacovigilanceForm;
}

export function ClinicalSummaryDialog({
  open,
  onClose,
  data
}: ClinicalSummaryDialogProps) {
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header with MOH branding
    doc.setFontSize(14);
    doc.text("REPUBLIC OF ZAMBIA", 105, 15, { align: "center" });
    doc.text("MINISTRY OF HEALTH", 105, 23, { align: "center" });
    doc.setFontSize(16);
    doc.text("ARVS ACTIVE PHARMACOVIGILANCE FORM", 105, 35, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    // A. Registration
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("A. REGISTRATION", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Date of Reporting: ${format(new Date(data.registration.dateOfReporting), "dd/MM/yyyy")}`, 30, 58);
    doc.text(`Type of Visit: ${data.reasonForPharmacovigilance || "Routine"}`, 120, 58);

    // B1. Reporting Facility
    doc.setFont("helvetica", "bold");
    doc.text("B1. REPORTING FACILITY", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`Health Facility: ${data.registration.healthFacility}`, 30, 78);
    doc.text(`District: ${data.registration.district}`, 30, 86);
    doc.text(`Province: ${data.registration.province}`, 30, 94);

    // B2. Patient Details
    doc.setFont("helvetica", "bold");
    doc.text("B2. PATIENT DETAILS", 20, 106);
    doc.setFont("helvetica", "normal");
    doc.text(`First Name: ${data.patientDetails.firstName}`, 30, 114);
    doc.text(`Last Name: ${data.patientDetails.lastName}`, 120, 114);
    doc.text(`Date of Birth: ${data.patientDetails.dateOfBirth}`, 30, 122);
    // Calculate age from date of birth
    const age = new Date().getFullYear() - parseInt(data.patientDetails.dateOfBirth.split('/')[2]);
    doc.text(`Age: ${age} years`, 120, 122);
    doc.text(`Sex: ${data.patientDetails.sex}`, 30, 130);
    doc.text(`ART Number: ${data.patientDetails.artNumber}`, 120, 130);
    doc.text(`Weight: ${data.vitals?.weight || "N/A"} kg`, 30, 138);
    doc.text(`Height: ${data.vitals?.height || "N/A"} cm`, 120, 138);

    // C. Medical History
    doc.setFont("helvetica", "bold");
    doc.text("C. MEDICAL HISTORY", 20, 150);
    doc.setFont("helvetica", "normal");
    doc.text(`Reason for Visit: ${data.reasonForPharmacovigilance || "N/A"}`, 30, 158);
    
    if (data.adverseDrugReactions?.hasReactions) {
      doc.text("Adverse Drug Reactions: Yes", 30, 166);
      doc.text(`Description: ${data.adverseDrugReactions.description || "N/A"}`, 30, 174);
      
      // Adding systemic symptoms
      let systemicSymptoms = [];
      if (data.adverseDrugReactions.systemic?.length > 0) {
        systemicSymptoms = data.adverseDrugReactions.systemic;
        doc.text(`Systemic Symptoms: ${systemicSymptoms.join(", ")}`, 30, 182);
      }
    } else {
      doc.text("Adverse Drug Reactions: No", 30, 166);
    }

    // D. ART & Pregnancy 
    doc.setFont("helvetica", "bold");
    doc.text("D. ART & PREGNANCY", 20, 194);
    doc.setFont("helvetica", "normal");
    
    if (data.artPregnancy?.currentlyPregnant) {
      doc.text("Currently Pregnant: Yes", 30, 202);
      doc.text(`Gestation Age: ${data.artPregnancy.gestationAgeWeeks || 0} weeks / ${data.artPregnancy.gestationAgeMonths || 0} months`, 30, 210);
      
      if (data.artPregnancy.pregnancyOutcome) {
        doc.text(`Pregnancy Outcome: ${data.artPregnancy.pregnancyOutcome}`, 30, 218);
        
        // Check for exact string comparison and null/undefined handling
        if (data.artPregnancy.pregnancyOutcome && 
            data.artPregnancy.pregnancyOutcome !== "Still pregnant" && 
            data.artPregnancy.fetalOutcome) {
          doc.text(`Fetal Outcome: ${data.artPregnancy.fetalOutcome}`, 30, 226);
        }
      }
    } else {
      doc.text("Currently Pregnant: No", 30, 202);
    }
    
    doc.text(`Currently Breastfeeding: ${data.artPregnancy?.isBreastfeeding ? "Yes" : "No"}`, 30, 234);
    
    if (data.artPregnancy?.isBreastfeeding) {
      doc.text(`Age of Child: ${data.artPregnancy.ageOfChildMonths || 0} months`, 30, 242);
    }

    // Add a new page for the rest of the sections
    doc.addPage();

    // E. Current Medications
    doc.setFont("helvetica", "bold");
    doc.text("E. CURRENT MEDICATIONS", 20, 30);
    doc.setFont("helvetica", "normal");
    
    // Create a table-like structure for medications
    doc.text("Generic Name: Tenofovir/Lamivudine/Dolutegravir", 30, 38);
    doc.text("Brand Name: TLD", 30, 46);
    doc.text("Indication: HIV Treatment", 30, 54);
    doc.text("Dose/Route: 300/300/50mg Oral Once daily", 30, 62);
    doc.text("Date Started: 2024-01-20", 30, 70);

    // F. Follow Up
    doc.setFont("helvetica", "bold");
    doc.text("F. FOLLOW UP", 20, 90);
    doc.setFont("helvetica", "normal");
    
    if (data.followUp?.actionTaken) {
      doc.text(`Action Taken: ${data.followUp.actionTaken}`, 30, 98);
    }
    
    if (data.followUp?.patientStatus) {
      doc.text(`Patient Status: ${data.followUp.patientStatus}`, 30, 106);
    }

    // G. Outcomes
    doc.setFont("helvetica", "bold");
    doc.text("G. OUTCOMES", 20, 126);
    doc.setFont("helvetica", "normal");
    
    if (data.outcomes?.artOutcomes?.length > 0) {
      doc.text(`ART Outcomes: ${data.outcomes.artOutcomes.join(", ")}`, 30, 134);
    }
    
    if (data.outcomes?.pharmacovigilanceOutcomes?.length > 0) {
      doc.text(`Pharmacovigilance Outcomes: ${data.outcomes.pharmacovigilanceOutcomes.join(", ")}`, 30, 142);
      
      if (data.outcomes.pharmacovigilanceOutcomes.includes("Other") && data.outcomes.otherOutcome) {
        doc.text(`Other Outcome: ${data.outcomes.otherOutcome}`, 30, 150);
      }
    }

    // P. Staff Reporting
    doc.setFont("helvetica", "bold");
    doc.text("P. STAFF REPORTING", 20, 170);
    doc.setFont("helvetica", "normal");
    doc.text("Role:", 30, 178);
    
    // Checkboxes for roles
    doc.rect(30, 182, 5, 5);  // Medical/Clinical Officer
    doc.text("Medical/Clinical Officer", 40, 186);
    
    doc.rect(120, 182, 5, 5);  // Pharmacist
    doc.text("Pharmacist", 130, 186);
    
    doc.rect(30, 192, 5, 5);  // Pharmacy Technologist
    doc.text("Pharmacy Technologist", 40, 196);
    
    doc.rect(120, 192, 5, 5);  // Nurse
    doc.text("Nurse", 130, 196);
    doc.setFillColor(0, 0, 0);
    doc.rect(120, 192, 5, 5, "F");  // Nurse - checked
    
    doc.rect(30, 202, 5, 5);  // Data Associate
    doc.text("Data Associate", 40, 206);
    
    doc.rect(120, 202, 5, 5);  // Others
    doc.text("Others, specify ___________", 130, 206);

    // Staff details
    doc.text("Name: Kuwani Banda", 30, 218);
    doc.text("Role: Registered Nurse", 30, 226);
    doc.text("Phone #: +260 987654321", 30, 234);
    doc.text("Email: kuwani.banda@health.gov.zm", 30, 242);
    doc.text(`Date: ${format(new Date(), "dd/MM/yyyy")}`, 30, 250);

    // Footer
    doc.setFontSize(8);
    doc.text("APV Form v1.2 | ZAMPHIA Active Surveillance Program", 105, 270, { align: "center" });

    doc.save("pharmacovigilance-report.pdf");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-describedby="clinical-summary-description">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
          <DialogTitle>Clinical Summary</DialogTitle>
          <p id="clinical-summary-description" className="sr-only">Detailed view of the pharmacovigilance assessment form</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-sm font-semibold uppercase text-gray-600">Republic of Zambia</h2>
              <h2 className="text-sm font-semibold uppercase text-gray-600 mb-2">Ministry of Health</h2>
              <h1 className="text-2xl font-bold">ARVS ACTIVE PHARMACOVIGILANCE FORM</h1>
            </div>

            {/* Registration */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">A. REGISTRATION</h2>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm text-gray-600">Date of Reporting</label>
                  <p>{format(new Date(data.registration.dateOfReporting), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Visit Type</label>
                  <p>{data.reasonForPharmacovigilance || "Routine"}</p>
                </div>
              </div>
            </section>

            {/* Reporting Facility */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">B1. REPORTING FACILITY</h2>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm text-gray-600">Health Facility</label>
                  <p>{data.registration.healthFacility}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">District</label>
                  <p>{data.registration.district}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Province</label>
                  <p>{data.registration.province}</p>
                </div>
              </div>
            </section>

            {/* Patient Details */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">B2. PATIENT DETAILS</h2>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm text-gray-600">First Name</label>
                  <p>{data.patientDetails.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Name</label>
                  <p>{data.patientDetails.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Date of Birth</label>
                  <p>{data.patientDetails.dateOfBirth}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Age</label>
                  <p>{new Date().getFullYear() - parseInt(data.patientDetails.dateOfBirth.split('/')[2])} years</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Sex</label>
                  <p>{data.patientDetails.sex}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">ART Number</label>
                  <p>{data.patientDetails.artNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Weight</label>
                  <p>{data.vitals?.weight || "N/A"} kg</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Height</label>
                  <p>{data.vitals?.height || "N/A"} cm</p>
                </div>
              </div>
            </section>

            {/* Medical History */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">C. MEDICAL HISTORY</h2>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-sm text-gray-600">Reason for Visit</label>
                  <p>{data.reasonForPharmacovigilance || "N/A"}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600">Adverse Drug Reactions</label>
                  <p>{data.adverseDrugReactions?.hasReactions ? "Yes" : "No"}</p>
                  
                  {data.adverseDrugReactions?.hasReactions && (
                    <>
                      <label className="text-sm text-gray-600">Description</label>
                      <p>{data.adverseDrugReactions.description || "N/A"}</p>
                      
                      {data.adverseDrugReactions.systemic?.length > 0 && (
                        <>
                          <label className="text-sm text-gray-600">Systemic Symptoms</label>
                          <p>{data.adverseDrugReactions.systemic.join(", ")}</p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* ART & Pregnancy */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">D. ART & PREGNANCY</h2>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-sm text-gray-600">Currently Pregnant</label>
                  <p>{data.artPregnancy?.currentlyPregnant ? "Yes" : "No"}</p>
                  
                  {data.artPregnancy?.currentlyPregnant && (
                    <>
                      <label className="text-sm text-gray-600">Gestation Age</label>
                      <p>{data.artPregnancy.gestationAgeWeeks || 0} weeks / {data.artPregnancy.gestationAgeMonths || 0} months</p>
                      
                      {data.artPregnancy.pregnancyOutcome && (
                        <>
                          <label className="text-sm text-gray-600">Pregnancy Outcome</label>
                          <p>{data.artPregnancy.pregnancyOutcome}</p>
                          
                          {/* Added comment for clarity */}
                          {data.artPregnancy.pregnancyOutcome && 
                           data.artPregnancy.pregnancyOutcome !== "Still pregnant" && 
                           data.artPregnancy.fetalOutcome && (
                            <>
                              <label className="text-sm text-gray-600">Fetal Outcome</label>
                              <p>{data.artPregnancy.fetalOutcome}</p>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-600">Currently Breastfeeding</label>
                  <p>{data.artPregnancy?.isBreastfeeding ? "Yes" : "No"}</p>
                  
                  {data.artPregnancy?.isBreastfeeding && (
                    <>
                      <label className="text-sm text-gray-600">Age of Child</label>
                      <p>{data.artPregnancy.ageOfChildMonths || 0} months</p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Medications */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">E. CURRENT MEDICATIONS</h2>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1 text-left">Generic Name</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Brand Name</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Indication</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Dose/Route</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Date Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* We're using mock data from the pharmacovigilance-dialog.tsx MEDICATION_DETAILS constant */}
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">Tenofovir/Lamivudine/Dolutegravir</td>
                      <td className="border border-gray-300 px-2 py-1">TLD</td>
                      <td className="border border-gray-300 px-2 py-1">HIV Treatment</td>
                      <td className="border border-gray-300 px-2 py-1">300/300/50mg Oral Once daily</td>
                      <td className="border border-gray-300 px-2 py-1">2024-01-20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Follow Up */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">F. FOLLOW UP</h2>
              <div className="space-y-3 mt-2">
                {data.followUp?.actionTaken && (
                  <div>
                    <label className="text-sm text-gray-600">Action Taken</label>
                    <p>{data.followUp.actionTaken}</p>
                  </div>
                )}
                
                {data.followUp?.patientStatus && (
                  <div>
                    <label className="text-sm text-gray-600">Patient Status</label>
                    <p>{data.followUp.patientStatus}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Outcomes */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">G. OUTCOMES</h2>
              <div className="space-y-3 mt-2">
                {data.outcomes?.artOutcomes?.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-600">ART Outcomes</label>
                    <p>{data.outcomes.artOutcomes.join(", ")}</p>
                  </div>
                )}
                
                {data.outcomes?.pharmacovigilanceOutcomes?.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-600">Pharmacovigilance Outcomes</label>
                    <p>{data.outcomes.pharmacovigilanceOutcomes.join(", ")}</p>
                    
                    {data.outcomes.pharmacovigilanceOutcomes.includes("Other") && data.outcomes.otherOutcome && (
                      <>
                        <label className="text-sm text-gray-600">Other Outcome</label>
                        <p>{data.outcomes.otherOutcome}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Staff Reporting */}
            <section className="border-t pt-4">
              <h2 className="text-lg font-semibold">P. STAFF REPORTING</h2>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked disabled />
                      <label>Nurse</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled />
                      <label>Medical/Clinical Officer</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled />
                      <label>Data Associate</label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled />
                      <label>Pharmacist</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled />
                      <label>Pharmacy Technologist</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled />
                      <label>Others, specify: _________</label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p>Kuwani Banda</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Role</label>
                    <p>Registered Nurse</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone #</label>
                    <p>+260 987654321</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p>kuwani.banda@health.gov.zm</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date</label>
                    <p>{format(new Date(), "dd/MM/yyyy")}</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Footer */}
            <section className="text-center text-sm text-gray-500 pt-4">
              <p>APV Form v1.2 | ZAMPHIA Active Surveillance Program</p>
            </section>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 sticky bottom-0 bg-white pt-2 pb-1">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={downloadPDF}>Download PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}