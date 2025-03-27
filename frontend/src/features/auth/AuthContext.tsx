import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
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
  isAuthenticated: boolean | null; // Use `null` to indicate uninitialized state
  isAuthChecked: boolean; // Track auth check status
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // Track auth check status

  const clearAuthState = () => {
    console.log('AuthProvider: Clearing authentication state...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (usernameOrEmail: string, password: string) => {
    console.log('AuthProvider: Attempting login for:', usernameOrEmail);
    try {
      const response = await authService.login(usernameOrEmail, password);
      const { access, refresh, user } = response;

      console.log('AuthProvider: Login API response:', response);

      if (access && refresh && user) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);
        console.log('AuthProvider: Login successful. User details:', user);
      } else {
        throw new Error('AuthProvider: Invalid API response: Missing required fields');
      }
    } catch (error) {
      console.error('AuthProvider: Login failed:', error);
      clearAuthState();
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    console.log('AuthProvider: Logging out...');
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('AuthProvider: Logout failed:', error);
    } finally {
      clearAuthState();
    }
  };

  const refreshToken = async () => {
    console.log('AuthProvider: Attempting to refresh token...');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.warn('AuthProvider: No refresh token available.');
      throw new Error('No refresh token available');
    }
    try {
      const response = await authService.refreshToken(refreshToken);
      const { access, user } = response;
      localStorage.setItem('access_token', access);
      localStorage.setItem('user_role', user?.role || '');
      setUser(user || null);
      setIsAuthenticated(!!user);
      console.log('AuthProvider: Token refreshed successfully. User details:', user);
    } catch (error) {
      console.error('AuthProvider: Failed to refresh token:', error);
      clearAuthState();
      throw error;
    } finally {
      setIsAuthChecked(true); // Mark auth check as complete
    }
  };

  const fetchUserDetails = async () => {
    console.log('AuthProvider: Fetching user details...');
    const accessToken = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    const storedUser = localStorage.getItem('user');

    console.log('AuthProvider: Access token:', accessToken ? 'Exists' : 'Not found');
    console.log('AuthProvider: User role:', userRole ? userRole : 'Not found');
    console.log('AuthProvider: User:', storedUser ? 'Exists' : 'Not found');

    if (accessToken && userRole) {
      try {
        console.log('AuthProvider: Access token and user role found. Setting user state...');
        const parsedUser = storedUser ? JSON.parse(storedUser) : { role: userRole };
        setIsAuthenticated(true);
        setUser(parsedUser as User);
        console.log('AuthProvider: User details set:', parsedUser);
      } catch (error) {
        console.error('AuthProvider: Failed to set user state:', error);
        setIsAuthenticated(false);
      }
    } else {
      console.log('AuthProvider: No tokens found. User is not authenticated.');
      setIsAuthenticated(false);
    }
    setIsAuthChecked(true); // Mark auth check as complete
  };

  useEffect(() => {
    console.log('AuthProvider: Mounted. Checking for tokens...');
    fetchUserDetails();
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isAuthChecked,
    login,
    logout,
    refreshToken,
  }), [user, isAuthenticated, isAuthChecked]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
