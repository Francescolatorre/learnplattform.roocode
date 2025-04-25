import React, {useEffect} from 'react';
import {Navigate, useLocation} from 'react-router-dom';

import {useAuth} from '@/context/auth/AuthContext';
import {TUserRole} from '@/types';

interface IProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: TUserRole[];
}

/**
 * ProtectedRoute Component
 *
 * This component handles route protection based on authentication status and user roles.
 * It redirects unauthenticated users to the login page and checks role-based permissions.
 *
 * @param children - The components to render if the user is authenticated and authorized
 * @param allowedRoles - Optional array of roles that are allowed to access this route
 */
const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  children,
  allowedRoles = []
}) => {
  const {isAuthenticated, getUserRole} = useAuth();
  const userRole = getUserRole();
  const location = useLocation();

  // Log debugging information
  console.info('ProtectedRoute:', {
    isAuthenticated,
    userRole,
    allowedRoles,
    path: location.pathname
  });

  // Effect to handle role-based access logging
  useEffect(() => {
    if (isAuthenticated && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.includes(userRole as TUserRole);
      if (!hasAccess) {
        console.warn(
          `Access denied: User with role "${userRole}" attempted to access route "${location.pathname}" ` +
          `which requires one of these roles: [${allowedRoles.join(', ')}]`
        );
      }
    }
  }, [isAuthenticated, userRole, allowedRoles, location.pathname]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  // If allowedRoles is provided and not empty, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole as TUserRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'instructor') {
      return <Navigate to="/instructor/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If authenticated and authorized, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
