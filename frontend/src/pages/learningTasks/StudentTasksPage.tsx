import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import useNotification from '@/components/Notifications/useNotification';
import { ILearningTask } from '@/types/task';
import learningTaskService from '@services/resources/learningTaskService';
import { useAuth } from 'src/context/auth'; // Annahme: Auth-Kontext für Benutzer-ID
import LearningTaskCard from 'src/pages/learningTasks/LearningTaskCard';

const StudentTasksPage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;
  const notify = useNotification();

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery<ILearningTask[]>({
    queryKey: ['learningTasks', studentId],
    queryFn: () => {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      return learningTaskService.getByStudentId(studentId);
    },
    enabled: !!studentId,
  });

  useEffect(() => {
    if (error) {
      notify({
        message: `Failed to load tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        title: 'Task Load Error',
      });
    }
  }, [error, notify]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
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

      {!tasks || tasks.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You don&apos;t have any learning tasks assigned yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tasks.map(task => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <LearningTaskCard
                title={task.title ?? ''}
                description={task.description ?? ''}
                onViewTask={() => console.info('View task ${task.id}')}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentTasksPage;
