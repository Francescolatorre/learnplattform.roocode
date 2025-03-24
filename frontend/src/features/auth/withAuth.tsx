import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

interface WithAuthProps {
    allowedRoles?: string[]; // Specify roles allowed to access the component
}

const withAuth = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    { allowedRoles }: WithAuthProps = {}
) => {
    const AuthWrapper: React.FC<P> = (props) => {
        const { user, isAuthenticated } = useAuth();

        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            return <Navigate to="/login" replace />;
        }

        if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
            // Block access if the user's role is not allowed
            return <Navigate to="/unauthorized" replace />;
        }

        // Render the wrapped component if authentication and role checks pass
        return <WrappedComponent {...props} />;
    };

    return AuthWrapper;
};

export default withAuth;
