import React from 'react';
import {Typography} from '@mui/material';

import LearningTasksList from '@features/learningTasks/components/LearningTasksList';

interface StudentLearningTasksPageProps {
  userRole: string; // Accept user role as a prop
}

const StudentLearningTasksPage: React.FC<StudentLearningTasksPageProps> = ({userRole}) => {
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

export default StudentLearningTasksPage;
