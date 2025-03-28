import apiService from '../api/apiService';

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

const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login/', { username: usernameOrEmail, password });
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiService.post<void>('/auth/logout/', { refresh: refreshToken });
    } catch (error) {
      console.error('Failed to log out:', error);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return apiService.post<{ access: string }>('/auth/token/refresh/', { refresh: refreshToken });
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/register/', {
      ...data,
      role: data.role || 'user',
    });
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    return apiService.post<PasswordResetResponse>('/auth/password-reset/', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    return apiService.post<PasswordResetResponse>('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
    });
  },
};

export default authService;
