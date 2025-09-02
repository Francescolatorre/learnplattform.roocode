import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AUTH_CONFIG } from '@/config/appConfig';

// First, mock axios before any other imports
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  return {
    default: {
      create: () => ({
        get: mockGet,
        post: mockPost,
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
        defaults: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      }),
    },
    mockGet,
    mockPost,
  };
});

// Import mocks from the axios mock
import { mockGet, mockPost } from 'axios';

// Now import authService which will use our mocked axios
import authService from './authService';

// Global mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authService', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('login', () => {
    it('should post credentials and return tokens', async () => {
      const mockData = { access: 'a', refresh: 'r' };
      mockPost.mockResolvedValueOnce({ data: mockData });

      const result = await authService.login('user', 'pass');

      expect(mockPost).toHaveBeenCalledWith('/auth/login/', { username: 'user', password: 'pass' });
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockPost.mockRejectedValueOnce(new Error('fail'));
      await expect(authService.login('user', 'pass')).rejects.toThrow('fail');
    });
  });

  describe('logout', () => {
    it('should post refresh token and return void', async () => {
      // Setup localStorage with tokens for the updated logout method
      localStorageMock.getItem.mockImplementation(key => {
        if (key === AUTH_CONFIG.tokenStorageKey) return 'access';
        if (key === AUTH_CONFIG.refreshTokenStorageKey) return 'refresh';
        return null;
      });

      mockPost.mockResolvedValueOnce({ data: {} });

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith(
        '/auth/logout/',
        { refresh: 'refresh' },
        {
          headers: {
            Authorization: 'Bearer access',
          },
        }
      );

      // Check that localStorage items were removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_CONFIG.tokenStorageKey);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_CONFIG.refreshTokenStorageKey);
    });

    it('should throw on error', async () => {
      // Setup localStorage with tokens
      localStorageMock.getItem.mockImplementation(key => {
        if (key === AUTH_CONFIG.tokenStorageKey) return 'access';
        if (key === AUTH_CONFIG.refreshTokenStorageKey) return 'refresh';
        return null;
      });

      mockPost.mockRejectedValueOnce(new Error('fail'));

      await expect(authService.logout()).rejects.toThrow('fail');

      // Even on error, localStorage items should be removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_CONFIG.tokenStorageKey);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_CONFIG.refreshTokenStorageKey);
    });
  });

  describe('refreshToken', () => {
    it('should post refresh token and return new access token', async () => {
      const mockData = { access: 'new-access' };
      // Setup localStorage with proper implementation
      localStorageMock.getItem.mockImplementation(key => {
        if (key === AUTH_CONFIG.refreshTokenStorageKey) return 'refresh-token';
        return null;
      });

      mockPost.mockResolvedValueOnce({ data: mockData });

      const result = await authService.refreshToken();

      expect(mockPost).toHaveBeenCalledWith('/auth/token/refresh/', { refresh: 'refresh-token' });
      expect(result).toEqual(mockData);

      // Check that new token was stored
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        AUTH_CONFIG.tokenStorageKey,
        'new-access'
      );
    });

    it('should throw on error', async () => {
      // Setup localStorage
      localStorageMock.getItem.mockImplementation(key => {
        if (key === AUTH_CONFIG.refreshTokenStorageKey) return 'refresh-token';
        return null;
      });

      mockPost.mockRejectedValueOnce(new Error('fail'));

      await expect(authService.refreshToken()).rejects.toThrow('fail');
    });
  });

  describe('register', () => {
    it('should post registration data and return login response', async () => {
      const mockData = { user: { id: 1, username: 'user' }, access: 'a', refresh: 'r' };
      mockPost.mockResolvedValueOnce({ data: mockData });

      const result = await authService.register('username', 'email', 'password');

      expect(mockPost).toHaveBeenCalledWith('/auth/register/', {
        username: 'username',
        email: 'email',
        password: 'password',
        password2: 'password',
        role: 'student',
      });
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockPost.mockRejectedValueOnce(new Error('register failed'));

      await expect(authService.register('username', 'email', 'password')).rejects.toThrow(
        'register failed'
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should post email and return response', async () => {
      const mockData = { detail: 'sent' };
      mockPost.mockResolvedValueOnce({ data: mockData });

      const result = await authService.requestPasswordReset('mail@example.com');

      expect(mockPost).toHaveBeenCalledWith('/auth/password-reset/', {
        email: 'mail@example.com',
      });
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockPost.mockRejectedValueOnce(new Error('reset request failed'));

      await expect(authService.requestPasswordReset('mail@example.com')).rejects.toThrow(
        'reset request failed'
      );
    });
  });

  describe('resetPassword', () => {
    it('should post token and new password and return response', async () => {
      const mockData = { detail: 'reset' };
      mockPost.mockResolvedValueOnce({ data: mockData });

      const result = await authService.resetPassword('token', 'newpass');

      expect(mockPost).toHaveBeenCalledWith('/auth/password-reset/confirm/', {
        token: 'token',
        new_password: 'newpass',
      });
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockPost.mockRejectedValueOnce(new Error('reset failed'));

      await expect(authService.resetPassword('token', 'newpass')).rejects.toThrow('reset failed');
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile with access token', async () => {
      const mockData = { id: 1, username: 'user', email: 'user@example.com', role: 'student' };
      mockGet.mockResolvedValueOnce({ data: mockData });

      // Test with provided token
      const result = await authService.getUserProfile('token');

      expect(mockGet).toHaveBeenCalledWith('/users/profile/', {
        headers: {
          Authorization: 'Bearer token',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockGet.mockRejectedValueOnce(new Error('fail'));

      await expect(authService.getUserProfile('token')).rejects.toThrow('fail');
    });
  });
});
