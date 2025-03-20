
import React from 'react';

interface DocumentRowProps {
  documentType: string;
  format: string;
  mandatory: boolean;
  maxSize: number;
}

const DocumentRow: React.FC<DocumentRowProps> = ({
  documentType,
  format,
  mandatory,
  maxSize
}) => {
  return (
    <tr className="border-t border-gray-200 animate-fade-in">
      <td className="p-4">{documentType}</td>
      <td className="p-4">{format}</td>
      <td className="p-4 text-center">
        {mandatory && (
          <div className="inline-flex items-center justify-center w-6 h-6 bg-claims-green rounded-full">
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        )}
      </td>
      <td className="p-4">{maxSize} MB</td>
    </tr>
  );
};

export default DocumentRow;
