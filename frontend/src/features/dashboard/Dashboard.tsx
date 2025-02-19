import React from 'react';
import { Typography, Container, Grid, Paper, Chip, Box } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'Not assigned';

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {isAuthenticated && user ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              User Role:
            </Typography>
            <Chip 
              label={userRole} 
              className="user-role"
              color="primary"
              variant="outlined"
            />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">Quick Overview</Typography>
                <Typography>Welcome to your dashboard, {user.username}!</Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Please log in to access your dashboard
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;
