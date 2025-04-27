/**
 * Authentication Context
 *
 * This module provides authentication functionality for the Learning Platform.
 * It manages user authentication state, login/logout operations, and user role access.
 *
 * Features:
 * - JWT token-based authentication with access and refresh tokens
 * - Automatic token persistence in localStorage
 * - User profile restoration on page reload
 * - Authentication event publishing for app-wide auth state changes
 *
 * @module AuthContext
 */

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import authService from '@/services/auth/authService';
import {IUser, TUserRole} from '@/types/userTypes';
import {AUTH_CONFIG, ROUTE_CONFIG} from '@/config/appConfig';

/**
 * AuthEvent types for tracking authentication-related events
 */
export enum AuthEventType {
    LOGIN = 'login',
    LOGOUT = 'logout',
    REGISTER = 'register',
    NAVIGATION = 'navigation',
    TOKEN_REFRESH = 'token_refresh',
    ERROR = 'error',
}

/**
 * AuthEvent interface for structured authentication event data
 */
export interface IAuthEvent {
    type: AuthEventType;
    timestamp?: string;
    payload?: Record<string, any>;
}

/**
 * Auth context interface defining available methods and properties
 */
interface IAuthContextProps {
    user: IUser | null;
    isAuthenticated: boolean;
    isRestoring: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<void>;
    getUserRole: () => TUserRole;
    redirectToDashboard: (options?: {path?: string; replace?: boolean}) => void;
}

// Create the auth context with a default value
const AuthContext = createContext<IAuthContextProps>({
    user: null,
    isAuthenticated: false,
    isRestoring: true,
    error: null,
    login: async () => { },
    logout: () => { },
    register: async () => { },
    getUserRole: () => 'guest',
    redirectToDashboard: () => { },
});

/**
 * Simple event service for publishing auth-related events
 * This can be extended to integrate with analytics or monitoring systems
 */
class AuthEventService {
    publish(event: IAuthEvent): void {
        const eventWithTimestamp = {
            ...event,
            timestamp: new Date().toISOString(),
        };
        console.info('Auth event:', eventWithTimestamp);

        // Here you could send events to an analytics service
        // analyticsService.track(eventWithTimestamp);
    }
}

const authEventService = new AuthEventService();

