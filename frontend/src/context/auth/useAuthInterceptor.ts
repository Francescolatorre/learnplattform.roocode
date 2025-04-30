/**
 * useAuthInterceptor.ts
 * Custom hook to easily integrate the AuthInterceptor with the application.
 * Connects the authentication context with the axios interceptors.
 */

import {useAuth} from './AuthContext';
import {AUTH_CONFIG} from '../../config/appConfig';

/**
 * Hook that provides the necessary props for the AuthInterceptor component.
 *
 * @returns AuthInterceptorProps object with handlers for authentication interceptor
 */
export const useAuthInterceptor = () => {
    const {logout} = useAuth();

    return {
        // Handler for authentication failures
        onAuthFailure: () => {
            console.log('Authentication failure detected, logging out user');
            logout();
        },

        // Handler for token refresh
        onRefreshToken: async (): Promise<string | null> => {
            try {
                const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // The actual token refresh is now handled in axiosConfig.ts
                // This function is kept for compatibility with AuthInterceptor interface
                return localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
            } catch (error) {
                console.error('Token refresh failed:', error);
                return null;
            }
        },

        // Function to get the current access token
        getAccessToken: (): string | null => {
            return localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
        }
    };
};
