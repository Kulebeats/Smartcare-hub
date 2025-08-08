import React from 'react';
import { Card } from '@/components/ui/card';

interface ANCCardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ANCCardWrapper({ children, className = '' }: ANCCardWrapperProps) {
  return (
    <Card className={`border-2 border-blue-200 shadow-sm bg-white ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </Card>
  );
}