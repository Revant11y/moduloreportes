import axios, { AxiosError } from 'axios';
import {
  ChartData,
  CompletionData,
  InstructorCourse,
  InstructorOption,
  InstructorSummary,
  KPIData,
  RealtimeStats,
  SalesReport,
  User
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface ApiResponse<T> {
  success: boolean;
  data: T;
  summary?: Record<string, unknown>;
  message?: string;
}

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    throw new Error(
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message
    );
  }
  throw error instanceof Error ? error : new Error('Error desconocido');
};

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  producerId?: string;
}

export interface CoursesByInstructorFilters {
  instructorId: string;
  includeInactive?: boolean;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActiveUsersResponse {
  activeUsers: User[];
  metrics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    activityRate: string;
  };
}

export const dashboardAPI = {
  async getKPIs(period = '30'): Promise<{ kpis: KPIData; charts: ChartData }> {
    try {
      const response = await api.get<ApiResponse<{ kpis: KPIData; charts: ChartData }>>(
        '/api/dashboard/kpis',
        { params: { period } }
      );
      const { kpis, charts } = response.data.data;

      const normalizedCharts: ChartData = {
        salesByDay: charts.salesByDay.map((day) => ({
          date: day.date,
          count: typeof day.count === 'string' ? parseInt(day.count, 10) : day.count,
          total: typeof day.total === 'string' ? parseFloat(day.total as unknown as string) : day.total
        })),
        topCourses: charts.topCourses.map((course) => ({
          courseTitle: course.courseTitle,
          salesCount: typeof course.salesCount === 'string' ? parseInt(course.salesCount, 10) : course.salesCount,
          totalRevenue: typeof course.totalRevenue === 'string'
            ? parseFloat(course.totalRevenue as unknown as string)
            : course.totalRevenue
        }))
      };

      return { kpis, charts: normalizedCharts };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getRealtime(): Promise<RealtimeStats> {
    try {
      const response = await api.get<ApiResponse<RealtimeStats>>('/api/dashboard/realtime');
      return response.data.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getRevenueChart(params: { period?: string; groupBy?: 'hour' | 'day' | 'week' | 'month' } = {}) {
    try {
      const response = await api.get<ApiResponse<Array<{ period: string; revenue: number; salesCount: number }>>>(
        '/api/dashboard/revenue-chart',
        { params }
      );
      return response.data.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};

export const reportsAPI = {
  async getSalesByCourse(filters: SalesFilters = {}): Promise<{ reports: SalesReport[]; summary?: Record<string, unknown> }> {
    try {
      const response = await api.get<ApiResponse<SalesReport[]>>('/api/reports/sales-by-course', {
        params: filters
      });
      return {
        reports: response.data.data.map((report) => ({
          ...report,
          totalSales: Number(report.totalSales),
          totalRevenue: Number(report.totalRevenue),
          sales: report.sales.map((sale) => ({
            ...sale,
            amount: Number(sale.amount)
          }))
        })),
        summary: response.data.summary
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getActiveUsers(period = '30'): Promise<ActiveUsersResponse> {
    try {
      const response = await api.get<ApiResponse<ActiveUsersResponse>>('/api/reports/active-users', {
        params: { period }
      });
      return response.data.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getCompletionRate(filters: { courseId?: string; producerId?: string } = {}): Promise<CompletionData[]> {
    try {
      const response = await api.get<ApiResponse<CompletionData[]>>('/api/reports/completion-rate', {
        params: filters
      });
      return response.data.data.map((course) => ({
        ...course,
        totalEnrolled: Number(course.totalEnrolled),
        completed: Number(course.completed),
        inProgress: Number(course.inProgress),
        completionRate: Number(course.completionRate),
        averageProgress: Number(course.averageProgress)
      }));
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getInstructors(): Promise<InstructorOption[]> {
    try {
      const response = await api.get<ApiResponse<Array<{
        producerId: number;
        producerName: string;
        producerEmail?: string;
        totalSales: number;
        totalRevenue: number;
      }>>>('/api/reports/sales-by-producer');

      return response.data.data.map((producer) => ({
        id: producer.producerId,
        name: producer.producerName,
        email: producer.producerEmail,
        totalSales: Number(producer.totalSales || 0),
        totalRevenue: Number(producer.totalRevenue || 0)
      }));
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getCoursesByInstructor(filters: CoursesByInstructorFilters) {
    try {
      const response = await api.get<ApiResponse<InstructorCourse[]>>('/api/reports/courses-by-instructor', {
        params: {
          ...filters,
          includeInactive: filters.includeInactive ? 'true' : 'false'
        }
      });

      const courses: InstructorCourse[] = response.data.data.map((course) => ({
        ...course,
        price: Number(course.price),
        active: Boolean(course.active),
        durationHours: Number(course.durationHours || 0),
        metrics: {
          salesCount: Number(course.metrics.salesCount || 0),
          totalRevenue: Number(course.metrics.totalRevenue || 0),
          enrollments: Number(course.metrics.enrollments || 0),
          avgProgress: Number(course.metrics.avgProgress || 0),
          completedCount: Number(course.metrics.completedCount || 0)
        }
      }));

      const rawSummary = response.data.summary as Record<string, unknown> | undefined;
      const summary: InstructorSummary | undefined = rawSummary
        ? {
            totalCourses: Number((rawSummary['totalCourses'] as number | undefined) ?? 0),
            totalSales: Number((rawSummary['totalSales'] as number | undefined) ?? 0),
            totalRevenue: Number((rawSummary['totalRevenue'] as number | undefined) ?? 0),
            totalEnrollments: Number((rawSummary['totalEnrollments'] as number | undefined) ?? 0)
          }
        : undefined;

      const responseFilters = (response.data as ApiResponse<InstructorCourse[]> & {
        filters?: {
          instructorId: string;
          includeInactive: boolean;
          category: string | null;
          startDate: string | null;
          endDate: string | null;
        };
      }).filters;

      return {
        courses,
        summary,
        filters: responseFilters
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};

export default api;
