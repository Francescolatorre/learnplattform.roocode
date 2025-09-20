import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/modernAuthStore';

const LogoutPage: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        // Navigate to home page after successful logout
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Logout failed:', err);
        // Still navigate to home page even if logout fails
        navigate('/', { replace: true });
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return <div>Logging out...</div>;
};

export default LogoutPage;
