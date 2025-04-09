import CourseList from '@components/courses/CourseList';
import { useAuth } from '@features/auth/context/AuthContext';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { DashboardResponse } from '@types/common/progressTypes';
import React from 'react';

import { ProgressService } from '@services/resources/progressService';


import ProgressOverview from '../progress/ProgressOverview';


const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardResponse>({
    queryKey: ['studentDashboard'],
    queryFn: () => ProgressService.getStudentDashboard(user?.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Error loading dashboard data: {(error).message}
        </Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { overall_stats, courses } = dashboardData;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome Back, {dashboardData.user_info.full_name || dashboardData.user_info.username}
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Progress */}
        <Grid item xs={12}>
          <ProgressOverview
            totalCourses={overall_stats.total_courses}
            completedCourses={overall_stats.completed_courses}
            averageScore={overall_stats.average_score}
            overallCompletion={overall_stats.overall_completion}
          />
        </Grid>

        {/* Active Courses */}
        <Grid item xs={12}>
          <CourseList courses={courses} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
