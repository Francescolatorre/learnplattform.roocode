import React, {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import authService from '@services/auth/authService';

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
  refreshToken: () => Promise<string>;
  setAuthTokens: (tokens: {access: string; refresh: string}) => void;
  redirectToDashboard: () => void;
  setError: (message: string) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  userRole: 'guest',
  user: null,
  isAuthenticated: false,
  login: async () => { },
  logout: async () => { },
  refreshToken: async () => '',
  setAuthTokens: () => { },
  redirectToDashboard: () => { },
  setError: () => { },
});

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const login = async (username: string, password: string) => {
    console.log('Login started', username);
    try {
      console.log('Calling authService.login', username);
      const response = await authService.login(username, password); // Use updated login method
      console.log('authService.login response', response);
      const {access, refresh} = response;

      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);

      const userProfile = await authService.getUserProfile(access); // Fetch user profile
      setUser(userProfile);
      setIsAuthenticated(true);
      console.log('Login successful', user);
    } catch (error) {
      console.error('Login failed:', error);
      console.log('Login failed error', error);
      throw error;
    }
  };

  const setAuthTokens = (tokens: {access: string; refresh: string}) => {
    localStorage.setItem('authToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    setIsAuthenticated(true);
  };

  const redirectToDashboard = () => {
    console.log('AuthContext: redirectToDashboard: Redirecting to dashboard');
    // Implement your redirection logic here

    navigate('/dashboard');
  };

  const setError = (message: string) => {
    setErrorMessage(message);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token found');
      }
      const response = await authService.refreshToken(storedRefreshToken); // Pass the stored refresh token
      const {access} = response;
      localStorage.setItem('authToken', access);
      return access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout(); // Log out if token refresh fails
      throw error;
    }
  };

  const initializeAuth = async () => {
    try {
      const accessToken = await refreshToken(); // Ensure a valid access token
      const userProfile = await authService.getUserProfile(accessToken); // Pass the token
      setUser(userProfile); // Set the user profile in context
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <AuthContext.Provider
      value={{
        userRole: user?.role || 'guest',
        user,
        isAuthenticated,
        login,
        logout,
        refreshToken,
        setAuthTokens,
        redirectToDashboard,
        setError,
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
