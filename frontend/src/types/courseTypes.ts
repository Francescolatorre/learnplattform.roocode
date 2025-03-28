export interface ICourse {
  id: number;
  title: string;
  description: string;
  version: number;
  status: string;
  visibility: string;
  learning_objectives?: string;
  prerequisites?: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  creator?: number;
  creator_details?: {
    id: number;
    username: string;
    email: string;
    // ...other user properties
  };
}

export interface IPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
