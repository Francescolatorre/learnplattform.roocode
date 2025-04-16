import {describe, it, expect} from 'vitest';

import authService from './authService';

const TEST_USERS = {
    student: {
        username: 'student',
        password: 'student123',
    },
};

describe('authService Integration', () => {
    it('login returns access and refresh tokens', async () => {
        const data = await authService.login(TEST_USERS.student.username, TEST_USERS.student.password);
        expect(data).toHaveProperty('access');
        expect(data).toHaveProperty('refresh');
    });

    it('refreshToken returns new access token', async () => {
        const loginData = await authService.login(TEST_USERS.student.username, TEST_USERS.student.password);
        const refreshData = await authService.refreshToken(loginData.refresh);
        expect(refreshData).toHaveProperty('access');
        expect(typeof refreshData.access).toBe('string');
    });

    it('getUserProfile returns user profile', async () => {
        const loginData = await authService.login(TEST_USERS.student.username, TEST_USERS.student.password);
        const profile = await authService.getUserProfile(loginData.access);
        expect(profile).toHaveProperty('username', TEST_USERS.student.username);
        expect(profile).toHaveProperty('email');
        expect(profile).toHaveProperty('role');
    });
});
