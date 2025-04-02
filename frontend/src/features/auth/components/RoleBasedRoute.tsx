import React from 'react';
import { Route, Navigate } from 'react-router-dom';

interface RoleBasedRouteProps {
  roles: string[];
  userRole: string;
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ roles, userRole, children }) => {
  if (!roles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Route>{children}</Route>;
};

export default RoleBasedRoute;
