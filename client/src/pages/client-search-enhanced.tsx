import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { format, differenceInYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Search, User, Phone, Calendar, MapPin, FileText, Activity, Clock, UserCheck, Stethoscope, Plus, AlertCircle } from "lucide-react";

interface Patient {
  id: number;
  first_name: string;
  surname: string;
  date_of_birth: string;
  sex: string;
  cellphone_number?: string;
  nupin?: string;
  art_number?: string;
  nrc?: string;
  mothers_name?: string;
}

export default function ClientSearchEnhancedPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"nrc" | "art_number" | "nupin" | "cellphone" | "full_name">("nrc");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async () => {
      if (!searchQuery.trim()) {
        throw new Error("Please enter a search term");
      }
      
      setIsSearching(true);
      const queryParams = new URLSearchParams();
      queryParams.append("type", searchType);
      queryParams.append("query", searchQuery);
      
      const response = await apiRequest("GET", `/api/patients-search?${queryParams.toString()}`);
      return response;
    },
    onSuccess: (data) => {
      setHasSearched(true);
      setIsSearching(false);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
        toast({
          title: "No Results",
          description: "No patient records found matching your search criteria. You can try different search terms or Add New Patient.",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      setIsSearching(false);
      toast({
        title: "Search Error",
        description: error.message || "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handler for the search button
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }
    
    searchMutation.mutate();
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): string => {
    try {
      const age = differenceInYears(new Date(), new Date(dateOfBirth));
      return `${age}y`;
    } catch {
      return "N/A";
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd-MMM-yyyy");
    } catch {
      return "N/A";
    }
  };

  // Action button handlers
  const handleEditProfile = (patient: Patient) => {
    setLocation(`/patients/edit/${patient.id}`);
  };

  const handleAdmission = (patient: Patient) => {
    setLocation(`/admission?patientId=${patient.id}`);
  };

  const handleAppointment = (patient: Patient) => {
    setLocation(`/appointments?patientId=${patient.id}`);
  };

  const handleAssignQueue = (patient: Patient) => {
    setLocation(`/queue?patientId=${patient.id}`);
  };

  const handleHistoricalVisit = (patient: Patient) => {
    setLocation(`/medical-records?patientId=${patient.id}`);
  };

  const handleVitals = (patient: Patient) => {
    setLocation(`/vitals?patientId=${patient.id}`);
  };

  const handleAttendToPatient = (patient: Patient) => {
    // Navigate to service selection page with patient context
    setLocation(`/service-selection?patientId=${patient.id}&patientName=${encodeURIComponent(patient.first_name + ' ' + patient.surname)}`);
  };

  const handleAddNewPatient = () => {
    setLocation("/new-patient");
  };

  // Single patient result component
  const PatientResultCard = ({ patient }: { patient: Patient }) => (
    <Card className="w-full mb-4 border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-blue-900">
              {patient.first_name} {patient.surname}
            </h3>
          </div>
          
          <div className="md:col-span-1 text-sm">
            <div className="font-medium text-gray-700">Date of Birth</div>
            <div>{formatDate(patient.date_of_birth)} ({calculateAge(patient.date_of_birth)})</div>
          </div>
          
          <div className="md:col-span-1 text-sm">
            <div className="font-medium text-gray-700">Sex</div>
            <div className="capitalize">{patient.sex}</div>
          </div>
          
          <div className="md:col-span-1 text-sm">
            <div className="font-medium text-gray-700">Cellphone</div>
            <div>{patient.cellphone_number || "N/A"}</div>
          </div>
          
          <div className="md:col-span-1 text-sm">
            <div className="font-medium text-gray-700">NUPIN</div>
            <div>{patient.nupin || "N/A"}</div>
          </div>
          
          <div className="md:col-span-1 text-sm">
            <div className="font-medium text-gray-700">ART Number</div>
            <div>{patient.art_number || "N/A"}</div>
          </div>
          
          <div className="md:col-span-1 text-sm">
            <div className="font-medium text-gray-700">NRC</div>
            <div>{patient.nrc || "N/A"}</div>
          </div>
        </div>
        
        {patient.mothers_name && (
          <div className="mt-4">
            <div className="font-medium text-gray-700 text-sm">Mother's Name</div>
            <div className="text-sm">{patient.mothers_name}</div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            onClick={() => handleEditProfile(patient)}
            variant="outline"
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <User className="w-4 h-4 mr-1" />
            Edit Profile
          </Button>
          
          <Button
            onClick={() => handleAdmission(patient)}
            variant="outline"
            size="sm"
            className="bg-purple-500 text-white hover:bg-purple-600"
          >
            <FileText className="w-4 h-4 mr-1" />
            Admission
          </Button>
          
          <Button
            onClick={() => handleAppointment(patient)}
            variant="outline"
            size="sm"
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Appointment
          </Button>
          
          <Button
            onClick={() => handleAssignQueue(patient)}
            variant="outline"
            size="sm"
            className="bg-yellow-500 text-white hover:bg-yellow-600"
          >
            <Clock className="w-4 h-4 mr-1" />
            Assign Queue
          </Button>
          
          <Button
            onClick={() => handleHistoricalVisit(patient)}
            variant="outline"
            size="sm"
            className="bg-indigo-500 text-white hover:bg-indigo-600"
          >
            <Activity className="w-4 h-4 mr-1" />
            Historical Visit
          </Button>
          
          <Button
            onClick={() => handleVitals(patient)}
            variant="outline"
            size="sm"
            className="bg-pink-500 text-white hover:bg-pink-600"
          >
            <Stethoscope className="w-4 h-4 mr-1" />
            Vitals
          </Button>
          
          <Button
            onClick={() => handleAttendToPatient(patient)}
            variant="outline"
            size="sm"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Attend to Patient
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome {user?.username || 'User'}
            </h1>
            <p className="text-gray-600">
              {format(new Date(), "EEEE, MMMM dd, yyyy")}
            </p>
          </div>

          {/* Search Card */}
          <Card className="max-w-4xl mx-auto mb-8 shadow-lg">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-2xl text-center">
                Search or Add New Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search Type Selection */}
              <div className="mb-6">
                <RadioGroup
                  value={searchType}
                  onValueChange={(value) => setSearchType(value as typeof searchType)}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nrc" id="nrc" className="text-blue-600" />
                    <Label htmlFor="nrc" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      NRC
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="art_number" id="art_number" className="text-blue-600" />
                    <Label htmlFor="art_number" className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200">
                      ART Number
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nupin" id="nupin" className="text-blue-600" />
                    <Label htmlFor="nupin" className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200">
                      NUPIN
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cellphone" id="cellphone" className="text-blue-600" />
                    <Label htmlFor="cellphone" className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200">
                      Cellphone
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full_name" id="full_name" className="text-blue-600" />
                    <Label htmlFor="full_name" className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200">
                      Full Name
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Search Input and Button */}
              <div className="flex gap-4 max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder={`Enter ${searchType === 'full_name' ? 'full name' : searchType.toUpperCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 text-lg p-4 border-2 border-gray-300 focus:border-blue-500"
                  disabled={isSearching}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-medium"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Add New Patient Button */}
              <div className="text-center mt-4">
                <Button
                  onClick={handleAddNewPatient}
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Patient
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {hasSearched && (
            <div className="max-w-6xl mx-auto">
              {searchResults.length > 0 ? (
                <div>
                  <div className="mb-4 text-center">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {searchResults.length === 1 
                        ? "1 patient record found"
                        : `${searchResults.length} patient records found`
                      }
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {searchResults.map((patient) => (
                      <PatientResultCard key={patient.id} patient={patient} />
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="max-w-2xl mx-auto text-center p-8">
                  <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Patient Records Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No patient records found matching your search criteria. 
                    You can try different search terms or add a new patient.
                  </p>
                  <Button
                    onClick={handleAddNewPatient}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Patient
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}