/**
 * AuthProvider component that wraps the application and provides authentication context
 */
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRestoring, setIsRestoring] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Restore authentication state from localStorage
    useEffect(() => {
        const restoreAuth = async () => {
            try {
                const accessToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
                const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);

                if (accessToken) {
                    try {
                        // SECURITY IMPROVEMENT: Validate token and fetch fresh user data from backend
                        // instead of using stored user data
                        const isValid = await authService.validateToken();

                        if (isValid) {
                            // Fetch the user profile from the backend
                            const userProfile = await authService.getUserProfile(accessToken);

                            // Create proper user object from profile data
                            const userData: IUser = {
                                id: userProfile.id.toString(),
                                username: userProfile.username,
                                email: userProfile.email,
                                role: userProfile.role,
                                display_name: userProfile.display_name,
                                // Include tokens for API calls but not persisted to localStorage
                                access: accessToken,
                                refresh: refreshToken || ''
                            };

                            setUser(userData);
                            setIsAuthenticated(true);

                            authEventService.publish({
                                type: AuthEventType.TOKEN_REFRESH,
                                payload: {message: 'Authentication restored from token validation'}
                            });
                        } else {
                            // Token is invalid, clear localStorage
                            localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
                            localStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);
                            setUser(null);
                            setIsAuthenticated(false);
                        }
                    } catch (error) {
                        // Error validating token or fetching user profile
                        console.error('Error validating authentication:', error);
                        localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
                        localStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }
            } catch (err) {
                console.error('Error restoring authentication:', err);
                setUser(null);
                setIsAuthenticated(false);
                authEventService.publish({
                    type: AuthEventType.ERROR,
                    payload: {message: 'Error restoring authentication', error: err}
                });
            } finally {
                setIsRestoring(false);
            }
        };

        restoreAuth();
    }, []);

    // Login function
    const login = useCallback(async (username: string, password: string) => {
        try {
            setError(null);
            const userData = await authService.login(username, password);

            // SECURITY IMPROVEMENT: Only store tokens in localStorage, not the full user object
            localStorage.setItem(AUTH_CONFIG.tokenStorageKey, userData.access);
            localStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, userData.refresh);

            // Store user data in memory only (React state)
            setUser(userData);
            setIsAuthenticated(true);

            // Publish login event
            authEventService.publish({
                type: AuthEventType.LOGIN,
                payload: {
                    userId: userData.id,
                    username: userData.username,
                    role: userData.role
                }
            });
        } catch (err: any) {
            setError('Login failed: ' + (err.message || 'Unknown error'));
            setIsAuthenticated(false);
            authEventService.publish({
                type: AuthEventType.ERROR,
                payload: {
                    message: 'Login failed',
                    error: err.message || 'Unknown error'
                }
            });
            throw err;
        }
    }, []);

    // Register function
    const register = useCallback(async (username: string, email: string, password: string) => {
        try {
            setError(null);
            const userData = await authService.register(username, email, password);
            setUser(userData);
            setIsAuthenticated(true);
            authEventService.publish({
                type: AuthEventType.REGISTER,
                payload: {
                    userId: userData.id,
                    username: userData.username,
                    email: userData.email
                }
            });
        } catch (err: any) {
            setError('Registration failed: ' + (err.message || 'Unknown error'));
            authEventService.publish({
                type: AuthEventType.ERROR,
                payload: {
                    message: 'Registration failed',
                    error: err.message || 'Unknown error'
                }
            });
            throw err;
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        try {
            // Get tokens from localStorage before removing them
            const refreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey) || '';
            const accessToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey) || '';

            // Call API to invalidate token if available
            if (refreshToken && accessToken) {
                authService.logout(refreshToken, accessToken).catch(err => {
                    console.warn('Logout API call failed:', err);
                    // Continue with local logout even if API call fails
                });
            }

            // Clear localStorage
            localStorage.removeItem(AUTH_CONFIG.userStorageKey);
            localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
            localStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);

            // Update state
            setUser(null);
            setIsAuthenticated(false);
            setError(null);

            // Publish logout event
            authEventService.publish({
                type: AuthEventType.LOGOUT
            });

            // Navigate to login page
            navigate(ROUTE_CONFIG.loginPath);
        } catch (error) {
            console.error('Error during logout:', error);
            // Ensure user is logged out locally even if there's an error
            localStorage.removeItem(AUTH_CONFIG.userStorageKey);
            localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
            localStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);
            setUser(null);
            setIsAuthenticated(false);
            navigate(ROUTE_CONFIG.loginPath);
        }
    }, [navigate]);

    // Get user role function
    const getUserRole = useCallback((): TUserRole => {
        if (!user) {
            return 'guest';
        }

        if (user.role &&
            (user.role === 'student' ||
                user.role === 'instructor' ||
                user.role === 'admin')) {
            return user.role;
        }

        console.warn('User exists but has invalid or missing role:', user);
        return 'guest';
    }, [user]);

    // Redirect to dashboard based on role
    const redirectToDashboard = useCallback((options?: {path?: string; replace?: boolean}) => {
        const role = getUserRole();
        console.info(`AuthContext | User role: ${role}`);

        // Get dashboard path based on role from centralized config
        const defaultPath = ROUTE_CONFIG.dashboardPaths[role] || ROUTE_CONFIG.defaultRedirect;

        // Use provided path if specified, otherwise use role-based default
        const redirectPath = options?.path || defaultPath;
        const shouldReplace = options?.replace || false;

        console.info(`Redirecting to: ${redirectPath} (replace: ${shouldReplace})`);

        // Use React Router's navigate for redirection
        if (shouldReplace) {
            navigate(redirectPath, {replace: true});
        } else {
            navigate(redirectPath);
        }

        // Publish navigation event
        authEventService.publish({
            type: AuthEventType.NAVIGATION,
            payload: {
                message: `Redirected to ${redirectPath}`,
                path: redirectPath,
                role: role,
                userId: user?.id
            }
        });
    }, [navigate, user, getUserRole]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        user,
        isAuthenticated,
        isRestoring,
        error,
        login,
        logout,
        register,
        getUserRole,
        redirectToDashboard,
    }), [
        user,
        isAuthenticated,
        isRestoring,
        error,
        login,
        logout,
        register,
        getUserRole,
        redirectToDashboard
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use the auth context
 * @returns The auth context value
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;
