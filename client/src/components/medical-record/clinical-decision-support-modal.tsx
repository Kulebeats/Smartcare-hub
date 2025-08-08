import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Pill, Users, Calendar } from 'lucide-react';

export interface CDSSCondition {
  diagnosis: string;
  severity: 'critical' | 'warning' | 'info';
  treatments: Array<{
    type: string;
    details: string;
    dosing?: string;
    duration?: string;
  }>;
  counseling: string[];
  actions: string[];
  partnerCare?: string[];
  followUp?: string[];
  whoReference?: string;
}

interface ClinicalDecisionSupportModalProps {
  condition: CDSSCondition | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (condition: CDSSCondition) => void;
}

export function ClinicalDecisionSupportModal({ 
  condition, 
  isOpen, 
  onClose, 
  onConfirm 
}: ClinicalDecisionSupportModalProps) {
  if (!condition) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const color = getSeverityColor(condition.severity);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-${color}-600 flex items-center text-xl`}>
            <AlertTriangle className="w-6 h-6 mr-3" />
            Clinical Decision Support: {condition.diagnosis}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Treatment Protocol Section */}
          {condition.treatments.length > 0 && (
            <div className={`bg-${color}-50 border border-${color}-200 p-4 rounded-lg`}>
              <div className="flex items-center mb-3">
                <Pill className={`w-5 h-5 text-${color}-600 mr-2`} />
                <h3 className={`font-semibold text-${color}-800`}>Treatment Protocol</h3>
              </div>
              <div className="space-y-3">
                {condition.treatments.map((treatment, index) => (
                  <div key={index} className={`bg-white p-3 rounded border border-${color}-200`}>
                    <div className={`font-medium text-${color}-800 mb-1`}>{treatment.type}</div>
                    <div className="text-sm text-gray-700 mb-2">{treatment.details}</div>
                    {treatment.dosing && (
                      <div className="text-xs text-gray-600">
                        <strong>Dosing:</strong> {treatment.dosing}
                      </div>
                    )}
                    {treatment.duration && (
                      <div className="text-xs text-gray-600">
                        <strong>Duration:</strong> {treatment.duration}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Counseling Requirements */}
          {condition.counseling.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Patient Counseling Requirements</h3>
              </div>
              <ul className="space-y-2">
                {condition.counseling.map((item, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Partner Care */}
          {condition.partnerCare && condition.partnerCare.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-800">Partner Care & Treatment</h3>
              </div>
              <ul className="space-y-2">
                {condition.partnerCare.map((item, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Required Actions */}
          {condition.actions.length > 0 && (
            <div className={`bg-${color}-50 border border-${color}-200 p-4 rounded-lg`}>
              <div className="flex items-center mb-3">
                <AlertTriangle className={`w-5 h-5 text-${color}-600 mr-2`} />
                <h3 className={`font-semibold text-${color}-800`}>Immediate Actions Required</h3>
              </div>
              <ul className="space-y-2">
                {condition.actions.map((action, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className={`w-2 h-2 bg-${color}-400 rounded-full mt-2 mr-3 flex-shrink-0`}></span>
                    <span className="text-gray-700 font-medium">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Follow-up Requirements */}
          {condition.followUp && condition.followUp.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Follow-up Requirements</h3>
              </div>
              <ul className="space-y-2">
                {condition.followUp.map((item, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* WHO Reference */}
          {condition.whoReference && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded text-xs text-gray-600">
              <strong>Reference:</strong> {condition.whoReference}
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-3">
          {onConfirm && (
            <Button 
              onClick={() => onConfirm(condition)}
              className={`bg-${color}-600 hover:bg-${color}-700 text-white`}
            >
              Acknowledge & Implement Protocol
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Clinical Decision Support Logic Functions
// NOTE: Hepatitis B evaluation has been migrated to POC Tests module

export function evaluateSyphilis(testResult: string, testType: string, populationPrevalence?: number): CDSSCondition | null {
  if (testResult === 'positive') {
    const isHighPrevalence = populationPrevalence !== undefined && populationPrevalence >= 5;
    
    return {
      diagnosis: 'Syphilis Positive',
      severity: 'critical',
      treatments: [
        {
          type: 'Primary or Secondary Stage Syphilis',
          details: 'Single dose of benzathine penicillin',
          dosing: 'Benzathine penicillin 2,400,000 IU intramuscular',
          duration: 'Single dose'
        },
        {
          type: 'Late or Unknown Stage Syphilis',
          details: 'Extended benzathine penicillin treatment',
          dosing: 'Benzathine penicillin 2,400,000 IU intramuscular',
          duration: 'Weekly for 3 consecutive weeks'
        }
      ],
      counseling: [
        'Provide comprehensive syphilis education',
        'Explain treatment importance for maternal and fetal health',
        'Discuss prevention of reinfection',
        'Address stigma and emotional support needs'
      ],
      actions: [
        'Administer first dose of benzathine penicillin immediately',
        'Determine stage of syphilis infection',
        'Encourage HIV testing and counselling',
        isHighPrevalence ? 'Proceed to RPR testing for confirmation' : 'Begin treatment based on clinical stage'
      ],
      partnerCare: [
        'Test and treat sexual partners',
        'Provide partner notification assistance',
        'Counsel partners on prevention strategies',
        'Schedule partner follow-up'
      ],
      followUp: [
        'Monitor serological response at 3, 6, 12 months',
        'Assess for treatment failure or reinfection',
        'Follow fetal growth and development',
        'Plan obstetric management based on treatment response'
      ],
      whoReference: 'WHO Guidelines on Syphilis Testing and Treatment in Pregnancy'
    };
  }
  return null;
}

export function evaluateASB(urineResults: {
  culture?: string;
  gramStaining?: string;
  nitrites?: string;
  leukocytes?: string;
}): CDSSCondition | null {
  const asbCriteria = [
    urineResults.culture === 'positive_any' || urineResults.culture === 'positive_gbs',
    urineResults.gramStaining === 'positive',
    urineResults.nitrites && ['+', '++', '+++', '++++'].includes(urineResults.nitrites),
    urineResults.leukocytes && ['+', '++', '+++', '++++'].includes(urineResults.leukocytes)
  ];
  
  if (asbCriteria.some(criteria => criteria)) {
    return {
      diagnosis: 'Asymptomatic Bacteriuria (ASB) Positive',
      severity: 'warning',
      treatments: [
        {
          type: 'Seven-day Antibiotic Regimen',
          details: 'Complete antibiotic course for asymptomatic bacteriuria',
          dosing: 'Appropriate antibiotic based on culture sensitivity',
          duration: '7 days'
        }
      ],
      counseling: [
        'Explain importance of completing full antibiotic course',
        'Discuss prevention of complications (preterm birth, low birth weight)',
        'Educate on proper hygiene practices',
        'Address importance of follow-up testing'
      ],
      actions: [
        'Prescribe appropriate 7-day antibiotic regimen',
        'Order urine culture sensitivity if not done',
        'Schedule follow-up urine culture after treatment',
        'Monitor for treatment response'
      ],
      followUp: [
        'Test of cure urine culture 1-2 weeks after treatment',
        'Monthly urine screening for remainder of pregnancy',
        'Monitor for recurrent UTI symptoms',
        'Assess fetal growth and development'
      ],
      whoReference: 'WHO Guidelines on UTI Management in Pregnancy'
    };
  }
  return null;
}

export function evaluateGBS(cultureResult: string): CDSSCondition | null {
  if (cultureResult === 'positive_gbs') {
    return {
      diagnosis: 'Group B Streptococcus (GBS) Positive',
      severity: 'warning',
      treatments: [
        {
          type: 'Intrapartum Antibiotic Prophylaxis',
          details: 'Antibiotic administration during labor to prevent neonatal GBS infection',
          dosing: 'Penicillin G 5 million units IV loading dose, then 2.5-3 million units IV every 4 hours',
          duration: 'During labor until delivery'
        }
      ],
      counseling: [
        'Explain GBS colonization and neonatal infection risk',
        'Discuss importance of intrapartum antibiotic prophylaxis',
        'Provide information about delivery planning',
        'Address concerns about antibiotic use during labor'
      ],
      actions: [
        'Document GBS positive status prominently in medical record',
        'Ensure delivery team is aware of GBS status',
        'Plan intrapartum antibiotic administration',
        'Coordinate with pediatric team for neonatal monitoring'
      ],
      followUp: [
        'Ensure antibiotic prophylaxis during labor',
        'Monitor neonate for signs of early GBS infection',
        'Coordinate with pediatric team for neonatal care',
        'Document antibiotic administration during delivery'
      ],
      whoReference: 'WHO Guidelines on Group B Streptococcus Prevention'
    };
  }
  return null;
}

export function evaluateGlucose(testType: string, result: number): CDSSCondition | null {
  // Gestational Diabetes Mellitus (GDM) thresholds
  const gdmRanges: Record<string, { min: number; max: number }> = {
    'fasting_plasma_glucose': { min: 92, max: 125 },
    '75g_ogtt_fasting': { min: 92, max: 125 },
    '75g_ogtt_1hour': { min: 180, max: 199 },
    '75g_ogtt_2hour': { min: 153, max: 199 }
  };

  // Diabetes Mellitus (DM) thresholds
  const dmThresholds: Record<string, number> = {
    'fasting_plasma_glucose': 126,
    '75g_ogtt_fasting': 126,
    '75g_ogtt_1hour': 200,
    '75g_ogtt_2hour': 200,
    'random_plasma_glucose': 200
  };

  // Check for Diabetes Mellitus (DM) first (higher priority)
  if (dmThresholds[testType] && result >= dmThresholds[testType]) {
    return {
      diagnosis: 'Diabetes Mellitus (DM) during Pregnancy',
      severity: 'critical',
      treatments: [
        {
          type: 'Immediate Dietary Intervention',
          details: 'Intensive nutritional counseling with diabetes-specific meal planning',
          dosing: 'Multiple small meals throughout day',
          duration: 'Throughout pregnancy'
        },
        {
          type: 'Blood Glucose Monitoring',
          details: 'Self-monitoring of blood glucose 4 times daily (fasting and post-meal)',
          dosing: 'Daily monitoring',
          duration: 'Throughout pregnancy'
        },
        {
          type: 'Insulin Therapy (if indicated)',
          details: 'Initiate insulin if dietary management insufficient',
          dosing: 'As per endocrinologist guidance',
          duration: 'As required'
        }
      ],
      counseling: [
        'Explain diabetes in pregnancy and associated risks to mother and baby',
        'Provide comprehensive dietary education and meal planning guidance',
        'Teach blood glucose self-monitoring techniques and target ranges',
        'Discuss importance of regular prenatal visits and specialist care',
        'Address concerns about insulin use during pregnancy if needed',
        'Emphasize importance of good glycemic control for fetal outcomes'
      ],
      actions: [
        'URGENT: Refer to high-level care (endocrinologist/diabetes specialist)',
        'Initiate intensive dietary intervention immediately',
        'Arrange blood glucose monitoring equipment and training',
        'Schedule frequent follow-up appointments (weekly initially)',
        'Coordinate care with maternal-fetal medicine if available',
        'Monitor for diabetic complications throughout pregnancy'
      ],
      followUp: [
        'Weekly glucose monitoring and review initially',
        'Monthly specialist appointments',
        'Regular HbA1c monitoring',
        'Fetal growth monitoring with serial ultrasounds',
        'Plan delivery timing and method with specialist team'
      ],
      whoReference: 'WHO Guidelines - Diagnostic criteria and classification of hyperglycaemia first detected in pregnancy'
    };
  }

  // Check for Gestational Diabetes Mellitus (GDM)
  if (gdmRanges[testType] && result >= gdmRanges[testType].min && result <= gdmRanges[testType].max) {
    return {
      diagnosis: 'Gestational Diabetes Mellitus (GDM)',
      severity: 'warning',
      treatments: [
        {
          type: 'Dietary Intervention',
          details: 'Medical nutrition therapy with carbohydrate counting and portion control',
          dosing: '3 meals + 2-3 snacks daily',
          duration: 'Throughout pregnancy'
        },
        {
          type: 'Physical Activity',
          details: 'Moderate exercise program (walking, swimming) as tolerated',
          dosing: '30 minutes daily',
          duration: 'Throughout pregnancy'
        },
        {
          type: 'Blood Glucose Monitoring',
          details: 'Self-monitoring of blood glucose if available',
          dosing: 'As recommended by healthcare provider',
          duration: 'Throughout pregnancy'
        }
      ],
      counseling: [
        'Explain gestational diabetes and its implications for pregnancy',
        'Provide detailed dietary counseling focusing on carbohydrate management',
        'Discuss safe physical activity during pregnancy',
        'Explain importance of weight management and regular monitoring',
        'Address concerns about risks to baby and delivery',
        'Discuss post-delivery glucose screening and future diabetes risk'
      ],
      actions: [
        'Provide REQUIRED Gestational Diabetes Mellitus (GDM) counseling',
        'Refer to high-level care for specialist management',
        'Implement immediate dietary intervention',
        'Arrange nutritionist consultation if available',
        'Schedule more frequent prenatal visits',
        'Monitor fetal growth with serial measurements'
      ],
      followUp: [
        'Bi-weekly appointments for glucose and fetal monitoring',
        'Repeat glucose tolerance test 6-12 weeks postpartum',
        'Annual diabetes screening for mother',
        'Counsel on future pregnancy risks and prevention strategies'
      ],
      whoReference: 'WHO Guidelines - Diagnostic criteria and classification of hyperglycaemia first detected in pregnancy'
    };
  }

  return null;
}