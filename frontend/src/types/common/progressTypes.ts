/**
 * Progress Tracking Type Definitions
 *
 * This file contains TypeScript interfaces for the progress tracking components.
 */

/**
 * Represents a student's progress in a course
 */
export interface CourseProgress {
  courseId: string;
  studentId: string;
  completedTasks: number;
  totalTasks: number;
  averageScore: number;
  completionPercentage: number;
  totalTimeSpent: number;
  achievedObjectives: number;
  totalObjectives: number;
  moduleProgress: ModuleProgress[];
  taskProgress: TaskProgress[];
  recentActivity: ActivityEntry[];
}

/**
 * Represents a student's progress in a module
 */
export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  completionPercentage: number;
  completedTasks: number;
  totalTasks: number;
  averageScore: number | null;
  taskProgress: TaskProgress[];
  timeSpent: number;
}

/**
 * Represents a student's progress on a specific task
 */
export interface TaskProgress {
  taskId: string;
  moduleId: string;
  title: string;
  taskType: string; // 'quiz', 'assignment', 'reading', 'video', etc.
  status: 'not_started' | 'in_progress' | 'completed' | 'graded' | 'pending';
  score: number | null;
  maxScore: number;
  attempts: number;
  maxAttempts: number;
  timeSpent: number | null; // in seconds
  dueDate: string | null; // ISO date string
  submissionDate: string | null; // ISO date string
  completion_date?: string | null; // ISO date string (from API schema)
}

/**
 * Represents an activity entry in the student's activity history
 */
export interface ActivityEntry {
  id: string;
  studentId: string;
  courseId: string;
  moduleId: string;
  taskId?: string;
  activityType: string; // 'submission', 'grade_received', 'task_started', 'achievement_earned'
  timestamp: string; // ISO date string
  taskTitle?: string;
  score?: number;
  achievementTitle?: string;
  achievementDescription?: string;
}

/**
 * Represents an upcoming task
 */
export interface UpcomingTask {
  title: string;
  dueDate: string; // ISO date string
}

/**
 * Represents a quiz history entry
 */
export interface QuizHistory {
  quizId: string;
  moduleId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  attempts: number;
  maxAttempts: number;
  date: string; // ISO date string
  answers: QuizAnswer[];
  timeSpent: number; // in seconds
}

/**
 * Represents a quiz answer
 */
export interface QuizAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
}

/**
 * Represents content effectiveness data for instructor analysis
 */
export interface ContentEffectivenessData {
  challengingQuestions: ChallengingQuestion[];
  timeSpentAnalysis: TimeSpentAnalysis[];
  revisionRecommendations: RevisionRecommendation[];
}

/**
 * Represents a challenging question in content effectiveness analysis
 */
export interface ChallengingQuestion {
  text: string;
  moduleTitle: string;
  successRate: number;
  averageAttempts: number;
}

/**
 * Represents time spent analysis in content effectiveness data
 */
export interface TimeSpentAnalysis {
  title: string;
  type: string;
  moduleTitle: string;
  averageTimeSpent: number; // in seconds
  expectedTime: number; // in minutes
}

/**
 * Represents a revision recommendation in content effectiveness data
 */
export interface RevisionRecommendation {
  contentTitle: string;
  issue: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
}

/**
 * Represents the structure of a course
 */
export interface CourseStructure {
  courseId: string;
  courseTitle: string;
  modules: ModuleStructure[];
  learningObjectives: string[];
}

/**
 * Represents the structure of a module
 */
export interface ModuleStructure {
  id: string;
  title: string;
  description: string;
  sections: SectionStructure[];
}

/**
 * Represents the structure of a section within a module
 */
export interface SectionStructure {
  id: string;
  title: string;
  description: string;
  taskIds: string[];
}
