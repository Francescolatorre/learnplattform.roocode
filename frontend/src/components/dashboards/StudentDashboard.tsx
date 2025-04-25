import {Box, Typography, CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';

import {
  IDashboardResponse
} from '@/types/progress';
import {useAuth} from '@context/auth/AuthContext';
import progressService from 'src/services/resources/progressService';
import {ICourseEnrollment} from '@/types';
import {enrollmentService} from '@/services';

const StudentDashboard: React.FC = () => {
  const {user} = useAuth();

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<IDashboardResponse>({
    queryKey: ['studentDashboard'],
    queryFn: () => progressService.getStudentDashboard(user?.id),
    enabled: !!user?.id,
  });

  const enrolledCourses = enrollmentService.fetchUserEnrollments();

  const renderEnrolledCourses = (coursesData: ICourseEnrollment[]) => {
    return (
      <div>
        {coursesData.map(course => (
          <div key={course.id}>
            <Typography>{course.course_details?.description}</Typography>
            {/* Additional course details can be displayed here */}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{p: 2}}>
        <Typography color="error">
          Error loading dashboard data: {(error as Error).message}
        </Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }


  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        Welcome Back, {user?.display_name || user?.username}
      </Typography>
    </Box>
  );
};

export default StudentDashboard;
