/**
 * Modern Auth Service (2025 Best Practices)
 *
 * Comprehensive authentication service for the learning platform with
 * modern TypeScript architecture and optimized security patterns.
 *
 * ## Key Features
 * - JWT token-based authentication with access and refresh tokens
 * - Secure token storage and automatic refresh handling
 * - User profile management and role-based access
 * - Password reset and account management
 * - Integration with modern service architecture
 *
 * ## Architecture Improvements
 * - Composition over inheritance design pattern
 * - Single API client instance for optimal memory usage
 * - Functional approach with minimal state management
 * - Comprehensive error handling with managed exceptions
 * - Cleaner separation of concerns between authentication and user data
 *
 * ## Usage Examples
 * ```typescript
 * // Login with credentials
 * const tokens = await modernAuthService.login(username, password);
 *
 * // Get current user profile
 * const user = await modernAuthService.getCurrentUser();
 *
 * // Refresh tokens automatically
 * const isValid = await modernAuthService.validateToken();
 *
 * // Logout and cleanup
 * await modernAuthService.logout();
 * ```
 *
 * ## Security Features
 * - Automatic token refresh before expiration
 * - Secure localStorage token management
 * - Request timeout handling (5s)
 * - Comprehensive error handling and logging
 *
 * @see ServiceFactory For service instantiation and dependency injection
 * @see IAuthTokens For authentication token structure
 * @see IUserProfile For user profile data structure
 * @since 2025-09-16 (TASK-050 Modern Auth Service Architecture)
 */

import { AUTH_CONFIG } from '@/config/appConfig';
import { IUser, UserRoleEnum } from '@/types/userTypes';
import { withManagedExceptions } from '@/utils/errorHandling';

import { BaseService, ServiceConfig } from '../factory/serviceFactory';

/**
 * Authentication tokens interface
 */
export interface IAuthTokens {
  access: string;
  refresh: string;
}

/**
 * User profile interface (backend response format)
 */
export interface IUserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Password reset response interface
 */
export interface IPasswordResetResponse {
  detail: string;
}

/**
 * Registration data interface
 */
export interface IRegistrationData {
  username: string;
  email: string;
  password: string;
  password2?: string;
  role?: string;
}

/**
 * Modern Auth Service implementation
 *
 * Key improvements:
 * - Single API client with managed exceptions
 * - Cleaner method signatures with better type inference
 * - Reduced complexity and improved error handling
 * - Better security patterns and token management
 */
export class ModernAuthService extends BaseService {
  constructor(config?: ServiceConfig) {
    super(config);
  }

  /**
   * Authenticate user with username and password
   */
  async login(username: string, password: string): Promise<IAuthTokens> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.post('/auth/login/', {
          username,
          password
        });

        if (!response || !response.access || !response.refresh) {
          throw new Error('Login failed: Malformed response from server');
        }

        // Store tokens securely in localStorage
        this.storeTokens(response.access, response.refresh);

        return {
          access: response.access,
          refresh: response.refresh
        };
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'login',
        context: { username }
      }
    )();
  }

  /**
   * Register a new user account
   */
  async register(registrationData: IRegistrationData): Promise<IUser> {
    return withManagedExceptions(
      async () => {
        const payload = {
          ...registrationData,
          password2: registrationData.password2 || registrationData.password,
          role: registrationData.role || 'student'
        };

        const response = await this.apiClient.post('/auth/register/', payload);

        if (!response) {
          throw new Error('Registration failed: No response from server');
        }

        // If registration returns tokens, store them
        if (response.access && response.refresh) {
          this.storeTokens(response.access, response.refresh);
        }

        // Transform response to IUser format
        return this.transformProfileToUser(response);
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'register',
        context: { username: registrationData.username }
      }
    )();
  }

  /**
   * Logout user and cleanup tokens
   */
  async logout(): Promise<void> {
    return withManagedExceptions(
      async () => {
        const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
        const accessToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);

        try {
          // Call logout endpoint if we have tokens
          if (refreshToken && accessToken) {
            await this.apiClient.post('/auth/logout/',
              { refresh: refreshToken },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              }
            );
          }
        } catch (logoutError) {
          // Log error but don't throw - still want to clean up locally
          console.warn('Logout API call failed, cleaning up locally:', logoutError);
        } finally {
          // Always clean up localStorage
          this.clearTokens();
        }
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'logout'
      }
    )();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<IAuthTokens> {
    return withManagedExceptions(
      async () => {
        const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);

        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        const response = await this.apiClient.post('/auth/token/refresh/', {
          refresh: refreshToken
        });

        if (!response || !response.access) {
          throw new Error('Token refresh failed: Malformed response');
        }

        // Update access token in localStorage
        localStorage.setItem(AUTH_CONFIG.tokenStorageKey, response.access);

        return {
          access: response.access,
          refresh: refreshToken // Keep existing refresh token
        };
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'refreshToken'
      }
    )();
  }

  /**
   * Validate current access token
   */
  async validateToken(): Promise<boolean> {
    return withManagedExceptions(
      async () => {
        const token = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);

        if (!token) {
          return false;
        }

        try {
          // Set timeout to avoid hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await this.apiClient.post('/auth/validate-token/',
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
              signal: controller.signal
            }
          );

          clearTimeout(timeoutId);
          return response && response.status !== false;
        } catch {
          // If validation fails, try to refresh token automatically
          const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
          if (refreshToken) {
            try {
              await this.refreshToken();
              return true;
            } catch (refreshError) {
              console.error('Token refresh failed during validation:', refreshError);
              return false;
            }
          }
          return false;
        }
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'validateToken'
      }
    )();
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(accessToken?: string): Promise<IUser> {
    return withManagedExceptions(
      async () => {
        const token = accessToken || localStorage.getItem(AUTH_CONFIG.tokenStorageKey);

        if (!token) {
          throw new Error('No access token available');
        }

        const response = await this.apiClient.get('/users/profile/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response) {
          throw new Error('Failed to fetch user profile');
        }

        return this.transformProfileToUser(response);
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'getCurrentUser'
      }
    )();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<IPasswordResetResponse> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.post('/auth/password-reset/', {
          email
        });

        if (!response) {
          throw new Error('Password reset request failed');
        }

        return response;
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'requestPasswordReset',
        context: { email }
      }
    )();
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<IPasswordResetResponse> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.post('/auth/password-reset/confirm/', {
          token,
          new_password: newPassword
        });

        if (!response) {
          throw new Error('Password reset failed');
        }

        return response;
      },
      {
        serviceName: 'ModernAuthService',
        methodName: 'resetPassword'
      }
    )();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
    return !!(token || refreshToken);
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
  }

  /**
   * Store tokens securely in localStorage
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(AUTH_CONFIG.tokenStorageKey, accessToken);
    localStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, refreshToken);
  }

  /**
   * Clear all stored tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
    localStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);
  }

  /**
   * Transform backend user profile to frontend IUser format
   */
  private transformProfileToUser(profile: IUserProfile | Record<string, unknown>): IUser {
    return {
      id: String(profile.id),
      username: String(profile.username),
      email: String(profile.email),
      role: (profile.role as UserRoleEnum) || UserRoleEnum.STUDENT,
      display_name: String(profile.display_name || ''),
      created_at: String(profile.created_at || new Date().toISOString()),
      updated_at: String(profile.updated_at || new Date().toISOString())
    };
  }
}

// Export service instance for direct usage
export const modernAuthService = new ModernAuthService();

// Export class for ServiceFactory usage
export default ModernAuthService;