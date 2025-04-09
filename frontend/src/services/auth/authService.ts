import axios from 'axios';

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
  async login(username: string, password: string): Promise<{ access: string; refresh: string }> {
    const response = await apiClient.post('/auth/login/', { username, password });
    return response.data; // Ensure the response matches the OpenAPI schema
  },

  async logout(refreshToken: string, accessToken: string): Promise<void> {
    try {
      const response = await apiClient.post<void>(
        '/auth/logout/',
        { refresh: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data; // Ensure consistency in returning response data
    } catch (error: any) {
      console.error('Failed to log out:', error);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    try {
      const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      return response.data; // Extract the data property from the Axios response
    } catch (error) {
      console.error('Failed to refresh token:', error.response?.data || error.message);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register/', {
      ...data,
      role: data.role || 'user',
    });
    return response.data; // Extract the data property from the Axios response
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/auth/password-reset/', {
      email,
    });
    return response.data; // Extract the data property from the Axios response
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
    });
    return response.data; // Extract the data property from the Axios response
  },

  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/users/profile/', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include the access token
        },
      });
      return response.data; // Return the user profile data
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error; // Re-throw the error for the caller to handle
    }
  },
};

export default authService;
