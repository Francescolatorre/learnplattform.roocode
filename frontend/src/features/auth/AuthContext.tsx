import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { login as apiLogin, logout as apiLogout } from '@services/api';

export async function refreshAccessToken(refreshToken: string): Promise<{ access: string; refresh: string; user: User }> {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/token/refresh/`, // Added trailing slash
      { refresh: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error refreshing access token:', (error as any).response?.data || (error as any).message);
    throw new Error('Failed to refresh access token.');
  }
}

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

  const clearAuthState = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const fetchUserDetails = async () => {
    console.log('Fetching user details...');
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userRole = localStorage.getItem('user_role');
    const storedUser = localStorage.getItem('user');

    console.log('Access token:', accessToken ? 'Exists' : 'Not found');
    console.log('Refresh token:', refreshToken ? 'Exists' : 'Not found');
    console.log('User role:', userRole ? userRole : 'Not found');
    console.log('User:', storedUser ? 'Exists' : 'Not found');

    if (accessToken && userRole) {
      try {
        console.log('Access token and user role found. Setting user state...');
        const parsedUser = storedUser ? JSON.parse(storedUser) : { role: userRole }; // Use stored user if available
        setIsAuthenticated(true);
        setUser(parsedUser as User);
        console.log('User details set:', parsedUser);
      } catch (error) {
        console.error('Failed to set user state:', error);
        await logout();
      }
    } else if (refreshToken) {
      try {
        console.log('Attempting to refresh token...');
        const response = await refreshAccessToken(refreshToken);
        if (response.user) { // Add defensive check
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('user_role', response.user.role);
          localStorage.setItem('user', JSON.stringify(response.user));
          setIsAuthenticated(true);
          setUser(response.user);
          console.log('Token refreshed and user details set:', response.user);
        } else {
          throw new Error('User data missing in token refresh response.');
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        if ((error as any).response?.status === 401) {
          console.warn('Refresh token is invalid or expired. Proceeding with logout.');
          await logout(); // Gracefully handle token expiration
        }
      }
    } else {
      console.log('No tokens found. User is not authenticated.');
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted. Checking for tokens...');
    const initializeAuth = async () => {
      try {
        await fetchUserDetails();
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };

    initializeAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    console.log('Attempting login for:', usernameOrEmail);
    try {
      const response = await apiLogin(usernameOrEmail, password);

      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user_role', response.user.role);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);
      console.log('Login successful. User details:', response.user);
    } catch (error) {
      console.error('Login failed:', error);
      clearAuthState();
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
      console.log('Logout successful.');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Refresh token is invalid or expired. Proceeding with logout.');
      } else {
        console.error('Logout failed:', error);
      }
    } finally {
      clearAuthState();
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await refreshAccessToken(refreshToken);
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('user_role', response.user?.role || ''); // Ensure user and role exist
    setUser(response.user || null); // Fallback to null if user is undefined
    setIsAuthenticated(!!response.user); // Set authentication state based on user existence
  };

  return (
    <AuthContext.Provider
      value={{
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
