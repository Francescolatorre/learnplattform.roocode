import axios from 'axios';
import { Course, CourseDetails, CourseError } from '../types/courseTypes';
import { CourseVersion } from '../features/courses/courseTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

const getAuthToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('No access token found in localStorage.');
    throw new Error('Authentication token is missing. Please log in again.');
  }
  return token;
};

export const fetchCourses = async (): Promise<{ results: Course[] }> => {
  const token = getAuthToken();
  try {
    const response = await axios.get(`${API_URL}/courses/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('fetchCourses response:', response.data); // Log the response
    return response.data; // Ensure the full response is returned
  } catch (error) {
    console.error('Error in fetchCourses:', error); // Log the error
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || `Failed to fetch courses. Status: ${error.response?.status}`
      );
    }
    throw new Error('An unexpected error occurred while fetching courses');
  }
};

export const fetchCourseDetails = async (courseId: string, userId: string) => {
  const token = getAuthToken();
  try {
    const courseResponse = await axios.get(`${API_URL}/courses/${courseId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const enrollmentResponse = await axios.get(`${API_URL}/course-enrollments/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { course: courseId },
    });

    return {
      courseData: courseResponse.data,
      enrollmentData: enrollmentResponse.data,
    };
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw new Error('Failed to fetch course details.');
  }
};

export const enrollInCourse = async (courseId: string) => {
  const token = localStorage.getItem('access_token');
  await axios.post(
    '/api/v1/course-enrollments/',
    { course: courseId, status: 'active' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updateCourseDetails = async (courseId: string, courseData: any) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL} / courses / ${courseId} / `, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating course details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message || `Failed to update course details. Status: ${error.response?.status}`
      );
    }
    console.error('Unexpected error updating course details:', error);
    throw new Error('An unexpected error occurred while updating course details.');
  }
};

export const updateCourseProgress = async (
  courseId: string,
  progress: number
): Promise<{ success: boolean; error: CourseError | null }> => {
  try {
    const token = getAuthToken();
    await axios.post(
      `${API_URL}/courses/${courseId}/progress/`,
      { progress },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, error: null };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0;
      switch (status) {
        case 401:
          return { success: false, error: { message: 'Unauthorized. Please log in again.', code: 401 } };
        case 403:
          return { success: false, error: { message: 'Access forbidden. You do not have permission to update course progress.', code: 403 } };
        case 404:
          return { success: false, error: { message: 'The requested resource was not found. Please check the URL and try again.', code: 404 } };
        case 500:
          return { success: false, error: { message: 'An internal server error occurred. Please try again later.', code: 500 } };
        default:
          return { success: false, error: { message: `An error occurred: ${error.message}`, code: status } };
      }
    }
    return { success: false, error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
  }
};

export const fetchCourseVersions = async (courseId: string): Promise<CourseVersion[]> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/courses/${courseId}/versions/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data as CourseVersion[];
  } catch (error) {
    console.error('Failed to fetch course versions:', error);
    throw error;
  }
};

export const fetchStudentProgress = async (courseId: number) => {
  const token = getAuthToken();
  const response = await axios.get(`${API_URL}/courses/${courseId}/student-progress/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminDashboardSummary = async (): Promise<any> => {
  const token = getAuthToken();
  try {
    const response = await axios.get(`${API_URL}/dashboard/admin-summary/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard summary:', error);
    throw new Error('Failed to fetch admin dashboard summary.');
  }
};
