import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import apiService from '@services/api/apiService';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextProps {
  userRole: string;
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface AuthResponse {
  access: string;
  refresh: string;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authServiceLogin = apiService.login;
  const authServiceLogout = apiService.logout;
  const refreshAccessToken = apiService.refreshAccessToken;

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const response = await authServiceLogin(usernameOrEmail, password);
      const { access, refresh } = response as { access: string; refresh: string };

      // Store tokens in localStorage
      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Fetch and set the user profile
      const userProfile = await apiService.get<User>('/users/profile/');
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found. Logging out locally.');
      } else {
        await authServiceLogout();
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Unauthorized logout attempt. Clearing local session.');
      } else {
        console.error('Logout API call failed:', error);
      }
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('No refresh token available. Logging out.');
      await logout(); // Ensure user is logged out if no refresh token is available
      throw new Error('No refresh token available');
    }
    try {
      const response = await refreshAccessToken(refreshToken);
      const { access } = response as { access: string };
      localStorage.setItem('authToken', access);
      const userProfile = await apiService.get<User>('/users/profile/');
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Refresh token is invalid or expired. Logging out.');
      } else {
        console.error('Failed to refresh token:', error);
      }
      await logout(); // Log out user on token refresh failure
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshToken();
      } catch {
        setIsAuthenticated(false);
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userRole: user?.role || 'guest',
        user,
        isAuthenticated,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
