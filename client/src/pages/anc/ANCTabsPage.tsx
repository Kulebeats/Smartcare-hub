/**
 * ANC Tabs Page - Refactored Version
 * Main ANC page using tab-based architecture with React Query
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  User, 
  Activity, 
  FlaskRoundIcon as Flask, 
  MessageSquare, 
  Send,
  Baby,
  Loader2,
  CheckCircle
} from 'lucide-react';

// Tab Components
import { RapidAssessmentTab } from './tabs/RapidAssessmentTab';
import { ClientProfileTab } from './tabs/ClientProfileTab';
import { ExaminationTab } from './tabs/ExaminationTab';
import { LabsTab } from './tabs/LabsTab';
import { CounselingTab } from './tabs/CounselingTab';

// Hooks and services
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { useFeatureFlag } from '@/config/feature-flags';
import { safeLog } from '@/utils/anc/safe-logger';

// Tab configuration
const ANC_TABS = [
  { id: 'rapid-assessment', label: 'Rapid Assessment', icon: AlertTriangle, component: RapidAssessmentTab },
  { id: 'client-profile', label: 'Client Profile', icon: User, component: ClientProfileTab },
  { id: 'examination', label: 'Examination', icon: Activity, component: ExaminationTab },
  { id: 'labs', label: 'Labs & Tests', icon: Flask, component: LabsTab },
  { id: 'counseling', label: 'Counseling', icon: MessageSquare, component: CounselingTab },
  { id: 'referral', label: 'Referral', icon: Send, component: null }, // To be implemented
  { id: 'pmtct', label: 'PMTCT', icon: Baby, component: null }, // To be implemented
];

interface ANCTabsPageParams {
  patientId?: string;
  encounterId?: string;
}

export const ANCTabsPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const params = useParams() as ANCTabsPageParams;
  const patientId = params.patientId || null;
  const encounterId = params.encounterId || null;
  
  // Feature flags
  const useTabsLayout = useFeatureFlag('NEW_ANC_TABS');
  const useReactQuery = useFeatureFlag('REACT_QUERY_DATA');
  
  // State
  const [activeTab, setActiveTab] = useState('rapid-assessment');
  const [visitNumber, setVisitNumber] = useState(1);
  
  // ANC Encounter hook
  const {
    state,
    patient,
    encounter,
    hasCriticalDangerSigns,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    saveEncounter,
    navigateToTab
  } = useAncEncounter({ 
    patientId: patientId || '', 
    encounterId: encounterId || undefined 
  });
  
  // Auto-save on tab change if there are unsaved changes
  const handleTabChange = async (tabId: string) => {
    if (hasUnsavedChanges) {
      const result = await saveEncounter();
      if (!result.success) {
        // Show error but still allow tab change
        safeLog.error('Failed to auto-save on tab change', result.error);
      }
    }
    
    const canNavigate = navigateToTab(tabId);
    if (canNavigate) {
      setActiveTab(tabId);
    } else {
      // Show validation message
      safeLog.warn('Cannot navigate to tab - validation required', { 
        fromTab: activeTab, 
        toTab: tabId 
      });
    }
  };
  
  // Handle navigation between tabs
  const handleNext = () => {
    const currentIndex = ANC_TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < ANC_TABS.length - 1) {
      handleTabChange(ANC_TABS[currentIndex + 1].id);
    }
  };
  
  const handleBack = () => {
    const currentIndex = ANC_TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      handleTabChange(ANC_TABS[currentIndex - 1].id);
    }
  };
  
  // Check if using old page (feature flag disabled)
  if (!useTabsLayout) {
    setLocation(`/anc/${patientId}`);
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading ANC data...</span>
      </div>
    );
  }
  
  if (!patientId) {
    return (
      <div className="p-6">
        <Alert className="border-red-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No patient selected. Please select a patient first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Antenatal Care Visit</CardTitle>
              <CardDescription>
                {patient && (
                  <>
                    Patient: {patient.firstName} {patient.lastName} | 
                    Visit #{visitNumber} | 
                    {state.gestationalAge && (
                      <>GA: {state.gestationalAge.weeks}w{state.gestationalAge.days}d</>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600 flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-1 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {isSaving && (
                <span className="text-sm text-blue-600 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Saving...
                </span>
              )}
              {state.syncStatus === 'success' && !hasUnsavedChanges && (
                <span className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Saved
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Critical Alert */}
      {hasCriticalDangerSigns && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>CRITICAL DANGER SIGNS PRESENT</strong> - Immediate medical intervention required.
            Emergency referral procedures should be initiated.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 h-auto">
          {ANC_TABS.map((tab) => {
            const Icon = tab.icon;
            const isCompleted = false; // TODO: Track completion status
            const hasErrors = false; // TODO: Track validation errors
            
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                disabled={!tab.component}
                className="flex flex-col items-center p-2 space-y-1 data-[state=active]:bg-blue-50"
              >
                <Icon className={`w-5 h-5 ${
                  hasErrors ? 'text-red-500' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-600'
                }`} />
                <span className="text-xs">{tab.label}</span>
                {!tab.component && (
                  <span className="text-xs text-gray-400">(Coming Soon)</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {/* Tab Content */}
        {ANC_TABS.map((tab) => {
          if (!tab.component) {
            return (
              <TabsContent key={tab.id} value={tab.id}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <tab.icon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{tab.label} Module</h3>
                      <p className="text-gray-600">This module is being developed and will be available soon.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          }
          
          const TabComponent = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id}>
              <TabComponent
                patientId={patientId}
                encounterId={encounterId || undefined}
                onNext={handleNext}
                onBack={handleBack}
              />
            </TabsContent>
          );
        })}
      </Tabs>
      
      {/* Bottom Actions */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => setLocation('/anc')}
            >
              Exit Without Saving
            </Button>
            <div className="flex space-x-2">
              {useReactQuery && (
                <span className="text-xs text-gray-500 self-center">
                  Using React Query
                </span>
              )}
              <Button
                onClick={saveEncounter}
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save All Changes'
                )}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Complete Visit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};