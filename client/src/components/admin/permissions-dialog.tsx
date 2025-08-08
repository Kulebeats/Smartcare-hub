import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { X } from 'lucide-react';

// Permissions grouped by category
const PERMISSIONS_BY_CATEGORY = {
  "Medical Records": [
    { id: "MedicalEncounter", label: "Medical Encounter" },
    { id: "MedicalEncounterIPD", label: "Medical Encounter IPD" },
  ],
  "ART": [
    { id: "ART", label: "ART" },
    { id: "ARTInitial", label: "ART Initial" },
    { id: "ARTFollowUp", label: "ART Follow-up" },
    { id: "ARTPediatric", label: "ART Pediatric" },
    { id: "ARTStableOnCare", label: "ART Stable On Care" },
  ],
  "PEP & PREP": [
    { id: "PEP", label: "PEP" },
    { id: "PREP", label: "PREP" },
    { id: "PREPFollowUp", label: "PREP Follow-up" },
  ],
  "TB Service": [
    { id: "TBService", label: "TB Service" },
    { id: "TBScreening", label: "TB Screening" },
    { id: "TBFollowUp", label: "TB Follow-up" },
  ],
  "ANC": [
    { id: "ANCService", label: "ANC Service" },
    { id: "ANC_Initial_Already_On_ART", label: "ANC Initial Already On ART" },
    { id: "ANCFollowUp", label: "ANC Follow-up" },
    { id: "ANCLabourAndDelivery", label: "ANC Labour And Delivery" },
    { id: "ANCLabourAndDeliveryPMTCT", label: "ANC Labour And Delivery PMTCT" },
    { id: "ANCLabourAndDeliverySummary", label: "ANC Labour And Delivery Summary" },
    { id: "ANCDeliveryDischargeMother", label: "ANC Delivery Discharge Mother" },
    { id: "ANCDeliveryDischargeBaby", label: "ANC Delivery Discharge Baby" },
    { id: "ANC_1st_Time_On_ART", label: "ANC 1st Time On ART" },
  ],
  "Postnatal": [
    { id: "PostnatalAdult", label: "Postnatal Adult" },
    { id: "PostnatalPMTCT_Adult", label: "Postnatal PMTCT Adult" },
    { id: "PostnatalPediatric", label: "Postnatal Pediatric" },
    { id: "PostnatalPMTCT_Pediatric", label: "Postnatal PMTCT Pediatric" },
  ],
  "Pediatric": [
    { id: "PediatricInitial", label: "Pediatric Initial" },
    { id: "PediatricFollowUp", label: "Pediatric Follow-up" },
    { id: "PediatricStableOnCare", label: "Pediatric Stable On Care" },
  ],
  "VMMC": [
    { id: "VMMC", label: "VMMC" },
    { id: "VMMCReview", label: "VMMC Review" },
  ],
  "Vitals": [
    { id: "Vital", label: "Vital" },
    { id: "PreTransfusionVital", label: "Pre-Transfusion Vital" },
    { id: "IntraTransfusionVital", label: "Intra-Transfusion Vital" },
  ],
  "Records": [
    { id: "BirthRecords", label: "Birth Records" },
    { id: "DeathRecords", label: "Death Records" },
  ],
  "Other Services": [
    { id: "NursingPlan", label: "Nursing Plan" },
    { id: "Referral", label: "Referral" },
    { id: "Surgery", label: "Surgery" },
    { id: "Investigation", label: "Investigation" },
    { id: "Prescriptions", label: "Prescriptions" },
    { id: "Dispensations", label: "Dispensations" },
    { id: "Covid", label: "Covid" },
    { id: "AdverseEvent", label: "Adverse Event" },
    { id: "HTS", label: "HTS" },
    { id: "CervicalCancer", label: "Cervical Cancer" },
    { id: "OBV", label: "OBV" },
    { id: "Result", label: "Result" },
    { id: "TBIntensivePhaseIndicator", label: "TB Intensive Phase Indicator" },
    { id: "Triage", label: "Triage" },
    { id: "FamilyPlanning", label: "Family Planning" },
  ],
};

// Flatten permissions for easier lookup
const ALL_PERMISSIONS = Object.values(PERMISSIONS_BY_CATEGORY).flat();

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
    permissions?: string[];
  };
  onSuccess?: () => void;
}

export function PermissionsDialog({ open, onOpenChange, user, onSuccess }: PermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions || []);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setSelectedPermissions(user.permissions || []);
      setSelectAll(false);
    }
  }, [open, user.permissions]);

  // Toggle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(ALL_PERMISSIONS.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  // Toggle a single permission
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: { userId: number; permissions: string[] }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${data.userId}/permissions`, { permissions: data.permissions });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Permissions Updated',
        description: `Permissions for ${user.username} have been updated.`,
      });
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update permissions: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = () => {
    updatePermissionsMutation.mutate({ userId: user.id, permissions: selectedPermissions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Permissions for {user.username}</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <div className="flex items-center mb-4">
            <Checkbox 
              id="select-all" 
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="ml-2 text-sm font-medium">
              Select All
            </label>
          </div>

          {Object.entries(PERMISSIONS_BY_CATEGORY).map(([category, permissions]) => (
            <div key={category} className="mb-6">
              <h3 className="text-md font-medium mb-2">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {permissions.map(permission => (
                  <div key={permission.id} className="flex items-center">
                    <Checkbox 
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <label htmlFor={permission.id} className="ml-2 text-sm">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white" 
            onClick={handleSubmit}
            disabled={updatePermissionsMutation.isPending}
          >
            {updatePermissionsMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}