import axios from 'axios';

import { AUTH_CONFIG } from '@/config/appConfig';
import { API_CONFIG } from '@/services/api/apiConfig';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL, // Use centralized API configuration
  headers: {
    'Content-Type': 'application/json',
  },
});

interface PasswordResetResponse {
  detail: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Auth service for handling authentication-related API calls
 * Uses token-based authentication with user data kept only in memory
 */
const authService = {
  /**
   * Authenticates a user and returns access and refresh tokens
   */
  async login(username: string, password: string): Promise<{ access: string; refresh: string }> {
    console.log('Auth service debug - baseURL:', apiClient.defaults.baseURL);
    console.log('Auth service debug - full URL:', `${apiClient.defaults.baseURL}/auth/login/`);
    console.log('Auth service debug - API_CONFIG.baseURL:', API_CONFIG.baseURL);

    const response = await apiClient.post('/auth/login/', { username, password }); // Added trailing slash to handle APPEND_SLASH setting

    console.log('Auth login debug:', {
      responseType: typeof response,
      response: response,
      hasData: response && 'data' in response,
      responseKeys: response ? Object.keys(response) : 'no keys',
    });

    // Handle both unit test format (direct data) and integration test format (full Axios response)
    const data = response && 'data' in response ? response.data : response;

    console.log('Auth login data:', {
      dataType: typeof data,
      data: data,
      hasAccess: data && 'access' in data,
      hasRefresh: data && 'refresh' in data,
    });

    if (!data || typeof data !== 'object') {
      throw new Error('Login failed: No response data received from server.');
    }
    if (!data.access || !data.refresh) {
      throw new Error('Login failed: Malformed response from server.');
    }

    // Store tokens in localStorage
    localStorage.setItem(AUTH_CONFIG.tokenStorageKey, data.access);
    localStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, data.refresh);

    return data;
  },

  /**
   * Logs out the current user by calling the logout endpoint
   * Also cleans up tokens from localStorage
   */
  async logout(): Promise<void> {
    try {
      // Get tokens from localStorage
      const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
      const accessToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);

      if (refreshToken && accessToken) {
        // Only call logout API if we have tokens
        await apiClient.post<void>(
          '/auth/logout/',
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      // Always clean up localStorage on logout regardless of API call success
      localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
      localStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);

      return;
    } catch (error: unknown) {
      console.error('Failed to log out:', error);

      // Still clean up localStorage even if API call fails
      localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
      localStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);

      throw error;
    }
  },

  /**
   * Refreshes the access token using a refresh token
   */
  async refreshToken(): Promise<{ access: string }> {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);

      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
        refresh: refreshToken,
      });

      // Handle both unit test format (direct data) and integration test format (full Axios response)
      const data = response && 'data' in response ? response.data : response;

      if (!data || typeof data !== 'object') {
        throw new Error('Token refresh failed: No response data received from server.');
      }

      if (!data.access) {
        throw new Error('Token refresh failed: Malformed response from server.');
      }

      // Update access token in localStorage
      localStorage.setItem(AUTH_CONFIG.tokenStorageKey, data.access);

      return data;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response
      ) {
        console.error('Failed to refresh token:', error.response.data);
      } else if (error instanceof Error) {
        console.error('Failed to refresh token:', error.message);
      } else {
        console.error('Failed to refresh token:', error);
      }
      throw error;
    }
  },

  /**
   * Validates the current token against the server to ensure it's still valid
   * @returns Promise<boolean> True if token is valid, false otherwise
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);

      if (!token) {
        console.warn('validateToken: No token found in localStorage');
        return false;
      }

      // Set a timeout to avoid hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await apiClient.get(
          '/auth/validate-token/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);
        return response.status === 200;
      } catch {
        clearTimeout(timeoutId);

        // If error is due to token expiration, try to refresh the token
        const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
        if (refreshToken) {
          try {
            // Attempt to refresh the token
            const refreshResponse = await this.refreshToken();
            if (refreshResponse && refreshResponse.access) {
              // Token refreshed successfully
              return true;
            }
          } catch (refreshError) {
            console.error('Token refresh failed during validation:', refreshError);
          }
        }

        return false;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  /**
   * Registers a new user with the provided data
   */
  async register(username: string, email: string, password: string): Promise<any> {
    const response = await apiClient.post('/auth/register/', {
      username,
      email,
      password,
      password2: password, // Assuming your API requires password confirmation
      role: 'student', // Default role, change as needed
    });

    // Handle both unit test format (direct data) and integration test format (full Axios response)
    const data = response && 'data' in response ? response.data : response;

    if (!data || typeof data !== 'object') {
      throw new Error('Registration failed: No response data received from server.');
    }

    // If registration returns tokens, store them
    if (data.access && data.refresh) {
      localStorage.setItem(AUTH_CONFIG.tokenStorageKey, data.access);
      localStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, data.refresh);
    }

    return data;
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/auth/password-reset/', {
      email,
    });
    // Handle both unit test format (direct data) and integration test format (full Axios response)
    const data = response && 'data' in response ? response.data : response;

    if (!data || typeof data !== 'object') {
      throw new Error('Password reset request failed: No response data received from server.');
    }
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
    });
    // Handle both unit test format (direct data) and integration test format (full Axios response)
    const data = response && 'data' in response ? response.data : response;

    if (!data || typeof data !== 'object') {
      throw new Error('Password reset failed: No response data received from server.');
    }
    return data;
  },

  /**
   * Gets the user profile using the provided access token or the one in localStorage
   */
  async getUserProfile(accessToken?: string): Promise<UserProfile> {
    try {
      // Use provided token or get from localStorage
      const token = accessToken || localStorage.getItem(AUTH_CONFIG.tokenStorageKey);

      if (!token) {
        throw new Error('No access token available');
      }

      const response = await apiClient.get<UserProfile>('/users/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle both unit test format (direct data) and integration test format (full Axios response)
      const data = response && 'data' in response ? response.data : response;

      if (!data || typeof data !== 'object') {
        throw new Error('Get user profile failed: No response data received from server.');
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },
};

export default authService;
