export interface Course {
  id: number;
  title: string;
  description: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'restricted';
  learning_objectives?: string[];
  prerequisites?: string[];
  created_at: string;
  updated_at: string;
  creator: number;
}

export interface CourseError {
  message: string;
  code: number;
}

export interface CourseDetails extends Course {
  creator_details?: {
    id: number;
    username: string;
    display_name: string;
  };
}
