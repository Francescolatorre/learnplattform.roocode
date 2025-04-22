import {Box, Typography, Grid, CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import React, {useEffect} from 'react';

import {useAuth} from '@context/auth/AuthContext';
import ProgressIndicator from 'src/components/ProgressIndicator';


const Dashboard: React.FC = () => {
  const {user} = useAuth();

  useEffect(() => {
    console.info('Dashboard component mounted');
    console.info('User:', user);
    return () => {
      console.info('Dashboard component unmounted');
    };
  }, [user]);

  const fetchUserProgress = async (): Promise<IUserProgress[]> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    try {
      console.info('Fetching user progress for user ID:', user.id);
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/v1/students/progress/`, {
        headers: {Authorization: `Bearer ${accessToken}`}
      }); //will get progress for current user
      console.info('User progress response:', response);

      // Mitigation: adapt to backend object structure
      if (response.data && Array.isArray(response.data.courses)) {
        return response.data.courses;
      } else if (Array.isArray(response.data)) {
        // fallback for legacy array response
        return response.data;
      } else {
        console.error('Error: Unexpected user progress data structure', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching user progress:', error.message);
      throw new Error('Failed to load progress data.');
    }
  };

  const {
    data: progressData,
    isLoading,
    error,
  } = useQuery<UserProgress[]>({queryKey: ['userProgress'], queryFn: fetchUserProgress});

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
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        {(progressData || []).slice(0, 3).map((progress, idx) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={progress.id !== undefined ? progress.id : `progress-${idx}`}
          >
            <ProgressIndicator value={progress.percentage} label={progress.label} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
