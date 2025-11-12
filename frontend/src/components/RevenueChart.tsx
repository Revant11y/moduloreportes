import React from 'react';

interface RevenueChartProps {
  data: Array<{
    date: string;
    count: number;
    total: number;
  }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxTotal = Math.max(...data.map(item => item.total));

  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h3>Ingresos por Día</h3>
      </div>
      <div className="chart-content">
        <div className="chart-bars">
          {data.map((item, index) => (
            <div key={index} className="chart-bar-group">
              <div className="chart-bar-container">
                <div 
                  className="chart-bar"
                  style={{ 
                    height: `${(item.total / maxTotal) * 100}%`,
                    backgroundColor: '#4F46E5'
                  }}
                  title={`$${item.total} - ${item.count} ventas`}
                ></div>
              </div>
              <div className="chart-label">
                {new Date(item.date).toLocaleDateString('es-ES', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="chart-legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4F46E5' }}></span>
            <span>Ingresos diarios</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;