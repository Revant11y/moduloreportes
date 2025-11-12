





















































import React, { useEffect, useState } from 'react';
import KPICard from '../components/KPICard';
import RevenueChart from '../components/RevenueChart';
import TopCoursesChart from '../components/TopCoursesChart';
import RealtimeStats from '../components/RealtimeStats';
import { KPIData, ChartData, RealtimeStats as RealtimeStatsType } from '../types';
import { DollarSign, Users, BookOpen, TrendingUp } from 'lucide-react';
import { databaseService } from '../services/database';
// import { useSocket } from '../services/socket';

const Dashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const { socket, connected } = useSocket(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001');

  useEffect(() => {
    const loadData = async () => {
      await loadDashboardData();
    };
    
    loadData();
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(loadRealtimeData, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (socket) {
  //     socket.on('kpi-update', (data: any) => {
  //       setRealtimeStats(data);
  //     });
  //   }
  // }, [socket]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos directamente desde la base de datos local
      try {
        const [kpiResponse, revenueResponse] = await Promise.all([
          Promise.resolve(databaseService.getDashboardKPIs()),
          Promise.resolve(databaseService.getRevenueChart())
        ]);
        
        if (kpiResponse.success && kpiResponse.data) {
          setKpiData(kpiResponse.data);
        }
        
        if (revenueResponse.success && revenueResponse.data) {
          setChartData(revenueResponse.data);
        }
        
        await loadRealtimeData();
        return;
        
      } catch (dbError) {
        console.log('Error cargando desde base de datos local:', dbError);
      }
      
      // Fallback a datos simulados si hay error
      const mockKpiData: KPIData = {
        totalRevenue: 125000,
        salesCount: 245,
        activeUsers: 1520,
        totalUsers: 2340,
        completionRate: 78.5,
        completedCourses: 89,
        period: '30'
      };

      const mockChartData: ChartData = {
        salesByDay: [
          { date: '2024-11-01', count: 12, total: 2400 },
          { date: '2024-11-02', count: 15, total: 3200 },
          { date: '2024-11-03', count: 8, total: 1800 },
          { date: '2024-11-04', count: 20, total: 4500 },
          { date: '2024-11-05', count: 18, total: 3900 },
        ],
        topCourses: [
          { courseTitle: 'JavaScript Avanzado', salesCount: 45, totalRevenue: 9000 },
          { courseTitle: 'React Fundamentals', salesCount: 38, totalRevenue: 7600 },
          { courseTitle: 'Node.js Backend', salesCount: 32, totalRevenue: 6400 },
          { courseTitle: 'TypeScript Master', salesCount: 28, totalRevenue: 5600 },
          { courseTitle: 'Full Stack Development', salesCount: 25, totalRevenue: 800000 },
          { courseTitle: 'Angular avanzado', salesCount: 26, totalRevenue: 120000 }
        ]
      };

      setKpiData(mockKpiData);
      setChartData(mockChartData);
      
      await loadRealtimeData();

    } catch (err) {
      setError('Error cargando datos del dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      // Cargar datos desde el servicio de base de datos local
      const statsResponse = databaseService.getRealtimeStats();
      if (statsResponse.success && statsResponse.data) {
        setRealtimeStats(statsResponse.data);
        return;
      }

      // Fallback a simulación si hay error
      const mockRealtimeStats: RealtimeStatsType = {
        sales24h: Math.floor(Math.random() * 50) + 10,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        newUsers24h: Math.floor(Math.random() * 20) + 5,
        completions24h: Math.floor(Math.random() * 30) + 10,
        timestamp: new Date().toISOString()
      };

      setRealtimeStats(mockRealtimeStats);

    } catch (err) {
      console.error('Error loading realtime data:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard de Reportes</h1>
        <p className="page-subtitle">Vista general de métricas y KPIs en tiempo real</p>
      </div>

      {realtimeStats && (
        <RealtimeStats data={realtimeStats} />
      )}

      {kpiData && (
        <div className="kpi-grid">
          <KPICard
            title="Ingresos Totales"
            value={`$${kpiData.totalRevenue?.toLocaleString() || '0'}`}
            change={{ value: 12.5, type: 'increase' }}
            icon={<DollarSign />}
            description="Ingresos generados este mes"
          />
          <KPICard
            title="Usuarios Activos"
            value={kpiData.activeUsers || 0}
            change={{ value: 8.3, type: 'increase' }}
            icon={<Users />}
            description="Usuarios activos en los últimos 30 días"
          />
          <KPICard
            title="Cursos Completados"
            value={kpiData.completedCourses || 0}
            change={{ value: 15.2, type: 'increase' }}
            icon={<BookOpen />}
            description="Cursos finalizados este mes"
          />
          <KPICard
            title="Tasa de Conversión"
            value={`${(kpiData.completedCourses || 0) > 0 ? 
              ((kpiData.completedCourses / (kpiData.activeUsers || 1)) * 100).toFixed(1) : '0'}%`}
            change={{ value: 3.1, type: 'decrease' }}
            icon={<TrendingUp />}
            description="Porcentaje de conversión de visitantes"
          />
        </div>
      )}

      <div className="charts-grid">
        {chartData && (
          <>
            <div className="chart-container">
              <div className="chart-header">
                <h2 className="chart-title">Ingresos por Día</h2>
                <p className="chart-description">Evolución de ingresos en los últimos 30 días</p>
              </div>
              <RevenueChart data={chartData.salesByDay} />
            </div>
            <div className="chart-container">
              <div className="chart-header">
                <h2 className="chart-title">Cursos Más Populares</h2>
                <p className="chart-description">Top 5 cursos por número de inscripciones</p>
              </div>
              <TopCoursesChart data={chartData.topCourses} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;