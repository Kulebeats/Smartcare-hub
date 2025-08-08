import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Building, Phone, MapPin } from "lucide-react";
import { useState } from "react";

interface FacilitySelectorProps {
  selectedFacility?: string;
  onFacilitySelect: (facility: string) => void;
  providerName?: string;
  onProviderNameChange: (name: string) => void;
  providerPhone?: string;
  onProviderPhoneChange: (phone: string) => void;
}

// Zambian healthcare facilities organized by province and type
const zambianFacilities = {
  "Central Province": {
    "District Hospital": [
      "Kabwe General Hospital",
      "Mkushi District Hospital",
      "Mumbwa District Hospital",
      "Serenje District Hospital",
      "Kapiri Mposhi District Hospital"
    ],
    "Health Center": [
      "Kabwe Central Health Center",
      "Bwacha Health Center",
      "Ndeke Health Center"
    ]
  },
  "Copperbelt Province": {
    "Tertiary Hospital": [
      "Ndola Central Hospital",
      "Kitwe Central Hospital"
    ],
    "District Hospital": [
      "Mufulira General Hospital",
      "Chingola General Hospital",
      "Luanshya General Hospital",
      "Kalulushi General Hospital"
    ]
  },
  "Lusaka Province": {
    "Tertiary Hospital": [
      "University Teaching Hospital (UTH)",
      "Levy Mwanawasa University Teaching Hospital"
    ],
    "District Hospital": [
      "Lusaka General Hospital",
      "Matero Reference Clinic",
      "Chilenje Level 1 Hospital"
    ]
  },
  "Southern Province": {
    "District Hospital": [
      "Livingstone Central Hospital",
      "Monze General Hospital",
      "Choma General Hospital",
      "Mazabuka General Hospital"
    ]
  },
  "Eastern Province": {
    "District Hospital": [
      "Chipata General Hospital",
      "Lundazi District Hospital",
      "Katete District Hospital"
    ]
  },
  "Western Province": {
    "District Hospital": [
      "Mongu Hospital",
      "Senanga District Hospital",
      "Kalabo District Hospital"
    ]
  },
  "Northern Province": {
    "District Hospital": [
      "Kasama General Hospital",
      "Mbala District Hospital",
      "Luwingu District Hospital"
    ]
  },
  "North-Western Province": {
    "District Hospital": [
      "Solwezi General Hospital",
      "Mufumbwe District Hospital",
      "Zambezi District Hospital"
    ]
  },
  "Luapula Province": {
    "District Hospital": [
      "Mansa General Hospital",
      "Samfya District Hospital",
      "Kawambwa District Hospital"
    ]
  },
  "Muchinga Province": {
    "District Hospital": [
      "Chinsali District Hospital",
      "Mpika District Hospital",
      "Isoka District Hospital"
    ]
  }
};

export default function FacilitySelector({
  selectedFacility,
  onFacilitySelect,
  providerName,
  onProviderNameChange,
  providerPhone,
  onProviderPhoneChange
}: FacilitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedFacilityType, setSelectedFacilityType] = useState("");

  // Get all unique facility types
  const facilityTypes = Array.from(
    new Set(
      Object.values(zambianFacilities).flatMap(province => 
        Object.keys(province)
      )
    )
  );

  // Filter facilities based on search criteria
  const getFilteredFacilities = () => {
    const facilities: Array<{name: string, province: string, type: string}> = [];
    
    Object.entries(zambianFacilities).forEach(([province, types]) => {
      Object.entries(types).forEach(([type, facilityList]) => {
        facilityList.forEach(facility => {
          facilities.push({ name: facility, province, type });
        });
      });
    });

    return facilities.filter(facility => {
      const matchesSearch = !searchTerm || 
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.province.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProvince = !selectedProvince || facility.province === selectedProvince;
      const matchesType = !selectedFacilityType || facility.type === selectedFacilityType;
      
      return matchesSearch && matchesProvince && matchesType;
    });
  };

  const filteredFacilities = getFilteredFacilities();

  return (
    <div className="space-y-6">
      {/* Facility Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Receiving Facility Selection</h3>
          
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">All Provinces</option>
                  {Object.keys(zambianFacilities).map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Facility Type</label>
                <select
                  value={selectedFacilityType}
                  onChange={(e) => setSelectedFacilityType(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">All Types</option>
                  {facilityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Facility List */}
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            {filteredFacilities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No facilities found matching your criteria
              </div>
            ) : (
              <div className="divide-y">
                {filteredFacilities.map((facility) => (
                  <button
                    key={facility.name}
                    onClick={() => onFacilitySelect(facility.name)}
                    className={`w-full text-left p-4 hover:bg-blue-50 transition-colors ${
                      selectedFacility === facility.name ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{facility.name}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {facility.province} • {facility.type}
                        </div>
                      </div>
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Facility Info */}
          {selectedFacility && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Selected: {selectedFacility}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Contact Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Provider Contact Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Provider Name
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => onProviderNameChange(e.target.value)}
                placeholder="Enter provider name..."
                className="w-full border rounded-lg p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Provider Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="tel"
                  value={providerPhone}
                  onChange={(e) => onProviderPhoneChange(e.target.value)}
                  placeholder="e.g. +260 977 123 456"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Facility Address</label>
            <textarea
              placeholder="Enter complete facility address..."
              className="w-full border rounded-lg p-2"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}