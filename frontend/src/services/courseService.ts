import apiService from './apiService';
import { Course, CourseVersion, CourseError } from '../types/apiTypes';

export const fetchCourses = async (status: string): Promise<Course[]> => {
  return apiService.get<Course[]>('courses/', { status });
};

export const fetchCourseDetails = async (courseId: string): Promise<Course> => {
  return apiService.get<Course>(`courses/${courseId}/`);
};

export const enrollInCourse = async (courseId: string): Promise<void> => {
  await apiService.post('course-enrollments/', { course: courseId, status: 'active' });
};

export const updateCourseDetails = async (courseId: string, courseData: Partial<Course>, includeModules = false): Promise<Course> => {
  return apiService.put<Course>(`courses/${courseId}/`, courseData, { includeModules });
};

export const updateCourseProgress = async (courseId: string, progress: number): Promise<{ success: boolean; error: CourseError | null }> => {
  try {
    await apiService.post(`courses/${courseId}/progress/`, { progress });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: { message: error.message, code: error.response?.status || 0 } };
  }
};

export const fetchCourseVersions = async (courseId: string): Promise<CourseVersion[]> => {
  return apiService.get<CourseVersion[]>(`courses/${courseId}/versions/`);
};

export const fetchStudentProgress = async (courseId: number): Promise<any> => {
  return apiService.get(`courses/${courseId}/student-progress/`);
};

export const fetchAdminDashboardSummary = async (): Promise<any> => {
  return apiService.get('dashboard/admin-summary/');
};

export const fetchEnrolledStudents = async (courseId: string): Promise<{ count: number; next: string | null; previous: string | null; results: any[] }> => {
  return apiService.get(`courses/${courseId}/enrolled-students/`);
};

export const fetchCourseAnalytics = async (courseId: string): Promise<any> => {
  return apiService.get(`courses/${courseId}/analytics/`);
};
