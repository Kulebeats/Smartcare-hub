import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SmartCareHeader } from "@/components/layout/smartcare-header";
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
import { Loader2, Search, User, Phone, Calendar, MapPin, FileText, Activity, Clock, UserCheck, Stethoscope, Plus } from "lucide-react";

// NRC formatting utility function
const formatNRC = (value: string): string => {
  // Remove all non-alphanumeric characters
  const cleanValue = value.replace(/[^0-9]/g, '');
  
  // Apply NRC format: 123456/78/9
  if (cleanValue.length <= 6) {
    return cleanValue;
  } else if (cleanValue.length <= 8) {
    return `${cleanValue.slice(0, 6)}/${cleanValue.slice(6)}`;
  } else {
    return `${cleanValue.slice(0, 6)}/${cleanValue.slice(6, 8)}/${cleanValue.slice(8, 9)}`;
  }
};

export default function ClientSearchPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const currentDate = new Date();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"nrc" | "art_number" | "nupin" | "cellphone" | "full_name">("nrc");
  const [hasSearched, setHasSearched] = useState(false); // Track if search was performed
  const [isSearching, setIsSearching] = useState(false);
  
  // Patient display states
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientList, setPatientList] = useState<any[]>([]);
  const [isAutoLoading, setIsAutoLoading] = useState(true);

  // Get any patient from URL if passed (e.g., after registration)
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patientId");
  
  // Fetch patient details if ID is provided
  const { data: patientData } = useQuery({
    queryKey: ["patients", patientId] as const,
    queryFn: async ({ queryKey }) => {
      if (!queryKey[1]) return null;
      const response = await apiRequest("GET", `/api/patients/${queryKey[1]}`);
      return response;
    },
    enabled: !!patientId
  });
  
  // Set selected patient from patientData whenever it changes
  useEffect(() => {
    if (patientData) {
      setSelectedPatient(patientData);
    }
  }, [patientData]);
  
  // Auto-load recent patients when the component mounts
  const { data: recentPatients, isLoading: isRecentPatientsLoading } = useQuery({
    queryKey: ["recentPatients"] as const,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/patients?limit=10`);
      return response;
    },
    enabled: isAutoLoading
  });
  
  // Handle recent patients data whenever it changes
  useEffect(() => {
    if (recentPatients) {
      if (Array.isArray(recentPatients)) {
        // Always update patient list with what the API returns, even if empty
        setPatientList(recentPatients);
        
        // If there are patients and none are selected, auto-select the first one
        if (recentPatients.length > 0 && !selectedPatient && !patientId) {
          setSelectedPatient(recentPatients[0]);
        }
      }
      setIsAutoLoading(false);
    }
  }, [recentPatients, patientId, selectedPatient]);
  
  // Handle loading state completion
  useEffect(() => {
    if (!isRecentPatientsLoading && isAutoLoading) {
      setIsAutoLoading(false);
    }
  }, [isRecentPatientsLoading, isAutoLoading]);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async () => {
      if (!searchQuery.trim()) {
        toast({
          title: "Search Error",
          description: "Please enter a search term",
          variant: "destructive"
        });
        return null;
      }
      
      const queryParams = new URLSearchParams();
      // Map frontend search types to backend API types
      const apiSearchType = searchType === "full_name" ? "name" : searchType;
      queryParams.append("type", apiSearchType);
      queryParams.append("query", searchQuery);
      
      const response = await apiRequest("GET", `/api/patients/search-safe?${queryParams.toString()}`);
      return response;
    },
    onSuccess: (data) => {
      // Mark that a search has been performed
      setHasSearched(true);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setPatientList(data);
        setSelectedPatient(data[0]);
      } else {
        toast({
          title: "No Results",
          description: "No clients found matching your search criteria",
          variant: "destructive"
        });
        setSelectedPatient(null);
        setPatientList([]);
      }
    },
    onError: () => {
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handler for the search button
  const handleSearch = () => {
    // Debug log
    console.log("Searching with query:", searchQuery, "Search type:", searchType);
    
    // Set hasSearched to true when performing a search
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
    
    searchMutation.mutate();
  };

  // Handler for "Go to profile" button
  const handleEditProfile = () => {
    if (selectedPatient?.id) {
      // For now, redirect to patients page since we don't have a dedicated profile page yet
      setLocation(`/patients`);
      toast({
        title: "Feature Coming Soon",
        description: "The patient profile editor is under development",
        variant: "default"
      });
    }
  };

  // Handler for "Attend to patient" button
  const handleAttendToClient = () => {
    if (selectedPatient?.id) {
      setLocation(`/service-selection?patientId=${selectedPatient.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SmartCare PRO Header */}
      <SmartCareHeader showSearch={true} showPatientServices={true} showFacilitySelector={true} />
      
      <div className="container mx-auto px-4 py-6 pt-20">
        <div className="bg-blue-50 py-8 px-4 rounded-lg mb-8 relative overflow-hidden">
          {/* Decorative background elements - medical icons */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-10 left-10 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.428 4.857l-4.286 4.286-4.286-4.286-4.286 4.286 4.286 4.286-4.286 4.286 4.286 4.286 4.286-4.286 4.286 4.286 4.286-4.286-4.286-4.286 4.286-4.286-4.286-4.286z"/>
              </svg>
            </div>
            <div className="absolute bottom-10 right-10 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z"/>
              </svg>
            </div>
            <div className="absolute top-1/2 left-1/4 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 6h-5c0-1.654-1.346-3-3-3s-3 1.346-3 3h-5v18h16v-18zm-8 0c0-.551.449-1 1-1s1 .449 1 1h-2z"/>
              </svg>
            </div>
            <div className="absolute top-1/4 right-1/4 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 19l1.5-4.5h-5.5l7-9.5-1.5 4.5h5.5l-7 9.5z"/>
              </svg>
            </div>
          </div>
          
          {/* Content with z-index to appear above the background */}
          <div className="relative z-10">
            <h1 className="text-xl text-center font-medium mb-2">Welcome {user?.username || "System Administrator"}</h1>
            <p className="text-center text-gray-600 mb-4">{format(currentDate, "EEEE, MMMM d, yyyy")}</p>
            
            <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">Search or Add New Patient</h2>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button 
                onClick={() => setSearchType("nrc")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${searchType === "nrc" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-700 border border-gray-300"}`}
              >
                NRC
              </button>
              <button 
                onClick={() => setSearchType("nupin")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${searchType === "nupin" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-700 border border-gray-300"}`}
              >
                NUPIN
              </button>
              <button 
                onClick={() => setSearchType("cellphone")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${searchType === "cellphone" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-700 border border-gray-300"}`}
              >
                Cellphone
              </button>
              <button 
                onClick={() => setSearchType("full_name")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${searchType === "full_name" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-700 border border-gray-300"}`}
              >
                Full Name
              </button>
            </div>
            
            <div className="flex items-center w-full max-w-xl mx-auto gap-2">
              <Input
                type="text"
                placeholder={searchType === "nrc" ? "123456/78/9" : `Search by ${searchType}...`}
                className={`flex-1 bg-white border border-gray-300 rounded-md ${
                  searchType === "nrc" ? "font-mono" : ""
                }`}
                style={searchType === "nrc" ? { letterSpacing: '0.1em' } : {}}
                value={searchQuery}
                maxLength={searchType === "nrc" ? 10 : undefined}
                onChange={(e) => {
                  let value = e.target.value;
                  
                  // Apply NRC formatting if search type is NRC
                  if (searchType === "nrc") {
                    value = formatNRC(value);
                  }
                  
                  setSearchQuery(value);
                  // Reset hasSearched when query is cleared
                  if (value === '' && hasSearched) {
                    setHasSearched(false);
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                className="bg-green-500 hover:bg-green-600 text-white rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search
              </Button>
            </div>
            
            {searchType === "nrc" && (
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">Format: 123456/78/9</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Client list with auto-loaded patients and search results */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-700 font-medium">
              Total Records: {patientList.length || (selectedPatient ? 1 : 0)}
              {isRecentPatientsLoading && <span className="ml-2 text-blue-500">(Loading...)</span>}
            </h3>
            <Button 
              onClick={() => setLocation("/patients/new")}
              className="bg-blue-500 hover:bg-blue-600 rounded-full"
            >
              Add New Patient
            </Button>
          </div>
          
          {/* Loading state */}
          {isRecentPatientsLoading && !selectedPatient && (
            <div className="flex justify-center items-center h-32 border border-gray-200 rounded-lg bg-white">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-500">Loading recent patients...</p>
              </div>
            </div>
          )}
          
          {selectedPatient && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
              <div>
                <h3 className="font-bold text-xl text-gray-800 text-indigo-800 mb-2">{selectedPatient.firstName} {selectedPatient.surname}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 mb-3">
                  <div className="flex items-start gap-1">
                    <div className="flex-shrink-0">
                      <span className="inline-block p-1 bg-gray-100 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                          <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-6.664-1.21c-1.11 0-1.656-.767-1.703-1.407h.683c.043.37.387.82 1.051.82.844 0 1.301-.848 1.305-2.164h-.027c-.153.414-.637.79-1.383.79-.852 0-1.676-.61-1.676-1.77 0-1.137.871-1.809 1.797-1.809 1.172 0 1.953.734 1.953 2.668 0 1.805-.742 2.871-2 2.871zm.066-2.544c.625 0 1.184-.484 1.184-1.18 0-.832-.527-1.23-1.16-1.23-.586 0-1.168.387-1.168 1.21 0 .817.543 1.2 1.144 1.2zm-2.957-2.473v5.04h-.687v-4.55H5.46v-.49h1.984z"/>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-xs">
                        {selectedPatient.dateOfBirth ? 
                          format(new Date(selectedPatient.dateOfBirth), 'dd MMM yyyy') + 
                          (selectedPatient.age ? ` (${selectedPatient.age})` : '') : 
                          'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1">
                    <div className="flex-shrink-0">
                      <span className="inline-block p-1 bg-gray-100 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                          <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sex</p>
                      <p className="text-xs">{selectedPatient.sex || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1">
                    <div className="flex-shrink-0">
                      <span className="inline-block p-1 bg-gray-100 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                          <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
                          <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cellphone</p>
                      <p className="text-xs">{selectedPatient.cellphoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1">
                    <div className="flex-shrink-0">
                      <span className="inline-block p-1 bg-gray-100 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">NUPIN</p>
                      <p className="text-xs">{selectedPatient.nupin || 'Not assigned'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1">
                    <div className="flex-shrink-0">
                      <span className="inline-block p-1 bg-gray-100 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                          <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                          <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">NRC</p>
                      <p className="text-xs">{selectedPatient.nrc || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1">
                    <div className="flex-shrink-0">
                      <span className="inline-block p-1 bg-gray-100 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                          <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mother's Name</p>
                      <p className="text-xs">{selectedPatient.mothersName || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  size="sm"
                  variant="outline" 
                  className="rounded-full px-4 py-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="rounded-full px-4 py-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  Admission
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="rounded-full px-4 py-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  Appointment
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="rounded-full px-4 py-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  Assign Queue
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="rounded-full px-4 py-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  Historical visit
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="rounded-full px-4 py-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  Binding
                </Button>
                <Button 
                  size="sm"
                  className="rounded-full px-4 py-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleAttendToClient}
                >
                  Attend to Patient
                </Button>
              </div>
            </div>
          )}
          
          {/* Clean, minimal empty state with exact messaging from the screenshot */}
          {((!isRecentPatientsLoading && hasSearched && patientList.length === 0) || 
            (!isRecentPatientsLoading && patientList.length === 0 && !hasSearched)) && (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-gray-600 mb-4">No patients found. Try a different search or add a new patient.</p>
              <Button 
                onClick={() => setLocation("/patients/new")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
              >
                Add New Patient
              </Button>
            </div>
          )}
          
          {/* Display list of recent patients */}
          {!isRecentPatientsLoading && patientList.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Recent Patients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {patientList.map(patient => (
                  <div 
                    key={patient.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPatient && selectedPatient.id === patient.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900">{patient.firstName} {patient.surname}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-1">
                        {patient.sex || 'Unknown'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">NRC:</span> {patient.nrc || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">NUPIN:</span> {patient.nupin || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">DoB:</span> {patient.dateOfBirth ? 
                          format(new Date(patient.dateOfBirth), 'dd-MMM-yyyy') : 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {patient.cellphoneNumber || 'N/A'}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm" 
                        variant="outline"
                        className="text-xs px-2 py-0 h-6 rounded-full text-green-600 border-green-300 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                          handleAttendToClient();
                        }}
                      >
                        Attend
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}