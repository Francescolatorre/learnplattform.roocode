import { Typography, Container, Paper, Box } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/store/modernAuthStore';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">Profile Details</Typography>
        {user ? (
          <Box>
            <Typography>Username: {user.username}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Role: {user.role || 'Not specified'}</Typography>
          </Box>
        ) : (
          <Typography color="textSecondary">Please log in to view your profile details.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;
