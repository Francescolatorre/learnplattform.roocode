import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const AUTH_BASE_URL = `${API_BASE_URL}/api/v1/auth`;

interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    display_name: string;
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

export const login = async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${AUTH_BASE_URL}/login/`, {
      username_or_email: usernameOrEmail,
      password: password
    });
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${AUTH_BASE_URL}/register/`, {
      ...data,
      role: data.role || 'user'
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logout = async (refreshToken: string) => {
  try {
    await axios.post(`${AUTH_BASE_URL}/logout/`, { refresh_token: refreshToken });
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/token/refresh/`, { refresh: refreshToken });
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
  try {
    const response = await axios.post<PasswordResetResponse>(
      `${AUTH_BASE_URL}/password-reset/`,
      { email }
    );
    return response.data;
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<PasswordResetResponse> => {
  try {
    const response = await axios.post<PasswordResetResponse>(
      `${AUTH_BASE_URL}/password-reset/confirm/`,
      {
        token,
        new_password: newPassword
      }
    );
    return response.data;
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
};