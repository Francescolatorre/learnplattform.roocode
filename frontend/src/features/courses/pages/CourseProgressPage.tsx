import React from 'react';
import {useParams} from 'react-router-dom';
import {CircularProgress, Typography, LinearProgress, List, ListItem} from '@mui/material';

import {useCourseProgress} from '@hooks/useCourseProgress';

interface Task {
  id: string;
  title: string;
  status: string;
}

const CourseProgressPage: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const {data: progress, isLoading, error} = useCourseProgress(id!);

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Failed to load course progress.</Typography>;

  return (
    <div>
      <div>
        <Typography variant="h4">Course Progress</Typography>
        {progress?.progress != null && <LinearProgress variant="determinate" value={progress.progress} />}
        <Typography variant="subtitle1">Tasks:</Typography>
        {progress?.tasks && progress?.tasks.length > 0 ? (
          <List>
            {progress.tasks.map((task: Task) => (
              <ListItem key={task.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: '1px solid #eee',
                alignItems: 'center',
              }}>
                <Typography>{task.title}</Typography>
                <div style={{
                  display: 'inline-flex',
                  gap: '8px',
                  alignItems: 'center',
                }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: task.status === 'completed' ? 'green' : 'red',
                      display: 'inline-block',
                    }}
                  />
                  <Typography style={{color: task.status === 'completed' ? 'green' : 'red'}}>{task.status}</Typography>
                </div>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" style={{marginTop: '16px'}}>No tasks to display.</Typography>
        )}
      </div>
    </div>
  );
};

export default CourseProgressPage;
