import {CircularProgress, Typography, Button} from '@mui/material';
import React from 'react';
import {useParams} from 'react-router-dom';

import {useTaskData} from '@services/useTaskData';

const TaskViewPage: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const {data: task, isLoading, error} = useTaskData(String(id));

  const handleTaskCompletion = () => {
    // Logic to mark task as completed
    console.log('Task completed');
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Failed to load task details.</Typography>;

  return (
    <div>
      <Typography variant="h4">{task.title}</Typography>
      <Typography variant="body1">{task.description}</Typography>
      <Button variant="contained" onClick={handleTaskCompletion}>
        Mark as Completed
      </Button>
    </div>
  );
};

export default TaskViewPage;
