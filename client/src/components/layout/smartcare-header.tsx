import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, User, MapPin, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

// Zambian coat of arms import
import CoatOfArms from "@assets/Coat_of_arms_of_Zambia.svg.png";

interface SmartCareHeaderProps {
  showSearch?: boolean;
  showPatientServices?: boolean;
  showFacilitySelector?: boolean;
  className?: string;
}

export function SmartCareHeader({ 
  showSearch = true, 
  showPatientServices = true,
  showFacilitySelector = true,
  className = ""
}: SmartCareHeaderProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Get facility info from user or session
  const facilityName = user?.facility || "No Facility Selected";
  const facilityCode = user?.facilityCode || "";

  const handleSearchPatient = () => {
    setLocation("/patients");
  };

  const handlePatientServices = (service: string) => {
    switch (service) {
      case "anc":
        setLocation("/anc");
        break;
      case "art":
        setLocation("/art");
        break;
      case "prep":
        setLocation("/prep");
        break;
      case "pharmacovigilance":
        setLocation("/pharmacovigilance");
        break;
      default:
        setLocation("/patients");
    }
  };

  const handleFacilitySelect = () => {
    setLocation("/facility-selection");
  };

  const handleProfileAction = (action: string) => {
    switch (action) {
      case "profile":
        setLocation("/profile");
        break;
      case "settings":
        setLocation("/settings");
        break;
      case "logout":
        window.location.href = "/api/logout";
        break;
    }
  };

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and branding */}
          <div className="flex items-center space-x-4">
            <img 
              src={CoatOfArms} 
              alt="Zambian Coat of Arms" 
              className="h-8 w-8"
            />
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">SmartCare</span>
              <span className="text-xl font-bold text-blue-600">PRO</span>
            </div>
          </div>

          {/* Center - Navigation buttons (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {showSearch && (
              <Button 
                onClick={handleSearchPatient}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Patient
              </Button>
            )}

            {showPatientServices && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Patient Services
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => handlePatientServices("anc")}>
                    ANC Services
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePatientServices("art")}>
                    ART Services
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePatientServices("prep")}>
                    PrEP Services
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handlePatientServices("pharmacovigilance")}>
                    Pharmacovigilance
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right side - Facility and user info */}
          <div className="flex items-center space-x-4">
            {showFacilitySelector && (
              <div className="hidden sm:flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={handleFacilitySelect}
                  className="text-left p-2 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 truncate max-w-40">
                        {facilityName}
                      </div>
                      {facilityCode && (
                        <div className="text-gray-500 text-xs">
                          {facilityCode}
                        </div>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </div>
            )}

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b">
                  <p className="font-medium text-sm">{user?.username || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.role || "Healthcare Provider"}</p>
                </div>
                <DropdownMenuItem onClick={() => handleProfileAction("profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProfileAction("settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProfileAction("logout")}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              {showSearch && (
                <Button 
                  onClick={handleSearchPatient}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Patient
                </Button>
              )}
              
              {showPatientServices && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Patient Services</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePatientServices("anc")}
                    >
                      ANC
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePatientServices("art")}
                    >
                      ART
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePatientServices("prep")}
                    >
                      PrEP
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePatientServices("pharmacovigilance")}
                    >
                      Pharma
                    </Button>
                  </div>
                </div>
              )}

              {showFacilitySelector && (
                <Button 
                  variant="outline" 
                  onClick={handleFacilitySelect}
                  className="w-full text-left justify-start"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <div className="text-sm">
                    <div className="font-medium">{facilityName}</div>
                    {facilityCode && (
                      <div className="text-gray-500 text-xs">{facilityCode}</div>
                    )}
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Prototype Portal Badge */}
        <div className="text-center py-2 border-t border-gray-100 bg-gray-50">
          <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200">
            Prototype Portal
          </Badge>
        </div>
      </div>
    </header>
  );
}