import React, { useState, useEffect } from 'react';
import { SalesReport } from '../types';
import ExportButtons from '../components/ExportButtons';
import CourseFilters from '../components/CourseFilters';
import { databaseService } from '../services/database';
import { DollarSign, ShoppingCart, TrendingUp, Search } from 'lucide-react';

const SalesReports: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; title: string; }>>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableCourses();
    loadSalesData();
  }, []);

  useEffect(() => {
    loadSalesData();
  }, [selectedCourse]);

  const loadAvailableCourses = async () => {
    try {
      const response = databaseService.getAvailableCourses();
      if (response.success && response.data) {
        setAvailableCourses(response.data);
      }
    } catch (error) {
      console.error('Error loading available courses:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = databaseService.getRevenueChart();
      
      if (response.success && response.data) {
        let coursesData = response.data.topCourses;
        
        if (selectedCourse) {
          const courseIndex = parseInt(selectedCourse) - 1;
          if (courseIndex >= 0 && courseIndex < coursesData.length) {
            coursesData = [coursesData[courseIndex]];
          }
        }
        
        const adaptedData: SalesReport[] = coursesData.map((course, index) => ({
          courseId: selectedCourse ? parseInt(selectedCourse) : index + 1,
          courseTitle: course.courseTitle,
          producer: "Productor Ejemplo",
          totalSales: course.salesCount,
          totalRevenue: course.totalRevenue,
          sales: Array.from({ length: Math.min(course.salesCount, 5) }, (_, i) => ({
            id: i + 1,
            user: `Usuario ${i + 1}`,
            amount: Math.round(course.totalRevenue / course.salesCount),
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            status: "completed" as const
          }))
        }));
        
        setSalesData(adaptedData);
        return;
      }
      
      const mockData: SalesReport[] = [{
        courseId: 1,
        courseTitle: "JavaScript Avanzado",
        producer: "TechAcademy Pro",
        totalSales: 45,
        totalRevenue: 9000,
        sales: [
          { id: 1, user: "Ana García", amount: 200, date: "2024-11-01", status: "completed" },
          { id: 2, user: "Carlos López", amount: 200, date: "2024-11-02", status: "completed" },
          { id: 3, user: "María Rodriguez", amount: 200, date: "2024-11-03", status: "pending" }
        ]
      }];
      setSalesData(mockData);
      
    } catch (err) {
      console.error('Error cargando reportes de ventas:', err);
      setError('Error cargando reportes de ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseFilterChange = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const calculateTotals = () => {
    const totalSales = salesData.reduce((sum, report) => sum + report.totalSales, 0);
    const totalRevenue = salesData.reduce((sum, report) => sum + report.totalRevenue, 0);
    const avgRevenuePerSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    return { totalSales, totalRevenue, avgRevenuePerSale };
  };

  const { totalSales, totalRevenue, avgRevenuePerSale } = calculateTotals();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando reportes de ventas...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <header className="reports-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="reports-title">
              <DollarSign className="title-icon" />
              Reportes de Ventas
            </h1>
            <p className="reports-subtitle">
              {selectedCourse ? `Filtrado por: ${availableCourses.find(c => c.id === selectedCourse)?.title || 'Curso'}` : 'Análisis completo de todas las ventas'}
            </p>
          </div>
          <div className="header-actions">
            <ExportButtons 
              reportType="sales" 
              filters={{ selectedCourse }} 
              className="export-buttons-header" 
            />
          </div>
        </div>
      </header>

      <CourseFilters
        selectedCourse={selectedCourse}
        courses={availableCourses}
        onCourseChange={handleCourseFilterChange}
        className="sales-filters"
      />

      {error && (
        <div className="error-message">
          <p> {error}</p>
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <ShoppingCart />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-value">{totalSales.toLocaleString()}</h3>
            <p className="kpi-label">Total Ventas</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon revenue">
            <DollarSign />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-value">${totalRevenue.toLocaleString()}</h3>
            <p className="kpi-label">Ingresos Totales</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon trend">
            <TrendingUp />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-value">${avgRevenuePerSale.toFixed(2)}</h3>
            <p className="kpi-label">Promedio por Venta</p>
          </div>
        </div>
      </div>

      <div className="reports-content">
        <div className="table-container">
          <div className="table-header">
            <h2>
              {selectedCourse ? 'Detalles del Curso Seleccionado' : 'Reportes por Curso'}
            </h2>
          </div>
          
          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Productor</th>
                  <th>Total Ventas</th>
                  <th>Ingresos</th>
                  <th>Promedio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((report) => (
                  <tr key={report.courseId}>
                    <td>
                      <div className="course-info">
                        <h4>{report.courseTitle}</h4>
                        <span className="course-id">ID: {report.courseId}</span>
                      </div>
                    </td>
                    <td>{report.producer}</td>
                    <td className="number-cell">
                      <span className="sales-count">{report.totalSales}</span>
                    </td>
                    <td className="number-cell">
                      <span className="revenue-amount">${report.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="number-cell">
                      <span className="avg-amount">
                        ${(report.totalRevenue / report.totalSales).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge active">Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {salesData.length === 0 && !loading && (
            <div className="empty-state">
              <Search className="empty-icon" />
              <h3>No se encontraron reportes</h3>
              <p>
                {selectedCourse ? 'No hay datos para el curso seleccionado.' : 'No hay reportes de ventas disponibles en este momento.'}
              </p>
            </div>
          )}
        </div>

        {salesData.length > 0 && (
          <div className="sales-details">
            <h3>Ventas Individuales Recientes</h3>
            <div className="sales-list">
              {salesData.flatMap(report => 
                report.sales.map(sale => (
                  <div key={`${report.courseId}-${sale.id}`} className="sale-item">
                    <div className="sale-info">
                      <h4>{sale.user}</h4>
                      <p>{report.courseTitle}</p>
                    </div>
                    <div className="sale-details-right">
                      <span className="sale-amount">${sale.amount.toLocaleString()}</span>
                      <span className="sale-date">{sale.date}</span>
                      <span className={`sale-status ${sale.status}`}>
                        {sale.status === 'completed' ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReports;
