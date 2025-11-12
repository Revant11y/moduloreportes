import React from 'react';

interface TopCoursesChartProps {
  data: Array<{
    courseTitle: string;
    salesCount: number;
    totalRevenue: number;
  }>;
}

const TopCoursesChart: React.FC<TopCoursesChartProps> = ({ data }) => {
  const maxSales = Math.max(...data.map(item => item.salesCount));

  return (
    <div className="top-courses-chart">
      <div className="chart-header">
        <h3>Top 5 Cursos Más Vendidos</h3>
      </div>
      <div className="chart-content">
        <div className="courses-list">
          {data.map((course, index) => (
            <div key={index} className="course-item">
              <div className="course-info">
                <div className="course-title">{course.courseTitle}</div>
                <div className="course-stats">
                  {course.salesCount} ventas • ${course.totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="course-bar">
                <div 
                  className="course-bar-fill"
                  style={{ 
                    width: `${(course.salesCount / maxSales) * 100}%`,
                    backgroundColor: `hsl(${220 + index * 20}, 70%, 50%)`
                  }}
                ></div>
              </div>
              <div className="course-rank">#{index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCoursesChart;