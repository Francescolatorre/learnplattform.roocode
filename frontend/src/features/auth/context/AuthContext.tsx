import React, {createContext, useState, useContext, ReactNode, useEffect, memo} from 'react';
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
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  getUserRole: () => string;
  refreshToken: () => Promise<string | null>;
  setAuthTokens: (tokens: {access: string; refresh: string}) => void;
  redirectToDashboard: () => void;
  setError: (message: string) => void;
  errorMessage: string;
}

export const AuthContext = createContext<AuthContextProps>({
  userRole: 'guest',
  user: null,
  isAuthenticated: false,
  login: async () => { },
  logout: async () => { },
  getAccessToken: () => null,
  getRefreshToken: () => null,
  getUserRole: () => 'guest',
  refreshToken: async () => null,
  setAuthTokens: () => { },
  redirectToDashboard: () => { },
  setError: () => { },
  errorMessage: '',
});

const getAccessToken = (): string | null => localStorage.getItem('authToken');
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

const AuthProviderComponent: React.FC<{children: ReactNode}> = ({children}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const getUserRole = (): string => user?.role || localStorage.getItem('user_role') || 'guest';

  const login = async (username: string, password: string) => {
    try {
      const {access, refresh} = await authService.login(username, password);
      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);

      try {
        const userProfile = await authService.getUserProfile(access);
        setUser(userProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const setAuthTokens = (tokens: {access: string; refresh: string}) => {
    localStorage.setItem('authToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (refreshTokenValue) {
        await authService.logout(refreshTokenValue);
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

  const refreshTokenFn = async () => {
    if (isRefreshingToken) return getAccessToken();

    try {
      setIsRefreshingToken(true);
      const storedRefreshToken = getRefreshToken();
      if (!storedRefreshToken) throw new Error('No refresh token found');

      const {access} = await authService.refreshToken(storedRefreshToken);
      localStorage.setItem('authToken', access);
      return access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
      return null;
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const initializeAuth = async () => {
    if (isAuthenticated) {
      try {
        const accessToken = await refreshTokenFn();
        if (accessToken) {
          const userProfile = await authService.getUserProfile(accessToken);
          setUser(userProfile);
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (errorMessage) console.error('Error:', errorMessage);
  }, [errorMessage]);

  const setError = (message: string) => {
    setErrorMessage(message);
  };

  return loading ? (
    <div>Loading...</div>
  ) : (
    <AuthContext.Provider
      value={{
        userRole: getUserRole(),
        user,
        isAuthenticated,
        login,
        logout,
        getAccessToken,
        getRefreshToken,
        getUserRole,
        refreshToken: refreshTokenFn,
        setAuthTokens,
        redirectToDashboard: () => navigate('/profile'),
        setError: setError,
        errorMessage: errorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = memo(AuthProviderComponent);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
