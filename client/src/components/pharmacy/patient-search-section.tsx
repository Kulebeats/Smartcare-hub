import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Patient {
  id: number;
  firstName: string;
  surname: string;
  nrc: string;
  dateOfBirth: string;
  sex: 'Male' | 'Female';
  cellphone?: string;
}

interface PatientSearchSectionProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient) => void;
}

// Mock patient data as fallback for development
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
  },
  {
    id: 4,
    firstName: 'Jane',
    surname: 'Tembo',
    nrc: '456789/01/4',
    dateOfBirth: '1985-11-30',
    sex: 'Female',
    cellphone: '0977456789'
  }
];

export default function PatientSearchSection({ selectedPatient, onPatientSelect }: PatientSearchSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Try API first, fallback to mock data
  const { data: apiPatients = [], isLoading: patientsLoading, error } = useQuery({
    queryKey: ['/api/patients', searchTerm],
    enabled: searchTerm.length > 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once to avoid delays
  });

  // Use API data if available, otherwise use filtered mock data
  const patients = useMemo(() => {
    if (error || apiPatients.length === 0) {
      // Use local mock data as fallback
      if (searchTerm.length < 2) return [];
      const term = searchTerm.toLowerCase();
      return mockPatients.filter(patient =>
        patient.firstName.toLowerCase().includes(term) ||
        patient.surname.toLowerCase().includes(term) ||
        patient.nrc.includes(term) ||
        patient.cellphone?.includes(term)
      );
    }
    return apiPatients;
  }, [apiPatients, error, searchTerm]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patient-search">Search Patient</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="patient-search"
            placeholder="Search by name, NRC, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Selected Patient Display */}
      {selectedPatient && (
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">{selectedPatient.firstName} {selectedPatient.surname}</div>
              <div className="text-sm text-gray-600">NRC: {selectedPatient.nrc}</div>
              <div className="text-sm text-gray-600">
                {selectedPatient.sex} • {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchTerm.length > 2 && (
        <div className="space-y-2">
          {patientsLoading ? (
            <div className="text-center py-4 text-gray-500">Searching patients...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No patients found</div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {patients.map((patient: Patient) => (
                <Button
                  key={patient.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => onPatientSelect(patient)}
                >
                  <div className="text-left">
                    <div className="font-medium">{patient.firstName} {patient.surname}</div>
                    <div className="text-sm text-gray-600">NRC: {patient.nrc}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}