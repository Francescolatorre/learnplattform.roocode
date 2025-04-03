import React, {useState, useEffect} from 'react';
import {Typography, Paper, Grid} from '@mui/material';
import {fetchStudentProgressByCourse} from '@services/resources/progressService';

import {useAuth} from '../../../auth/context/AuthContext';

const ProgressDebugger: React.FC = () => {
  const {user, isAuthenticated} = useAuth();
  const [debugInfo, setDebugInfo] = useState<{
    isAuthenticated: boolean;
    userRole: string | null;
    accessToken: string | null;
    progressFetchResult: string;
  }>({
    isAuthenticated: false,
    userRole: null,
    accessToken: null,
    progressFetchResult: 'Not attempted',
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const accessToken = localStorage.getItem('access_token');

      setDebugInfo(prev => ({
        ...prev,
        isAuthenticated,
        userRole: user?.role || localStorage.getItem('user_role'),
        accessToken,
      }));

      if (isAuthenticated && accessToken) {
        try {
          // Try fetching progress for a sample course
          await fetchStudentProgressByCourse('1', String(user?.id) || 'defaultStudentId');
          setDebugInfo(prev => ({
            ...prev,
            progressFetchResult: 'Success',
          }));
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          setDebugInfo(prev => ({
            ...prev,
            progressFetchResult: `Failed with status ${(error as Error)?.response?.status || 'unknown'}: ${err.message || 'No error message provided'}`,
          }));
        }
      }
    };

    runDiagnostics();
  }, [user, isAuthenticated]);

  return (
    <Paper sx={{p: 2, mt: 2}}>
      <Typography variant="h6" gutterBottom>
        Progress Fetch Diagnostics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            Authentication Status:{' '}
            {debugInfo.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Typography>
          <Typography variant="body2">User Role: {debugInfo.userRole || 'Not Set'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            Access Token Present: {debugInfo.accessToken ? 'Yes' : 'No'}
          </Typography>
          <Typography
            variant="body2"
            color={debugInfo.progressFetchResult === 'Success' ? 'success.main' : 'error.main'}
          >
            Progress Fetch Result: {debugInfo.progressFetchResult}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProgressDebugger;
