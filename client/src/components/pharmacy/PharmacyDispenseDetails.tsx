import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Pill
} from "lucide-react";

interface Medication {
  id: number;
  drugName: string;
  dosage: string;
  itemPerDose: string;
  frequency: string;
  timePerUnit: string;
  frequencyUnit: string;
  duration: string;
  durationUnit: string;
  route: string;
  quantity: string;
  startDate: string;
  endDate: string;
  isPasserBy: string;
  comments: string;
}

interface Prescription {
  id: number;
  medications: Medication[];
  prescribedBy: string;
  prescribedDate: string;
  patientName: string;
  status: "prescribed" | "dispensed";
  prescriptionNumber: string;
  patientId: number;
  totalCost: number;
  validUntil: string;
}

interface PharmacyDispenseDetailsProps {
  prescriptions?: Prescription[];
  dispensedMedications?: Prescription[];
  onDispense?: (prescription: Prescription) => void;
  onEdit?: (prescription: Prescription) => void;
  onDelete?: (prescriptionId: number) => void;
}

const PharmacyDispenseDetails: React.FC<PharmacyDispenseDetailsProps> = ({
  prescriptions = [],
  dispensedMedications = [],
  onDispense,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dispensationNotes, setDispensationNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);

  // Load sample data if none provided
  const [localPrescriptions, setLocalPrescriptions] = useState<Prescription[]>([]);
  const [localDispensed, setLocalDispensed] = useState<Prescription[]>([]);

  useEffect(() => {
    const initializeData = () => {
      if (prescriptions.length === 0) {
        const savedPrescriptions = localStorage.getItem("prescriptions");
        if (savedPrescriptions) {
          try {
            const parsedPrescriptions = JSON.parse(savedPrescriptions);
            const prescribed = parsedPrescriptions.filter((p: Prescription) => p.status === "prescribed");
            setLocalPrescriptions(prescribed);
          } catch (error) {
            console.error("Error parsing prescriptions:", error);
            setLocalPrescriptions([]);
          }
        }
      } else {
        setLocalPrescriptions(prescriptions);
      }

      if (dispensedMedications.length === 0) {
        const savedDispensed = localStorage.getItem("dispensedMedications");
        if (savedDispensed) {
          try {
            const parsedDispensed = JSON.parse(savedDispensed);
            setLocalDispensed(parsedDispensed);
          } catch (error) {
            console.error("Error parsing dispensed medications:", error);
            setLocalDispensed([]);
          }
        }
      } else {
        setLocalDispensed(dispensedMedications);
      }
    };

    initializeData();
  }, [prescriptions.length, dispensedMedications.length]);

  const filteredPrescriptions = localPrescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDispense = async (prescription: Prescription) => {
    setIsLoading(true);
    try {
      // Update prescription status
      const updatedPrescription = { ...prescription, status: "dispensed" as const };
      
      // Update local state
      setLocalPrescriptions(prev => prev.filter(p => p.id !== prescription.id));
      setLocalDispensed(prev => [...prev, updatedPrescription]);
      
      // Update localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]");
      const updatedAll = allPrescriptions.map((p: Prescription) => 
        p.id === prescription.id ? updatedPrescription : p
      );
      localStorage.setItem("prescriptions", JSON.stringify(updatedAll));
      
      const currentDispensed = JSON.parse(localStorage.getItem("dispensedMedications") || "[]");
      localStorage.setItem("dispensedMedications", JSON.stringify([...currentDispensed, updatedPrescription]));
      
      setSelectedPrescription(null);
      setDispensationNotes("");
      
      if (onDispense) {
        onDispense(updatedPrescription);
      }
    } catch (error) {
      console.error("Error dispensing prescription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (prescription: Prescription) => {
    if (onEdit) {
      onEdit(prescription);
    }
  };

  const handleDelete = (prescriptionId: number) => {
    if (onDelete) {
      onDelete(prescriptionId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prescribed":
        return "bg-yellow-100 text-yellow-800";
      case "dispensed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "prescribed":
        return <Clock className="w-4 h-4" />;
      case "dispensed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Prescription Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Prescriptions</Label>
              <Input
                id="search"
                placeholder="Search by patient name, prescription number, or prescriber..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dispensation Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Prescribed Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Prescribed Medications ({filteredPrescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredPrescriptions.map((prescription) => (
                <div 
                  key={prescription.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{prescription.patientName}</h4>
                      <p className="text-sm text-gray-600">#{prescription.prescriptionNumber}</p>
                    </div>
                    <Badge className={getStatusColor(prescription.status)}>
                      {getStatusIcon(prescription.status)}
                      <span className="ml-1">{prescription.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>By: {prescription.prescribedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Date: {new Date(prescription.prescribedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill className="w-3 h-3" />
                      <span>Medications: {prescription.medications.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDispense(prescription);
                      }}
                      disabled={isLoading}
                    >
                      Dispense
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(prescription);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredPrescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No prescribed medications found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dispensed Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Dispensed Medications ({localDispensed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {localDispensed.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{prescription.patientName}</h4>
                      <p className="text-sm text-gray-600">#{prescription.prescriptionNumber}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Dispensed
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>By: {prescription.prescribedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Date: {new Date(prescription.prescribedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill className="w-3 h-3" />
                      <span>Medications: {prescription.medications.length}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {localDispensed.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No dispensed medications yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispensation Details Modal */}
      {selectedPrescription && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Dispensation Details - {selectedPrescription.patientName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Cost</Label>
                  <p className="text-lg font-semibold text-green-600">
                    K{selectedPrescription.totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Dispensation Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this dispensation..."
                  value={dispensationNotes}
                  onChange={(e) => setDispensationNotes(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Medications to Dispense</Label>
                {selectedPrescription.medications.map((med, index) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{med.drugName}</p>
                        <p className="text-sm text-gray-600">{med.dosage}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Qty: {med.quantity}</p>
                        <p className="text-sm">{med.frequency}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleDispense(selectedPrescription)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Dispensing..." : "Complete Dispensation"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPrescription(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PharmacyDispenseDetails;