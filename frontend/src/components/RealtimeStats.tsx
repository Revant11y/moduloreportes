import React from 'react';
import { RealtimeStats as RealtimeStatsType } from '../types';

interface RealtimeStatsProps {
  data: RealtimeStatsType;
}

const RealtimeStats: React.FC<RealtimeStatsProps> = ({ data }) => {
  const stats = [
    { 
      label: 'Ventas (24h)', 
      value: data.sales24h, 
      icon: '🛒',
      color: '#10B981' 
    },
    { 
      label: 'Usuarios Activos', 
      value: data.activeUsers, 
      icon: '👥',
      color: '#3B82F6' 
    },
    { 
      label: 'Nuevos Usuarios (24h)', 
      value: data.newUsers24h, 
      icon: '👋',
      color: '#8B5CF6' 
    },
    { 
      label: 'Completados (24h)', 
      value: data.completions24h, 
      icon: '✅',
      color: '#F59E0B' 
    }
  ];

  const lastUpdate = new Date(data.timestamp).toLocaleTimeString('es-ES');

  return (
    <div className="realtime-stats">
      <div className="realtime-stats__header">
        <h2>📊 Estadísticas en Tiempo Real</h2>
        <div className="last-update">
          <span className="update-indicator">🟢</span>
          Última actualización: {lastUpdate}
        </div>
      </div>
      
      <div className="realtime-stats__grid">
        {stats.map((stat, index) => (
          <div key={index} className="realtime-stat">
            <div className="realtime-stat__icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="realtime-stat__content">
              <div className="realtime-stat__value">{stat.value}</div>
              <div className="realtime-stat__label">{stat.label}</div>
            </div>
            <div className="realtime-stat__pulse">
              <div className="pulse-dot" style={{ backgroundColor: stat.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealtimeStats;