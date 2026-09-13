import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const normLevel = (level || 'LOW').toUpperCase() as RiskLevel;

  return (
    <span className={`risk-badge ${normLevel}`}>
      {normLevel === 'LOW' && <ShieldCheck size={12} />}
      {normLevel === 'MEDIUM' && <AlertTriangle size={12} />}
      {normLevel === 'HIGH' && <AlertOctagon size={12} />}
      <span>{normLevel}</span>
    </span>
  );
};
