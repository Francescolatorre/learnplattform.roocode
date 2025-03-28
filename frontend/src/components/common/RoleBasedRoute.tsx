import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth/AuthContext';

interface IRoleBasedRouteProps {
    children: React.ReactNode;
    requiredRole: string;
}

const RoleBasedRoute: React.FC<IRoleBasedRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!user?.roles?.includes(requiredRole)) {
        return <Navigate to="/unauthorized" />;
    }

    return <>{children}</>;
};

export default RoleBasedRoute;
