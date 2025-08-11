import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, AdminProtectedRoute } from "@/lib/protected-route";
import { GlobalLoadingProvider } from "@/components/ui/global-loading-provider";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import FacilitySelectionPage from "@/pages/facility-selection"; // Restored facility selection
import PatientRecords from "@/pages/patient-records";
import NewPatient from "@/pages/new-patient";

import ClientSearch from "@/pages/client-search-enhanced"; // Enhanced client search page
import ServiceSelection from "@/pages/service-selection";
import MedicalRecords from "@/pages/medical-records";
import { Sidebar } from "@/components/layout/sidebar";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import PrepPage from "@/pages/prep-page"; 
import ArtPageNew from "@/pages/art-page-new"; // Updated import for ART page

import { ANCTabsPage } from "@/pages/anc/ANCTabsPage"; // Refactored Antenatal Care page
import ANCFollowupPage from "@/pages/anc-followup-page";
import ANCFollowupSelectionPage from "@/pages/anc-followup-selection";
import VitalsPage from "@/pages/vitals-page"; // Vital Signs page
import HTSPage from "@/pages/hts-page"; // HIV Testing Services page
import PharmacovigilancePage from "@/pages/pharmacovigilance-page"; // Pharmacovigilance page
import PatientTransferPage from "@/pages/patient-transfer"; // Smart Transfer System

import AdminPanel from "@/pages/admin-panel"; // Admin panel
import AdminLogin from "@/pages/admin-login"; // Admin login
import AdminDAK from "@/pages/AdminDAK"; // DAK Clinical Decision Support Admin
import ReportsDashboard from "@/pages/reports-dashboard"; // Reports Dashboard
import PerformanceDashboard from "@/pages/performance-dashboard"; // Performance Dashboard
import RegistrationSummary from "@/pages/registration-summary"; // Registration Summary and Edit
import PharmacyDashboard from "@/pages/pharmacy-dashboard"; // Pharmacy Dashboard
import DispensationPage from "@/pages/dispensation"; // Dispensation page
import PharmacyDispense from "@/pages/pharmacy-dispense"; // New modular dispensation page
// PharmacyPrescription import removed - now used as modal component within PharmacyDashboard


function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Hide sidebar on these routes
  const hideSidebarRoutes = ['/', '/admin-login', '/facility-selection', '/service-selection', '/client-search', '/admin', '/admin/dak'];
  const showSidebar = !hideSidebarRoutes.includes(location);

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <main className="flex-1 transition-all duration-300 ease-in-out">
        <Switch>
          {/* TEMPORARY: Authentication bypassed for development */}
          <Route path="/" component={PatientRecords} /> {/* Direct to main page */}
          <Route path="/new-patient" component={NewPatient} />
          <Route path="/registration-summary" component={RegistrationSummary} />
          <Route path="/facility-selection" component={FacilitySelectionPage} />
          <Route path="/patients" component={PatientRecords} />
          <Route path="/patients/new" component={NewPatient} />

          <Route path="/client-search" component={ClientSearch} />
          <Route path="/service-selection" component={ServiceSelection} />
          <Route path="/medical-records/:serviceId" component={MedicalRecords} />
          <Route path="/medical-record" component={MedicalRecords} />
          <Route path="/prep" component={PrepPage} />
          <Route path="/art" component={ArtPageNew} />
          <Route path="/anc" component={ANCTabsPage} />
          <Route path="/anc/:patientId" component={ANCTabsPage} />
          <Route path="/vitals" component={VitalsPage} />
          <Route path="/hts" component={HTSPage} />
          <Route path="/anc/followup-selection" component={ANCFollowupSelectionPage} />
          <Route path="/patients/:patientId/anc/followup" component={ANCFollowupPage} />
          <Route path="/pharmacovigilance" component={PharmacovigilancePage} />
          <Route path="/pharmacy" component={PharmacyDashboard} />
          <Route path="/dispensation" component={DispensationPage} />
          <Route path="/pharmacy/dispense" component={PharmacyDispense} />
          <Route path="/pharmacy/test">
            {() => {
              const TestPage = React.lazy(() => import("@/components/pharmacy/dispensation-test-page"));
              return (
                <React.Suspense fallback={<div>Loading test page...</div>}>
                  <TestPage />
                </React.Suspense>
              );
            }}
          </Route>
          <Route path="/pharmacy/prescription">
            {() => {
              // Redirect to pharmacy dashboard with prescription modal
              window.location.href = '/pharmacy?modal=prescription';
              return null;
            }}
          </Route>

          <Route path="/transfers" component={PatientTransferPage} />

          <Route path="/reports" component={ReportsDashboard} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/panel" component={AdminPanel} />
          <Route path="/admin-panel" component={AdminPanel} />
          <Route path="/admin/dak" component={AdminDAK} />
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
      <GlobalLoadingProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </GlobalLoadingProvider>
    </QueryClientProvider>
  );
}

export default App;