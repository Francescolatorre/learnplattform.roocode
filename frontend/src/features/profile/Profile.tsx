import React from 'react';
import {Typography, Container, Paper, Box} from '@mui/material';

import {useAuth} from '../auth/context/AuthContext';
import withAuth from '../auth/hoc/withAuth';

const Profile: React.FC = () => {
  const {user} = useAuth();

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Paper elevation={3} sx={{p: 3}}>
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

export default withAuth(Profile);
