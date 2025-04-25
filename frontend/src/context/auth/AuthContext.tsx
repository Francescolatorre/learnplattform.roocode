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

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';

import authService from '../../services/auth/authService';

import {authEventService} from './AuthEventService';
import {AuthContextProps, AuthEventType, AuthUser, TUserRole} from './types';
import {useNavigate} from 'react-router-dom';

/**
 * Default authentication context value
 * Provides a type-safe default value for the context when used outside of a provider
 */
const AuthContext = createContext<AuthContextProps>({
    user: null,                      // Current authenticated user or null if not authenticated
    isAuthenticated: false,          // Whether a user is currently authenticated
    isRestoring: false,              // Whether auth state is currently being restored from storage
    login: async () => { },          // Function to authenticate a user
    logout: async () => { },         // Function to log out the current user
    getUserRole: () => 'guest',      // Function to get the current user's role
    redirectToDashboard: () => { },  // Function to redirect to the appropriate dashboard
    setError: () => { },             // Function to set authentication errors
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authTokens, setAuthTokens] = useState<{access: string; refresh: string} | null>(null);
    const [isRestoring, setIsRestoring] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate(); // Assuming you are using react-router-dom for navigation

    // Initialize authentication state from localStorage on mount
    useEffect(() => {
        // Subscribe to Auth-Events
        const unsubscribe = authEventService.subscribe((event) => {
            switch (event.type) {
                case AuthEventType.AUTH_ERROR:
                    setUser(null);
                    setIsAuthenticated(false);
                    setAuthTokens(null);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    break;
                // Handle more events if needed...
            }
        });

        // Restore tokens and user from localStorage
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (accessToken && refreshToken) {
            setAuthTokens({access: accessToken, refresh: refreshToken});
            // Fetch user profile with access token
            authService.getUserProfile(accessToken)
                .then(profile => {
                    // Map UserProfile to AuthUser (convert id to string)
                    const mappedUser = {...profile, id: String(profile.id)};
                    setUser(mappedUser);
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    setUser(null);
                    setIsAuthenticated(false);
                    setAuthTokens(null);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                })
                .finally(() => {
                    setIsRestoring(false);
                });
        } else {
            setIsRestoring(false);
        }

        // Cleanup on unmount
        return () => unsubscribe();
    }, []);

    // Refactored login to use authService and persist tokens/user
    const login = async (username: string, password: string) => {
        try {
            // Authenticate with backend
            const {access, refresh} = await authService.login(username, password);
            // Store tokens in localStorage
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            setAuthTokens({access, refresh});

            // Fetch user profile
            const profile = await authService.getUserProfile(access);
            // Map UserProfile to AuthUser (convert id to string)
            const mappedUser = {...profile, id: String(profile.id)};
            setUser(mappedUser);
            setIsAuthenticated(true);

            // Publish event
            authEventService.publish({
                type: AuthEventType.LOGIN,
                payload: profile
            });
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            setAuthTokens(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setErrorMessage('Login failed');
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        // Clear tokens and user state
        setUser(null);
        setIsAuthenticated(false);
        setAuthTokens(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Publish event
        authEventService.publish({type: AuthEventType.LOGOUT});
    };

    const getUserRole = useCallback((): TUserRole => {
        // If no user is logged in, return 'guest'
        if (!user) {
            return 'guest';
        }

        // Check if role property exists on user object and is a valid role
        if (user.role &&
            (user.role === 'student' ||
                user.role === 'instructor' ||
                user.role === 'admin')) {
            return user.role;
        }

        // Default fallback if user exists but has invalid/missing role
        console.warn('User exists but has invalid or missing role:', user);
        return 'guest';
    }, [user]);

    interface IRedirectOptions {
        path?: string;
        replace?: boolean;
    }

    const redirectToDashboard = useCallback((options?: {path?: string; replace?: boolean}) => {
        const role = getUserRole();
        console.info(`AuthContext | User role: ${role}`);

        let defaultPath = '/dashboard';

        // Determine default path based on user role
        if (role === 'instructor') {
            defaultPath = '/instructor/dashboard';
        } else if (role === 'admin') {
            defaultPath = '/admin/dashboard';
        }

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

        // Publish navigation event for tracking
        authEventService.publish({
            type: AuthEventType.NAVIGATION,  // Changed from LOGIN to more appropriate NAVIGATION
            payload: {
                message: `Redirected to ${redirectPath}`,
                path: redirectPath,
                role: role,
                userId: user?.id
            }
        });
    }, [navigate, user, getUserRole]);

    const setError = (errorMsg: string) => {
        setErrorMessage(errorMsg);
        console.error("Auth error:", errorMsg); // Add usage to avoid unused variable
    };

    const refreshToken = useCallback(async () => {
        if (authTokens?.refresh) {
            try {
                // Implementation using authTokens.refresh
                console.log("Using refresh token:", authTokens.refresh);
                // Actual token refresh logic
            } catch (err) {
                setError("Token refresh failed");
            }
        }
    }, [authTokens]);

    const value: AuthContextProps = {
        user,
        isAuthenticated,
        isRestoring,
        login,
        logout,
        getUserRole,
        redirectToDashboard,
        setError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook für den einfachen Zugriff auf den Auth-Kontext
export const useAuth = () => useContext(AuthContext);
