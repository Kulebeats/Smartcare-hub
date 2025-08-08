import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart,
  Syringe,
  TestTube2,
  Microscope,
  Pill,
  Thermometer,
  Activity,
  Scissors,
  UserPlus,
  ArrowRight,
  ShieldAlert,
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Medical Records", href: "/medical-records", icon: FileText },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "PEP", href: "/pep", icon: Syringe },
  { name: "POC", href: "/poc", icon: TestTube2 },
  { name: "Investigation", href: "/investigation", icon: Microscope },
  { name: "PrEP", href: "/prep", icon: Pill },
  { name: "TB Service", href: "/tb-service", icon: Thermometer },
  { name: "Pain Scaling Tool", href: "/pain-scaling", icon: Activity },
  { name: "Surgery", href: "/surgery", icon: Scissors },
  { name: "VMMC Service", href: "/vmmc", icon: UserPlus },
  { name: "Referrals", href: "/referrals", icon: ArrowRight },
  { name: "Vaccinations", href: "/vaccinations", icon: Syringe },
  { name: "Covid", href: "/covid", icon: ShieldAlert },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:flex"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      <div className={cn(
        "fixed inset-y-0 z-40 flex w-64 flex-col transition-transform duration-200 ease-in-out -translate-x-full",
        isOpen && "translate-x-0"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img src="/Logo.ico" alt="Logo" className="h-8" />
            <span className="ml-2 text-lg font-semibold">
              <span className="text-[#00A651]">Smart</span>
              <span className="text-[#0072BC]">Care</span>
              <span className="text-[#0072BC] font-bold">PRO</span>
            </span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link href={item.href}>
                          <div
                            className={cn(
                              location === item.href
                                ? "bg-gray-50 text-blue-600"
                                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
                              "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold cursor-pointer"
                            )}
                          >
                            <Icon
                              className={cn(
                                location === item.href
                                  ? "text-blue-600"
                                  : "text-gray-400 group-hover:text-blue-600",
                                "h-6 w-6 shrink-0"
                              )}
                            />
                            {item.name}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}