// src/types/common/progress.ts

import { ITaskProgress } from './task';

// Progress-bezogene Typen - ohne Konflikte
export interface IUserProgress {
  id: number;
  percentage: number;
  label: string;
}

/**
 * Interface für Activity-Einträge in den Fortschrittsdaten
 */
export interface IActivityEntry {
  id: string;
  activityType: 'submission' | 'grade_received' | 'task_started' | 'achievement_earned';
  timestamp: string;
  taskId?: string;
  taskTitle?: string;
  score?: number;
  achievementTitle?: string;
  achievementDescription?: string;
}

/**
 * Interface für detaillierte Kursfortschritte
 * Umbenannt, um Konflikte mit der einfacheren Version zu vermeiden
 */
export interface IDetailedCourseProgress {
  studentId: string;
  taskProgress: ITaskProgress[];
  completedTasks: number;
  totalTasks: number;
  averageScore: number;
  recentActivity: IActivityEntry[];
  upcomingTasks?: {
    title: string;
  }[];
}

/**
 * Einfacher Kursfortschritt (für Typ-Kompatibilität mit altem Code)
 */
export interface ICourseProgressSummary {
  completedTasks: number;
  totalTasks: number;
  averageScore: number;
}

/**
 * Interface für Kursfortschrittsantwort
 */
export interface ICourseProgressResponse {
  progress: number;
  tasks: {
    id: number;
    title: string;
    status: string;
  }[];
}

/**
 * Interface für Dashboard-Benutzerinformationen
 */
export interface IDashboardUserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

/**
 * Interface für allgemeine Dashboard-Statistiken
 */
export interface IDashboardOverallStats {
  total_courses: number;
  completed_courses: number;
  active_courses: number;
  dropped_courses: number;
  overall_completion: number;
  average_score?: number;
}

/**
 * Interface für Kursinfos im Dashboard
 */
export interface IDashboardCourseInfo {
  id: number;
  title: string;
  description?: string;
  progress_percentage: number;
  status: string;
  enrollment_date: string;
  last_activity?: string;
  instructor_name?: string;
}

/**
 * Interface für die Dashboard-Antwort vom Server
 */
// Dashboard related types
export interface IDashboardResponse {
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
    course_id?: number;
    course_title: string;
    progress: number;
    status: string;
    enrolled_date: string;
    enrollment_date?: string;
    enrollment_status?: string;
    last_activity_date?: string;
  }[];
}

/**
 * Interface for progress response from API
 */
export interface IProgressResponse {
  user_info: {
    id: string;
    username: string;
    display_name?: string;
    email?: string;
    [key: string]: any;
  };
  overall_stats: {
    courses_enrolled?: number;
    courses_completed?: number;
    completion_percentage?: number;
    total_tasks?: number;
    completed_tasks?: number;
    [key: string]: any;
  };
  courses: IDetailedCourseProgress[];
}

/**
 * Interface for enrollment status response
 * Used to determine if a user is enrolled in a course
 */
export interface IEnrollmentStatus {
  enrolled: boolean;
  enrollmentDate: string | null;
  enrollmentId: number | null;
}

/**
 * Interface for enrollment/unenrollment API responses
 */
export interface IEnrollmentResponse {
  success: boolean;
  message?: string;
  enrollmentId?: number;
  courseId?: string;
  userId?: string;
  status?: string;
  enrollmentDate?: string;
}

/**
 * Interface for detailed user progress in a course
 */
export interface IUserProgressDetails {
  courseId: string;
  userId: string;
  completedTasks: string[];
  overallProgress: number;
  lastActivity?: string;
  startDate?: string;
  estimatedCompletionDate?: string;
  taskStatuses?: Record<string, string>;
}

/**
 * Typ-Aliasdefinitionen für Abwärtskompatibilität
 */
export type ICourseProgress = IDetailedCourseProgress;
