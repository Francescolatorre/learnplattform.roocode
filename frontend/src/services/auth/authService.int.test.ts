import { describe, it, expect, afterAll } from 'vitest';
import { AUTH_CONFIG } from '@/config/appConfig';
import authService from './authService';
import { TEST_USERS } from '@/test-utils/setupIntegrationTests';

describe('authService Integration', () => {
  // Clear localStorage after all tests
  afterAll(() => {
    localStorage.clear();
  });

  it('login returns access and refresh tokens', async () => {
    const data = await authService.login(TEST_USERS.student.username, TEST_USERS.student.password);
    expect(data).toHaveProperty('access');
    expect(data).toHaveProperty('refresh');

    // Store tokens in localStorage manually since we're not using the side effect
    localStorage.setItem(AUTH_CONFIG.tokenStorageKey, data.access);
    localStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, data.refresh);
  });

  it('refreshToken returns new access token', async () => {
    // First login to get tokens and store them in localStorage
    const loginData = await authService.login(
      TEST_USERS.student.username,
      TEST_USERS.student.password
    );
    localStorage.setItem(AUTH_CONFIG.tokenStorageKey, loginData.access);
    localStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, loginData.refresh);

    // Now call refreshToken which will use the token from localStorage
    const refreshData = await authService.refreshToken();
    expect(refreshData).toHaveProperty('access');
    expect(typeof refreshData.access).toBe('string');
  });

  it('getUserProfile returns user profile', async () => {
    const loginData = await authService.login(
      TEST_USERS.student.username,
      TEST_USERS.student.password
    );
    const profile = await authService.getUserProfile(loginData.access);
    expect(profile).toHaveProperty('username', TEST_USERS.student.username);
    expect(profile).toHaveProperty('email');
    expect(profile).toHaveProperty('role');
  });
});
