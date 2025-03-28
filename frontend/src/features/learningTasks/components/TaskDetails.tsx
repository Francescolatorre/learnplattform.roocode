import React from 'react';
import { useQuery } from 'react-query';
import learningTaskService from '../../services/resources/learningTaskService';
import { CircularProgress, Typography, Button } from '@mui/material';

interface TaskDetailsProps {
  taskId: number;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId }) => {
  const { data: taskDetails, isLoading } = useQuery(['taskDetails', taskId], () =>
    learningTaskService.fetchTaskDetails(String(taskId))
  );

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!taskDetails) {
    return <Typography variant="h6">Task not found.</Typography>;
  }

  return (
    <div>
      <Typography variant="h5">{taskDetails.title}</Typography>
      <Typography variant="body1" gutterBottom>
        {taskDetails.description}
      </Typography>
      <Button variant="contained" color="primary">
        Start Task
      </Button>
    </div>
  );
};

export default TaskDetails;
