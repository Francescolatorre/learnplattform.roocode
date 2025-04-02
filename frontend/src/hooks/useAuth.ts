import { useState } from 'react';
import authService from '@services/auth/authService';

interface User {
  refresh: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (username: string, password: string) => {
    const data = await authService.login(username, password);

    setUser({ refresh: data.refresh });
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
  };

  const handleLogout = async () => {
    await authService.logout(user?.refresh || '');
    setUser(null);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const handleRefreshToken = async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      const data = await authService.refreshToken(refresh);
      localStorage.setItem('accessToken', data.access);
    }
  };

  return { user, handleLogin, handleLogout, handleRefreshToken };
};
