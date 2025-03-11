import { Module } from './Course'; // Correct import for Module type

export interface CourseDetails {
  id: number;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
  modules: Module[];
  duration: number;
  enrollment: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
  modules: Module[];
  duration: number;
  enrollment: number;
  status?: string;
  version?: string;
  created_at?: string;
  updated_at?: string;
  learningObjectives?: string; // Added this line
}

export interface CourseError {
  message: string;
  code: number;
}
