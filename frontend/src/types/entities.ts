// src/types/common/entities.ts

import {ICourse} from './course';
import {IUser} from './user';


// Basistypen
export type TCompletionStatus = 'active' | 'completed' | 'dropped';
export type TQuizCompletionStatus = 'passed' | 'failed' | 'in_progress';




// Enrollment-Typen
export interface ICourseEnrollment {
  readonly id: number;
  user: number;
  course: number;
  enrollment_date?: string;
  status: TCompletionStatus;
  settings?: Record<string, any> | null;
  user_details?: IUser;
  course_details?: ICourse;
  progress_percentage?: string;
}

export type IEnrollment = ICourseEnrollment;

// Quiz-bezogene Typen
export interface IQuizOption {
  readonly id: number;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface IQuizQuestion {
  readonly id: number;
  quiz: string;
  text: string;
  explanation: string;
  points: number;
  order: number;
  readonly options: IQuizOption[];
}

export interface IQuizTask {
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
  readonly questions: IQuizQuestion[];
}

export interface IQuizResponse {
  readonly id: number;
  attempt: number;
  question: number;
  selected_option: number;
  is_correct: boolean;
  time_spent: string;
  question_details: IQuizQuestion;
  selected_option_details: IQuizOption;
}

export interface IQuizAttempt {
  readonly id: number;
  user: number;
  quiz: string;
  score: number;
  time_taken: string;
  completion_status: TQuizCompletionStatus;
  attempt_date: string;
  user_details: IUser;
  quiz_details: IQuizTask;
  readonly responses: IQuizResponse[];
}



// Progress-bezogene Typen - ohne Konflikte
export interface IUserProgress {
  id: number;
  percentage: number;
  label: string;
}

