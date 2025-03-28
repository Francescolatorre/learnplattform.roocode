import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth/AuthContext';

const ProtectedRoute: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: Rendered.');
    console.log('ProtectedRoute: isAuthenticated:', isAuthenticated);
    console.log('ProtectedRoute: user:', user);
    console.log('ProtectedRoute: allowedRoles:', allowedRoles);

    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [user, isAuthenticated, allowedRoles]);

  if (loading) {
    console.log('ProtectedRoute: Waiting for authentication state...');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated. Redirecting to /login.');
    return <Navigate to="/login" />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    console.log(
      `ProtectedRoute: User role "${user?.role}" not allowed. Redirecting to /unauthorized.`
    );
    console.log('Allowed roles:', allowedRoles);
    return <Navigate to="/unauthorized" />;
  }

  console.log('ProtectedRoute: User authenticated and authorized.');
  return <>{children}</>;
};

export default ProtectedRoute;
