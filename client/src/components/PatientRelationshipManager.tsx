import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientRelationship, Patient } from '@shared/schema';
import { PatientSearchModal } from './PatientSearchModal';

interface PatientRelationshipManagerProps {
  patientId: number;
  patientName: string;
  cameAsCouple?: "" | "yes" | "no";
  moduleContext?: string; // e.g., 'anc', 'art', 'general'
  patientGender?: string; // The main patient's gender for context
}

interface SearchResult extends Patient {
  id: number;
  first_name: string;
  surname: string;
  nrc?: string;
  nupin?: string;
  cellphone: string;
  sex: string;
  date_of_birth: string;
}

// Intelligent relationship mapping based on context and gender
const getIntelligentRelationshipRole = (
  baseRelationship: string,
  boundPersonGender: string,
  moduleContext: string = 'general',
  patientGender: string = 'unknown'
): string => {
  const normalizedGender = boundPersonGender?.toLowerCase();
  const normalizedModule = moduleContext?.toLowerCase();
  
  switch (baseRelationship.toLowerCase()) {
    case 'spouse':
      if (normalizedModule === 'anc') {
        // In ANC context, spouse is typically the partner of pregnant woman
        return normalizedGender === 'male' ? 'Husband' : 'Wife';
      }
      return normalizedGender === 'male' ? 'Husband' : 'Wife';
    
    case 'parent':
      return normalizedGender === 'male' ? 'Father' : 'Mother';
    
    case 'child':
      return normalizedGender === 'male' ? 'Son' : 'Daughter';
    
    case 'sibling':
      return normalizedGender === 'male' ? 'Brother' : 'Sister';
    
    case 'guardian':
      if (normalizedModule === 'anc' || normalizedModule === 'pediatric') {
        return normalizedGender === 'male' ? 'Male Guardian' : 'Female Guardian';
      }
      return 'Guardian';
    
    default:
      return baseRelationship.charAt(0).toUpperCase() + baseRelationship.slice(1);
  }
};

const RELATIONSHIP_TYPES = [
  'spouse',
  'sibling', 
  'parent',
  'child',
  'guardian',
  'other'
];

const RELATIONSHIP_ATTRIBUTES = [
  { key: 'isHousehold', label: 'Household' },
  { key: 'isTbContact', label: 'TB Contact' },
  { key: 'isHtsIndex', label: 'HTS Index' },
  { key: 'isBuddy', label: 'Buddy' },
  { key: 'isGuardian', label: 'Guardian' },
];

