import React from 'react';
import { Filter } from 'lucide-react';

interface CourseFiltersProps {
  selectedCourse: string;
  courses: Array<{ id: string; title: string; }>;
  onCourseChange: (courseId: string) => void;
  className?: string;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  selectedCourse,
  courses,
  onCourseChange,
  className = ""
}) => {
  return (
    <div className={`filters-container ${className}`}>
      <div className="filter-group">
        <div className="filter-item">
          <Filter className="filter-icon" />
          <label htmlFor="course-filter" className="filter-label">
            Filtrar por Curso:
          </label>
          <select
            id="course-filter"
            value={selectedCourse}
            onChange={(e) => onCourseChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los cursos</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;