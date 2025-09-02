// src/types/common/gradingTypes.ts

import { ITaskProgress } from './Task';

/**
 * Interface für Bewertungsdaten
 */
export interface IGradingData {
  score: number;
  feedback?: string;
  graded_by?: number;
  graded_at?: string;
  status?: 'completed' | 'needs_revision';
  // Weitere relevante Felder
}

/**
 * Progress analytics interface for course analytics data
 */
export interface IProgressAnalytics {
  completionRate: number;
  averageScore: number;
  studentCount: number;
  taskCompletionRates: {
    taskId: string;
    taskTitle: string;
    completionRate: number;
    averageScore: number;
  }[];
  timeSpentData?: {
    averageTimeSpent: number;
    timeDistribution: {
      [key: string]: number;
    };
  };
}

/**
 * Student progress summary interface for student dashboard
 */
export interface IStudentProgressSummary {
  progress: number;
  user_info: {
    id: string;
    username: string;
    display_name?: string;
    role: string;
  };
  overall_stats: {
    courses_enrolled: number;
    courses_completed: number;
    overall_progress: number;
    tasks_completed: number;
    tasks_in_progress: number;
    tasks_overdue: number;
  };
  courses: {
    id: string;
    title: string;
    progress: number;
    status: string;
    enrolled_date: string;
    last_activity_date?: string;
  }[];
}

/**
 * Instructor dashboard data interface
 */
export interface IInstructorDashboardData {
  totalStudents: number;
  totalCourses: number;
  totalTasks: number;
  averageCompletionRate: number;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    courseId?: string;
    courseName?: string;
    studentId?: string;
    studentName?: string;
  }[];
  courseStats: {
    id: string;
    title: string;
    studentCount: number;
    completionRate: number;
    averageScore?: number;
  }[];
}

/**
 * Course structure analytics interface
 */
export interface ICourseStructureAnalytics {
  courseId: string;
  title: string;
  description?: string;
  taskCount: number;
  tasksByType: {
    [key: string]: number;
  };
  difficultyDistribution: {
    [key: string]: number;
  };
  taskEffectivenessScores: {
    taskId: string;
    taskTitle: string;
    effectivenessScore: number;
    completionRate: number;
    averageAttempts: number;
  }[];
}

/**
 * User progress interface for tracking student progress in courses
 */
export interface IUserProgress {
  user_info: {
    id: string;
    username: string;
    display_name?: string;
    role: string;
  };
  overall_stats: {
    courses_enrolled: number;
    courses_completed: number;
    overall_progress: number;
    tasks_completed: number;
    tasks_in_progress: number;
    tasks_overdue: number;
  };
  courses: {
    id: string;
    title: string;
    progress: number;
    status: string;
    enrolled_date: string;
    last_activity_date?: string;
    tasks?: ITaskProgress[];
  }[];
}

/**
 * Progress chart data interface for visualization components
 */
export interface IProgressChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string | string[];
    borderWidth: number;
  }[];
}

/**
 * Dataset for task effectiveness analytics
 */
export interface ITaskEffectivenessData {
  taskId: string;
  title: string;
  averageScore: number;
  completionRate: number;
  averageAttempts: number;
  effectivenessScore: number;
}

/**
 * Admin dashboard summary interface for system-wide analytics
 */
export interface IAdminDashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  usersByRole: {
    [role: string]: number;
  };
  courseCompletionStats: {
    totalEnrollments: number;
    totalCompletions: number;
    completionRate: number;
  };
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
    username?: string;
    courseId?: string;
    courseName?: string;
  }[];
  systemStats: {
    averageUserEngagement: number;
    averageCourseRating: number;
    topCourses: {
      id: string;
      title: string;
      enrollmentCount: number;
      completionRate: number;
    }[];
  };
}
