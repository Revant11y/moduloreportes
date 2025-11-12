// Servicio para cargar datos directamente desde la base de datos local (JSON)
import databaseData from '../data/database-data.json';

export interface DatabaseData {
  timestamp: string;
  kpis: {
    totalRevenue: number;
    salesCount: number;
    activeUsers: number;
    totalUsers: number;
    completionRate: number;
    completedCourses: number;
    period: string;
  };
  charts: {
    salesByDay: Array<{
      date: string;
      count: number;
      total: number;
    }>;
    topCourses: Array<{
      courseTitle: string;
      salesCount: number;
      totalRevenue: number;
    }>;
  };
  activeUsers: {
    users: Array<{
      id: number;
      name: string;
      email: string;
      status: string;
      lastActivity: string;
    }>;
    metrics: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      activityRate: string;
    };
  };
}

class DatabaseService {
  private data: DatabaseData;

  constructor() {
    this.data = databaseData as DatabaseData;
  }

  // Obtener KPIs del dashboard
  getDashboardKPIs() {
    return {
      success: true,
      data: this.data.kpis
    };
  }

  // Obtener datos de gráficos
  getRevenueChart() {
    return {
      success: true,
      data: this.data.charts
    };
  }

  // Obtener usuarios activos
  getActiveUsers(period?: string) {
    return {
      success: true,
      data: this.data.activeUsers
    };
  }

  // Obtener estadísticas en tiempo real (simuladas)
  getRealtimeStats() {
    return {
      success: true,
      data: {
        sales24h: Math.floor(Math.random() * 10) + 5,
        activeUsers: Math.floor(Math.random() * 20) + 30,
        newUsers24h: Math.floor(Math.random() * 5) + 2,
        completions24h: Math.floor(Math.random() * 8) + 3,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Obtener reporte de ventas por curso
  getSalesReportByCourse(courseId?: string, producerId?: string, startDate?: string, endDate?: string) {
    // Filtrar datos según parámetros
    let filteredCourses = this.data.charts.topCourses;
    
    if (courseId && courseId !== '') {
      // Simular filtro por curso (en datos reales se haría por ID)
      filteredCourses = filteredCourses.filter(course => 
        course.courseTitle.toLowerCase().includes(courseId.toLowerCase())
      );
    }

    return {
      success: true,
      data: {
        courses: filteredCourses,
        summary: {
          totalSales: filteredCourses.reduce((sum, course) => sum + course.salesCount, 0),
          totalRevenue: filteredCourses.reduce((sum, course) => sum + course.totalRevenue, 0)
        }
      }
    };
  }

  // Obtener reporte de ventas por productor
  getSalesReportByProducer(producerId?: string, startDate?: string, endDate?: string) {
    // Simular datos de productores basados en cursos
    const producers = [
      { 
        id: 1, 
        name: "TechAcademy Pro", 
        email: "info@techacademy.com",
        courses: this.data.charts.topCourses.slice(0, 2),
        totalRevenue: this.data.charts.topCourses.slice(0, 2).reduce((sum, course) => sum + course.totalRevenue, 0)
      },
      { 
        id: 2, 
        name: "DevMaster Learning", 
        email: "contact@devmaster.com",
        courses: this.data.charts.topCourses.slice(2, 4),
        totalRevenue: this.data.charts.topCourses.slice(2, 4).reduce((sum, course) => sum + course.totalRevenue, 0)
      },
      { 
        id: 3, 
        name: "CodeGurus Institute", 
        email: "hello@codegurus.com",
        courses: this.data.charts.topCourses.slice(4),
        totalRevenue: this.data.charts.topCourses.slice(4).reduce((sum, course) => sum + course.totalRevenue, 0)
      }
    ];

    let filteredProducers = producers;
    if (producerId && producerId !== '') {
      filteredProducers = producers.filter(producer => producer.id.toString() === producerId);
    }

    return {
      success: true,
      data: {
        producers: filteredProducers,
        summary: {
          totalProducers: filteredProducers.length,
          totalRevenue: filteredProducers.reduce((sum, producer) => sum + producer.totalRevenue, 0)
        }
      }
    };
  }

  // Obtener tasa de finalización de cursos
  getCompletionRate(courseId?: string, producerId?: string) {
    // Simular datos de finalización
    const completionData = this.data.charts.topCourses.map(course => ({
      courseId: course.courseTitle.replace(/\s+/g, '').toLowerCase(),
      courseTitle: course.courseTitle,
      enrolled: course.salesCount,
      completed: Math.floor(course.salesCount * (0.6 + Math.random() * 0.3)), // 60-90% completion
      completionRate: 0
    }));

    completionData.forEach(item => {
      item.completionRate = item.enrolled > 0 ? (item.completed / item.enrolled) * 100 : 0;
    });

    let filteredData = completionData;
    if (courseId && courseId !== '') {
      filteredData = completionData.filter(item => 
        item.courseId.includes(courseId.toLowerCase())
      );
    }

    return {
      success: true,
      data: {
        courses: filteredData,
        summary: {
          averageCompletionRate: filteredData.length > 0 
            ? filteredData.reduce((sum, item) => sum + item.completionRate, 0) / filteredData.length 
            : 0,
          totalEnrolled: filteredData.reduce((sum, item) => sum + item.enrolled, 0),
          totalCompleted: filteredData.reduce((sum, item) => sum + item.completed, 0)
        }
      }
    };
  }

  // Obtener lista de cursos disponibles
  getAvailableCourses() {
    const courses = this.data.charts.topCourses.map((course, index) => ({
      id: (index + 1).toString(),
      title: course.courseTitle,
      salesCount: course.salesCount,
      totalRevenue: course.totalRevenue
    }));

    return {
      success: true,
      data: courses
    };
  }

  // Obtener timestamp de última actualización
  getLastUpdate() {
    return this.data.timestamp;
  }
}

export const databaseService = new DatabaseService();
export default databaseService;