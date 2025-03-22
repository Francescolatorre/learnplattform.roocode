import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, Paper, Chip, Box, LinearProgress } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { fetchStudentProgress } from '../../services/progressService';
import { CourseProgress } from '../../types/progressTypes';

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

      {isAuthenticated ? (
        <>
          {/* Add ProgressDebugger to help diagnose issues */}
          <ProgressDebugger />
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
