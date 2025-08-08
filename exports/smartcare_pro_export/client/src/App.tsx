import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import FacilitySelection from "@/pages/facility-selection";
import PatientRecords from "@/pages/patient-records";
import NewPatient from "@/pages/new-patient";
import ServiceSelection from "@/pages/service-selection";
import MedicalRecords from "@/pages/medical-records";
import { Sidebar } from "@/components/layout/sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import PrepPage from "@/pages/prep-page"; // Added import for PrepPage
import ArtPage from "@/pages/art-page"; // Added import for ArtPage

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  // Hide sidebar on these routes
  const hideSidebarRoutes = ['/', '/auth', '/service-selection'];
  const showSidebar = !hideSidebarRoutes.includes(location);

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <main className={cn(
        "flex-1 transition-all duration-200 ease-in-out",
        showSidebar && sidebarOpen ? "lg:pl-64" : "lg:pl-0"
      )}>
        <Switch>
          <ProtectedRoute path="/" component={FacilitySelection} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/patients" component={PatientRecords} />
          <ProtectedRoute path="/patients/new" component={NewPatient} />
          <ProtectedRoute path="/service-selection" component={ServiceSelection} />
          <ProtectedRoute path="/medical-records/:serviceId" component={MedicalRecords} />
          <ProtectedRoute path="/prep" component={PrepPage} /> {/* Added PrEP route */}
          <ProtectedRoute path="/art" component={ArtPage} /> {/* Added ART route */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;