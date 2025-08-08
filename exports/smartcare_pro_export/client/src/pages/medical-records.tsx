import { useParams } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileEdit, Plus } from "lucide-react";
import { NCDManagementForm } from "@/components/medical-record/ncd-management-form";
import { ChronicConditionDialog } from "@/components/medical-record/chronic-conditions-dialog";
import { PresentHistoryDialog } from "@/components/medical-record/present-history-dialog";
import { FamilySocialHistoryDialog } from "@/components/medical-record/family-social-history-dialog";
import { PharmacovigilanceDialog } from "@/components/medical-record/pharmacovigilance-dialog";
import { PrepInitialDialog } from "@/components/medical-record/prep-initial-dialog";
import { PrepFollowUpDialog } from "@/components/medical-record/prep-follow-up-dialog";
import { PharmacovigilanceCard } from "@/components/medical-record/pharmacovigilance-card";
import { ReviewOfSystemsCard } from "@/components/medical-record/review-of-systems-card";
import { ReviewOfSystemsDialog } from "@/components/medical-record/review-of-systems-dialog";
import { PastMedicalHistoryDialog } from "@/components/medical-record/past-medical-history-dialog"; // Import the new component
import { ArtCard } from "@/components/medical-record/art-card"; //Import ArtCard


export default function MedicalRecords() {
  const { serviceId } = useParams();
  const [activeTab, setActiveTab] = useState("complaints");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [presentHistoryOpen, setPresentHistoryOpen] = useState(false);
  const [familySocialHistoryOpen, setFamilySocialHistoryOpen] = useState(false);
  const [chronicConditionOpen, setChronicConditionOpen] = useState(false);
  const [pharmacovigilanceOpen, setPharmacovigilanceOpen] = useState(false);
  const [prepInitialOpen, setPrepInitialOpen] = useState(false);
  const [prepFollowUpOpen, setPrepFollowUpOpen] = useState(false);
  const [reviewOfSystemsOpen, setReviewOfSystemsOpen] = useState(false);
  const [pastMedicalHistoryOpen, setPastMedicalHistoryOpen] = useState(false); // Add state for Past Medical History

  // This will be replaced with actual data later
  const patientData = {
    name: "XXX MMMM",
    dob: "11-Oct-1988",
    gender: "Female",
    phone: "0977000000",
    nupn: "RRRR-MMMMM-YYYY-K",
    nrc: "222222/22/2"
  };

  const sections = [
    { id: "presenting", title: "Presenting Complaints" },
    { id: "tb", title: "TB Constitutional Symptoms" },
    { id: "systems", title: "Review of Systems" },
    { id: "medical", title: "Past Medical History" }, // Added Past Medical History
    { id: "chronic", title: "Chronic / Non Chronic Conditions" },
    { id: "pharmacovigilance", title: "Pharmacovigilance" },
    { id: "prep_initial", title: "PrEP Initial Assessment" },
    { id: "prep_followup", title: "PrEP Follow-up Visit" },
    { id: "allergies", title: "Allergies" },
    { id: "family", title: "Family & Social History" },
  ];

  const handleAddRecord = (sectionId: string) => {
    setSelectedSection(sectionId);
    if (sectionId === "presenting") {
      setPresentHistoryOpen(true);
    } else if (sectionId === "family") {
      setFamilySocialHistoryOpen(true);
    } else if (sectionId === "chronic") {
      setChronicConditionOpen(true);
    } else if (sectionId === "pharmacovigilance") {
      setPharmacovigilanceOpen(true);
    } else if (sectionId === "prep_initial") {
      setPrepInitialOpen(true);
    } else if (sectionId === "prep_followup") {
      setPrepFollowUpOpen(true);
    } else if (sectionId === "systems") {
      setReviewOfSystemsOpen(true);
    } else if (sectionId === "medical") { // Handle Past Medical History
      setPastMedicalHistoryOpen(true);
    }
  };

  const handleSavePresentHistory = (data: any) => {
    console.log("Saving present history:", data);
    setPresentHistoryOpen(false);
  };

  const handleSaveFamilySocialHistory = (data: any) => {
    console.log("Saving family & social history:", data);
    setFamilySocialHistoryOpen(false);
  };

  const handleSaveChronicCondition = (data: any) => {
    console.log("Saving chronic condition:", data);
    setChronicConditionOpen(false);
  };

  const handleSavePharmacovigilance = (data: any) => {
    console.log("Saving pharmacovigilance form:", data);
    setPharmacovigilanceOpen(false);
  };

  const handleSavePrepInitial = (data: any) => {
    console.log("Saving PrEP initial assessment:", data);
    setPrepInitialOpen(false);
  };

  const handleSavePrepFollowUp = (data: any) => {
    console.log("Saving PrEP follow-up visit:", data);
    setPrepFollowUpOpen(false);
  };

  const handleSaveNCDManagement = (data: any) => {
    console.log("Saving NCD management:", data);
  };

  const handleSaveReviewOfSystems = (data: any) => {
    console.log("Saving review of systems:", data);
    setReviewOfSystemsOpen(false);
  };

  const handleSavePastMedicalHistory = (data: any) => { // Add handler for Past Medical History
    console.log("Saving past medical history:", data);
    setPastMedicalHistoryOpen(false);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Add background image with proper styling */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "url('/Carepro_Background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <header className="bg-white/80 border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="/Logo.ico" alt="Logo" className="h-10" />
              <h1>
                <span className="text-[#00A651]">Smart</span>
                <span className="text-[#0072BC]">Care</span>
                <span className="text-[#0072BC] font-bold">PRO</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0072BC]">Training Portal</h1>
          <h2 className="text-xl font-semibold text-[#00A651] mt-1">Patient Medical Records</h2>
        </div>

        <div className="space-y-5">
          <div className="patient-info-card">
            <h2 className="text-lg font-semibold mb-4 text-[#0072BC] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              Patient Information
            </h2>
            <div className="patient-info-grid">
              <div className="patient-info-item">
                <p className="patient-info-label">Name</p>
                <p className="patient-info-value">{patientData.name}</p>
              </div>
              <div className="patient-info-item">
                <p className="patient-info-label">Date of Birth</p>
                <p className="patient-info-value">
                  <span className="text-[#0072BC]">📅</span> {patientData.dob}
                </p>
              </div>
              <div className="patient-info-item">
                <p className="patient-info-label">Gender</p>
                <p className="patient-info-value">
                  <span className="text-[#0072BC]">⚧</span> {patientData.gender}
                </p>
              </div>
              <div className="patient-info-item">
                <p className="patient-info-label">Phone</p>
                <p className="patient-info-value">
                  <span className="text-[#0072BC]">📱</span> {patientData.phone}
                </p>
              </div>
              <div className="patient-info-item">
                <p className="patient-info-label">NUPN</p>
                <p className="patient-info-value">
                  <span className="text-[#0072BC]">🆔</span> {patientData.nupn}
                </p>
              </div>
              <div className="patient-info-item">
                <p className="patient-info-label">NRC</p>
                <p className="patient-info-value">
                  <span className="text-[#0072BC]">🪪</span> {patientData.nrc}
                </p>
              </div>
            </div>
          </div>

          <div className="container mx-auto p-6 max-w-7xl">
            <Tabs defaultValue="complaints" className="w-full">
              <TabsList className="w-full justify-start border-b mb-6">
                <TabsTrigger value="complaints" className="text-lg font-medium">
                  Complaints & Histories
                </TabsTrigger>
                <TabsTrigger value="examination" className="text-lg font-medium">
                  Examination & Diagnosis
                </TabsTrigger>
                <TabsTrigger value="plan" className="text-lg font-medium">
                  Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="complaints" className="space-y-6">
                {sections.map((section) => (
                  <Card key={section.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {section.title}
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                          <FileEdit className="h-4 w-4" />
                          Edit Record
                        </Button>
                        <Button
                          className="flex items-center gap-2"
                          onClick={() => handleAddRecord(section.id)}
                        >
                          <Plus className="h-4 w-4" />
                          Add Record
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="examination">
                <div className="space-y-6">
                  {/* Examination content will go here */}
                </div>
              </TabsContent>

              <TabsContent value="plan">
                <div className="space-y-6">
                  <NCDManagementForm onSave={handleSaveNCDManagement} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <PresentHistoryDialog
        open={presentHistoryOpen}
        onClose={() => setPresentHistoryOpen(false)}
        onSave={handleSavePresentHistory}
      />

      <FamilySocialHistoryDialog
        open={familySocialHistoryOpen}
        onClose={() => setFamilySocialHistoryOpen(false)}
        onSave={handleSaveFamilySocialHistory}
      />

      <ChronicConditionDialog
        open={chronicConditionOpen}
        onClose={() => setChronicConditionOpen(false)}
        onSave={handleSaveChronicCondition}
      />

      <PharmacovigilanceDialog
        open={pharmacovigilanceOpen}
        onClose={() => setPharmacovigilanceOpen(false)}
        onSave={handleSavePharmacovigilance}
      />

      <PrepInitialDialog
        open={prepInitialOpen}
        onClose={() => setPrepInitialOpen(false)}
        onSave={handleSavePrepInitial}
      />

      <PrepFollowUpDialog
        open={prepFollowUpOpen}
        onClose={() => setPrepFollowUpOpen(false)}
        onSave={handleSavePrepFollowUp}
      />

      <ReviewOfSystemsDialog
        open={reviewOfSystemsOpen}
        onClose={() => setReviewOfSystemsOpen(false)}
        onSave={handleSaveReviewOfSystems}
      />

      <PastMedicalHistoryDialog // Added Past Medical History Dialog
        open={pastMedicalHistoryOpen}
        onClose={() => setPastMedicalHistoryOpen(false)}
        onSave={handleSavePastMedicalHistory}
      />
    </div>
  );
}

/* 
 * Note: This component is now imported from "@/components/medical-record/review-of-systems-card"
 * See import at the top of this file
 */