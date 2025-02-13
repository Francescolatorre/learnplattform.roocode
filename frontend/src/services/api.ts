import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
  },
  courses: {
    list: '/courses',
    detail: (id: string) => `/courses/${id}`,
    tasks: (id: string) => `/courses/${id}/tasks`,
  },
  tasks: {
    detail: (id: string) => `/tasks/${id}`,
    submit: (id: string) => `/tasks/${id}/submit`,
  },
  submissions: {
    list: '/submissions/me',
    create: '/submissions',
  },
  progress: {
    overview: '/progress',
    course: (id: string) => `/progress/${id}`,
  },
};

// Type definitions
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Helper function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || 'An error occurred',
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    };
  }
  return {
    message: 'An unexpected error occurred',
  };
};