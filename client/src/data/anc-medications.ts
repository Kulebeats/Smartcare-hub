// Comprehensive ANC medications database for Zambian healthcare context
export const ancMedications = [
  // Essential ANC Supplements
  {
    id: 1,
    name: 'Iron + Folic Acid',
    genericName: 'Ferrous Sulfate + Folic Acid',
    dosageForm: 'Tablet',
    strength: '200mg + 0.4mg',
    category: 'Supplements',
    stockLevel: 500,
    unitCost: 0.50
  },
  {
    id: 2,
    name: 'Ferrous Sulfate',
    genericName: 'Ferrous Sulfate',
    dosageForm: 'Tablet',
    strength: '200mg',
    category: 'Supplements',
    stockLevel: 300,
    unitCost: 0.25
  },
  {
    id: 3,
    name: 'Folic Acid',
    genericName: 'Folic Acid',
    dosageForm: 'Tablet',
    strength: '400mcg',
    category: 'Supplements',
    stockLevel: 450,
    unitCost: 0.20
  },
  {
    id: 4,
    name: 'Folic Acid 5mg',
    genericName: 'Folic Acid',
    dosageForm: 'Tablet',
    strength: '5mg',
    category: 'Supplements',
    stockLevel: 200,
    unitCost: 0.35
  },
  {
    id: 5,
    name: 'Calcium Carbonate',
    genericName: 'Calcium Carbonate',
    dosageForm: 'Tablet',
    strength: '500mg',
    category: 'Supplements',
    stockLevel: 250,
    unitCost: 0.30
  },
  {
    id: 6,
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    dosageForm: 'Tablet',
    strength: '1000 IU',
    category: 'Supplements',
    stockLevel: 180,
    unitCost: 0.45
  },

  // Immunization
  {
    id: 7,
    name: 'Tetanus Toxoid',
    genericName: 'Tetanus Toxoid',
    dosageForm: 'Injection',
    strength: '0.5ml',
    category: 'Immunization',
    stockLevel: 100,
    unitCost: 2.50
  },

  // Antimalarials
  {
    id: 8,
    name: 'Sulfadoxine-Pyrimethamine',
    genericName: 'Sulfadoxine-Pyrimethamine',
    dosageForm: 'Tablet',
    strength: '500mg + 25mg',
    category: 'Antimalarials',
    stockLevel: 400,
    unitCost: 1.20
  },
  {
    id: 9,
    name: 'Artemether-Lumefantrine',
    genericName: 'Artemether-Lumefantrine',
    dosageForm: 'Tablet',
    strength: '20mg + 120mg',
    category: 'Antimalarials',
    stockLevel: 350,
    unitCost: 2.80
  },

  // Antiretrovirals (Option B+)
  {
    id: 10,
    name: 'Efavirenz',
    genericName: 'Efavirenz',
    dosageForm: 'Tablet',
    strength: '600mg',
    category: 'Antiretrovirals',
    stockLevel: 200,
    unitCost: 3.50
  },
  {
    id: 11,
    name: 'Tenofovir',
    genericName: 'Tenofovir Disoproxil Fumarate',
    dosageForm: 'Tablet',
    strength: '300mg',
    category: 'Antiretrovirals',
    stockLevel: 180,
    unitCost: 4.20
  },
  {
    id: 12,
    name: 'Emtricitabine',
    genericName: 'Emtricitabine',
    dosageForm: 'Tablet',
    strength: '200mg',
    category: 'Antiretrovirals',
    stockLevel: 150,
    unitCost: 3.80
  },
  {
    id: 13,
    name: 'Zidovudine',
    genericName: 'Zidovudine',
    dosageForm: 'Tablet',
    strength: '300mg',
    category: 'Antiretrovirals',
    stockLevel: 120,
    unitCost: 2.90
  },
  {
    id: 14,
    name: 'Lamivudine',
    genericName: 'Lamivudine',
    dosageForm: 'Tablet',
    strength: '150mg',
    category: 'Antiretrovirals',
    stockLevel: 160,
    unitCost: 2.40
  },

  // Infection Prevention
  {
    id: 15,
    name: 'Cotrimoxazole',
    genericName: 'Sulfamethoxazole + Trimethoprim',
    dosageForm: 'Tablet',
    strength: '160mg + 800mg',
    category: 'Antibiotics',
    stockLevel: 300,
    unitCost: 0.80
  },
  {
    id: 16,
    name: 'Cotrimoxazole Pediatric',
    genericName: 'Sulfamethoxazole + Trimethoprim',
    dosageForm: 'Tablet',
    strength: '80mg + 400mg',
    category: 'Antibiotics',
    stockLevel: 250,
    unitCost: 0.60
  },

  // Pregnancy-Safe Medications
  {
    id: 17,
    name: 'Paracetamol',
    genericName: 'Paracetamol',
    dosageForm: 'Tablet',
    strength: '500mg',
    category: 'Analgesics',
    stockLevel: 600,
    unitCost: 0.15
  },
  {
    id: 18,
    name: 'Methyldopa',
    genericName: 'Methyldopa',
    dosageForm: 'Tablet',
    strength: '250mg',
    category: 'Antihypertensives',
    stockLevel: 150,
    unitCost: 1.50
  },
  {
    id: 19,
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    dosageForm: 'Capsule',
    strength: '500mg',
    category: 'Antibiotics',
    stockLevel: 400,
    unitCost: 0.90
  },
  {
    id: 20,
    name: 'Amoxicillin Syrup',
    genericName: 'Amoxicillin',
    dosageForm: 'Syrup',
    strength: '125mg/5ml',
    category: 'Antibiotics',
    stockLevel: 200,
    unitCost: 2.50
  },
  {
    id: 21,
    name: 'Cephalexin',
    genericName: 'Cephalexin',
    dosageForm: 'Capsule',
    strength: '250mg',
    category: 'Antibiotics',
    stockLevel: 180,
    unitCost: 1.20
  },
  {
    id: 22,
    name: 'Erythromycin',
    genericName: 'Erythromycin',
    dosageForm: 'Tablet',
    strength: '250mg',
    category: 'Antibiotics',
    stockLevel: 120,
    unitCost: 1.80
  },

  // Emergency Medications
  {
    id: 23,
    name: 'Nifedipine',
    genericName: 'Nifedipine',
    dosageForm: 'Tablet',
    strength: '10mg',
    category: 'Antihypertensives',
    stockLevel: 100,
    unitCost: 0.75
  },
  {
    id: 24,
    name: 'Hydralazine',
    genericName: 'Hydralazine',
    dosageForm: 'Injection',
    strength: '20mg/ml',
    category: 'Antihypertensives',
    stockLevel: 50,
    unitCost: 3.20
  },
  {
    id: 25,
    name: 'Magnesium Sulfate',
    genericName: 'Magnesium Sulfate',
    dosageForm: 'Injection',
    strength: '50%',
    category: 'Emergency',
    stockLevel: 60,
    unitCost: 2.80
  },

  // Additional Essential Medications
  {
    id: 26,
    name: 'Dexamethasone',
    genericName: 'Dexamethasone',
    dosageForm: 'Injection',
    strength: '4mg/ml',
    category: 'Corticosteroids',
    stockLevel: 80,
    unitCost: 1.50
  },
  {
    id: 27,
    name: 'Oxytocin',
    genericName: 'Oxytocin',
    dosageForm: 'Injection',
    strength: '10 IU/ml',
    category: 'Obstetric',
    stockLevel: 100,
    unitCost: 2.20
  },
  {
    id: 28,
    name: 'Ergometrine',
    genericName: 'Ergometrine',
    dosageForm: 'Injection',
    strength: '0.2mg/ml',
    category: 'Obstetric',
    stockLevel: 70,
    unitCost: 1.80
  },
  {
    id: 29,
    name: 'Benzathine Penicillin',
    genericName: 'Benzathine Penicillin G',
    dosageForm: 'Injection',
    strength: '2.4 MU',
    category: 'Antibiotics',
    stockLevel: 90,
    unitCost: 3.50
  },
  {
    id: 30,
    name: 'Ampicillin',
    genericName: 'Ampicillin',
    dosageForm: 'Injection',
    strength: '500mg',
    category: 'Antibiotics',
    stockLevel: 120,
    unitCost: 2.10
  }
];

// Search function for medications
export const searchMedications = (searchTerm: string) => {
  if (searchTerm.length < 2) return [];
  
  const term = searchTerm.toLowerCase();
  return ancMedications.filter(medication =>
    medication.name.toLowerCase().includes(term) ||
    medication.genericName?.toLowerCase().includes(term) ||
    medication.category.toLowerCase().includes(term) ||
    medication.dosageForm.toLowerCase().includes(term)
  );
};