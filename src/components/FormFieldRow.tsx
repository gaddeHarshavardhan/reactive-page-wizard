
import React from 'react';
import { Check } from 'lucide-react';

interface FormFieldRowProps {
  fieldLabel: string;
  fieldType: string;
  mandatory: boolean;
  validation: string;
}

const FormFieldRow: React.FC<FormFieldRowProps> = ({
  fieldLabel,
  fieldType,
  mandatory,
  validation
}) => {
  return (
    <tr className="border-t border-gray-200 animate-fade-in">
      <td className="p-4">{fieldLabel}</td>
      <td className="p-4">{fieldType}</td>
      <td className="p-4 text-center">
        {mandatory && (
          <div className="inline-flex items-center justify-center w-6 h-6 bg-claims-green rounded-full">
            <Check size={16} className="text-white" />
          </div>
        )}
      </td>
      <td className="p-4">{validation}</td>
    </tr>
  );
};

export default FormFieldRow;
