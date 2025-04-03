import React, { useEffect } from 'react';
import authService from '@services/auth/authService'; // Adjust the import path as necessary

import { useAuth } from '@features/auth/context/AuthContext';

const TokenRefreshHandler: React.FC = () => {
  const { refreshToken } = useAuth();

  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            await authService.refreshToken(refreshToken); // Use authService for token refresh
          }
        } catch (err) {
          console.error('Token refresh failed:', err);
        }
      },
      15 * 60 * 1000
    ); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default TokenRefreshHandler;
