import AddIcon from '@mui/icons-material/Add';
import { Paper, Typography, Button } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const NoCoursesMessage: React.FC = () => (
  <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" gutterBottom>
      You haven&apos;t created any courses yet
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      Start by creating your first course. You&apos;ll be able to add learning tasks and manage student
      enrollments.
    </Typography>
    <Button
      component={RouterLink}
      to="/instructor/courses/new"
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      sx={{ mt: 2 }}
      data-testid="create-first-course-button"
    >
      Create Your First Course
    </Button>
  </Paper>
);

export default NoCoursesMessage;
