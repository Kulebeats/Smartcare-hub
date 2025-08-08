import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Pill, Plus } from 'lucide-react';
import { searchMedications } from '@/data/anc-medications';

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

interface MedicationSearchSectionProps {
  onMedicationAdd: (medication: Medication) => void;
}

export default function MedicationSearchSection({ onMedicationAdd }: MedicationSearchSectionProps) {
  const [medicationSearch, setMedicationSearch] = useState('');

  // Use local medication search for instant results
  const medications = useMemo(() => {
    return searchMedications(medicationSearch);
  }, [medicationSearch]);

  const medicationsLoading = false; // No loading state for local search

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="medication-search">Search Medication</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="medication-search"
            placeholder="Search medications..."
            value={medicationSearch}
            onChange={(e) => setMedicationSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Medication Search Results */}
      {medicationSearch.length > 2 && (
        <div className="space-y-2">
          {medicationsLoading ? (
            <div className="text-center py-4 text-gray-500">Searching medications...</div>
          ) : medications.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No medications found</div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {medications.map((medication: Medication) => (
                <div key={medication.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-gray-600">{medication.strength} • {medication.dosageForm}</div>
                      <div className="text-xs text-gray-500">Stock: {medication.stockLevel}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onMedicationAdd(medication)}
                    disabled={medication.stockLevel === 0}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}