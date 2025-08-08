import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Patient } from "@shared/schema";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PatientRecords() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    nrc: "",
    nupin: "",
    cellphone: "",
    firstName: "",
    surname: "",
    dob: "",
    sex: ""
  });

  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    // TODO: Implement actual search logic
    setShowNoResults(true);
    setSearchResults([]);
  };

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="/zambia-coat-of-arms.jpg" alt="Logo" className="h-10" />
              <h1>
                <span className="text-[#00A651]">Smart</span>
                <span className="text-[#0072BC]">Care</span>
                <span className="text-[#0072BC] font-bold">PRO</span>
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.facility}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-[#4A4A4A]">Search or Add New Patient</h2>
        </div>

        <Tabs defaultValue="nrc" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="nrc">NRC</TabsTrigger>
            <TabsTrigger value="nupin">NUPIN</TabsTrigger>
            <TabsTrigger value="cellphone">Cellphone</TabsTrigger>
            <TabsTrigger value="fullname">Full Name</TabsTrigger>
          </TabsList>

          <TabsContent value="nrc">
            <Input 
              value={searchParams.nrc}
              onChange={(e) => setSearchParams({...searchParams, nrc: e.target.value})}
              placeholder="Enter NRC"
              className="mb-4"
            />
          </TabsContent>

          <TabsContent value="nupin">
            <Input 
              value={searchParams.nupin}
              onChange={(e) => setSearchParams({...searchParams, nupin: e.target.value})}
              placeholder="Enter NUPIN"
              className="mb-4"
            />
          </TabsContent>

          <TabsContent value="cellphone">
            <div className="flex gap-2 mb-4">
              <Select defaultValue="zm">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zm">ZM (+260)</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                value={searchParams.cellphone}
                onChange={(e) => setSearchParams({...searchParams, cellphone: e.target.value})}
                placeholder="Enter Cellphone"
              />
            </div>
          </TabsContent>

          <TabsContent value="fullname">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Please enter at least a first name or surname and select the gender to search
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  value={searchParams.firstName}
                  onChange={(e) => setSearchParams({...searchParams, firstName: e.target.value})}
                  placeholder="First Name"
                />
                <Input 
                  value={searchParams.surname}
                  onChange={(e) => setSearchParams({...searchParams, surname: e.target.value})}
                  placeholder="Surname"
                />
                <Input 
                  type="date"
                  value={searchParams.dob}
                  onChange={(e) => setSearchParams({...searchParams, dob: e.target.value})}
                  placeholder="DOB"
                />
                <Select value={searchParams.sex} onValueChange={(value) => setSearchParams({...searchParams, sex: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <Button 
            onClick={handleSearch}
            className="w-full mt-4 bg-[#00B559] hover:bg-[#00A651]"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </Tabs>

        {showNoResults && (
          <div className="mt-8 text-center p-6 border rounded-lg">
            <p className="text-gray-600 mb-4">Didn't find the client you were looking for?</p>
            <Button 
              variant="outline"
              className="bg-[#00B559] text-white hover:bg-[#00A651]"
              onClick={() => setLocation("/patients/new")}
            >
              Add New Patient
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {patients?.map((patient) => (
            <Card key={patient.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{patient.name}</h3>
                  <p className="text-sm text-gray-600">
                    ART Number: {patient.artNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    NUPIN: {patient.nupin}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Add Encounter (OPD)</DropdownMenuItem>
                    <DropdownMenuItem>Order Tests</DropdownMenuItem>
                    <DropdownMenuItem>Prescribe</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Sex:</span> {patient.sex}
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>{" "}
                  {new Date().getFullYear() -
                    new Date(patient.birthDate).getFullYear()}
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>{" "}
                  {patient.cellphone}
                </div>
                <div>
                  <span className="text-gray-600">NIC:</span> {patient.nic}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}