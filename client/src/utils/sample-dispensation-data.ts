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

export const samplePrescriptions: Prescription[] = [
  {
    id: 1,
    prescriptionNumber: "RX-2025-001",
    patientName: "Maria Mwanza",
    patientId: 1001,
    prescribedBy: "Dr. John Phiri",
    prescribedDate: "2025-01-11",
    status: "prescribed",
    totalCost: 150.00,
    validUntil: "2025-01-25",
    medications: [
      {
        id: 1,
        drugName: "Paracetamol",
        dosage: "500mg",
        itemPerDose: "2",
        frequency: "3",
        timePerUnit: "8",
        frequencyUnit: "hours",
        duration: "7",
        durationUnit: "days",
        route: "Oral",
        quantity: "42",
        startDate: "2025-01-11",
        endDate: "2025-01-18",
        isPasserBy: "No",
        comments: "Take after meals"
      }
    ]
  },
  {
    id: 2,
    prescriptionNumber: "RX-2025-002",
    patientName: "James Banda",
    patientId: 1002,
    prescribedBy: "Dr. Sarah Tembo",
    prescribedDate: "2025-01-11",
    status: "prescribed",
    totalCost: 280.00,
    validUntil: "2025-01-25",
    medications: [
      {
        id: 2,
        drugName: "Amoxicillin",
        dosage: "250mg",
        itemPerDose: "1",
        frequency: "3",
        timePerUnit: "8",
        frequencyUnit: "hours",
        duration: "5",
        durationUnit: "days",
        route: "Oral",
        quantity: "15",
        startDate: "2025-01-11",
        endDate: "2025-01-16",
        isPasserBy: "No",
        comments: "Complete full course"
      },
      {
        id: 3,
        drugName: "Iron + Folic Acid",
        dosage: "200mg + 0.4mg",
        itemPerDose: "1",
        frequency: "1",
        timePerUnit: "24",
        frequencyUnit: "hours",
        duration: "30",
        durationUnit: "days",
        route: "Oral",
        quantity: "30",
        startDate: "2025-01-11",
        endDate: "2025-02-10",
        isPasserBy: "No",
        comments: "Take with vitamin C"
      }
    ]
  },
  {
    id: 3,
    prescriptionNumber: "RX-2025-003",
    patientName: "Grace Mulenga",
    patientId: 1003,
    prescribedBy: "Dr. Peter Zulu",
    prescribedDate: "2025-01-10",
    status: "prescribed",
    totalCost: 95.00,
    validUntil: "2025-01-24",
    medications: [
      {
        id: 4,
        drugName: "Sulfadoxine-Pyrimethamine",
        dosage: "500mg + 25mg",
        itemPerDose: "3",
        frequency: "1",
        timePerUnit: "1",
        frequencyUnit: "dose",
        duration: "1",
        durationUnit: "day",
        route: "Oral",
        quantity: "3",
        startDate: "2025-01-10",
        endDate: "2025-01-10",
        isPasserBy: "No",
        comments: "IPTp - single dose"
      }
    ]
  }
];

export const sampleDispensedMedications: Prescription[] = [
  {
    id: 4,
    prescriptionNumber: "RX-2025-004",
    patientName: "Alice Chanda",
    patientId: 1004,
    prescribedBy: "Dr. Michael Kunda",
    prescribedDate: "2025-01-09",
    status: "dispensed",
    totalCost: 125.00,
    validUntil: "2025-01-23",
    medications: [
      {
        id: 5,
        drugName: "Tetanus Toxoid",
        dosage: "0.5ml",
        itemPerDose: "1",
        frequency: "1",
        timePerUnit: "1",
        frequencyUnit: "dose",
        duration: "1",
        durationUnit: "day",
        route: "Intramuscular",
        quantity: "1",
        startDate: "2025-01-09",
        endDate: "2025-01-09",
        isPasserBy: "No",
        comments: "Antenatal immunization"
      }
    ]
  }
];

export const initializeSampleData = () => {
  try {
    const existingPrescriptions = localStorage.getItem('prescriptions');
    const existingDispensed = localStorage.getItem('dispensedMedications');
    
    if (!existingPrescriptions || JSON.parse(existingPrescriptions).length === 0) {
      localStorage.setItem('prescriptions', JSON.stringify(samplePrescriptions));
      console.log('Sample prescriptions initialized');
    }
    
    if (!existingDispensed || JSON.parse(existingDispensed).length === 0) {
      localStorage.setItem('dispensedMedications', JSON.stringify(sampleDispensedMedications));
      console.log('Sample dispensed medications initialized');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};