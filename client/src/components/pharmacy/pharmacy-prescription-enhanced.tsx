import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, ChevronDown, Trash2, Edit, Search } from 'lucide-react';
import { searchMedications } from '@/data/anc-medications';
import { useQuery } from '@tanstack/react-query';

interface Drug {
  id: number;
  name: string;
  dosage: string;
  unit: string;
  category: string;
  stockLevel?: number;
  unitCost?: number;
}

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

interface Patient {
  id: number;
  firstName: string;
  surname: string;
  nrc: string;
  dateOfBirth: string;
  sex: 'Male' | 'Female';
  cellphone?: string;
}

// Import intervention drug interface
interface InterventionDrug {
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

interface PharmacyPrescriptionEnhancedProps {
  onSaveComplete?: () => void;
  onClose?: () => void;
  prePopulatedDrug?: InterventionDrug;
}

const PharmacyPrescriptionEnhanced: React.FC<PharmacyPrescriptionEnhancedProps> = ({ 
  onSaveComplete, 
  onClose,
  prePopulatedDrug 
}) => {
  const [drugCategory, setDrugCategory] = useState<string>('general');
  const [searchMethod, setSearchMethod] = useState<string>('drugs');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [medicationsCart, setMedicationsCart] = useState<Medication[]>([]);
  const [showGuidance, setShowGuidance] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [frequencySearch, setFrequencySearch] = useState<string>('');
  const [routeSearch, setRouteSearch] = useState<string>('');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState<boolean>(false);
  const [showRouteDropdown, setShowRouteDropdown] = useState<boolean>(false);
  
  // Form validation state - only show errors when validation is triggered
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);
  
  // Auto-calculation state tracking
  const [autoCalculated, setAutoCalculated] = useState({
    endDate: false,
    quantity: false
  });

  const [formData, setFormData] = useState({
    drugName: '',
    dosage: '',
    itemPerDose: '',
    frequency: '',
    timePerUnit: '',
    frequencyUnit: '',
    duration: '',
    durationUnit: '',
    route: '',
    quantity: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isPasserBy: 'No',
    comments: '',
  });

  const searchResultsRef = useRef<HTMLDivElement>(null);
  const frequencyDropdownRef = useRef<HTMLDivElement>(null);
  const routeDropdownRef = useRef<HTMLDivElement>(null);

  // Enhanced frequency options with search
  const frequencyOptions = [
    // Original options maintained
    { value: "times", label: "Times" },
    { value: "doses", label: "Doses" },
    { value: "tablets", label: "Tablets" },
    // Enhanced medical frequency options
    { value: "stat", label: "Stat - 1 time only immediately" },
    { value: "qhs", label: "QHS- At Bed Time (1/1)" },
    { value: "nocturnal", label: "Nocturnal- At bed time-night (1/1)" },
    { value: "qam", label: "QAM- Each Morning (1/1)" },
    { value: "od", label: "OD- Once a day (1/1)" },
    { value: "bd", label: "BD- Twice a day (2/1)" },
    { value: "q12h", label: "Q12h - Every 12 Hours" },
    { value: "tds", label: "TDS- Three times a day" },
    { value: "qid", label: "QID- Four times a day" },
    { value: "prn", label: "PRN- Per Nurse requirement" },
    { value: "week", label: "Week" },
    { value: "every_3_months", label: "Once every 3 months" },
    { value: "every_2_months", label: "Once every 2 months" }
  ];

  // Enhanced route options with search
  const routeOptions = [
    { value: "per_oral", label: "Per-Oral (PO)" },
    { value: "sublingual", label: "Sublingual (SL)" },
    { value: "intramuscular", label: "Intramuscular (IM)" },
    { value: "intravascular", label: "Intravascular (IV)" },
    { value: "subcutaneous", label: "Subcutaneous (SQ)" },
    { value: "tropical", label: "Tropical" },
    { value: "rectal", label: "Rectal" },
    { value: "eye", label: "Eye" },
    { value: "ear", label: "Ear" },
    { value: "nose", label: "Nose" },
    { value: "inhalational", label: "Inhalational" },
    { value: "transdermal", label: "Transdermal" },
    { value: "interdermal", label: "Interdermal" },
    { value: "other", label: "Other" },
    { value: "vaginal", label: "Vaginal" },
    { value: "orally", label: "Orally" }
  ];

