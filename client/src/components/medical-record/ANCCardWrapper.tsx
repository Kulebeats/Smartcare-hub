import React from 'react';
import { Card } from '@/components/ui/card';

interface ANCCardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ANCCardWrapper({ children, className = '' }: ANCCardWrapperProps) {
  return (
    <Card className={`border-0 shadow-none bg-white ${className}`}>
      <div className="p-0">
        {children}
      </div>
    </Card>
  );
}