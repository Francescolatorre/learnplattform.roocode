import apiService from '../api/apiService';
import {CourseProgress, QuizHistory, ContentEffectivenessData} from 'src/types/common/entities';

export const fetchStudentProgressByUser = async (studentId: string): Promise<CourseProgress[]> => {
  return apiService.get<CourseProgress[]>(`students/${studentId}/progress/`);
};

export const fetchStudentProgressByCourse = async (
  courseId: string,
  studentId: string,
  includeDetails = false
): Promise<CourseProgress | null> => {
  return apiService.get<CourseProgress>(`courses/${courseId}/student-progress/${studentId}/`, {
    includeDetails,
  });
};

export const fetchAllStudentsProgress = async (
  courseId: string
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: CourseProgress[];
}> => {
  return apiService.get(`courses/${courseId}/student-progress/`);
};

export const getQuizHistory = async (
  courseId: string,
  studentId?: string
): Promise<QuizHistory[]> => {
  const endpoint = studentId
    ? `students/${studentId}/quiz-performance/`
    : `courses/${courseId}/quiz-performance/`;
  return apiService.get<QuizHistory[]>(endpoint);
};

export const getContentEffectivenessData = async (
  courseId: string
): Promise<ContentEffectivenessData> => {
  return apiService.get(`courses/${courseId}/content-effectiveness/`);
};

export const updateTaskProgress = async (
  courseId: string,
  taskId: string,
  progressData: any
): Promise<any> => {
  return apiService.patch(`courses/${courseId}/tasks/${taskId}/progress`, progressData);
};

export const submitTask = async (
  courseId: string,
  taskId: string,
  submissionData: any
): Promise<any> => {
  return apiService.post(`courses/${courseId}/tasks/${taskId}/submit`, submissionData);
};

export const gradeSubmission = async (
  courseId: string,
  taskId: string,
  studentId: string,
  gradingData: any
): Promise<any> => {
  return apiService.post(
    `courses/${courseId}/tasks/${taskId}/students/${studentId}/grade`,
    gradingData
  );
};

export const fetchCourseDetails = async (courseId: string): Promise<any> => {
  return apiService.get(`courses/${courseId}/details/`);
};

export const fetchProgressAnalytics = async (courseId: string): Promise<any> => {
  return apiService.get(`courses/${courseId}/progress-analytics/`);
};

export const fetchStudentProgressSummary = async (studentId: string): Promise<any> => {
  return apiService.get(`students/${studentId}/progress-summary/`);
};

export const fetchInstructorDashboardData = async (): Promise<any> => {
  return apiService.get('instructor/dashboard/');
};

export const fetchCourseStructure = async (courseId: string): Promise<any> => {
  return apiService.get(`courses/${courseId}/analytics/`);
};