  // Filter options based on search
  const filteredFrequencyOptions = useMemo(() => {
    if (!frequencySearch) return frequencyOptions;
    return frequencyOptions.filter(option =>
      option.label.toLowerCase().includes(frequencySearch.toLowerCase()) ||
      option.value.toLowerCase().includes(frequencySearch.toLowerCase())
    );
  }, [frequencySearch]);

  const filteredRouteOptions = useMemo(() => {
    if (!routeSearch) return routeOptions;
    return routeOptions.filter(option =>
      option.label.toLowerCase().includes(routeSearch.toLowerCase()) ||
      option.value.toLowerCase().includes(routeSearch.toLowerCase())
    );
  }, [routeSearch]);

  // Form validation check
  const isFormComplete = useMemo(() => {
    const requiredFields = ['drugName', 'dosage', 'itemPerDose', 'frequency', 'route'];
    return requiredFields.every(field => formData[field]?.trim() !== '');
  }, [formData]);

  // Reset validation errors when form becomes complete
  useEffect(() => {
    if (isFormComplete) {
      setShowValidationErrors(false);
    }
  }, [isFormComplete]);

  // Auto-calculate end date when dependencies change
  useEffect(() => {
    if (!autoCalculated.endDate && formData.startDate && formData.duration && formData.durationUnit) {
      const calculatedEndDate = calculateEndDate(formData.startDate, formData.duration, formData.durationUnit);
      if (calculatedEndDate && calculatedEndDate !== formData.endDate) {
        setFormData(prev => ({
          ...prev,
          endDate: calculatedEndDate
        }));
        setAutoCalculated(prev => ({
          ...prev,
          endDate: true
        }));
      }
    }
  }, [formData.startDate, formData.duration, formData.durationUnit, autoCalculated.endDate]);

  // Auto-calculate quantity when dependencies change
  useEffect(() => {
    if (!autoCalculated.quantity && formData.itemPerDose && formData.frequency && formData.duration && formData.durationUnit) {
      const calculatedQuantity = calculateQuantity(formData.itemPerDose, formData.frequency, formData.duration, formData.durationUnit);
      if (calculatedQuantity && calculatedQuantity !== formData.quantity) {
        setFormData(prev => ({
          ...prev,
          quantity: calculatedQuantity
        }));
        setAutoCalculated(prev => ({
          ...prev,
          quantity: true
        }));
      }
    }
  }, [formData.itemPerDose, formData.frequency, formData.duration, formData.durationUnit, autoCalculated.quantity]);

  // Pre-populate form with intervention drug data
  useEffect(() => {
    if (prePopulatedDrug) {
      setFormData(prev => ({
        ...prev,
        drugName: prePopulatedDrug.name,
        dosage: prePopulatedDrug.dosage,
        itemPerDose: prePopulatedDrug.itemPerDose,
        frequency: prePopulatedDrug.frequency,
        timePerUnit: prePopulatedDrug.timePerUnit,
        frequencyUnit: prePopulatedDrug.frequencyUnit,
        durationUnit: prePopulatedDrug.durationUnit,
        route: prePopulatedDrug.route,
        comments: prePopulatedDrug.instructions || ''
      }));
      
      // Set category if provided
      if (prePopulatedDrug.category) {
        setDrugCategory(prePopulatedDrug.category);
      }
      
      // Reset auto-calculation flags to allow recalculation with new data
      setAutoCalculated({
        endDate: false,
        quantity: false
      });
    }
  }, [prePopulatedDrug]);

