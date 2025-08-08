import React from "react";
import { ArtCard } from "@/components/medical-record/art-card-new";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { User, UserRound, Home, UsersRound, Activity, Clipboard } from "lucide-react";

export default function ArtPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Patient data would typically come from an API
  const patient = {
    id: 123,
    name: "John Doe",
    age: 35,
    gender: "Male",
    artNumber: "ART-2025-001",
    dateEnrolled: "2025-01-15",
    status: "Active"
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0072BC]">Antiretroviral Therapy (ART)</h1>
        <p className="text-gray-500">Manage ART records and follow-up visits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0072BC]">Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UserRound className="h-6 w-6 text-[#0072BC]" />
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.age} years, {patient.gender}</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ART Number</p>
                    <p>{patient.artNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date Enrolled</p>
                    <p>{patient.dateEnrolled}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      <p>{patient.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/patients")}>
              <UsersRound className="mr-2 h-4 w-4" />
              Back to Patient List
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/dashboard")}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="art" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="art">ART Records</TabsTrigger>
              <TabsTrigger value="history">Treatment History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="art" className="mt-4">
              <ArtCard />
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0072BC]">Treatment History</CardTitle>
                  <CardDescription>
                    Past ART visits and treatments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-l-4 border-[#0072BC] pl-4 py-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">2025-04-02</h3>
                        <span className="text-sm text-gray-500">Follow-up Visit</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Regimen:</span> TDF + 3TC + DTG
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span> 2 months
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">CD4:</span> 450 cells/mm³
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Viral Load:</span> Suppressed
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-[#0072BC] pl-4 py-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">2025-02-05</h3>
                        <span className="text-sm text-gray-500">Follow-up Visit</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Regimen:</span> TDF + 3TC + DTG
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span> 2 months
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">CD4:</span> 420 cells/mm³
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Viral Load:</span> 45 copies/mL
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-[#0072BC] pl-4 py-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">2025-01-15</h3>
                        <span className="text-sm text-gray-500">Initial Enrollment</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Regimen:</span> TDF + 3TC + DTG
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span> 1 month
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">CD4:</span> 380 cells/mm³
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Viral Load:</span> 150 copies/mL
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}