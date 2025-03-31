import React from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Box, Typography, Container, Paper, Button} from '@mui/material';

import CourseTasksList from '@components/CourseTasksList'; // Ensure this path is correct
import {useAuth} from '@features/auth/context/AuthContext';

const AnotherCourseTasksPage = () => {
  const {courseId} = useParams();
  const navigate = useNavigate();
  const {user} = useAuth();

  if (user?.role !== 'student') {
    return (
      <Container maxWidth="lg">
        <Paper sx={{p: 3, mt: 3}}>
          <Typography variant="h5" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph>
            You do not have permission to view this page.
          </Typography>
          <Button variant="contained" color="primary" href="/dashboard">
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!courseId) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{p: 3, mt: 3}}>
          <Typography variant="h5" gutterBottom>
            Course Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The course you are looking for could not be found.
          </Typography>
          <Button variant="contained" color="primary" href="/courses">
            Browse Courses
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{py: 4}}>
        <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Back to Course
          </Button>

          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/courses/${courseId}/edit`)}
            >
              Edit Course
            </Button>
          )}
        </Box>

        <CourseTasksList courseId={courseId} />

        <Box sx={{mt: 4}}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(`/progress-tracking/${courseId}`)}
          >
            View Progress
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AnotherCourseTasksPage;
