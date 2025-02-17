import React from 'react';
import { Typography, Container, Paper } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">Profile Details</Typography>
        <Typography>Profile information will be displayed here</Typography>
      </Paper>
    </Container>
  );
};

export default Profile;