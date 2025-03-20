
import React from 'react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ClaimStageProps {
  label: string;
  isActive: boolean;
  isAddStage?: boolean;
  onClick?: () => void;
}

const ClaimStage: React.FC<ClaimStageProps> = ({ 
  label, 
  isActive, 
  isAddStage = false, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "claims-stage animate-fade-in-up transition-all duration-300",
        isAddStage 
          ? "border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500" 
          : isActive 
            ? "bg-blue-500 text-white shadow-md" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      )}
    >
      {isAddStage ? (
        <div className="flex items-center justify-center space-x-2">
          <Plus size={18} />
          <span>{label}</span>
        </div>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
};

export default ClaimStage;
