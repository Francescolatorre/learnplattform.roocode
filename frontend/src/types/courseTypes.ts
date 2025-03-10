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
