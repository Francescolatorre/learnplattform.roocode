import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService from '@services/authService';

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        const parsedUser = storedUser ? JSON.parse(storedUser) : { role: userRole };
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
        const response = await authService.refreshToken(refreshToken); // Use authService
        const { access, user } = response;
        if (user) {
          localStorage.setItem('access_token', access);
          localStorage.setItem('user_role', user.role);
          localStorage.setItem('user', JSON.stringify(user));
          setIsAuthenticated(true);
          setUser(user);
          console.log('Token refreshed and user details set:', user);
        } else {
          throw new Error('User data missing in token refresh response.');
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        if ((error as any).response?.status === 401) {
          console.warn('Refresh token is invalid or expired. Proceeding with logout.');
          await logout();
        }
      }
    } else {
      console.log('No tokens found. User is not authenticated.');
      setIsAuthenticated(false);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    console.log('Attempting login for:', usernameOrEmail);
    try {
      const response = await authService.login(usernameOrEmail, password); // Use authService
      const { access, refresh, user } = response;

      console.log('Login API response:', response);

      if (access && refresh && user) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);
        console.log('Login successful. User details:', user);
      } else {
        throw new Error('Invalid API response: Missing required fields');
      }
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
        await authService.logout(refreshToken); // Use authService
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuthState();
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await authService.refreshToken(refreshToken); // Use authService
    const { access, user } = response;
    localStorage.setItem('access_token', access);
    localStorage.setItem('user_role', user?.role || '');
    setUser(user || null);
    setIsAuthenticated(!!user);
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
