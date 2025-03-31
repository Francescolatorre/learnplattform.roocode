export interface ILearningTask {
  id: number;
  course: number;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

export interface IPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
