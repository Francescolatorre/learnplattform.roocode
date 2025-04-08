// src/types/common/entities.ts

// Enums und Typdefinitionen
export type CompletionStatus = 'active' | 'completed' | 'dropped';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'graded' | 'pending';
export type QuizCompletionStatus = 'passed' | 'failed' | 'in_progress';

export interface User {
  readonly id: number;
  username: string;
  email: string;
  display_name?: string;
  role: string;
}

export interface Course {
  readonly id: number;
  title: string;
  description: string;
  version: number;
  status: string;
  visibility: string;
  learning_objectives: string;
  prerequisites: string;
  readonly created_at: string;
  readonly updated_at: string;
  order: number;
  creator?: number | null;
  creator_details?: User;
}

export interface CourseDetails extends Course {
  // Additional fields for detailed course view
}

export interface LearningTask {
  readonly id: number;
  course: number;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface TaskProgress {
  id: number;
  user: number;
  task: number;
  status: TaskStatus;
  time_spent: string | null;
  completion_date?: string | null;
  user_details?: User;
  task_details?: LearningTask;
}

export interface UserProgress {
  id: number;
  percentage: number;
  label: string;
}

export interface QuizOption {
  readonly id: number;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface CourseProgressResponse {
  progress: number;
  tasks: LearningTask[];
}

export interface CourseEnrollment {
  readonly id: number;
  user: number;
  course: number;
  enrollment_date?: string;
  status: CompletionStatus;
  settings?: Record<string, any> | null;
  user_details?: User;
  course_details?: Course;
  progress_percentage?: string;
}

export interface CourseVersion {
  readonly id: number;
  course: number;
  version_number: number;
  created_at?: string;
  content_snapshot: Record<string, any>;
  notes?: string;
  created_by?: number | null;
  created_by_details?: User;
}

export interface QuizQuestion {
  readonly id: number;
  quiz: string;
  text: string;
  explanation: string;
  points: number;
  order: number;
  readonly options: QuizOption[];
}

export interface QuizTask {
  readonly id: number;
  course: number;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  time_limit_minutes: number;
  pass_threshold: number;
  max_attempts: number;
  randomize_questions: boolean;
  readonly questions: QuizQuestion[];
}

export interface QuizResponse {
  readonly id: number;
  attempt: number;
  question: number;
  selected_option: number;
  is_correct: boolean;
  time_spent: string;
  question_details: QuizQuestion;
  selected_option_details: QuizOption;
}

export interface QuizAttempt {
  readonly id: number;
  user: number;
  quiz: string;
  score: number;
  time_taken: string;
  completion_status: QuizCompletionStatus;
  attempt_date: string;
  user_details: User;
  quiz_details: QuizTask;
  readonly responses: QuizResponse[];
}

export interface CustomTokenObtainPair {
  username: string;
  password: string;
}

export interface Register {
  username: string;
  password: string;
  password2: string;
  email: string;
  display_name?: string;
  role?: string;
}

export interface TokenRefresh {
  refresh: string;
  access?: string;
}

export interface TaskCreationData {
  readonly id: number;
  title: string;
  description: string;
  course?: number;
  order?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityEntry {
  id: string;
  activityType: 'submission' | 'grade_received' | 'task_started' | 'achievement_earned';
  timestamp: string;
  taskId?: string;
  taskTitle?: string;
  score?: number;
  achievementTitle?: string;
  achievementDescription?: string;
}

export interface CourseProgress {
  studentId: string;
  taskProgress: TaskProgress[];
  completedTasks: number;
  totalTasks: number;
  averageScore: number;
  recentActivity: ActivityEntry[];
  upcomingTasks?: {
    title: string;
    dueDate: string;
  }[];
}

export interface QuizHistory {
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  attempts: number;
  maxAttempts: number;
  date: string;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    correct: boolean;
    timeSpent: number;
  }>;
}

export interface DashboardUserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export interface DashboardOverallStats {
  total_courses: number;
  completed_courses: number;
  active_courses: number;
  dropped_courses: number;
  overall_completion: number;
  average_score?: number;
}

export interface DashboardCourseInfo {
  id: number;
  title: string;
  completion_percentage: number;
  recent_activity?: ActivityEntry[];
  upcoming_tasks?: {
    title: string;
    dueDate: string;
  }[];
}

export interface DashboardResponse {
  user_info: DashboardUserInfo;
  overall_stats: DashboardOverallStats;
  courses: DashboardCourseInfo[];
}
