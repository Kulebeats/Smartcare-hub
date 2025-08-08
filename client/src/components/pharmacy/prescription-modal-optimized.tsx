import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Import optimized sub-components
import PatientSearchSection from './patient-search-section';
import MedicationSearchSection from './medication-search-section';
import PrescriptionCartSection from './prescription-cart-section';

interface Patient {
  id: number;
  firstName: string;
  surname: string;
  nrc: string;
  dateOfBirth: string;
  sex: 'Male' | 'Female';
  cellphone?: string;
}

interface Medication {
  id: number;
  name: string;
  genericName?: string;
  dosageForm: string;
  strength: string;
  category: string;
  stockLevel: number;
  unitCost: number;
}

interface PrescriptionItem {
  medicationId: number;
  medication?: Medication;
  quantity: number;
  dosage: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionFormData {
  patientId: number;
  diagnosis: string;
  priority: 'routine' | 'urgent' | 'emergency';
  instructions: string;
  validUntil: string;
  items: PrescriptionItem[];
}

interface PrescriptionModalOptimizedProps {
  onSaveComplete?: () => void;
  onClose?: () => void;
}

export default function PrescriptionModalOptimized({ onSaveComplete, onClose }: PrescriptionModalOptimizedProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patientId: 0,
    diagnosis: '',
    priority: 'routine',
    instructions: '',
    validUntil: '',
    items: []
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Memoized handlers to prevent unnecessary re-renders
  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.id }));
  }, []);

  const handleAddMedication = useCallback((medication: Medication) => {
    const newItem: PrescriptionItem = {
      medicationId: medication.id,
      medication,
      quantity: 1,
      dosage: '',
      duration: '',
      instructions: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, []);

  const handleUpdateItem = useCallback((index: number, field: keyof PrescriptionItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSaveComplete = useCallback(() => {
    if (onSaveComplete) {
      onSaveComplete();
    }
  }, [onSaveComplete]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: (data: PrescriptionFormData) => apiRequest('/api/pharmacy/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      // Reset form
      setFormData({
        patientId: 0,
        diagnosis: '',
        priority: 'routine',
        instructions: '',
        validUntil: '',
        items: []
      });
      setSelectedPatient(null);
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/prescriptions'] });
      handleSaveComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || formData.items.length === 0) return;
    
    createPrescriptionMutation.mutate(formData);
  }, [selectedPatient, formData, createPrescriptionMutation]);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    return selectedPatient && formData.items.length > 0 && formData.diagnosis.trim() !== '';
  }, [selectedPatient, formData.items.length, formData.diagnosis]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Create Prescription</CardTitle>
              <CardDescription>Create a new prescription for a patient</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Search Section */}
              <PatientSearchSection
                selectedPatient={selectedPatient}
                onPatientSelect={handlePatientSelect}
              />

              {/* Prescription Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Enter diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'routine' | 'urgent' | 'emergency') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="valid-until">Valid Until</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>

              {/* Medication Search Section */}
              <MedicationSearchSection onMedicationAdd={handleAddMedication} />

              {/* Prescription Cart */}
              <PrescriptionCartSection
                items={formData.items}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
              />

              {/* General Instructions */}
              <div>
                <Label htmlFor="instructions">General Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Additional instructions for the patient"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPrescriptionMutation.isPending || !isFormValid}
                >
                  {createPrescriptionMutation.isPending ? 'Creating...' : 'Create Prescription'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}