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
  status?: string;
  visibility?: string;
  learningObjectives?: string;
  prerequisites?: string;
  progress?: number; // Added progress property
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

export interface CourseStructure {
  courseId: string;
  courseTitle: string;
  modules: ModuleStructure[];
  learningObjectives: LearningObjective[];
}

export interface ModuleStructure {
  id: string;
  title: string;
  description: string;
  position: number;
  sections: SectionStructure[];
}

export interface SectionStructure {
  id: string;
  title: string;
  position: number;
  taskIds: string[];
}

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  relatedTaskIds: string[];
}
