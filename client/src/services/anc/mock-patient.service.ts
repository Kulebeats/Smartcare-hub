/**
 * Mock Patient Service for Development
 * Provides dummy data when building without real patient API calls
 */

export interface MockPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface MockEncounter {
  id: string;
  patientId: string;
  visitNumber: number;
  visitDate: string;
  gestationalAge?: {
    weeks: number;
    days: number;
  };
  lastMenstrualPeriod?: string;
  expectedDeliveryDate?: string;
  vitalSigns?: {
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
}

// Mock patient data for development
const MOCK_PATIENT: MockPatient = {
  id: 'mock-patient-001',
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: '1990-05-15',
  nationalId: '123456/78/9',
  phoneNumber: '+260-97-123-4567',
  address: 'Plot 123, Lusaka, Zambia',
  emergencyContact: {
    name: 'John Doe',
    phone: '+260-97-765-4321'
  }
};

// Mock encounter data
const MOCK_ENCOUNTER: MockEncounter = {
  id: 'mock-encounter-001',
  patientId: 'mock-patient-001',
  visitNumber: 1,
  visitDate: new Date().toISOString(),
  gestationalAge: {
    weeks: 28,
    days: 3
  },
  lastMenstrualPeriod: '2024-06-01',
  expectedDeliveryDate: '2025-03-08',
  vitalSigns: {
    bloodPressure: {
      systolic: 120,
      diastolic: 80
    },
    heartRate: 72,
    temperature: 36.8,
    weight: 68.5,
    height: 165
  }
};

/**
 * Mock Patient Service
 */
export class MockPatientService {
  /**
   * Get mock patient data
   */
  static async getPatient(patientId: string): Promise<MockPatient | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (patientId === 'mock-patient-001' || patientId === 'demo') {
      return MOCK_PATIENT;
    }
    
    return null;
  }

  /**
   * Get mock encounter data
   */
  static async getEncounter(encounterId?: string): Promise<MockEncounter> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      ...MOCK_ENCOUNTER,
      id: encounterId || MOCK_ENCOUNTER.id
    };
  }

  /**
   * Create new mock encounter
   */
  static async createEncounter(patientId: string): Promise<MockEncounter> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      ...MOCK_ENCOUNTER,
      id: `mock-encounter-${Date.now()}`,
      patientId,
      visitDate: new Date().toISOString()
    };
  }

  /**
   * Save encounter data (mock)
   */
  static async saveEncounter(encounterId: string, data: Partial<MockEncounter>): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Always succeed for mock
    console.log('Mock: Saving encounter data', { encounterId, data });
    return { success: true };
  }

  /**
   * Check if using mock mode
   */
  static isMockMode(): boolean {
    return import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }
}