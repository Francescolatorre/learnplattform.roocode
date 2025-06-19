import { Container, Typography, Paper, Button, CircularProgress } from '@mui/material';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ILearningTask } from '@/types';
import { useCourseTasks } from '@services/useCourseTasks';
import { DataTable } from 'src/components/shared';

const InstructorTasksPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCourseTasks(courseId || '');

  if (!courseId) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Course Not Found
          </Typography>
          <Typography variant="body1">
            The course you are looking for could not be found.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Manage Tasks for Course {courseId}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/instructor/courses/${courseId}/tasks/new`)}
        sx={{ mb: 2 }}
      >
        Add New Task
      </Button>
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Typography>
          Error loading tasks: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      ) : (
        <DataTable
          data={data || []}
          columns={[
            { id: 'title', label: 'Title' },
            { id: 'description', label: 'Description' },
            { id: 'order', label: 'Order' },
            {
              id: 'actions',
              label: 'Actions',
              format: (value: unknown, row: ILearningTask) => (
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/instructor/courses/${courseId}/tasks/${row.id}/edit`)}
                >
                  Edit
                </Button>
              ),
            },
          ]}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </Container>
  );
};

export default InstructorTasksPage;
