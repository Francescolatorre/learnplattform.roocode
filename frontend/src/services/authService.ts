import axios from 'axios';
import { LoginResponse, TokenRefreshResponse, User } from '../types/authTypes';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const authService = {
    login: async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
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
    },

    logout: async (refreshToken: string): Promise<void> => {
        await axios.post(`${BASE_URL}/auth/logout/`, { refresh_token: refreshToken });
    },

    refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
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
    },
};

export const { refreshToken } = authService;
export default authService;
