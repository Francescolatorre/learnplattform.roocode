import { Course, CourseDetails, CourseError } from '../types/courseTypes';

const getAuthToken = () => {
  return localStorage.getItem('access_token') || '';
};

export const fetchCourses = async (category?: string, sortOrder?: string, page?: number, includeReviews?: boolean): Promise<{ courses: Course[], error: CourseError | null }> => {
  try {
    const token = getAuthToken();
    const url = category ? `/api/v1/courses?category=${category}` : '/api/v1/courses';
    const response = await fetch(`${url}${sortOrder ? `&sortOrder=${sortOrder}` : ''}${page ? `&page=${page}` : ''}${includeReviews ? `&includeReviews=${includeReviews}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      switch (response.status) {
        case 401:
          return { courses: [], error: { message: 'Unauthorized. Please log in again.', code: 401 } };
        case 403:
          return { courses: [], error: { message: 'Access forbidden. You do not have permission to view courses.', code: 403 } };
        case 404:
          return { courses: [], error: { message: 'The requested resource was not found. Please check the URL and try again.', code: 404 } };
        case 500:
          return { courses: [], error: { message: 'An internal server error occurred. Please try again later.', code: 500 } };
        default:
          return { courses: [], error: { message: `An error occurred: ${response.statusText}`, code: response.status } };
      }
    }
    const courses = await response.json();
    return { courses, error: null };
  } catch (error) {
    if (error instanceof TypeError) {
      switch (error.message) {
        case 'Failed to fetch':
        case 'NetworkError when attempting to fetch resource.':
          return { courses: [], error: { message: 'Network error. Please check your internet connection and try again.', code: 0 } };
        case 'The operation was aborted.':
          return { courses: [], error: { message: 'Request aborted. Please try again.', code: 0 } };
        case 'The network connection was lost.':
          return { courses: [], error: { message: 'Network connection lost. Please check your internet connection and try again.', code: 0 } };
        default:
          return { courses: [], error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
      }
    }
    return { courses: [], error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
  }
};

export const fetchCourseDetails = async (courseId: string, includeReviews?: boolean, page?: number): Promise<CourseDetails | { error: CourseError }> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/v1/courses/${courseId}/details?includeReviews=${includeReviews}&page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      switch (response.status) {
        case 401:
          return { error: { message: 'Unauthorized. Please log in again.', code: 401 } };
        case 403:
          return { error: { message: 'Access forbidden. You do not have permission to view course details.', code: 403 } };
        case 404:
          return { error: { message: 'The requested resource was not found. Please check the URL and try again.', code: 404 } };
        case 500:
          return { error: { message: 'An internal server error occurred. Please try again later.', code: 500 } };
        default:
          return { error: { message: `An error occurred: ${response.statusText}`, code: response.status } };
      }
    }
    const data = await response.json();
    return data as CourseDetails;
  } catch (error) {
    if (error instanceof TypeError) {
      switch (error.message) {
        case 'Failed to fetch':
        case 'NetworkError when attempting to fetch resource.':
          return { error: { message: 'Network error. Please check your internet connection and try again.', code: 0 } };
        case 'The operation was aborted.':
          return { error: { message: 'Request aborted. Please try again.', code: 0 } };
        case 'The network connection was lost.':
          return { error: { message: 'Network connection lost. Please check your internet connection and try again.', code: 0 } };
        default:
          return { error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
      }
    }
    return { error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
  }
};

export const updateCourseProgress = async (courseId: string, progress: number): Promise<{ success: boolean, error: CourseError | null }> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/v1/courses/${courseId}/progress`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress }),
    });

    if (!response.ok) {
      switch (response.status) {
        case 401:
          return { success: false, error: { message: 'Unauthorized. Please log in again.', code: 401 } };
        case 403:
          return { success: false, error: { message: 'Access forbidden. You do not have permission to update course progress.', code: 403 } };
        case 404:
          return { success: false, error: { message: 'The requested resource was not found. Please check the URL and try again.', code: 404 } };
        case 500:
          return { success: false, error: { message: 'An internal server error occurred. Please try again later.', code: 500 } };
        default:
          return { success: false, error: { message: `An error occurred: ${response.statusText}`, code: response.status } };
      }
    }
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof TypeError) {
      switch (error.message) {
        case 'Failed to fetch':
        case 'NetworkError when attempting to fetch resource.':
          return { success: false, error: { message: 'Network error. Please check your internet connection and try again.', code: 0 } };
        case 'The operation was aborted.':
          return { success: false, error: { message: 'Request aborted. Please try again.', code: 0 } };
        case 'The network connection was lost.':
          return { success: false, error: { message: 'Network connection lost. Please check your internet connection and try again.', code: 0 } };
        default:
          return { success: false, error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
      }
    }
    return { success: false, error: { message: 'An unexpected error occurred. Please try again later.', code: 0 } };
  }
};
