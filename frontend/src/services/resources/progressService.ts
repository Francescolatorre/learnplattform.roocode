import {
  CourseProgress,
  QuizHistory,
  ContentEffectivenessData,
  Course,
} from '@types/common/entities';

import {API_CONFIG} from '../api/apiConfig';
import {apiService} from '../api/apiService';

export const fetchStudentProgressByUser = async (studentId: string): Promise<CourseProgress[]> => {
  const response = await apiService.get<CourseProgress[]>(
    API_CONFIG.endpoints.progress.student(studentId)
  );
  if (!response.data) {
    throw new Error('No progress data found');
  }
  return response.data;
};

export const fetchStudentProgressByCourse = async (
  courseId: string,
  studentId: string,
  includeDetails = false
): Promise<CourseProgress | null> => {
  const response = await apiService.get<CourseProgress>(
    API_CONFIG.endpoints.progress.courseStudent(courseId, studentId),
    {params: {includeDetails}}
  );
  return response.data;
};

export const fetchAllStudentsProgress = async (
  courseId: string
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: CourseProgress[];
}> => {
  return apiService.get(API_CONFIG.endpoints.progress.allStudents(courseId));
};

export const getQuizHistory = async (
  courseId: string,
  studentId?: string
): Promise<QuizHistory[]> => {
  const endpoint = studentId
    ? API_CONFIG.endpoints.quiz.studentPerformance(studentId)
    : API_CONFIG.endpoints.quiz.coursePerformance(courseId);
  return apiService.get<QuizHistory[]>(endpoint);
};

export const getContentEffectivenessData = async (
  courseId: string
): Promise<ContentEffectivenessData> => {
  return apiService.get(API_CONFIG.endpoints.contentEffectiveness(courseId));
};

export const updateTaskProgress = async (
  courseId: string,
  taskId: string,
  progressData: any
): Promise<any> => {
  return apiService.patch(API_CONFIG.endpoints.tasks.progress(courseId, taskId), progressData);
};

export const submitTask = async (
  courseId: string,
  taskId: string,
  submissionData: any
): Promise<any> => {
  return apiService.post(API_CONFIG.endpoints.tasks.submit(courseId, taskId), submissionData);
};

export const gradeSubmission = async (
  courseId: string,
  taskId: string,
  studentId: string,
  gradingData: any
): Promise<any> => {
  return apiService.post(
    API_CONFIG.endpoints.tasks.grade(courseId, taskId, studentId),
    gradingData
  );
};

export const fetchCourseDetails = async (courseId: string): Promise<Course> => {
  const response = await apiService.get(API_CONFIG.endpoints.course.details(courseId));
  if (!response.data) {
    throw new Error('Course not found');
  }
  return response.data;
};

export const fetchProgressAnalytics = async (courseId: string): Promise<any> => {
  return apiService.get(API_CONFIG.endpoints.progress.analytics(courseId));
};

export const fetchStudentProgressSummary = async (studentId: string): Promise<any> => {
  return apiService.get(API_CONFIG.endpoints.progress.summary(studentId));
};

export const fetchInstructorDashboardData = async (): Promise<any> => {
  return apiService.get(API_CONFIG.endpoints.instructor.dashboard);
};

export const fetchCourseStructure = async (courseId: string): Promise<any> => {
  return apiService.get(API_CONFIG.endpoints.course.analytics(courseId));
};
