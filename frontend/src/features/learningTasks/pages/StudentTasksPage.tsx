import React, {useEffect} from 'react';
import {useApiResource} from '@hooks/useApiResource';
import TaskList from '@features/learningTasks/components/TaskList';
import LoadingIndicator from '@components/common/LoadingIndicator';
import {Alert, Box, Typography} from '@mui/material';

interface ITask {
  id: string;
  title: string;
  description: string;
}

const StudentTasksPage: React.FC = () => {
  const {data: tasksData, isLoading, error} = useApiResource<{results: ITask[]}>('/api/v1/learning-tasks', {page: 1});

  useEffect(() => {
    if (tasksData) {
      console.log('Tasks data fetched:', tasksData);
    }
  }, [tasksData]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{mb: 3}}>
        Failed to load tasks. Please try again later.
      </Alert>
    );
  }

  if (!tasksData || tasksData.results.length === 0) {
    return (
      <Alert severity="info" sx={{mb: 3}}>
        No tasks available.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Your Learning Tasks
      </Typography>
      <TaskList tasks={tasksData.results} />
    </Box>
  );
};

export default StudentTasksPage;
