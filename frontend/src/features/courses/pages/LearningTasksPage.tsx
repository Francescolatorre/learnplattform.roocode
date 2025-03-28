import React from 'react';
import { Typography } from '@mui/material';
import LearningTasksList from '../features/tasks/LearningTasksList';

interface LearningTasksPageProps {
  userRole: string; // Accept user role as a prop
}

const LearningTasksPage: React.FC<LearningTasksPageProps> = ({ userRole }) => {
  if (userRole !== 'student') {
    return <Typography variant="h6">Access Denied: This page is for students only.</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Your Learning Tasks
      </Typography>
      <LearningTasksList />
    </div>
  );
};

export default LearningTasksPage;
