import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format, differenceInYears } from 'date-fns';
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";

export default function PatientRecords() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    nrc: "",
    nupin: "",
    cellphone: "",
    artNumber: "",
    name: "", // Combined field for first name and surname search
    firstName: "",
    surname: "",
    dob: "",
    sex: "",
    activeTab: "nrc" // Track active tab
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [, setLocation] = useLocation();

  // Function to format NRC properly following Zambian NRC standards (XXXXXX/YY/Z format)
  const formatNRC = (value: string): string => {
    // Remove any non-alphanumeric characters except slashes
    let input = value.replace(/[^0-9A-Za-z\/]/gi, '').toUpperCase();

    // Remove all slashes and process the raw input
    const rawInput = input.replace(/\//g, '');

    // Build formatted NRC with proper placement of slashes
    let formatted = '';

    // First part: Sequential number (6 characters)
    if (rawInput.length > 0) {
      formatted = rawInput.substring(0, Math.min(6, rawInput.length));
    }

    // Second part: Province and district code (2 characters) - add with slash
    if (rawInput.length > 6) {
      formatted += '/' + rawInput.substring(6, Math.min(8, rawInput.length));
    }

    // Third part: Check digit (1 character) - add with slash
    if (rawInput.length > 8) {
      formatted += '/' + rawInput.substring(8, 9);
    }

    return formatted;
  };

  // Build query parameters based on the active search tab
  const buildSearchQuery = () => {
    const query = new URLSearchParams();
    
    // Add parameters based on active tab
    switch(searchParams.activeTab) {
      case 'nrc':
        if (searchParams.nrc) query.append('nrc', searchParams.nrc);
        break;
      case 'nupin':
        if (searchParams.nupin) query.append('nupin', searchParams.nupin);
        break;
      case 'cellphone':
        if (searchParams.cellphone) query.append('cellphone', searchParams.cellphone);
        break;
      case 'fullname':
        // For name search, combine first name and surname
        if (searchParams.firstName || searchParams.surname) {
          const nameSearch = [searchParams.firstName, searchParams.surname]
            .filter(Boolean)
            .join(' ')
            .trim();
          if (nameSearch) query.append('name', nameSearch);
        }
        if (searchParams.sex) query.append('sex', searchParams.sex);
        // Add age calculation from DOB if provided
        if (searchParams.dob) {
          const birthDate = new Date(searchParams.dob);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          query.append('minAge', (age - 1).toString());
          query.append('maxAge', (age + 1).toString());
        }
        break;
    }
    
    return query.toString();
  };

  const handleSearch = async () => {
    // Reset previous search state
    setHasSearched(true);
    setIsSearching(true);
    setShowNoResults(false);
    
    try {
      let searchUrl = '';
      let searchValue = '';
      
      // Use specific search endpoint based on active tab
      switch(searchParams.activeTab) {
        case 'nrc':
          if (!searchParams.nrc.trim()) {
            toast({
              title: "Search Error",
              description: "Please enter an NRC number",
              variant: "destructive"
            });
            setIsSearching(false);
            return;
          }
          searchUrl = `/api/patients/search-safe?type=nrc&query=${encodeURIComponent(searchParams.nrc)}`;
          searchValue = searchParams.nrc;
          break;
          
        case 'artNumber':
          if (!searchParams.artNumber.trim()) {
            toast({
              title: "Search Error",
              description: "Please enter an ART Number",
              variant: "destructive"
            });
            setIsSearching(false);
            return;
          }
          searchUrl = `/api/patients/search-safe?type=art_number&query=${encodeURIComponent(searchParams.artNumber)}`;
          searchValue = searchParams.artNumber;
          break;
          
        case 'nupin':
          if (!searchParams.nupin.trim()) {
            toast({
              title: "Search Error",
              description: "Please enter a NUPIN number",
              variant: "destructive"
            });
            setIsSearching(false);
            return;
          }
          searchUrl = `/api/patients/search-safe?type=nupin&query=${encodeURIComponent(searchParams.nupin)}`;
          searchValue = searchParams.nupin;
          break;
          
        case 'cellphone':
          if (!searchParams.cellphone.trim()) {
            toast({
              title: "Search Error",
              description: "Please enter a phone number",
              variant: "destructive"
            });
            setIsSearching(false);
            return;
          }
          searchUrl = `/api/patients/search-safe?type=cellphone&query=${encodeURIComponent(searchParams.cellphone)}`;
          searchValue = searchParams.cellphone;
          break;
          
        case 'fullname':
          if (!searchParams.firstName.trim() && !searchParams.surname.trim()) {
            toast({
              title: "Search Error",
              description: "Please enter a first name or surname",
              variant: "destructive"
            });
            setIsSearching(false);
            return;
          }
          
          // Build name search query
          const fullName = `${searchParams.firstName} ${searchParams.surname}`.trim();
          searchUrl = `/api/patients/search-safe?type=name&query=${encodeURIComponent(fullName)}`;
          searchValue = fullName;
          break;
          
        default:
          toast({
            title: "Search Error", 
            description: "Please select a search method",
            variant: "destructive"
          });
          setIsSearching(false);
          return;
      }
      
      // Make API request
      const response = await fetch(searchUrl);
      
      // Handle authentication errors
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to continue",
          variant: "destructive"
        });
        // Redirect to login after a brief delay
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      
      // Handle other HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API error:', errorText);
        throw new Error(`Search failed with status ${response.status}`);
      }
      
      // Check content type to ensure we got JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Expected JSON but got:', contentType, responseText.substring(0, 200));
        throw new Error('Server returned unexpected response format');
      }
      
      const data = await response.json();
      
      // Handle new API response format
      if (data.success && Array.isArray(data.results)) {
        setSearchResults(data.results);
        setShowNoResults(data.results.length === 0);
      } else {
        // Fallback for other response formats
        const patients = Array.isArray(data) ? data : [];
        setSearchResults(patients);
        setShowNoResults(patients.length === 0);
      }
      
      // Show success message if results found  
      const resultCount = data.success ? data.results.length : (Array.isArray(data) ? data.length : 0);
      if (resultCount > 0) {
        toast({
          title: "Search Complete",
          description: `Found ${resultCount} patient${resultCount === 1 ? '' : 's'} matching "${searchValue}"`,
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Search Failed",
        description: "An error occurred while searching for patients",
        variant: "destructive"
      });
      setShowNoResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Track active tab changes
  const handleTabChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, activeTab: value }));
  };



  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#4A4A4A] mb-1">
            Welcome {user?.firstName || user?.username || "Administrator"} {user?.lastName || ""}
          </h1>
          <div className="text-right text-sm text-gray-500">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </div>
        </div>

        <div className="rounded-3xl shadow-sm p-8 mt-6 relative text-[#326ab8] bg-[#e3e8e78c]">
          {/* Background decorative elements */}
          <div className="absolute top-6 left-10 opacity-5">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"></path>
            </svg>
          </div>
          <div className="absolute bottom-6 right-10 opacity-5">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 8c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"></path>
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
              <path d="M14.14 12l-2.58 2.58-1.14-1.14-1.28 1.28 2.42 2.42 3.86-3.86z"></path>
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-center mb-6 relative z-10 bg-[#13273b00] text-[#0842a6]">
            Search or Add New Patient
          </h2>

          <Tabs 
            value={searchParams.activeTab} 
            onValueChange={handleTabChange} 
            className="w-full relative z-10"
          >
            <TabsList className="grid grid-cols-5 w-full mb-6 bg-white/20 rounded-3xl p-2">
              <TabsTrigger value="nrc" className="rounded-3xl py-3 px-4 text-sm data-[state=active]:bg-[#0072BC] data-[state=active]:text-white data-[state=inactive]:text-gray-700 bg-[#0d78bd00] text-[#000000]">NRC</TabsTrigger>
              <TabsTrigger value="artNumber" className="rounded-3xl py-3 px-4 text-sm data-[state=active]:bg-[#0072BC] data-[state=active]:text-white data-[state=inactive]:text-gray-700 bg-[#0d78bd00] text-[#000000]">ART Number</TabsTrigger>
              <TabsTrigger value="nupin" className="rounded-3xl py-3 px-4 text-sm data-[state=active]:bg-[#0072BC] data-[state=active]:text-white data-[state=inactive]:text-gray-700 bg-[#0d78bd00] text-[#000000]">NUPIN</TabsTrigger>
              <TabsTrigger value="cellphone" className="rounded-3xl py-3 px-4 text-sm data-[state=active]:bg-[#0072BC] data-[state=active]:text-white data-[state=inactive]:text-gray-700 bg-[#0d78bd00] text-[#000000]">Cellphone</TabsTrigger>
              <TabsTrigger value="fullname" className="rounded-3xl py-3 px-4 text-sm data-[state=active]:bg-[#0072BC] data-[state=active]:text-white data-[state=inactive]:text-gray-700 bg-[#0d78bd00] text-[#000000]">Full Name</TabsTrigger>
            </TabsList>

            <TabsContent value="nrc">
              <Input 
                value={searchParams.nrc}
                onChange={(e) => {
                  const formatted = formatNRC(e.target.value);
                  setSearchParams({...searchParams, nrc: formatted});
                }}
                placeholder="______/__/_"
                className="mb-6 text-center text-lg py-6 font-mono rounded-3xl bg-white/80 border-0 shadow-sm"
                style={{ letterSpacing: '0.1em' }}
                maxLength={10}
              />
            </TabsContent>

            <TabsContent value="artNumber">
              <Input 
                value={searchParams.artNumber}
                onChange={(e) => setSearchParams({...searchParams, artNumber: e.target.value})}
                placeholder="Enter ART Number"
                className="mb-6 text-center text-lg py-6 rounded-3xl bg-white/80 border-0 shadow-sm"
              />
            </TabsContent>

            <TabsContent value="nupin">
              <Input 
                value={searchParams.nupin}
                onChange={(e) => setSearchParams({...searchParams, nupin: e.target.value})}
                placeholder="----------------"
                className="mb-6 text-center text-lg py-6 rounded-3xl bg-white/80 border-0 shadow-sm"
              />
            </TabsContent>

            <TabsContent value="cellphone">
              <div className="flex gap-2 mb-6">
                <Select defaultValue="zm">
                  <SelectTrigger className="w-[100px] rounded-3xl bg-white/80 border-0 shadow-sm">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zm">ZM (+260)</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  value={searchParams.cellphone}
                  onChange={(e) => setSearchParams({...searchParams, cellphone: e.target.value})}
                  placeholder="----------------"
                  className="text-center text-lg py-6 rounded-3xl bg-white/80 border-0 shadow-sm"
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
                    className="rounded-3xl bg-white/80 border-0 shadow-sm"
                  />
                  <Input 
                    value={searchParams.surname}
                    onChange={(e) => setSearchParams({...searchParams, surname: e.target.value})}
                    placeholder="Surname"
                    className="rounded-3xl bg-white/80 border-0 shadow-sm"
                  />
                  <Input 
                    type="date"
                    value={searchParams.dob}
                    onChange={(e) => setSearchParams({...searchParams, dob: e.target.value})}
                    placeholder="DOB"
                    className="rounded-3xl bg-white/80 border-0 shadow-sm"
                  />
                  <Select value={searchParams.sex} onValueChange={(value) => setSearchParams({...searchParams, sex: value})}>
                    <SelectTrigger className="rounded-3xl bg-white/80 border-0 shadow-sm">
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
              className="w-1/5 mt-6 bg-[#00B559] hover:bg-[#00A651] rounded-full py-3 px-4 mx-auto block text-sm font-medium flex items-center justify-center shadow-lg"
              disabled={isSearching}
            >
              <span className="flex items-center">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-1" />
                )}
                {isSearching ? "Searching..." : "Search"}
              </span>
            </Button>
          </Tabs>
        </div>

        {/* Demo ANC Module Access */}
        <div className="mt-8 text-center p-6 border rounded-3xl bg-blue-50">
          <p className="text-gray-700 mb-4">Demo: Test the ANC module with sample data</p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline"
              className="bg-green-500 text-white hover:bg-green-600 border-green-500 rounded-full py-3 px-6 text-sm font-medium shadow-lg"
              onClick={() => setLocation("/anc/demo")}
            >
              Demo ANC Module
            </Button>
            <Button 
              variant="outline"
              className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500 rounded-full py-3 px-6 text-sm font-medium shadow-lg"
              onClick={() => setLocation("/patients/new")}
            >
              Add New Patient
            </Button>
          </div>
        </div>

        {showNoResults && (
          <div className="mt-8 text-center p-6 border rounded-3xl">
            <p className="text-gray-600 mb-4">Didn't find the client you were looking for?</p>
            <Button 
              variant="outline"
              className="w-1/5 bg-blue-500 text-white hover:bg-blue-600 border-blue-500 rounded-full py-3 px-4 mx-auto block text-sm font-medium shadow-lg"
              onClick={() => setLocation("/patients/new")}
            >
              Add New Patient
            </Button>
          </div>
        )}

        {hasSearched && Array.isArray(searchResults) && searchResults.length > 0 ? (
          <div className="mt-8 space-y-4">
            {searchResults.map((patient) => (
              <Card key={patient.id} className="p-6 border border-gray-200 rounded-3xl">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {patient.first_name} {patient.surname}
                    </h3>
                    
                    <div className="grid grid-cols-7 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Date of Birth</p>
                        <p className="text-gray-900">
                          {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'dd-MMM-yyyy') : 'Unknown'} 
                          {patient.date_of_birth && ` (${differenceInYears(new Date(), new Date(patient.date_of_birth))}Y)`}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 font-medium">Sex</p>
                        <p className="text-gray-900">{patient.sex === 'female' ? '♀ Female' : patient.sex === 'male' ? '♂ Male' : patient.sex || 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 font-medium">Cellphone</p>
                        <p className="text-gray-900">+260 {patient.cellphone || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 font-medium">NUPIN</p>
                        <p className="text-gray-900">{patient.nupin || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 font-medium">ART Number</p>
                        <p className="text-gray-900">{patient.art_number || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 font-medium">NRC</p>
                        <p className="text-gray-900">{patient.nrc || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 font-medium">Mother's Name</p>
                        <p className="text-gray-900">{patient.mothers_name || 'N/A'} {patient.mothers_surname || ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  >
                    Edit Client
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  >
                    Admissions
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  >
                    Appointments
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  >
                    Height/Weight
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  >
                    Recent Visits
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  >
                    Invoices
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-purple-500 text-white hover:bg-purple-600 border-purple-500"
                    onClick={() => setLocation(`/patients/${patient.id}/anc/followup`)}
                  >
                    ANC Follow-up
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600 border-green-500"
                    onClick={() => setLocation(`/service-selection?patientId=${patient.id}`)}
                  >
                    Attend to Patient
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : null}


      </div>
    </MainLayout>
  );
}