import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Heart, 
  Stethoscope, 
  Activity, 
  TestTube, 
  Pill, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  VisitDetailsModal,
  ARTHistoryModal,
  ClinicalAssessmentModal,
  LabResultsModal,
  ARTResponseModal,
  ClinicalPlanModal,
  CounsellingModal
} from './PMTCTModals';

interface PMTCTCardProps {
  title: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
  description?: string;
  onOpenModal: () => void;
  lastUpdated?: string;
  dataPreview?: string[];
}

const PMTCTCard: React.FC<PMTCTCardProps> = ({
  title,
  icon,
  status,
  description,
  onOpenModal,
  lastUpdated,
  dataPreview
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()} transition-all duration-200 hover:shadow-md`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {title}
                {getStatusIcon()}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenModal}
              className="bg-white hover:bg-blue-50"
            >
              {status === 'pending' ? 'Add Record' : 'Update'}
            </Button>
            {dataPreview && dataPreview.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2 ml-14">
            Last updated: {lastUpdated}
          </p>
        )}

        {isExpanded && dataPreview && dataPreview.length > 0 && (
          <div className="mt-4 ml-14 space-y-1">
            {dataPreview.map((item, index) => (
              <p key={index} className="text-sm text-gray-700">
                • {item}
              </p>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

interface PMTCTCardSectionProps {
  pmtctData: any;
  onUpdate: (data: any) => void;
  patientId: string;
}

export const PMTCTCardSection: React.FC<PMTCTCardSectionProps> = ({
  pmtctData,
  onUpdate,
  patientId
}) => {
  // Modal states
  const [showVisitDetailsModal, setShowVisitDetailsModal] = useState(false);
  const [showARTHistoryModal, setShowARTHistoryModal] = useState(false);
  const [showClinicalAssessmentModal, setShowClinicalAssessmentModal] = useState(false);
  const [showLabResultsModal, setShowLabResultsModal] = useState(false);
  const [showARTResponseModal, setShowARTResponseModal] = useState(false);
  const [showClinicalPlanModal, setShowClinicalPlanModal] = useState(false);
  const [showCounsellingModal, setShowCounsellingModal] = useState(false);

  // Card data and status determination
  const getCardStatus = (sectionData: any): 'pending' | 'in-progress' | 'completed' => {
    if (!sectionData || Object.keys(sectionData).length === 0) return 'pending';
    // Check if all required fields are filled (simplified logic)
    const hasData = Object.values(sectionData).some(value => value !== null && value !== '');
    return hasData ? 'completed' : 'in-progress';
  };

  const getDataPreview = (section: string): string[] => {
    switch (section) {
      case 'visitDetails':
        return pmtctData?.visitDetails ? [
          pmtctData.visitDetails.reasonForVisit ? `Visit reason: ${pmtctData.visitDetails.reasonForVisit}` : '',
          pmtctData.visitDetails.seriousIllness ? 'Signs of serious illness present' : 'No signs of serious illness'
        ].filter(Boolean) : [];
      
      case 'artHistory':
        return pmtctData?.artHistory ? [
          pmtctData.artHistory.artStatus ? `ART Status: ${pmtctData.artHistory.artStatus}` : '',
          pmtctData.artHistory.currentRegimen ? `Current regimen: ${pmtctData.artHistory.currentRegimen}` : '',
          pmtctData.artHistory.adherenceStatus ? `Adherence: ${pmtctData.artHistory.adherenceStatus}` : ''
        ].filter(Boolean) : [];
      
      case 'clinicalAssessment':
        return pmtctData?.clinicalAssessment ? [
          pmtctData.clinicalAssessment.whoStage ? `WHO Stage: ${pmtctData.clinicalAssessment.whoStage}` : '',
          pmtctData.clinicalAssessment.cd4Count ? `CD4 Count: ${pmtctData.clinicalAssessment.cd4Count} cells/mm³` : ''
        ].filter(Boolean) : [];
      
      case 'labResults':
        return pmtctData?.labResults ? [
          pmtctData.labResults.viralLoad ? `Viral Load: ${pmtctData.labResults.viralLoad} copies/ml` : '',
          pmtctData.labResults.hemoglobin ? `Hemoglobin: ${pmtctData.labResults.hemoglobin} g/dL` : '',
          pmtctData.labResults.cd4Count ? `CD4 Count: ${pmtctData.labResults.cd4Count} cells/mm³` : ''
        ].filter(Boolean) : [];
      
      case 'artResponse':
        return pmtctData?.artResponse ? [
          pmtctData.artResponse.artDuration ? `ART Duration: ${pmtctData.artResponse.artDuration}` : '',
          pmtctData.artResponse.missedDoses ? `Missed doses: ${pmtctData.artResponse.missedDoses}` : '',
          pmtctData.artResponse.recentVL ? `Recent VL: ${pmtctData.artResponse.recentVL}` : ''
        ].filter(Boolean) : [];
      
      case 'clinicalPlan':
        return pmtctData?.clinicalPlan ? [
          pmtctData.clinicalPlan.ctxProphylaxis ? `CTX Prophylaxis: ${pmtctData.clinicalPlan.ctxProphylaxis}` : '',
          pmtctData.clinicalPlan.infantProphylaxis ? 'Infant ARV prophylaxis planned' : '',
          pmtctData.clinicalPlan.tptProvision ? 'TPT provision planned' : ''
        ].filter(Boolean) : [];
      
      case 'counselling':
        return pmtctData?.counselling ? [
          pmtctData.counselling.partnerTested ? 'Partner testing counselled' : '',
          pmtctData.counselling.infantFeeding ? `Infant feeding: ${pmtctData.counselling.infantFeeding}` : ''
        ].filter(Boolean) : [];
      
      default:
        return [];
    }
  };

  const cards = [
    {
      title: 'Visit Details & Triage',
      icon: <FileText className="w-5 h-5 text-purple-500" />,
      status: getCardStatus(pmtctData?.visitDetails),
      description: 'Reason for visit and initial assessment',
      onOpenModal: () => setShowVisitDetailsModal(true),
      dataPreview: getDataPreview('visitDetails')
    },
    {
      title: 'ART & PMTCT History',
      icon: <Heart className="w-5 h-5 text-red-500" />,
      status: getCardStatus(pmtctData?.artHistory),
      description: 'HIV care enrollment and treatment history',
      onOpenModal: () => setShowARTHistoryModal(true),
      dataPreview: getDataPreview('artHistory')
    },
    {
      title: 'Clinical Assessment',
      icon: <Stethoscope className="w-5 h-5 text-blue-500" />,
      status: getCardStatus(pmtctData?.clinicalAssessment),
      description: 'WHO staging and clinical evaluation',
      onOpenModal: () => setShowClinicalAssessmentModal(true),
      dataPreview: getDataPreview('clinicalAssessment')
    },
    {
      title: 'Lab Results & Investigations',
      icon: <TestTube className="w-5 h-5 text-green-500" />,
      status: getCardStatus(pmtctData?.labResults),
      description: 'CD4 count, viral load, and other tests',
      onOpenModal: () => setShowLabResultsModal(true),
      dataPreview: getDataPreview('labResults')
    },
    {
      title: 'ART Response & VL Monitoring',
      icon: <Activity className="w-5 h-5 text-teal-500" />,
      status: getCardStatus(pmtctData?.artResponse),
      description: 'Treatment response and viral load monitoring',
      onOpenModal: () => setShowARTResponseModal(true),
      dataPreview: getDataPreview('artResponse')
    },
    {
      title: 'Clinical Plan',
      icon: <Pill className="w-5 h-5 text-orange-500" />,
      status: getCardStatus(pmtctData?.clinicalPlan),
      description: 'Treatment decisions and interventions',
      onOpenModal: () => setShowClinicalPlanModal(true),
      dataPreview: getDataPreview('clinicalPlan')
    },
    {
      title: 'Counselling & Follow-up',
      icon: <Calendar className="w-5 h-5 text-indigo-500" />,
      status: getCardStatus(pmtctData?.counselling),
      description: 'Education, referrals, and next visit',
      onOpenModal: () => setShowCounsellingModal(true),
      dataPreview: getDataPreview('counselling')
    }
  ];

  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <PMTCTCard
          key={index}
          {...card}
          lastUpdated={pmtctData?.[`${card.title.toLowerCase().replace(/\s+/g, '')}UpdatedAt`]}
        />
      ))}

      {/* Modals */}
      <VisitDetailsModal
        open={showVisitDetailsModal}
        onOpenChange={setShowVisitDetailsModal}
        data={pmtctData?.visitDetails}
        onSave={(data) => onUpdate({ ...pmtctData, visitDetails: data })}
      />

      <ARTHistoryModal
        open={showARTHistoryModal}
        onOpenChange={setShowARTHistoryModal}
        data={pmtctData?.artHistory}
        onSave={(data) => onUpdate({ ...pmtctData, artHistory: data })}
      />

      <ClinicalAssessmentModal
        open={showClinicalAssessmentModal}
        onOpenChange={setShowClinicalAssessmentModal}
        data={pmtctData?.clinicalAssessment}
        onSave={(data) => onUpdate({ ...pmtctData, clinicalAssessment: data })}
      />

      <LabResultsModal
        open={showLabResultsModal}
        onOpenChange={setShowLabResultsModal}
        data={pmtctData?.labResults}
        onSave={(data) => onUpdate({ ...pmtctData, labResults: data })}
      />

      <ARTResponseModal
        open={showARTResponseModal}
        onOpenChange={setShowARTResponseModal}
        data={pmtctData?.artResponse}
        onSave={(data) => onUpdate({ ...pmtctData, artResponse: data })}
      />

      <ClinicalPlanModal
        open={showClinicalPlanModal}
        onOpenChange={setShowClinicalPlanModal}
        data={pmtctData?.clinicalPlan}
        onSave={(data) => onUpdate({ ...pmtctData, clinicalPlan: data })}
      />

      <CounsellingModal
        open={showCounsellingModal}
        onOpenChange={setShowCounsellingModal}
        data={pmtctData?.counselling}
        onSave={(data) => onUpdate({ ...pmtctData, counselling: data })}
      />
    </div>
  );
};