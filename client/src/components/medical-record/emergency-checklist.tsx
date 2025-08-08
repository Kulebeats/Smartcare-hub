import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Clock, Phone } from "lucide-react";

interface EmergencyChecklistProps {
  selectedReasons: string[];
  onProgressUpdate: (progress: number) => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  category: string;
  requiredFor: string[];
}

const checklistItems: ChecklistItem[] = [
  // Communication & Coordination
  { 
    id: 'call_receiving_facility', 
    label: 'Call receiving facility to inform of incoming patient', 
    required: true, 
    category: 'communication',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia']
  },
  { 
    id: 'confirm_bed_availability', 
    label: 'Confirm bed availability and specialist on duty', 
    required: true, 
    category: 'communication',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp']
  },
  { 
    id: 'arrange_transport', 
    label: 'Arrange appropriate transport (ambulance if critical)', 
    required: true, 
    category: 'communication',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'prolonged_labor', 'fetal_distress']
  },
  { 
    id: 'notify_supervisor', 
    label: 'Notify supervisor/senior staff of emergency referral', 
    required: true, 
    category: 'communication',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp']
  },

  // Pre-Referral Procedures
  { 
    id: 'establish_iv_access', 
    label: 'Establish IV access (large bore cannula)', 
    required: true, 
    category: 'procedures',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia']
  },
  { 
    id: 'insert_catheter', 
    label: 'Insert urinary catheter and monitor output', 
    required: true, 
    category: 'procedures',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp']
  },
  { 
    id: 'oxygen_therapy', 
    label: 'Administer oxygen therapy if available', 
    required: true, 
    category: 'procedures',
    requiredFor: ['convulsions', 'unconscious', 'severe_anemia']
  },
  { 
    id: 'position_patient', 
    label: 'Position patient appropriately (left lateral for pregnancy)', 
    required: true, 
    category: 'procedures',
    requiredFor: ['convulsions', 'unconscious', 'prolonged_labor']
  },

  // IV Fluids & Medications
  { 
    id: 'start_iv_fluids', 
    label: 'Start IV fluids (Normal Saline or Ringers Lactate)', 
    required: true, 
    category: 'medications',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia']
  },
  { 
    id: 'give_magnesium_sulfate', 
    label: 'Give Magnesium Sulfate (for severe pre-eclampsia/eclampsia)', 
    required: true, 
    category: 'medications',
    requiredFor: ['convulsions', 'severe_headache_bp']
  },
  { 
    id: 'administer_antihypertensives', 
    label: 'Administer antihypertensives if BP >160/110 mmHg', 
    required: true, 
    category: 'medications',
    requiredFor: ['severe_headache_bp']
  },
  { 
    id: 'give_antibiotics', 
    label: 'Give antibiotics if infection suspected', 
    required: true, 
    category: 'medications',
    requiredFor: ['high_fever', 'looks_very_ill']
  },

  // Vital Signs Monitoring
  { 
    id: 'monitor_bp', 
    label: 'Monitor blood pressure every 15 minutes', 
    required: true, 
    category: 'vitals',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia', 'prolonged_labor', 'fetal_distress', 'grand_multiparity']
  },
  { 
    id: 'monitor_pulse', 
    label: 'Monitor pulse and respiratory rate', 
    required: true, 
    category: 'vitals',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia']
  },
  { 
    id: 'monitor_temperature', 
    label: 'Monitor temperature', 
    required: true, 
    category: 'vitals',
    requiredFor: ['high_fever', 'looks_very_ill']
  },
  { 
    id: 'monitor_urine_output', 
    label: 'Monitor urine output (aim for >30ml/hour)', 
    required: true, 
    category: 'vitals',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp']
  },

  // Special Procedures
  { 
    id: 'clotting_test', 
    label: 'Perform bedside clotting test', 
    required: true, 
    category: 'special',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp']
  },
  { 
    id: 'fetal_heart_monitoring', 
    label: 'Continuous fetal heart rate monitoring', 
    required: true, 
    category: 'special',
    requiredFor: ['prolonged_labor', 'fetal_distress']
  },

  // Final Steps
  { 
    id: 'complete_referral_letter', 
    label: 'Complete detailed referral letter', 
    required: true, 
    category: 'final',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia', 'prolonged_labor', 'fetal_distress', 'grand_multiparity', 'other']
  },
  { 
    id: 'accompany_patient', 
    label: 'Arrange for skilled attendant to accompany patient', 
    required: true, 
    category: 'final',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'prolonged_labor', 'fetal_distress']
  },
  { 
    id: 'handover_notes', 
    label: 'Prepare handover notes and patient records', 
    required: true, 
    category: 'final',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia', 'prolonged_labor', 'fetal_distress', 'grand_multiparity', 'other']
  },
  { 
    id: 'document_time', 
    label: 'Document all times (decision, treatment, departure)', 
    required: true, 
    category: 'final',
    requiredFor: ['convulsions', 'severe_bleeding', 'unconscious', 'severe_headache_bp', 'high_fever', 'severe_anemia', 'prolonged_labor', 'fetal_distress', 'grand_multiparity', 'other']
  }
];

