import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/main-layout";
import { PageLoader, DataLoader, CardLoader } from "@/components/ui/loading-spinner";
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Heart, 
  Shield, 
  Building,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Pill,
  Baby,
  Activity
} from "lucide-react";

interface PatientJourneyProps {
  patientId?: string;
}

export default function PatientJourneyPage() {
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patientId');

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ["/api/facilities"],
  });

  if (!patientId) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Patient Journey</h1>
            <p className="text-muted-foreground mb-6">No patient selected. Please register a new patient or search for an existing one.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/patients/register")}>
                <User className="h-4 w-4 mr-2" />
                Register New Patient
              </Button>
              <Button variant="outline" onClick={() => navigate("/client-search")}>
                Search Patients
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (patientLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 max-w-4xl">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading patient information...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const patientFacility = facilities.find(f => f.name === patient?.facility);

  const serviceOptions = [
    {
      id: "anc",
      name: "Antenatal Care (ANC)",
      description: "Comprehensive maternal health services",
      icon: Baby,
      available: patient?.sex === "Female",
      color: "bg-pink-100 text-pink-800",
      route: "/anc"
    },
    {
      id: "art",
      name: "Antiretroviral Therapy (ART)",
      description: "HIV treatment and monitoring",
      icon: Pill,
      available: true,
      color: "bg-blue-100 text-blue-800",
      route: "/art"
    },
    {
      id: "prep",
      name: "Pre-Exposure Prophylaxis (PrEP)",
      description: "HIV prevention services",
      icon: Shield,
      available: true,
      color: "bg-green-100 text-green-800",
      route: "/prep"
    },
    {
      id: "pharmacovigilance",
      name: "Pharmacovigilance",
      description: "Drug safety monitoring",
      icon: AlertTriangle,
      available: true,
      color: "bg-amber-100 text-amber-800",
      route: "/pharmacovigilance"
    }
  ];

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const patientAge = calculateAge(patient?.date_of_birth || patient?.dateOfBirth);

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Patient Journey Dashboard</h1>
          <Badge variant="outline" className="ml-auto">
            Patient ID: {patientId}
          </Badge>
        </div>

        {/* Patient Overview Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {patient?.first_name || patient?.firstName} {patient?.surname}
                </CardTitle>
                <CardDescription>
                  {patient?.sex} • Age {patientAge} • NRC: {patient?.nrc || "Not provided"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Registered
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">
                    {patient?.cellphone || patient?.cellphoneNumber || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Facility</p>
                  <p className="text-sm text-muted-foreground">
                    {patient?.facility}
                  </p>
                  {patientFacility && (
                    <Badge variant="outline" className="text-xs mt-1">
                      HMIS: {patientFacility.code}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(patient?.date_of_birth || patient?.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Available Services</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="alerts">Clinical Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceOptions.map((service) => (
                <Card key={service.id} className={`transition-all hover:shadow-md ${!service.available ? 'opacity-50' : 'cursor-pointer hover:border-primary'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${service.color}`}>
                          <service.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                      {service.available && (
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <Badge variant={service.available ? "secondary" : "outline"}>
                        {service.available ? "Available" : "Not Applicable"}
                      </Badge>
                      {service.available && (
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`${service.route}?patientId=${patientId}`)}
                        >
                          Start Service
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" onClick={() => navigate("/transfers")}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Transfer Patient
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/medical-records")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Medical Records
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/reports")}>
                    <Activity className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical History
                </CardTitle>
                <CardDescription>
                  Complete medical record and service history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Patient Registration</p>
                      <p className="text-sm text-muted-foreground">
                        Registered on {new Date(patient?.last_updated || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No additional medical history available.</p>
                    <p className="text-sm">Medical records will appear here as services are provided.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Clinical Alerts & Reminders
                </CardTitle>
                <CardDescription>
                  Active clinical decision support alerts and follow-up reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient?.sex === "Female" && patientAge >= 15 && patientAge <= 49 && (
                    <div className="flex items-center gap-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                      <Baby className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="font-medium text-pink-800">Reproductive Health Screening</p>
                        <p className="text-sm text-pink-700">
                          Consider ANC services if pregnant or family planning consultation
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">HIV Prevention</p>
                      <p className="text-sm text-blue-700">
                        Consider HIV testing and PrEP counseling for prevention
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All clinical alerts reviewed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}