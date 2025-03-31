import React, {useEffect, useState} from 'react';
import {Box, Typography, Alert} from '@mui/material';

import CourseService from '@features/courses/services/courseService';
import CourseList from '@features/courses/components/CourseList';
import LoadingIndicator from '@components/common/LoadingIndicator';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await CourseService.fetchCourses();
        setCourses(response.results);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{mb: 3}}>
        {error}
      </Alert>
    );
  }

  if (courses.length === 0) {
    return (
      <Alert severity="info" sx={{mb: 3}}>
        No courses available.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      <CourseList courses={courses} />
    </Box>
  );
};

export default CoursesPage;
