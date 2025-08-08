import React from "react";
import { RiskAssessment, RiskLevel, PatientRiskProfile, getRiskColor, getRiskCategoryIcon } from "@/lib/risk-assessment";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Shield, Activity, Filter, Droplet, Layers, Calendar, PlusCircle, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Component to render a risk level indicator
const RiskLevelIndicator = ({ level }: { level: RiskLevel }) => {
  const color = getRiskColor(level);
  const percentage = {
    [RiskLevel.LOW]: 25,
    [RiskLevel.MEDIUM]: 50,
    [RiskLevel.HIGH]: 75,
    [RiskLevel.CRITICAL]: 100,
  }[level];

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium capitalize">{level} Risk</span>
        <span>{percentage}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div 
          className="h-full w-full flex-1 transition-all"
          style={{ 
            transform: `translateX(-${100 - percentage}%)`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

// Component to render an individual risk assessment card
const RiskAssessmentCard = ({ assessment }: { assessment: RiskAssessment }) => {
  const color = getRiskColor(assessment.level);
  const icons = {
    "drugInteraction": <Pill size={16} />,
    "adverseReaction": <AlertCircle size={16} />,
    "adherence": <Calendar size={16} />,
    "viralLoad": <Activity size={16} />,
    "cd4Count": <Shield size={16} />,
    "liverFunction": <Filter size={16} />,
    "renalFunction": <Droplet size={16} />,
    "comorbidity": <Layers size={16} />,
  };

  const categoryTitle = {
    "drugInteraction": "Drug Interactions",
    "adverseReaction": "Adverse Reactions",
    "adherence": "Treatment Adherence",
    "viralLoad": "Viral Load",
    "cd4Count": "CD4 Count",
    "liverFunction": "Liver Function",
    "renalFunction": "Renal Function",
    "comorbidity": "Comorbidities",
  };

  const Icon = icons[assessment.category] || <AlertCircle size={16} />;
  
  return (
    <Card className="overflow-hidden shadow-sm border-[#e5e7eb] hover:shadow-md transition-shadow duration-200">
      <div className={`h-1.5`} style={{ backgroundColor: color }} />
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-[#0072BC]">{Icon}</div>
            <CardTitle className="text-sm font-medium text-[#111827]">
              {categoryTitle[assessment.category]}
            </CardTitle>
          </div>
          <Badge 
            variant={assessment.level === RiskLevel.LOW ? "outline" : "default"}
            className={`capitalize text-xs px-2 py-0.5`}
            style={{ 
              backgroundColor: assessment.level !== RiskLevel.LOW ? color : 'transparent',
              color: assessment.level === RiskLevel.LOW ? color : 'white',
              borderColor: assessment.level === RiskLevel.LOW ? color : 'transparent'
            }}
          >
            {assessment.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 text-sm text-[#4B5563]">
        <p>{assessment.description}</p>
      </CardContent>
      {assessment.recommendation && (
        <CardFooter className="p-4 pt-0 text-xs border-t border-[#e5e7eb] bg-[#f9fafb]">
          <div>
            <p className="font-medium mb-1 text-[#0072BC]">Recommendation:</p>
            <p className="text-[#4B5563]">{assessment.recommendation}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// Main risk assessment visualization component
export function RiskAssessmentVisualization({ 
  patientData,
  showDetails = true,
  onViewFullReport,
}: { 
  patientData: any;
  showDetails?: boolean;
  onViewFullReport?: () => void;
}) {
  // If we don't have the necessary data, show a placeholder
  if (!patientData || !patientData.medicalTests) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <PlusCircle className="h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium">No Risk Assessment Data</h3>
          <p className="text-sm text-muted-foreground">
            Medical test data is required for risk assessment visualization.
          </p>
        </div>
      </Card>
    );
  }
  
  // Import from risk assessment library
  const { generatePatientRiskProfile } = require('@/lib/risk-assessment');
  
  // Generate the risk profile
  const riskProfile: PatientRiskProfile = generatePatientRiskProfile(patientData);
  
  // If no assessments were generated, show a placeholder
  if (riskProfile.assessments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium">Insufficient Data</h3>
          <p className="text-sm text-muted-foreground">
            Complete medical test data is needed for a comprehensive risk assessment.
          </p>
        </div>
      </Card>
    );
  }
  
  // Determine the color for the overall risk
  const overallRiskColor = getRiskColor(riskProfile.overallRisk);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Patient Risk Assessment</CardTitle>
          <CardDescription>
            Based on medical data as of {riskProfile.lastUpdated.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Overall Risk Level</h3>
              <Badge 
                className="capitalize text-white"
                style={{ backgroundColor: overallRiskColor }}
              >
                {riskProfile.overallRisk}
              </Badge>
            </div>
            <RiskLevelIndicator level={riskProfile.overallRisk} />
          </div>
        </CardContent>
        
        {!showDetails && (
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onViewFullReport}
            >
              View Detailed Risk Report
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskProfile.assessments.map((assessment, index) => (
            <RiskAssessmentCard key={index} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}

// Detailed risk assessment dashboard component with additional information
export function RiskAssessmentDashboard({ patientData }: { patientData: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Risk Assessment</h2>
        <Button variant="outline">Download PDF Report</Button>
      </div>
      
      <RiskAssessmentVisualization patientData={patientData} />
      
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Methodology</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="mb-4">
            This risk assessment is based on clinical guidelines for HIV patient monitoring and uses 
            multiple parameters to evaluate patient health status and treatment effectiveness.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Key Parameters Analyzed:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>CD4 Count - Immune system function</li>
              <li>Viral Load - Treatment effectiveness</li>
              <li>Liver Function (ALT/AST) - Medication toxicity</li>
              <li>Renal Function (Creatinine) - Medication clearance</li>
              <li>Comorbidities - Overall health complexity</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}