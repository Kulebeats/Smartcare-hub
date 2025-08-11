/**
 * PMTCT (Prevention of Mother-to-Child Transmission) Tab Component
 * Handles HIV/AIDS care and prevention for pregnant women
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Baby, Heart, AlertTriangle, Calendar, Pill, Activity } from 'lucide-react';
import { useAncEncounter } from '@/hooks/anc/useAncEncounter';
import { safeLog } from '@/utils/anc/safe-logger';

interface PMTCTTabProps {
  patientId: string;
  encounterId?: string;
  onNext?: () => void;
  onBack?: () => void;
}

interface ARTRegimen {
  id: string;
  name: string;
  drugs: string[];
  suitableFor: string[];
  contraindications?: string[];
}

const ART_REGIMENS: ARTRegimen[] = [
  {
    id: 'first_line_tdf',
    name: 'TDF + 3TC + DTG',
    drugs: ['Tenofovir', 'Lamivudine', 'Dolutegravir'],
    suitableFor: ['newly_diagnosed', 'treatment_naive'],
    contraindications: ['Renal disease (CrCl <50)']
  },
  {
    id: 'first_line_abc',
    name: 'ABC + 3TC + DTG',
    drugs: ['Abacavir', 'Lamivudine', 'Dolutegravir'],
    suitableFor: ['treatment_naive', 'tdf_contraindicated'],
    contraindications: ['HLA-B*5701 positive']
  },
  {
    id: 'alternative_efv',
    name: 'TDF + 3TC + EFV',
    drugs: ['Tenofovir', 'Lamivudine', 'Efavirenz'],
    suitableFor: ['dtg_contraindicated'],
    contraindications: ['First trimester pregnancy', 'Psychiatric conditions']
  },
  {
    id: 'second_line',
    name: 'AZT + 3TC + LPV/r',
    drugs: ['Zidovudine', 'Lamivudine', 'Lopinavir/ritonavir'],
    suitableFor: ['treatment_experienced', 'first_line_failure']
  }
];

export const PMTCTTab: React.FC<PMTCTTabProps> = ({
  patientId,
  encounterId,
  onNext,
  onBack
}) => {
  const {
    state,
    saveEncounter,
    currentTrimester
  } = useAncEncounter({ patientId, encounterId });
  
  // HIV Testing & Status
  const [hivStatus, setHivStatus] = useState({
    testDate: '',
    result: 'negative' as 'positive' | 'negative' | 'indeterminate',
    partnerTested: false,
    partnerResult: '',
    discordantCouple: false
  });
  
  // ART Management (for HIV+ patients)
  const [artManagement, setArtManagement] = useState({
    onART: false,
    artStartDate: '',
    currentRegimen: '',
    adherence: 'good' as 'good' | 'fair' | 'poor',
    lastViralLoad: '',
    viralLoadDate: '',
    cd4Count: '',
    cd4Date: ''
  });
  
  // Infant Prophylaxis Planning
  const [infantProphylaxis, setInfantProphylaxis] = useState({
    planned: false,
    birthDose: 'NVP',
    duration: '6weeks',
    feedingMethod: 'exclusive_breastfeeding',
    counselingProvided: false
  });
  
  // Opportunistic Infections
  const [oiScreening, setOiScreening] = useState({
    tbScreening: false,
    tbSymptoms: [] as string[],
    cotrimoxazole: false,
    otherOI: [] as string[]
  });
  
  const calculateTransmissionRisk = () => {
    if (hivStatus.result !== 'positive') return 'N/A';
    
    const vl = artManagement.lastViralLoad ? parseInt(artManagement.lastViralLoad) : null;
    
    if (!artManagement.onART) return 'HIGH';
    if (!vl) return 'UNKNOWN';
    if (vl < 50) return 'VERY LOW (<1%)';
    if (vl < 1000) return 'LOW (1-5%)';
    if (vl < 10000) return 'MODERATE (5-10%)';
    return 'HIGH (>10%)';
  };
  
  const transmissionRisk = calculateTransmissionRisk();
  
  const handleSaveAndNext = async () => {
    const pmtctData = {
      hivStatus,
      artManagement: hivStatus.result === 'positive' ? artManagement : null,
      infantProphylaxis,
      oiScreening,
      transmissionRisk,
      timestamp: new Date().toISOString()
    };
    
    safeLog.clinical('PMTCT data saved', {
      patientId,
      encounterId,
      hivPositive: hivStatus.result === 'positive',
      onART: artManagement.onART,
      transmissionRisk
    });
    
    const result = await saveEncounter();
    if (result.success) {
      onNext?.();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* HIV Status & Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>HIV Status & Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-date">Last HIV Test Date</Label>
              <Input
                id="test-date"
                type="date"
                value={hivStatus.testDate}
                onChange={(e) => setHivStatus({...hivStatus, testDate: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="hiv-result">HIV Test Result</Label>
              <Select 
                value={hivStatus.result}
                onValueChange={(value: any) => setHivStatus({...hivStatus, result: value})}
              >
                <SelectTrigger id="hiv-result">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="indeterminate">Indeterminate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={hivStatus.partnerTested}
                  onCheckedChange={(checked) => 
                    setHivStatus({...hivStatus, partnerTested: checked as boolean})
                  }
                />
                <Label>Partner Tested</Label>
                {hivStatus.partnerTested && (
                  <Select 
                    value={hivStatus.partnerResult}
                    onValueChange={(value) => setHivStatus({...hivStatus, partnerResult: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            {hivStatus.partnerTested && hivStatus.partnerResult && 
             hivStatus.result !== hivStatus.partnerResult && (
              <div className="col-span-2">
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    Discordant couple detected - Enhanced counseling required
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* ART Management (for HIV+ patients) */}
      {hivStatus.result === 'positive' && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-red-600" />
              <span>ART Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={artManagement.onART}
                  onCheckedChange={(checked) => 
                    setArtManagement({...artManagement, onART: checked as boolean})
                  }
                />
                <Label>Currently on ART</Label>
                {!artManagement.onART && (
                  <Alert className="flex-1 border-red-500 bg-red-50">
                    <AlertDescription className="text-red-800">
                      <strong>URGENT:</strong> Start ART immediately (same day) for all HIV+ pregnant women
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {artManagement.onART && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ART Start Date</Label>
                      <Input
                        type="date"
                        value={artManagement.artStartDate}
                        onChange={(e) => setArtManagement({...artManagement, artStartDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Current Regimen</Label>
                      <Select 
                        value={artManagement.currentRegimen}
                        onValueChange={(value) => setArtManagement({...artManagement, currentRegimen: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select regimen" />
                        </SelectTrigger>
                        <SelectContent>
                          {ART_REGIMENS.map(regimen => (
                            <SelectItem key={regimen.id} value={regimen.id}>
                              {regimen.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Adherence</Label>
                      <Select 
                        value={artManagement.adherence}
                        onValueChange={(value: any) => setArtManagement({...artManagement, adherence: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Good (≥95%)</SelectItem>
                          <SelectItem value="fair">Fair (85-94%)</SelectItem>
                          <SelectItem value="poor">Poor (<85%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Last Viral Load (copies/mL)</Label>
                      <Input
                        type="number"
                        value={artManagement.lastViralLoad}
                        onChange={(e) => setArtManagement({...artManagement, lastViralLoad: e.target.value})}
                        placeholder="e.g., <50"
                      />
                    </div>
                    <div>
                      <Label>Viral Load Date</Label>
                      <Input
                        type="date"
                        value={artManagement.viralLoadDate}
                        onChange={(e) => setArtManagement({...artManagement, viralLoadDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>CD4 Count (cells/mm³)</Label>
                      <Input
                        type="number"
                        value={artManagement.cd4Count}
                        onChange={(e) => setArtManagement({...artManagement, cd4Count: e.target.value})}
                        placeholder="e.g., 450"
                      />
                    </div>
                    <div>
                      <Label>CD4 Date</Label>
                      <Input
                        type="date"
                        value={artManagement.cd4Date}
                        onChange={(e) => setArtManagement({...artManagement, cd4Date: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Transmission Risk Assessment */}
            <div className="mt-4 p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Transmission Risk:</span>
                <span className={`px-3 py-1 rounded-full text-white font-bold ${
                  transmissionRisk === 'VERY LOW (<1%)' ? 'bg-green-600' :
                  transmissionRisk === 'LOW (1-5%)' ? 'bg-yellow-600' :
                  transmissionRisk === 'MODERATE (5-10%)' ? 'bg-orange-600' :
                  transmissionRisk === 'HIGH (>10%)' ? 'bg-red-600' :
                  'bg-gray-600'
                }`}>
                  {transmissionRisk}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Infant Prophylaxis Planning */}
      {hivStatus.result === 'positive' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Baby className="w-5 h-5 text-blue-600" />
              <span>Infant Prophylaxis Planning</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={infantProphylaxis.planned}
                  onCheckedChange={(checked) => 
                    setInfantProphylaxis({...infantProphylaxis, planned: checked as boolean})
                  }
                />
                <Label>Infant prophylaxis planned</Label>
              </div>
              
              {infantProphylaxis.planned && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Birth Dose</Label>
                      <Select 
                        value={infantProphylaxis.birthDose}
                        onValueChange={(value) => 
                          setInfantProphylaxis({...infantProphylaxis, birthDose: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NVP">Nevirapine (NVP)</SelectItem>
                          <SelectItem value="AZT">Zidovudine (AZT)</SelectItem>
                          <SelectItem value="AZT_NVP">AZT + NVP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Select 
                        value={infantProphylaxis.duration}
                        onValueChange={(value) => 
                          setInfantProphylaxis({...infantProphylaxis, duration: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6weeks">6 weeks</SelectItem>
                          <SelectItem value="12weeks">12 weeks</SelectItem>
                          <SelectItem value="extended">Extended (high risk)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Feeding Method</Label>
                      <Select 
                        value={infantProphylaxis.feedingMethod}
                        onValueChange={(value) => 
                          setInfantProphylaxis({...infantProphylaxis, feedingMethod: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exclusive_breastfeeding">Exclusive Breastfeeding</SelectItem>
                          <SelectItem value="exclusive_formula">Exclusive Formula</SelectItem>
                          <SelectItem value="mixed">Mixed Feeding (Not Recommended)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {infantProphylaxis.feedingMethod === 'mixed' && (
                    <Alert className="border-yellow-500 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription>
                        Mixed feeding increases transmission risk. Counsel on exclusive feeding methods.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={infantProphylaxis.counselingProvided}
                      onCheckedChange={(checked) => 
                        setInfantProphylaxis({...infantProphylaxis, counselingProvided: checked as boolean})
                      }
                    />
                    <Label>Infant feeding counseling provided</Label>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Opportunistic Infections Screening */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Opportunistic Infections Screening</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={oiScreening.tbScreening}
                onCheckedChange={(checked) => 
                  setOiScreening({...oiScreening, tbScreening: checked as boolean})
                }
              />
              <Label>TB Screening Performed</Label>
            </div>
            
            {oiScreening.tbScreening && (
              <div>
                <Label>TB Symptoms (check all that apply)</Label>
                <div className="mt-2 space-y-2">
                  {[
                    'Cough >2 weeks',
                    'Night sweats',
                    'Weight loss',
                    'Fever',
                    'Hemoptysis'
                  ].map(symptom => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        checked={oiScreening.tbSymptoms.includes(symptom)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOiScreening({
                              ...oiScreening,
                              tbSymptoms: [...oiScreening.tbSymptoms, symptom]
                            });
                          } else {
                            setOiScreening({
                              ...oiScreening,
                              tbSymptoms: oiScreening.tbSymptoms.filter(s => s !== symptom)
                            });
                          }
                        }}
                      />
                      <Label className="font-normal">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={oiScreening.cotrimoxazole}
                onCheckedChange={(checked) => 
                  setOiScreening({...oiScreening, cotrimoxazole: checked as boolean})
                }
              />
              <Label>Cotrimoxazole Prophylaxis</Label>
            </div>
            
            <div>
              <Label>Other OI Screening</Label>
              <div className="mt-2 space-y-2">
                {[
                  'Cryptococcal screening',
                  'Hepatitis B/C',
                  'STI screening',
                  'Malaria prophylaxis'
                ].map(screening => (
                  <div key={screening} className="flex items-center space-x-2">
                    <Checkbox
                      checked={oiScreening.otherOI.includes(screening)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setOiScreening({
                            ...oiScreening,
                            otherOI: [...oiScreening.otherOI, screening]
                          });
                        } else {
                          setOiScreening({
                            ...oiScreening,
                            otherOI: oiScreening.otherOI.filter(s => s !== screening)
                          });
                        }
                      }}
                    />
                    <Label className="font-normal">{screening}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* PMTCT Summary */}
      <Card className={hivStatus.result === 'positive' ? 'bg-red-50' : 'bg-green-50'}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">HIV Status:</span>
              <span className={`font-bold ${
                hivStatus.result === 'positive' ? 'text-red-600' : 'text-green-600'
              }`}>
                {hivStatus.result.toUpperCase()}
              </span>
            </div>
            {hivStatus.result === 'positive' && (
              <>
                <div className="flex justify-between">
                  <span className="font-semibold">On ART:</span>
                  <span className={artManagement.onART ? 'text-green-600' : 'text-red-600'}>
                    {artManagement.onART ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Transmission Risk:</span>
                  <span>{transmissionRisk}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Infant Prophylaxis:</span>
                  <span className={infantProphylaxis.planned ? 'text-green-600' : 'text-orange-600'}>
                    {infantProphylaxis.planned ? 'Planned' : 'Not Planned'}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleSaveAndNext}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Save & Complete
        </Button>
      </div>
    </div>
  );
};