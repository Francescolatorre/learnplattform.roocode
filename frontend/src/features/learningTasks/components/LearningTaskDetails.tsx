import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {CircularProgress, Typography, Button} from '@mui/material';

import LearningTaskService from '@features/learningTasks/services/learningTaskService';

interface TaskDetailsProps {
  taskId: number;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({taskId}) => {
  const {data: taskDetails, isLoading} = useQuery(['taskDetails', taskId], () =>
    LearningTaskService.fetchTaskDetails(String(taskId))
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
