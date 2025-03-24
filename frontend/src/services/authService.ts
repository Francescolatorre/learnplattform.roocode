import axios from 'axios';

export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token found. Please log in again.');
    }

    try {
        const response = await axios.post('/auth/token/refresh/', {
            refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        return access;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        throw new Error('Failed to refresh token. Please log in again.');
    }
};
