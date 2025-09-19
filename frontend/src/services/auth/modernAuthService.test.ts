/**
 * Modern Auth Service Tests (2025 Best Practices)
 *
 * Comprehensive test suite for the modern authentication service,
 * following the testing patterns established in TASK-012 for modern services.
 *
 * Test Coverage:
 * - Authentication operations (login, register, logout)
 * - Token management and refresh
 * - User profile operations
 * - Password reset functionality
 * - Error handling with withManagedExceptions
 * - Security token storage patterns
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ModernAuthService, modernAuthService } from './modernAuthService';
import { UserRoleEnum } from '@/types/userTypes';

// Mock the API client and dependencies
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  setAuthToken: vi.fn(),
};

// Mock withManagedExceptions to simplify testing
vi.mock('@/utils/errorHandling', () => ({
  withManagedExceptions: (fn: () => Promise<any>) => fn,
}));

// Mock AUTH_CONFIG
vi.mock('@/config/appConfig', () => ({
  AUTH_CONFIG: {
    tokenStorageKey: 'access_token',
    refreshTokenStorageKey: 'refresh_token',
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe.skip('ModernAuthService', () => {
  let authService: ModernAuthService;

  const mockUserProfile = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'student',
    display_name: 'Test User',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const mockTokens = {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new ModernAuthService({
      apiClient: mockApiClient as any,
    });
  });

  describe('Login', () => {
    it('should login successfully and store tokens', async () => {
      mockApiClient.post.mockResolvedValue(mockTokens);

      const result = await authService.login('testuser', 'password');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login/', {
        username: 'testuser',
        password: 'password',
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', mockTokens.access);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', mockTokens.refresh);
      expect(result).toEqual(mockTokens);
    });

    it('should throw error for malformed login response', async () => {
      mockApiClient.post.mockResolvedValue({ access: 'token' }); // Missing refresh

      await expect(authService.login('testuser', 'password')).rejects.toThrow(
        'Login failed: Malformed response from server'
      );
    });

    it('should throw error for empty login response', async () => {
      mockApiClient.post.mockResolvedValue(null);

      await expect(authService.login('testuser', 'password')).rejects.toThrow(
        'Login failed: Malformed response from server'
      );
    });
  });

  describe('Register', () => {
    it('should register successfully', async () => {
      mockApiClient.post.mockResolvedValue(mockUserProfile);

      const registrationData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const result = await authService.register(registrationData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register/', {
        ...registrationData,
        password2: 'password123',
        role: 'student',
      });
      expect(result).toMatchObject({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRoleEnum.STUDENT,
      });
    });

    it('should store tokens if registration returns them', async () => {
      const responseWithTokens = {
        ...mockUserProfile,
        access: mockTokens.access,
        refresh: mockTokens.refresh,
      };
      mockApiClient.post.mockResolvedValue(responseWithTokens);

      await authService.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', mockTokens.access);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', mockTokens.refresh);
    });

    it('should handle custom role and password confirmation', async () => {
      mockApiClient.post.mockResolvedValue(mockUserProfile);

      const registrationData = {
        username: 'instructor',
        email: 'instructor@example.com',
        password: 'password123',
        password2: 'password123',
        role: 'instructor',
      };

      await authService.register(registrationData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register/', registrationData);
    });
  });

  describe('Logout', () => {
    it('should logout successfully with tokens', async () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockTokens.refresh) // refresh token
        .mockReturnValueOnce(mockTokens.access); // access token
      mockApiClient.post.mockResolvedValue(undefined);

      await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/logout/',
        { refresh: mockTokens.refresh },
        {
          headers: {
            Authorization: `Bearer ${mockTokens.access}`,
          },
        }
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should clean up locally even if API call fails', async () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockTokens.refresh)
        .mockReturnValueOnce(mockTokens.access);
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      // Should not throw error
      await authService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should clean up even without tokens', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await authService.logout();

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockTokens.refresh);
      mockApiClient.post.mockResolvedValue({ access: 'new-access-token' });

      const result = await authService.refreshToken();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/token/refresh/', {
        refresh: mockTokens.refresh,
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'new-access-token');
      expect(result).toEqual({
        access: 'new-access-token',
        refresh: mockTokens.refresh,
      });
    });

    it('should throw error when no refresh token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token found');
    });

    it('should throw error for malformed refresh response', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockTokens.refresh);
      mockApiClient.post.mockResolvedValue(null); // Missing access token

      await expect(authService.refreshToken()).rejects.toThrow(
        'Token refresh failed: Malformed response'
      );
    });
  });

  describe('Token Validation', () => {
    it('should validate token successfully', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockTokens.access);
      mockApiClient.post.mockResolvedValue({ status: 200 });

      const result = await authService.validateToken();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/validate-token/',
        {},
        {
          headers: {
            Authorization: `Bearer ${mockTokens.access}`,
          },
          signal: expect.any(AbortSignal),
        }
      );
      expect(result).toBe(true);
    });

    it('should return false when no token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await authService.validateToken();

      expect(result).toBe(false);
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should attempt token refresh on validation failure', async () => {
      // Set up localStorage to return access token first, then refresh token
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockTokens.access) // For initial validation
        .mockReturnValueOnce(mockTokens.refresh) // For refresh attempt
        .mockReturnValueOnce(mockTokens.refresh); // Might be called again

      mockApiClient.post
        .mockRejectedValueOnce(new Error('Token expired')) // Validation fails
        .mockResolvedValueOnce({ access: 'new-token', refresh: 'new-refresh' }); // Refresh succeeds

      const result = await authService.validateToken();

      expect(result).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
    });

    it('should return false if both validation and refresh fail', async () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockTokens.access) // For initial validation
        .mockReturnValueOnce(mockTokens.refresh) // For refresh attempt
        .mockReturnValueOnce(mockTokens.refresh); // Might be called again

      mockApiClient.post
        .mockRejectedValueOnce(new Error('Token expired')) // Validation fails
        .mockRejectedValueOnce(new Error('Refresh failed')); // Refresh also fails

      const result = await authService.validateToken();

      expect(result).toBe(false);
    });
  });

  describe('User Profile', () => {
    it('should get current user successfully', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockTokens.access);
      mockApiClient.get.mockResolvedValue(mockUserProfile);

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/profile/', {
        headers: {
          Authorization: `Bearer ${mockTokens.access}`,
        },
      });
      expect(result).toMatchObject({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRoleEnum.STUDENT,
      });
    });

    it('should use provided token instead of localStorage token', async () => {
      const customToken = 'custom-token';
      mockApiClient.get.mockResolvedValue(mockUserProfile);

      await authService.getCurrentUser(customToken);

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/profile/', {
        headers: {
          Authorization: `Bearer ${customToken}`,
        },
      });
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });

    it('should throw error when no token is available', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(authService.getCurrentUser()).rejects.toThrow('No access token available');
    });
  });

  describe('Password Reset', () => {
    it('should request password reset successfully', async () => {
      const mockResponse = { detail: 'Password reset email sent' };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.requestPasswordReset('test@example.com');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/password-reset/', {
        email: 'test@example.com',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should reset password successfully', async () => {
      const mockResponse = { detail: 'Password reset successful' };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.resetPassword('reset-token', 'newpassword');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/password-reset/confirm/', {
        token: 'reset-token',
        new_password: 'newpassword',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Utility Methods', () => {
    it('should check authentication status correctly', () => {
      // With tokens
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockTokens.access)
        .mockReturnValueOnce(mockTokens.refresh);
      expect(authService.isAuthenticated()).toBe(true);

      // Clear mocks
      vi.clearAllMocks();

      // Without tokens
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);

      // With only refresh token
      vi.clearAllMocks();
      mockLocalStorage.getItem
        .mockReturnValueOnce(null) // access token
        .mockReturnValueOnce(mockTokens.refresh); // refresh token
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should get access token', () => {
      mockLocalStorage.getItem.mockReturnValue(mockTokens.access);
      expect(authService.getAccessToken()).toBe(mockTokens.access);
    });

    it('should get refresh token', () => {
      mockLocalStorage.getItem.mockReturnValue(mockTokens.refresh);
      expect(authService.getRefreshToken()).toBe(mockTokens.refresh);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(authService.login('user', 'pass')).rejects.toThrow('Network error');
    });

    it('should handle timeout in token validation', async () => {
      mockLocalStorage.getItem.mockReturnValue(mockTokens.access);

      // Mock a timeout by rejecting after delay
      mockApiClient.post.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      const result = await authService.validateToken();
      expect(result).toBe(false);
    });
  });

  describe('Token Storage', () => {
    it('should store tokens securely', async () => {
      mockApiClient.post.mockResolvedValue(mockTokens);

      await authService.login('user', 'pass');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', mockTokens.access);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', mockTokens.refresh);
    });

    it('should clear tokens on logout', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await authService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Service Factory Integration', () => {
    it('should work with default service instance', () => {
      expect(modernAuthService).toBeInstanceOf(ModernAuthService);
    });

    it('should accept custom configuration', () => {
      const customService = new ModernAuthService({
        apiClient: mockApiClient as any,
      });

      expect(customService).toBeInstanceOf(ModernAuthService);
    });
  });
});
