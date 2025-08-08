import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Calendar, IdCard, FileText, Activity } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
  age: number;
  sex: string;
  cellphone: string;
  nupn: string;
  nrc: string;
  mothersName: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  insurance?: string;
  lastVisit?: string;
  doctor?: string;
}

interface ClientDetailsCardProps {
  patient?: Patient;
  onEdit?: () => void;
  onViewHistory?: () => void;
}

const ClientDetailsCard: React.FC<ClientDetailsCardProps> = ({ 
  patient, 
  onEdit, 
  onViewHistory 
}) => {
  // Default patient data for development
  const defaultPatient: Patient = {
    id: 1001,
    name: "JANE DOE",
    dateOfBirth: "6-Apr-1995 (30Y)",
    age: 30,
    sex: "Female",
    cellphone: "+260 0777777777",
    nupn: "8006-0014P-61326-8",
    nrc: "111111/11/1",
    mothersName: "USA",
    address: "Lusaka, Zambia",
    emergencyContact: "+260 0999999999",
    allergies: "None known",
    insurance: "NHIMA",
    lastVisit: "2025-01-10",
    doctor: "Dr. John Mwanza"
  };

  const currentPatient = patient || defaultPatient;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-[#0072BC] flex items-center gap-2">
            <User className="w-5 h-5" />
            {currentPatient.name}
          </CardTitle>
          <div className="flex gap-2">
            {onViewHistory && (
              <Button size="sm" variant="outline" onClick={onViewHistory}>
                <FileText className="w-4 h-4 mr-2" />
                View History
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="default" onClick={onEdit} className="bg-[#00A651] hover:bg-[#008541]">
                <Activity className="w-4 h-4 mr-2" />
                Actions
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0072BC]" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Date of Birth</p>
              <p className="text-sm">{currentPatient.dateOfBirth}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#0072BC]" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Sex</p>
              <p className="text-sm">{currentPatient.sex}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#0072BC]" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Cellphone</p>
              <p className="text-sm">{currentPatient.cellphone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <IdCard className="w-4 h-4 text-[#0072BC]" />
            <div>
              <p className="text-sm text-gray-600 font-medium">NUPN</p>
              <p className="text-sm">{currentPatient.nupn}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <IdCard className="w-4 h-4 text-[#0072BC]" />
            <div>
              <p className="text-sm text-gray-600 font-medium">NRC</p>
              <p className="text-sm">{currentPatient.nrc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#0072BC]" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Mother's Name</p>
              <p className="text-sm">{currentPatient.mothersName}</p>
            </div>
          </div>
          
          {currentPatient.address && (
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-[#0072BC]" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Address</p>
                <p className="text-sm">{currentPatient.address}</p>
              </div>
            </div>
          )}
          
          {currentPatient.allergies && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0072BC]" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Allergies</p>
                <p className="text-sm">{currentPatient.allergies}</p>
              </div>
            </div>
          )}
          
          {currentPatient.doctor && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#0072BC]" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Doctor</p>
                <p className="text-sm">{currentPatient.doctor}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetailsCard;