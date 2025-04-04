import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircularProgress, Typography, Button } from '@mui/material';

// Update to the generalized service name
import LearningTaskService from '../../../features/learningTasks/services/learningTaskService'; // This import is not used in this file, but it might be needed elsewhere

interface TaskDetailsProps {
  taskId: string | undefined;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId }) => {
  const { data: taskDetails, isLoading } = useQuery({
    queryKey: ['taskDetails', taskId],
    queryFn: async () => {
      if (taskId) {
        try {
          return await LearningTaskService.getById(taskId); // Updated service method
        } catch (error) {
          console.error('Failed to fetch task details:', error);
          return null;
        }
      }
      return null;
    },
    enabled: !!taskId,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!taskDetails) {
    return <Typography variant="h6">Task not found.</Typography>;
  }

  return (
    <div>
      <Typography variant="h5">{taskDetails?.title ?? 'No Title'}</Typography>
      <Typography variant="body1" gutterBottom>
        {taskDetails?.description ?? 'No Description'}
      </Typography>
      <Button variant="contained" color="primary">
        Start Task
      </Button>
    </div>
  );
};

export default TaskDetails;
