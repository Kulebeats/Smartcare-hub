import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

// Visit Details & Triage Modal
export const VisitDetailsModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSave: (data: any) => void;
}> = ({ open, onOpenChange, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});
  const [showSeriousIllness, setShowSeriousIllness] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Success",
      description: "Visit details have been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visit Details & Triage</DialogTitle>
          <DialogDescription>
            Record visit information and initial assessment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="reasonForVisit">Reason for HIV care and treatment visit <span className="text-red-500">*</span></Label>
              <Select
                value={formData.reasonForVisit || ''}
                onValueChange={(value) => setFormData({ ...formData, reasonForVisit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_clinical">First clinical visit</SelectItem>
                  <SelectItem value="scheduled_clinical">Scheduled clinical visit</SelectItem>
                  <SelectItem value="unscheduled_clinical">Unscheduled clinical visit</SelectItem>
                  <SelectItem value="arv_pickup">ARV drug pick-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Signs of Serious Illness</Label>
              <RadioGroup
                value={showSeriousIllness ? 'yes' : 'no'}
                onValueChange={(value) => setShowSeriousIllness(value === 'yes')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="illness_none" />
                  <Label htmlFor="illness_none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="illness_present" />
                  <Label htmlFor="illness_present">Present</Label>
                </div>
              </RadioGroup>

              {showSeriousIllness && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-red-50 rounded-lg">
                  {[
                    { id: 'fever_high', label: 'Fever ≥ 39°C' },
                    { id: 'tachycardia', label: 'Tachycardia' },
                    { id: 'tachypnea', label: 'Tachypnea' },
                    { id: 'walk_unaided', label: 'Unable to walk unaided' },
                    { id: 'lethargy', label: 'Lethargy' },
                    { id: 'unconscious', label: 'Unconsciousness' },
                    { id: 'convulsions', label: 'Convulsions' },
                    { id: 'repeated_vomiting', label: 'Repeated vomiting' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={formData[item.id] || false}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, [item.id]: checked })
                        }
                      />
                      <Label htmlFor={item.id}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ART & PMTCT History Modal
export const ARTHistoryModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSave: (data: any) => void;
}> = ({ open, onOpenChange, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [showARTDetails, setShowARTDetails] = useState(false);
  const [showNewARTDetails, setShowNewARTDetails] = useState(false);
  const [showPriorARV, setShowPriorARV] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Success",
      description: "ART & PMTCT history has been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ART & PMTCT History</DialogTitle>
          <DialogDescription>
            Record HIV care enrollment and treatment history
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* HIV Care Enrollment Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">HIV Care Enrollment</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_enrolled">Date Enrolled in HIV Care <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  id="date_enrolled"
                  value={formData.date_enrolled || ''}
                  onChange={(e) => setFormData({ ...formData, date_enrolled: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="transfer_in">Transfer In for HIV Care</Label>
                <Select
                  value={formData.transfer_in || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, transfer_in: value });
                    setShowTransferDetails(value === 'yes');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showTransferDetails && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-purple-50 rounded">
                <div>
                  <Label htmlFor="date_transfer_in">Date of Transfer In</Label>
                  <Input
                    type="date"
                    id="date_transfer_in"
                    value={formData.date_transfer_in || ''}
                    onChange={(e) => setFormData({ ...formData, date_transfer_in: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="facility_transferred_from">Facility Transferred From</Label>
                  <Input
                    type="text"
                    id="facility_transferred_from"
                    placeholder="Enter facility name"
                    value={formData.facility_transferred_from || ''}
                    onChange={(e) => setFormData({ ...formData, facility_transferred_from: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mother's HIV History Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">Mother's HIV History</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="art_status">ART Status at First ANC Visit <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.art_status || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, art_status: value });
                    setShowARTDetails(value === 'already_on_art');
                    setShowNewARTDetails(value === 'newly_on_art');
                    setShowPriorARV(value !== 'not_on_art');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="already_on_art">Already on ART at first ANC visit</SelectItem>
                    <SelectItem value="newly_on_art">Newly on ART during pregnancy</SelectItem>
                    <SelectItem value="not_on_art">Not on ART</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hiv_diagnosis_date">Date of HIV Diagnosis</Label>
                <Input
                  type="date"
                  id="hiv_diagnosis_date"
                  value={formData.hiv_diagnosis_date || ''}
                  onChange={(e) => setFormData({ ...formData, hiv_diagnosis_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {showARTDetails && (
              <div className="space-y-4 p-3 bg-blue-50 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="art_start_date">ART Start Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      id="art_start_date"
                      value={formData.art_start_date || ''}
                      onChange={(e) => setFormData({ ...formData, art_start_date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_regimen">Current ART Regimen <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.current_regimen || ''}
                      onValueChange={(value) => setFormData({ ...formData, current_regimen: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select regimen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TDF+3TC+DTG">TDF + 3TC + DTG (First line)</SelectItem>
                        <SelectItem value="TDF+3TC+EFV">TDF + 3TC + EFV</SelectItem>
                        <SelectItem value="AZT+3TC+DTG">AZT + 3TC + DTG</SelectItem>
                        <SelectItem value="ABC+3TC+DTG">ABC + 3TC + DTG</SelectItem>
                        <SelectItem value="Other">Other regimen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adherence_status">Adherence Status</Label>
                    <Select
                      value={formData.adherence_status || ''}
                      onValueChange={(value) => setFormData({ ...formData, adherence_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Good (≥95%)</SelectItem>
                        <SelectItem value="fair">Fair (85-94%)</SelectItem>
                        <SelectItem value="poor">Poor (&lt;85%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="last_viral_load">Last Viral Load</Label>
                    <Input
                      type="number"
                      id="last_viral_load"
                      placeholder="copies/ml"
                      value={formData.last_viral_load || ''}
                      onChange={(e) => setFormData({ ...formData, last_viral_load: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Clinical Assessment Modal
export const ClinicalAssessmentModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSave: (data: any) => void;
}> = ({ open, onOpenChange, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});
  const [showStageSymptoms, setShowStageSymptoms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Success",
      description: "Clinical assessment has been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Clinical Assessment</DialogTitle>
          <DialogDescription>
            WHO staging and clinical evaluation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TB Screening */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">TB Screening</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'cough', label: 'Cough' },
                { id: 'fever', label: 'Fever' },
                { id: 'night_sweats', label: 'Night Sweats' },
                { id: 'weight_loss', label: 'Weight Loss' }
              ].map((symptom) => (
                <div key={symptom.id} className="space-y-2">
                  <Label>{symptom.label}</Label>
                  <RadioGroup
                    value={formData[symptom.id] || 'no'}
                    onValueChange={(value) => setFormData({ ...formData, [symptom.id]: value })}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`${symptom.id}_yes`} />
                        <Label htmlFor={`${symptom.id}_yes`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`${symptom.id}_no`} />
                        <Label htmlFor={`${symptom.id}_no`}>No</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>

          {/* WHO Clinical Stage */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">WHO Clinical Stage</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="who_stage">Current WHO Stage</Label>
                <Select
                  value={formData.who_stage || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, who_stage: value });
                    setShowStageSymptoms(value && value !== '1');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Stage 1</SelectItem>
                    <SelectItem value="2">Stage 2</SelectItem>
                    <SelectItem value="3">Stage 3</SelectItem>
                    <SelectItem value="4">Stage 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cd4_count">CD4 Count (if available)</Label>
                <Input
                  type="number"
                  id="cd4_count"
                  placeholder="cells/mm³"
                  value={formData.cd4_count || ''}
                  onChange={(e) => setFormData({ ...formData, cd4_count: e.target.value })}
                />
              </div>
            </div>
          </div>

          {showStageSymptoms && (
            <div className="space-y-4 p-4 bg-blue-50 rounded">
              <h5 className="font-medium">WHO Clinical Stage Conditions/Symptoms</h5>
              
              {/* Stage-specific symptoms would be added here */}
              <div className="space-y-2">
                <Label>Select applicable symptoms for the chosen stage</Label>
                {/* Simplified for brevity - actual implementation would have stage-specific symptoms */}
                <Textarea
                  placeholder="List observed symptoms..."
                  value={formData.symptoms || ''}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Opportunistic Infections */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Opportunistic Infections</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'oi_tb', label: 'Tuberculosis' },
                { id: 'oi_candidiasis', label: 'Oral Candidiasis' },
                { id: 'oi_pneumonia', label: 'Pneumonia' },
                { id: 'oi_other', label: 'Other infections' }
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData[item.id] || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, [item.id]: checked })
                    }
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Lab Results Modal
export const LabResultsModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSave: (data: any) => void;
}> = ({ open, onOpenChange, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Success",
      description: "Lab results have been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lab Results & Investigations</DialogTitle>
          <DialogDescription>
            Record laboratory test results
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lab Results Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">Lab Results</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hemoglobin">Hb/HCT</Label>
                <Input
                  type="text"
                  id="hemoglobin"
                  placeholder="g/dL"
                  value={formData.hemoglobin || ''}
                  onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="alt">ALT</Label>
                <Input
                  type="text"
                  id="alt"
                  placeholder="U/L"
                  value={formData.alt || ''}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="creatinine">Creatinine</Label>
                <Input
                  type="text"
                  id="creatinine"
                  placeholder="mg/dL"
                  value={formData.creatinine || ''}
                  onChange={(e) => setFormData({ ...formData, creatinine: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="rpr_rst">RPR/RST</Label>
                <Select
                  value={formData.rpr_rst || ''}
                  onValueChange={(value) => setFormData({ ...formData, rpr_rst: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">+ve</SelectItem>
                    <SelectItem value="negative">-ve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hbsag">HBsAg</Label>
                <Select
                  value={formData.hbsag || ''}
                  onValueChange={(value) => setFormData({ ...formData, hbsag: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">+ve</SelectItem>
                    <SelectItem value="negative">-ve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="serum_crag">Serum CrAg</Label>
                <Select
                  value={formData.serum_crag || ''}
                  onValueChange={(value) => setFormData({ ...formData, serum_crag: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">+ve</SelectItem>
                    <SelectItem value="negative">-ve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="cd4_count_lab">CD4 Count</Label>
                <Input
                  type="number"
                  id="cd4_count_lab"
                  placeholder="cells/mm³"
                  value={formData.cd4_count_lab || ''}
                  onChange={(e) => setFormData({ ...formData, cd4_count_lab: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="viral_load">Viral Load</Label>
                <Input
                  type="number"
                  id="viral_load"
                  placeholder="copies/ml"
                  value={formData.viral_load || ''}
                  onChange={(e) => setFormData({ ...formData, viral_load: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Investigations to Order */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">Investigations to Order</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'inv_fbc', label: 'FBC' },
                { id: 'inv_vl', label: 'Viral Load' },
                { id: 'inv_preg', label: 'Pregnancy test' },
                { id: 'inv_alt', label: 'ALT & AST' },
                { id: 'inv_cd4', label: 'CD4 count' },
                { id: 'inv_rpr', label: 'RPR/RST' },
                { id: 'inv_sputum', label: 'Sputum aFB/RIF' }
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData[item.id] || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, [item.id]: checked })
                    }
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="other_tests">Other Test Results</Label>
            <Textarea
              id="other_tests"
              placeholder="Enter any other relevant test results..."
              value={formData.other_tests || ''}
              onChange={(e) => setFormData({ ...formData, other_tests: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ART Response & VL Monitoring Modal
export const ARTResponseModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSave: (data: any) => void;
}> = ({ open, onOpenChange, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Success",
      description: "ART response monitoring has been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ART Response & VL Monitoring</DialogTitle>
          <DialogDescription>
            Record treatment response and viral load monitoring
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Response to ART */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">Response to ART</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="art_duration">Has patient been on ART &gt;6mos?</Label>
                <Select
                  value={formData.art_duration || ''}
                  onValueChange={(value) => setFormData({ ...formData, art_duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="na">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="iris">Does the patient have IRIS?</Label>
                <Select
                  value={formData.iris || ''}
                  onValueChange={(value) => setFormData({ ...formData, iris: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="missed_doses">Number of missed doses since last visit</Label>
                <Input
                  type="number"
                  id="missed_doses"
                  min="0"
                  placeholder="0"
                  value={formData.missed_doses || ''}
                  onChange={(e) => setFormData({ ...formData, missed_doses: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* VL Monitoring */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">VL Monitoring</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="vl_reason">Reason for VL Test</Label>
                <Select
                  value={formData.vl_reason || ''}
                  onValueChange={(value) => setFormData({ ...formData, vl_reason: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Monitoring</SelectItem>
                    <SelectItem value="targeted">Targeted (Suspected Failure)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recent_vl">Recent VL Result</Label>
                <Input
                  type="text"
                  id="recent_vl"
                  placeholder="copies/ml"
                  value={formData.recent_vl || ''}
                  onChange={(e) => setFormData({ ...formData, recent_vl: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="sample_date">Date of sample collection</Label>
                <Input
                  type="date"
                  id="sample_date"
                  value={formData.sample_date || ''}
                  onChange={(e) => setFormData({ ...formData, sample_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Clinical Plan Modal
export const ClinicalPlanModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSave: (data: any) => void;
}> = ({ open, onOpenChange, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});
  const [showTPTRegimen, setShowTPTRegimen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Success",
      description: "Clinical plan has been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Clinical Plan</DialogTitle>
          <DialogDescription>
            Treatment decisions and PMTCT interventions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clinical Plan */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">Plan</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'plan_tpt_prov', label: 'Provide TPT' },
                { id: 'plan_ctx_prov', label: 'Provide CTX' },
                { id: 'plan_eac_prov', label: 'Provide EAC' },
                { id: 'plan_art_start', label: 'Start ART' },
                { id: 'plan_art_cont', label: 'Continue ART' },
                { id: 'plan_art_mod', label: 'Modify ART' },
                { id: 'plan_tb_eval', label: 'Evaluate for TB' },
                { id: 'plan_fp', label: 'Provide family planning' },
                { id: 'plan_dsd', label: 'Continue in DSD' }
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={formData[item.id] || false}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, [item.id]: checked });
                      if (item.id === 'plan_tpt_prov') {
                        setShowTPTRegimen(checked as boolean);
                      }
                    }}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
            
            {showTPTRegimen && (
              <div className="p-3 bg-blue-50 rounded mt-4">
                <h5 className="font-medium mb-3">TPT Regimen</h5>
                <div>
                  <Label htmlFor="tpt_regimen_type">TPT Regimen Type</Label>
                  <Select
                    value={formData.tpt_regimen_type || ''}
                    onValueChange={(value) => setFormData({ ...formData, tpt_regimen_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select if starting TPT..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3hp">3HP</SelectItem>
                      <SelectItem value="1hp">1HP</SelectItem>
                      <SelectItem value="6h">6H</SelectItem>
                      <SelectItem value="levo">Six months of levofloxacin daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="treatment_plan">Treatment Plan & Modifications</Label>
            <Textarea
              id="treatment_plan"
              placeholder="Document any treatment changes, new medications, or clinical decisions..."
              value={formData.treatment_plan || ''}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Counselling & Follow-up Modal
export const CounsellingModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onSave: (data: any) => void;
}> = ({ open, onOpenChange, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});
  const [showPartnerART, setShowPartnerART] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Success",
      description: "Counselling and follow-up information has been saved successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Counselling & Follow-up</DialogTitle>
          <DialogDescription>
            Partner testing, infant feeding, and next visit planning
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partner Information */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Partner Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partner_hiv_status">Partner HIV Status</Label>
                <Select
                  value={formData.partner_hiv_status || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, partner_hiv_status: value });
                    setShowPartnerART(value === 'positive');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="not_tested">Not tested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="partner_testing_counselled">Partner Testing Counselled</Label>
                <Select
                  value={formData.partner_testing_counselled || ''}
                  onValueChange={(value) => setFormData({ ...formData, partner_testing_counselled: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showPartnerART && (
              <div className="p-3 bg-yellow-50 rounded">
                <Label htmlFor="partner_on_art">Partner on ART?</Label>
                <Select
                  value={formData.partner_on_art || ''}
                  onValueChange={(value) => setFormData({ ...formData, partner_on_art: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Infant Feeding Counselling */}
          <div>
            <Label htmlFor="infant_feeding">Infant Feeding Counselling</Label>
            <Select
              value={formData.infant_feeding || ''}
              onValueChange={(value) => setFormData({ ...formData, infant_feeding: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select counselling provided" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ebf">Exclusive breastfeeding counselled</SelectItem>
                <SelectItem value="eff">Exclusive formula feeding counselled</SelectItem>
                <SelectItem value="mixed">Mixed feeding risks discussed</SelectItem>
                <SelectItem value="not_done">Not yet done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next Appointment */}
          <div>
            <Label htmlFor="next_appointment">Next Appointment Date</Label>
            <Input
              type="date"
              id="next_appointment"
              value={formData.next_appointment || ''}
              onChange={(e) => setFormData({ ...formData, next_appointment: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="counselling_notes">Additional Counselling Notes</Label>
            <Textarea
              id="counselling_notes"
              placeholder="Document any additional counselling provided, referrals made, or follow-up instructions..."
              value={formData.counselling_notes || ''}
              onChange={(e) => setFormData({ ...formData, counselling_notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};