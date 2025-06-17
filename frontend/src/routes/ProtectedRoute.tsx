import React, {useEffect} from 'react';
import {Navigate, useLocation} from 'react-router-dom';

import {useAuth} from '@/context/auth/AuthContext';
import {TUserRole} from '@/types';
import {useNotification} from '@/components/Notifications/useNotification';

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
  const {isAuthenticated, getUserRole, isRestoring} = useAuth();
  const userRole = getUserRole();
  const location = useLocation();
  const notify = useNotification();

  // Log debugging information
  console.info('ProtectedRoute:', {
    isAuthenticated,
    isRestoring,
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

  // Show loading state while restoring authentication
  // This is crucial to prevent premature navigation to login
  if (isRestoring) {
    return (
      <div
        data-testid="protected-route-loading"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <div>
          <p>Loading authentication status...</p>
          <p>Please wait while we verify your session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated and restoration is complete
  if (!isAuthenticated) {
    console.info('User not authenticated, redirecting to login', {
      currentPath: location.pathname
    });
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  // If allowedRoles is provided and not empty, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole as TUserRole)) {
    console.info('User does not have required role, redirecting to appropriate dashboard', {
      userRole,
      requiredRoles: allowedRoles,
      currentPath: location.pathname
    });
    notify("You don't have permission to access this page. Redirecting to dashboard.", 'error');


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
