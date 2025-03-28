import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Button } from '@mui/material';
import { useCourseTasks } from '@hooks/useCourseTasks';
import { DataTable } from '@components/common/DataTable';

const AdminTasksPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { tasks, isLoading, error } = useCourseTasks(courseId!);

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
        Admin Tasks for Course {courseId}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/admin/courses/${courseId}/tasks/new`)}
        sx={{ mb: 2 }}
      >
        Add New Task
      </Button>
      {isLoading ? (
        <Typography>Loading tasks...</Typography>
      ) : error ? (
        <Typography>Error loading tasks: {error.message}</Typography>
      ) : (
        <DataTable
          rows={tasks}
          columns={[
            { field: 'title', headerName: 'Task Title' },
            {
              field: 'actions',
              headerName: 'Actions',
              renderCell: params => (
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/admin/courses/${courseId}/tasks/${params.row.id}/edit`)}
                >
                  Edit
                </Button>
              ),
            },
          ]}
        />
      )}
    </Container>
  );
};

export default AdminTasksPage;
