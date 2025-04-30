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

// Flag to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedRequestQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process requests waiting for token refresh
 * @param token - New token to apply to queued requests
 * @param error - Error if token refresh failed
 */
const processQueue = (token: string | null, error: any = null): void => {
  failedRequestQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  // Clear the queue
  failedRequestQueue = [];
};

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
    // Get the original request config
    const originalRequest = error.config as AxiosRequestConfig & {_retry?: boolean};

    // Handle 401 Unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark this request to prevent infinite retry loop
      originalRequest._retry = true;

      // If token refresh is already in progress, queue this request
      if (isRefreshing) {
        try {
          // Wait for the ongoing refresh to complete
          const newToken = await new Promise<string>((resolve, reject) => {
            failedRequestQueue.push({resolve, reject});
          });

          // Retry with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token for queued request:', refreshError);
          return Promise.reject(refreshError);
        }
      }

      // Start token refresh process
      isRefreshing = true;

      try {
        // Try to get a new token using the refresh token
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Make refresh token request
        const response = await axios.post(`${API_CONFIG.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken
        });

        // Store the new tokens
        const {access, refresh} = response.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);

        // Update Authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        // Process queued requests with the new token
        processQueue(access);

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Failed to refresh token - handle auth failure
        console.error('Token refresh failed:', refreshError);

        // Process queued requests with error
        processQueue(null, refreshError);

        // Publish auth error event
        authEventService.publish({
          type: AuthEventType.AUTH_ERROR,
          payload: {
            error: {
              message: 'Authentication session expired',
              code: 'token_refresh_failed',
              details: {status: 401}
            }
          }
        });

        // Clear tokens since they're invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        return Promise.reject(refreshError);
      } finally {
        // Reset refreshing flag
        isRefreshing = false;
      }
    }

    // Handle other error types
    if (error.response) {
      // Server responded with an error status code
      console.error('API error response:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('API network error (no response):', {
        url: error.config?.url
      });
    } else {
      // Error in setting up the request
      console.error('API request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
