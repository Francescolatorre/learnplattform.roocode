export interface Course {
  id: string;
  title: string;
  category: 'Web Development' | 'Data Science' | 'Cybersecurity';
  description: string;
  instructor: number;
  created_at: string;
  updated_at: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PRIVATE' | 'PUBLIC' | 'RESTRICTED';
  imageUrl: string;
}

export interface CourseDetails extends Course {
  modules: Module[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}
