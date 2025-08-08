
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AccessibleDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function AccessibleDialog({
  open,
  onClose,
  title,
  description,
  children
}: AccessibleDialogProps) {
  const descriptionId = "dialog-description";
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id={descriptionId}>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default AccessibleDialog;
