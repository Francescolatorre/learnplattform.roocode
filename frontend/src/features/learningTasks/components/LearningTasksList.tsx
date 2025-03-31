import React from 'react';
import {useQuery, useMutation} from '@tanstack/react-query';
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button,
  LinearProgress,
} from '@mui/material';

import LearningTaskService from '@features/learningTasks/services/learningTaskService';

const LearningTasksList: React.FC = () => {
  const {
    data: taskProgress,
    isLoading,
    refetch,
  } = useQuery('taskProgress', LearningTaskService.fetchTaskProgress);
  const mutation = useMutation(
    ({taskId, status}: {taskId: number; status: string}) =>
      LearningTaskService.updateTaskProgress(taskId, status),
    {
      onSuccess: () => refetch(),
    }
  );

  const handleCompleteTask = (taskId: number) => {
    mutation.mutate({taskId, status: 'completed'});
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <List>
      {taskProgress?.map((progress: any) => (
        <ListItem key={progress.task.id} divider>
          <ListItemText primary={progress.task.title} secondary={progress.task.description} />
          <div style={{width: '100%'}}>
            <LinearProgress
              variant="determinate"
              value={progress.status === 'completed' ? 100 : 50}
              style={{marginBottom: '8px'}}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleCompleteTask(progress.task.id)}
              disabled={progress.status === 'completed'}
            >
              {progress.status === 'completed' ? 'Completed' : 'Mark as Complete'}
            </Button>
          </div>
        </ListItem>
      ))}
    </List>
  );
};

export default LearningTasksList;