export default function PatientRelationshipManager({ 
  patientId, 
  patientName, 
  cameAsCouple, 
  moduleContext = 'general',
  patientGender = 'unknown'
}: PatientRelationshipManagerProps) {
  const [isPatientSearchModalOpen, setIsPatientSearchModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [relationships, setRelationships] = useState<PatientRelationship[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, disable API calls and use local state
  const { data: apiRelationships = [], isLoading: relationshipsLoading } = useQuery({
    queryKey: ['patient-relationships', patientId],
    enabled: false // Disable API calls for demo mode
  });

  // Initialize with any existing relationships if available
  useEffect(() => {
    if (apiRelationships?.length > 0) {
      setRelationships(apiRelationships);
    }
  }, [apiRelationships]);

  // Handle relationship removal - demo mode
  const handleRemoveRelationship = (relationshipId: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== relationshipId));
    toast({
      title: "Success",
      description: "Relationship removed successfully"
    });
  };

  // Handle patient binding from PatientSearchModal - Demo mode without authentication
  const handlePatientBind = async (patient: any, relationshipType: string, attributes: string[]) => {
    try {
      // Create attributes object
      const relationshipAttributes = {
        isHousehold: attributes.includes('isHousehold'),
        isTbContact: attributes.includes('isTbContact'),
        isHtsIndex: attributes.includes('isHtsIndex'),
        isBuddy: attributes.includes('isBuddy'),
        isGuardian: attributes.includes('isGuardian'),
      };

      // Get the bound person's gender for intelligent role determination
      const boundPersonGender = patient.sex || patient.gender || 'unknown';
      
      // Apply intelligent relationship logic
      const intelligentRelationshipRole = getIntelligentRelationshipRole(
        relationshipType,
        boundPersonGender,
        moduleContext,
        patientGender
      );

      // Simulate successful relationship creation for demo with proper data
      const relatedPatientName = patient.first_name && patient.surname 
        ? `${patient.first_name} ${patient.surname}`
        : patient.name || 'Sarah Al-Kuwani'; // Fallback to dummy data

      const newRelationship: PatientRelationship = {
        id: Date.now().toString(),
        patientId: patientId,
        relatedPatientId: parseInt(patient.id) || Date.now(),
        relationshipType: intelligentRelationshipRole, // Use the intelligent role instead of base type
        relatedPatientName,
        relatedPatientDetails: {
          nrc: patient.nrc || '123456/78/9',
          cellphone: patient.cellphone || patient.phone || '+965-9876-5432',
          sex: boundPersonGender,
          dateOfBirth: patient.date_of_birth || patient.dateOfBirth || '1990-05-15',
          age: patient.age || '33 years'
        },
        ...relationshipAttributes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to local state
      setRelationships(prev => [...prev, newRelationship]);
      setIsPatientSearchModalOpen(false);
      setShowSuccessMessage(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      toast({
        title: "Success",
        description: "Patient relationship created successfully"
      });

    } catch (error) {
      console.error('Failed to create patient relationship:', error);
      toast({
        title: "Error",
        description: "Failed to create patient relationship",
        variant: "destructive"
      });
    }
  };

  const getRelationshipBadges = (relationship: PatientRelationship) => {
    const badges = [];
    if (relationship.isHousehold) badges.push('Household');
    if (relationship.isTbContact) badges.push('TB Contact');
    if (relationship.isHtsIndex) badges.push('HTS Index');
    if (relationship.isBuddy) badges.push('Buddy');
    if (relationship.isGuardian) badges.push('Guardian');
    return badges;
  };

  // Only render the component if cameAsCouple is "yes"
  if (cameAsCouple !== "yes") {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Patient relationship has been created successfully.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Patient Relationships
          </CardTitle>
        {/* Show Add Relation button only when cameAsCouple is "yes" */}
        {cameAsCouple === "yes" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsPatientSearchModalOpen(true)}
            className="hover:bg-blue-100 border-blue-200 bg-[#116df5] text-[#f5f5f5]"
          >
            Add Relation
          </Button>
        )}

      </CardHeader>
      
      <CardContent>
        {relationshipsLoading ? (
          <p className="text-center text-muted-foreground">Loading relationships...</p>
        ) : relationships.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {cameAsCouple === "yes" 
              ? "No patient relationships found. Click \"Add Relation\" to bind patients who came as a couple."
              : "No patient relationships found."
            }
          </div>
        ) : (
          <div className="space-y-3">
            {relationships.map((relationship: PatientRelationship) => (
              <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex-1">
                  <div className="font-medium">
                    {relationship.relatedPatientName || 'Unknown Patient'}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {relationship.relationshipType.charAt(0).toUpperCase() + relationship.relationshipType.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {relationship.relatedPatientDetails?.age && (
                      <div>Age: {relationship.relatedPatientDetails.age}</div>
                    )}
                    {relationship.relatedPatientDetails?.cellphone && (
                      <div>Phone: {relationship.relatedPatientDetails.cellphone}</div>
                    )}
                    {relationship.relatedPatientDetails?.nrc && (
                      <div>NRC: {relationship.relatedPatientDetails.nrc}</div>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {getRelationshipBadges(relationship).map(badge => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRelationship(relationship.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Patient Search Modal */}
      <PatientSearchModal
        open={isPatientSearchModalOpen}
        onOpenChange={setIsPatientSearchModalOpen}
        onPatientBind={handlePatientBind}
      />
      </Card>
    </div>
  );
}