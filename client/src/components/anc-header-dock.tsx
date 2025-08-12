import React from 'react';
import { Dock, DockItemData } from '@/components/ui/dock';
import { 
  User, 
  Heart, 
  Stethoscope, 
  TestTube, 
  MessageSquare, 
  ArrowRight, 
  Shield, 
  Users 
} from 'lucide-react';

interface ANCHeaderDockProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ANCHeaderDock: React.FC<ANCHeaderDockProps> = ({ 
  currentTab = 'rapidAssessment',
  onTabChange = () => {}
}) => {
  const dockItems: DockItemData[] = [
    {
      icon: <User size={18} className={currentTab === 'rapidAssessment' ? 'text-white' : 'text-blue-600'} />,
      label: 'Rapid Assessment',
      onClick: () => onTabChange('rapidAssessment'),
      isActive: currentTab === 'rapidAssessment',
    },
    {
      icon: <Heart size={18} className={currentTab === 'clientProfile' ? 'text-white' : 'text-blue-600'} />,
      label: 'Client Profile',
      onClick: () => onTabChange('clientProfile'),
      isActive: currentTab === 'clientProfile',
    },
    {
      icon: <Stethoscope size={18} className={currentTab === 'examination' ? 'text-white' : 'text-blue-600'} />,
      label: 'Examination',
      onClick: () => onTabChange('examination'),
      isActive: currentTab === 'examination',
    },
    {
      icon: <TestTube size={18} className={currentTab === 'labs' ? 'text-white' : 'text-blue-600'} />,
      label: 'Laboratory Tests',
      onClick: () => onTabChange('labs'),
      isActive: currentTab === 'labs',
    },
    {
      icon: <MessageSquare size={18} className={currentTab === 'counseling' ? 'text-white' : 'text-blue-600'} />,
      label: 'Counseling',
      onClick: () => onTabChange('counseling'),
      isActive: currentTab === 'counseling',
    },
    {
      icon: <ArrowRight size={18} className={currentTab === 'referral' ? 'text-white' : 'text-blue-600'} />,
      label: 'Referral',
      onClick: () => onTabChange('referral'),
      isActive: currentTab === 'referral',
    },
    {
      icon: <Shield size={18} className={currentTab === 'prep' ? 'text-white' : 'text-blue-600'} />,
      label: 'PrEP',
      onClick: () => onTabChange('prep'),
      isActive: currentTab === 'prep',
    },
    {
      icon: <Users size={18} className={currentTab === 'pmtct' ? 'text-white' : 'text-blue-600'} />,
      label: 'PMTCT',
      onClick: () => onTabChange('pmtct'),
      isActive: currentTab === 'pmtct',
    },
  ];

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100 pb-4 mb-6">
      <div className="flex justify-center">
        <Dock 
          items={dockItems}
          className="border-blue-200 bg-blue-50/80 backdrop-blur-md"
          panelHeight={60}
          baseItemSize={45}
          magnification={65}
          distance={150}
        />
      </div>
    </div>
  );
};