import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, refreshAccessToken } from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  display_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // Handle missing or empty role
        if (!parsedUser.role) {
          console.warn('User role is missing. Assigning default role: "user"');
          parsedUser.role = 'user';
        }
        
        setUser(parsedUser);
        setIsAuthenticated(true);
        
      } catch {
        // If parsing fails, log out
        await logout();
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const response = await apiLogin(usernameOrEmail, password);
      
      // Store tokens and user
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Set user and authentication state
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any existing tokens and user
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
      
      // Clear tokens and user state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch {
      console.error('Logout failed');
      // Even if logout fails, clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const { access } = await refreshAccessToken(refreshToken);
      localStorage.setItem('access_token', access);
    } catch {
      // If refresh fails, log out the user
      await logout();
      throw new Error('Token refresh failed');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
