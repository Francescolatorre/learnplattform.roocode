import axios, {AxiosInstance, AxiosRequestConfig, AxiosError} from 'axios';
import {API_CONFIG} from './apiConfig';
import {authEventService} from '../../context/auth/AuthEventService';
import {AuthEventType} from '../../context/auth/types';

/**
 * Configured Axios instance with authentication interceptors
 * This serves as the central Axios instance for the application
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor to attach authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug('API request: Attaching auth token to request:', {url: config.url});
    } else {
      console.debug('API request: No auth token available for request:', {url: config.url});
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.error('API unauthorized error:', {
        url: error.config?.url,
        status: error.response.status
      });

      // Publish auth error event
      authEventService.publish({
        type: AuthEventType.AUTH_ERROR,
        payload: {
          error: {
            message: 'Authentication failed',
            code: 'unauthorized',
            details: {status: 401}
          }
        }
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
