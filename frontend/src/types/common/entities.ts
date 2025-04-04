export interface User {
  readonly id: number;
  username: string & {minLength: 3; maxLength: 150; pattern: '^[a-zA-Z0-9_]+$'};
  email: string & {maxLength: 254; format: 'email'};
  display_name?: string;
  role: string;
}

export interface Course {
  readonly id: number;
  title: string & {maxLength: 200; minLength: 3};
  description: string & {maxLength: 500; minLength: 10};
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
  title: string & {maxLength: 200; minLength: 3};
  description: string & {maxLength: 500; minLength: 10};
  order: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface TaskProgress {
  id: number;
  user: number;
  task: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'graded' | 'pending';
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
  text: string & {minLength: 1};
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
  text: string & {minLength: 1};
  explanation: string;
  points: number;
  order: number;
  readonly options: QuizOption[];
}

export interface QuizTask {
  readonly id: number;
  course: number;
  title: string & {minLength: 1; maxLength: 255};
  description: string & {maxLength: 1000};
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
  completion_status: 'passed' | 'failed' | 'in_progress';
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
  title: string & {minLength: 1; maxLength: 255};
  description: string & {maxLength: 1000};
  course?: number;
  order?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

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
  readonly moduleId: string;
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
