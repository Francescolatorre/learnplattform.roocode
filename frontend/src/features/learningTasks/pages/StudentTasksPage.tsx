import React from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningTasks } from '@services/api/learningTaskService';
import LearningTaskCard from '../components/LearningTaskCard';
import { LearningTask } from '@/types/common/entities';

const StudentTasksPage: React.FC = () => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery<LearningTask[]>('learningTasks', fetchLearningTasks);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load tasks. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Learning Tasks
      </Typography>
      <Grid container spacing={2}>
        {tasks &&
          tasks.map(task => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <LearningTaskCard
                title={task.title ?? ''}
                description={task.description ?? ''}
                dueDate={task.dueDate ?? ''}
                onViewTask={() => console.log(`View task ${task.id}`)}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default StudentTasksPage;
