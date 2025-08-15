import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { evaluateDangerSigns, generateRecommendation } from "@/lib/anc-decision-support";
import { AlertTriangle, CheckCircle2, InfoIcon, XCircle, Phone, MapPin, Clock, X, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AncDecisionSupportProps {
  dangerSigns: string[];
  onRecordClosure?: (reason: string) => void;
  onDangerSignsAcknowledged?: (acknowledgedSigns: string[]) => void;
}

// Zambian ANC Guidelines danger sign descriptions (2022)
const enhancedDangerSignDescriptions = {
  // Bleeding & Delivery Complications
  'Vaginal bleeding': `Definition:
Any amount of vaginal bleeding during pregnancy.

Clinical Significance:
Must be treated as serious and immediately attended to. May indicate placental abruption, placenta previa, or other complications, especially in 2nd and 3rd trimesters.

Assessment Protocol:
Evaluate amount, color, associated pain, and gestational age to determine underlying cause and urgency level.`,

  'Draining': `Definition:
Amniotic fluid leak or rupture of membranes - a gush or trickle of clear or colored fluid from the vagina.

Clinical Significance:
Indicates ruptured membranes, increasing risk of infection (chorioamnionitis) and preterm labor. Risk of umbilical cord prolapse if baby's head not engaged.

Assessment Protocol:
Confirm amniotic fluid, assess fetal status, and check for cord prolapse before referral.`,

  'Imminent delivery': `Definition:
Signs that birth is about to happen immediately - overwhelming urge to push, contractions less than 2 minutes apart, or baby's head visible.

Clinical Significance:
Requires immediate preparation for safe birth regardless of location. No time for transport to higher-level facility.

Emergency Protocol:
Do not leave patient unattended, prepare for clean delivery, call for skilled assistance immediately.`,

  'Labour': `Definition:
Regular, painful uterine contractions causing cervical changes (effacement and dilation).

Clinical Significance:
When occurring between 20-37 weeks, defined as preterm labor - a significant danger sign that can lead to premature birth with increased health risks.

Assessment Protocol:
Evaluate contraction frequency, duration, strength, and fetal status before referral to facility capable of managing premature birth.`,
  
  // Neurological & Pre-eclampsia Signs
  'Convulsing': `Definition:
Eclamptic seizure involving uncontrolled shaking and loss of consciousness.

Clinical Significance:
Life-threatening emergency sign of eclampsia, severe progression of high blood pressure in pregnancy requiring immediate intervention.

Emergency Protocol:
Protect from injury, manage airway (ABC), administer anticonvulsants per protocol, prepare for urgent referral and delivery.`,

  'Severe headache': `Definition:
New, persistent, and severe headache not relieved by simple analgesics.

Clinical Significance:
Key symptom of pre-eclampsia requiring immediate blood pressure assessment and potential referral.

Assessment Protocol:
Immediate BP measurement, urine protein testing, and evaluation for other pre-eclampsia signs.`,

  'Visual disturbance': `Definition:
New vision problems - blurred vision, seeing spots or flashing lights, double vision, or temporary vision loss.

Clinical Significance:
Key symptom of severe pre-eclampsia or impending eclampsia requiring immediate evaluation.

Assessment Protocol:
Immediate blood pressure measurement, urine protein testing, and urgent referral if BP elevated or other pre-eclampsia signs present.`,

  'Unconscious': `Definition:
State of unresponsiveness where patient cannot be roused.

Clinical Significance:
Critical emergency with multiple potential causes including eclampsia, severe blood loss, septic shock, or diabetic coma.

Emergency Protocol:
Immediate ABC assessment (Airway, Breathing, Circulation), begin resuscitation if required, arrange urgent referral.`,
  
  // Systemic & Infectious Signs
  'Fever': `Definition:
A body temperature ≥38°C with chills or rigors.

Clinical Significance:
Fever in pregnancy signals serious infections that require immediate attention and significantly increases metabolic demands on both mother and fetus.

Infections of Concern (Zambian ANC Guidelines):
• Urinary Tract Infections (UTIs) - common in pregnancy and may lead to pyelonephritis (kidney infection) if untreated
• Malaria - requires intermittent prophylaxis and testing for symptomatic patients
• Tuberculosis (TB) - systematic screening recommended for all pregnant women`,
  'Looks very ill': `Definition:
Clinical impression that patient is deteriorating - lethargy, confusion, pale or clammy skin, rapid breathing.

Clinical Significance:
Crucial professional judgment sign often signifying onset of sepsis or shock before vital signs dramatically change.

Assessment Protocol:
Trust clinical judgment, take full vital signs, perform rapid ABC assessment, prepare for immediate emergency referral.`,

  'Severe vomiting': `Definition:
Persistent vomiting preventing patient from keeping down food or fluids, leading to dehydration and weight loss.

Clinical Significance:
While common in first trimester, severe cases beyond 20 weeks can cause dehydration, electrolyte imbalances, and nutritional deficiencies harmful to mother and fetus.

Assessment Protocol:
Assess for dehydration signs, provide dietary advice, refer for antiemetics or IV fluids if dehydration present.`,

  'Severe abdominal pain': `Definition:
Intense, non-contraction pain in the abdomen.

Clinical Significance:
Location provides diagnostic clues - upper right pain may suggest HELLP syndrome, sharp constant pain could indicate placental abruption, generalized tenderness with fever may suggest infection.

Assessment Protocol:
Assess pain location, nature, and severity; check vital signs and fetal heart rate; palpate abdomen for tenderness or rigidity before referral.`
};

// Dynamic immediate actions per danger sign
const immediateActionsRequired: Record<string, string[]> = {
  // Bleeding & Delivery
  'Vaginal bleeding': [
    'Assess vital signs, especially Blood Pressure (BP)',
    'Assess fetal heart rate and movement',
    'Note the amount and color of bleeding',
    'Prepare for immediate referral to a higher level of care'
  ],
  'Draining': [
    'Confirm if fluid is amniotic',
    'Assess fetal heart rate',
    'Check for umbilical cord prolapse',
    'Refer immediately to a facility for assessment and management'
  ],
  'Imminent delivery': [
    'Do not leave the patient unattended',
    'Prepare for a clean, safe birth',
    'Call for skilled assistance immediately',
    'Arrange for emergency transport if at a lower-level facility'
  ],
  'Labour': [
    'Assess contraction frequency, duration, and strength',
    'Assess fetal heart rate',
    'Minimize vaginal examinations',
    'Refer immediately to a facility capable of managing premature birth'
  ],
  
  // Neurological & Pre-eclampsia
  'Convulsing': [
    'Protect the patient from injury; manage airway (ABC)',
    'Administer emergency anticonvulsants (e.g., Magnesium Sulfate) per protocol',
    'Check vital signs after the seizure',
    'Prepare for urgent referral and delivery'
  ],
  'Severe headache': [
    'Measure Blood Pressure immediately',
    'Test urine for protein',
    'Assess for other signs of pre-eclampsia (e.g., visual changes)',
    'Refer immediately if BP is high or other signs are present'
  ],
  'Visual disturbance': [
    'Measure Blood Pressure immediately',
    'Test urine for protein',
    'Refer immediately if BP is high or other signs are present'
  ],
  'Unconscious': [
    'Check Airway, Breathing, and Circulation (ABC) immediately',
    'Begin resuscitation if required',
    'Arrange for urgent, immediate referral to a hospital'
  ],
  
  // Systemic & Infectious
  'Fever': [
    'Document time of onset and severity',
    'Take complete vital signs (blood pressure measurement mandatory at every ANC contact)',
    'Assess Fetal Heart Rate and movement (required from 3rd ANC contact, 21-26 weeks onwards)',
    'Urgent investigation to find and treat the infection source',
    'Consider immediate referral based on severity - timely and appropriate referrals are "key to saving the pregnant woman and unborn child" per guidelines'
  ],
  'Looks very ill': [
    'Trust clinical judgment and act immediately',
    'Take a full set of vital signs',
    'Perform a rapid assessment (ABC)',
    'Prepare for immediate emergency referral'
  ],
  'Severe vomiting': [
    'Assess for signs of dehydration',
    'Provide dietary advice',
    'Refer to a clinician for consideration of antiemetics or IV fluids if dehydration is present'
  ],
  'Severe abdominal pain': [
    'Assess the location, nature, and severity of the pain',
    'Check vital signs and fetal heart rate',
    'Palpate the abdomen for tenderness or rigidity',
    'Refer immediately for diagnosis and management'
  ],
  
  'default': [
    'Document time of onset and severity',
    'Take complete vital signs',
    'Assess fetal heart rate and movement',
    'Consider immediate referral based on severity'
  ]
};

const criticalDangerSigns = [
  'Convulsing', 'Unconscious', 'Severe headache', 'Visual disturbance', 
  'Vaginal bleeding', 'Imminent delivery', 'Severe abdominal pain'
];

export function AncDecisionSupportAlert({ dangerSigns, onRecordClosure, onDangerSignsAcknowledged }: AncDecisionSupportProps) {
  const [recommendation, setRecommendation] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showUrgentModal, setShowUrgentModal] = useState<boolean>(false);
  const [showFacilityManagement, setShowFacilityManagement] = useState<boolean>(false);
  const [showDangerSignsInfo, setShowDangerSignsInfo] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Generate recommendation and show urgent modal immediately on mount (after confirmation)
  useEffect(() => {
    const newRecommendation = dangerSigns && dangerSigns.length > 0 
      ? generateRecommendation(dangerSigns)
      : "";
    setRecommendation(newRecommendation);
    
    // Show urgent modal immediately since this component only renders after confirmation
    if (newRecommendation) {
      const isUrgent = newRecommendation.includes("URGENT");
      
      if (isUrgent) {
        // Show modal alert for urgent recommendations
        setShowUrgentModal(true);
      } else {
        // Show green toaster for safe recommendations
        const cleanRecommendation = newRecommendation
          .replace("RECOMMENDATION: ", "")
          .replace("URGENT RECOMMENDATION: ", "");
        
        toast({
          title: "✓ Clinical Recommendation",
          description: cleanRecommendation,
          variant: "success",
          action: (
            <Button
              variant="outline" 
              size="sm"
              className="ml-2 p-2 h-8 w-8"
              onClick={() => setShowDetails(true)}
            >
              <InfoIcon className="h-4 w-4" />
            </Button>
          ),
        });
      }
    }
  }, [dangerSigns, toast]);
  
  const isUrgent = recommendation.includes("URGENT");
  
  // Render both urgent modal and details dialog
  return (
    <>
      {/* Modern Urgent Modal Alert */}
      <Dialog open={showUrgentModal} onOpenChange={setShowUrgentModal}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden rounded-3xl shadow-2xl border-0" aria-describedby="urgent-alert-description">
          <DialogHeader className="sr-only">
            <DialogTitle>Urgent Medical Alert</DialogTitle>
            <DialogDescription id="urgent-alert-description">
              Critical medical alert requiring immediate action. Danger signs have been detected and urgent referral or treatment is required.
            </DialogDescription>
          </DialogHeader>
          
          {/* Critical Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-bounce">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">URGENT ALERT</h2>
                  <p className="text-red-100 text-xs">Immediate referral or treatment required</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUrgentModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danger Signs */}
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-800 text-sm">
                Danger sign(s) detected: {dangerSigns.join(', ')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-4">Select immediate action:</p>
            
            <button
              onClick={() => {
                setShowUrgentModal(false);
                setShowDangerSignsInfo(true);
                // The danger signs info modal will handle the acknowledgment
              }}
              className="w-full p-4 rounded-2xl transition-all duration-200 text-left transform hover:scale-105 hover:shadow-lg bg-orange-600 hover:bg-orange-700 text-white"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <InfoIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">Danger Signs Information</h3>
                  <p className="text-sm opacity-90">Management protocols & guidance</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowUrgentModal(false);
                onRecordClosure?.("Emergency referral initiated due to danger signs: " + dangerSigns.join(', '));
                // Open the main referral modal instead of the emergency dialog
                const referralButton = document.querySelector('[data-referral-modal-trigger]') as HTMLButtonElement;
                if (referralButton) {
                  console.log('🔥 EMERGENCY REFERRAL CLICKED - Opening referral modal...');
                  referralButton.click();
                } else {
                  console.log('❌ Referral modal trigger not found, falling back to emergency dialog');
                  const emergencyReferralButton = document.getElementById('emergency-referral-add-button');
                  if (emergencyReferralButton) {
                    emergencyReferralButton.click();
                  }
                }
              }}
              className="w-full p-4 rounded-2xl transition-all duration-200 text-left transform hover:scale-105 hover:shadow-lg bg-red-600 hover:bg-red-700 text-white"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">Emergency Referral</h3>
                  <p className="text-sm opacity-90">Immediate emergency services</p>
                </div>

              </div>
            </button>

            <button
              onClick={() => {
                setShowUrgentModal(false);
                setShowFacilityManagement(true);
              }}
              className="w-full p-4 rounded-2xl transition-all duration-200 text-left transform hover:scale-105 hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">Facility Management</h3>
                  <p className="text-sm opacity-90">Treat on-site with monitoring</p>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Actions Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span>Protocol Zambia ANC Guidelines 2022</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Facility Management Dialog */}
      <Dialog open={showFacilityManagement} onOpenChange={setShowFacilityManagement}>
        <DialogContent className="sm:max-w-md border-l-4 border-l-blue-500 shadow-lg">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 -m-6 p-6 rounded-t-lg border-b border-blue-200">
            <DialogHeader>
              <DialogTitle className="text-blue-800 text-lg font-bold">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <InfoIcon className="h-4 w-4 text-white" />
                  </div>
                  Facility Management
                </div>
              </DialogTitle>
              <DialogDescription className="text-blue-700 mt-2">
                Select department for patient care coordination
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="mt-4 grid gap-3">
            <Button
              variant="outline"
              className="h-14 flex items-center justify-start gap-4 p-4 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
              onClick={() => {
                setShowFacilityManagement(false);
                onRecordClosure?.("Patient managed at facility - OPD due to danger signs: " + dangerSigns.join(', '));
                alert("Redirecting to OPD (Outpatient Department)");
              }}
            >
              <div className="bg-green-100 p-2 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">OPD</div>
                <div className="text-sm text-gray-600">Outpatient Department</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-14 flex items-center justify-start gap-4 p-4 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
              onClick={() => {
                setShowFacilityManagement(false);
                onRecordClosure?.("Patient managed at facility - IPD due to danger signs: " + dangerSigns.join(', '));
                alert("Redirecting to IPD (Inpatient Department)");
              }}
            >
              <div className="bg-orange-100 p-2 rounded-lg">
                <div className="w-6 h-6 bg-orange-600 rounded"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">IPD</div>
                <div className="text-sm text-gray-600">Inpatient Department</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-14 flex items-center justify-start gap-4 p-4 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
              onClick={() => {
                setShowFacilityManagement(false);
                onRecordClosure?.("Patient managed at facility - Pharmacy due to danger signs: " + dangerSigns.join(', '));
                alert("Redirecting to Pharmacy");
              }}
            >
              <div className="bg-purple-100 p-2 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Pharmacy</div>
                <div className="text-sm text-gray-600">Medication Management</div>
              </div>
            </Button>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={() => setShowFacilityManagement(false)}
            >
              Close
            </Button>
            <Button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={isUrgent ? "text-red-700" : "text-green-700"}>
              <div className="flex items-center gap-2">
                {isUrgent ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                {isUrgent ? "Urgent Clinical Recommendation" : "Clinical Recommendation"}
              </div>
            </DialogTitle>
            <DialogDescription className="pt-2">
              Based on the assessment of danger signs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="rounded-md p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Selected Danger Signs:</h4>
              {dangerSigns.length === 0 ? (
                <p className="text-sm text-gray-500">None selected</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {dangerSigns.map((sign, index) => (
                    <li key={index}>{sign}</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className={`rounded-md p-4 ${isUrgent ? "bg-red-50" : "bg-green-50"}`}>
              <h4 className={`text-sm font-medium mb-2 ${isUrgent ? "text-red-700" : "text-green-700"}`}>
                Recommendation:
              </h4>
              <p className="text-sm text-gray-600">
                {recommendation.replace("RECOMMENDATION: ", "").replace("URGENT RECOMMENDATION: ", "")}
              </p>
            </div>
            
            <div className="rounded-md p-4 bg-blue-50">
              <h4 className="text-sm font-medium mb-2 text-blue-700 flex gap-2 items-center">
                <InfoIcon className="h-4 w-4" />
                Clinical Decision Support Information
              </h4>
              <p className="text-sm text-gray-600">
                {isUrgent ? 
                  "This recommendation is based on WHO guidelines for managing pregnancy-related complications. Danger signs may indicate serious conditions that require immediate medical attention at a facility with appropriate capabilities." :
                  "You may proceed with routine antenatal care as no danger signs were identified that would require urgent referral. Continue to monitor for any changes in the patient's condition."
                }
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={(e) => {
                e.preventDefault();
                try {
                  setShowDetails(false);
                } catch (error) {
                  console.error('Error closing dialog:', error);
                }
              }}
            >
              Close
            </Button>
            <Button
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
              onClick={(e) => {
                e.preventDefault();
                try {
                  setShowDetails(false);
                } catch (error) {
                  console.error('Error saving:', error);
                }
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compact Danger Signs Information and Management Protocols Dialog */}
      <Dialog open={showDangerSignsInfo} onOpenChange={(open) => {
        setShowDangerSignsInfo(open);
        if (!open) {
          // When dialog closes, trigger acknowledgment to show action selection
          onDangerSignsAcknowledged?.(dangerSigns);
        }
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-white/85 backdrop-blur-2xl border border-white/20 ring-1 ring-white/10 shadow-2xl rounded-2xl" aria-describedby="danger-signs-info-description"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.80) 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08)'
          }}>
          <div className="bg-gradient-to-r from-blue-500/8 to-indigo-500/8 -m-6 p-4 rounded-t-2xl border-b border-blue-200/20 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-lg font-bold">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md">
                    <InfoIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Clinical Protocols</h2>
                    <p className="text-sm text-gray-600 font-normal">Management guidance for detected danger signs</p>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription id="danger-signs-info-description" className="sr-only">
                Clinical guidance and management protocols for detected danger signs
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="mt-4 grid gap-3">
            {dangerSigns.map(sign => (
              <div key={sign} className="group bg-white/70 backdrop-blur-md p-4 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.65) 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)'
                }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full shadow-sm ${criticalDangerSigns.includes(sign) ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`}></div>
                    <h3 className="text-lg font-bold text-gray-900">{sign}</h3>
                  </div>
                  {criticalDangerSigns.includes(sign) && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-sm">
                      <span className="w-1 h-1 bg-white rounded-full mr-1 animate-pulse"></span>
                      CRITICAL
                    </span>
                  )}
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/40">
                  <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Clinical Description
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{enhancedDangerSignDescriptions[sign as keyof typeof enhancedDangerSignDescriptions] || 'No description available for this danger sign.'}</p>
                </div>
                
                {/* Compact neurological protocols */}
                {['Convulsing', 'Severe headache', 'Visual disturbance', 'Unconscious'].includes(sign) && (
                  <div className="bg-gradient-to-r from-purple-500/8 to-indigo-500/8 backdrop-blur-sm rounded-lg p-3 mb-2 border border-purple-200/40">
                    <h4 className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">⚡</span>
                      </div>
                      Pre-eclampsia/Eclampsia Protocol
                    </h4>
                    <div className="grid gap-1">
                      <div className="flex items-start gap-1.5 text-xs text-purple-700">
                        <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Check BP immediately (repeat if &gt;140/90)</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-purple-700">
                        <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Test urine for proteinuria (≥2+ significant)</span>
                      </div>
                      {sign === 'Convulsing' && (
                        <div className="flex items-start gap-1.5 text-xs text-purple-700 font-semibold bg-purple-50/50 p-1.5 rounded mt-1">
                          <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span><strong>MgSO4:</strong> 4g IV + 1g/hr maintenance</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Compact obstetric protocols */}
                {['Vaginal bleeding', 'Draining', 'Imminent delivery', 'Labour'].includes(sign) && (
                  <div className="bg-gradient-to-r from-red-500/8 to-pink-500/8 backdrop-blur-sm rounded-lg p-3 mb-2 border border-red-200/40">
                    <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs">🚨</span>
                      </div>
                      Obstetric Emergency Protocol
                    </h4>
                    <div className="grid gap-1">
                      <div className="flex items-start gap-1.5 text-xs text-red-700">
                        <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Assess gestational age and fetal wellbeing</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-red-700">
                        <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Check vital signs and establish IV access</span>
                      </div>
                      {sign === 'Imminent delivery' && (
                        <div className="flex items-start gap-1.5 text-xs text-red-700 font-semibold bg-red-50/50 p-1.5 rounded mt-1">
                          <div className="w-1 h-1 bg-red-600 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
                          <span><strong>URGENT:</strong> Prepare for immediate delivery</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Compact immediate actions */}
                <div className="bg-gradient-to-r from-gray-500/5 to-slate-500/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200/40">
                  <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-700 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    Immediate Actions Required
                  </h4>
                  <div className="grid gap-1">
                    {(immediateActionsRequired[sign] || immediateActionsRequired['default']).slice(0, 3).map((action, index) => (
                      <div key={index} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <div className="w-1 h-1 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              className="rounded-full bg-gray-200 hover:bg-gray-300 text-black border-none px-6"
              onClick={() => {
                setShowDangerSignsInfo(false);
                // Trigger acknowledgment to show action selection in main modal
                onDangerSignsAcknowledged?.(dangerSigns);
              }}
            >
              Close
            </Button>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
              onClick={() => {
                setShowDangerSignsInfo(false);
                // Trigger acknowledgment to show action selection in main modal
                onDangerSignsAcknowledged?.(dangerSigns);
              }}
            >
              Acknowledge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface DecisionRuleTableProps {
  dangerSigns: string[];
}

export function DecisionRuleTable({ dangerSigns }: DecisionRuleTableProps) {
  const { action, annotation } = evaluateDangerSigns(dangerSigns);
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Decision Support Analysis</CardTitle>
        <CardDescription>
          Decision rules applied to the current assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left border text-sm font-medium">Input</th>
                <th className="p-2 text-left border text-sm font-medium">Action</th>
                <th className="p-2 text-left border text-sm font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border text-sm">
                  {dangerSigns.length === 0 ? 
                    "No danger signs selected" : 
                    dangerSigns.join(", ")
                  }
                </td>
                <td className="p-2 border text-sm font-medium">
                  <span className={action === "ANC.B. ANC Contact" ? 
                    "text-green-600" : 
                    "text-red-600"
                  }>
                    {action}
                  </span>
                </td>
                <td className="p-2 border text-sm">
                  {annotation}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
        <p className="text-xs text-gray-500">
          Based on WHO Guidelines for ANC
        </p>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View All Rules
        </Button>
      </CardFooter>
    </Card>
  );
}