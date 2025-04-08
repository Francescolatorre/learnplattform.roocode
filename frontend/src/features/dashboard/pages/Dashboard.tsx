import React, {useEffect} from 'react';
import {Box, Typography, Grid, CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import ProgressIndicator from '../components/progress/ProgressIndicator';
import {useAuth} from '@features/auth/context/AuthContext';

interface UserProgress {
  id: number;
  percentage: number;
  label: string;
}

const Dashboard: React.FC = () => {
  const {user} = useAuth();

  useEffect(() => {
    console.log('Dashboard component mounted');
    console.log('User:', user);
    return () => {
      console.log('Dashboard component unmounted');
    };
  }, [user]);

  const fetchUserProgress = async (): Promise<UserProgress[]> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    try {
      console.log('Fetching user progress for user ID:', user.id);
      const response = await axios.get(`/api/v1/students/progress/`); //will get progress for current user
      console.log('User progress response:', response);
      if (!Array.isArray(response.data)) {
        console.error('Error: User progress data is not an array', response.data);
        return [];
      }
      return response.data;
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
        {(progressData || []).slice(0, 3).map(progress => (
          <Grid item xs={12} sm={6} md={4} key={progress.id}>
            <ProgressIndicator value={progress.percentage} label={progress.label} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
