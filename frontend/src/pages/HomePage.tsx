import { Container, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTE_CONFIG } from '@/config/appConfig';
import { useAuth } from '@/context/auth/AuthContext';
import { TUserRole } from '@/types';

type DashboardPaths = {
  [key in TUserRole]: string;
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getUserRole } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTE_CONFIG.loginPath);
    } else {
      const role = getUserRole();
      // Type assertion here is safe because ROUTE_CONFIG.dashboardPaths matches our DashboardPaths type
      const dashboardPaths = ROUTE_CONFIG.dashboardPaths as DashboardPaths;
      const dashboardPath = dashboardPaths[role] || dashboardPaths.guest;
      navigate(dashboardPath);
    }
  }, [isAuthenticated, getUserRole, navigate]);

  // Show loading state while redirecting
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        Welcome to the Learning Platform
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Redirecting...
      </Typography>
    </Container>
  );
};

export default HomePage;
