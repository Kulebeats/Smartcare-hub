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
  <div className="flex items-start space-x-2 p-1 hover:bg-white/50 rounded text-xs">
    <input
      type="checkbox"
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="rounded border-gray-300 text-purple-600 mt-0.5 flex-shrink-0"
    />
    <label htmlFor={id} className="text-black cursor-pointer text-xs leading-tight flex-1">
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

  // IPV Signs organized by category - streamlined for better UI
  const ipvSignCategories = {
    mentalHealth: {
      title: "Mental Health & Trauma",
      icon: <Brain className="w-4 h-4 text-blue-600" />,
      signs: [
        'Ongoing stress/anxiety/depression',
        'Thoughts or plans of self-harm',
        'Substance misuse (alcohol/drugs)',
        'Signs of trauma or PTSD'
      ]
    },
    reproductive: {
      title: "Reproductive Health",
      icon: <Heart className="w-4 h-4 text-pink-600" />,
      signs: [
        'Repeated STIs or unwanted pregnancies',
        'Unexplained reproductive symptoms',
        'Repeated vaginal bleeding'
      ]
    },
    physical: {
      title: "Physical Symptoms & Violence",
      icon: <Shield className="w-4 h-4 text-green-600" />,
      signs: [
        'Unexplained chronic pain',
        'Injury to abdomen or other areas',
        'Chronic gastrointestinal/genitourinary symptoms',
        'Evidence of physical violence/trauma'
      ]
    },
    behavioral: {
      title: "Healthcare & Behavioral Patterns",
      icon: <Users className="w-4 h-4 text-indigo-600" />,
      signs: [
        'Partner intrusive during consultations',
        'Often misses appointments',
        'Children have behavioral problems',
        'Repeated consultations, no clear diagnosis',
        'Fear or anxiety around partner/family'
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
      <DialogContent className="bg-white/95 backdrop-blur-2xl border border-gray-200/50 ring-1 ring-white/30 rounded-2xl font-sans max-w-5xl max-h-[85vh] overflow-y-auto" style={{ boxShadow: '0 4px 9px hsla(223.58deg, 50.96%, 59.22%, 0.65)' }}>
        <DialogTitle className="text-lg font-semibold text-black mb-3">IPV Signs & Symptoms Assessment</DialogTitle>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">IPV Screening Assessment</label>
            
            <div className="mt-2 p-3 border-l-4 border-purple-400 bg-white/60 backdrop-blur-md rounded-r-xl" style={{ boxShadow: '0 2px 6px hsla(223.58deg, 50.96%, 59.22%, 0.45)' }}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-black text-base">Select specific IPV signs and symptoms:</h4>
                {selectedSigns.length > 0 && (
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {selectedSigns.length} sign{selectedSigns.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              {/* Render IPV signs by category - compact grid layout */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ipvSignCategories).map(([key, category]) => (
                  <div key={key} className="p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-gray-200/30">
                    <h5 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </h5>
                    <div className="space-y-1.5">
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
              </div>
              
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