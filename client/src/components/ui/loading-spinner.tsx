import React from "react";
import { Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "medical" | "pulse";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl"
};

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  text,
  className,
  fullScreen = false
}: LoadingSpinnerProps) {
  const SpinnerIcon = variant === "medical" ? Activity : Loader2;
  
  const spinner = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullScreen && "min-h-screen",
      className
    )}>
      <SpinnerIcon 
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size],
          variant === "pulse" && "animate-pulse"
        )} 
      />
      {text && (
        <p className={cn(
          "text-muted-foreground font-medium",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Specific loading components for common use cases
export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" variant="medical" text={text} />
    </div>
  );
}

export function DataLoader({ text = "Loading data..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

export function ButtonLoader({ size = "sm" }: { size?: "sm" | "md" }) {
  return <LoadingSpinner size={size} className="mr-2" />;
}

export function CardLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-6 border border-dashed border-muted-foreground/25 rounded-lg bg-muted/20">
      <LoadingSpinner size="md" variant="pulse" text={text} />
    </div>
  );
}