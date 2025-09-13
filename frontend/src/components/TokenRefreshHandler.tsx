import React, { useEffect, useCallback } from 'react';

import { useAuth } from '@context/auth/AuthContext';
import { authEventService } from '@context/auth/AuthEventService';
import { AuthEventType } from '@context/auth/types';

/**
 * TokenRefreshHandler Component
 *
 * This component manages the automatic refreshing of JWT tokens.
 * It sets up an interval to refresh tokens before they expire and
 * helps maintain a continuous authenticated session.
 */
const TokenRefreshHandler: React.FC = () => {
  // We only need the refreshToken function from context since we'll handle actual refresh logic here
  const { isAuthenticated } = useAuth();

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken && isAuthenticated) {
        // Use authService directly to refresh the token
        const authService = (await import('@services/auth/authService')).default;
        const { access } = await authService.refreshToken();

        // Update localStorage with new access token
        localStorage.setItem('accessToken', access);

        // Publish token refresh event
        authEventService.publish({
          type: AuthEventType.TOKEN_REFRESH,
          payload: { token: access },
        });

        console.log('Token refreshed successfully');
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      authEventService.publish({
        type: AuthEventType.AUTH_ERROR,
        payload: { error: { message: 'Token refresh failed' } },
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only set up refresh interval if user is authenticated
    if (!isAuthenticated) return;

    // Initial token refresh after a short delay to ensure auth state is stable
    const initialTimeout = setTimeout(() => {
      refreshAccessToken();
    }, 1000);

    // Regular interval for token refresh (every 15 minutes)
    const interval = setInterval(refreshAccessToken, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isAuthenticated, refreshAccessToken]);

  return null;
};

export default TokenRefreshHandler;
