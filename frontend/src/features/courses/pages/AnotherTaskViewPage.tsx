import React from 'react';
import { Typography } from '@mui/material';
import TaskDetails from '../features/tasks/TaskDetails';

interface TaskViewPageProps {
  taskId: number; // Accept task ID as a prop
  userRole: string; // Accept user role as a prop
}

const AnotherTaskViewPage: React.FC<TaskViewPageProps> = ({ taskId, userRole }) => {
  if (userRole !== 'student') {
    return <Typography variant="h6">Access Denied: This page is for students only.</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Task Details
      </Typography>
      <TaskDetails taskId={taskId} />
    </div>
  );
};

export default AnotherTaskViewPage;
