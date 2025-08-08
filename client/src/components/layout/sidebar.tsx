import { useLocation } from "wouter";
import { useState } from "react";
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  Settings,
  Home,
  UserPlus,
  Search,
  TestTube,
  Stethoscope,
  ClipboardList,
  Heart,
  Baby,
  Pill,
  BarChart3,
  FileSpreadsheet,
  Menu,
  Package,
  X,
  FileHeart,
  Shield,
  LogIn,
  UserCheck,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  subItems?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    icon: Users,
    label: "Patient Management",
    path: "/patients",
    subItems: [
      { icon: Search, label: "Search Patients", path: "/patients" },
      { icon: UserPlus, label: "Register Patient", path: "/patients/new" }
    ]
  },
  {
    icon: FileHeart,
    label: "Medical Encounter",
    path: "/medical-record"
  },
  {
    icon: Baby,
    label: "Antenatal Care",
    path: "/anc",
    subItems: [
      { icon: UserCheck, label: "Initial Visit", path: "/anc" },
      { icon: RotateCcw, label: "Follow-up Visit", path: "/patients/demo-patient-123/anc/followup" }
    ]
  },
  {
    icon: Pill,
    label: "PrEP Services",
    path: "/prep"
  },
  {
    icon: Heart,
    label: "ART Services",
    path: "/art"
  },
  {
    icon: ClipboardList,
    label: "Pharmacovigilance",
    path: "/pharmacovigilance"
  },
  {
    icon: Pill,
    label: "Pharmacy",
    path: "/pharmacy",
    subItems: [
      { icon: FileText, label: "Prescription", path: "/pharmacy/prescription" },
      { icon: Package, label: "Dispensation", path: "/dispensation" },
      { icon: Package, label: "Enhanced Dispensation", path: "/pharmacy/dispense" },
      { icon: TestTube, label: "Test Interface", path: "/pharmacy/test" }
    ]
  },
  {
    icon: BarChart3,
    label: "Reports Dashboard",
    path: "/reports"
  },
  {
    icon: Shield,
    label: "Administrator",
    path: "/admin",
    subItems: [
      { icon: LogIn, label: "Admin Login", path: "/admin/login" },
      { icon: Settings, label: "Admin Panel", path: "/admin/panel" }
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => {
    if (path === "/patients" && location === "/") return true;
    return location === path || location.startsWith(path + "/");
  };

  const isExpanded = (path: string) => {
    return expandedItems.includes(path);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const hasActiveSubItem = (item: SidebarItem) => {
    return item.subItems?.some(subItem => location === subItem.path || location.startsWith(subItem.path + "/"));
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      {onToggle && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-20 left-4 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white/90"
          onClick={onToggle}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "h-screen bg-white/95 backdrop-blur-sm border-r shadow-lg transition-all duration-300 ease-in-out",
        "w-64",
        isOpen ? "block" : "hidden"
      )}>
        <div className="p-4 pt-16">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h2>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <div key={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between text-left h-10 px-3",
                    (isActive(item.path) || hasActiveSubItem(item))
                      ? "bg-[#0072BC] text-white hover:bg-[#0060a0]" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    if (item.subItems) {
                      toggleExpanded(item.path);
                    } else {
                      setLocation(item.path);
                      onToggle && onToggle();
                    }
                  }}
                >
                  <div className="flex items-center">
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </div>
                  {item.subItems && (
                    <div className="ml-auto">
                      {isExpanded(item.path) || hasActiveSubItem(item) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </Button>
                
                {item.subItems && (isExpanded(item.path) || hasActiveSubItem(item)) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.path}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left h-8 px-3 text-sm",
                          location === subItem.path || location.startsWith(subItem.path + "/")
                            ? "bg-[#e6f3ff] text-[#0072BC] font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                        onClick={() => {
                          setLocation(subItem.path);
                          onToggle && onToggle();
                        }}
                      >
                        <subItem.icon className="h-3 w-3 mr-2" />
                        {subItem.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>


    </>
  );
}