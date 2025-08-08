import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';

// Define user roles
const USER_ROLES = {
  SYSTEM_ADMIN: 'SystemAdministrator',
  FACILITY_ADMIN: 'FacilityAdministrator',
  CLINICIAN: 'Clinician',
  TRAINER: 'Trainer',
};

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
    role: string;
  };
  onSuccess?: () => void;
}

export function RoleChangeDialog({ open, onOpenChange, user, onSuccess }: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user.role || USER_ROLES.CLINICIAN);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setSelectedRole(user.role || USER_ROLES.CLINICIAN);
    }
  }, [open, user.role]);

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { userId: number; role: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${data.userId}/role`, { role: data.role });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role Updated',
        description: `Role for ${user.username} has been updated to ${selectedRole}.`,
      });
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = () => {
    updateRoleMutation.mutate({ userId: user.id, role: selectedRole });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Change Role for {user.username}</span>
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
        
        <div className="py-4">
          <RadioGroup 
            value={selectedRole} 
            onValueChange={setSelectedRole}
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value={USER_ROLES.SYSTEM_ADMIN} id="system-admin" />
              <div>
                <Label htmlFor="system-admin" className="font-medium">System Administrator</Label>
                <p className="text-sm text-gray-500">Full access to all features, facilities, and user management</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value={USER_ROLES.FACILITY_ADMIN} id="facility-admin" />
              <div>
                <Label htmlFor="facility-admin" className="font-medium">Facility Administrator</Label>
                <p className="text-sm text-gray-500">Manage users and settings within assigned facility</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value={USER_ROLES.CLINICIAN} id="clinician" />
              <div>
                <Label htmlFor="clinician" className="font-medium">Clinician</Label>
                <p className="text-sm text-gray-500">Standard clinical role with patient management</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value={USER_ROLES.TRAINER} id="trainer" />
              <div>
                <Label htmlFor="trainer" className="font-medium">Trainer</Label>
                <p className="text-sm text-gray-500">Training and education focused role</p>
              </div>
            </div>
          </RadioGroup>
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
            disabled={updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}