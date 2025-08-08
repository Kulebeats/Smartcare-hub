// Sample Prescriptions for Testing Dispensation
// Run this script in the browser console to add sample prescriptions to localStorage

const samplePrescriptions = [
  {
    id: 1,
    medications: [
      {
        id: 1,
        drugName: "Iron + Folic Acid",
        dosage: "200mg + 0.4mg",
        itemPerDose: "1",
        frequency: "Once daily",
        timePerUnit: "1",
        frequencyUnit: "day",
        duration: "90",
        durationUnit: "days",
        route: "Oral",
        quantity: "90",
        startDate: "2025-01-11",
        endDate: "2025-04-11",
        isPasserBy: "No",
        comments: "Take with food to prevent stomach upset"
      },
      {
        id: 2,
        drugName: "Paracetamol",
        dosage: "500mg",
        itemPerDose: "1",
        frequency: "Three times daily",
        timePerUnit: "3",
        frequencyUnit: "day",
        duration: "7",
        durationUnit: "days",
        route: "Oral",
        quantity: "21",
        startDate: "2025-01-11",
        endDate: "2025-01-18",
        isPasserBy: "No",
        comments: "For fever and pain relief"
      }
    ],
    prescribedBy: "Dr. Sarah Mwanza",
    prescribedDate: "2025-01-11",
    patientName: "Jane Doe",
    status: "prescribed",
    prescriptionNumber: "PRX-2025-001",
    patientId: 1,
    totalCost: 25.50,
    validUntil: "2025-02-11"
  },
  {
    id: 2,
    medications: [
      {
        id: 3,
        drugName: "Amoxicillin",
        dosage: "500mg",
        itemPerDose: "1",
        frequency: "Three times daily",
        timePerUnit: "3",
        frequencyUnit: "day",
        duration: "7",
        durationUnit: "days",
        route: "Oral",
        quantity: "21",
        startDate: "2025-01-11",
        endDate: "2025-01-18",
        isPasserBy: "No",
        comments: "Complete full course even if symptoms improve"
      }
    ],
    prescribedBy: "Dr. John Banda",
    prescribedDate: "2025-01-11",
    patientName: "Mary Chanda",
    status: "prescribed",
    prescriptionNumber: "PRX-2025-002",
    patientId: 2,
    totalCost: 18.00,
    validUntil: "2025-02-11"
  },
  {
    id: 3,
    medications: [
      {
        id: 4,
        drugName: "Sulfadoxine-Pyrimethamine",
        dosage: "500mg + 25mg",
        itemPerDose: "3",
        frequency: "Single dose",
        timePerUnit: "1",
        frequencyUnit: "dose",
        duration: "1",
        durationUnit: "day",
        route: "Oral",
        quantity: "3",
        startDate: "2025-01-11",
        endDate: "2025-01-11",
        isPasserBy: "No",
        comments: "IPTp-SP for malaria prevention in pregnancy"
      },
      {
        id: 5,
        drugName: "Calcium Carbonate",
        dosage: "500mg",
        itemPerDose: "1",
        frequency: "Twice daily",
        timePerUnit: "2",
        frequencyUnit: "day",
        duration: "30",
        durationUnit: "days",
        route: "Oral",
        quantity: "60",
        startDate: "2025-01-11",
        endDate: "2025-02-10",
        isPasserBy: "No",
        comments: "Take with meals for better absorption"
      }
    ],
    prescribedBy: "Dr. Grace Phiri",
    prescribedDate: "2025-01-11",
    patientName: "Susan Mulenga",
    status: "prescribed",
    prescriptionNumber: "PRX-2025-003",
    patientId: 3,
    totalCost: 32.75,
    validUntil: "2025-02-11"
  },
  {
    id: 4,
    medications: [
      {
        id: 6,
        drugName: "Cotrimoxazole",
        dosage: "160mg + 800mg",
        itemPerDose: "1",
        frequency: "Once daily",
        timePerUnit: "1",
        frequencyUnit: "day",
        duration: "30",
        durationUnit: "days",
        route: "Oral",
        quantity: "30",
        startDate: "2025-01-11",
        endDate: "2025-02-10",
        isPasserBy: "No",
        comments: "Prophylaxis for HIV-positive patients"
      }
    ],
    prescribedBy: "Dr. Michael Tembo",
    prescribedDate: "2025-01-10",
    patientName: "Patricia Musonda",
    status: "prescribed",
    prescriptionNumber: "PRX-2025-004",
    patientId: 4,
    totalCost: 15.25,
    validUntil: "2025-02-10"
  },
  {
    id: 5,
    medications: [
      {
        id: 7,
        drugName: "Ferrous Sulfate",
        dosage: "200mg",
        itemPerDose: "1",
        frequency: "Once daily",
        timePerUnit: "1",
        frequencyUnit: "day",
        duration: "60",
        durationUnit: "days",
        route: "Oral",
        quantity: "60",
        startDate: "2025-01-10",
        endDate: "2025-03-11",
        isPasserBy: "No",
        comments: "For iron deficiency anemia"
      },
      {
        id: 8,
        drugName: "Mebendazole",
        dosage: "500mg",
        itemPerDose: "1",
        frequency: "Single dose",
        timePerUnit: "1",
        frequencyUnit: "dose",
        duration: "1",
        durationUnit: "day",
        route: "Oral",
        quantity: "1",
        startDate: "2025-01-10",
        endDate: "2025-01-10",
        isPasserBy: "No",
        comments: "Deworming - single dose treatment"
      }
    ],
    prescribedBy: "Dr. Agnes Kabwe",
    prescribedDate: "2025-01-10",
    patientName: "Joyce Lungu",
    status: "prescribed",
    prescriptionNumber: "PRX-2025-005",
    patientId: 5,
    totalCost: 22.00,
    validUntil: "2025-02-10"
  }
];

