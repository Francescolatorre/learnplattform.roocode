import React, { useEffect } from 'react';
import { useAuth } from '@features/auth/context/AuthContext';

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout failed:', err);
      }
    };

    handleLogout();
  }, [logout]);

  return <div>Logging out...</div>;
};

export default LogoutPage;
