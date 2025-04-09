import { Container, Typography, Button, Box } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to the Learning Platform
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Manage courses, track progress, and explore interactive assessments.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/courses')}
          sx={{ mr: 2 }}
        >
          View Courses
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/login')}>
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
