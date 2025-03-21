import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, Paper, Chip, Box, LinearProgress } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { fetchStudentProgress } from '../../services/progressService';
import { CourseProgress } from '../../types/progressTypes';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'Not assigned';
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          // Assuming first course for now - in a real app, you'd fetch all courses or have a default
          const progress = await fetchStudentProgress('1');
          setCourseProgress(progress);
        } catch (error) {
          console.error('Failed to fetch progress:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProgress();
  }, [isAuthenticated, user]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {isAuthenticated && user ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              User Role:
            </Typography>
            <Chip
              label={userRole}
              className="user-role"
              color="primary"
              variant="outlined"
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">Quick Overview</Typography>
                <Typography>Welcome to your dashboard, {user.username}!</Typography>
              </Paper>
            </Grid>

            {courseProgress && (
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6">Course Progress</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={courseProgress.completionPercentage}
                        color="primary"
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round(courseProgress.completionPercentage)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {`Completed Tasks: ${courseProgress.completedTasks} / ${courseProgress.totalTasks}`}
                    </Typography>
                    <Typography variant="body2">
                      {`Average Score: ${courseProgress.averageScore.toFixed(2)}`}
                    </Typography>
                    <Typography variant="body2">
                      {`Total Time Spent: ${(courseProgress.totalTimeSpent / 3600).toFixed(2)} hours`}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Please log in to access your dashboard
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;
