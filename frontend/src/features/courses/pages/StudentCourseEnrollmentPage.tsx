import React from 'react';
import {IEnrollment} from '@features/courses/types/courseTypes';
import {IEnrollmentWithDetails} from '@features/enrollments/services/enrollmentService';
import {Box, Grid, Typography, CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import CourseService from '@features/courses/services/courseService';
import EnrollmentService from '@features/enrollments/services/enrollmentService';
import CourseCard from '@features/courses/components/CourseCard';

const StudentCourseEnrollmentPage: React.FC = () => {

  //state für filter

  const [filter, setFilter] = React.useState<string | null>(null);

  const {
    data: enrollmentsResponse,
    isLoading,
    error,
  } = useQuery<IEnrollmentWithDetails[], Error>({
    queryKey: ['enrollments'],
    queryFn: () => EnrollmentService.fetchAllEnrollments(),
  });

  if (isLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{textAlign: 'center', mt: 4}}>
        <Typography variant="h6" color="error">
          Failed to load enrollments. Please try again later.
        </Typography>
      </Box>
    );
  }

  const enrollments = enrollmentsResponse || [];

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      <Grid container spacing={2}>
        {enrollments.map((enrollment: IEnrollmentWithDetails) => (
          <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
            <CourseCard
              title={enrollment.course_details.title}
              description={enrollment.course_details.description}
              onViewDetails={() => console.log(`View details for course ${enrollment.course}`)}
              onEnroll={() => console.log(`Enroll in course ${enrollment.course}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StudentCourseEnrollmentPage;
