import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';

import {useAuth} from '@context/auth/AuthContext';

interface IProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({children, allowedRoles = []}) => {
  const {user, isAuthenticated, isRestoring} = useAuth();
  const location = useLocation();

  console.debug('ProtectedRoute:', {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    path: location.pathname,
  });
  if (isRestoring) {
    // Show a loading spinner or placeholder while auth state is restoring
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{from: location.pathname}} replace />;
  }

  // Allow access if no roles specified or if user role matches
  const hasRequiredRole =
    allowedRoles.length === 0 || (user?.role && allowedRoles.includes(user.role));

  if (!hasRequiredRole) {
    console.debug('Access denied: Role not allowed');
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
