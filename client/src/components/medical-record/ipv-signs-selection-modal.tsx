import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContextCard } from "@/components/ui/context-card";
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
  description: string;
}

const IPVSignWithTooltip: React.FC<IPVSignWithTooltipProps> = ({
  id, name, value, checked, onChange, label, description
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Smart contextual display: show icon when selected OR hovered
  const showInfoIcon = checked || isHovered;
  
  return (
    <div 
      className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-gray-100/70" 
      style={{ boxShadow: '0 1px 3px hsla(223.58deg, 50.96%, 59.22%, 0.2)' }} 
      onMouseEnter={(e) => { 
        e.currentTarget.style.boxShadow = '0 3px 6px hsla(223.58deg, 50.96%, 59.22%, 0.35)';
        setIsHovered(true);
      }} 
      onMouseLeave={(e) => { 
        e.currentTarget.style.boxShadow = '0 1px 3px hsla(223.58deg, 50.96%, 59.22%, 0.2)';
        setIsHovered(false);
      }}
    >
      <input 
        type="checkbox" 
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-purple-600 w-3.5 h-3.5"
      />
      <label htmlFor={id} className="text-xs font-medium flex items-center space-x-1.5 flex-1 cursor-pointer font-sans">
        <span className="text-black">{label}</span>
        {showInfoIcon && (
          <ContextCard.Trigger
            content={
              <div className="text-xs text-left max-w-xs p-2">
                <div className="font-medium mb-1 text-black">{label}</div>
                <div className="text-black leading-relaxed font-normal">{description}</div>
              </div>
            }
            side="bottom"
          >
            <div 
              className="w-3 h-3 rounded-full border border-gray-400 bg-white/80 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-xs font-semibold transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5 hover:scale-110 animate-in fade-in-0 slide-in-from-right-1 cursor-help"
              style={{ boxShadow: '0 1px 2px hsla(223.58deg, 50.96%, 59.22%, 0.3)' }}
            >
              i
            </div>
          </ContextCard.Trigger>
        )}
      </label>
    </div>
  );
};

const IPVSignsSelectionModal: React.FC<IPVSignsSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirmSelection,
  initialSelectedSigns = []
}) => {
  const [selectedSigns, setSelectedSigns] = useState<string[]>(initialSelectedSigns);
  const [ipvSignsConfirmed, setIpvSignsConfirmed] = useState(false);

  // IPV Signs organized by category with descriptions for info tooltips
  const ipvSignCategories = {
    mentalHealth: {
      title: "Mental Health & Trauma",
      icon: <Brain className="w-4 h-4 text-blue-600" />,
      signs: [
        { 
          label: 'Ongoing stress/anxiety/depression', 
          description: 'Persistent emotional distress that may indicate exposure to violence or trauma' 
        },
        { 
          label: 'Thoughts or plans of self-harm', 
          description: 'Suicidal ideation or self-destructive behaviors often linked to intimate partner violence' 
        },
        { 
          label: 'Substance misuse (alcohol/drugs)', 
          description: 'Using substances to cope with violence or as a result of partner coercion' 
        },
        { 
          label: 'Signs of trauma or PTSD', 
          description: 'Post-traumatic stress symptoms including flashbacks, nightmares, or hypervigilance' 
        }
      ]
    },
    reproductive: {
      title: "Reproductive Health",
      icon: <Heart className="w-4 h-4 text-pink-600" />,
      signs: [
        { 
          label: 'Repeated STIs or unwanted pregnancies', 
          description: 'Pattern of reproductive coercion or sexual violence by intimate partner' 
        },
        { 
          label: 'Unexplained reproductive symptoms', 
          description: 'Genital injuries or symptoms that may result from sexual violence' 
        },
        { 
          label: 'Repeated vaginal bleeding', 
          description: 'Abnormal bleeding that may indicate sexual trauma or reproductive coercion' 
        }
      ]
    },
    physical: {
      title: "Physical Symptoms & Violence",
      icon: <Shield className="w-4 h-4 text-green-600" />,
      signs: [
        { 
          label: 'Unexplained chronic pain', 
          description: 'Persistent pain without clear medical cause, often from repeated physical violence' 
        },
        { 
          label: 'Injury to abdomen or other areas', 
          description: 'Physical injuries that may indicate domestic violence, especially during pregnancy' 
        },
        { 
          label: 'Chronic gastrointestinal/genitourinary symptoms', 
          description: 'Ongoing digestive or urinary problems that may result from stress or physical trauma' 
        },
        { 
          label: 'Evidence of physical violence/trauma', 
          description: 'Visible signs of physical abuse including bruises, cuts, or defensive injuries' 
        }
      ]
    },
    behavioral: {
      title: "Healthcare & Behavioral Patterns",
      icon: <Users className="w-4 h-4 text-indigo-600" />,
      signs: [
        { 
          label: 'Partner intrusive during consultations', 
          description: 'Partner refuses to leave during appointments or answers questions for the woman' 
        },
        { 
          label: 'Often misses appointments', 
          description: 'Pattern of missed healthcare visits that may indicate partner control or fear' 
        },
        { 
          label: 'Children have behavioral problems', 
          description: 'Children showing signs of distress from witnessing intimate partner violence' 
        },
        { 
          label: 'Repeated consultations, no clear diagnosis', 
          description: 'Frequent healthcare visits with vague complaints that may indicate underlying violence' 
        },
        { 
          label: 'Fear or anxiety around partner/family', 
          description: 'Visible signs of fear when partner or family members are present or mentioned' 
        }
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
      <DialogContent className="bg-white/95 backdrop-blur-2xl border border-gray-200/50 ring-1 ring-white/30 rounded-2xl font-sans max-w-5xl max-h-[85vh] tooltip-parent" style={{ boxShadow: '0 4px 9px hsla(223.58deg, 50.96%, 59.22%, 0.65)', overflow: 'visible' }}>
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
                          key={sign.label}
                          id={`ipv_${sign.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`}
                          name={`ipv_sign_${sign.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`}
                          value={sign.label}
                          checked={selectedSigns.includes(sign.label)}
                          onChange={handleIPVSignsChange}
                          label={sign.label}
                          description={sign.description}
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