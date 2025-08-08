import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  User, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pill,
  Edit,
  Eye,
  Printer
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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

interface PharmacyPrescriptionProps {
  onSaveComplete?: () => void;
  onClose?: () => void;
}

export default function PharmacyPrescription({ onSaveComplete, onClose }: PharmacyPrescriptionProps = {} as PharmacyPrescriptionProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicationSearch, setMedicationSearch] = useState('');
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

  // Search patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/patients', searchTerm],
    enabled: searchTerm.length > 2
  });

  // Search medications
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ['/api/pharmacy/medications', medicationSearch],
    enabled: medicationSearch.length > 2
  });

  // Fetch recent prescriptions
  const { data: recentPrescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['/api/pharmacy/prescriptions'],
    enabled: activeTab === 'manage'
  });

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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setSearchTerm('');
  };

  const handleAddMedication = (medication: Medication) => {
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
    setMedicationSearch('');
  };

  const handleUpdateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive"
      });
      return;
    }
    if (formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one medication",
        variant: "destructive"
      });
      return;
    }
    createPrescriptionMutation.mutate(formData);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const cost = item.medication?.unitCost || 0;
      return total + (cost * item.quantity);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSaveComplete = () => {
    if (onSaveComplete) {
      onSaveComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
                  <p className="text-sm text-gray-500">Create and manage patient prescriptions</p>
                </div>
              </div>
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Prescription</TabsTrigger>
            <TabsTrigger value="manage">Manage Prescriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>New Prescription</CardTitle>
                <CardDescription>Create a new prescription for a patient</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Patient Selection */}
                  <div className="space-y-4">
                    <Label htmlFor="patient-search">Search Patient</Label>
                    {selectedPatient ? (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium">{selectedPatient.firstName} {selectedPatient.surname}</div>
                            <div className="text-sm text-gray-500">NRC: {selectedPatient.nrc}</div>
                            <div className="text-sm text-gray-500">
                              {selectedPatient.sex} • {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years
                            </div>
                          </div>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setSelectedPatient(null)}>
                          Change Patient
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="patient-search"
                            placeholder="Search by name, NRC, or phone number"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {searchTerm.length > 2 && (
                          <div className="max-h-48 overflow-y-auto border rounded-lg bg-white">
                            {patientsLoading ? (
                              <div className="p-4 text-center text-gray-500">Searching...</div>
                            ) : patients.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">No patients found</div>
                            ) : (
                              patients.map((patient: Patient) => (
                                <div
                                  key={patient.id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                  onClick={() => handlePatientSelect(patient)}
                                >
                                  <div className="font-medium">{patient.firstName} {patient.surname}</div>
                                  <div className="text-sm text-gray-500">NRC: {patient.nrc}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

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
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Medication Selection */}
                  <div className="space-y-4">
                    <Label>Add Medications</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search medications by name or category"
                        value={medicationSearch}
                        onChange={(e) => setMedicationSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {medicationSearch.length > 2 && (
                      <div className="max-h-48 overflow-y-auto border rounded-lg bg-white">
                        {medicationsLoading ? (
                          <div className="p-4 text-center text-gray-500">Searching...</div>
                        ) : medications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No medications found</div>
                        ) : (
                          medications.map((medication: Medication) => (
                            <div
                              key={medication.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              onClick={() => handleAddMedication(medication)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{medication.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {medication.dosageForm} • {medication.strength}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Stock: {medication.stockLevel} • {formatCurrency(medication.unitCost)}
                                  </div>
                                </div>
                                <Plus className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prescription Items */}
                  {formData.items.length > 0 && (
                    <div className="space-y-4">
                      <Label>Prescription Items</Label>
                      {formData.items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Pill className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium">{item.medication?.name}</div>
                                <div className="text-sm text-gray-500">
                                  {item.medication?.dosageForm} • {item.medication?.strength}
                                </div>
                              </div>
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                              <Input
                                id={`dosage-${index}`}
                                placeholder="e.g., 1 tablet twice daily"
                                value={item.dosage}
                                onChange={(e) => handleUpdateItem(index, 'dosage', e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`duration-${index}`}>Duration</Label>
                              <Input
                                id={`duration-${index}`}
                                placeholder="e.g., 7 days"
                                value={item.duration}
                                onChange={(e) => handleUpdateItem(index, 'duration', e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`cost-${index}`}>Cost</Label>
                              <div className="text-sm font-medium pt-2">
                                {formatCurrency((item.medication?.unitCost || 0) * item.quantity)}
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`instructions-${index}`}>Special Instructions</Label>
                            <Input
                              id={`instructions-${index}`}
                              placeholder="Additional instructions"
                              value={item.instructions}
                              onChange={(e) => handleUpdateItem(index, 'instructions', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium">Total Cost:</div>
                        <div className="text-lg font-bold">{formatCurrency(calculateTotal())}</div>
                      </div>
                    </div>
                  )}

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

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('manage')}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPrescriptionMutation.isPending || !selectedPatient || formData.items.length === 0}
                    >
                      {createPrescriptionMutation.isPending ? 'Creating...' : 'Create Prescription'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Management</CardTitle>
                <CardDescription>View and manage existing prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptionsLoading ? (
                  <div className="text-center py-8">Loading prescriptions...</div>
                ) : recentPrescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No prescriptions found</div>
                ) : (
                  <div className="space-y-4">
                    {recentPrescriptions.map((prescription: any) => (
                      <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{prescription.prescriptionNumber}</div>
                            <div className="text-sm text-gray-500">{prescription.patientName}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(prescription.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${prescription.priority === 'emergency' ? 'bg-red-100 text-red-800' : 
                            prescription.priority === 'urgent' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                            {prescription.priority}
                          </Badge>
                          <Badge className={`${prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            prescription.status === 'dispensed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {prescription.status}
                          </Badge>
                          <div className="text-sm font-medium">
                            {formatCurrency(prescription.totalCost)}
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}