const categoryInfo = {
  communication: {
    title: 'Communication & Coordination',
    icon: Phone,
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  procedures: {
    title: 'Pre-Referral Procedures',
    icon: AlertTriangle,
    color: 'text-orange-600 bg-orange-50 border-orange-200'
  },
  medications: {
    title: 'IV Fluids & Medications',
    icon: Clock,
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  vitals: {
    title: 'Vital Signs Monitoring',
    icon: CheckCircle,
    color: 'text-red-600 bg-red-50 border-red-200'
  },
  special: {
    title: 'Special Procedures',
    icon: AlertTriangle,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
  },
  final: {
    title: 'Final Steps',
    icon: CheckCircle,
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  }
};

export default function EmergencyChecklist({
  selectedReasons,
  onProgressUpdate
}: EmergencyChecklistProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Get relevant checklist items based on selected reasons
  const getRelevantItems = () => {
    if (selectedReasons.length === 0) {
      return checklistItems.filter(item => item.requiredFor.includes('other'));
    }
    
    return checklistItems.filter(item => 
      item.requiredFor.some(reason => selectedReasons.includes(reason))
    );
  };

  const relevantItems = getRelevantItems();
  
  // Group items by category
  const itemsByCategory = relevantItems.reduce((acc: Record<string, ChecklistItem[]>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Calculate progress
  useEffect(() => {
    const totalItems = relevantItems.length;
    const completedCount = relevantItems.filter(item => completedItems.has(item.id)).length;
    const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    onProgressUpdate(progress);
  }, [completedItems, relevantItems, onProgressUpdate]);

  const handleItemToggle = (itemId: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const totalItems = relevantItems.length;
  const completedCount = relevantItems.filter(item => completedItems.has(item.id)).length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-600">Emergency Checklist Progress</h3>
            <span className="text-sm font-medium text-gray-600">
              {completedCount}/{totalItems} completed ({progress}%)
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-600' : 
                progress >= 75 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {selectedReasons.length === 0 && (
            <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded text-sm">
              <strong>No emergency conditions selected:</strong> Showing basic checklist items for routine referrals.
            </div>
          )}
          
          {selectedReasons.length > 0 && (
            <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded text-sm">
              <strong>Based on selected emergency conditions:</strong> Required checklist items have been customized for this referral.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Items by Category */}
      {Object.entries(itemsByCategory).map(([category, items]) => {
        const categoryConfig = categoryInfo[category];
        const CategoryIcon = categoryConfig.icon;
        const categoryCompleted = items.filter(item => completedItems.has(item.id)).length;
        const categoryTotal = items.length;
        
        return (
          <Card key={category} className={`border-2 ${categoryConfig.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CategoryIcon className="h-5 w-5" />
                  <h4 className="font-medium">{categoryConfig.title}</h4>
                </div>
                <span className="text-sm font-medium">
                  {categoryCompleted}/{categoryTotal} completed
                </span>
              </div>
              
              <div className="space-y-3">
                {items.map(item => (
                  <label 
                    key={item.id}
                    className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={completedItems.has(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <span className={`text-sm ${completedItems.has(item.id) ? 'line-through text-gray-500' : ''}`}>
                        {item.label}
                      </span>
                      {item.required && (
                        <span className="ml-2 text-xs text-red-600 font-medium">*REQUIRED*</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {totalItems === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No checklist items required for the selected referral type.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}