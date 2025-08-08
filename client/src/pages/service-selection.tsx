import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { 
  Stethoscope, Heart, Ribbon, Syringe, Pill, Thermometer, Activity, 
  FlaskConical, Microscope, UserRound, Bed, FileText, Clipboard, 
  BookOpen, Tablets, UserPlus, Baby, Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInYears } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

export default function ServiceSelection() {
  const [location, setLocation] = useLocation();
  
  // Extract patientId from URL query parameters
  const queryString = location.split("?")[1];
  const urlParams = new URLSearchParams(queryString || '');
  const patientId = urlParams.get('patientId');
  
  console.log('Service Selection - Location:', location);
  console.log('Service Selection - Query String:', queryString);
  console.log('Service Selection - Patient ID:', patientId);
  
  // Fetch patient data from API
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['/api/patients', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }
      const data = await response.json();
      console.log('Patient data fetched:', data);
      return data;
    },
    enabled: !!patientId
  });

  // Services organized by rows to match the screenshot layout
  const serviceRows = [
    [
      { id: 'opd', name: 'Me (OPD)', icon: <Stethoscope className="w-10 h-10 text-sky-400" /> },
      { id: 'vital', name: 'Vital', icon: <Heart className="w-10 h-10 text-sky-400" /> },
      { id: 'hts', name: 'HTS', icon: <Ribbon className="w-10 h-10 text-sky-400" /> },
      { id: 'pep', name: 'PEP', icon: <Pill className="w-10 h-10 text-sky-400" /> },
      { id: 'prep', name: 'PrEP', icon: <Pill className="w-10 h-10 text-sky-400" /> },
      { id: 'tb', name: 'TB Service', icon: <Thermometer className="w-10 h-10 text-sky-400" /> },
      { id: 'pain', name: 'Pain Scaling', icon: <Activity className="w-10 h-10 text-sky-400" /> }
    ],
    [
      { id: 'vmmc', name: 'VMMC Service', icon: <UserRound className="w-10 h-10 text-sky-400" /> },
      { id: 'meibd', name: 'ME(IPD)', icon: <Bed className="w-10 h-10 text-sky-400" /> },
      { id: 'nursing', name: 'Nursing Care', icon: <UserPlus className="w-10 h-10 text-sky-400" /> },
      { id: 'investigation', name: 'Investigation', icon: <Microscope className="w-10 h-10 text-sky-400" /> },
      { id: 'surgery', name: 'Surgery', icon: <Thermometer className="w-10 h-10 text-sky-400" /> },
      { id: 'referrals', name: 'Referrals', icon: <FileText className="w-10 h-10 text-sky-400" /> },
      { id: 'vaccinations', name: 'Vaccinations', icon: <Syringe className="w-10 h-10 text-sky-400" /> }
    ],
    [
      { id: 'covid', name: 'Covid', icon: <Shield className="w-10 h-10 text-sky-400" /> },
      { id: 'birth', name: 'Birth Records', icon: <BookOpen className="w-10 h-10 text-sky-400" /> },
      { id: 'art', name: 'ART Adult', icon: <Clipboard className="w-10 h-10 text-sky-400" /> },
      { id: 'death', name: 'Death Record', icon: <FileText className="w-10 h-10 text-sky-400" /> },
      { id: 'pharmacy', name: 'Pharmacy', icon: <Tablets className="w-10 h-10 text-sky-400" /> },
      { id: 'family', name: 'Family Plan', icon: <UserPlus className="w-10 h-10 text-sky-400" /> },
      { id: 'obv', name: 'OBV', icon: <Baby className="w-10 h-10 text-sky-400" /> }
    ],
    [
      { id: 'anc', name: 'ANC', icon: <Baby className="w-10 h-10 text-sky-400" /> },
      { id: 'pnc', name: 'PNC', icon: <Baby className="w-10 h-10 text-sky-400" /> },
      { id: 'lab', name: 'Laboratory', icon: <FlaskConical className="w-10 h-10 text-sky-400" /> },
      { id: 'nutrition', name: 'Nutrition', icon: <Activity className="w-10 h-10 text-sky-400" /> },
      { id: 'mental', name: 'Mental Health', icon: <Heart className="w-10 h-10 text-sky-400" /> },
      { id: 'eye', name: 'Eye Care', icon: <Activity className="w-10 h-10 text-sky-400" /> },
      { id: 'dental', name: 'Dental', icon: <Activity className="w-10 h-10 text-sky-400" /> }
    ]
  ];

  return (
    <MainLayout>
      <div className="w-full bg-blue-50 border-b border-blue-100 mb-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-red-500 text-center py-2 font-medium">Prototype Portal</h2>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4">
        <div className="space-y-6">
          {isLoading ? (
            <div className="border rounded p-4 flex justify-center items-center min-h-[100px]">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="border rounded p-4 bg-red-50 text-red-600">
              <p>Failed to load patient information. Please try again.</p>
            </div>
          ) : !patient ? (
            <div className="border rounded p-4 bg-yellow-50 text-yellow-600">
              <p>No patient information available. Please return to patient search.</p>
            </div>
          ) : (
            /* Patient information bar */
            <div className="border rounded p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{patient.firstName} {patient.surname}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-sm">
                      {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd-MMM-yyyy') : 'Unknown'} 
                      {patient.dateOfBirth && ` (${differenceInYears(new Date(), new Date(patient.dateOfBirth))}Y)`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Sex</p>
                    <p className="text-sm">{patient.sex || 'Unknown'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Cellphone</p>
                    <p className="text-sm">{patient.cellphoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">NUPN</p>
                    <p className="text-sm">{patient.nupin || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">NRC</p>
                    <p className="text-sm">{patient.nrc || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Mother's Name</p>
                    <p className="text-sm">{patient.mothersName || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setLocation('/client-search')}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
              Back to Patient Search
            </button>
            <h2 className="text-xl font-semibold text-center">Select Service for the Patient</h2>
            <div className="w-[160px]"></div> {/* Spacer div to center the heading */}
          </div>

          <div className="space-y-6">
            {serviceRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {row.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-md p-4 flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
                    onClick={() => {
                      if (!patient) {
                        // Show an error toast or message
                        console.log("No patient selected");
                        return;
                      }
                      
                      const patientParam = `?patientId=${patient.id}`;
                      
                      if (service.id === 'art') {
                        console.log(`Navigating to ART service with patient ID: ${patient.id}`);
                        setLocation(`/art${patientParam}`);
                      } else if (service.id === 'prep') {
                        console.log(`Navigating to PrEP service with patient ID: ${patient.id}`);
                        setLocation(`/prep${patientParam}`);
                      } else if (service.id === 'anc') {
                        console.log(`Navigating to ANC service with patient ID: ${patient.id}`);
                        setLocation(`/anc${patientParam}`);
                      } else if (service.id === 'vital') {
                        console.log(`Navigating to Vitals service with patient ID: ${patient.id}`);
                        setLocation(`/vitals${patientParam}`);
                      } else if (service.id === 'hts') {
                        console.log(`Navigating to HTS service with patient ID: ${patient.id}`);
                        setLocation(`/hts${patientParam}`);
                      } else {
                        console.log(`Navigating to ${service.name} service with patient ID: ${patient.id}`);
                        setLocation(`/medical-records/${service.id}${patientParam}`);
                      }
                    }}
                  >
                    {service.icon}
                    <span className="mt-2 text-sm text-center">{service.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </MainLayout>
  );
}