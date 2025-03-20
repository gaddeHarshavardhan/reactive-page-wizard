
import React from 'react';
import { cn } from '@/lib/utils';

interface StageConnectorProps {
  isActive?: boolean;
}

const StageConnector: React.FC<StageConnectorProps> = ({ isActive = false }) => {
  return (
    <div className="flex items-center justify-center w-10 relative z-0">
      <div 
        className={cn(
          "h-0.5 w-full transition-all duration-300",
          isActive ? "bg-blue-300" : "bg-gray-300"
        )}
      />
    </div>
  );
};

export default StageConnector;
