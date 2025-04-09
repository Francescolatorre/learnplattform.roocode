import LearningTaskList from '@features/learningTasks/components/LearningTaskList';
import { Typography } from '@mui/material';
import React from 'react';


interface StudentLearningTasksPageProps {
  userRole: string; // Accept user role as a prop
}

const StudentLearningTasksPage: React.FC<StudentLearningTasksPageProps> = ({ userRole }) => {
  if (userRole !== 'student') {
    return <Typography variant="h6">Access Denied: This page is for students only.</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Your Learning Tasks
      </Typography>
      <LearningTaskList />
    </div>
  );
};

export default StudentLearningTasksPage;
