import {useAuth} from '@context/auth/AuthContext';
import React, {useEffect} from 'react';

const LogoutPage: React.FC = () => {
  const {logout} = useAuth();

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
