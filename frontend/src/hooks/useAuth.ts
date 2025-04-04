const isValidUsername = (username: string): boolean => {
  if (username.length < 3 || username.length > 150) {
    return false;
  }
  const pattern = new RegExp('^[a-zA-Z0-9_]+$');
  return pattern.test(username);
};

const isValidEmail = (email: string): boolean => {
  const pattern = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
  return pattern.test(email);
};

import {AuthContext} from '@features/auth/context/AuthContext';
import {useState, useContext, useEffect} from 'react';
import authService from '@services/auth/authService';
import {User} from '../types/common/entities';

export const useAuth = () => {
  console.log('useAuth hook called');
  const [user, setUser] = useState<User | null>(null);
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const {setAuthTokens, redirectToDashboard, setError} = context;

  useEffect(() => {
    if (user) {
      console.log('User logged in:', user);
    } else {
      console.log('User logged out');
    }
  }, [user]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const data = await authService.login(username, password);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const userProfile = await authService.getUserProfile(accessToken);
        if (!isValidUsername(userProfile.username)) {
          setError('Invalid username format');
          return;
        }

        if (!isValidEmail(userProfile.email)) {
          setError('Invalid email format');
          return;
        }

        setUser({
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          role: userProfile.role,
        });
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout((user as any)?.refresh || '');
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleRefreshToken = async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      try {
        const data = await authService.refreshToken(refresh);
        localStorage.setItem('accessToken', data.access);
      } catch (error) {
        console.error('Failed to refresh token', error);
      }
    }
  };

  return {
    user,
    handleLogin,
    handleLogout,
    handleRefreshToken,
    setAuthTokens,
    redirectToDashboard,
    setError,
  };
};
