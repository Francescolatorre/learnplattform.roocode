import apiService from './apiService';

const authService = {
    async login(usernameOrEmail: string, password: string) {
        const response = await apiService.post('/auth/login/', { username: usernameOrEmail, password });
        return response;
    },

    async logout(refreshToken: string) {
        try {
            await apiService.post('/auth/logout/', { refresh: refreshToken }); // Include refresh token in the body
        } catch (error) {
            console.error('Failed to log out:', error);
            throw error;
        }
    },

    async refreshToken(refreshToken: string) {
        const response = await apiService.post('/auth/token/refresh/', { refresh: refreshToken });
        return response;
    },
};

export default authService;
