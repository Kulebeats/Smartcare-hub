import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Stethoscope, Heart, Ribbon, Syringe, Pill, Thermometer, Activity, FlaskConical } from "lucide-react";

export default function ServiceSelection() {
  const [, setLocation] = useLocation();

  const services = [
    { id: 'opd', name: 'Me (OPD)', icon: <Stethoscope className="w-8 h-8 text-blue-500" /> },
    { id: 'vital', name: 'Vital', icon: <Heart className="w-8 h-8 text-red-500" /> },
    { id: 'hts', name: 'HTS', icon: <Ribbon className="w-8 h-8 text-blue-500" /> },
    { id: 'art', name: 'ART', icon: <Syringe className="w-8 h-8 text-purple-500" /> },
    { id: 'prep', name: 'PrEP', icon: <Pill className="w-8 h-8 text-green-500" /> },
    { id: 'tb', name: 'TB Service', icon: <Thermometer className="w-8 h-8 text-orange-500" /> },
    { id: 'pain', name: 'Pain Scaling', icon: <Activity className="w-8 h-8 text-yellow-500" /> },
    { id: 'investigation', name: 'Investigation', icon: <FlaskConical className="w-8 h-8 text-indigo-500" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="/zambia-coat-of-arms.jpg" alt="Logo" className="h-10" />
              <h1>
                <span className="text-[#00A651]">Smart</span>
                <span className="text-[#0072BC]">Care</span>
                <span className="text-[#0072BC] font-bold">PRO</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
            <div className="flex items-center space-x-4 text-sm">
              <p>XXX MMMM</p>
              <span>•</span>
              <p>11-Oct-1988 (Female)</p>
              <span>•</span>
              <p>Cellphone: 0977000000</p>
            </div>
            <div className="flex items-center space-x-4 text-sm mt-2">
              <p>NUPN: RRRR-MMMMM-YYYY-K</p>
              <span>•</span>
              <p>NRC: 222222/22/2</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-center">Select Service for the Patient</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {services.map((service) => (
              <Button
                key={service.id}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50"
                onClick={() => setLocation(`/medical-records/${service.id}`)}
              >
                {service.icon}
                <span>{service.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}