// Function to add sample prescriptions to localStorage
function addSamplePrescriptions() {
  try {
    // Get existing prescriptions
    const existingPrescriptions = localStorage.getItem("prescriptions");
    let prescriptions = [];
    
    if (existingPrescriptions) {
      prescriptions = JSON.parse(existingPrescriptions);
    }
    
    // Add sample prescriptions (avoiding duplicates)
    samplePrescriptions.forEach(samplePrescription => {
      const exists = prescriptions.find(p => p.id === samplePrescription.id);
      if (!exists) {
        prescriptions.push(samplePrescription);
      }
    });
    
    // Save to localStorage
    localStorage.setItem("prescriptions", JSON.stringify(prescriptions));
    
    console.log("✅ Sample prescriptions added successfully!");
    console.log(`📋 Total prescriptions: ${prescriptions.length}`);
    console.log(`🔄 Pending prescriptions: ${prescriptions.filter(p => p.status === 'prescribed').length}`);
    console.log(`✅ Dispensed prescriptions: ${prescriptions.filter(p => p.status === 'dispensed').length}`);
    
    return prescriptions;
  } catch (error) {
    console.error("❌ Error adding sample prescriptions:", error);
    return null;
  }
}

// Function to clear all prescriptions (for testing)
function clearAllPrescriptions() {
  localStorage.removeItem("prescriptions");
  console.log("🗑️ All prescriptions cleared from localStorage");
}

// Function to view current prescriptions
function viewPrescriptions() {
  const prescriptions = localStorage.getItem("prescriptions");
  if (prescriptions) {
    const parsed = JSON.parse(prescriptions);
    console.log("📋 Current prescriptions:", parsed);
    console.log(`📊 Stats: ${parsed.length} total, ${parsed.filter(p => p.status === 'prescribed').length} pending, ${parsed.filter(p => p.status === 'dispensed').length} dispensed`);
  } else {
    console.log("📋 No prescriptions found in localStorage");
  }
}

// Auto-run when script is loaded
console.log("🚀 Sample Prescriptions Script Loaded!");
console.log("📝 Available functions:");
console.log("   - addSamplePrescriptions() - Add sample prescriptions");
console.log("   - clearAllPrescriptions() - Clear all prescriptions");
console.log("   - viewPrescriptions() - View current prescriptions");
console.log("");
console.log("🔧 Adding sample prescriptions automatically...");
addSamplePrescriptions();