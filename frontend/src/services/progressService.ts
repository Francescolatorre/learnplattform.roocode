import { CourseProgress } from '../types/progressTypes';
import { CourseStructure } from '../types/courseTypes';

export const fetchStudentProgress = async (courseId: string, studentId?: string): Promise<CourseProgress> => {
  const response = await fetch(`/api/progress?courseId=${courseId}&studentId=${studentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch student progress');
  }
  return response.json();
};

export const fetchCourseStructure = async (courseId: string): Promise<CourseStructure> => {
  const response = await fetch(`/api/course-structure?courseId=${courseId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch course structure');
  }
  return response.json();
};
