import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Predefined drug data for interventions
export interface InterventionDrug {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  category: string;
  itemPerDose: string;
  timePerUnit: string;
  frequencyUnit: string;
  durationUnit: string;
  instructions?: string;
}

const INTERVENTION_DRUGS: Record<string, InterventionDrug> = {
  iron_30mg: {
    id: 'iron_30mg',
    name: 'Iron 30mg',
    dosage: '30mg',
    frequency: '1',
    route: 'per_oral',
    category: 'Nutrition Supplementation',
    itemPerDose: '1',
    timePerUnit: 'day',
    frequencyUnit: 'od',
    durationUnit: 'months',
    instructions: 'Take with food to reduce stomach upset'
  },
  folic_acid_400mcg: {
    id: 'folic_acid_400mcg',
    name: 'Folic Acid 400µg (0.4mg)',
    dosage: '400mcg',
    frequency: '1',
    route: 'per_oral',
    category: 'Nutrition Supplementation',
    itemPerDose: '1',
    timePerUnit: 'day',
    frequencyUnit: 'od',
    durationUnit: 'months',
    instructions: 'Take daily during pregnancy'
  },
  calcium_1000mg: {
    id: 'calcium_1000mg',
    name: 'Calcium 1000mg',
    dosage: '1000mg',
    frequency: '1',
    route: 'per_oral',
    category: 'Nutrition Supplementation',
    itemPerDose: '1',
    timePerUnit: 'day',
    frequencyUnit: 'od',
    durationUnit: 'months',
    instructions: 'Take with meals for better absorption'
  },
  mebendazole_500mg: {
    id: 'mebendazole_500mg',
    name: 'Mebendazole 500mg',
    dosage: '500mg',
    frequency: '1',
    route: 'per_oral',
    category: 'Preventive Therapy',
    itemPerDose: '1',
    timePerUnit: 'day',
    frequencyUnit: 'stat',
    durationUnit: 'days',
    instructions: 'Single dose deworming treatment'
  },
  tetanus_toxoid: {
    id: 'tetanus_toxoid',
    name: 'Tetanus Toxoid (TTCV)',
    dosage: '0.5ml',
    frequency: '1',
    route: 'intramuscular',
    category: 'Immunization',
    itemPerDose: '1',
    timePerUnit: 'day',
    frequencyUnit: 'stat',
    durationUnit: 'days',
    instructions: 'Intramuscular injection in deltoid muscle'
  },
  iptp_sp: {
    id: 'iptp_sp',
    name: 'IPTp-SP (Sulfadoxine-Pyrimethamine)',
    dosage: '1500mg + 75mg',
    frequency: '1',
    route: 'per_oral',
    category: 'Preventive Therapy',
    itemPerDose: '3',
    timePerUnit: 'day',
    frequencyUnit: 'stat',
    durationUnit: 'days',
    instructions: 'Take as single dose with food, ensure adequate fluid intake'
  }
};

interface InterventionsTreatmentsData {
  // Nutrition Supplementation
  iron_given?: 'yes' | 'no';
  iron_reason?: 'out_of_stock' | 'expired' | 'other_specify';
  iron_specify?: string;
  folic_acid_given?: 'yes' | 'no';
  folic_acid_reason?: 'out_of_stock' | 'expired' | 'other_specify';
  folic_acid_specify?: string;
  calcium_given?: 'yes' | 'no';
  calcium_reason?: 'out_of_stock' | 'expired' | 'other_specify';
  calcium_specify?: string;
  
  // Preventive Therapy
  deworming_mebendazole?: 'yes' | 'no';
  deworming_reason?: 'out_of_stock' | 'expired' | 'other_specify';
  deworming_specify?: string;
  
  // Malaria Prophylaxis IPT
  iptp_sp_dose1_provided?: 'yes' | 'no';
  iptp_sp_dose1_date?: string;
  iptp_sp_dose2_provided?: 'yes' | 'no';
  iptp_sp_dose2_date?: string;
  iptp_sp_dose3_provided?: 'yes' | 'no';
  iptp_sp_dose3_date?: string;
  iptp_sp_reason?: 'referred' | 'stock_out' | 'expired' | 'other_specify';
  iptp_sp_specify?: string;
  
