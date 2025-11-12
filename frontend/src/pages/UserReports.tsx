import React, { useState, useEffect } from 'react';
import { User } from '../types';
import ExportButtons from '../components/ExportButtons';
import { databaseService } from '../services/database';

interface UserMetrics {
  activeUsers: User[];
  metrics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    activityRate: string;
  };
}

const UserReports: React.FC = () => {
  const [userData, setUserData] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [period]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos desde la base de datos local
      try {
        const response = databaseService.getActiveUsers(period);
        if (response.success && response.data) {
          // Adaptar los datos al formato esperado por UserMetrics
          const adaptedData: UserMetrics = {
            activeUsers: response.data.users.map(user => ({
              ...user,
              status: user.status as "active" | "inactive" | "suspended"
            })),
            metrics: response.data.metrics
          };
          setUserData(adaptedData);
          return;
        }
      } catch (dbError) {
        console.log('Error cargando desde base de datos local:', dbError);
      }
      
      // Datos simulados como fallback
      const mockUserData: UserMetrics = {
        activeUsers: [
          {
            id: 1,
            name: "Ana García",
            email: "ana.garcia@email.com",
            status: "active",
            lastActivity: "2024-11-12T10:30:00Z"
          },
          {
            id: 2,
            name: "Carlos López",
            email: "carlos.lopez@email.com",
            status: "active",
            lastActivity: "2024-11-12T09:15:00Z"
          },
          {
            id: 3,
            name: "María Rodríguez",
            email: "maria.rodriguez@email.com",
            status: "active",
            lastActivity: "2024-11-11T16:45:00Z"
          },
          {
            id: 4,
            name: "Juan Pérez",
            email: "juan.perez@email.com",
            status: "active",
            lastActivity: "2024-11-11T14:20:00Z"
          },
          {
            id: 5,
            name: "Laura Martínez",
            email: "laura.martinez@email.com",
            status: "active",
            lastActivity: "2024-11-10T11:10:00Z"
          }
        ],
        metrics: {
          totalUsers: 2340,
          activeUsers: 1520,
          inactiveUsers: 820,
          activityRate: "65.0"
        }
      };

      setUserData(mockUserData);

    } catch (err) {
      setError('Error cargando datos de usuarios');
      console.error('User reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  if (loading) {
    return <div className="loading">Cargando datos de usuarios...</div>;
  }

  return (
    <div className="user-reports">
      <div className="page-header">
        <h1>Usuarios Activos</h1>
        <p>Métricas y análisis de actividad de usuarios</p>
      </div>

      {/* Controles */}
      <div className="controls-section">
        <div className="period-selector">
          <label>Período de actividad:</label>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
          </select>
        </div>
        
        <ExportButtons 
          reportType="users" 
          filters={{ period }} 
          className="export-buttons"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Métricas generales */}
      {userData && (
        <>
          <div className="metrics-overview">
            <div className="metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-title">Total de Usuarios</div>
                <div className="metric-value">{userData.metrics.totalUsers.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="metric-card metric-card--success">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-title">Usuarios Activos</div>
                <div className="metric-value">{userData.metrics.activeUsers.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="metric-card metric-card--warning">
              <div className="metric-icon">😴</div>
              <div className="metric-content">
                <div className="metric-title">Usuarios Inactivos</div>
                <div className="metric-value">{userData.metrics.inactiveUsers.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="metric-card metric-card--info">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-title">Tasa de Actividad</div>
                <div className="metric-value">{userData.metrics.activityRate}%</div>
              </div>
            </div>
          </div>

          {/* Gráfico de barras simple */}
          <div className="activity-chart">
            <h3>Distribución de Usuarios</h3>
            <div className="chart-bars">
              <div className="chart-bar-item">
                <div className="bar-label">Activos</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill bar-fill--success"
                    style={{ 
                      width: `${(userData.metrics.activeUsers / userData.metrics.totalUsers) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{userData.metrics.activeUsers}</div>
              </div>
              
              <div className="chart-bar-item">
                <div className="bar-label">Inactivos</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill bar-fill--warning"
                    style={{ 
                      width: `${(userData.metrics.inactiveUsers / userData.metrics.totalUsers) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{userData.metrics.inactiveUsers}</div>
              </div>
            </div>
          </div>

          {/* Tabla de usuarios activos */}
          <div className="users-table">
            <div className="table-header">
              <h3>Usuarios Más Activos (últimos {period} días)</h3>
            </div>
            
            {userData.activeUsers.length === 0 ? (
              <div className="no-data">No se encontraron usuarios activos</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Última Actividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.activeUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status status--${user.status}`}>
                            {user.status === 'active' ? 'Activo' : 
                             user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                          </span>
                        </td>
                        <td>{formatDate(user.lastActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Resumen adicional */}
          <div className="additional-insights">
            <div className="insight-card">
              <h4>💡 Insights</h4>
              <ul>
                <li>El {userData.metrics.activityRate}% de usuarios han estado activos en los últimos {period} días</li>
                <li>Se registran {userData.metrics.activeUsers.toLocaleString()} usuarios activos</li>
                <li>Hay {userData.metrics.inactiveUsers.toLocaleString()} usuarios que requieren reactivación</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserReports;