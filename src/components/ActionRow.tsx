
import React from 'react';

interface ActionRowProps {
  action: string;
  buttonLabel: string;
  condition: string;
  nextStage: string;
}

const ActionRow: React.FC<ActionRowProps> = ({
  action,
  buttonLabel,
  condition,
  nextStage
}) => {
  return (
    <tr className="border-t border-gray-200 animate-fade-in">
      <td className="p-4">{action}</td>
      <td className="p-4">{buttonLabel}</td>
      <td className="p-4">{condition}</td>
      <td className="p-4">{nextStage}</td>
    </tr>
  );
};

export default ActionRow;
