import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Heart, Users, Brain, User } from 'lucide-react';

interface IPVSignsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSelection: (selectedSigns: string[]) => void;
  initialSelectedSigns?: string[];
}

// IPV Sign with category grouping (mirror danger signs structure)
interface IPVSignWithTooltipProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  category: string;
}

const IPVSignWithTooltip: React.FC<IPVSignWithTooltipProps> = ({
  id, name, value, checked, onChange, label
}) => (
  <div className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded text-xs">
    <input
      type="checkbox"
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="rounded border-gray-300 text-purple-600"
    />
    <label htmlFor={id} className="text-gray-700 cursor-pointer text-xs leading-tight">
      {label}
    </label>
  </div>
);

const IPVSignsSelectionModal: React.FC<IPVSignsSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirmSelection,
  initialSelectedSigns = []
}) => {
  const [selectedSigns, setSelectedSigns] = useState<string[]>(initialSelectedSigns);
  const [ipvSignsConfirmed, setIpvSignsConfirmed] = useState(false);

  // IPV Signs organized by category (mirror danger signs structure)
  const ipvSignCategories = {
    emotional: {
      title: "Emotional & Mental Health",
      icon: <Heart className="w-4 h-4 text-blue-600" />,
      signs: [
        'Ongoing stress',
        'Ongoing anxiety',
        'Ongoing depression',
        'Unspecified ongoing emotional health issues'
      ]
    },
    behavioral: {
      title: "Behavioral & Substance Use",
      icon: <Users className="w-4 h-4 text-purple-600" />,
      signs: [
        'Misuse of alcohol',
        'Misuse of drugs',
        'Unspecified harmful behaviours'
      ]
    },
    selfHarm: {
      title: "Self-Harm Risk",
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      signs: [
        'Thoughts of self-harm or (attempted) suicide',
        'Plans of self-harm or (attempt) suicide'
      ]
    },
    reproductive: {
      title: "Reproductive Health",
      icon: <Heart className="w-4 h-4 text-pink-600" />,
      signs: [
        'Repeated sexually transmitted infections (STIs)',
        'Unwanted pregnancies',
        'Adverse reproductive outcomes',
        'Unexplained reproductive symptoms',
        'Repeated vaginal bleeding'
      ]
    },
    physical: {
      title: "Physical Symptoms",
      icon: <Shield className="w-4 h-4 text-green-600" />,
      signs: [
        'Unexplained chronic pain',
        'Unexplained chronic gastrointestinal symptoms',
        'Unexplained genitourinary symptoms',
        'Injury to abdomen',
        'Injury other (specify)',
        'Problems with central nervous system'
      ]
    },
    healthcare: {
      title: "Healthcare Patterns",
      icon: <User className="w-4 h-4 text-indigo-600" />,
      signs: [
        'Repeated health consultations with no clear diagnosis',
        "Woman's partner or husband is intrusive during consultations",
        "Woman often misses her own or her children's health-care appointments",
        'Children have emotional and behavioural problems'
      ]
    }
  };

  const handleIPVSignsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedSigns([...selectedSigns, value]);
    } else {
      setSelectedSigns(selectedSigns.filter(sign => sign !== value));
    }
  };

  const handleIPVSignConfirmation = () => {
    setIpvSignsConfirmed(true);
    onConfirmSelection(selectedSigns);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-2xl border border-gray-200/50 ring-1 ring-white/30 rounded-2xl font-sans max-w-4xl" style={{ boxShadow: '0 4px 9px hsla(223.58deg, 50.96%, 59.22%, 0.65)' }}>
        <DialogTitle className="text-lg font-semibold text-gray-800 mb-3">IPV Signs & Symptoms Assessment</DialogTitle>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">IPV Screening Assessment</label>
            
            <div className="mt-2 p-3 border-l-4 border-purple-400 bg-white/60 backdrop-blur-md rounded-r-xl" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800 text-base">Select specific IPV signs and symptoms:</h4>
                {selectedSigns.length > 0 && (
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {selectedSigns.length} sign{selectedSigns.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              {/* Render IPV signs by category */}
              {Object.entries(ipvSignCategories).map(([key, category]) => (
                <div key={key} className="mb-2 p-2 rounded-lg bg-white/30 backdrop-blur-sm transition-all duration-200 hover:bg-white/40" style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.2)' }}>
                  <h5 className="text-xs font-semibold text-gray-800 mb-1.5 pb-0.5 border-b border-gray-200/50 flex items-center gap-2">
                    {category.icon}
                    {category.title}
                  </h5>
                  <div className="grid grid-cols-2 gap-1.5">
                    {category.signs.map((sign) => (
                      <IPVSignWithTooltip
                        key={sign}
                        id={`ipv_${sign.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`}
                        name={`ipv_sign_${sign.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`}
                        value={sign}
                        checked={selectedSigns.includes(sign)}
                        onChange={handleIPVSignsChange}
                        label={sign}
                        category={key}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Confirmation Button - Mirror danger signs exactly */}
              {selectedSigns.length > 0 && !ipvSignsConfirmed && (
                <div className="mt-3 flex justify-center">
                  <Button 
                    onClick={handleIPVSignConfirmation}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                  >
                    Confirm Selection ({selectedSigns.length} sign{selectedSigns.length > 1 ? 's' : ''})
                  </Button>
                </div>
              )}
              
              {/* Confirmation Status - Mirror danger signs exactly */}
              {ipvSignsConfirmed && selectedSigns.length > 0 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-800 font-medium">
                      IPV signs confirmed: {selectedSigns.join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            variant="outline" 
            className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            className="rounded-full bg-purple-500 hover:bg-purple-600 text-white border-none px-6"
            onClick={onClose}
            disabled={selectedSigns.length === 0}
          >
            Continue to Assessment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IPVSignsSelectionModal;