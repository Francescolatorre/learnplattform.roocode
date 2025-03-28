import React from 'react';
import { Container, Typography } from '@mui/material';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      {children}
    </Container>
  );
};

export default DashboardLayout;
