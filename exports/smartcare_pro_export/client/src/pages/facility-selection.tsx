import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";

export default function FacilitySelectionPage() {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [, setLocation] = useLocation();

  const { data: facilities } = useQuery({
    queryKey: ["/api/facilities"],
  });

  const handleFacilitySelect = (facility: string) => {
    // TODO: Update user's facility and redirect to patient records
    setLocation("/patients");
  };

  return (
    <div className="min-h-screen bg-[#E6F3FF] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <img src="/zambia-coat-of-arms.jpg" alt="Zambia Coat of Arms" className="h-24" />
        </div>

        <h1 className="text-center mb-2">
          <span className="text-[#00A651]">Smart</span>
          <span className="text-[#0072BC]">Care</span>
          <span className="text-[#0072BC] font-bold">PRO</span>
        </h1>
        <p className="text-center text-gray-600 text-sm mb-2">
          A Ministry of Health SmartCare System
        </p>
        <p className="text-center font-semibold mb-6">Select Facility</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Province *</label>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="--Select--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eastern">Eastern</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">District *</label>
            <Select
              value={selectedDistrict}
              onValueChange={setSelectedDistrict}
              disabled={!selectedProvince}
            >
              <SelectTrigger>
                <SelectValue placeholder="--Select--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chipata">Chipata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Facility *</label>
            <Select
              disabled={!selectedDistrict}
              onValueChange={handleFacilitySelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Search facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities?.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}