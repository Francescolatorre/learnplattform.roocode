import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, Paper, Box, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { fetchStudentProgress, fetchInstructorDashboardData } from '../../services/progressService';
import { fetchAdminDashboardSummary } from '../../services/courseService'; // Updated import
import withAuth from '../auth/withAuth';

// Debug component for tracking progress fetch issues
const ProgressDebugger: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<{
    isAuthenticated: boolean;
    userRole: string | null;
    accessToken: string | null;
    progressFetchResult: string;
  }>({
    isAuthenticated: false,
    userRole: null,
    accessToken: null,
    progressFetchResult: 'Not attempted'
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const accessToken = localStorage.getItem('access_token');

      setDebugInfo(prev => ({
        ...prev,
        isAuthenticated,
        userRole: user?.role || localStorage.getItem('user_role'),
        accessToken
      }));

      if (isAuthenticated && accessToken) {
        try {
          // Try fetching progress for a sample course
          await fetchStudentProgress('1');
          setDebugInfo(prev => ({
            ...prev,
            progressFetchResult: 'Success'
          }));
        } catch (error: any) {
          setDebugInfo(prev => ({
            ...prev,
            progressFetchResult: `Failed: ${error.response?.status || error.message}`
          }));
        }
      }
    };

    runDiagnostics();
  }, [user, isAuthenticated]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Progress Fetch Diagnostics</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            Authentication Status: {debugInfo.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Typography>
          <Typography variant="body2">
            User Role: {debugInfo.userRole || 'Not Set'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            Access Token Present: {debugInfo.accessToken ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body2" color={debugInfo.progressFetchResult === 'Success' ? 'success.main' : 'error.main'}>
            Progress Fetch Result: {debugInfo.progressFetchResult}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'Not assigned';
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          if (userRole === 'student') {
            const progress = await fetchStudentProgress('1');
            setData(progress);
          } else if (userRole === 'instructor') {
            const instructorData = await fetchInstructorDashboardData();
            setData(instructorData);
          } else if (userRole === 'admin') {
            const adminData = await fetchAdminDashboardSummary();
            setData(adminData);
          }
          setError(null);
        } catch (error: any) {
          console.error('Failed to fetch data:', error);
          if (error.response?.status === 403) {
            setError('You do not have permission to access this resource.');
          } else {
            setError(error.message || 'Failed to load dashboard data.');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [isAuthenticated, user, userRole]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {userRole === 'student' ? 'Student Dashboard' : userRole === 'instructor' ? 'Instructor Dashboard' : 'Admin Dashboard'}
      </Typography>
      {userRole === 'admin' && data && (
        <Grid container spacing={3}>
          {/* Total Tasks */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h4" color="primary">
                  {data.totalTasks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Tasks */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completed Tasks
                </Typography>
                <Typography variant="h4" color="primary">
                  {data.completedTasks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Average Score */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Score
                </Typography>
                <Typography variant="h4" color="primary">
                  {data.averageScore}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {userRole === 'instructor' && data && (
        <Grid container spacing={3}>
          {/* Courses Created */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Courses Created
                </Typography>
                <Typography variant="h4" color="primary">
                  {data.courses_created}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Students Enrolled */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Students Enrolled
                </Typography>
                <Typography variant="h4" color="primary">
                  {data.students_enrolled}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {data.recent_activity.length > 0 ? (
                  <Box>
                    {data.recent_activity.map((activity: any, index: number) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="body1">
                          Task: <strong>{activity.task__title}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Status: {activity.status}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Updated At: {new Date(activity.updated_at).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No recent activity.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

// Wrap Dashboard with withAuth HOC, allowing only students, instructors, and admins
export default withAuth(Dashboard, { allowedRoles: ['student', 'instructor', 'admin'] });
