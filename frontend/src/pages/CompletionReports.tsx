import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { CompletionData } from '../types';

const CompletionReports: React.FC = () => {
  const [completionData, setCompletionData] = useState<CompletionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    courseId: '',
    producerId: ''
  });

  useEffect(() => {
    loadCompletionData();
  }, [filters]);

  const loadCompletionData = async () => {
    try {
      setLoading(true);
      const response = databaseService.getCompletionRate(filters.courseId, filters.producerId);
      if (response.success && response.data) {
        // Adaptar datos al formato esperado
        const adaptedData: CompletionData[] = response.data.courses.map((course, index) => ({
          courseId: index + 1, // Simular ID numérico
          courseTitle: course.courseTitle,
          producer: "Productor Ejemplo", // Simular productor
          totalEnrolled: course.enrolled,
          completed: course.completed,
          inProgress: course.enrolled - course.completed,
          completionRate: course.completionRate.toFixed(1) + '%',
          averageProgress: ((course.completed / course.enrolled) * 100).toFixed(1) + '%'
        }));
        setCompletionData(adaptedData);
      }
    } catch (error) {
      console.error('Error loading completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Reportes de Tasa de Finalización
          </h3>
          
          {/* Filtros */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID del Curso
              </label>
              <input
                type="text"
                value={filters.courseId}
                onChange={(e) => setFilters({...filters, courseId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Filtrar por curso..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID del Productor
              </label>
              <input
                type="text"
                value={filters.producerId}
                onChange={(e) => setFilters({...filters, producerId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Filtrar por productor..."
              />
            </div>
          </div>

          {/* Tabla de datos */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscritos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasa de Finalización
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completionData.map((course, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.courseTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.producer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.totalEnrolled}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        parseFloat(course.completionRate) >= 70 
                          ? 'bg-green-100 text-green-800'
                          : parseFloat(course.completionRate) >= 40
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.completionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.averageProgress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {completionData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay datos de finalización disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletionReports;