import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { format, parseISO } from 'date-fns'; // Importing format and parseISO
import React from 'react';

import { ITaskProgress } from '@/types/Task'; // Importing ITaskProgress

interface ExpandedTaskDetailsProps {
  task: ITaskProgress;
  formatTimeSpent: (seconds: number | null) => string;
  onStartTask: (taskId: string) => void;
}

const ExpandedTaskDetails: React.FC<ExpandedTaskDetailsProps> = ({
  task,
  formatTimeSpent,
  onStartTask,
}) => {
  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h6" gutterBottom component="div">
        Task Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Attempts
              </Typography>
              <Typography variant="h5" component="div">
                {task.attempts} / {task.maxAttempts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Time Spent
              </Typography>
              <Typography variant="h5" component="div">
                {formatTimeSpent(task.timeSpent !== null ? Number(task.timeSpent) : null)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Submission Date
              </Typography>
              <Typography variant="h5" component="div">
                {task.submissionDate
                  ? format(parseISO(task.submissionDate), 'MMM d, yyyy')
                  : 'Not submitted'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Module
              </Typography>
              <Typography variant="h5" component="div">
                {task.moduleId}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          disabled={task.status === 'completed' || task.status === 'graded'}
          onClick={() => onStartTask(String(task.task ?? ''))}
        >
          {task.status === 'not_started'
            ? 'Start Task'
            : task.status === 'in_progress'
              ? 'Continue Task'
              : 'View Details'}
        </Button>
      </Box>
    </Box>
  );
};

export default ExpandedTaskDetails;
