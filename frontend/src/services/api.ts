import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
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

export const login = async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/users/login/`, {
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
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/users/register/`, {
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
    await axios.post(`${API_BASE_URL}/users/logout/`, { refresh_token: refreshToken });
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};