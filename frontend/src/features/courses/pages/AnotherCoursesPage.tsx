import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography } from '@mui/material';

import { useAuth } from '@features/auth/context/AuthContext';
import { useCourses } from '@hooks/useCourses';

const AnotherCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: courses, isLoading, error } = useCourses();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated. Redirecting to login.');
      navigate('/login');
    } else if (user?.role === 'student') {
      console.log('CoursesPage rendered for student:', user);
    }
  }, [user, isAuthenticated, navigate]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}/details`);
  };

  if (isLoading) {
    return <Typography>Loading courses...</Typography>;
  }

  if (error) {
    return <Typography>Error loading courses: {error.message}</Typography>;
  }

  return (
    <Container>
      {courses?.map(course => (
        <Paper
          key={course.id}
          onClick={() => handleCourseClick(course.id)}
          sx={{ p: 2, mb: 2, cursor: 'pointer' }}
        >
          <Typography variant="h6">{course.title}</Typography>
          <Typography variant="body2">{course.description}</Typography>
        </Paper>
      ))}
    </Container>
  );
};

export default AnotherCoursesPage;
