import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Alert,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {Link as RouterLink} from 'react-router-dom';

import {IDashboardResponse} from '@/types/progress';
import {useAuth} from '@context/auth/AuthContext';
import {fetchDashboardData} from '@services/resources/dashboardService';
import DashboardCourseCard from '@/components/DashboardCourseCard';

/**
 * Student Dashboard Page
 *
 * Displays student progress information, overall statistics, and enrolled courses
 */
const Dashboard: React.FC = () => {
  const {user} = useAuth();

  useEffect(() => {
    return () => { };
  }, [user]);

  // User progress data query using React Query
  const {
    data: progressResponse,
    isLoading: isLoadingProgress,
    error,
  } = useQuery<IDashboardResponse>({
    queryKey: ['userProgress', user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }
      return fetchDashboardData(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create a map of course IDs to course titles from enrollments
  const {overall_stats: stats, courses: progressData = []} = progressResponse || {};

  // Loading state
  if (isLoadingProgress) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress role="progressbar" data-testid="dashboard-loading-spinner" />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{textAlign: 'center', mt: 4}}>
        <Alert severity="error" sx={{maxWidth: 600, mx: 'auto', mb: 3}} data-testid="dashboard-error-alert">
          {error instanceof Error ? error.message : 'An error occurred while loading data'}
        </Alert>
        <Typography variant="body1">
          Please try refreshing the page or contact support if the problem persists.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom data-testid="dashboard-title">
        Student Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.display_name || user?.username}!
      </Typography>

      {/* Overall Statistics Card */}
      <Paper elevation={2} sx={{p: 3, mt: 3}} data-testid="dashboard-summary">
        <Typography variant="h5" gutterBottom data-testid="learning-overview">
          Learning Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  data-testid="enrolled-courses"
                >
                  Enrolled Courses
                </Typography>
                <Typography variant="h4">{stats?.courses_enrolled || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Completed Courses
                </Typography>
                <Typography variant="h4">{stats?.courses_completed || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Overall Completion
                </Typography>
                <Typography variant="h4">{stats?.overall_progress || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Completed Tasks
                </Typography>
                <Typography variant="h4">
                  {stats?.tasks_completed || 0}/{stats?.tasks_in_progress || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Course Progress Section */}
      <Box sx={{mt: 4}} data-testid="progress-section">
        <Typography variant="h5" gutterBottom>
          Course Progress
        </Typography>

        {!progressData || progressData.length === 0 ? (
          <Paper elevation={2} sx={{p: 3, textAlign: 'center'}}>
            <Typography variant="h6" gutterBottom>
              No Course Progress Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You have not started any courses yet. Enroll in courses to track your progress.
            </Typography>
            <Button
              component={RouterLink}
              to="/courses"
              variant="contained"
              color="primary"
              sx={{mt: 2}}
            >
              Browse Courses
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {progressData.map(progress => {
              // Prioritize course_id if available, fall back to id
              const courseId = progress.course_id?.toString() || progress.id || '';

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={courseId || progress.course_title || Math.random()}
                >
                  <DashboardCourseCard
                    courseTitle={progress.course_title}
                    progress={{
                      percentage: typeof progress.progress === 'number' ? progress.progress : 0,
                      completed_tasks: stats?.tasks_completed || 0,
                      total_tasks: stats?.tasks_in_progress || 0,
                      last_activity: progress.last_activity_date,
                    }}
                    courseId={courseId}
                    data-testid={`course-card-${courseId}`}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Quick Links Section */}
      <Box sx={{mt: 4}}>
        <Paper elevation={2} sx={{p: 3}}>
          <Typography variant="h5" gutterBottom>
            Quick Links
          </Typography>
          <Typography variant="body1" paragraph>
            Continue your learning journey by exploring the available courses and tasks.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Alert severity="info">
                Visit the <strong>Courses</strong> section to see your enrolled courses.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="info">
                Check the <strong>Tasks</strong> section for your pending learning tasks.
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
