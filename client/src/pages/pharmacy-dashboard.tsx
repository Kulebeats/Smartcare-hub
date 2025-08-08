import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PrescriptionModalWrapper from '../components/pharmacy/prescription-modal-wrapper';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Pill, 
  FileText, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface PharmacyStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  dispensedToday: number;
  lowStockItems: number;
  totalRevenue: number;
  pendingDispensations: number;
}

interface RecentPrescription {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  prescriber: string;
  status: 'pending' | 'dispensed' | 'cancelled' | 'expired';
  priority: 'routine' | 'urgent' | 'emergency';
  issuedAt: string;
  totalCost: number;
}

interface PrescriptionHistoryData {
  id: number;
  prescriptionDate: string;
  facility: string;
  clinician: string;
  drugName: string;
  isPasserBy: boolean;
  frequency: string;
  quantity: number;
  duration: string;
  route: string;
  comment: string;
}

interface LowStockItem {
  id: number;
  name: string;
  currentStock: number;
  minimumStock: number;
  category: string;
}

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Check URL parameters to auto-open prescription modal
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('modal') === 'prescription') {
      setShowPrescriptionModal(true);
      // Clean up URL parameter
      window.history.replaceState({}, '', '/pharmacy');
    }
  }, []);
  const [prescriptionData, setPrescriptionData] = useState<any[]>([]);
  const [showDispensationInterface, setShowDispensationInterface] = useState(false);
  const [localDispensations, setLocalDispensations] = useState<any[]>([]);
  const { toast } = useToast();

  // Mock data states to replace API calls
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    dispensedToday: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    pendingDispensations: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Mock data states to replace API calls
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [prescriptionsError, setPrescriptionsError] = useState(null);
  const [lowStockMedications, setLowStockMedications] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);

  // Load mock data on component mount
  useEffect(() => {
    const loadMockData = async () => {
      try {
        const { mockPharmacyService } = await import('../services/mockPharmacyService');
        
        // Get stats
        const mockStats = mockPharmacyService.getStats();
        setStats(prev => ({ ...prev, ...mockStats }));

        // Get recent prescriptions
        const mockRecent = mockPharmacyService.getRecentPrescriptions();
        setRecentPrescriptions(mockRecent);

        // Mock low stock medications
        const mockLowStock = [
          { id: 1, name: 'Paracetamol 500mg', currentStock: 5, minimumStock: 20, category: 'Analgesics' },
          { id: 2, name: 'Amoxicillin 250mg', currentStock: 8, minimumStock: 15, category: 'Antibiotics' },
          { id: 3, name: 'Iron + Folic Acid', currentStock: 2, minimumStock: 10, category: 'Supplements' }
        ];
        setLowStockMedications(mockLowStock);

        console.log('Mock pharmacy data loaded successfully');
      } catch (error) {
        console.error('Error loading mock data:', error);
        setPrescriptionsError(error);
      }
    };

    loadMockData();
  }, []);

  // Mock prescription history data to match the design
  const mockPrescriptionHistory: PrescriptionHistoryData[] = [
    {
      id: 1,
      prescriptionDate: '2025-01-09',
      facility: 'Central Hospital',
      clinician: 'Dr. Sarah Mwansa',
      drugName: 'Paracetamol 500mg',
      isPasserBy: false,
      frequency: 'TDS',
      quantity: 30,
      duration: '10 days',
      route: 'Oral',
      comment: 'For fever and pain relief'
    },
    {
      id: 2,
      prescriptionDate: '2025-01-08',
      facility: 'District Health Center',
      clinician: 'Dr. James Banda',
      drugName: 'Amoxicillin 500mg',
      isPasserBy: true,
      frequency: 'BD',
      quantity: 20,
      duration: '7 days',
      route: 'Oral',
      comment: 'Antibiotic treatment'
    },
    {
      id: 3,
      prescriptionDate: '2025-01-07',
      facility: 'Central Hospital',
      clinician: 'Dr. Mary Phiri',
      drugName: 'Iron + Folic Acid',
      isPasserBy: false,
      frequency: 'OD',
      quantity: 90,
      duration: '30 days',
      route: 'Oral',
      comment: 'Anemia treatment'
    },
    {
      id: 4,
      prescriptionDate: '2025-01-06',
      facility: 'Rural Health Post',
      clinician: 'Nurse Patricia Nyirenda',
      drugName: 'Cotrimoxazole 960mg',
      isPasserBy: false,
      frequency: 'BD',
      quantity: 14,
      duration: '7 days',
      route: 'Oral',
      comment: 'Prophylactic treatment'
    },
    {
      id: 5,
      prescriptionDate: '2025-01-05',
      facility: 'Central Hospital',
      clinician: 'Dr. John Tembo',
      drugName: 'Metformin 500mg',
      isPasserBy: false,
      frequency: 'BD',
      quantity: 60,
      duration: '30 days',
      route: 'Oral',
      comment: 'Diabetes management'
    }
  ];

  // Pagination logic
  const totalPages = Math.ceil(mockPrescriptionHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrescriptions = mockPrescriptionHistory.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stable function references using useCallback
  const handleOpenPrescriptionModal = useCallback(() => {
    setShowPrescriptionModal(true);
  }, []);

  const handleClosePrescriptionModal = useCallback(async () => {
    console.log("handleClosePrescriptionModal called in PharmacyDashboard");
    setShowPrescriptionModal(false);
    
    // Refresh data after closing modal
    try {
      const { mockPharmacyService } = await import('../services/mockPharmacyService');
      const mockStats = mockPharmacyService.getStats();
      const mockRecent = mockPharmacyService.getRecentPrescriptions();
      setStats(prev => ({ ...prev, ...mockStats }));
      setRecentPrescriptions(mockRecent);
      console.log('Data refreshed after prescription modal close');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  const handlePrescriptionSaveComplete = useCallback(() => {
    setShowPrescriptionModal(false);
    toast({
      title: "Success",
      description: "Prescription saved successfully!",
    });
  }, [toast]);

  // Handle escape key and custom close event
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPrescriptionModal) {
        setShowPrescriptionModal(false);
      }
    };

    const handleCloseEvent = () => {
      setShowPrescriptionModal(false);
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('closePrescriptionModal', handleCloseEvent);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('closePrescriptionModal', handleCloseEvent);
    };
  }, [showPrescriptionModal]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
                <p className="text-sm text-gray-500">Prescription management and dispensation tracking</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleOpenPrescriptionModal} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
              <Button variant="outline" onClick={() => setShowDispensationInterface(true)}>
                <Package className="w-4 h-4 mr-2" />
                Dispensation Queue
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Prescription History Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">History of Pharmacy Prescription</CardTitle>
                <Button 
                  onClick={handleOpenPrescriptionModal} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Prescription
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-700">Prescription Date</th>
                        <th className="text-left p-3 font-medium text-gray-700">Facility</th>
                        <th className="text-left p-3 font-medium text-gray-700">Clinician</th>
                        <th className="text-left p-3 font-medium text-gray-700">Drug Name</th>
                        <th className="text-left p-3 font-medium text-gray-700">Is Passer By</th>
                        <th className="text-left p-3 font-medium text-gray-700">Frequency</th>
                        <th className="text-left p-3 font-medium text-gray-700">Qty</th>
                        <th className="text-left p-3 font-medium text-gray-700">Duration</th>
                        <th className="text-left p-3 font-medium text-gray-700">Route</th>
                        <th className="text-left p-3 font-medium text-gray-700">Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPrescriptions.map((prescription) => (
                        <tr key={prescription.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">
                            {new Date(prescription.prescriptionDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="p-3 text-sm">{prescription.facility}</td>
                          <td className="p-3 text-sm">{prescription.clinician}</td>
                          <td className="p-3 text-sm">{prescription.drugName}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              prescription.isPasserBy 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {prescription.isPasserBy ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{prescription.frequency}</td>
                          <td className="p-3 text-sm">{prescription.quantity}</td>
                          <td className="p-3 text-sm">{prescription.duration}</td>
                          <td className="p-3 text-sm">{prescription.route}</td>
                          <td className="p-3 text-sm">{prescription.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <select 
                      value={itemsPerPage} 
                      className="border rounded px-2 py-1 text-sm"
                      disabled
                    >
                      <option value={5}>5</option>
                    </select>
                    <span className="text-sm text-gray-700">entries</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      &lt;
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded text-sm ${
                            currentPage === page 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Management</CardTitle>
                <CardDescription>Create and manage prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Prescription management interface coming soon</p>
                  <Button onClick={handleOpenPrescriptionModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>Medications requiring immediate restocking</CardDescription>
              </CardHeader>
              <CardContent>
                {stockLoading ? (
                  <div className="text-center py-8">Loading inventory...</div>
                ) : lowStockMedications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">All items are well stocked</div>
                ) : (
                  <div className="space-y-4">
                    {lowStockMedications.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-sm">
                            Current: <span className="font-medium text-red-600">{item.currentStock}</span>
                          </div>
                          <div className="text-sm">
                            Minimum: <span className="font-medium">{item.minimumStock}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Restock
                          </Button>
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

      {/* Prescription Modal */}
      <PrescriptionModalWrapper
        isOpen={showPrescriptionModal}
        onSaveComplete={handlePrescriptionSaveComplete}
        onClose={handleClosePrescriptionModal}
      />


    </div>
  );
}