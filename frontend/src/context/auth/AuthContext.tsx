//src/context/auth/AuthContext.tsx

import React, {createContext, useContext, useState, useEffect} from 'react';

import authService from '../../services/auth/authService';

import {authEventService} from './AuthEventService';
import {AuthContextProps, AuthEventType, AuthUser} from './types';

// Erstelle den Kontext mit einem Default-Wert
const AuthContext = createContext<AuthContextProps>({
    user: null,
    isAuthenticated: false,
    isRestoring: false,
    login: async () => { },
    logout: async () => { },
    getUserRole: () => 'guest',
    redirectToDashboard: () => { },
    setError: () => { },
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setErrorState] = useState<string | null>(null);
    const [tokens, setTokens] = useState<{access: string; refresh: string} | null>(null);
    const [isRestoring, setIsRestoring] = useState<boolean>(true);

    // Initialize authentication state from localStorage on mount
    useEffect(() => {
        // Subscribe to Auth-Events
        const unsubscribe = authEventService.subscribe((event) => {
            switch (event.type) {
                case AuthEventType.AUTH_ERROR:
                    setUser(null);
                    setIsAuthenticated(false);
                    setTokens(null);
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
            setTokens({access: accessToken, refresh: refreshToken});
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
                    setTokens(null);
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
            setTokens({access, refresh});

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
            setTokens(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setErrorState('Login failed');
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        // Clear tokens and user state
        setUser(null);
        setIsAuthenticated(false);
        setTokens(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Publish event
        authEventService.publish({type: AuthEventType.LOGOUT});
    };

    const getUserRole = () => user && (user as any).role ? (user as any).role : 'guest';

    const redirectToDashboard = () => {
        // Placeholder: Replace with navigation logic as needed
        window.location.href = '/dashboard';
    };

    const setError = (errorMsg: string) => {
        setErrorState(errorMsg);
    };

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
