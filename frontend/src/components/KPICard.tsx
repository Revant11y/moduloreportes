import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  description 
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon">
          {icon}
        </div>
      </div>
      
      <div>
        <h3 className="kpi-title">{title}</h3>
        <p className="kpi-value">{value}</p>
        
        {change && (
          <div className={`kpi-change ${change.type === 'increase' ? 'positive' : 'negative'}`}>
            {change.type === 'increase' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change.value)}%</span>
            <span className="text-xs">vs mes anterior</span>
          </div>
        )}
        
        {description && (
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;