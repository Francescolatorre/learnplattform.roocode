import apiService from './apiService'; // Import the default export from apiService

interface LoginResponse {
  user: {
    refresh: string;
  }; // Fixed formatting
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

const AUTH_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Use base URL without `/api/v1`

export const login = async (usernameOrEmail: string, password: string): Promise<{ access: string; refresh: string }> => {
  return apiService.post<{ access: string; refresh: string }>(
    '/auth/login/',
    { username: usernameOrEmail, password },
    {},
    AUTH_BASE_URL // Ensure the correct base URL is used
  );
};

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  return apiService.post<LoginResponse>(
    '/auth/register/',
    { ...data, role: data.role || 'user' },
    {},
    AUTH_BASE_URL // Ensure the correct base URL is used
  );
};

export const logout = async (refreshToken: string): Promise<void> => {
  await apiService.post('/auth/logout/', { refresh_token: refreshToken }, {}, AUTH_BASE_URL);
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ access: string }> => {
  return apiService.post('/auth/token/refresh/', { refresh: refreshToken }, {}, AUTH_BASE_URL);
};

export const requestPasswordReset = async (email: string): Promise<PasswordResetResponse> => {
  return apiService.post<PasswordResetResponse>('/auth/password-reset/', { email }, {}, AUTH_BASE_URL);
};

export const resetPassword = async (token: string, newPassword: string): Promise<PasswordResetResponse> => {
  return apiService.post<PasswordResetResponse>(
    '/auth/password-reset/confirm/',
    { token, new_password: newPassword },
    {},
    AUTH_BASE_URL
  );
};

// Export pre-configured resource services for common endpoints
export const courseService = apiService.createResourceService('courses');
export const taskService = apiService.createResourceService('tasks');
export const moduleService = apiService.createResourceService('modules');
export const userService = apiService.createResourceService('users');
export const studentService = apiService.createResourceService('students');

export default apiService; // Add this default export
