import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, X, Plus, } from "lucide-react";
import { PageLoader, DataLoader, ButtonLoader } from "@/components/ui/loading-spinner";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Icons
import { 
  Search, 
  Settings, 
  Users, 
  ActivitySquare, 
  Building2, 
  Clipboard, 
  Database,
  ChevronDown,
  ChevronRight,
  Menu,
  UserCircle,
  Stethoscope,
  Pill,
  User,
  Heart,
  BarChart, 
  UserPlus,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X as XIcon
} from 'lucide-react';

// Admin panel component
import { RoleChangeDialog } from "@/components/admin/role-change-dialog";
import { PermissionsDialog } from "@/components/admin/permissions-dialog";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { UserCreationWizard } from "@/components/UserCreationWizard";
import IntegrationsPage from "@/pages/integrations-page";
import PerformanceDashboard from "@/pages/performance-dashboard";

const AdminPanel = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Check if main sidebar is open
  useEffect(() => {
    const handleMainSidebarChange = () => {
      // If main sidebar is open, close admin sidebar
      const mainSidebarElement = document.querySelector('.ml-64');
      if (mainSidebarElement) {
        setSidebarOpen(false);
      }
    };

    // Call initially
    handleMainSidebarChange();

    // Set up a mutation observer to watch for changes to the main content's classes
    const observer = new MutationObserver(handleMainSidebarChange);
    const mainContent = document.querySelector('main');

    if (mainContent) {
      observer.observe(mainContent, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    }

    return () => observer.disconnect();
  }, []);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilitySearchQuery, setFacilitySearchQuery] = useState('');
  const [facilityPage, setFacilityPage] = useState(1);
  const [facilityLimit] = useState(50);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  // Define user roles here since importing from schema didn't work
  const USER_ROLES = {
    SYSTEM_ADMIN: 'SystemAdministrator',
    FACILITY_ADMIN: 'FacilityAdministrator',
    CLINICIAN: 'Clinician',
    TRAINER: 'Trainer',
  };

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    facility: '',
    phoneNumber: '',
    role: USER_ROLES.CLINICIAN,
    isAdmin: false,
    active: true,
    permissions: [] as string[]
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dialogs state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Facility dialogs state
  const [viewFacilityDialogOpen, setViewFacilityDialogOpen] = useState(false);
  const [editFacilityDialogOpen, setEditFacilityDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  // User Creation Wizard state
  const [showAdvancedWizard, setShowAdvancedWizard] = useState(false);
  const [wizardMode, setWizardMode] = useState<'simple' | 'advanced'>('simple');

  // Fetch users for the list users tab
  const { data: users = [], isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      return await res.json();
    },
    enabled: activeTab === 'listUsers',
  });



  // Fetch facilities for the facility management tab and dashboard metrics with pagination
  const { data: facilitiesData = { facilities: [], total: 0, hasMore: false }, isLoading: isLoadingFacilities, error: facilitiesError, refetch: refetchFacilities } = useQuery({
    queryKey: ['/api/facilities/all', facilityPage, facilityLimit, facilitySearchQuery, selectedProvince, selectedDistrict],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: facilityPage.toString(),
        limit: facilityLimit.toString(),
        search: facilitySearchQuery
      });
      if (selectedProvince) params.append('province', selectedProvince);
      if (selectedDistrict) params.append('district', selectedDistrict);
      const res = await apiRequest('GET', `/api/facilities/all?${params}`);
      return await res.json();
    },
    enabled: activeTab === 'facilityManagement' || activeTab === 'dashboard',
  });

  const facilities = facilitiesData.facilities;

  // Fetch provinces for filter dropdown
  const { data: filterProvinces = [], isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['/api/facilities/provinces'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/facilities/provinces');
      return await res.json();
    },
    enabled: activeTab === 'facilityManagement',
  });

  // Fetch districts for filter dropdown based on selected province
  const { data: filterDistricts = [], isLoading: isLoadingDistricts } = useQuery({
    queryKey: ['/api/facilities/districts', selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return [];
      const res = await apiRequest('GET', `/api/facilities/districts/${selectedProvince}`);
      return await res.json();
    },
    enabled: activeTab === 'facilityManagement' && !!selectedProvince,
  });

  // Fetch patients for dashboard metrics
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/patients');
      return await res.json();
    },
    enabled: activeTab === 'dashboard',
  });

  // Fetch additional dashboard metrics
  const { data: dashboardUsers = [], isLoading: isLoadingDashboardUsers } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      return await res.json();
    },
    enabled: activeTab === 'dashboard',
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest('POST', '/api/admin/users', userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'User Created',
        description: 'The user has been created successfully.',
      });
      // Reset form
      setNewUser({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        fullName: '',
        facility: '',
        phoneNumber: '',
        role: USER_ROLES.CLINICIAN,
        isAdmin: false,
        active: true,
        permissions: []
      });
      // Refetch users if we're on the list tab
      if (activeTab === 'listUsers') {
        refetchUsers();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create user: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Toggle submenu function
  const toggleSubmenu = (submenuName: string) => {
    if (openSubmenu === submenuName) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(submenuName);
    }
  };

  // Log user data to debug admin access issues
  console.log("Admin panel user data:", user);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center text-blue-600">Not Logged In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">Please log in to access the system.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button className="bg-blue-500 text-white">Return to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check admin status - support both formats or check by username
  const hasAdminAccess = user.isAdmin === true || 
    (user as any).is_admin === true || // Use type assertion to avoid TypeScript error
    user.username === 'admin';

  if (!hasAdminAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center text-blue-600">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">You do not have permission to access the admin panel.</p>
            <p className="text-center text-sm text-gray-500">Only users with administrator privileges can access this page.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button className="bg-blue-500 text-white">Return to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white h-16 flex items-center justify-between px-6 fixed w-full z-50 shadow-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="p-1 mr-3 text-white hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </Button>
          <h1 className="text-xl font-medium tracking-tight">SmartCare Admin Panel</h1>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-2 bg-blue-800/30 py-1 px-3 rounded-full">
            <UserCircle size={18} className="mr-2" />
            <span className="text-sm font-medium">{user.username}</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-1 ml-2 text-white hover:bg-blue-700/50 rounded-full" 
            onClick={() => {
              logoutMutation.mutate();
              // Redirect will be handled by the logout mutation
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="12" y1="12" y2="12" />
            </svg>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className={`bg-white/95 backdrop-blur-sm border-r border-gray-200 fixed h-[calc(100vh-4rem)] z-40 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 w-72' : 'w-0 -translate-x-full opacity-0'}`}>
          <div className="overflow-y-auto h-full py-6">
            <nav className="px-3 space-y-2">
              <a 
                href="#dashboard" 
                className={`flex items-center px-4 py-3 text-sm rounded-lg font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100/80'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <ActivitySquare className={`mr-3 h-5 w-5 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>Dashboard</span>
              </a>

              <div className="py-1">
                <button 
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all"
                  onClick={() => toggleSubmenu('userManagement')}
                >
                  <div className="flex items-center">
                    <Users className={`mr-3 h-5 w-5 ${openSubmenu === 'userManagement' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>User Management</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSubmenu === 'userManagement' ? 'rotate-180 text-blue-600' : 'text-gray-500'}`} />
                </button>

                {openSubmenu === 'userManagement' && (
                  <div className="ml-8 mt-1 space-y-1 mb-2 animate-accordion-down">
                    <a 
                      href="#createUser" 
                      className={`block px-4 py-2 text-sm rounded-md transition-all ${activeTab === 'createUser' ? 'text-blue-700 bg-blue-50/60 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                      onClick={() => setActiveTab('createUser')}
                    >
                      Create User
                    </a>
                    <a 
                      href="#listUsers" 
                      className={`block px-4 py-2 text-sm rounded-md transition-all ${activeTab === 'listUsers' ? 'text-blue-700 bg-blue-50/60 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                      onClick={() => setActiveTab('listUsers')}
                    >
                      List Users
                    </a>
                  </div>
                )}
              </div>



              <a 
                href="#facilityManagement" 
                className={`flex items-center px-4 py-3 text-sm rounded-md ${activeTab === 'facilityManagement' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('facilityManagement')}
              >
                <Building2 className="mr-3 h-5 w-5" />
                <span>Facility Management</span>
              </a>





              <a 
                href="#performanceDashboard" 
                className={`flex items-center px-4 py-3 text-sm rounded-md ${activeTab === 'performanceDashboard' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('performanceDashboard')}
              >
                <BarChart className="mr-3 h-5 w-5" />
                <span>Performance Dashboard</span>
              </a>

              <Link 
                href="/admin/dak"
                className="flex items-center px-4 py-3 text-sm rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-100/80"
              >
                <Database className="mr-3 h-5 w-5 text-gray-500" />
                <span>DAK Clinical Decision Support</span>
              </Link>

              <a 
                href="#integrations" 
                className={`flex items-center px-4 py-3 text-sm rounded-md ${activeTab === 'integrations' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('integrations')}
              >
                <Database className="mr-3 h-5 w-5" />
                <span>System Integrations</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 p-8 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 mb-4">Your centralized platform to manage SmartCare PRO</p>

              {/* System Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="border border-blue-100 hover:shadow-md transition-all bg-gradient-to-br from-white to-blue-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-blue-700">{dashboardUsers?.length || 0}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-green-600 bg-green-50 py-0.5 px-2 rounded-full font-medium">
                        Active: {dashboardUsers?.filter((u: any) => u.active)?.length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-emerald-100 hover:shadow-md transition-all bg-gradient-to-br from-white to-emerald-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-medium">Facilities</p>
                        <h3 className="text-2xl font-bold text-emerald-700">{facilities?.length || 0}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded-full font-medium">
                        All operational
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-indigo-100 hover:shadow-md transition-all bg-gradient-to-br from-white to-indigo-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-medium">Registered Patients</p>
                        <h3 className="text-2xl font-bold text-indigo-700">{patients?.length || 0}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-indigo-600 bg-indigo-50 py-0.5 px-2 rounded-full font-medium">
                        Total registrations
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-purple-100 hover:shadow-md transition-all bg-gradient-to-br from-white to-purple-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-medium">System Modules</p>
                        <h3 className="text-2xl font-bold text-purple-700">12</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <ActivitySquare className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-purple-600 bg-purple-50 py-0.5 px-2 rounded-full font-medium">
                        All modules operational
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-amber-100 hover:shadow-md transition-all bg-gradient-to-br from-white to-amber-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-medium">System Uptime</p>
                        <h3 className="text-2xl font-bold text-amber-700">99.9%</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <ActivitySquare className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-green-600 bg-green-50 py-0.5 px-2 rounded-full font-medium">
                        System healthy
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Tabs */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                  <Input 
                    type="text" 
                    placeholder="Search dashboard..." 
                    className="pl-10 pr-4 py-2.5 w-full border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg" 
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                </div>
                <Tabs defaultValue="overview" className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Interactive Cards Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Chart Card */}
                <Card className="col-span-1 md:col-span-2 shadow-md hover:shadow-lg transition-all duration-300 border-0">
                  <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 border-b">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <BarChart className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold">System Usage</CardTitle>
                    </div>
                    <Select>
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue placeholder="Last 7 days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="h-64 w-full flex items-center justify-center">
                      <div className="w-full h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Logins</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Transactions</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Data Updates</span>
                          </div>
                        </div>
                        <div className="flex-1 relative">
                          <div className="absolute inset-0 flex items-end">
                            <div className="w-1/7 h-40% bg-blue-500 mx-1 rounded-t"></div>
                            <div className="w-1/7 h-60% bg-blue-500 mx-1 rounded-t"></div>
                            <div className="w-1/7 h-80% bg-blue-500 mx-1 rounded-t"></div>
                            <div className="w-1/7 h-50% bg-blue-500 mx-1 rounded-t"></div>
                            <div className="w-1/7 h-70% bg-blue-500 mx-1 rounded-t"></div>
                            <div className="w-1/7 h-60% bg-blue-500 mx-1 rounded-t"></div>
                            <div className="w-1/7 h-90% bg-blue-500 mx-1 rounded-t"></div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-500">Mon</span>
                          <span className="text-xs text-gray-500">Tue</span>
                          <span className="text-xs text-gray-500">Wed</span>
                          <span className="text-xs text-gray-500">Thu</span>
                          <span className="text-xs text-gray-500">Fri</span>
                          <span className="text-xs text-gray-500">Sat</span>
                          <span className="text-xs text-gray-500">Sun</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0">
                  <CardHeader className="p-5 flex flex-row items-center space-x-4 pb-2 border-b">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">User Login</span>
                            <span className="text-xs text-gray-500">admin logged in</span>
                          </div>
                          <span className="text-xs text-gray-500">5 min ago</span>
                        </div>
                      </div>
                      <div className="px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">User Created</span>
                            <span className="text-xs text-gray-500">New clinician added</span>
                          </div>
                          <span className="text-xs text-gray-500">1 hour ago</span>
                        </div>
                      </div>
                      <div className="px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">System Update</span>
                            <span className="text-xs text-gray-500">Database backed up</span>
                          </div>
                          <span className="text-xs text-gray-500">3 hours ago</span>
                        </div>
                      </div>
                      <div className="px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Facility Update</span>
                            <span className="text-xs text-gray-500">New facility added</span>
                          </div>
                          <span className="text-xs text-gray-500">Yesterday</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 text-center">
                      <Button variant="link" className="text-sm text-blue-600">View All Activity</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Access Cards */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="overflow-hidden border hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl cursor-pointer" onClick={() => setActiveTab('createUser')}>
                  <CardHeader className="p-5 flex flex-row items-center space-x-4 pb-2 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">Create User</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Add new users to the system with roles and permissions according to their responsibilities.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <span className="text-blue-600 text-sm font-medium flex items-center">
                        Open <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl cursor-pointer" onClick={() => setActiveTab('listUsers')}>
                  <CardHeader className="p-5 flex flex-row items-center space-x-4 pb-2 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">User Management</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      View, edit, and manage all users in the system. Update roles and control access permissions.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <span className="text-blue-600 text-sm font-medium flex items-center">
                        Open <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl cursor-pointer" onClick={() => setActiveTab('facilityManagement')}>
                  <CardHeader className="p-5 flex flex-row items-center space-x-4 pb-2 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">Facilities</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Manage facilities, including adding new facilities, updating information, and managing their status.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <span className="text-blue-600 text-sm font-medium flex items-center">
                        Open <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'createUser' && !showAdvancedWizard && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <UserPlus className="h-7 w-7 mr-3 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Create User</h2>
                </div>
                <Button
                  onClick={() => setShowAdvancedWizard(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Advanced Registration
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card 
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    wizardMode === 'simple' 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => setWizardMode('simple')}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Quick Registration</CardTitle>
                    <CardDescription>Basic user creation with essential fields</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    wizardMode === 'advanced' 
                      ? 'border-purple-500 bg-purple-50 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => {
                    setWizardMode('advanced');
                    setShowAdvancedWizard(true);
                  }}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Stethoscope className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Professional Registration</CardTitle>
                    <CardDescription>Comprehensive healthcare professional profile with credentials</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b pb-6">
                  <CardTitle className="text-xl text-blue-700">Quick User Registration</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">Enter the basic details for the new user account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();

                    // Basic validation
                    if (!newUser.username || !newUser.password) {
                      toast({
                        title: 'Validation Error',
                        description: 'Username and password are required.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    // Check if passwords match
                    if (newUser.password !== newUser.confirmPassword) {
                      toast({
                        title: 'Validation Error',
                        description: 'Passwords do not match.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    // Create user object to send to the server
                    const userData = {
                      username: newUser.username,
                      password: newUser.password,
                      email: newUser.email || null,
                      fullName: newUser.fullName || null,
                      role: newUser.isAdmin ? 'admin' : 'user',
                      isAdmin: newUser.isAdmin,
                      active: newUser.active
                    };

                    // Call the mutation to create the user
                    createUserMutation.mutate(userData);
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <Input 
                          id="username" 
                          placeholder="Enter username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                        <Input 
                          id="fullName" 
                          placeholder="Enter full name"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                        <div className="relative">
                          <Input 
                            id="confirmPassword" 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={newUser.confirmPassword}
                            onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-md font-medium">User Type</h3>
                      <div className="space-y-2">
                        <RadioGroup 
                          value={newUser.role} 
                          onValueChange={(value) => setNewUser({...newUser, role: value})}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.SYSTEM_ADMIN} id="r1" />
                            <Label htmlFor="r1">System Administrator</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.FACILITY_ADMIN} id="r2" />
                            <Label htmlFor="r2">Facility Administrator</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.CLINICIAN} id="r3" />
                            <Label htmlFor="r3">Clinician</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.TRAINER} id="r4" />
                            <Label htmlFor="r4">Trainer</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-md font-medium">User Status</h3>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="active" 
                            className="rounded border-gray-300 text-blue-600"
                            checked={newUser.active}
                            onChange={(e) => setNewUser({...newUser, active: e.target.checked})}
                          />
                          <label htmlFor="active" className="text-sm">Active</label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setNewUser({
                          username: '',
                          password: '',
                          confirmPassword: '',
                          email: '',
                          fullName: '',
                          facility: '',
                          phoneNumber: '',
                          role: USER_ROLES.CLINICIAN,
                          isAdmin: false,
                          active: true,
                          permissions: []
                        })}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : "Create User"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'createUser' && showAdvancedWizard && (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Stethoscope className="h-7 w-7 mr-3 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Professional User Registration</h2>
                </div>
                <Button
                  onClick={() => setShowAdvancedWizard(false)}
                  variant="outline"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Back to Simple
                </Button>
              </div>
              
              <UserCreationWizard 
                onComplete={(data) => {
                  console.log('Professional user registration completed:', data);
                  toast({
                    title: 'Success',
                    description: 'Professional user registration completed successfully.',
                  });
                  setShowAdvancedWizard(false);
                  refetchUsers();
                }}
                onCancel={() => setShowAdvancedWizard(false)}
              />
            </div>
          )}

          {activeTab === 'facilityManagement' && (
            <div>
              <div className="flex items-center mb-8">
                <Building2 className="h-7 w-7 mr-3 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Facility Management</h2>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3 flex-wrap items-center">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search facilities..."
                      className="w-80 pl-10 py-2.5 border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                      value={facilitySearchQuery}
                      onChange={(e) => {
                        setFacilitySearchQuery(e.target.value);
                        setFacilityPage(1); // Reset to first page when searching
                      }}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  
                  <Select
                    value={selectedProvince}
                    onValueChange={(value) => {
                      setSelectedProvince(value);
                      setSelectedDistrict(''); // Reset district when province changes
                      setFacilityPage(1); // Reset to first page
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Provinces</SelectItem>
                      {filterProvinces.map((province: string) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDistrict}
                    onValueChange={(value) => {
                      setSelectedDistrict(value);
                      setFacilityPage(1); // Reset to first page
                    }}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Districts</SelectItem>
                      {filterDistricts.map((district: string) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(selectedProvince || selectedDistrict || facilitySearchQuery) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProvince('');
                        setSelectedDistrict('');
                        setFacilitySearchQuery('');
                        setFacilityPage(1);
                      }}
                      className="px-4 py-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover:text-red-800 transition-all duration-200"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  {isLoadingFacilities ? (
                    <div className="flex flex-col justify-center items-center p-20">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                      <p className="text-gray-500">Loading facilities...</p>
                    </div>
                  ) : facilitiesError ? (
                    <div className="text-center p-12 bg-red-50">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <X className="h-8 w-8 text-red-600" />
                      </div>
                      <p className="text-red-600 font-medium">Error loading facilities. Please try again.</p>
                    </div>
                  ) : facilities.length === 0 ? (
                    <div className="text-center p-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600">No facilities found.</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Province</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">District</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {facilities.map((facility: any) => (
                            <tr key={facility.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{facility.code}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.province}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.district}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.type || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  facility.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {facility.status === 'ACTIVE' ? 
                                    <><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> ACTIVE</> : 
                                    <><XIcon size={12} className="mr-1" /> INACTIVE</>
                                  }
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                                    onClick={() => {
                                      setSelectedFacility(facility);
                                      setViewFacilityDialogOpen(true);
                                    }}
                                  >
                                    <Eye size={14} className="mr-1" /> View
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200"
                                    onClick={() => {
                                      setSelectedFacility(facility);
                                      setEditFacilityDialogOpen(true);
                                    }}
                                  >
                                    <Settings size={14} className="mr-1" /> Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
                
                {/* Pagination Controls */}
                <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((facilityPage - 1) * facilityLimit) + 1} to {Math.min(facilityPage * facilityLimit, facilitiesData.total)} of {facilitiesData.total} facilities
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFacilityPage(Math.max(1, facilityPage - 1))}
                      disabled={facilityPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {facilityPage} of {Math.ceil(facilitiesData.total / facilityLimit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFacilityPage(facilityPage + 1)}
                      disabled={!facilitiesData.hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <IntegrationsPage />
            </div>
          )}

          {activeTab === 'performanceDashboard' && (
            <div>
              <PerformanceDashboard />
            </div>
          )}

          {activeTab === 'listUsers' && (
            <div>
              <div className="flex items-center mb-8">
                <Users className="h-7 w-7 mr-3 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search users..."
                      className="w-80 pl-10 py-2.5 border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={async () => {
                      if (window.confirm('WARNING: This will delete ALL users except the current admin. This action cannot be undone. Proceed?')) {
                        try {
                          await apiRequest('DELETE', '/api/admin/users/delete-non-admin');
                          toast({
                            title: 'Users Deleted',
                            description: 'All non-admin users have been deleted.',
                          });
                          refetchUsers();
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'Failed to delete users.',
                            variant: 'destructive',
                          });
                        }
                      }
                    }}
                  >
                    Delete All Non-Admin Users
                  </Button>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                  onClick={() => setActiveTab('createUser')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </div>

              {isLoadingUsers ? (
                <div className="w-full flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : usersError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p>Error loading users. Please try again.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  {users.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-5">No users found. Create a new user to get started.</p>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm px-6"
                        onClick={() => setActiveTab('createUser')}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create User
                      </Button>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users
                          .filter((user: any) => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              user.username.toLowerCase().includes(query) ||
                              (user.fullName && user.fullName.toLowerCase().includes(query)) ||
                              (user.email && user.email.toLowerCase().includes(query))
                            );
                          })
                          .map((user: any) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">{user.fullName || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.isAdmin ? 'Administrator' : user.role || 'User'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.active ? (
                                  <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Active
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    <AlertCircle size={12} className="mr-1" /> Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setEditUserDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setRoleDialogOpen(true);
                                  }}
                                >
                                  Role
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setPermissionsDialogOpen(true);
                                  }}
                                >
                                  Permission
                                </Button>
                                {user.active ? (
                                  <Button variant="ghost" size="sm" className="text-red-600">Disable</Button>
                                ) : (
                                  <Button variant="ghost" size="sm" className="text-green-600">Enable</Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
                                      try {
                                        await apiRequest('DELETE', `/api/admin/users/${user.id}`);
                                        toast({
                                          title: 'User Deleted',
                                          description: `${user.username} has been deleted successfully.`,
                                        });
                                        refetchUsers();
                                      } catch (error) {
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to delete user.',
                                          variant: 'destructive',
                                        });
                                      }
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}



          {/* Facility Registration Tab */}
          {activeTab === 'facilityRegistration' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-8">
                <UserPlus className="h-7 w-7 mr-3 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Facility Registration</h2>
              </div>
              
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b pb-6">
                  <CardTitle className="text-xl text-blue-700">Register New Facility</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">Add a new healthcare facility to the system</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="facilityName" className="text-sm font-medium">Facility Name</label>
                          <Input 
                            id="facilityName" 
                            placeholder="Enter facility name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="facilityCode" className="text-sm font-medium">Facility Code</label>
                          <Input 
                            id="facilityCode" 
                            placeholder="Enter facility code"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="facilityType" className="text-sm font-medium">Facility Type</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select facility type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hospital">Hospital</SelectItem>
                              <SelectItem value="clinic">Clinic</SelectItem>
                              <SelectItem value="health-center">Health Center</SelectItem>
                              <SelectItem value="rural-health-center">Rural Health Center</SelectItem>
                              <SelectItem value="urban-health-center">Urban Health Center</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="ownership" className="text-sm font-medium">Ownership</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ownership" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="mission">Mission</SelectItem>
                              <SelectItem value="ngo">NGO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Location Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Location Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="province" className="text-sm font-medium">Province</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="central">Central</SelectItem>
                              <SelectItem value="copperbelt">Copperbelt</SelectItem>
                              <SelectItem value="eastern">Eastern</SelectItem>
                              <SelectItem value="luapula">Luapula</SelectItem>
                              <SelectItem value="lusaka">Lusaka</SelectItem>
                              <SelectItem value="muchinga">Muchinga</SelectItem>
                              <SelectItem value="northern">Northern</SelectItem>
                              <SelectItem value="north-western">North-Western</SelectItem>
                              <SelectItem value="southern">Southern</SelectItem>
                              <SelectItem value="western">Western</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="district" className="text-sm font-medium">District</label>
                          <Input 
                            id="district" 
                            placeholder="Enter district"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="address" className="text-sm font-medium">Physical Address</label>
                          <Input 
                            id="address" 
                            placeholder="Enter physical address"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="coordinates" className="text-sm font-medium">GPS Coordinates (Optional)</label>
                          <Input 
                            id="coordinates" 
                            placeholder="Latitude, Longitude"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                          <Input 
                            id="phoneNumber" 
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                          <Input 
                            id="email" 
                            type="email"
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="contactPerson" className="text-sm font-medium">Contact Person</label>
                          <Input 
                            id="contactPerson" 
                            placeholder="Enter contact person name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="contactTitle" className="text-sm font-medium">Contact Person Title</label>
                          <Input 
                            id="contactTitle" 
                            placeholder="Enter contact person title"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Services and Capacity */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Services and Capacity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="bedCapacity" className="text-sm font-medium">Bed Capacity</label>
                          <Input 
                            id="bedCapacity" 
                            type="number"
                            placeholder="Enter bed capacity"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="staffCount" className="text-sm font-medium">Staff Count</label>
                          <Input 
                            id="staffCount" 
                            type="number"
                            placeholder="Enter total staff count"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="text-sm font-medium">Available Services</label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['General Medicine', 'Pediatrics', 'Maternity', 'Surgery', 'Emergency', 'Outpatient', 'Laboratory', 'Pharmacy', 'Radiology', 'Dental', 'HIV/AIDS', 'TB Treatment'].map((service) => (
                            <div key={service} className="flex items-center space-x-2">
                              <Checkbox id={service} />
                              <Label htmlFor={service} className="text-sm">{service}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                      <Button variant="outline">Cancel</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Register Facility
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Task Master Tab */}
          {activeTab === 'taskMaster' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center mb-8">
                <Clipboard className="h-7 w-7 mr-3 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Task Master</h2>
              </div>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Task Management</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">+4 from yesterday</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">-1 from yesterday</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Task Activity</CardTitle>
                      <CardDescription>Latest updates from your task management system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { task: "Patient record update", user: "Dr. Smith", time: "2 minutes ago", status: "completed" },
                          { task: "Medication inventory check", user: "Nurse Johnson", time: "15 minutes ago", status: "in-progress" },
                          { task: "Equipment maintenance", user: "Tech Support", time: "1 hour ago", status: "pending" },
                          { task: "Patient discharge", user: "Dr. Wilson", time: "2 hours ago", status: "completed" }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-3 h-3 rounded-full ${
                              activity.status === 'completed' ? 'bg-green-500' : 
                              activity.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium">{activity.task}</p>
                              <p className="text-sm text-gray-600">Assigned to {activity.user}</p>
                            </div>
                            <div className="text-sm text-gray-500">{activity.time}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Task Management</h3>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Task List</CardTitle>
                      <CardDescription>Manage and monitor all system tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Checkbox />
                          <div className="flex-1">
                            <h4 className="font-medium">Daily patient data backup</h4>
                            <p className="text-sm text-gray-600">Automated backup of patient records</p>
                          </div>
                          <div className="text-sm text-gray-500">Due: 11:59 PM</div>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Checkbox />
                          <div className="flex-1">
                            <h4 className="font-medium">Weekly inventory check</h4>
                            <p className="text-sm text-gray-600">Check medication and supply levels</p>
                          </div>
                          <div className="text-sm text-gray-500">Due: Friday 5:00 PM</div>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Checkbox />
                          <div className="flex-1">
                            <h4 className="font-medium">Monthly report generation</h4>
                            <p className="text-sm text-gray-600">Generate comprehensive monthly reports</p>
                          </div>
                          <div className="text-sm text-gray-500">Due: End of month</div>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Analytics</CardTitle>
                      <CardDescription>Performance metrics and insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-4">Task Completion Rate</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>This Week</span>
                              <span>85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full w-[85%]"></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-4">Average Completion Time</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>This Week</span>
                              <span>2.3 hours</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full w-[70%]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Settings</CardTitle>
                      <CardDescription>Configure system preferences and notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Notification Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">Email notifications</Label>
                            <Checkbox id="email-notifications" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="system-alerts">System alerts</Label>
                            <Checkbox id="system-alerts" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="security-notifications">Security notifications</Label>
                            <Checkbox id="security-notifications" defaultChecked />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Automation Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-backup">Automatic backup</Label>
                            <Checkbox id="auto-backup" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-assignment">Auto task assignment</Label>
                            <Checkbox id="auto-assignment" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      {/* Role Change Dialog */}
      {selectedUser && (
        <RoleChangeDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          user={selectedUser}
          onSuccess={() => {
            refetchUsers();
            setSelectedUser(null);
          }}
        />
      )}

      {/* Permissions Dialog */}
      {selectedUser && (
        <PermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          user={selectedUser}
          onSuccess={() => {
            refetchUsers();
            setSelectedUser(null);
          }}
        />
      )}

      {/* Edit User Dialog */}
      {selectedUser && (
        <EditUserDialog
          open={editUserDialogOpen}
          onOpenChange={setEditUserDialogOpen}
          user={selectedUser}
          onSuccess={() => {
            refetchUsers();
            setSelectedUser(null);
          }}
        />
      )}

      {/* View Facility Dialog */}
      {selectedFacility && (
        <Dialog open={viewFacilityDialogOpen} onOpenChange={setViewFacilityDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Facility Details
              </DialogTitle>
              <DialogDescription>
                View detailed information for {selectedFacility.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Facility Code</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{selectedFacility.code}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Facility Name</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{selectedFacility.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Province</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{selectedFacility.province}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">District</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{selectedFacility.district}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Type</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{selectedFacility.type || 'Not specified'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Ownership</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{selectedFacility.ownership || 'Not specified'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedFacility.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedFacility.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Level</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{selectedFacility.level || 'Not specified'}</span>
                  </div>
                </div>
                {selectedFacility.catchmentPopulation && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Catchment Population</label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm text-gray-900">{selectedFacility.catchmentPopulation}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setViewFacilityDialogOpen(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setViewFacilityDialogOpen(false);
                  setEditFacilityDialogOpen(true);
                }}
              >
                Edit Facility
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Facility Dialog */}
      {selectedFacility && (
        <Dialog open={editFacilityDialogOpen} onOpenChange={setEditFacilityDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Edit Facility
              </DialogTitle>
              <DialogDescription>
                Update information for {selectedFacility.name}
              </DialogDescription>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Handle facility update here
                toast({
                  title: 'Facility Updated',
                  description: 'Facility information has been successfully updated.',
                });
                setEditFacilityDialogOpen(false);
                setSelectedFacility(null);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Facility Code</label>
                  <Input 
                    defaultValue={selectedFacility.code}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Facility code cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Facility Name</label>
                  <Input 
                    defaultValue={selectedFacility.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Province</label>
                  <Select defaultValue={selectedFacility.province}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Central">Central</SelectItem>
                      <SelectItem value="Copperbelt">Copperbelt</SelectItem>
                      <SelectItem value="Eastern">Eastern</SelectItem>
                      <SelectItem value="Luapula">Luapula</SelectItem>
                      <SelectItem value="Lusaka">Lusaka</SelectItem>
                      <SelectItem value="Muchinga">Muchinga</SelectItem>
                      <SelectItem value="Northern">Northern</SelectItem>
                      <SelectItem value="North-Western">North-Western</SelectItem>
                      <SelectItem value="Southern">Southern</SelectItem>
                      <SelectItem value="Western">Western</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">District</label>
                  <Input 
                    defaultValue={selectedFacility.district}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Type</label>
                  <Select defaultValue={selectedFacility.type || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Clinic">Clinic</SelectItem>
                      <SelectItem value="Health Center">Health Center</SelectItem>
                      <SelectItem value="Rural Health Center">Rural Health Center</SelectItem>
                      <SelectItem value="Urban Health Center">Urban Health Center</SelectItem>
                      <SelectItem value="Health Post">Health Post</SelectItem>
                      <SelectItem value="District Hospital">District Hospital</SelectItem>
                      <SelectItem value="General Hospital">General Hospital</SelectItem>
                      <SelectItem value="Specialized Hospital">Specialized Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Ownership</label>
                  <Select defaultValue={selectedFacility.ownership || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Mission">Mission</SelectItem>
                      <SelectItem value="NGO">NGO</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <Select defaultValue={selectedFacility.status || 'ACTIVE'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Level</label>
                  <Select defaultValue={selectedFacility.level || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setEditFacilityDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPanel;