// src/types/common/progressTypes.ts

import {ITaskProgress} from './task';

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
    dueDate: string;
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
 * Interface für im Dashboard angezeigte Kursinformationen
 */
export interface IDashboardCourseInfo {
  id: number;
  title: string;
  completion_percentage: number;
  recent_activity?: IActivityEntry[];
  upcoming_tasks?: {
    title: string;
    dueDate: string;
  }[];
}

/**
 * Interface für Dashboard-API-Antwort
 */
export interface IDashboardResponse {
  user_info: IDashboardUserInfo;
  overall_stats: IDashboardOverallStats;
  courses: IDashboardCourseInfo[];
}

/**
 * Typ-Aliasdefinitionen für Abwärtskompatibilität
 */
export type ICourseProgress = IDetailedCourseProgress;
