import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import authService from '@services/auth/authService';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (usernameOrEmail: string, password: string) => {
    const { user, access, refresh } = await authService.login(usernameOrEmail, password);
    localStorage.setItem('access_token', access); // Store the access token
    localStorage.setItem('refresh_token', refresh); // Store the refresh token
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken); // Pass the refresh token to the logout function
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');
    const { access, user } = await authService.refreshToken(refreshToken);
    localStorage.setItem('access_token', access); // Update the access token
    setUser(user);
    setIsAuthenticated(true);
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return {
    ...context,
    userRole: context.user?.role || 'guest', // Ensure userRole is available
  };
};
