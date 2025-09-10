import { Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
import { Container, Typography, Paper, Button, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import useNotification from '@/components/Notifications/useNotification';
import learningTaskService from '@/services/resources/learningTaskService';
import { ILearningTask } from '@/types';
import { useCourseTasks } from '@services/useCourseTasks';
import { DataTable } from 'src/components/shared';

const InstructorTasksPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useCourseTasks(courseId || '');
  const queryClient = useQueryClient();
  const notify = useNotification();
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ILearningTask | null>(null);
  const [progressCounts, setProgressCounts] = useState<Record<string, { inProgress: number; completed: number }>>({});

  // Load progress counts for all tasks
  React.useEffect(() => {
    if (data && data.length > 0) {
      const taskIds = data.map(task => String(task.id));
      learningTaskService.getTaskProgressCounts(taskIds)
        .then(counts => setProgressCounts(counts))
        .catch(err => console.error('Failed to load progress counts:', err));
    }
  }, [data]);

  const canDeleteTask = (task: ILearningTask): boolean => {
    const counts = progressCounts[String(task.id)];
    return !counts || (counts.inProgress === 0 && counts.completed === 0);
  };

  const getDeletionTooltip = (task: ILearningTask): string => {
    const counts = progressCounts[String(task.id)];
    if (!counts) return 'Loading...';
    
    if (counts.inProgress > 0 && counts.completed > 0) {
      return `Cannot delete: ${counts.inProgress} student(s) in progress and ${counts.completed} completed`;
    } else if (counts.inProgress > 0) {
      return `Cannot delete: ${counts.inProgress} student(s) in progress`;
    } else if (counts.completed > 0) {
      return `Cannot delete: ${counts.completed} student(s) completed`;
    }
    return 'Delete task';
  };

  const handleOpenDeleteConfirm = (task: ILearningTask) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await learningTaskService.delete(String(taskToDelete.id));
      
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['courseTasks', courseId] });
      await refetch();
      
      notify('Task deleted successfully', 'success');
      handleCloseDeleteConfirm();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete task', 'error');
    }
  };

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
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/instructor/courses/${courseId}/tasks/${row.id}/edit`)}
                  >
                    Edit
                  </Button>
                  {canDeleteTask(row) ? (
                    <Tooltip title="Delete task">
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteConfirm(row);
                        }}
                        size="small"
                        data-testid={`delete-task-${row.id}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={getDeletionTooltip(row)}>
                      <IconButton
                        disabled
                        size="small"
                        data-testid={`delete-task-disabled-${row.id}`}
                      >
                        <InfoIcon color="disabled" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ),
            },
          ]}
          keyExtractor={item => item.id.toString()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Task Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the task "{taskToDelete?.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            data-testid="confirm-delete-task"
          >
            Delete Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstructorTasksPage;
