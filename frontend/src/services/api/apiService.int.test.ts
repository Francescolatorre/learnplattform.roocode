import {describe, it, expect} from 'vitest';

import {apiService} from './apiService';

const API_URL = 'http://localhost:8000';

const TEST_USERS = {
    student: {
        username: 'student',
        password: 'student123',
    },
};

describe('ApiService Integration', () => {
    it('GET /health/ returns healthy status', async () => {
        const data = await apiService.get(`${API_URL}/health/`);
        expect(data).toHaveProperty('status', 'healthy');
    });

    it('POST /auth/login/ returns access and refresh tokens', async () => {
        const data = await apiService.post(`${API_URL}/auth/login/`, {
            username: TEST_USERS.student.username,
            password: TEST_USERS.student.password,
        });
        expect(data).toHaveProperty('access');
        expect(data).toHaveProperty('refresh');
    });

    it('GET /api/v1/courses/ without auth returns 401', async () => {
        try {
            await apiService.get(`${API_URL}/api/v1/courses/`);
            // Should not reach here
            expect(false).toBe(true);
        } catch (error: any) {
            expect(error.response?.status).toBe(401);
        }
    });

    it('GET /api/v1/courses/ with auth returns courses', async () => {
        // Login to get token
        const loginData = await apiService.post(`${API_URL}/auth/login/`, {
            username: TEST_USERS.student.username,
            password: TEST_USERS.student.password,
        });
        const token = loginData.access;

        // Create an authenticated ApiService instance
        const authedApiService = new (apiService.constructor as any)({
            ...apiService['api'].defaults,
            headers: {
                ...apiService['api'].defaults.headers,
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await authedApiService.get(`${API_URL}/api/v1/courses/`);
        expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    });
});
