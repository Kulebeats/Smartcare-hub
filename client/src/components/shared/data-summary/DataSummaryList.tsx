import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, TestTube, Pill, FileText, Calendar } from "lucide-react";

interface SummaryItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SummarySection {
  title: string;
  items: SummaryItem[];
  icon: React.ReactNode;
  color: string;
}

interface DataSummaryListProps {
  isResponsive?: boolean;
  customData?: SummarySection[];
}

const DataSummaryList: React.FC<DataSummaryListProps> = ({ 
  isResponsive = false, 
  customData 
}) => {
  const defaultSummaryData: SummarySection[] = [
    {
      title: "Vitals",
      icon: <Heart className="w-4 h-4" />,
      color: "text-red-600",
      items: [
        { label: "Weight (kg)", value: "65" },
        { label: "Height (cm)", value: "165" },
        { label: "BMI", value: "23.9" },
        { label: "Blood Pressure", value: "120/80" }
      ]
    },
    {
      title: "Recent Tests",
      icon: <TestTube className="w-4 h-4" />,
      color: "text-blue-600",
      items: [
        { label: "Hemoglobin", value: "12.5 g/dL" },
        { label: "HIV Status", value: "Negative" },
        { label: "Test Date", value: "2025-01-10" }
      ]
    },
    {
      title: "Current Medications",
      icon: <Pill className="w-4 h-4" />,
      color: "text-green-600",
      items: [
        { label: "Iron + Folic Acid", value: "Daily" },
        { label: "Calcium", value: "Twice daily" },
        { label: "Multivitamin", value: "Daily" }
      ]
    },
    {
      title: "Recent Activity",
      icon: <Activity className="w-4 h-4" />,
      color: "text-purple-600",
      items: [
        { label: "Last Visit", value: "2025-01-10" },
        { label: "Next Appointment", value: "2025-01-24" },
        { label: "Prescriptions", value: "3 Active" }
      ]
    }
  ];

  const summaryData = customData || defaultSummaryData;

  return (
    <div className={`space-y-4 ${isResponsive ? 'w-full' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-[#0072BC]" />
        <h3 className="font-semibold text-lg text-[#0072BC]">Recent Data Summary</h3>
      </div>
      
      {summaryData.map((section, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${section.color}`}>
              {section.icon}
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{item.label}</span>
                  <span className="text-xs font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Pharmacy-specific summary card */}
      <Card className="shadow-sm border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
            <Calendar className="w-4 h-4" />
            Dispensation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Pending Prescriptions</span>
              <span className="text-xs font-medium text-orange-600">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Dispensed Today</span>
              <span className="text-xs font-medium text-green-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Low Stock Items</span>
              <span className="text-xs font-medium text-red-600">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Total Value</span>
              <span className="text-xs font-medium text-blue-600">K2,450</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSummaryList;