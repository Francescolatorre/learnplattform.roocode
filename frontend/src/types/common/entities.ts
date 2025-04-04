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
