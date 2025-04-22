import React, {useEffect} from 'react';

import {useAuth} from '@context/auth/AuthContext';


const TokenRefreshHandler: React.FC = () => {
  const {refreshToken, getRefreshToken} = useAuth();

  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const storedRefreshToken = getRefreshToken();
          if (storedRefreshToken) {
            await refreshToken();
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
