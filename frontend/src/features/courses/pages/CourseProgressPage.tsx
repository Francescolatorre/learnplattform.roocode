import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourseProgress } from '@hooks/useCourseProgress';
import { CircularProgress, Typography, LinearProgress, List, ListItem } from '@mui/material';

const CourseProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: progress, isLoading, error } = useCourseProgress(id);

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Failed to load course progress.</Typography>;

  return (
    <div>
      <Typography variant="h4">Course Progress</Typography>
      <LinearProgress variant="determinate" value={progress.overallProgress} />
      <Typography variant="subtitle1">Tasks:</Typography>
      <List>
        {progress.tasks.map((task: any) => (
          <ListItem key={task.id}>
            <Typography>{task.title}</Typography>
            <Typography>{task.status}</Typography>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default CourseProgressPage;
