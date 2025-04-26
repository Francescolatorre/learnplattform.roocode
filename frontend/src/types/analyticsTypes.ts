/**
 * Type definitions for analytics features
 * Contains interfaces and types for tracking and analyzing user performance
 */

import { IUser } from './userTypes';
import { ICourse } from './course';
import { ITaskProgress } from './task';

/**
 * Interface for progress analytics data
 */
export interface IProgressAnalytics {
  /** Overall statistics for the course or user */
  overall: {
    /** Percentage of completion */
    completion_percentage: number;
    /** Total time spent in hours */
    total_time_spent: number;
    /** Average score across all tasks */
    average_score: number;
    /** Count of completed tasks */
    completed_tasks: number;
    /** Count of total tasks */
    total_tasks: number;
  };
  /** Data for time trend charts */
  time_trends: {
    /** Labels for date ranges */
    labels: string[];
    /** Data points for completion percentages over time */
    completion_data: number[];
    /** Data points for time spent over time */
    time_spent_data: number[];
  };
  /** Breakdown of task performance by category */
  task_categories: {
    /** Category name */
    category: string;
    /** Completion percentage for this category */
    completion_percentage: number;
    /** Average score for this category */
    average_score: number;
  }[];
  /** Most recently completed tasks */
  recent_tasks: {
    /** Task ID */
    task_id: number;
    /** Task title */
    title: string;
    /** Completion date */
    completion_date: string;
    /** Score achieved */
    score: number | null;
  }[];
}

/**
 * Interface for content effectiveness analytics
 * Helps instructors understand how effective their course content is
 */
export interface IContentEffectiveness {
  /** Course ID */
  course_id: number;
  /** Task ID */
  task_id: number;
  /** Task title */
  task_title: string;
  /** Average completion time in minutes */
  avg_completion_time: number;
  /** Percentage of students who completed the task */
  completion_rate: number;
  /** Average score for the task */
  avg_score: number;
  /** Difficulty rating based on completion data */
  difficulty_rating: 'easy' | 'medium' | 'hard';
  /** Student engagement metric */
  engagement_score: number;
}

/**
 * Interface for student performance analytics
 */
export interface IStudentPerformance {
  /** Student user object */
  student: IUser;
  /** Course completion percentage */
  completion_percentage: number;
  /** Average score across all tasks */
  average_score: number;
  /** Total time spent in hours */
  total_time_spent: number;
  /** Last active timestamp */
  last_active: string;
  /** Performance trend (increasing or decreasing) */
  performance_trend: 'increasing' | 'decreasing' | 'stable';
  /** Task progress details */
  task_progress: ITaskProgress[];
}

/**
 * Interface for cohort comparison data
 */
export interface ICohortAnalytics {
  /** Cohort name */
  cohort_name: string;
  /** Average completion percentage */
  avg_completion: number;
  /** Average score */
  avg_score: number;
  /** Student count */
  student_count: number;
  /** Start date */
  start_date: string;
  /** Distribution of scores */
  score_distribution: {
    /** Range label */
    range: string;
    /** Count of students in this range */
    count: number;
  }[];
}
