import React from 'react';
// Assuming Button component is defined elsewhere.  Placeholder for simplicity:
const Button = ({ variant, size, children, className }) => (
  <button className={`px-2 py-1 ${variant === 'outline' ? 'border border-gray-400' : 'bg-gray-200 hover:bg-gray-300'} ${size === 'sm' ? 'text-sm' : 'text-base'} ${className}`}>
    {children}
  </button>
);

const ServiceSelection = () => {
  return (
    <div>
      <div className="flex border-b mb-4">
        <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-500 font-medium">Complaints & Histories</button>
        <button className="px-4 py-2 text-gray-500">Examination & Diagnosis</button>
        <button className="px-4 py-2 text-gray-500">Plan</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Presenting Complaints</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">TB Constitutional Symptoms</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Review of Systems</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Past Medical History</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Past TB History</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">TPT History</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Chronic / Non Chronic Conditions</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Allergies</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Previous ART Exposure</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium">Pharmacovigilance</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <span className="mr-1">✏️</span> Edit Record
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 flex items-center">
              <span className="mr-1">➕</span> Add Record
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileEdit, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, Link, useLocation } from 'wouter';

export function ServiceSelection() {
  // Extract the params from the URL
  const { serviceId } = useParams();
  const [, navigate] = useLocation();

  // List of available services
  const services = [
    { id: 'art', name: 'ART Service' },
    { id: 'prep', name: 'PrEP Service' },
    { id: 'pep', name: 'PEP Service' },
    { id: 'anc', name: 'ANC Service' },
    { id: 'maternity', name: 'Maternity Service' },
    { id: 'child', name: 'Child/Under Five Services' },
    { id: 'vmmc', name: 'VMMC' },
    { id: 'non-communicable', name: 'Non-Communicable Disease' },
    { id: 'tb', name: 'TB Services' },
    { id: 'nutrition', name: 'Nutrition Assessment' },
    { id: 'mental-health', name: 'Mental Health' },
  ];

  // Handler for selecting a service
  const handleSelectService = (service: string) => {
    navigate(`/medical-records/${service}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Select a Service</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <Card 
            key={service.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              service.id === serviceId ? 'border-blue-500' : ''
            }`}
            onClick={() => handleSelectService(service.id)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{service.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="flex justify-end">
                <Button variant="ghost" className="text-blue-500">
                  <ArrowRight className="mr-2 h-4 w-4" /> Select
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}