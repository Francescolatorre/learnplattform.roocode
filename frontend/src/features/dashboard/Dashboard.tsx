import React from 'react';
import { Typography, Container, Grid, Paper, Chip } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'unknown';

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Chip 
        label={userRole} 
        className="user-role"
        color="primary"
        sx={{ mb: 2 }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Quick Overview</Typography>
            <Typography>Welcome to your dashboard</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;