import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, refreshToken, userRole, isAuthChecked } = useAuth();
  const isTokenAvailable = localStorage.getItem('access_token') !== null;
  const [loading, setLoading] = React.useState(!isAuthChecked);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated && isTokenAvailable) {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
      setLoading(false);
    };

    if (!isAuthChecked) {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isTokenAvailable, refreshToken, isAuthChecked]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
