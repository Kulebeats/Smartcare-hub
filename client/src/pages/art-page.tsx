import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, ChevronRight, Edit, ArrowLeft } from "lucide-react";
import { ArtDialog } from "@/components/medical-record/art-dialog";
import { PresentHistoryDialog } from "@/components/medical-record/present-history-dialog";
import { ChronicConditionDialog } from "@/components/medical-record/chronic-conditions-dialog";
import { FamilySocialHistoryDialog } from "@/components/medical-record/family-social-history-dialog";
import { HivRiskScreeningDialog } from "@/components/medical-record/hiv-risk-dialog";
import { PastMedicalHistoryDialog } from "@/components/medical-record/past-medical-history-dialog";
import { PharmacovigilanceDialog } from "@/components/medical-record/pharmacovigilance-dialog";
import { PharmacovigilanceEntryModal } from "@/components/medical-record/pharmacovigilance-entry-modal";
import { MainLayout } from "@/components/layout/main-layout";


export default function ArtPage() {
  const [artDialogOpen, setArtDialogOpen] = useState(false);
  const [presentHistoryOpen, setPresentHistoryOpen] = useState(false);
  const [chronicConditionOpen, setChronicConditionOpen] = useState(false);
  const [familySocialHistoryOpen, setFamilySocialHistoryOpen] = useState(false);
  const [hivRiskScreeningOpen, setHivRiskScreeningOpen] = useState(false);
  const [pastMedicalHistoryOpen, setPastMedicalHistoryOpen] = useState(false);
  const [pharmacovigilanceOpen, setPharmacovigilanceOpen] = useState(false);
  const [pharmacovigilanceEntryOpen, setPharmacovigilanceEntryOpen] = useState(false);

  // Mock patient data
  const patient = {
    id: 1,
    name: "Malama Mulenga",
    dob: "15-Apr-1990 (35Y)",
    gender: "Female",
    phone: "+260 976444446",
    nupn: "NIC-0070-05846-6",
    nrc: "222222/22/2",
    address: "HW3+G5 Kondolo Compound, Chipata"
  };

  // Mock PrEP encounters data
  const encounters = [
    {
      id: 1,
      visitDate: "08-Apr-2025",
      visitType: "Initial Assessment",
      riskAssessment: "Medium Risk",
      hivTestResult: "Negative",
      prepStatus: "Initiated"
    },
    {
      id: 2,
      visitDate: "01-Mar-2025",
      visitType: "Follow-up",
      riskAssessment: "Low Risk",
      hivTestResult: "Negative",
      prepStatus: "Maintained"
    }
  ];

  const latestVitals = {
    weight: 45,
    height: 165,
    bmi: 16.53
  };

  const latestHtsStatus = {
    testDate: "8-Apr-2025",
    testResult: "Negative",
    hivType: ""
  };

  const diagnosis = {
    nts: "Uncomplicated malaria",
    icd11: ""
  };

  const handleSaveArtVisit = (data: any) => {
    console.log("Saving ART visit:", data);
    setArtDialogOpen(false);
  };
  
  const handleSavePharmacovigilance = (data: any) => {
    console.log("Saving pharmacovigilance:", data);
    setPharmacovigilanceOpen(false);
  };
  
  const handlePharmacovigilanceOptionSelect = (option: string) => {
    console.log("Selected pharmacovigilance option:", option);
    setPharmacovigilanceEntryOpen(false);
    
    // Open the pharmacovigilance form for any option selected
    setPharmacovigilanceOpen(true);
  };

  const handleSavePresentHistory = (data: any) => {
    console.log("Saving present history:", data);
    setPresentHistoryOpen(false);
  };

  const handleSaveChronicCondition = (data: any) => {
    console.log("Saving chronic condition:", data);
    setChronicConditionOpen(false);
  };

  const handleSaveFamilySocialHistory = (data: any) => {
    console.log("Saving family social history:", data);
    setFamilySocialHistoryOpen(false);
  };

  const handleSaveHivRiskScreening = (data: any) => {
    console.log("Saving HIV risk screening:", data);
    setHivRiskScreeningOpen(false);
  };

  const sections = [
    { id: "presenting", title: "Presenting Complaints" },
    { id: "systems", title: "Review of Systems" },
    { id: "history", title: "Past Medical History" }, //Updated section ID
    { id: "chronic", title: "Chronic / Non Chronic Conditions" },
    { id: "prevention", title: "Prevention" },
    { id: "family", title: "Family & Social History" }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mt-2 mb-4">Anti-Retroviral Therapy (ART)</h1>
        </div>

        {/* Patient Info Bar */}
        <div className="bg-[#eefbff] rounded-lg mb-6 p-4">
          <div className="grid grid-cols-7 gap-4">
            <div className="col-span-1">
              <p className="text-[#336699] font-medium mb-0.5">Malama</p>
              <p className="font-medium text-[#333333]">Mulenga</p>
            </div>
            <div>
              <p className="text-[#336699] text-sm mb-0.5">Date of Birth</p>
              <div className="flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 text-gray-500">
                  <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{patient.dob}</span>
              </div>
            </div>
            <div>
              <p className="text-[#336699] text-sm mb-0.5">Sex</p>
              <div className="flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 text-gray-500">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.99995 3H8.99995C7.04996 8.84 7.04996 15.16 8.99995 21H7.99995M15 3C16.95 8.84 16.95 15.16 15 21M3.12695 16V15C8.96695 16.95 15.287 16.95 21.127 15V16M3.12695 9.00005C8.96695 7.05005 15.287 7.05005 21.127 9.00005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{patient.gender}</span>
              </div>
            </div>
            <div>
              <p className="text-[#336699] text-sm mb-0.5">Cellphone</p>
              <div className="flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 text-gray-500">
                  <path d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{patient.phone}</span>
              </div>
            </div>
            <div>
              <p className="text-[#336699] text-sm mb-0.5">NUPN</p>
              <div className="flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 text-gray-500">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.5 12C19.5 14.55 18.38 16.74 16.68 18.22C15.08 19.63 12.92 20.5 10.5 20.5C5.81 20.5 2 16.69 2 12C2 7.31 5.81 3.5 10.5 3.5C12.93 3.5 15.1 4.37 16.69 5.78C18.38 7.26 19.5 9.45 19.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{patient.nupn}</span>
              </div>
            </div>
            <div>
              <p className="text-[#336699] text-sm mb-0.5">NRC</p>
              <div className="flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 text-gray-500">
                  <path d="M2 12.5C2 9.47 4.47 7 7.5 7H16.5C19.53 7 22 9.47 22 12.5C22 15.53 19.53 18 16.5 18H7.5C4.47 18 2 15.53 2 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12.5C15 13.6046 14.1046 14.5 13 14.5C11.8954 14.5 11 13.6046 11 12.5C11 11.3954 11.8954 10.5 13 10.5C14.1046 10.5 15 11.3954 15 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{patient.nrc}</span>
              </div>
            </div>
            <div>
              <p className="text-[#336699] text-sm mb-0.5">Address</p>
              <div className="flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 text-gray-500">
                  <path d="M9 11C9 12.1046 8.10457 13 7 13C5.89543 13 5 12.1046 5 11C5 9.89543 5.89543 9 7 9C8.10457 9 9 9.89543 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 6C14 7.10457 13.1046 8 12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 11C19 12.1046 18.1046 13 17 13C15.8954 13 15 12.1046 15 11C15 9.89543 15.8954 9 17 9C18.1046 9 19 9.89543 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 19.5C14 19.5 13 16 12.5 16C12 16 11 19.5 11 19.5M14 19.5C14 19.5 12 20 11 19.5M14 19.5C14 19.5 12.0523 17.8909 11 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm truncate max-w-[170px]">{patient.address}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-4 rounded-md">
              Actions
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-4 gap-4">
          {/* Left sidebar */}
          <div className="col-span-1">
            <Card className="mb-4 shadow-sm">
              <CardContent className="p-0 latest-encounter">
                <h3 className="p-3 border-b card-section-title">Latest Encounter</h3>

                <div className="border-b">
                  <div className="p-3 mb-1">
                    <h4 className="font-medium mb-2 card-section-content">Presenting Complaints</h4>
                    <div className="flex justify-between items-center card-section-content">
                      <span>Chief Complaints</span>
                      <span className="text-gray-500">:</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span>History of Chief Complaints</span>
                      <span className="text-gray-500">:</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span>Sensitivities and Disclosure</span>
                      <span className="text-gray-500">:</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 pb-2">
                    <span></span>
                    <Link href="#">
                      <span className="text-blue-500 text-sm flex items-center">
                        View All
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="border-b">
                  <div className="p-4 mb-2">
                    <h4 className="font-medium mb-2 card-section-content">Review of Systems</h4>
                    <div className="flex justify-between items-center card-section-content">
                      <span>Physical System</span>
                      <span className="text-gray-500">: Gastro-Intestinal System</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span>Note</span>
                      <span className="text-gray-500">: very bad</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 pb-2">
                    <span></span>
                    <Link href="#">
                      <span className="text-blue-500 text-sm flex items-center">
                        View All
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="border-b">
                  <div className="p-4 mb-2">
                    <h4 className="font-medium mb-2">Past Medical History</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span>Drug History</span>
                      <span className="text-gray-500">:</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span>Admission History</span>
                      <span className="text-gray-500">:</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 pb-2">
                    <span></span>
                    <Link href="#">
                      <span className="text-blue-500 text-sm flex items-center">
                        View All
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="border-b">
                  <div className="p-4 mb-2">
                    <h4 className="font-medium mb-2">Chronic / Non Chronic Conditions</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span>Condition Type</span>
                      <span className="text-gray-500">:</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span>Date Diagnosed</span>
                      <span className="text-gray-500">:</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 pb-2">
                    <span></span>
                    <Link href="#">
                      <span className="text-blue-500 text-sm flex items-center">
                        View All
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="col-span-2">
            <Card className="mb-4 shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <div className="flex space-x-6">
                    <Link href="#" className="text-blue-500 border-b-2 border-blue-500 pb-2 font-medium">
                      Complaints & Histories
                    </Link>
                    <Link href="#" className="text-gray-600">
                      Gyn & Obs Histories
                    </Link>
                    <Link href="#" className="text-gray-600">
                      Examination & Diagnosis
                    </Link>
                  </div>
                  <div>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>

                {sections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <div className="bg-gray-100 p-3 rounded-md mb-3 flex justify-between items-center">
                      <h3 className="font-medium text-sm">{section.title}</h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-1 text-xs h-7 px-3"
                          onClick={() => {
                            // Open the appropriate dialog based on section
                            if (section.id === "presenting") {
                              setPresentHistoryOpen(true);
                            } else if (section.id === "history") {
                              setPastMedicalHistoryOpen(true);
                            } else if (section.id === "chronic") {
                              setChronicConditionOpen(true);
                            } else if (section.id === "family") {
                              setFamilySocialHistoryOpen(true);
                            }
                          }}
                        >
                          <Edit className="h-3 w-3" />
                          Edit Record
                        </Button>
                        <Button 
                          variant="default" 
                          className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 h-7 px-3"
                          onClick={() => {
                            // Open the appropriate dialog based on section
                            if (section.id === "presenting") {
                              setPresentHistoryOpen(true);
                            } else if (section.id === "history") {
                              setPastMedicalHistoryOpen(true);
                            } else if (section.id === "chronic") {
                              setChronicConditionOpen(true);
                            } else if (section.id === "family") {
                              setFamilySocialHistoryOpen(true);
                            }
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Add Record
                        </Button>
                      </div>
                    </div>

                    {/* Add HIV Risk Infection Screening after Presenting Complaints */}
                    {section.id === "presenting" && (
                      <div className="mb-4">
                        <div className="bg-gray-100 p-3 rounded-md mb-3 flex justify-between items-center">
                          <h3 className="font-medium text-sm">HIV Risk Screening</h3>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs h-7 px-3"
                              onClick={() => setHivRiskScreeningOpen(true)}
                            >
                              <Edit className="h-3 w-3" />
                              Edit Record
                            </Button>
                            <Button 
                              variant="default" 
                              className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 h-7 px-3"
                              onClick={() => setHivRiskScreeningOpen(true)}
                            >
                              <Plus className="h-3 w-3" />
                              Add Record
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-center mt-8 space-x-4">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 px-6"
                    onClick={() => setArtDialogOpen(true)}
                  >
                    New ART Visit
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 px-6"
                    onClick={() => setPharmacovigilanceEntryOpen(true)}
                  >
                    Pharmacovigilance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="col-span-1">
            <Card className="mb-4 shadow-sm">
              <CardContent className="p-0">
                <h3 className="p-3 border-b card-section-title">Recent Data Summary</h3>

                <div className="p-3 border-b">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="flex items-center text-gray-700 text-xs">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.5 10V19.5C20.5 20.3284 19.8284 21 19 21H5C4.17157 21 3.5 20.3284 3.5 19.5V10M20.5 10H3.5M20.5 10C20.5 8.89543 19.6046 8 18.5 8C17.3954 8 16.5 8.89543 16.5 10M3.5 10C3.5 8.89543 4.39543 8 5.5 8C6.60457 8 7.5 8.89543 7.5 10M7.5 10H16.5M16.5 10C16.5 8 15.5 3 12 3C8.5 3 7.5 8 7.5 10M12 15V17M8 15L7 17M16 15L17 17" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Vitals
                    </h4>
                    <Link href="#" className="text-blue-500 text-xs">
                      Preview
                    </Link>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between items-center text-xs py-1">
                      <span>Weight(kg)</span>
                      <span className="font-medium">: {latestVitals.weight}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <span>Height(cm)</span>
                      <span className="font-medium">: {latestVitals.height}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <span>BMI</span>
                      <span className="font-medium">: {latestVitals.bmi}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-b">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="flex items-center text-gray-700 text-xs">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 10H2M11 14H6M11 18H8M10 2V4M18 4L16.5 5.5M2 10L3.5 11.5M6 4L7.5 5.5M22 10L20.5 11.5M14 21.5L12 17L10 21.5M14.5 7C14.5 9.20914 12.7091 11 10.5 11C8.29086 11 6.5 9.20914 6.5 7C6.5 4.79086 8.29086 3 10.5 3C12.7091 3 14.5 4.79086 14.5 7Z" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      HTS Status
                    </h4>
                    <Link href="#" className="text-blue-500 text-xs">
                      Preview
                    </Link>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between items-center text-xs py-0.5">
                      <span>Test Date</span>
                      <span className="font-medium">: {latestHtsStatus.testDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-0.5">
                      <span>Test Result</span>
                      <span className="font-medium">: {latestHtsStatus.testResult}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-0.5">
                      <span>HIV Type</span>
                      <span className="font-medium">: {latestHtsStatus.hivType}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-b">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="flex items-center text-gray-700 text-xs">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13Z" fill="#0284c7"/>
                        <path d="M17 13C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13Z" fill="#0284c7"/>
                        <path d="M12 8C12.5523 8 13 7.55228 13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7C11 7.55228 11.4477 8 12 8Z" fill="#0284c7"/>
                        <path d="M12 18C12.5523 18 13 17.5523 13 17C13 16.4477 12.5523 16 12 16C11.4477 16 11 16.4477 11 17C11 17.5523 11.4477 18 12 18Z" fill="#0284c7"/>
                      </svg>
                      Diagnosis
                    </h4>
                    <Link href="#" className="text-blue-500 text-xs">
                      Preview
                    </Link>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between items-center text-xs py-0.5">
                      <span>NTS</span>
                      <span className="font-medium">: {diagnosis.nts}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-0.5">
                      <span>ICD 11</span>
                      <span className="font-medium">: {diagnosis.icd11}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-b">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="flex items-center text-gray-700 text-xs">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.3 21H14.7C19 21 21 19 21 14.7V9.3C21 5 19 3 14.7 3H9.3C5 3 3 5 3 9.3V14.7C3 19 5 21 9.3 21Z" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 12V15M12 8V8.01M7 12H17" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Treatment Plan
                    </h4>
                    <Link href="#" className="text-blue-500 text-xs">
                      Preview
                    </Link>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between items-center text-xs py-0.5">
                      <span>Treatment Plan</span>
                      <span className="font-medium">:</span>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <h4 className="flex items-center text-gray-700 text-xs">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.96997 22H14.97C19.97 22 21.97 20 21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22Z" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1.96997 12.7L7.96997 12.68C8.71997 12.68 9.55997 13.25 9.83997 13.95L10.98 16.83C11.24 17.48 11.65 17.48 11.91 16.83L14.2 11.02C14.42 10.46 14.83 10.44 15.11 10.97L16.15 12.94C16.46 13.53 17.26 14.01 17.92 14.01H21.98" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Medication Plan
                    </h4>
                    <div className="flex items-center">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px]">
                        LAN Connected
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ArtDialog
        open={artDialogOpen}
        onClose={() => setArtDialogOpen(false)}
        onSave={handleSaveArtVisit}
      />

      <PharmacovigilanceDialog
        open={pharmacovigilanceOpen}
        onClose={() => setPharmacovigilanceOpen(false)}
        onSave={handleSavePharmacovigilance}
      />
      
      <PharmacovigilanceEntryModal
        open={pharmacovigilanceEntryOpen}
        onClose={() => setPharmacovigilanceEntryOpen(false)}
        onOptionSelect={handlePharmacovigilanceOptionSelect}
      />

      {/* Added dialog components from ART module */}
      <PresentHistoryDialog
        open={presentHistoryOpen}
        onClose={() => setPresentHistoryOpen(false)}
        onSave={handleSavePresentHistory}
      />

      <ChronicConditionDialog
        open={chronicConditionOpen}
        onClose={() => setChronicConditionOpen(false)}
        onSave={handleSaveChronicCondition}
      />

      <FamilySocialHistoryDialog
        open={familySocialHistoryOpen}
        onClose={() => setFamilySocialHistoryOpen(false)}
        onSave={handleSaveFamilySocialHistory}
      />

      <HivRiskScreeningDialog
        open={hivRiskScreeningOpen}
        onClose={() => setHivRiskScreeningOpen(false)}
        onSave={handleSaveHivRiskScreening}
      />

      <PastMedicalHistoryDialog
        open={pastMedicalHistoryOpen}
        onClose={() => setPastMedicalHistoryOpen(false)}
        onSave={(data) => {
          console.log("Saving past medical history:", data);
          setPastMedicalHistoryOpen(false);
        }}
      />
    </div>
    </MainLayout>
  );
}