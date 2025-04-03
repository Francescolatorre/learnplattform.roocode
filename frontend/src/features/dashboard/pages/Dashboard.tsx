import React from 'react';
import {Box, Typography, Grid, CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {fetchUserProgress} from '@services/resources/dashboardService';
import ProgressIndicator from '../components/progress/ProgressIndicator';
import {UserProgress} from 'types/common/entities';

const Dashboard: React.FC = () => {
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
          Failed to load progress data. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Track your progress and performance.
      </Typography>
      <Grid container spacing={2}>
        {(progressData || []).map((progress) => (
          <Grid item xs={12} sm={6} md={4} key={progress.id}>
            <ProgressIndicator value={progress.percentage} label={progress.label} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
