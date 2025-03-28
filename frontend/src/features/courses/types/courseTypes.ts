export interface Course {
  id: number;
  title: string;
  description: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CourseVersion {
  id: number;
  course_id: number;
  version_number: number;
  content: string;
  created_at: string;
  updated_at: string;
}
