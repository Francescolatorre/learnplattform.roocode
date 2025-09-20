/**
 * Modern Auth Store (2025 Best Practices)
 *
 * Modern Zustand store for authentication state management integrated with
 * the modern service architecture established in TASK-012.
 *
 * ## Key Features
 * - Modern service integration with modernAuthService
 * - Comprehensive authentication state management
 * - Secure token handling and automatic refresh
 * - Role-based access control and navigation
 * - Loading states and error handling
 * - Backward compatibility with existing AuthContext
 *
 * ## Architecture Improvements
 * - Service-store integration pattern from TASK-027-B
 * - Consistent error handling across all auth operations
 * - Type-safe state management with TypeScript
 * - Performance optimized with Zustand
 * - Clean separation between auth state and user profile data
 *
 * ## Usage Examples
 * ```typescript
 * // Login user
 * const { login, user, isAuthenticated } = useAuthStore();
 * await login(username, password);
 *
 * // Get current user
 * const { fetchCurrentUser, user } = useAuthStore();
 * await fetchCurrentUser();
 *
 * // Logout
 * const { logout } = useAuthStore();
 * logout();
 * ```
 *
 * ## Migration Path
 * - Phase 1: Create modern store alongside AuthContext
 * - Phase 2: Migrate components one by one
 * - Phase 3: Remove legacy AuthContext after full migration
 *
 * @see modernAuthService For service layer integration
 * @see AuthContext For legacy authentication (to be deprecated)
 * @since 2025-09-16 (TASK-050 Modern Auth Store Architecture)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { AUTH_CONFIG } from '@/config/appConfig';
import authService from '@/services/auth/authService';
import { IRegistrationData } from '@/services/auth/modernAuthService';
import { IUser, UserRoleEnum } from '@/types/userTypes';

/**
 * Authentication state interface
 */
interface AuthState {
  // Core Authentication State
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;

  // Authentication Actions
  login: (username: string, password: string) => Promise<void>;
  register: (registrationData: IRegistrationData) => Promise<void>;
  logout: () => Promise<void>;

  // User Profile Actions
  fetchCurrentUser: () => Promise<void>;

  // Token Management Actions
  refreshToken: () => Promise<boolean>;
  validateToken: () => Promise<boolean>;

  // Password Management Actions
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // Utility Actions
  clearError: () => void;
  restoreAuthState: () => Promise<void>;

  // Helper Methods
  getUserRole: () => UserRoleEnum;
  isUserInRole: (role: UserRoleEnum) => boolean;
  hasValidToken: () => boolean;
}

/**
 * Modern Auth Store implementation using Zustand
 * Integrated with modernAuthService for all authentication operations
 */
const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isRestoring: true,
      error: null,

      // Authentication Actions
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Authenticate with legacy service (proven to work)
          const tokens = await authService.login(username, password);

          // Store tokens in localStorage (legacy service handles this)
          // Fetch user profile after successful login
          const user = await authService.getUserProfile();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (registrationData: IRegistrationData) => {
        set({ isLoading: true, error: null });
        try {
          // Register user with service
          const user = await modernAuthService.register(registrationData);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // Logout through legacy service (cleans up tokens)
          await authService.logout();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Even if logout fails, clear local state
          console.warn('Logout service call failed, clearing local state:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // User Profile Actions
      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await modernAuthService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch user profile';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      // Token Management Actions
      refreshToken: async (): Promise<boolean> => {
        try {
          await modernAuthService.refreshToken();
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Clear auth state if refresh fails
          set({
            user: null,
            isAuthenticated: false,
            error: 'Session expired',
          });
          return false;
        }
      },

      validateToken: async (): Promise<boolean> => {
        try {
          const isValid = await modernAuthService.validateToken();
          if (!isValid) {
            set({
              user: null,
              isAuthenticated: false,
              error: 'Session expired',
            });
          }
          return isValid;
        } catch (error) {
          console.error('Token validation failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            error: 'Session validation failed',
          });
          return false;
        }
      },

      // Password Management Actions
      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await modernAuthService.requestPasswordReset(email);
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Password reset request failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await modernAuthService.resetPassword(token, newPassword);
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Utility Actions
      clearError: () => set({ error: null }),

      restoreAuthState: async () => {
        set({ isRestoring: true, error: null });
        try {
          // Check if we have tokens in localStorage
          const accessToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
          const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);

          if (!accessToken || !refreshToken) {
            set({
              user: null,
              isAuthenticated: false,
              isRestoring: false,
            });
            return;
          }

          // Validate current tokens using legacy authService
          const isValid = await authService.validateToken();

          if (isValid) {
            // Fetch current user profile using legacy authService
            const user = await authService.getUserProfile();
            set({
              user,
              isAuthenticated: true,
              isRestoring: false,
            });
          } else {
            // Tokens are invalid, clear state
            set({
              user: null,
              isAuthenticated: false,
              isRestoring: false,
            });
          }
        } catch (error) {
          console.error('Auth state restoration failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            isRestoring: false,
            error: 'Failed to restore authentication state',
          });
        }
      },

      // Helper Methods
      getUserRole: (): UserRoleEnum => {
        const { user } = get();
        return user?.role || UserRoleEnum.GUEST;
      },

      isUserInRole: (role: UserRoleEnum): boolean => {
        const { user } = get();
        return user?.role === role;
      },

      hasValidToken: (): boolean => {
        // Check if we have tokens in localStorage (using legacy storage keys)
        const accessToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
        const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
        return !!(accessToken && refreshToken);
      },
    }),
    {
      name: 'modern-auth-store', // DevTools name
      partialize: (state: AuthState) => ({
        // Only persist essential state, not sensitive data
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

// Export for component convenience
export { useAuthStore };

// Export types for external usage
export type { AuthState };
