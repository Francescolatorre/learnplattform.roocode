import React, { useEffect } from 'react';
import { useAuth } from '@features/auth/context/AuthContext';
import authService from '@services/auth/authService'; // Adjust the import path as necessary

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await authService.logout(refreshToken); // Use authService for logout
        }
        await logout(); // Clear context state
      } catch (err) {
        console.error('Logout failed:', err);
      }
    };

    handleLogout();
  }, [logout]);

  return <div>Logging out...</div>;
};

export default LogoutPage;
