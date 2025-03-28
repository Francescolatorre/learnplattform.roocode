import apiService from './apiService';
import { Course, CourseVersion, PaginatedResponse } from '../types/apiTypes';

const BASE_URL = '/api/v1/courses'; // Explicitly include /api/v1

export const courseService = apiService.createResourceService('courses');

export const fetchCourses = async (): Promise<PaginatedResponse<Course>> => {
  return apiService.get<PaginatedResponse<Course>>(`${BASE_URL}/`, {
    params: { includeEnrollmentStatus: true },
  });
};

export const fetchCourseDetails = async (courseId: string, includeArchived = false): Promise<Course> => {
  if (!courseId) {
    throw new Error('Course ID is required to fetch course details.');
  }

  try {
    return await apiService.get<Course>(`/api/v1/courses/${courseId}/`, {
      params: { includeArchived },
    });
  } catch (error) {
    console.error(`Failed to fetch course details for courseId: ${courseId}`, error);
    throw error;
  }
};

export const enrollInCourse = async (courseId: string): Promise<void> => {
  try {
    await apiService.post(`${BASE_URL}/${courseId}/enroll/`);
  } catch (error: any) {
    console.error('API Error:', error);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);

    if (error.response?.status === 400 && error.response?.data?.detail === 'You are already enrolled in this course.') {
      throw new Error('You are already enrolled in this course.');
    }

    throw error;
  }
};

export const unenrollFromCourse = async (courseId: string): Promise<void> => {
  await apiService.post(`${BASE_URL}/${courseId}/unenroll/`);
};

export const updateCourseDetails = async (courseId: string, courseData: Partial<Course>, includeModules = false): Promise<Course> => {
  return apiService.put<Course>(`${BASE_URL}/${courseId}/`, courseData, { includeModules });
};

export const updateCourseProgress = async (courseId: string, progress: number): Promise<{ success: boolean; error: any | null }> => {
  try {
    await apiService.post(`${BASE_URL}/${courseId}/progress/`, { progress });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: { message: error.message, code: error.response?.status || 0 } };
  }
};

export const fetchCourseVersions = async (courseId: string): Promise<CourseVersion[]> => {
  return apiService.get<CourseVersion[]>(`${BASE_URL}/${courseId}/versions/`);
};

export const fetchStudentProgress = async (courseId: number): Promise<any> => {
  return apiService.get(`${BASE_URL}/${courseId}/student-progress/`);
};

export const fetchAdminDashboardSummary = async (): Promise<any> => {
  return apiService.get('/api/v1/dashboard/admin-summary/');
};

export const fetchEnrolledStudents = async (courseId: string): Promise<{ count: number; next: string | null; previous: string | null; results: any[] }> => {
  return apiService.get(`${BASE_URL}/${courseId}/enrolled-students/`);
};

export const fetchCourseAnalytics = async (courseId: string): Promise<any> => {
  return apiService.get(`${BASE_URL}/${courseId}/analytics/`);
};

export const fetchUserCourseProgress = async (): Promise<any[]> => {
  return apiService.get<any[]>(`${BASE_URL}/progress/`);
};

export const fetchUserEnrollments = async (): Promise<any> => {
  try {
    const response = await apiService.get('/api/v1/course-enrollments/');
    // Map course details to include the title from course_details
    const mappedResults = response.results.map((enrollment: any) => ({
      ...enrollment,
      course: {
        ...enrollment.course_details, // Extract course details
        id: enrollment.course, // Ensure course ID is preserved
      },
    }));
    return { ...response, results: mappedResults };
  } catch (error) {
    console.error('Failed to fetch user enrollments:', error);
    throw error;
  }
};

export const fetchLearningTasks = async (courseId: string) => {
  try {
    const response = await apiService.get(`/api/v1/learning-tasks/course/${courseId}/`);
    console.log('Full Axios Response:', response); // Debug log for the full response

    if (response) {
      return response; // Return the data if it exists
    }

    console.warn('Response data is undefined:', response);
    return []; // Return an empty array as a fallback
  } catch (error) {
    console.error(`Failed to fetch learning tasks for courseId: ${courseId}`, error);
    throw error;
  }
};

export const CourseService = {
  async getTasks(courseId: string, page: number = 1) {
    try {
      const response = await apiService.get(`/api/v1/learning-tasks/course/${courseId}/`, { params: { page } });
      return response.data?.results || []; // Safely handle missing results
    } catch (error) {
      console.error(`Failed to fetch tasks for courseId: ${courseId}`, error);
      throw error;
    }
  },

  async getTask(courseId: string, taskId: string) {
    try {
      const response = await apiService.get(`/api/v1/courses/${courseId}/tasks/${taskId}/`); // Ensure /api/v1 prefix
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch task ${taskId} for courseId: ${courseId}`, error);
      throw error;
    }
  },

  async createTask(courseId: string, taskData: any) {
    try {
      const response = await apiService.post(`/api/v1/courses/${courseId}/tasks/`, taskData); // Ensure /api/v1 prefix
      return response.data;
    } catch (error) {
      console.error(`Failed to create task for courseId: ${courseId}`, error);
      throw error;
    }
  },

  async updateTask(courseId: string, taskId: string, taskData: any) {
    try {
      const response = await apiService.put(`/api/v1/courses/${courseId}/tasks/${taskId}/`, taskData); // Ensure /api/v1 prefix
      return response.data;
    } catch (error) {
      console.error(`Failed to update task ${taskId} for courseId: ${courseId}`, error);
      throw error;
    }
  },

  async deleteTask(courseId: string, taskId: string) {
    try {
      await apiService.delete(`/api/v1/courses/${courseId}/tasks/${taskId}/`); // Ensure /api/v1 prefix
    } catch (error) {
      console.error(`Failed to delete task ${taskId} for courseId: ${courseId}`, error);
      throw error;
    }
  },
};
