import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import authService from '@services/authService';

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            authService.refreshToken(refreshToken).catch((err) => {
                console.error('Token refresh failed:', err);
            });
        }
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};
