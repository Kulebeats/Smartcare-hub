import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, FileText, Building, CheckCircle } from "lucide-react";
import FacilitySelector from "./facility-selector";
import EmergencyChecklist from "./emergency-checklist";

const referralSchema = z.object({
  emergency_referral: z.enum(['yes', 'no']),
  reasons: z.array(z.string()).min(1, "At least one reason is required"),
  facility: z.string().min(1, "Receiving facility is required"),
  provider_name: z.string().optional(),
  provider_phone: z.string().optional(),
  referral_date: z.string().optional(),
  notes: z.string().optional(),
  treatment_before_referral: z.enum(['yes', 'no']).optional(),
  treatment_details: z.string().optional(),
  client_health_info: z.object({
    gestational_age: z.number().min(4).max(42),
    expected_delivery_date: z.string(),
    gravida: z.number().min(1),
    para: z.number().min(0),
    abortions: z.number().min(0),
    living_children: z.number().min(0),
  }),
});

type ReferralFormData = z.infer<typeof referralSchema>;

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReferralFormData) => void;
  initialData?: Partial<ReferralFormData>;
  dangerSigns?: string[];
}

export default function ReferralModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  dangerSigns = []
}: ReferralModalProps) {
  const [activeTab, setActiveTab] = useState("assessment");
  const [checklistProgress, setChecklistProgress] = useState(0);
  const initializedRef = useRef(false);
  
  // Debug logging
  console.log('ReferralModal props:', { isOpen, dangerSigns, initialData });
  
  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      emergency_referral: 'no',
      reasons: [],
      facility: '',
      provider_name: '',
      provider_phone: '',
      referral_date: '',
      notes: '',
      treatment_before_referral: 'no',
      treatment_details: '',
      client_health_info: {
        gestational_age: 0,
        expected_delivery_date: '',
        gravida: 1,
        para: 0,
        abortions: 0,
        living_children: 0,
      },
      ...initialData,
    },
  });

  const watchEmergencyReferral = form.watch("emergency_referral");
  const watchReasons = form.watch("reasons");

  // Auto-populate referral reasons based on danger signs
  useEffect(() => {
    console.log('=== AUTO-POPULATION USEEFFECT TRIGGERED ===');
    console.log('isOpen:', isOpen);
    console.log('dangerSigns:', dangerSigns);
    console.log('dangerSigns.length:', dangerSigns.length);
    
    // Only auto-populate when modal is open and has danger signs
    if (isOpen && dangerSigns && dangerSigns.length > 0) {
      console.log('✅ CONDITIONS MET - Auto-populating referral modal with danger signs:', dangerSigns);
      
      const dangerSignMapping: { [key: string]: string } = {
        'Convulsing': 'convulsions',
        'Vaginal bleeding': 'severe_bleeding',
        'Draining': 'draining',
        'Severe headache': 'severe_headache_bp',
        'Visual disturbance': 'severe_headache_bp',
        'Unconscious': 'unconscious',
        'Imminent delivery': 'imminent_delivery',
        'Labour': 'labour_complications',
        'Severe abdominal pain': 'severe_abdominal_pain',
        'Fever': 'high_fever',
        'Looks very ill': 'looks_very_ill',
        'Severe vomiting': 'severe_vomiting'
      };

      const autoReasons = dangerSigns
        .map(sign => {
          const mapped = dangerSignMapping[sign];
          console.log(`🔄 Mapping danger sign "${sign}" to "${mapped}"`);
          return mapped;
        })
        .filter((reason): reason is string => Boolean(reason));

      console.log('🎯 Auto-selected reasons:', autoReasons);

      if (autoReasons.length > 0) {
        console.log('📝 Setting form values...');
        
        // Use setTimeout to ensure the form and modal are ready
        setTimeout(() => {
          console.log('⏰ Timeout executing - setting form values...');
          
          // Always set emergency referral to yes
          form.setValue("emergency_referral", "yes");
          console.log('✅ Set emergency_referral to "yes"');
          
          // Set the mapped reasons
          form.setValue("reasons", autoReasons);
          console.log('✅ Set reasons to:', autoReasons);
          
          // Force form to recognize the changes
          form.trigger(["emergency_referral", "reasons"]);
          
          // Log the current form state
          console.log('📋 Current form values after update:', form.getValues());
          
          console.log('🎉 Form updated successfully!');
        }, 300);
      } else {
        console.log('❌ No auto-reasons found for danger signs:', dangerSigns);
      }
    } else {
      console.log('❌ CONDITIONS NOT MET for auto-population');
      if (!isOpen) console.log('- Modal is not open');
      if (!dangerSigns || dangerSigns.length === 0) console.log('- No danger signs provided');
    }
    console.log('=== END AUTO-POPULATION ===');
  }, [isOpen, dangerSigns, form]);

  // Separate effect specifically for when modal opens with danger signs
  useEffect(() => {
    if (isOpen) {
      console.log('🚪 MODAL OPENED! Checking for danger signs to auto-populate...');
      console.log('Current danger signs:', dangerSigns);
      
      if (dangerSigns && dangerSigns.length > 0) {
        console.log('🎯 MODAL IS OPEN AND HAS DANGER SIGNS - Triggering auto-population...');
        
        const dangerSignMapping: { [key: string]: string } = {
          'Convulsing': 'convulsions',
          'Vaginal bleeding': 'severe_bleeding',
          'Draining': 'draining',
          'Severe headache': 'severe_headache_bp',
          'Visual disturbance': 'severe_headache_bp',
          'Unconscious': 'unconscious',
          'Imminent delivery': 'imminent_delivery',
          'Labour': 'labour_complications',
          'Severe abdominal pain': 'severe_abdominal_pain',
          'Fever': 'high_fever',
          'Looks very ill': 'looks_very_ill',
          'Severe vomiting': 'severe_vomiting'
        };

        const autoReasons = dangerSigns
          .map(sign => dangerSignMapping[sign])
          .filter((reason): reason is string => Boolean(reason));

        if (autoReasons.length > 0) {
          console.log('🔄 Auto-populating with reasons:', autoReasons);
          
          // Immediate execution - no timeout needed since modal is confirmed open
          form.setValue("emergency_referral", "yes");
          form.setValue("reasons", autoReasons);
          form.trigger(["emergency_referral", "reasons"]);
          
          console.log('✨ AUTO-POPULATION COMPLETE!');
        }
      }
    }
  }, [isOpen]); // Only depend on isOpen, so it triggers every time modal opens

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form to default values when modal closes
      form.reset({
        emergency_referral: 'no',
        reasons: [],
        facility: '',
        provider_name: '',
        provider_phone: '',
        referral_date: '',
        notes: '',
        treatment_before_referral: 'no',
        treatment_details: '',
        client_health_info: {
          gestational_age: 0,
          expected_delivery_date: '',
          gravida: 1,
          para: 0,
          abortions: 0,
          living_children: 0,
        },
        ...initialData,
      });
    }
  }, [isOpen, form, initialData]);

  const emergencyReasons = [
    { value: 'convulsions', label: 'Convulsions/Seizures - immediate transfer required', category: 'emergency' },
    { value: 'severe_bleeding', label: 'Severe vaginal bleeding - Emergency obstetric care', category: 'emergency' },
    { value: 'draining', label: 'Draining/Amniotic fluid leak - Risk of infection', category: 'emergency' },
    { value: 'severe_headache_bp', label: 'Severe headache with high BP/Visual disturbance', category: 'emergency' },
    { value: 'unconscious', label: 'Unconscious patient - Critical emergency', category: 'emergency' },
    { value: 'imminent_delivery', label: 'Imminent delivery - Birth preparation required', category: 'emergency' },
    { value: 'labour_complications', label: 'Labour complications - Preterm or complicated labour', category: 'emergency' },
    { value: 'severe_abdominal_pain', label: 'Severe abdominal pain - Possible complications', category: 'emergency' },
    { value: 'high_fever', label: 'High fever (≥38°C) - Infection concerns', category: 'emergency' },
    { value: 'looks_very_ill', label: 'Patient looks very ill - Clinical deterioration', category: 'emergency' },
    { value: 'severe_vomiting', label: 'Severe vomiting/dehydration - Nutritional concerns', category: 'emergency' },
  ];

  const routineReasons = [
    { value: 'screening_diagnostic', label: 'Screening and diagnostic services', category: 'routine' },
    { value: 'scheduled_referral', label: 'Scheduled referral', category: 'routine' },
    { value: 'other_general_services', label: 'Other general services', category: 'routine' },
  ];

  const allReasons = [...emergencyReasons, ...routineReasons];

  const handleReasonChange = (reasonValue: string, checked: boolean) => {
    const currentReasons = form.getValues("reasons");
    if (checked) {
      form.setValue("reasons", [...currentReasons, reasonValue]);
    } else {
      form.setValue("reasons", currentReasons.filter(r => r !== reasonValue));
    }
  };

  const onSubmit = (data: ReferralFormData) => {
    onSave(data);
    toast({
      title: "Referral Assessment Saved",
      description: `${data.emergency_referral === 'yes' ? 'Emergency' : 'Routine'} referral documented successfully.`,
    });
    onClose();
  };

  const isEmergencyRequired = dangerSigns.some(sign => 
    ['Convulsions', 'Severe vaginal bleeding', 'Severe headache', 'Visual disturbance', 
     'Unconscious', 'Imminent delivery', 'Severe abdominal pain', 'High fever'].includes(sign)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600">
            Referral Assessment
          </DialogTitle>
          <DialogDescription>
            Complete referral assessment and facility coordination
          </DialogDescription>
        </DialogHeader>

        {/* Emergency Alert */}
        {isEmergencyRequired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="text-red-800 font-medium">Emergency Conditions Detected</h4>
                <p className="text-red-700 text-sm">
                  Based on danger signs assessment, emergency referral is required
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assessment" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Assessment</span>
              </TabsTrigger>
              <TabsTrigger value="facility" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Facility</span>
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Checklist</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Summary</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="mt-6">
              <div className="space-y-6">
                {/* Emergency Referral Decision */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">Emergency Referral Required?</h3>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="yes"
                          {...form.register("emergency_referral")}
                          className="text-blue-600"
                        />
                        <span>Yes - Emergency referral</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="no"
                          {...form.register("emergency_referral")}
                          className="text-blue-600"
                        />
                        <span>No - Routine referral</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Referral Reasons */}
                {watchEmergencyReferral === "yes" && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-4">Reasons for Referral</h3>
                      
                      {/* Emergency Reasons */}
                      <div className="space-y-4">
                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <h4 className="text-sm font-medium text-red-600 mb-3">Emergency/Danger Sign Based</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {emergencyReasons.map(reason => (
                              <label key={reason.value} className="flex items-center space-x-2 cursor-pointer hover:bg-red-100 p-2 rounded">
                                <input
                                  type="checkbox"
                                  value={reason.value}
                                  checked={watchReasons.includes(reason.value)}
                                  onChange={(e) => handleReasonChange(reason.value, e.target.checked)}
                                  className="text-red-600"
                                />
                                <span className="text-sm">{reason.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <h4 className="text-sm font-medium text-blue-600 mb-3">Routine Services</h4>
                          <div className="space-y-2">
                            {routineReasons.map(reason => (
                              <label key={reason.value} className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded">
                                <input
                                  type="checkbox"
                                  value={reason.value}
                                  checked={watchReasons.includes(reason.value)}
                                  onChange={(e) => handleReasonChange(reason.value, e.target.checked)}
                                  className="text-blue-600"
                                />
                                <span className="text-sm">{reason.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Treatment Before Referral */}
                {watchEmergencyReferral === "yes" && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-4">Any treatment given before referral?</h3>
                      <div className="space-y-4">
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="yes"
                              {...form.register("treatment_before_referral")}
                              className="text-blue-600"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="no"
                              {...form.register("treatment_before_referral")}
                              className="text-blue-600"
                            />
                            <span>No</span>
                          </label>
                        </div>

                        {form.watch("treatment_before_referral") === "yes" && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Treatment details</label>
                            <textarea
                              {...form.register("treatment_details")}
                              className="w-full border rounded p-2"
                              rows={3}
                              placeholder="Describe treatment given..."
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="facility" className="mt-6">
              <FacilitySelector
                selectedFacility={form.watch("facility")}
                onFacilitySelect={(facility: string) => form.setValue("facility", facility)}
                providerName={form.watch("provider_name")}
                onProviderNameChange={(name: string) => form.setValue("provider_name", name)}
                providerPhone={form.watch("provider_phone")}
                onProviderPhoneChange={(phone: string) => form.setValue("provider_phone", phone)}
              />
            </TabsContent>

            <TabsContent value="checklist" className="mt-6">
              <EmergencyChecklist
                selectedReasons={watchReasons}
                onProgressUpdate={setChecklistProgress}
              />
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Referral Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{watchEmergencyReferral === 'yes' ? 'Emergency' : 'Routine'} Referral</span>
                    </div>
                    <div>
                      <span className="font-medium">Reasons:</span>
                      <span className="ml-2">{watchReasons.length} selected</span>
                    </div>
                    <div>
                      <span className="font-medium">Facility:</span>
                      <span className="ml-2">{form.watch("facility") || 'Not selected'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Checklist Progress:</span>
                      <span className="ml-2">{checklistProgress}%</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                    <textarea
                      {...form.register("notes")}
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Add any additional notes about the referral..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Referral
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}