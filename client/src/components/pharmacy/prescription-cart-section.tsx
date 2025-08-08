import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Pill } from 'lucide-react';

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

interface PrescriptionItem {
  medicationId: number;
  medication?: Medication;
  quantity: number;
  dosage: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionCartSectionProps {
  items: PrescriptionItem[];
  onUpdateItem: (index: number, field: keyof PrescriptionItem, value: any) => void;
  onRemoveItem: (index: number) => void;
}

export default function PrescriptionCartSection({ items, onUpdateItem, onRemoveItem }: PrescriptionCartSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.medication?.unitCost || 0) * item.quantity;
    }, 0);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescription Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No medications added yet. Search and add medications above.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescription Cart ({items.length} items)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{item.medication?.name}</div>
                    <div className="text-sm text-gray-600">{item.medication?.strength} • {item.medication?.dosageForm}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                  <Input
                    id={`dosage-${index}`}
                    placeholder="e.g., 500mg"
                    value={item.dosage}
                    onChange={(e) => onUpdateItem(index, 'dosage', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`duration-${index}`}>Duration</Label>
                  <Input
                    id={`duration-${index}`}
                    placeholder="e.g., 7 days"
                    value={item.duration}
                    onChange={(e) => onUpdateItem(index, 'duration', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`cost-${index}`}>Cost</Label>
                  <div className="text-sm font-medium pt-2">
                    {formatCurrency((item.medication?.unitCost || 0) * item.quantity)}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <Label htmlFor={`instructions-${index}`}>Special Instructions</Label>
                <Input
                  id={`instructions-${index}`}
                  placeholder="Additional instructions"
                  value={item.instructions || ''}
                  onChange={(e) => onUpdateItem(index, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="font-medium">Total Cost:</div>
            <div className="text-lg font-bold">{formatCurrency(calculateTotal())}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}