import React from 'react';
import {Navigate} from 'react-router-dom';

import {useAuth} from '@context/auth/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
}) => {
  const {user, isAuthenticated} = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to specified path or dashboard if user's role is not allowed
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// Generic type for component props
type ComponentProps<P> = P & {[key: string]: unknown};

export const withRoleBasedAccess = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[],
  redirectTo?: string
) => {
  return function WithRoleBasedAccessWrapper(props: ComponentProps<P>) {
    return (
      <RoleBasedRoute allowedRoles={allowedRoles} redirectTo={redirectTo}>
        <WrappedComponent {...(props as P)} />
      </RoleBasedRoute>
    );
  };
};

export default RoleBasedRoute;
