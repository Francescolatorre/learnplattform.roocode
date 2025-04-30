import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';

import {ILearningTask} from '@/types/task';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import LearningTaskService from 'src/services/resources/learningTaskService';



const TaskViewPage: React.FC = () => {
  const {taskId} = useParams<{taskId: string}>();
  const [task, setTask] = useState<ILearningTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        setError('Task ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const fetchedTask = await LearningTaskService.getById(taskId);
        setTask(fetchedTask);
      } catch (err) {
        console.error('Failed to fetch task:', err);
        setError('Failed to load the task.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{mt: 4, p: 2}}>
        <Typography color="error" variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{mt: 4, p: 2}}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{maxWidth: 1200, mx: 'auto', p: 2}}>
      <Paper sx={{p: 3, mb: 3}}>
        <Typography variant="h4" gutterBottom>{task.title}</Typography>
        <Divider sx={{my: 2}} />

        {/* Use the MarkdownRenderer component for the description */}
        <Box sx={{my: 2}}>
          {task.description_html ? (
            <MarkdownRenderer content={task.description} />
          ) : (
            <Typography variant="body1" paragraph>
              {task.description}
            </Typography>
          )}
        </Box>

        <Box sx={{mt: 4}}>
          <Typography variant="subtitle2" color="text.secondary">
            <strong>Order:</strong> {task.order}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            <strong>Published:</strong> {task.is_published ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            <strong>Created At:</strong> {new Date(task.created_at).toLocaleString()}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            <strong>Updated At:</strong> {new Date(task.updated_at).toLocaleString()}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskViewPage;
