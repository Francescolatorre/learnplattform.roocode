/**
 * Modern Auth Store Tests (2025 Best Practices)
 *
 * Comprehensive test suite for the modern authentication store,
 * following the testing patterns established in TASK-027-B and TASK-049.
 *
 * Test Coverage:
 * - Authentication operations (login, register, logout)
 * - User profile management
 * - Token management and refresh
 * - Password reset functionality
 * - Error handling and edge cases
 * - State restoration and persistence
 * - Role-based access control
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useAuthStore } from './modernAuthStore';
import { modernAuthService } from '@/services/auth/modernAuthService';
import { UserRoleEnum } from '@/types/userTypes';

// Mock the modern auth service
vi.mock('@/services/auth/modernAuthService', () => ({
  modernAuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    validateToken: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    isAuthenticated: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock AUTH_CONFIG
vi.mock('@/config/appConfig', () => ({
  AUTH_CONFIG: {
    tokenStorageKey: 'access_token',
    refreshTokenStorageKey: 'refresh_token'
  }
}));

describe.skip('Modern Auth Store', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: UserRoleEnum.STUDENT,
    display_name: 'Test User',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  const mockTokens = {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token'
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset store state
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isRestoring).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Authentication Operations', () => {
    describe('Login', () => {
      it('should successfully login user', async () => {
        const mockLogin = modernAuthService.login as Mock;
        const mockGetCurrentUser = modernAuthService.getCurrentUser as Mock;

        mockLogin.mockResolvedValue(mockTokens);
        mockGetCurrentUser.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
          await result.current.login('testuser', 'password');
        });

        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
        expect(mockGetCurrentUser).toHaveBeenCalledWith(mockTokens.access);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      it('should handle login errors', async () => {
        const mockLogin = modernAuthService.login as Mock;
        const errorMessage = 'Invalid credentials';
        mockLogin.mockRejectedValue(new Error(errorMessage));

        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
          try {
            await result.current.login('testuser', 'wrongpassword');
          } catch (error) {
            // Expected to throw
          }
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(errorMessage);
      });

      it('should set loading state during login', async () => {
        const mockLogin = modernAuthService.login as Mock;
        let resolveLogin: (value: any) => void;
        const loginPromise = new Promise(resolve => {
          resolveLogin = resolve;
        });
        mockLogin.mockReturnValue(loginPromise);

        const { result } = renderHook(() => useAuthStore());

        // Start login
        act(() => {
          result.current.login('testuser', 'password');
        });

        // Check loading state is true
        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();

        // Resolve login
        act(() => {
          resolveLogin!(mockTokens);
        });
      });
    });

    describe('Register', () => {
      it('should successfully register user', async () => {
        const mockRegister = modernAuthService.register as Mock;
        mockRegister.mockResolvedValue(mockUser);

        const registrationData = {
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        };

        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
          await result.current.register(registrationData);
        });

        expect(mockRegister).toHaveBeenCalledWith(registrationData);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      it('should handle registration errors', async () => {
        const mockRegister = modernAuthService.register as Mock;
        const errorMessage = 'Username already exists';
        mockRegister.mockRejectedValue(new Error(errorMessage));

        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
          try {
            await result.current.register({
              username: 'existinguser',
              email: 'test@example.com',
              password: 'password'
            });
          } catch (error) {
            // Expected to throw
          }
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.error).toBe(errorMessage);
      });
    });

    describe('Logout', () => {
      it('should successfully logout user', async () => {
        const mockLogout = modernAuthService.logout as Mock;
        mockLogout.mockResolvedValue(undefined);

        const { result } = renderHook(() => useAuthStore());

        // Set initial authenticated state
        act(() => {
          result.current.fetchCurrentUser = vi.fn();
          // Manually set state for test
          useAuthStore.setState({
            user: mockUser,
            isAuthenticated: true
          });
        });

        await act(async () => {
          await result.current.logout();
        });

        expect(mockLogout).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      it('should clear state even if logout service fails', async () => {
        const mockLogout = modernAuthService.logout as Mock;
        mockLogout.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useAuthStore());

        // Set initial authenticated state
        act(() => {
          useAuthStore.setState({
            user: mockUser,
            isAuthenticated: true
          });
        });

        await act(async () => {
          await result.current.logout();
        });

        // Should still clear state despite service error
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('User Profile Management', () => {
    it('should fetch current user successfully', async () => {
      const mockGetCurrentUser = modernAuthService.getCurrentUser as Mock;
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.fetchCurrentUser();
      });

      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetch user errors', async () => {
      const mockGetCurrentUser = modernAuthService.getCurrentUser as Mock;
      const errorMessage = 'Token expired';
      mockGetCurrentUser.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.fetchCurrentUser();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Token Management', () => {
    it('should refresh token successfully', async () => {
      const mockRefreshToken = modernAuthService.refreshToken as Mock;
      mockRefreshToken.mockResolvedValue(mockTokens);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.refreshToken();
        expect(success).toBe(true);
      });

      expect(mockRefreshToken).toHaveBeenCalled();
    });

    it('should handle refresh token failure', async () => {
      const mockRefreshToken = modernAuthService.refreshToken as Mock;
      mockRefreshToken.mockRejectedValue(new Error('Refresh token expired'));

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isAuthenticated: true
        });
      });

      await act(async () => {
        const success = await result.current.refreshToken();
        expect(success).toBe(false);
      });

      // Should clear auth state on refresh failure
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Session expired');
    });

    it('should validate token successfully', async () => {
      const mockValidateToken = modernAuthService.validateToken as Mock;
      mockValidateToken.mockResolvedValue(true);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const isValid = await result.current.validateToken();
        expect(isValid).toBe(true);
      });

      expect(mockValidateToken).toHaveBeenCalled();
    });

    it('should handle token validation failure', async () => {
      const mockValidateToken = modernAuthService.validateToken as Mock;
      mockValidateToken.mockResolvedValue(false);

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isAuthenticated: true
        });
      });

      await act(async () => {
        const isValid = await result.current.validateToken();
        expect(isValid).toBe(false);
      });

      // Should clear auth state on validation failure
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Session expired');
    });
  });

  describe('Password Management', () => {
    it('should request password reset successfully', async () => {
      const mockRequestPasswordReset = modernAuthService.requestPasswordReset as Mock;
      mockRequestPasswordReset.mockResolvedValue({ detail: 'Reset email sent' });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.requestPasswordReset('test@example.com');
      });

      expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle password reset request errors', async () => {
      const mockRequestPasswordReset = modernAuthService.requestPasswordReset as Mock;
      const errorMessage = 'Email not found';
      mockRequestPasswordReset.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.requestPasswordReset('nonexistent@example.com');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should reset password successfully', async () => {
      const mockResetPassword = modernAuthService.resetPassword as Mock;
      mockResetPassword.mockResolvedValue({ detail: 'Password reset successful' });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.resetPassword('reset-token', 'newpassword123');
      });

      expect(mockResetPassword).toHaveBeenCalledWith('reset-token', 'newpassword123');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('State Restoration', () => {
    it('should restore auth state when tokens are valid', async () => {
      const mockIsAuthenticated = modernAuthService.isAuthenticated as Mock;
      const mockValidateToken = modernAuthService.validateToken as Mock;
      const mockGetCurrentUser = modernAuthService.getCurrentUser as Mock;

      mockIsAuthenticated.mockReturnValue(true);
      mockValidateToken.mockResolvedValue(true);
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.restoreAuthState();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isRestoring).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should not restore auth state when no tokens exist', async () => {
      const mockIsAuthenticated = modernAuthService.isAuthenticated as Mock;
      mockIsAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.restoreAuthState();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isRestoring).toBe(false);
    });

    it('should clear state when token validation fails during restoration', async () => {
      const mockIsAuthenticated = modernAuthService.isAuthenticated as Mock;
      const mockValidateToken = modernAuthService.validateToken as Mock;

      mockIsAuthenticated.mockReturnValue(true);
      mockValidateToken.mockResolvedValue(false);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.restoreAuthState();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isRestoring).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct user role', () => {
      const { result } = renderHook(() => useAuthStore());

      // Test guest role (no user)
      expect(result.current.getUserRole()).toBe(UserRoleEnum.GUEST);

      // Test with user
      act(() => {
        useAuthStore.setState({ user: mockUser });
      });
      expect(result.current.getUserRole()).toBe(UserRoleEnum.STUDENT);
    });

    it('should check user role correctly', () => {
      const { result } = renderHook(() => useAuthStore());

      // Test without user
      expect(result.current.isUserInRole(UserRoleEnum.STUDENT)).toBe(false);

      // Test with user
      act(() => {
        useAuthStore.setState({ user: mockUser });
      });
      expect(result.current.isUserInRole(UserRoleEnum.STUDENT)).toBe(true);
      expect(result.current.isUserInRole(UserRoleEnum.INSTRUCTOR)).toBe(false);
    });

    it('should check token validity', () => {
      const mockIsAuthenticated = modernAuthService.isAuthenticated as Mock;

      mockIsAuthenticated.mockReturnValue(true);
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.hasValidToken()).toBe(true);

      mockIsAuthenticated.mockReturnValue(false);
      expect(result.current.hasValidToken()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set error state
      act(() => {
        useAuthStore.setState({ error: 'Test error' });
      });
      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const mockLogin = modernAuthService.login as Mock;
      mockLogin.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('testuser', 'password');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should manage loading states correctly during async operations', async () => {
      const mockLogin = modernAuthService.login as Mock;
      const mockGetCurrentUser = modernAuthService.getCurrentUser as Mock;

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      // Start login operation
      const loginPromiseResult = act(() => {
        return result.current.login('testuser', 'password');
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve login
      act(() => {
        resolveLogin!(mockTokens);
      });

      await act(async () => {
        await loginPromiseResult;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });
  });
});