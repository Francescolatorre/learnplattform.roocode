import axios from 'axios';
import { Course, CourseDetails, CourseError } from '../types/courseTypes';
import { CourseVersion } from '../features/courses/courseTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

const getAuthToken = () => {
  return localStorage.getItem('access_token') || '';
};

export const fetchCourses = async (category?: string, sortOrder?: string, page?: number, includeReviews?: boolean): Promise<{ courses: Course[], error: CourseError | null }> => {
  try {
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (page) params.append('page', page.toString());
    if (includeReviews) params.append('includeReviews', includeReviews.toString());
    
    const response = await axios.get(`${API_URL}/courses/`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return { courses: response.data.results || response.data, error: null };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0;
      switch (status) {
        case 401:
          return { courses: [], error: { message: 'Unauthorized. Please log in again.', code: 401 } };
        case 403:
          return { courses: [], error: { message: 'Access forbidden. You do not have permission to view courses.', code: 403 } };
        case 404:
          return { courses: [], error: { message: 'The requested resource was not found. Please check the URL and try again.', code: 404 } };
        case 500:
          return { courses: [], error: { message: 'An internal server error occurred. Please try again later.', code: 500 } };
        default:
          return { courses: [], error: { message: `An error occurred: ${error.message}`, code: status } };
      }
    }
    return { courses: [], error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
  }
};

export const fetchCourseDetails = async (courseId: string, includeReviews?: boolean, page?: number): Promise<CourseDetails | { error: CourseError }> => {
  try {
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (includeReviews) params.append('includeReviews', includeReviews.toString());
    if (page) params.append('page', page.toString());
    
    const response = await axios.get(`${API_URL}/courses/${courseId}/`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data as CourseDetails;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0;
      switch (status) {
        case 401:
          return { error: { message: 'Unauthorized. Please log in again.', code: 401 } };
        case 403:
          return { error: { message: 'Access forbidden. You do not have permission to view course details.', code: 403 } };
        case 404:
          return { error: { message: 'The requested resource was not found. Please check the URL and try again.', code: 404 } };
        case 500:
          return { error: { message: 'An internal server error occurred. Please try again later.', code: 500 } };
        default:
          return { error: { message: `An error occurred: ${error.message}`, code: status } };
      }
    }
    return { error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
  }
};

export const updateCourseProgress = async (courseId: string, progress: number): Promise<{ success: boolean, error: CourseError | null }> => {
  try {
    const token = getAuthToken();
    await axios.post(`${API_URL}/courses/${courseId}/progress/`, 
      { progress },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data as CourseVersion[];
  } catch (error) {
    console.error('Failed to fetch course versions:', error);
    throw error;
  }
};