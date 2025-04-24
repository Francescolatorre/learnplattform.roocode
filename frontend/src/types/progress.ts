// src/types/common/progress.ts

import {ITaskProgress} from './task';


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
export interface IDashboardResponse {
    user_info: IDashboardUserInfo;
    overall_stats: IDashboardOverallStats;
    courses: IDashboardCourseInfo[];
    recent_activities?: Array<{
        id: number;
        type: string;
        description: string;
        timestamp: string;
        course_id?: number;
        task_id?: number;
    }>;
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
    courses: IUserProgress[];
}

/**
 * Typ-Aliasdefinitionen für Abwärtskompatibilität
 */
export type ICourseProgress = IDetailedCourseProgress;
