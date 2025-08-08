import React from "react";

interface AncInitialDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (data: any) => void;
  children?: React.ReactNode;
}

export function AncInitialDialog({ open, onOpenChange, onComplete, children }: AncInitialDialogProps) {
  // Simple placeholder component
  return null;
}

export default AncInitialDialog;