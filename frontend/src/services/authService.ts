import axios from 'axios';
import { LoginResponse, TokenRefreshResponse, User } from '../types/authTypes';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function handleError(error: unknown, context: string) {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
            console.error(`${context}: Unauthorized access. Please log in again.`);
            window.dispatchEvent(new Event('unauthorized'));
        }
    }
}

const authService = {
    login: async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/login/`, { username: usernameOrEmail, password });

            // Fetch user profile after successful login
            const userResponse = await axios.get<User>(`${BASE_URL}/users/profile/`, {
                headers: {
                    'Authorization': `Bearer ${response.data.access}`
                }
            });

            return {
                access: response.data.access,
                refresh: response.data.refresh,
                user: userResponse.data
            };
        } catch (error) {
            handleError(error, 'Login');
            throw error;
        }
    },

    logout: async (refreshToken: string): Promise<void> => {
        try {
            await axios.post(`${BASE_URL}/auth/logout/`, { refresh_token: refreshToken });
        } catch (error) {
            handleError(error, 'Logout');
            throw error;
        }
    },

    refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
        try {
            const response = await axios.post<TokenRefreshResponse>(`${BASE_URL}/auth/token/refresh/`, { refresh: refreshToken });

            // Fetch user profile after token refresh
            const userResponse = await axios.get<User>(`${BASE_URL}/users/profile/`, {
                headers: {
                    'Authorization': `Bearer ${response.data.access}`
                }
            });

            return {
                access: response.data.access,
                refresh: response.data.refresh,
                user: userResponse.data
            };
        } catch (error) {
            handleError(error, 'Token Refresh');
            throw error;
        }
    },
};

export const { refreshToken } = authService;
export default authService;