  // Immunization
  ttcv_immunisation?: 'done_today' | 'done_earlier' | 'not_done';
  ttcv_dose_number?: '1' | '2' | '3' | '4';
  ttcv_date_given?: string;
  ttcv_reason?: string[];
  ttcv_specify?: string;
}

interface InterventionsTreatmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InterventionsTreatmentsData) => void;
  existingData?: InterventionsTreatmentsData;
  onTriggerPrescription?: (drug: InterventionDrug) => void;
}

export default function InterventionsTreatmentsModal({
  isOpen,
  onClose,
  onSave,
  existingData,
  onTriggerPrescription
}: InterventionsTreatmentsModalProps) {
  const [formData, setFormData] = useState<InterventionsTreatmentsData>(existingData || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDrugSelection = (field: string, value: 'yes' | 'no', drugId: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Trigger prescription modal if "Yes" is selected and callback is provided
    if (value === 'yes' && onTriggerPrescription && INTERVENTION_DRUGS[drugId]) {
      onTriggerPrescription(INTERVENTION_DRUGS[drugId]);
    }
  };

  const handleTTCVSelection = (field: string, value: 'done_today' | 'done_earlier' | 'not_done', drugId: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Trigger prescription modal if "Done today" is selected and callback is provided
    if (value === 'done_today' && onTriggerPrescription && INTERVENTION_DRUGS[drugId]) {
      onTriggerPrescription(INTERVENTION_DRUGS[drugId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Preventive and Promotive Intervention
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nutrition">Nutrition Supplementation</TabsTrigger>
            <TabsTrigger value="preventive">Preventive Therapy</TabsTrigger>
            <TabsTrigger value="immunization">Immunization</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="mt-6">
            {/* Nutrition Supplementation Tab */}
            <TabsContent value="nutrition" className="space-y-6">
              <div className="space-y-6">
                {/* Iron 30mg */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Iron 30mg Supplementation</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iron_yes" 
                          name="iron_given" 
                          value="yes" 
                          checked={formData.iron_given === 'yes'}
                          onChange={(e) => handleDrugSelection('iron_given', e.target.value as 'yes' | 'no', 'iron_30mg')}
                          className="text-green-600" 
                        />
                        <label htmlFor="iron_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iron_no" 
                          name="iron_given" 
                          value="no" 
                          checked={formData.iron_given === 'no'}
                          onChange={(e) => handleDrugSelection('iron_given', e.target.value as 'yes' | 'no', 'iron_30mg')}
                          className="text-green-600" 
                        />
                        <label htmlFor="iron_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {formData.iron_given === 'no' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Reason (if No)</label>
                        <select 
                          value={formData.iron_reason || ''} 
                          onChange={(e) => setFormData(prev => ({ ...prev, iron_reason: e.target.value as 'out_of_stock' | 'expired' | 'other_specify' }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select reason</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="expired">Expired</option>
                          <option value="other_specify">Other (specify)</option>
                        </select>
                      </div>
                    )}
                    
                    {formData.iron_given === 'no' && formData.iron_reason === 'other_specify' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Specify (if other)</label>
                        <input 
                          type="text" 
                          value={formData.iron_specify || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, iron_specify: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                          placeholder="Specify reason..." 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Folic Acid 400µg (0.4mg) */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-800 mb-3">Folic Acid 400µg (0.4mg) Supplementation</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="folic_acid_yes" 
                          name="folic_acid_given" 
                          value="yes" 
                          checked={formData.folic_acid_given === 'yes'}
                          onChange={(e) => handleDrugSelection('folic_acid_given', e.target.value as 'yes' | 'no', 'folic_acid_400mcg')}
                          className="text-emerald-600" 
                        />
                        <label htmlFor="folic_acid_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="folic_acid_no" 
                          name="folic_acid_given" 
                          value="no" 
                          checked={formData.folic_acid_given === 'no'}
                          onChange={(e) => handleDrugSelection('folic_acid_given', e.target.value as 'yes' | 'no', 'folic_acid_400mcg')}
                          className="text-emerald-600" 
                        />
                        <label htmlFor="folic_acid_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {formData.folic_acid_given === 'no' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Reason (if No)</label>
                        <select 
                          value={formData.folic_acid_reason || ''} 
                          onChange={(e) => setFormData(prev => ({ ...prev, folic_acid_reason: e.target.value as 'out_of_stock' | 'expired' | 'other_specify' }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select reason</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="expired">Expired</option>
                          <option value="other_specify">Other (specify)</option>
                        </select>
                      </div>
                    )}
                    
                    {formData.folic_acid_given === 'no' && formData.folic_acid_reason === 'other_specify' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Specify (if other)</label>
                        <input 
                          type="text" 
                          value={formData.folic_acid_specify || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, folic_acid_specify: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                          placeholder="Specify reason..." 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Calcium 1.5-2.0g */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Calcium 1.5-2.0g Oral Elemental Calcium Supplementation</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="calcium_yes" 
                          name="calcium_given" 
                          value="yes" 
                          checked={formData.calcium_given === 'yes'}
                          onChange={(e) => handleDrugSelection('calcium_given', e.target.value as 'yes' | 'no', 'calcium_1000mg')}
                          className="text-blue-600" 
                        />
                        <label htmlFor="calcium_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="calcium_no" 
                          name="calcium_given" 
                          value="no" 
                          checked={formData.calcium_given === 'no'}
                          onChange={(e) => handleDrugSelection('calcium_given', e.target.value as 'yes' | 'no', 'calcium_1000mg')}
                          className="text-blue-600" 
                        />
                        <label htmlFor="calcium_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {formData.calcium_given === 'no' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Reason (if No)</label>
                        <select 
                          value={formData.calcium_reason || ''} 
                          onChange={(e) => setFormData(prev => ({ ...prev, calcium_reason: e.target.value as 'out_of_stock' | 'expired' | 'other_specify' }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select reason</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="expired">Expired</option>
                          <option value="other_specify">Other (specify)</option>
                        </select>
                      </div>
                    )}
                    
                    {formData.calcium_given === 'no' && formData.calcium_reason === 'other_specify' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Specify (if other)</label>
                        <input 
                          type="text" 
                          value={formData.calcium_specify || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, calcium_specify: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                          placeholder="Specify reason..." 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Preventive Therapy Tab */}
            <TabsContent value="preventive" className="space-y-6">
              <div className="space-y-6">

                {/* Deworming */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-3">Deworming (Mebendazole 500mg PO stat)</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="deworming_yes" 
                          name="deworming_mebendazole" 
                          value="yes" 
                          checked={formData.deworming_mebendazole === 'yes'}
                          onChange={(e) => handleDrugSelection('deworming_mebendazole', e.target.value as 'yes' | 'no', 'mebendazole_500mg')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="deworming_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="deworming_no" 
                          name="deworming_mebendazole" 
                          value="no" 
                          checked={formData.deworming_mebendazole === 'no'}
                          onChange={(e) => handleDrugSelection('deworming_mebendazole', e.target.value as 'yes' | 'no', 'mebendazole_500mg')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="deworming_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {formData.deworming_mebendazole === 'no' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Reason (if No)</label>
                        <select 
                          value={formData.deworming_reason || ''} 
                          onChange={(e) => setFormData(prev => ({ ...prev, deworming_reason: e.target.value as 'out_of_stock' | 'expired' | 'other_specify' }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select reason</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="expired">Expired</option>
                          <option value="other_specify">Other (specify)</option>
                        </select>
                      </div>
                    )}
                    
                    {formData.deworming_mebendazole === 'no' && formData.deworming_reason === 'other_specify' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Specify (if other)</label>
                        <input 
                          type="text" 
                          value={formData.deworming_specify || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, deworming_specify: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                          placeholder="Specify reason..." 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Malaria Prophylaxis IPT Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-purple-900">Malaria Prophylaxis IPT</h3>
                  <p className="text-sm text-purple-700">Intermittent Preventive Treatment in pregnancy (IPTp-SP)</p>
                  
                  {/* IPTp-SP Dose 1 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-purple-800">IPTp-SP Dose 1</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iptp_dose1_yes" 
                          name="iptp_sp_dose1_provided" 
                          value="yes" 
                          checked={formData.iptp_sp_dose1_provided === 'yes'}
                          onChange={(e) => handleDrugSelection('iptp_sp_dose1_provided', e.target.value as 'yes' | 'no', 'iptp_sp')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="iptp_dose1_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iptp_dose1_no" 
                          name="iptp_sp_dose1_provided" 
                          value="no" 
                          checked={formData.iptp_sp_dose1_provided === 'no'}
                          onChange={(e) => handleDrugSelection('iptp_sp_dose1_provided', e.target.value as 'yes' | 'no', 'iptp_sp')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="iptp_dose1_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {formData.iptp_sp_dose1_provided === 'yes' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Date given</label>
                        <input 
                          type="date" 
                          value={formData.iptp_sp_dose1_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, iptp_sp_dose1_date: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        />
                      </div>
                    )}
                  </div>

                  {/* IPTp-SP Dose 2 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-purple-800">IPTp-SP Dose 2</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iptp_dose2_yes" 
                          name="iptp_sp_dose2_provided" 
                          value="yes" 
                          checked={formData.iptp_sp_dose2_provided === 'yes'}
                          onChange={(e) => handleDrugSelection('iptp_sp_dose2_provided', e.target.value as 'yes' | 'no', 'iptp_sp')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="iptp_dose2_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iptp_dose2_no" 
                          name="iptp_sp_dose2_provided" 
                          value="no" 
                          checked={formData.iptp_sp_dose2_provided === 'no'}
                          onChange={(e) => handleDrugSelection('iptp_sp_dose2_provided', e.target.value as 'yes' | 'no', 'iptp_sp')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="iptp_dose2_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {formData.iptp_sp_dose2_provided === 'yes' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Date given</label>
                        <input 
                          type="date" 
                          value={formData.iptp_sp_dose2_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, iptp_sp_dose2_date: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        />
                      </div>
                    )}
                  </div>

                  {/* IPTp-SP Dose 3 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-purple-800">IPTp-SP Dose 3</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iptp_dose3_yes" 
                          name="iptp_sp_dose3_provided" 
                          value="yes" 
                          checked={formData.iptp_sp_dose3_provided === 'yes'}
                          onChange={(e) => handleDrugSelection('iptp_sp_dose3_provided', e.target.value as 'yes' | 'no', 'iptp_sp')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="iptp_dose3_yes" className="text-sm">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="iptp_dose3_no" 
                          name="iptp_sp_dose3_provided" 
                          value="no" 
                          checked={formData.iptp_sp_dose3_provided === 'no'}
                          onChange={(e) => handleDrugSelection('iptp_sp_dose3_provided', e.target.value as 'yes' | 'no', 'iptp_sp')}
                          className="text-purple-600" 
                        />
                        <label htmlFor="iptp_dose3_no" className="text-sm">No</label>
                      </div>
                    </div>
                    
                    {formData.iptp_sp_dose3_provided === 'yes' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Date given</label>
                        <input 
                          type="date" 
                          value={formData.iptp_sp_dose3_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, iptp_sp_dose3_date: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Reason if any dose not provided */}
                  {(formData.iptp_sp_dose1_provided === 'no' || formData.iptp_sp_dose2_provided === 'no' || formData.iptp_sp_dose3_provided === 'no') && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Reason malaria prophylaxis not provided</label>
                      <select 
                        value={formData.iptp_sp_reason || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, iptp_sp_reason: e.target.value as 'referred' | 'stock_out' | 'expired' | 'other_specify' }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select reason</option>
                        <option value="referred">Client was referred</option>
                        <option value="stock_out">Stock-out</option>
                        <option value="expired">Expired</option>
                        <option value="other_specify">Other reason (specify)</option>
                      </select>
                    </div>
                  )}
                  
                  {(formData.iptp_sp_dose1_provided === 'no' || formData.iptp_sp_dose2_provided === 'no' || formData.iptp_sp_dose3_provided === 'no') && formData.iptp_sp_reason === 'other_specify' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Specify other reason</label>
                      <input 
                        type="text" 
                        value={formData.iptp_sp_specify || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, iptp_sp_specify: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        placeholder="Specify other reason..." 
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Immunization Tab */}
            <TabsContent value="immunization" className="space-y-6">
              <div className="space-y-6">
                {/* TTCV Immunisation */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-800 mb-3">TTCV (Tetanus Toxoid) Immunisation</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="ttcv_done_today" 
                          name="ttcv_immunisation" 
                          value="done_today" 
                          checked={formData.ttcv_immunisation === 'done_today'}
                          onChange={(e) => handleTTCVSelection('ttcv_immunisation', e.target.value as 'done_today' | 'done_earlier' | 'not_done', 'tetanus_toxoid')}
                          className="text-indigo-600" 
                        />
                        <label htmlFor="ttcv_done_today" className="text-sm">Done today</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="ttcv_done_earlier" 
                          name="ttcv_immunisation" 
                          value="done_earlier" 
                          checked={formData.ttcv_immunisation === 'done_earlier'}
                          onChange={(e) => handleTTCVSelection('ttcv_immunisation', e.target.value as 'done_today' | 'done_earlier' | 'not_done', 'tetanus_toxoid')}
                          className="text-indigo-600" 
                        />
                        <label htmlFor="ttcv_done_earlier" className="text-sm">Done earlier</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="ttcv_not_done" 
                          name="ttcv_immunisation" 
                          value="not_done" 
                          checked={formData.ttcv_immunisation === 'not_done'}
                          onChange={(e) => handleTTCVSelection('ttcv_immunisation', e.target.value as 'done_today' | 'done_earlier' | 'not_done', 'tetanus_toxoid')}
                          className="text-indigo-600" 
                        />
                        <label htmlFor="ttcv_not_done" className="text-sm">Not done</label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">TTCV Dose No. (if done today or earlier)</label>
                      <select 
                        value={formData.ttcv_dose_number || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, ttcv_dose_number: e.target.value as '1' | '2' | '3' | '4' }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        disabled={formData.ttcv_immunisation === 'not_done'}
                      >
                        <option value="">Select dose number</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Date TTCV was given (if done earlier)</label>
                      <input 
                        type="date" 
                        value={formData.ttcv_date_given || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ttcv_date_given: e.target.value }))}
                        disabled={formData.ttcv_immunisation !== 'done_earlier'}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Reason (if not done)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_stock_out" 
                            checked={formData.ttcv_reason?.includes('stock_out') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'stock_out'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'stock_out') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_stock_out" className="text-sm">Stock out</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_expired" 
                            checked={formData.ttcv_reason?.includes('expired') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'expired'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'expired') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_expired" className="text-sm">Expired</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_woman_ill" 
                            checked={formData.ttcv_reason?.includes('woman_ill') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'woman_ill'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'woman_ill') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_woman_ill" className="text-sm">Woman is ill</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_woman_refused" 
                            checked={formData.ttcv_reason?.includes('woman_refused') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'woman_refused'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'woman_refused') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_woman_refused" className="text-sm">Woman refused</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_allergies" 
                            checked={formData.ttcv_reason?.includes('allergies') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'allergies'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'allergies') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_allergies" className="text-sm">Allergies</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="ttcv_other" 
                            checked={formData.ttcv_reason?.includes('other_specify') || false}
                            onChange={(e) => {
                              const currentReasons = formData.ttcv_reason || [];
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ttcv_reason: [...currentReasons, 'other_specify'] }));
                              } else {
                                setFormData(prev => ({ ...prev, ttcv_reason: currentReasons.filter(r => r !== 'other_specify') }));
                              }
                            }}
                            disabled={formData.ttcv_immunisation !== 'not_done'}
                            className="rounded border-gray-300 text-indigo-600" 
                          />
                          <label htmlFor="ttcv_other" className="text-sm">Other (specify)</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Specify (if other)</label>
                      <input 
                        type="text" 
                        value={formData.ttcv_specify || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ttcv_specify: e.target.value }))}
                        disabled={!formData.ttcv_reason?.includes('other_specify')}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        placeholder="Specify reason..." 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-2 text-sm"
              >
                Save Interventions & Treatments
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export type { InterventionsTreatmentsData };