  // Patient search with fallback
  const mockPatients: Patient[] = [
    {
      id: 1,
      firstName: 'Sarah',
      surname: 'Mwanza',
      nrc: '123456/78/1',
      dateOfBirth: '1990-05-15',
      sex: 'Female',
      cellphone: '0977123456'
    },
    {
      id: 2,
      firstName: 'Grace',
      surname: 'Banda',
      nrc: '234567/89/2',
      dateOfBirth: '1988-03-22',
      sex: 'Female',
      cellphone: '0966234567'
    },
    {
      id: 3,
      firstName: 'Mary',
      surname: 'Phiri',
      nrc: '345678/90/3',
      dateOfBirth: '1992-07-10',
      sex: 'Female',
      cellphone: '0955345678'
    }
  ];

  const { data: apiPatients = [], error: patientError } = useQuery({
    queryKey: ['/api/patients', patientSearch],
    enabled: patientSearch.length > 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const patients = useMemo(() => {
    if (patientError || apiPatients.length === 0) {
      if (patientSearch.length < 2) return [];
      const term = patientSearch.toLowerCase();
      return mockPatients.filter(patient =>
        patient.firstName.toLowerCase().includes(term) ||
        patient.surname.toLowerCase().includes(term) ||
        patient.nrc.includes(term)
      );
    }
    return apiPatients;
  }, [apiPatients, patientError, patientSearch]);

  // Drug search using local data
  const filteredDrugs = useMemo(() => {
    if (searchTerm.length < 2) return [];
    
    const localMedications = searchMedications(searchTerm);
    return localMedications.map(med => ({
      id: med.id,
      name: med.name,
      dosage: med.strength.split(/\d+/)[1] || 'mg',
      unit: med.strength.replace(/[^0-9]/g, ''),
      category: med.category,
      stockLevel: med.stockLevel,
      unitCost: med.unitCost
    }));
  }, [searchTerm]);

  // Auto-calculation functions
  const calculateEndDate = (startDate: string, duration: string, durationUnit: string): string => {
    if (!startDate || !duration || !durationUnit) return '';
    
    const start = new Date(startDate);
    const durationNum = parseInt(duration);
    
    if (isNaN(durationNum) || durationNum <= 0) return '';
    
    const endDate = new Date(start);
    
    switch (durationUnit.toLowerCase()) {
      case 'days':
        endDate.setDate(start.getDate() + durationNum);
        break;
      case 'weeks':
        endDate.setDate(start.getDate() + (durationNum * 7));
        break;
      case 'months':
        endDate.setMonth(start.getMonth() + durationNum);
        break;
      case 'years':
        endDate.setFullYear(start.getFullYear() + durationNum);
        break;
      default:
        return '';
    }
    
    return endDate.toISOString().split('T')[0];
  };

  const calculateQuantity = (itemPerDose: string, frequency: string, duration: string, durationUnit: string): string => {
    if (!itemPerDose || !frequency || !duration || !durationUnit) return '';
    
    const itemsPerDose = parseFloat(itemPerDose);
    const frequencyNum = parseFloat(frequency);
    const durationNum = parseInt(duration);
    
    if (isNaN(itemsPerDose) || isNaN(frequencyNum) || isNaN(durationNum) || 
        itemsPerDose <= 0 || frequencyNum <= 0 || durationNum <= 0) return '';
    
    let totalDays = 0;
    
    switch (durationUnit.toLowerCase()) {
      case 'days':
        totalDays = durationNum;
        break;
      case 'weeks':
        totalDays = durationNum * 7;
        break;
      case 'months':
        totalDays = durationNum * 30; // Approximate
        break;
      case 'years':
        totalDays = durationNum * 365; // Approximate
        break;
      default:
        return '';
    }
    
    const totalQuantity = itemsPerDose * frequencyNum * totalDays;
    return Math.ceil(totalQuantity).toString();
  };

  const handleInputChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Mark field as manually entered (not auto-calculated)
    if (name === 'endDate' || name === 'quantity') {
      setAutoCalculated(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleSelectDrug = (drug: Drug): void => {
    const drugDisplayName = `${drug.name} ${drug.unit}${drug.dosage}`;
    handleInputChange('drugName', drugDisplayName);
    handleInputChange('dosage', `${drug.unit}${drug.dosage}`);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleSelectPatient = (patient: Patient): void => {
    setSelectedPatient(patient);
    setPatientSearch('');
  };

  const handleAddToCart = (): void => {
    console.log('Add to Cart clicked');
    console.log('Form Data:', formData);
    console.log('Is Form Complete:', isFormComplete);

    setIsLoading(true);

    try {
      // Check form completion
      if (!isFormComplete) {
        setShowValidationErrors(true);
        const missingFields = [];
        if (!formData.drugName?.trim()) missingFields.push('General Drug');
        if (!formData.dosage?.trim()) missingFields.push('Dosage');
        if (!formData.itemPerDose?.trim()) missingFields.push('Item Per Dose');
        if (!formData.frequency?.trim()) missingFields.push('Frequency');
        if (!formData.route?.trim()) missingFields.push('Route');
        
        console.log('Missing fields:', missingFields);
        alert(`Please complete the following required fields: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
      }

      const newMedication: Medication = {
        id: Date.now(),
        ...formData,
      };

      console.log('Adding medication to cart:', newMedication);
      setMedicationsCart((prev) => {
        const updated = [...prev, newMedication];
        console.log('Updated cart:', updated);
        return updated;
      });

      // Show success message
      alert('Medication added to cart successfully!');

      // Reset form and validation errors
      setFormData((prev) => ({
        ...prev,
        drugName: '',
        dosage: '',
        itemPerDose: '',
        frequency: '',
        timePerUnit: '',
        frequencyUnit: '',
        duration: '',
        durationUnit: '',
        route: '',
        quantity: '',
        endDate: '',
        comments: '',
      }));
      setShowValidationErrors(false);
      setAutoCalculated({
        endDate: false,
        quantity: false
      });
      
      console.log('Form reset completed');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding medication to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = (id: number): void => {
    setMedicationsCart((prev) => prev.filter((med) => med.id !== id));
  };

  const handleSavePrescription = async (): Promise<void> => {
    console.log('Save Prescription clicked');
    console.log('Medications Cart:', medicationsCart);

    if (medicationsCart.length === 0) {
      alert('Please add at least one medication to the cart');
      return;
    }

    setIsLoading(true);

    try {
      // Import mock service dynamically
      const { mockPharmacyService } = await import('../../services/mockPharmacyService');
      
      // Use default patient for now
      const prescriptionData = {
        patientId: 1,
        patientName: 'Default Patient',
        medications: medicationsCart,
        prescribedBy: 'Current User',
      };

      console.log('Saving prescription:', prescriptionData);
      const savedPrescription = mockPharmacyService.savePrescription(prescriptionData);
      console.log('Prescription saved:', savedPrescription);

      alert(`Prescription saved successfully! Number: ${savedPrescription.prescriptionNumber}`);
      setMedicationsCart([]);
      setShowValidationErrors(false);

      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (frequencyDropdownRef.current && !frequencyDropdownRef.current.contains(event.target as Node)) {
        setShowFrequencyDropdown(false);
      }
      if (routeDropdownRef.current && !routeDropdownRef.current.contains(event.target as Node)) {
        setShowRouteDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pharmacy Prescription</h2>
          <button className="text-gray-400 hover:text-gray-600" onClick={handleClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Search & Add Medication */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Search & Add Medication</h3>

              {/* Clinical Guidance */}
              <div>
                <button
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                  onClick={() => setShowGuidance(!showGuidance)}
                >
                  <span className="text-gray-700">Clinical Guidance</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showGuidance ? 'rotate-180' : ''}`} />
                </button>
                {showGuidance && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Follow clinical guidelines when prescribing medications. Ensure proper dosing,
                      drug interactions, and patient safety considerations.
                    </p>
                  </div>
                )}
              </div>

              {/* Drug Categories */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    drugCategory === 'general'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setDrugCategory('general')}
                >
                  General Drugs
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium border-l border-gray-300 ${
                    drugCategory === 'arv' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setDrugCategory('arv')}
                >
                  ARVs & ATT drugs
                </button>
              </div>

              {/* Search Methods */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium ${
                    searchMethod === 'drugs' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSearchMethod('drugs')}
                >
                  Search by Drugs
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium border-l border-gray-300 ${
                    searchMethod === 'physical'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSearchMethod('physical')}
                >
                  Search by Physical Systems
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium border-l border-gray-300 ${
                    searchMethod === 'utility'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSearchMethod('utility')}
                >
                  Search by Utility
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-xs font-medium border-l border-gray-300 ${
                    searchMethod === 'classes'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSearchMethod('classes')}
                >
                  Search by Classes
                </button>
              </div>

              {/* Search and Select Drug */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Search and Select Drug</Label>
                <div className="relative mt-1">
                  <Input
                    placeholder="Type to search medications..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowResults(e.target.value.length >= 2);
                    }}
                    onFocus={() => {
                      if (searchTerm.length >= 2) setShowResults(true);
                    }}
                    className="w-full"
                  />

                  {showResults && searchTerm.length >= 2 && (
                    <div
                      ref={searchResultsRef}
                      className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200"
                    >
                      {filteredDrugs.length > 0 ? (
                        filteredDrugs.map((drug) => (
                          <div
                            key={drug.id}
                            className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleSelectDrug(drug)}
                          >
                            <div className="font-medium">{drug.name}</div>
                            <div className="text-xs text-gray-500">
                              {drug.unit}{drug.dosage} - {drug.category}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No drugs found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-4">
                {/* General Drug */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    General Drug <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter General Drug"
                    value={formData.drugName}
                    onChange={(e) => handleInputChange('drugName', e.target.value)}
                    className="mt-1"
                  />
                  {showValidationErrors && !formData.drugName?.trim() && (
                    <p className="text-xs text-red-500 mt-1">This field is required</p>
                  )}
                </div>

                {/* Dosage */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Dosage <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Dosage"
                    value={formData.dosage}
                    onChange={(e) => handleInputChange('dosage', e.target.value)}
                    className="mt-1"
                  />
                  {showValidationErrors && !formData.dosage?.trim() && (
                    <p className="text-xs text-red-500 mt-1">This field is required</p>
                  )}
                </div>

                {/* Item Per Dose */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Item Per Dose <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Item Per Dose"
                    value={formData.itemPerDose}
                    onChange={(e) => handleInputChange('itemPerDose', e.target.value)}
                    className="mt-1"
                  />
                  {showValidationErrors && !formData.itemPerDose?.trim() && (
                    <p className="text-xs text-red-500 mt-1">This field is required</p>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Frequency <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Frequency"
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="mt-1"
                  />
                  {showValidationErrors && !formData.frequency?.trim() && (
                    <p className="text-xs text-red-500 mt-1">This field is required</p>
                  )}
                </div>

                {/* Time Per (Time Unit) */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Time Per (Time Unit) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.timePerUnit}
                    onValueChange={(value) => handleInputChange('timePerUnit', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency Unit */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Frequency Unit (If not Time unit) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <div className="flex">
                      <Input
                        placeholder="Search frequency unit..."
                        value={frequencySearch}
                        onChange={(e) => setFrequencySearch(e.target.value)}
                        onFocus={() => setShowFrequencyDropdown(true)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-2 px-3"
                        onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {showFrequencyDropdown && (
                      <div
                        ref={frequencyDropdownRef}
                        className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200"
                      >
                        {filteredFrequencyOptions.length > 0 ? (
                          filteredFrequencyOptions.map((option) => (
                            <div
                              key={option.value}
                              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                              onClick={() => {
                                handleInputChange('frequencyUnit', option.value);
                                setFrequencySearch(option.label);
                                setShowFrequencyDropdown(false);
                              }}
                            >
                              {option.label}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">No frequency units found</div>
                        )}
                      </div>
                    )}
                    
                    {formData.frequencyUnit && (
                      <div className="mt-1 text-xs text-gray-600">
                        Selected: {frequencyOptions.find(opt => opt.value === formData.frequencyUnit)?.label}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Duration Unit */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Duration Unit</Label>
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value) => handleInputChange('durationUnit', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Route */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Route <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <div className="flex">
                      <Input
                        placeholder="Search route..."
                        value={routeSearch}
                        onChange={(e) => setRouteSearch(e.target.value)}
                        onFocus={() => setShowRouteDropdown(true)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-2 px-3"
                        onClick={() => setShowRouteDropdown(!showRouteDropdown)}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {showRouteDropdown && (
                      <div
                        ref={routeDropdownRef}
                        className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200"
                      >
                        {filteredRouteOptions.length > 0 ? (
                          filteredRouteOptions.map((option) => (
                            <div
                              key={option.value}
                              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                              onClick={() => {
                                handleInputChange('route', option.value);
                                setRouteSearch(option.label);
                                setShowRouteDropdown(false);
                              }}
                            >
                              {option.label}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">No routes found</div>
                        )}
                      </div>
                    )}
                    
                    {formData.route && (
                      <div className="mt-1 text-xs text-gray-600">
                        Selected: {routeOptions.find(opt => opt.value === formData.route)?.label}
                      </div>
                    )}
                    
                    {showValidationErrors && !formData.route?.trim() && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                    {autoCalculated.endDate && (
                      <span className="text-xs text-green-600 ml-2" title="Auto-calculated">
                        (calculated)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`mt-1 ${autoCalculated.endDate ? 'bg-green-50 border-green-200' : ''}`}
                    title={autoCalculated.endDate ? 'Auto-calculated based on start date and duration' : 'Enter end date manually'}
                  />
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Quantity
                    {autoCalculated.quantity && (
                      <span className="text-xs text-green-600 ml-2" title="Auto-calculated">
                        (calculated)
                      </span>
                    )}
                  </Label>
                  <Input
                    placeholder="Enter Quantity"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className={`mt-1 ${autoCalculated.quantity ? 'bg-green-50 border-green-200' : ''}`}
                    title={autoCalculated.quantity ? 'Auto-calculated based on dosage, frequency, and duration' : 'Enter quantity manually'}
                  />
                </div>

                {/* Is Passer By */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Is Passer By</Label>
                  <Select value={formData.isPasserBy} onValueChange={(value) => handleInputChange('isPasserBy', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Comments */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Comments</Label>
                  <Textarea
                    placeholder="Enter Comments"
                    value={formData.comments}
                    onChange={(e) => handleInputChange('comments', e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleAddToCart}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-md"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            </div>

            {/* Right Side - Medication Cart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Medication Cart</h3>

              {medicationsCart.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2">No medications added</div>
                    <p>Cart items will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicationsCart.map((medication) => (
                    <div key={medication.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Drug Name:</span> {medication.drugName}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Dosage:</span> {medication.dosage}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Item Per Dose:</span> {medication.itemPerDose}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Frequency:</span> {medication.frequency}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Duration:</span> {medication.duration} {medication.durationUnit}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Route:</span> {medication.route}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Quantity:</span> {medication.quantity}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Start Date:</span> {medication.startDate}
                        </div>
                        {medication.comments && (
                          <div>
                            <span className="font-medium text-gray-700">Comments:</span> {medication.comments}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                          onClick={() => handleRemoveFromCart(medication.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" className="px-6 bg-transparent" onClick={handleClose}>
                      Close
                    </Button>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                      onClick={handleSavePrescription}
                      disabled={isLoading || medicationsCart.length === 0}
                    >
                      {isLoading ? 'Saving...' : 'Save Prescription'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyPrescriptionEnhanced;