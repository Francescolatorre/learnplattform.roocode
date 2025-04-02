import React from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import CourseService from '@features/courses/services/courseService';
import { IPaginatedResponse } from '../../../types/common/paginatedResponse';

import CourseCard from '../components/CourseCard';

const StudentCourseEnrollmentPage: React.FC = () => {
  const {
    data: coursesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: CourseService.fetchCourses,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load courses. Please try again later.
        </Typography>
      </Box>
    );
  }

  const courses = coursesResponse?.results || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      <Grid container spacing={2}>
        {courses.map((course: any) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard
              title={course.title}
              description={course.description}
              instructor={course.instructor}
              onViewDetails={() => console.log(`View details for course ${course.id}`)}
              onEnroll={() => console.log(`Enroll in course ${course.id}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StudentCourseEnrollmentPage;
