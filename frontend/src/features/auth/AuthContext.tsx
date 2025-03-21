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

// Create the context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('access_token');
    console.log("Attempting to fetch user details with token:", token ? "Token exists" : "No token");

    if (token) {
      try {
        // Corrected to use the refresh token for fetching user details
        const response = await refreshAccessToken(token);
        const userData = response.user;

        setUser(userData);
        setIsAuthenticated(true);
        // Also store the user role in localStorage for components that use it directly
        if (userData && userData.role) {
          localStorage.setItem('user_role', userData.role);
        }

      } catch {
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

      // Store tokens only
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);

      // Set user and authentication state
      setUser(response.user);
      setIsAuthenticated(true);
      // Also store the user role in localStorage for components that use it directly
      if (response.user && response.user.role) {
        localStorage.setItem('user_role', response.user.role);
      }


    } catch (error) {
      console.error('Login failed:', error);
      // Clear any existing tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      // Clear user state and authentication state
      setUser(null);
      setIsAuthenticated(false);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      // If there's a valid refresh token, use it to get a new access token
      if (refreshToken) {
        await apiLogout(refreshToken);
      }

      // Clear tokens and user state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    } catch {
      console.error('Logout failed');
      // Even if logout fails, clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      console.log("Attempting to refresh with token:", refreshToken ? "Token exists" : "No token");

      if (!refreshToken) {
        console.error("No refresh token found in localStorage");
        throw new Error('No refresh token');
      }

      console.log("Calling refreshAccessToken API...");
      const response = await refreshAccessToken(refreshToken);
      console.log("Token refresh response:", response);

      if (!response || !response.access) {
        console.error("Invalid response from refresh token API");
        throw new Error('Invalid response from token refresh');
      }

      console.log("Setting new access token in localStorage");
      localStorage.setItem('access_token', response.access);
      return response;
    } catch (error: unknown) {
      console.error("Token refresh failed with error:", error);

      // Type guard for error with response property
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: any;
          }
        };

        if (axiosError.response) {
          console.error("Response status:", axiosError.response.status);
          console.error("Response data:", axiosError.response.data);

          // Only call logout for authentication errors
          if (axiosError.response.status === 401) {
            console.log("Authentication failed, logging out user");
            await logout();
          }
        }
      } else {
        // For non-Axios errors, still log out
        console.log("Non-axios error, logging out user");
        await logout();
      }

      // Create a helpful error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Token refresh failed: ${errorMessage}`);
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

// Export the custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export for the entire module if needed
export default { AuthProvider, useAuth };
