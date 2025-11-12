import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { reportsAPI } from '../services/api';
import { InstructorCourse, InstructorOption, InstructorSummary } from '../types';
import { Search, Users, Layers, DollarSign, BookOpen, Filter, Loader2 } from 'lucide-react';

interface CourseFilters {
  includeInactive: boolean;
  category: string;
  startDate: string;
  endDate: string;
}

const InstructorCourses: React.FC = () => {
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorOption | null>(null);
  const [filters, setFilters] = useState<CourseFilters>({
    includeInactive: false,
    category: '',
    startDate: '',
    endDate: ''
  });
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [summary, setSummary] = useState<InstructorSummary | null>(null);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstructors = useCallback(async () => {
    try {
      setLoadingInstructors(true);
      const data = await reportsAPI.getInstructors();
      setInstructors(data);
    } catch (err) {
      console.error('Error cargando instructores', err);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los instructores');
    } finally {
      setLoadingInstructors(false);
    }
  }, []);

  useEffect(() => {
    loadInstructors();
  }, [loadInstructors]);

  useEffect(() => {
    if (!selectedInstructor) {
      return;
    }
    if (selectedInstructor.name.toLowerCase() !== searchTerm.trim().toLowerCase()) {
      setSelectedInstructor(null);
    }
  }, [searchTerm, selectedInstructor]);

  const filteredInstructors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return instructors.slice(0, 5);
    }
    return instructors
      .filter((instructor) => instructor.name.toLowerCase().includes(term))
      .slice(0, 5);
  }, [instructors, searchTerm]);

  const handleSelectInstructor = (instructor: InstructorOption) => {
    setSelectedInstructor(instructor);
    setSearchTerm(instructor.name);
  };

  const handleFetchCourses = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    if (!selectedInstructor) {
      setError('Selecciona un instructor de la lista para continuar');
      return;
    }

    try {
      setError(null);
      setLoadingCourses(true);
      const { courses, summary } = await reportsAPI.getCoursesByInstructor({
        instructorId: selectedInstructor.id.toString(),
        includeInactive: filters.includeInactive,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      });

      setCourses(courses);
      setSummary(summary || null);
    } catch (err) {
      console.error('Error consultando cursos por instructor', err);
      setCourses([]);
      setSummary(null);
      setError(err instanceof Error ? err.message : 'No se pudieron recuperar los cursos');
    } finally {
      setLoadingCourses(false);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="instructor-courses reports-container">
      <header className="reports-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="reports-title">
              <Users className="title-icon" />
              Cursos por Instructor
            </h1>
            <p className="reports-subtitle">
              Filtra el desempeño de cursos según el instructor responsable
            </p>
          </div>
        </div>
      </header>

      <section className="filter-card">
        <form onSubmit={handleFetchCourses}>
          <div className="filter-grid">
            <div className="filter-field">
              <label>Buscar instructor</label>
              <div className="search-input">
                <Search className="icon" />
                <input
                  type="text"
                  placeholder="Escribe el nombre del instructor"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loadingInstructors}
                />
              </div>
              <div className="search-suggestions">
                {loadingInstructors ? (
                  <div className="suggestion muted">Cargando instructores...</div>
                ) : filteredInstructors.length === 0 ? (
                  <div className="suggestion muted">No se encontraron coincidencias</div>
                ) : (
                  filteredInstructors.map((instructor) => (
                    <button
                      type="button"
                      key={instructor.id}
                      className={`suggestion ${
                        selectedInstructor?.id === instructor.id ? 'active' : ''
                      }`}
                      onClick={() => handleSelectInstructor(instructor)}
                    >
                      <span>{instructor.name}</span>
                      <small>{instructor.email || 'Sin correo'}</small>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="filter-field checkbox-field">
              <label>Estado de curso</label>
              <div className="checkbox-wrapper">
                <input
                  id="includeInactive"
                  type="checkbox"
                  checked={filters.includeInactive}
                  onChange={(e) => setFilters((prev) => ({
                    ...prev,
                    includeInactive: e.target.checked
                  }))}
                />
                <label htmlFor="includeInactive">Incluir cursos inactivos</label>
              </div>
            </div>

            <div className="filter-field">
              <label>Categoría</label>
              <input
                type="text"
                placeholder="Ej. programación"
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({
                  ...prev,
                  category: e.target.value
                }))}
              />
            </div>

            <div className="filter-field">
              <label>Fecha desde</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value
                }))}
              />
            </div>

            <div className="filter-field">
              <label>Fecha hasta</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value
                }))}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedInstructor || loadingCourses}
            >
              {loadingCourses ? (
                <>
                  <Loader2 className="icon icon-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Filter className="icon" />
                  Consultar cursos
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">
              <BookOpen />
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{summary.totalCourses}</h3>
              <p className="kpi-label">Cursos activos</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <Layers />
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{summary.totalEnrollments.toLocaleString()}</h3>
              <p className="kpi-label">Inscripciones</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <Users />
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{summary.totalSales.toLocaleString()}</h3>
              <p className="kpi-label">Ventas registradas</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon revenue">
              <DollarSign />
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{formatCurrency(summary.totalRevenue)}</h3>
              <p className="kpi-label">Ingresos</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Detalle de cursos</h2>
          {selectedInstructor && (
            <p>
              Instructor seleccionado: <strong>{selectedInstructor.name}</strong>
            </p>
          )}
        </div>

        {loadingCourses ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando cursos...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <Search className="empty-icon" />
            <h3>No hay cursos para mostrar</h3>
            <p>Selecciona un instructor y ajusta los filtros para ver resultados.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Categoría</th>
                  <th>Nivel</th>
                  <th>Duración (h)</th>
                  <th>Precio</th>
                  <th>Ventas</th>
                  <th>Ingresos</th>
                  <th>Inscripciones</th>
                  <th>Progreso</th>
                  <th>Completados</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="course-info">
                        <h4>{course.title}</h4>
                        <small>ID: {course.id}</small>
                      </div>
                    </td>
                    <td>{course.category || 'Sin categoría'}</td>
                    <td>{course.level || 'N/D'}</td>
                    <td>{course.durationHours || 'N/D'}</td>
                    <td>{formatCurrency(course.price)}</td>
                    <td>{course.metrics.salesCount}</td>
                    <td>{formatCurrency(course.metrics.totalRevenue)}</td>
                    <td>{course.metrics.enrollments}</td>
                    <td>{formatPercent(course.metrics.avgProgress)}</td>
                    <td>{course.metrics.completedCount}</td>
                    <td>
                      <span className={`status-badge ${course.active ? 'active' : 'inactive'}`}>
                        {course.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCourses;
