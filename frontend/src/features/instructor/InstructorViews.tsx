import React from 'react';
import { Typography, Container, Paper } from '@mui/material';
import withAuth from '../auth/hoc/withAuth';

const InstructorViews: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Instructor Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the instructor dashboard. Here you can manage courses, tasks, and more.
        </Typography>
      </Paper>
    </Container>
  );
};

// Wrap InstructorViews with withAuth HOC, allowing only instructors and admins
export default withAuth(InstructorViews, { allowedRoles: ['instructor', 'admin'] });
