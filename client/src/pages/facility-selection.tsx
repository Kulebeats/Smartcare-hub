import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Lock, Search, Building, MapPin, FileCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartCareHeader } from "@/components/layout/smartcare-header";
import ecgBackground from "@/assets/ecg-background-modern.svg";

// Define TypeScript interfaces for Facility data
interface Facility {
  id: number;
  name: string;
  code: string;
  province: string;
  district: string;
  type?: string;
  level?: string;
  ownership?: string;
  status?: string;
}

export default function FacilitySelectionPage() {
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();
  
  // Users can change facilities at any time
  const hasFacility = false; // Set to false to always show facility selection

  // Fetch all provinces
  const { 
    data: provinces = [] as string[], 
    isLoading: isLoadingProvinces 
  } = useQuery<string[]>({
    queryKey: ['/api/facilities/provinces'],
    enabled: !hasFacility,
  });

  // Fetch districts based on selected province
  const { 
    data: districts = [] as string[], 
    isLoading: isLoadingDistricts 
  } = useQuery<string[]>({
    queryKey: [`/api/facilities/districts/${selectedProvince}`],
    enabled: !hasFacility && !!selectedProvince,
  });

  // Fetch facilities from the API - conditionally by district/province or all
  const { 
    data: allFacilitiesData = [] as Facility[],
    isLoading: isLoadingAllFacilities,
  } = useQuery<Facility[]>({
    queryKey: ['/api/facilities/all'],
    enabled: !hasFacility,
  });

  // Fetch facilities by district when a district is selected
  const {
    data: districtFacilitiesData = [] as Facility[],
    isLoading: isLoadingDistrictFacilities,
  } = useQuery<Facility[]>({
    queryKey: [`/api/facilities/byDistrict/${selectedDistrict}`],
    enabled: !hasFacility && !!selectedDistrict && !searchMode,
  });

  // Process all facilities data for the component
  const allFacilities: Facility[] = allFacilitiesData;

  // Update filtered facilities when district changes or search is performed
  useEffect(() => {
    if (searchMode && searchQuery) {
      // Apply search filter across all facilities
      const filtered = allFacilities.filter(facility => 
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.province.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFacilities(filtered);
    } else if (selectedDistrict && Array.isArray(districtFacilitiesData) && districtFacilitiesData.length > 0) {
      // Filter by selected district
      setFilteredFacilities(districtFacilitiesData);
    } else {
      // Default empty state
      setFilteredFacilities([]);
    }
  }, [selectedDistrict, districtFacilitiesData, searchQuery, searchMode, allFacilities]);

  // Handle province selection - reset district and facilities
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict("");
    setFilteredFacilities([]);
    setSearchMode(false);
  };

  // Handle district selection
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSearchMode(false);
  };

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Enable search mode if query is not empty
    setSearchMode(query.trim() !== "");
    
    // If search is cleared, return to dropdown selection mode
    if (query.trim() === "") {
      if (selectedDistrict && Array.isArray(districtFacilitiesData) && districtFacilitiesData.length > 0) {
        // Re-apply district filter
        setFilteredFacilities(districtFacilitiesData);
      } else {
        setFilteredFacilities([]);
      }
    }
  };

  const queryClient = useQueryClient();
  
  // API mutation to select facility (no authentication required)
  const updateFacilityMutation = useMutation({
    mutationFn: async (facilityData: { name: string, code: string }) => {
      const response = await fetch('/api/select-facility-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          facility: facilityData.name,
          facilityCode: facilityData.code 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to select facility');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user data in cache to reflect the updated facility
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
  });
  
  const handleFacilitySelect = async (facility: Facility) => {
    try {
      // Validate facility data to ensure no empty values
      if (!facility || !facility.name || facility.name.trim() === '' || !facility.code) {
        toast({
          title: "Invalid Selection",
          description: "Please select a valid facility with complete information.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the user's selected facility in the database
      await updateFacilityMutation.mutateAsync({ 
        name: facility.name,
        code: facility.code
      });
      
      // Display success message
      toast({
        title: "Facility Selected",
        description: `You are now working with ${facility.name}`,
      });
      
      // Redirect to the patient records page after successful update
      setLocation("/patients");
    } catch (error) {
      console.error("Error handling facility selection:", error);
      // Display error message to user
      toast({
        title: "Failed to update facility",
        description: "Could not update your facility selection. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get loading state from mutation to show in the button
  const isUpdatingFacility = updateFacilityMutation.isPending;
  const isLoading = isLoadingProvinces || isLoadingDistricts || isLoadingAllFacilities || isLoadingDistrictFacilities;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SmartCare PRO Header */}
      <SmartCareHeader showFacilitySelector={false} />
      
      <div className="min-h-screen flex items-center justify-center relative pt-16"
           style={{
             background: `linear-gradient(to bottom right, rgba(240, 249, 255, 0.95), rgba(202, 232, 255, 0.9))`,
             backgroundImage: `url(${ecgBackground})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundBlendMode: 'overlay'
           }}>

        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative p-6">
          <div className="absolute right-2 bottom-2 opacity-50">
            <span className="text-xs text-gray-500">LAN Connected</span>
          </div>
        <div className="relative mt-4">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold mb-0">
              <span className="text-green-600">Smart</span>
              <span className="text-[#0072BC]">Care</span>
              <span className="text-[#0072BC] font-semibold">PRO</span>
            </h1>
            <p className="text-[11px] text-gray-600 mt-1 mb-0">
              A Ministry of Health SmartCare System
            </p>
            <p className="text-[11px] text-red-500 mt-0 mb-1">Prototype Portal</p>
            <p className="text-base font-semibold text-gray-700 mb-4">Select Facility</p>
          </div>

          {hasFacility ? (
            // Display message when user already has a facility
            <div className="space-y-5 p-4">
              <div className="flex flex-col items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Lock className="h-12 w-12 text-blue-600 mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Facility Already Assigned</h3>
                <p className="text-sm text-center text-blue-700 mb-2">
                  Your account is currently assigned to:
                </p>
                <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm w-full text-center">
                  <p className="font-bold text-blue-900">{user?.facility}</p>
                </div>
                <p className="text-xs text-center text-blue-600 mt-4">
                  For security reasons, facility assignments cannot be changed once set. 
                  Please contact your system administrator if you need to use a different facility.
                </p>
              </div>
              
              <div className="flex justify-around pt-4">
                <Button
                  className="bg-[#0e8df1] hover:bg-blue-600 rounded-lg py-2 px-4 font-medium text-white"
                  onClick={() => setLocation("/patients")}
                >
                  Continue to Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  className="text-blue-700 border-blue-300 hover:bg-blue-50 rounded-lg"
                  onClick={() => {
                    logoutMutation.mutate();
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            // Facility selection with dropdown approach
            <div className="space-y-3">
              <div className="text-center mb-2">
                <h3 className="text-lg font-medium text-blue-800">Select Your Facility</h3>
                {user?.facility ? (
                  <div className="mt-1">
                    <p className="text-xs text-gray-600">Currently using: <span className="font-medium text-blue-700">{user.facility}</span></p>
                    <p className="text-xs text-gray-600 mt-1">You can change your facility at any time</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">Select your province, district, and facility</p>
                )}
              </div>
              
              {/* Province Selection */}
              <div className="mb-3">
                <label htmlFor="province" className="block text-xs font-medium text-gray-700 mb-1">
                  Province *
                </label>
                <Select
                  value={selectedProvince}
                  onValueChange={handleProvinceChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="province" className="w-full">
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(provinces) && 
                      provinces
                        .filter(province => province && province.trim() !== '')
                        .map((province) => {
                          // Ensure we never have empty values
                          const safeValue = province || 'unknown';
                          return (
                            <SelectItem key={safeValue} value={safeValue}>
                              {province || 'Unknown Province'}
                            </SelectItem>
                          );
                        })
                    }
                  </SelectContent>
                </Select>
              </div>
              
              {/* District Selection */}
              <div className="mb-3">
                <label htmlFor="district" className="block text-xs font-medium text-gray-700 mb-1">
                  District *
                </label>
                <Select
                  value={selectedDistrict}
                  onValueChange={handleDistrictChange}
                  disabled={!selectedProvince || isLoading}
                >
                  <SelectTrigger id="district" className="w-full">
                    <SelectValue placeholder={selectedProvince ? "Select District" : "Select Province first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(districts) && 
                      districts
                        .filter(district => district && district.trim() !== '')
                        .map((district) => {
                          // Ensure we never have empty values
                          const safeValue = district || 'unknown';
                          return (
                            <SelectItem key={safeValue} value={safeValue}>
                              {district || 'Unknown District'}
                            </SelectItem>
                          );
                        })
                    }
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search option */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="search" className="block text-xs font-medium text-gray-700">
                    Quick Search
                  </label>
                  <span className="text-[10px] text-blue-600">
                    {searchMode ? "Searching all facilities" : "Search bypasses filters"}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, code, location..."
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Facility list */}
              <div className="mt-2 max-h-[300px] overflow-y-auto border border-gray-100 rounded-md">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading facilities...</p>
                  </div>
                ) : !selectedDistrict && !searchMode ? (
                  <div className="text-center py-6 text-gray-500 px-4">
                    <FileCheck className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">Please select a Province and District to view available facilities</p>
                  </div>
                ) : filteredFacilities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Building className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p>{searchMode 
                      ? `No facilities found matching "${searchQuery}"` 
                      : `No facilities found in ${selectedDistrict}, ${selectedProvince}`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {filteredFacilities.map(facility => (
                      <div 
                        key={facility.id}
                        className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleFacilitySelect(facility)}
                      >
                        <div className="font-medium text-blue-800">{facility.name}</div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{facility.district}, {facility.province}</span>
                        </div>
                        {facility.type && (
                          <div className="mt-1 text-xs text-gray-500">{facility.type} {facility.level ? `(Level ${facility.level})` : ''}</div>
                        )}
                      </div>
                    ))}
                    {filteredFacilities.length > 20 && !searchMode && (
                      <div className="text-center text-xs text-gray-500 py-2">
                        Showing first 20 facilities. Use the search box to find a specific facility.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <p className="text-center text-[10px] text-blue-600 mb-2 cursor-pointer">
                  <span onClick={() => setLocation('/send-facility-request')}>
                    Send Facility Access Request
                  </span>
                </p>
              </div>
              
              <div className="mt-3 text-center">
                <Button
                  variant="ghost"
                  className="text-xs text-gray-600 hover:text-gray-800 h-7 px-2"
                  onClick={() => {
                    logoutMutation.mutate();
                    setLocation("/");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}