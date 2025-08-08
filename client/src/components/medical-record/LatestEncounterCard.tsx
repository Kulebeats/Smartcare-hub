import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, Baby, Stethoscope, FlaskConical, Pill, Users, Activity, Calendar, Heart, TestTube, BookOpen, ArrowRightLeft, Shield, ChevronRight } from 'lucide-react';

interface LatestEncounterProps {
  activeSection: string;
  encounterData: any;
}

// Enhanced section placeholders mapping
const sectionPlaceholders = {
  rapidAssessment: {
    title: "Rapid Assessment Context",
    icon: <Activity className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "Contact Date", placeholder: "Not recorded", key: "contactDate" },
      { label: "Gestational Age", placeholder: "To be calculated", key: "gestationalAge" },
      { label: "Pregnancy Status", placeholder: "Pending confirmation", key: "pregnancyStatus" },
      { label: "Risk Level", placeholder: "Assessment required", key: "riskLevel" },
      { label: "Danger Signs", placeholder: "None identified", key: "dangerSigns" }
    ]
  },
  clientProfile: {
    title: "Client Profile Summary",
    icon: <Users className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "Registration Date", placeholder: "Not recorded", key: "registrationDate" },
      { label: "Age", placeholder: "Not specified", key: "age" },
      { label: "Gravida/Para", placeholder: "G0 P0", key: "gravidaPara" },
      { label: "Previous Pregnancies", placeholder: "No history", key: "previousPregnancies" },
      { label: "Living Children", placeholder: "None recorded", key: "livingChildren" }
    ]
  },
  examination: {
    title: "Physical Examination",
    icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "Blood Pressure", placeholder: "Pending measurement", key: "bloodPressure" },
      { label: "Weight", placeholder: "Not recorded", key: "weight" },
      { label: "Fundal Height", placeholder: "To be measured", key: "fundalHeight" },
      { label: "Fetal Heart Rate", placeholder: "Pending assessment", key: "fetalHeartRate" },
      { label: "Temperature", placeholder: "Not taken", key: "temperature" }
    ]
  },
  labs: {
    title: "Laboratory Investigations",
    icon: <TestTube className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "HIV Status", placeholder: "Test pending", key: "hivStatus" },
      { label: "Hemoglobin", placeholder: "Not tested", key: "hemoglobin" },
      { label: "Blood Group", placeholder: "Unknown", key: "bloodGroup" },
      { label: "Syphilis Test", placeholder: "Pending", key: "syphilisTest" },
      { label: "Anemia Status", placeholder: "Assessment required", key: "anemiaStatus" }
    ]
  },
  counseling: {
    title: "Counseling & Education",
    icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "Topics Covered", placeholder: "No sessions recorded", key: "topicsCovered" },
      { label: "Iron/Folate", placeholder: "Not prescribed", key: "ironFolate" },
      { label: "Deworming", placeholder: "Not given", key: "deworming" },
      { label: "Nutrition Counseling", placeholder: "Pending", key: "nutritionCounseling" },
      { label: "Birth Preparedness", placeholder: "Not discussed", key: "birthPreparedness" }
    ]
  },
  referral: {
    title: "Referral Information",
    icon: <ArrowRightLeft className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "Referral Status", placeholder: "No referral needed", key: "referralStatus" },
      { label: "Referral Type", placeholder: "N/A", key: "referralType" },
      { label: "Receiving Facility", placeholder: "Not selected", key: "receivingFacility" },
      { label: "Referral Reason", placeholder: "None", key: "referralReason" },
      { label: "Urgency Level", placeholder: "Standard", key: "urgencyLevel" }
    ]
  },
  prep: {
    title: "PrEP Assessment",
    icon: <Shield className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "Risk Level", placeholder: "Not assessed", key: "riskLevel" },
      { label: "Eligibility Status", placeholder: "Assessment pending", key: "eligibilityStatus" },
      { label: "Assessment Date", placeholder: "Not recorded", key: "assessmentDate" },
      { label: "Clinical Decision", placeholder: "Pending evaluation", key: "clinicalDecision" },
      { label: "Prescription Status", placeholder: "Not initiated", key: "prescriptionStatus" }
    ]
  },
  pmtct: {
    title: "PMTCT Assessment",
    icon: <Shield className="w-5 h-5 text-blue-600" />,
    fields: [
      { label: "PMTCT Status", placeholder: "Not assessed", key: "pmtctStatus" },
      { label: "ART Status", placeholder: "Unknown", key: "artStatus" },
      { label: "Partner Status", placeholder: "Not disclosed", key: "partnerStatus" },
      { label: "WHO Stage", placeholder: "Not staged", key: "whoStage" },
      { label: "CD4 Count", placeholder: "Not tested", key: "cd4Count" }
    ]
  }
};

