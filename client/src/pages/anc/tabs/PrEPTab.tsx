/**
 * PrEP Tab Component
 * Pre-Exposure Prophylaxis assessment and management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Pill,
  Activity,
  Users,
  Info,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ANCPrepModal } from '@/components/medical-record/anc-prep-modal';
import PrepDynamicAlertModal from '@/components/medical-record/prep-dynamic-alert-modal';
import PrepEligibilityModal from '@/components/medical-record/prep-eligibility-modal';

interface PrEPTabProps {
  patientId: string;
  encounterId?: string;
  ancData?: any;
  onDataChange?: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

// Risk factors for PrEP eligibility
const RISK_FACTORS = {
  behavioral: [
    { id: 'inconsistent_condom', label: 'Inconsistent condom use', points: 3 },
    { id: 'multiple_partners', label: 'Multiple sexual partners (≥2 in last 6 months)', points: 3 },
    { id: 'recent_sti', label: 'Recent STI diagnosis', points: 2 },
    { id: 'sex_work', label: 'Engages in transactional sex', points: 4 },
    { id: 'substance_use', label: 'Substance use during sex', points: 2 }
  ],
  partner: [
    { id: 'partner_hiv_positive', label: 'Partner is HIV positive', points: 5 },
    { id: 'partner_unknown_status', label: 'Partner HIV status unknown', points: 2 },
    { id: 'partner_high_risk', label: 'Partner has high-risk behaviors', points: 3 },
    { id: 'partner_not_on_art', label: 'HIV+ partner not on ART', points: 4 }
  ],
  pregnancy: [
    { id: 'trying_conceive', label: 'Trying to conceive with HIV+ partner', points: 5 },
    { id: 'pregnant_high_risk', label: 'Pregnant with ongoing risk exposure', points: 4 },
    { id: 'breastfeeding_risk', label: 'Breastfeeding with ongoing risk', points: 3 }
  ]
};

export function PrEPTab({ 
  patientId, 
  encounterId, 
  ancData,
  onDataChange,
  onNext, 
  onBack 
}: PrEPTabProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('assessment');
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  
  // PrEP assessment state
  const [prepData, setPrepData] = useState({
    // Risk Assessment
    riskScore: 0,
    riskLevel: 'Low' as 'Low' | 'Moderate' | 'High',
    riskFactors: [] as string[],
    
    // Eligibility
    eligibilityStatus: 'pending' as 'eligible' | 'ineligible' | 'conditional' | 'pending',
    contraindications: [] as string[],
    
    // Clinical Assessment
    hivTestDate: '',
    hivTestResult: 'negative' as 'positive' | 'negative' | 'indeterminate',
    acuteHivSymptoms: [] as string[],
    
    // Baseline Tests
    creatinineLevel: '',
    creatinineClearance: '',
    hepatitisBStatus: '' as 'reactive' | 'non-reactive' | 'pending' | '',
    
    // Prescription
    prepRegimen: '' as 'TDF/FTC' | 'TAF/FTC' | 'TDF/3TC' | '',
    startDate: '',
    duration: '30' as '30' | '60' | '90',
    
    // Follow-up
    nextVisitDate: '',
    adherenceCounseling: false,
    condomsProvided: false,
    selfTestKitsProvided: 0
  });

  // Calculate risk score based on selected factors
  const calculateRiskScore = () => {
    let score = 0;
    let factors: string[] = [];

    // Check behavioral risks
    if (ancData?.sexualHistory?.multiplePartners) {
      score += 3;
      factors.push('Multiple partners');
    }
    if (ancData?.sexualHistory?.inconsistentCondomUse) {
      score += 3;
      factors.push('Inconsistent condom use');
    }
    if (ancData?.medicalHistory?.recentSTI) {
      score += 2;
      factors.push('Recent STI');
    }

    // Check partner risks
    if (ancData?.partnerHIVStatus === 'positive') {
      score += 5;
      factors.push('HIV positive partner');
      if (!ancData?.partnerOnART) {
        score += 4;
        factors.push('Partner not on ART');
      }
    } else if (ancData?.partnerHIVStatus === 'unknown') {
      score += 2;
      factors.push('Partner status unknown');
    }

    // Pregnancy-related risks
    if (ancData?.gestationalAge && score > 0) {
      score += 2; // Additional risk during pregnancy
      factors.push('Pregnant with risk factors');
    }

    // Determine risk level
    let level: 'Low' | 'Moderate' | 'High' = 'Low';
    if (score >= 10) level = 'High';
    else if (score >= 5) level = 'Moderate';

    setPrepData(prev => ({
      ...prev,
      riskScore: score,
      riskLevel: level,
      riskFactors: factors
    }));

    return { score, level, factors };
  };

  // Check for contraindications
  const checkContraindications = () => {
    const contraindications: string[] = [];

    // HIV positive
    if (prepData.hivTestResult === 'positive') {
      contraindications.push('HIV positive - refer for ART');
    }

    // Acute HIV symptoms
    if (prepData.acuteHivSymptoms.length > 0) {
      contraindications.push('Acute HIV symptoms present');
    }

    // Renal impairment
    const creatinine = parseFloat(prepData.creatinineLevel);
    if (creatinine > 1.5) {
      contraindications.push('Elevated creatinine');
    }

    // Creatinine clearance < 60
    const clearance = parseFloat(prepData.creatinineClearance);
    if (clearance < 60 && clearance > 0) {
      contraindications.push('Low creatinine clearance');
    }

    setPrepData(prev => ({
      ...prev,
      contraindications,
      eligibilityStatus: contraindications.length === 0 ? 'eligible' : 'ineligible'
    }));

    return contraindications;
  };

  useEffect(() => {
    if (ancData) {
      calculateRiskScore();
    }
  }, [ancData]);

  const handleSavePrEP = async () => {
    try {
      // Validate required fields
      if (!prepData.hivTestDate || !prepData.hivTestResult) {
        toast({
          title: 'Validation Error',
          description: 'Please complete HIV testing information',
          variant: 'destructive'
        });
        return;
      }

      // Check contraindications
      const contraindications = checkContraindications();
      if (contraindications.length > 0 && prepData.eligibilityStatus !== 'conditional') {
        setShowEligibilityModal(true);
        return;
      }

      // Save PrEP data
      onDataChange?.({ prep: prepData });
      
      toast({
        title: 'Success',
        description: 'PrEP assessment saved successfully',
        variant: 'default'
      });

      // Show risk modal if high risk
      if (prepData.riskLevel === 'High') {
        setShowRiskModal(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save PrEP assessment',
        variant: 'destructive'
      });
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityBadgeColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800';
      case 'ineligible': return 'bg-red-100 text-red-800';
      case 'conditional': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Risk Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Pre-Exposure Prophylaxis (PrEP) Assessment
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={getRiskBadgeColor(prepData.riskLevel)}>
                Risk: {prepData.riskLevel} ({prepData.riskScore} points)
              </Badge>
              <Badge className={getEligibilityBadgeColor(prepData.eligibilityStatus)}>
                {prepData.eligibilityStatus === 'pending' ? 'Pending Assessment' : 
                 prepData.eligibilityStatus === 'eligible' ? 'Eligible for PrEP' :
                 prepData.eligibilityStatus === 'conditional' ? 'Conditional Eligibility' :
                 'Not Eligible'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Factors Alert */}
      {prepData.riskFactors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Identified Risk Factors:</strong>
            <ul className="mt-2 ml-4 list-disc">
              {prepData.riskFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Sub-tabs for different sections */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="prescription">Prescription</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
        </TabsList>

        {/* Risk Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">HIV Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Behavioral Risk Factors */}
              <div>
                <Label className="text-sm font-semibold mb-2">Behavioral Risk Factors</Label>
                <div className="space-y-2">
                  {RISK_FACTORS.behavioral.map(factor => (
                    <div key={factor.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={factor.id}
                        checked={prepData.riskFactors.includes(factor.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPrepData(prev => ({
                              ...prev,
                              riskFactors: [...prev.riskFactors, factor.label],
                              riskScore: prev.riskScore + factor.points
                            }));
                          } else {
                            setPrepData(prev => ({
                              ...prev,
                              riskFactors: prev.riskFactors.filter(f => f !== factor.label),
                              riskScore: prev.riskScore - factor.points
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={factor.id} className="text-sm">
                        {factor.label} ({factor.points} points)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partner Risk Factors */}
              <div>
                <Label className="text-sm font-semibold mb-2">Partner Risk Factors</Label>
                <div className="space-y-2">
                  {RISK_FACTORS.partner.map(factor => (
                    <div key={factor.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={factor.id}
                        checked={prepData.riskFactors.includes(factor.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPrepData(prev => ({
                              ...prev,
                              riskFactors: [...prev.riskFactors, factor.label],
                              riskScore: prev.riskScore + factor.points
                            }));
                          } else {
                            setPrepData(prev => ({
                              ...prev,
                              riskFactors: prev.riskFactors.filter(f => f !== factor.label),
                              riskScore: prev.riskScore - factor.points
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={factor.id} className="text-sm">
                        {factor.label} ({factor.points} points)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pregnancy Risk Factors */}
              <div>
                <Label className="text-sm font-semibold mb-2">Pregnancy-Related Risk Factors</Label>
                <div className="space-y-2">
                  {RISK_FACTORS.pregnancy.map(factor => (
                    <div key={factor.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={factor.id}
                        checked={prepData.riskFactors.includes(factor.label)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPrepData(prev => ({
                              ...prev,
                              riskFactors: [...prev.riskFactors, factor.label],
                              riskScore: prev.riskScore + factor.points
                            }));
                          } else {
                            setPrepData(prev => ({
                              ...prev,
                              riskFactors: prev.riskFactors.filter(f => f !== factor.label),
                              riskScore: prev.riskScore - factor.points
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={factor.id} className="text-sm">
                        {factor.label} ({factor.points} points)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setShowPrepModal(true)}
                className="w-full"
              >
                Open Comprehensive PrEP Assessment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eligibility Tab */}
        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Eligibility Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* HIV Testing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hiv-test-date">HIV Test Date</Label>
                  <Input
                    id="hiv-test-date"
                    type="date"
                    value={prepData.hivTestDate}
                    onChange={(e) => setPrepData(prev => ({ ...prev, hivTestDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hiv-result">HIV Test Result</Label>
                  <Select 
                    value={prepData.hivTestResult}
                    onValueChange={(value) => setPrepData(prev => ({ 
                      ...prev, 
                      hivTestResult: value as 'positive' | 'negative' | 'indeterminate'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="indeterminate">Indeterminate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Acute HIV Symptoms */}
              <div>
                <Label>Acute HIV Symptoms (Check all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Fever', 'Fatigue', 'Rash', 'Headache', 'Sore throat', 'Swollen lymph nodes'].map(symptom => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox 
                        id={symptom}
                        checked={prepData.acuteHivSymptoms.includes(symptom)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPrepData(prev => ({
                              ...prev,
                              acuteHivSymptoms: [...prev.acuteHivSymptoms, symptom]
                            }));
                          } else {
                            setPrepData(prev => ({
                              ...prev,
                              acuteHivSymptoms: prev.acuteHivSymptoms.filter(s => s !== symptom)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baseline Laboratory Tests */}
              <div className="space-y-4">
                <h4 className="font-semibold">Baseline Laboratory Tests</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creatinine">Creatinine Level (mg/dL)</Label>
                    <Input
                      id="creatinine"
                      type="number"
                      step="0.1"
                      value={prepData.creatinineLevel}
                      onChange={(e) => setPrepData(prev => ({ ...prev, creatinineLevel: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clearance">Creatinine Clearance (mL/min)</Label>
                    <Input
                      id="clearance"
                      type="number"
                      value={prepData.creatinineClearance}
                      onChange={(e) => setPrepData(prev => ({ ...prev, creatinineClearance: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="hepb">Hepatitis B Status</Label>
                    <Select 
                      value={prepData.hepatitisBStatus}
                      onValueChange={(value) => setPrepData(prev => ({ 
                        ...prev, 
                        hepatitisBStatus: value as 'reactive' | 'non-reactive' | 'pending' | ''
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non-reactive">Non-reactive</SelectItem>
                        <SelectItem value="reactive">Reactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contraindications Display */}
              {prepData.contraindications.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Contraindications Identified:</strong>
                    <ul className="mt-2 ml-4 list-disc">
                      {prepData.contraindications.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={checkContraindications}
                className="w-full"
              >
                Check Eligibility
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription Tab */}
        <TabsContent value="prescription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PrEP Prescription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prepData.eligibilityStatus === 'eligible' ? (
                <>
                  <div>
                    <Label htmlFor="regimen">PrEP Regimen</Label>
                    <Select 
                      value={prepData.prepRegimen}
                      onValueChange={(value) => setPrepData(prev => ({ 
                        ...prev, 
                        prepRegimen: value as 'TDF/FTC' | 'TAF/FTC' | 'TDF/3TC' | ''
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select regimen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TDF/FTC">TDF/FTC (Truvada)</SelectItem>
                        <SelectItem value="TAF/FTC">TAF/FTC (Descovy)</SelectItem>
                        <SelectItem value="TDF/3TC">TDF/3TC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={prepData.startDate}
                        onChange={(e) => setPrepData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Supply Duration (days)</Label>
                      <Select 
                        value={prepData.duration}
                        onValueChange={(value) => setPrepData(prev => ({ 
                          ...prev, 
                          duration: value as '30' | '60' | '90'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Dosing Instructions:</strong>
                      <ul className="mt-2 ml-4 list-disc">
                        <li>TDF/FTC or TAF/FTC: One tablet daily</li>
                        <li>Take with or without food</li>
                        <li>Must be taken consistently for maximum protection</li>
                        <li>Protection begins after 7 days for rectal exposure, 20 days for vaginal</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Patient is not eligible for PrEP prescription. Please review contraindications and address any issues before prescribing.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up Tab */}
        <TabsContent value="followup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow-up & Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="next-visit">Next Visit Date</Label>
                <Input
                  id="next-visit"
                  type="date"
                  value={prepData.nextVisitDate}
                  onChange={(e) => setPrepData(prev => ({ ...prev, nextVisitDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Prevention Services Provided</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="counseling"
                      checked={prepData.adherenceCounseling}
                      onCheckedChange={(checked) => setPrepData(prev => ({ 
                        ...prev, 
                        adherenceCounseling: !!checked 
                      }))}
                    />
                    <Label htmlFor="counseling">Adherence counseling provided</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="condoms"
                      checked={prepData.condomsProvided}
                      onCheckedChange={(checked) => setPrepData(prev => ({ 
                        ...prev, 
                        condomsProvided: !!checked 
                      }))}
                    />
                    <Label htmlFor="condoms">Condoms provided</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="test-kits">HIV self-test kits provided:</Label>
                    <Input
                      id="test-kits"
                      type="number"
                      className="w-20"
                      min="0"
                      max="10"
                      value={prepData.selfTestKitsProvided}
                      onChange={(e) => setPrepData(prev => ({ 
                        ...prev, 
                        selfTestKitsProvided: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  <strong>Follow-up Schedule:</strong>
                  <ul className="mt-2 ml-4 list-disc">
                    <li>1 month after initiation: HIV test, adherence check, side effects</li>
                    <li>Every 3 months: HIV test, STI screening, creatinine (if indicated)</li>
                    <li>Every 6 months: Hepatitis B screening</li>
                    <li>Annually: Complete physical exam and lab workup</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowPrepModal(true)}
          >
            Full Assessment
          </Button>
          <Button 
            onClick={handleSavePrEP}
            disabled={prepData.eligibilityStatus === 'pending'}
          >
            Save PrEP Assessment
          </Button>
          {onNext && (
            <Button onClick={onNext}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPrepModal && (
        <ANCPrepModal
          isOpen={showPrepModal}
          onClose={() => setShowPrepModal(false)}
          onSave={(data) => {
            console.log('PrEP data saved:', data);
            setShowPrepModal(false);
            toast({
              title: 'Success',
              description: 'PrEP assessment completed',
              variant: 'default'
            });
          }}
          initialData={undefined}
        />
      )}

      {showRiskModal && (
        <PrepDynamicAlertModal
          isOpen={showRiskModal}
          onClose={() => setShowRiskModal(false)}
          riskInfo={{
            level: prepData.riskLevel,
            score: prepData.riskScore,
            recommendations: [
              'Initiate PrEP immediately',
              'Provide adherence counseling',
              'Schedule monthly follow-up',
              'Provide condoms and lubricants'
            ],
            clinicalActions: [
              'Prescribe TDF/FTC daily',
              'Order baseline labs',
              'Document in patient record'
            ],
            followUpFrequency: prepData.riskLevel === 'High' ? 'Monthly' : 'Quarterly'
          }}
          triggerTime={Date.now()}
        />
      )}

      {showEligibilityModal && (
        <PrepEligibilityModal
          open={showEligibilityModal}
          onClose={() => setShowEligibilityModal(false)}
          eligibilityData={{
            eligible: prepData.eligibilityStatus === 'eligible',
            reason: prepData.contraindications.join(', '),
            status: prepData.eligibilityStatus as any
          }}
          recommendations={{
            decision: prepData.eligibilityStatus as any,
            clinicalContext: 'ANC PrEP Assessment',
            immediateActions: prepData.eligibilityStatus === 'eligible' 
              ? ['Initiate PrEP', 'Provide counseling']
              : ['Address contraindications', 'Consider alternatives'],
            monitoringRequirements: ['HIV testing', 'Renal function', 'Adherence'],
            followUpTimeline: '1 month',
            safetyConsiderations: prepData.contraindications,
            alternativeOptions: [],
            protocolReferences: ['WHO PrEP Guidelines', 'Zambian ANC Guidelines 2022'],
            screeningGuidance: ['Regular HIV testing', 'Risk reassessment']
          }}
        />
      )}
    </div>
  );
}