
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, X, Pencil, Check } from 'lucide-react';
import { Input } from './ui/input';

interface ClaimStageProps {
  label: string;
  isActive: boolean;
  isAddStage?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onRename?: (newName: string) => void;
  canRemove?: boolean;
}

const ClaimStage: React.FC<ClaimStageProps> = ({ 
  label, 
  isActive, 
  isAddStage = false, 
  onClick,
  onRemove,
  onRename,
  canRemove = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stageName, setStageName] = useState(label);

  const handleRename = () => {
    if (onRename && stageName.trim()) {
      onRename(stageName);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setStageName(label);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative">
      {isEditing ? (
        <div className="flex items-center">
          <Input
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 pr-8 min-w-[150px]"
            autoFocus
          />
          <button
            onClick={handleRename}
            className="absolute right-2 text-blue-500 hover:text-blue-700"
            aria-label="Save stage name"
          >
            <Check size={16} />
          </button>
        </div>
      ) : (
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
      )}
      
      {!isEditing && !isAddStage && (
        <>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute -top-2 -right-8 bg-blue-500 text-white rounded-full p-1 shadow-md hover:bg-blue-600 transition-colors"
            aria-label="Edit stage name"
          >
            <Pencil size={12} />
          </button>
          
          {canRemove && (
            <button 
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              aria-label="Remove stage"
            >
              <X size={12} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ClaimStage;
