import { useAuth } from "@/hooks/use-auth";
import { Search, User, Settings, LogOut, Edit, ChevronDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import zambiaCoatOfArms from "@/assets/zambia-coat-of-arms.svg";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import Coat_of_arms_of_Zambia_svg from "@assets/Coat_of_arms_of_Zambia.svg.png";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
          <img src={Coat_of_arms_of_Zambia_svg} alt="Logo" className="h-9" />
          <h1>
            <span className="text-[#00A651]">Smart</span>
            <span className="text-[#0072BC]">Care</span>
            <span className="text-[#0072BC] font-bold">PRO</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
            <div className="relative">
              <Button 
                variant="outline" 
                className="rounded-full px-3 py-1.5 bg-[#3898EC] text-white flex items-center space-x-1 hover:bg-[#3080D0] border-0"
                onClick={() => setLocation("/patients")}
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search Patient</span>
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full px-3 py-1.5 bg-white text-[#0072BC] flex items-center space-x-1 hover:bg-slate-50 border-[#0072BC]">
                  <span className="text-sm">Patient Services</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/patients")}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search Patients</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/patients/new")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Register New Patient</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/anc")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  <span>Antenatal Care (ANC)</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/prep")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>PrEP Services</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/art")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  <span>ART Services</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/pharmacovigilance")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pharmacovigilance</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setLocation("/medical-record")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Medical Record</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center px-3 py-1.5 border border-[#0072BC] rounded-full bg-blue-50 cursor-pointer hover:bg-blue-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="font-medium text-sm text-[#0072BC]">
                    {user?.facility || "No Facility Selected"}
                  </div>
                  <ChevronDown className="h-3 w-3 ml-1 text-[#0072BC]" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.facility ? (
                  <div className="p-2 text-xs text-gray-500">
                    Current facility: <span className="font-medium text-blue-700">{user.facility}</span>
                  </div>
                ) : (
                  <div className="p-2 text-xs text-gray-500">
                    No facility selected
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation("/facility-selection")}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>{user?.facility ? "Change Facility" : "Select Facility"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-[#0072BC] p-0.5 text-white hover:bg-[#0060a0]">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <div className="flex flex-col space-y-1 p-2 pt-3">
                  <p className="font-semibold text-center">{user?.username || "Administrator"}</p>
                  <p className="text-xs text-gray-500 uppercase text-center">
                    {user?.role || "ADMINISTRATOR"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={() => {
                    logoutMutation.mutate();
                    // Redirect will be handled by the logout mutation
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2 flex justify-around">
                  <Button size="sm" variant="outline" className="w-24 flex items-center justify-center space-x-2 rounded-full">
                    <span>Light</span>
                  </Button>
                  <Button size="sm" variant="outline" className="w-24 bg-gray-900 text-white border-gray-800 flex items-center justify-center space-x-2 rounded-full">
                    <span>Dark</span>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="w-full text-center py-1 text-sm font-medium tracking-wider text-[#e31025]" style={{ backgroundColor: "#f2f9ff" }}>
        <span className="text-[#f50541]">Prototype Portal</span>
      </div>
    </header>
  );
}