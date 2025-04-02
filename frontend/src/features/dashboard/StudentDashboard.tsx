import React from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import EnrollmentService from '@features/enrollments/services/enrollmentService';
import LearningTaskService from '@features/learningTasks/services/learningTaskService';
import CourseList from '@features/courses/components/CourseList'; // Reusable course list component
import LearningTaskList from '@features/learningTasks/components/LearningTaskList';
import { useAuth } from '@features/auth/context/AuthContext';

const StudentDashboard: React.FC = () => {
  const { userRole } = useAuth();

  if (userRole !== 'student') {
    return (
      <Typography color="error">
        Access Denied: You do not have permission to view this page.
      </Typography>
    );
  }

  const {
    data: enrollmentData,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useQuery({
    queryKey: ['enrollments'],
    queryFn: EnrollmentService.fetchUserEnrollments,
  });

  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['upcomingTasks'],
    queryFn: LearningTaskService.fetchLearningTasks,
  });

  const isLoading = enrollmentsLoading || tasksLoading;
  const error = enrollmentsError || tasksError;

  const enrollments = enrollmentData?.results ?? [];
  const upcomingTasks = tasksData?.results?.slice(0, 5) ?? [];

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        {enrollmentsError
          ? 'Failed to load enrollments. Please try again later.'
          : 'Failed to load tasks. Please try again later.'}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enrolled Courses
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {enrollments.length === 0 ? (
            <Typography>No enrolled courses yet.</Typography>
          ) : (
            <CourseList courses={enrollments} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upcoming Tasks (Next 5)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {upcomingTasks.length === 0 ? (
            <Typography>No upcoming tasks. Stay tuned for new assignments!</Typography>
          ) : (
            <LearningTaskList tasks={upcomingTasks} limit={5} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentDashboard;
