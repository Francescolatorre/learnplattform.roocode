export interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  role: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  version?: number;
  status: string;
  visibility: string;
  learning_objectives?: string;
  prerequisites?: string;
  created_at?: string;
  updated_at?: string;
  creator?: number | null;
  creator_details?: User;
}

export interface CourseDetails extends Course {
  // Additional fields for detailed course view
  version?: number;
}

export interface LearningTask {
  id: number;
  course: number;
  title: string;
  description: string;
  order?: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TaskProgress {
  id: number;
  user: number;
  task: number;
  status: string;
  time_spent?: string;
  completion_date?: string | null;
  user_details?: User;
  task_details?: LearningTask;
}
