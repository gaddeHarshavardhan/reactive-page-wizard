
import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

interface ClaimStageProps {
  label: string;
  isActive: boolean;
  isAddStage?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

const ClaimStage: React.FC<ClaimStageProps> = ({ 
  label, 
  isActive, 
  isAddStage = false, 
  onClick,
  onRemove,
  canRemove = false
}) => {
  return (
    <div className="relative">
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
      
      {canRemove && !isAddStage && (
        <button 
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
          aria-label="Remove stage"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default ClaimStage;
