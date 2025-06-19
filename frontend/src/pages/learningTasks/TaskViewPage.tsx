import { CircularProgress, Typography, Button, Box } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import { useTaskData } from 'src/services/useTaskData';
import { useTaskProgress, useUpdateTaskProgress } from 'src/services/useTaskProgress';

const TaskViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: taskRaw, isLoading, error } = useTaskData(String(id));
  const task = taskRaw as import('@/types/task').ILearningTask | undefined;
  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useTaskProgress(id ?? '');

  const updateTaskProgress = useUpdateTaskProgress(id ?? '');

  const handleTaskCompletion = () => {
    updateTaskProgress.mutate({ status: 'completed' });
  };

  if (isLoading || progressLoading) return <CircularProgress />;
  if (error || progressError)
    return <Typography color="error">Failed to load task or progress details.</Typography>;
  if (!task) {
    return <Typography color="error">Task not found.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4">{task.title}</Typography>
      <Typography variant="body1">{task.description}</Typography>
      <Box mt={2}>
        <Typography variant="subtitle1">
          Progress Status: <strong>{progress?.status ?? 'unknown'}</strong>
        </Typography>
        {typeof progress?.attempts === 'number' && (
          <Typography variant="subtitle2">
            Attempts: {progress.attempts}
            {progress.maxAttempts ? ` / ${progress.maxAttempts}` : ''}
          </Typography>
        )}
        {typeof progress?.score === 'number' && (
          <Typography variant="subtitle2">
            Score: {progress.score}
            {progress.maxScore ? ` / ${progress.maxScore}` : ''}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        onClick={handleTaskCompletion}
        disabled={progress?.status === 'completed' || updateTaskProgress.isPending}
        sx={{ mt: 2 }}
      >
        {progress?.status === 'completed' ? 'Completed' : 'Mark as Completed'}
      </Button>
      {updateTaskProgress.isError && (
        <Typography color="error" mt={1}>
          Failed to update progress.
        </Typography>
      )}
    </Box>
  );
};

export default TaskViewPage;
