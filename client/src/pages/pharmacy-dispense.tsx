import ClientDetailsCard from "@/components/core/card/ClientDetailsCard";
import PharmacyDispenseDetails from "@/components/pharmacy/PharmacyDispenseDetails";
import DataSummaryList from "@/components/shared/data-summary/DataSummaryList";
import useWindowWidth from "@/hooks/shared/useWindow";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { initializeSampleData } from "@/utils/sample-dispensation-data";

const PharmacyDispense = () => {
  const w768 = useWindowWidth(768);
  const [, setLocation] = useLocation();

  useEffect(() => {
    initializeSampleData();
  }, []);

  const handleBack = () => {
    setLocation("/pharmacy");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pharmacy
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dispensation</h1>
          </div>
        </div>

        {/* Client Details */}
        <div className="mb-6">
          <ClientDetailsCard />
        </div>

        {/* Responsive Data Summary */}
        {w768 && (
          <div className="sm:col-span-full mt-5 mr-3 md:col-span-1 mb-6">
            <DataSummaryList isResponsive />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Dispensation Details */}
          <div className="sm:col-span-full md:col-span-3">
            <PharmacyDispenseDetails />
          </div>

          {/* Data Summary for Desktop */}
          {!w768 && (
            <div className="sm:col-span-full mt-5 mr-3 md:col-span-1">
              <DataSummaryList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDispense;