export interface Sale {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  saleDate: string;
  user?: User;
  course?: Course;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  price: number;
  producerId: number;
  status: 'active' | 'inactive' | 'draft';
  producer?: Producer;
}

export interface Producer {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: string;
}

export interface CourseProgress {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  user?: User;
  course?: Course;
}

export interface SalesReport {
  courseId: number;
  courseTitle: string;
  producer: string;
  totalSales: number;
  totalRevenue: number;
  sales: Array<{
    id: number;
    user: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export interface KPIData {
  totalRevenue: number;
  salesCount: number;
  activeUsers: number;
  totalUsers: number;
  completionRate: number;
  completedCourses: number;
  period: string;
}

export interface ChartData {
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
}

export interface RealtimeStats {
  sales24h: number;
  activeUsers: number;
  newUsers24h: number;
  completions24h: number;
  timestamp: string;
}

export interface CompletionData {
  courseId: number;
  courseTitle: string;
  producer: string;
  totalEnrolled: number;
  completed: number;
  inProgress: number;
  completionRate: number;
  averageProgress: number;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  courseId?: number;
  producerId?: number;
  period?: string;
}
