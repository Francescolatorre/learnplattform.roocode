export interface CourseError {
  message: string;
  code?: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  author: string;
  duration: number;
  category: string;
  error?: CourseError;
}

export interface CourseVersion {
  id: number;
  course_id: number;
  version_number: number;
  content: string;
  created_at: string;
  is_published: boolean;
}

export interface CourseDetails {
  id: number;
  title: string;
  description: string;
  author: string;
  duration: number;
  category: string;
  progress: number;
  error?: CourseError;
}
