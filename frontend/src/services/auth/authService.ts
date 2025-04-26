import axios from 'axios';
import { IUser } from '@/types/userTypes';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/', // Ensure this matches the backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginResponse {
  user: {
    refresh: string;
  };
  access: string;
  refresh: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  role?: string;
}

interface PasswordResetResponse {
  detail: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  display_name?: string;
}

const authService = {
  async login(username: string, password: string): Promise<IUser> {
    try {
      // Step 1: Get auth tokens
      const response = await apiClient.post('/auth/login/', {username, password});
      if (!response || typeof response !== 'object' || !('data' in response) || !response.data) {
        throw new Error('Login failed: No response data received from server.');
      }
      if (!response.data.access || !response.data.refresh) {
        throw new Error('Login failed: Malformed response from server.');
      }
      
      // Store tokens for later use
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Step 2: Fetch user profile with the new access token
      const profileResponse = await apiClient.get('/users/profile/', {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      
      if (!profileResponse || !profileResponse.data) {
        throw new Error('Failed to fetch user profile after login');
      }
      
      // Step 3: Combine the data into a user object with role
      const userData: IUser = {
        id: profileResponse.data.id.toString(),
        username: profileResponse.data.username,
        email: profileResponse.data.email,
        role: profileResponse.data.role || 'student', // Default to student if no role
        display_name: profileResponse.data.display_name
      };
      
      // Return the complete user object
      return {
        ...userData,
        access,
        refresh
      };
    } catch (error) {
      console.error('Login process failed:', error);
      throw error;
    }
  },

  async logout(refreshToken: string, accessToken: string): Promise<void> {
    try {
      const response = await apiClient.post<void>(
        '/auth/logout/',
        {refresh: refreshToken},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response || typeof response !== 'object' || !('data' in response)) {
        throw new Error('Logout failed: No response data received from server.');
      }
      // Some logout endpoints may return empty data, so just return if no error
      return;
    } catch (error: unknown) {
      console.error('Failed to log out:', error);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<{access: string}> {
    try {
      const response = await apiClient.post<{access: string}>('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      if (!response || typeof response !== 'object' || !('data' in response) || !response.data) {
        throw new Error('Token refresh failed: No response data received from server.');
      }
      if (!response.data.access) {
        throw new Error('Token refresh failed: Malformed response from server.');
      }
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Failed to refresh token:', error.response.data);
      } else if (error instanceof Error) {
        console.error('Failed to refresh token:', error.message);
      } else {
        console.error('Failed to refresh token:', error);
      }
      throw error;
    }
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register/', {
      ...data,
      role: data.role || 'user',
    });
    if (!response || typeof response !== 'object' || !('data' in response) || !response.data) {
      throw new Error('Registration failed: No response data received from server.');
    }
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/auth/password-reset/', {
      email,
    });
    if (!response || typeof response !== 'object' || !('data' in response) || !response.data) {
      throw new Error('Password reset request failed: No response data received from server.');
    }
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
    });
    if (!response || typeof response !== 'object' || !('data' in response) || !response.data) {
      throw new Error('Password reset failed: No response data received from server.');
    }
    return response.data;
  },

  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/users/profile/', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include the access token
        },
      });
      if (!response || typeof response !== 'object' || !('data' in response) || !response.data) {
        throw new Error('Get user profile failed: No response data received from server.');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error; // Re-throw the error for the caller to handle
    }
  },

  // Add a validation method to check token validity
  async validateToken(): Promise<boolean> {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return false;
    
    try {
      await apiClient.get('/auth/validate-token/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },
};

export default authService;
