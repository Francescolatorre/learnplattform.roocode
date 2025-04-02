import React from 'react';
import { Box, Typography, Button } from '@mui/material';

type Task = {
  title: string;
  status: string;
  createdDate: string;
  creator: string;
  description: string;
};

type LearningTaskOverviewProps = {
  task: Task;
};

const LearningTaskOverview: React.FC<LearningTaskOverviewProps> = ({ task }) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5">{task.title}</Typography>
      <Typography variant="body1">Status: {task.status}</Typography>
      <Typography variant="body2">Created Date: {task.createdDate}</Typography>
      <Typography variant="body2">Creator: {task.creator}</Typography>
      <Typography variant="body2">{task.description}</Typography>
      <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
        Edit Task
      </Button>
      <Button variant="outlined" color="secondary" sx={{ mt: 2, ml: 1 }}>
        Archive Task
      </Button>
    </Box>
  );
};

export default LearningTaskOverview;
