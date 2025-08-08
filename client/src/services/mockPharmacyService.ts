// Mock Pharmacy Service for Local Development
// Provides all pharmacy functionality without database dependencies

interface MockPrescription {
  id: number;
  prescriptionNumber: string;
  patientId: number;
  patientName: string;
  medications: any[];
  prescribedBy: string;
  prescribedDate: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'emergency';
  totalCost: number;
  facility: string;
  clinician: string;
  issuedAt: string;
}

interface MockPrescriptionStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  dispensedToday: number;
  lowStockItems: number;
}

class MockPharmacyService {
  private prescriptions: MockPrescription[] = [];
  private prescriptionCounter = 1000;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Load from localStorage or create initial data
    const stored = localStorage.getItem('mockPrescriptions');
    if (stored) {
      this.prescriptions = JSON.parse(stored);
      this.prescriptionCounter = Math.max(...this.prescriptions.map(p => p.id), 1000) + 1;
    } else {
      this.prescriptions = this.createInitialPrescriptions();
      this.savePrescriptions();
    }
  }

  private createInitialPrescriptions(): MockPrescription[] {
    return [
      {
        id: 1001,
        prescriptionNumber: 'RX-2025-001',
        patientId: 1,
        patientName: 'Sarah Mwanza',
        medications: [
          {
            id: 1,
            drugName: 'Paracetamol 500mg',
            dosage: '500mg',
            itemPerDose: '1',
            frequency: 'TDS',
            duration: '7',
            durationUnit: 'days',
            route: 'Per-Oral',
            quantity: '21',
            isPasserBy: 'No',
            comments: 'Take with food'
          }
        ],
        prescribedBy: 'Dr. John Banda',
        prescribedDate: '2025-01-09',
        status: 'pending',
        priority: 'routine',
        totalCost: 25.50,
        facility: 'Lusaka General Hospital',
        clinician: 'Dr. John Banda',
        issuedAt: '2025-01-09T10:30:00Z'
      },
      {
        id: 1002,
        prescriptionNumber: 'RX-2025-002',
        patientId: 2,
        patientName: 'Mary Phiri',
        medications: [
          {
            id: 2,
            drugName: 'Amoxicillin 250mg',
            dosage: '250mg',
            itemPerDose: '1',
            frequency: 'TDS',
            duration: '5',
            durationUnit: 'days',
            route: 'Per-Oral',
            quantity: '15',
            isPasserBy: 'No',
            comments: 'Complete full course'
          }
        ],
        prescribedBy: 'Dr. Grace Tembo',
        prescribedDate: '2025-01-09',
        status: 'dispensed',
        priority: 'urgent',
        totalCost: 45.00,
        facility: 'Lusaka General Hospital',
        clinician: 'Dr. Grace Tembo',
        issuedAt: '2025-01-09T11:15:00Z'
      },
      {
        id: 1003,
        prescriptionNumber: 'RX-2025-003',
        patientId: 3,
        patientName: 'James Mulenga',
        medications: [
          {
            id: 3,
            drugName: 'Iron + Folic Acid 200mg + 0.4mg',
            dosage: '200mg + 0.4mg',
            itemPerDose: '1',
            frequency: 'OD',
            duration: '30',
            durationUnit: 'days',
            route: 'Per-Oral',
            quantity: '30',
            isPasserBy: 'Yes',
            comments: 'Anemia treatment'
          }
        ],
        prescribedBy: 'Dr. Peter Katongo',
        prescribedDate: '2025-01-08',
        status: 'pending',
        priority: 'routine',
        totalCost: 15.75,
        facility: 'Lusaka General Hospital',
        clinician: 'Dr. Peter Katongo',
        issuedAt: '2025-01-08T14:20:00Z'
      }
    ];
  }

  private savePrescriptions() {
    localStorage.setItem('mockPrescriptions', JSON.stringify(this.prescriptions));
  }

  // Get all prescriptions
  getAllPrescriptions(): MockPrescription[] {
    return this.prescriptions;
  }

  // Get recent prescriptions (last 10)
  getRecentPrescriptions(): MockPrescription[] {
    return this.prescriptions
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
      .slice(0, 10);
  }

  // Get pending prescriptions
  getPendingPrescriptions(): MockPrescription[] {
    return this.prescriptions.filter(p => p.status === 'pending');
  }

  // Get prescription statistics
  getStats(): MockPrescriptionStats {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalPrescriptions: this.prescriptions.length,
      pendingPrescriptions: this.prescriptions.filter(p => p.status === 'pending').length,
      dispensedToday: this.prescriptions.filter(p => 
        p.status === 'dispensed' && p.prescribedDate === today
      ).length,
      lowStockItems: 3 // Mock value
    };
  }

  // Save new prescription
  savePrescription(prescriptionData: {
    patientId: number;
    patientName: string;
    medications: any[];
    prescribedBy: string;
  }): MockPrescription {
    const newPrescription: MockPrescription = {
      id: this.prescriptionCounter++,
      prescriptionNumber: `RX-2025-${String(this.prescriptionCounter).padStart(3, '0')}`,
      patientId: prescriptionData.patientId,
      patientName: prescriptionData.patientName,
      medications: prescriptionData.medications,
      prescribedBy: prescriptionData.prescribedBy,
      prescribedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      priority: 'routine',
      totalCost: this.calculateTotalCost(prescriptionData.medications),
      facility: 'Lusaka General Hospital',
      clinician: prescriptionData.prescribedBy,
      issuedAt: new Date().toISOString()
    };

    this.prescriptions.push(newPrescription);
    this.savePrescriptions();
    
    console.log('Prescription saved successfully:', newPrescription);
    return newPrescription;
  }

  private calculateTotalCost(medications: any[]): number {
    // Mock calculation - in real app would use actual medication costs
    return medications.length * 25.50;
  }

  // Update prescription status
  updatePrescriptionStatus(id: number, status: 'pending' | 'dispensed' | 'cancelled') {
    const prescription = this.prescriptions.find(p => p.id === id);
    if (prescription) {
      prescription.status = status;
      this.savePrescriptions();
    }
  }

  // Delete prescription
  deletePrescription(id: number) {
    this.prescriptions = this.prescriptions.filter(p => p.id !== id);
    this.savePrescriptions();
  }

  // Search prescriptions
  searchPrescriptions(query: string): MockPrescription[] {
    const searchTerm = query.toLowerCase();
    return this.prescriptions.filter(p =>
      p.patientName.toLowerCase().includes(searchTerm) ||
      p.prescriptionNumber.toLowerCase().includes(searchTerm) ||
      p.prescribedBy.toLowerCase().includes(searchTerm)
    );
  }
}

// Export singleton instance
export const mockPharmacyService = new MockPharmacyService();
export type { MockPrescription, MockPrescriptionStats };