export function LatestEncounterCard({ activeSection, encounterData }: LatestEncounterProps) {
  // Extract data from encounterData for the three sections
  const clientDetailsData = {
    contactDate: encounterData?.contactDate || encounterData?.rapidAssessment?.contactDate || 'Not recorded',
    safeMotherhoodNumber: encounterData?.safeMotherhoodNumber || 'Not assigned',
    origin: encounterData?.origin || 'Not specified',
    cameAsCouple: encounterData?.cameAsCouple !== undefined ? (encounterData.cameAsCouple ? 'Yes' : 'No') : 'Not recorded'
  };

  const dangerSignsData = {
    dangerSigns: encounterData?.dangerSigns || encounterData?.rapidAssessment?.dangerSigns || [],
    healthConcerns: encounterData?.healthConcerns || []
  };

  const emergencyReferralData = {
    emergencyReferral: encounterData?.emergencyReferral !== undefined ? (encounterData.emergencyReferral ? 'Yes' : 'No') : 'No',
    checklistCompleted: encounterData?.checklistCompleted !== undefined ? (encounterData.checklistCompleted ? 'Yes' : 'No') : 'No',
    feedbackReceived: encounterData?.feedbackReceived !== undefined ? (encounterData.feedbackReceived ? 'Yes' : 'No') : 'No'
  };

  const getCurrentSectionData = () => {
    const sectionData = sectionPlaceholders[activeSection as keyof typeof sectionPlaceholders];
    if (!sectionData) {
      return sectionPlaceholders.rapidAssessment; // Default fallback
    }
    return sectionData;
  };

  const renderSectionContent = () => {
    const sectionData = getCurrentSectionData();
    
    return (
      <div className="space-y-3">
        {sectionData.fields.map((field, index) => {
          const actualValue = encounterData?.[activeSection]?.[field.key] || 
                            encounterData?.[field.key] || 
                            field.placeholder;
          
          return (
            <div key={index} className="text-sm">
              <span className="text-gray-600">{field.label}:</span>
              <span className={`ml-2 ${actualValue === field.placeholder ? 'text-gray-400 italic' : 'font-medium text-gray-900'}`}>
                {actualValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const legacyRenderSectionContent = () => {
    switch (activeSection) {
      case 'rapidAssessment':
        return (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-gray-600">Pregnancy Status:</span>
              <span className="ml-2 font-medium">G{encounterData?.gravida || '-'} P{encounterData?.para || '-'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Gestational Age:</span>
              <span className="ml-2 font-medium">{encounterData?.gestationalAge || '-'} weeks</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">LMP:</span>
              <span className="ml-2 font-medium">{encounterData?.lmp || 'Not recorded'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">EDD:</span>
              <span className="ml-2 font-medium">{encounterData?.edd || 'Not calculated'}</span>
            </div>
            {encounterData?.dangerSigns && encounterData.dangerSigns.length > 0 && (
              <div className="mt-3 p-2 bg-red-50 rounded">
                <div className="flex items-center text-red-700 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Danger Signs Present
                </div>
                <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
                  {encounterData.dangerSigns.map((sign: string, index: number) => (
                    <li key={index}>{sign}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'client-profile':
        return (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-gray-600">Previous Pregnancies:</span>
              <span className="ml-2 font-medium">{encounterData?.previousPregnancies || 0}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Living Children:</span>
              <span className="ml-2 font-medium">{encounterData?.livingChildren || 0}</span>
            </div>
            {encounterData?.previousComplications && (
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-1">Previous Complications:</div>
                <ul className="text-xs text-gray-700 list-disc list-inside">
                  {encounterData.previousComplications.map((comp: string, index: number) => (
                    <li key={index}>{comp}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm">
              <span className="text-gray-600">Previous Delivery Mode:</span>
              <span className="ml-2 font-medium">{encounterData?.previousDeliveryMode || 'N/A'}</span>
            </div>
          </div>
        );

      case 'medical-history':
        return (
          <div className="space-y-3">
            {encounterData?.currentConditions && encounterData.currentConditions.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Current Medical Conditions:</div>
                <ul className="text-xs text-gray-700 list-disc list-inside">
                  {encounterData.currentConditions.map((condition: string, index: number) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>
            )}
            {encounterData?.currentMedications && encounterData.currentMedications.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Current Medications:</div>
                <ul className="text-xs text-gray-700 list-disc list-inside">
                  {encounterData.currentMedications.map((med: string, index: number) => (
                    <li key={index}>{med}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm">
              <span className="text-gray-600">Allergies:</span>
              <span className="ml-2 font-medium">{encounterData?.allergies || 'None reported'}</span>
            </div>
          </div>
        );

      case 'examination':
        return (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-gray-600">Blood Pressure:</span>
              <span className="ml-2 font-medium">{encounterData?.bp || '-'} mmHg</span>
              {encounterData?.bpClassification && (
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  encounterData.bpClassification === 'Hypertensive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {encounterData.bpClassification}
                </span>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Weight:</span>
              <span className="ml-2 font-medium">{encounterData?.weight || '-'} kg</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">BMI:</span>
              <span className="ml-2 font-medium">{encounterData?.bmi || '-'}</span>
            </div>
            {encounterData?.abnormalFindings && encounterData.abnormalFindings.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 rounded">
                <div className="text-sm text-yellow-700 font-medium">Abnormal Findings:</div>
                <ul className="mt-1 text-xs text-yellow-600 list-disc list-inside">
                  {encounterData.abnormalFindings.map((finding: string, index: number) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'laboratory':
        return (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-gray-600">Hemoglobin:</span>
              <span className="ml-2 font-medium">{encounterData?.hemoglobin || '-'} g/dL</span>
              {encounterData?.anemiaStatus && (
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  encounterData.anemiaStatus === 'Severe' ? 'bg-red-100 text-red-700' : 
                  encounterData.anemiaStatus === 'Moderate' ? 'bg-orange-100 text-orange-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {encounterData.anemiaStatus} Anemia
                </span>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-600">HIV Status:</span>
              <span className="ml-2 font-medium">{encounterData?.hivStatus || 'Unknown'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Syphilis:</span>
              <span className="ml-2 font-medium">{encounterData?.syphilisResult || 'Not tested'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Blood Group:</span>
              <span className="ml-2 font-medium">{encounterData?.bloodGroup || '-'}</span>
            </div>
            {encounterData?.pendingLabs && encounterData.pendingLabs.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <div className="text-sm text-blue-700 font-medium">Pending Labs:</div>
                <ul className="mt-1 text-xs text-blue-600 list-disc list-inside">
                  {encounterData.pendingLabs.map((lab: string, index: number) => (
                    <li key={index}>{lab}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'pmtct':
        return (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-gray-600">ART Status:</span>
              <span className="ml-2 font-medium">{encounterData?.artStatus || 'Not on ART'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Viral Load:</span>
              <span className="ml-2 font-medium">{encounterData?.viralLoad || 'Not done'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">CD4 Count:</span>
              <span className="ml-2 font-medium">{encounterData?.cd4Count || 'Not done'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">WHO Stage:</span>
              <span className="ml-2 font-medium">{encounterData?.whoStage || 'Not assessed'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">TPT Status:</span>
              <span className="ml-2 font-medium">{encounterData?.tptStatus || 'Not started'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Partner HIV Status:</span>
              <span className="ml-2 font-medium">{encounterData?.partnerHivStatus || 'Unknown'}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Select a section to view latest encounter information
          </div>
        );
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'rapid-assessment':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'client-profile':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'medical-history':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'examination':
        return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case 'laboratory':
        return <FlaskConical className="w-5 h-5 text-blue-500" />;
      case 'pmtct':
        return <Activity className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'rapid-assessment':
        return 'Rapid Assessment';
      case 'client-profile':
        return 'Client Profile';
      case 'medical-history':
        return 'Medical History';
      case 'examination':
        return 'Examination';
      case 'laboratory':
        return 'Laboratory';
      case 'pmtct':
        return 'PMTCT';
      default:
        return 'Latest Encounter';
    }
  };

  const currentSectionData = getCurrentSectionData();

  return (
    <div className="space-y-4">
      {/* Container 1: Gather Client Details */}
      <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Gather Client Details</CardTitle>
            <Button 
              variant="ghost" 
              className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Contact Date:</span>
              <span className="font-medium text-gray-900">{clientDetailsData.contactDate}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Safe Motherhood Number:</span>
              <span className="font-medium text-gray-900">{clientDetailsData.safeMotherhoodNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Origin:</span>
              <span className="font-medium text-gray-900">{clientDetailsData.origin}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Came as a Couple:</span>
              <span className={`font-medium ${clientDetailsData.cameAsCouple === 'Yes' ? 'text-green-600' : 'text-gray-900'}`}>
                {clientDetailsData.cameAsCouple}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container 2: Danger Signs & Health Concerns */}
      <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Danger Signs & Health Concerns</CardTitle>
            <Button 
              variant="ghost" 
              className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Danger Signs:</span>
              <span className={`font-medium ${dangerSignsData.dangerSigns.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {dangerSignsData.dangerSigns.length > 0 
                  ? dangerSignsData.dangerSigns.join(', ') 
                  : 'None identified'}
              </span>
            </div>
            {dangerSignsData.dangerSigns.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                <div className="flex items-center text-red-700 font-medium mb-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Danger Signs Present
                </div>
                <ul className="text-red-600 list-disc list-inside ml-4">
                  {dangerSignsData.dangerSigns.map((sign: string, index: number) => (
                    <li key={index}>{sign}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Container 3: Emergency Referral */}
      <Card className="bg-blue-50 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Emergency Referral</CardTitle>
            <Button 
              variant="ghost" 
              className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Emergency Referral:</span>
              <span className={`font-medium ${emergencyReferralData.emergencyReferral === 'Yes' ? 'text-red-600' : 'text-green-600'}`}>
                {emergencyReferralData.emergencyReferral}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Checklist Completed:</span>
              <span className={`font-medium ${emergencyReferralData.checklistCompleted === 'Yes' ? 'text-green-600' : 'text-gray-900'}`}>
                {emergencyReferralData.checklistCompleted}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Feedback Received:</span>
              <span className={`font-medium ${emergencyReferralData.feedbackReceived === 'Yes' ? 'text-green-600' : 'text-gray-900'}`}>
                {emergencyReferralData.feedbackReceived}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}