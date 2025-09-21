import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import CourseCreation from '@/components/courses/CourseCreation';
import useNotification from '@/components/Notifications/useNotification';
import InfoCard from '@/components/shared/InfoCard';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import TaskCreation from '@/components/taskCreation/TaskCreation';
import { updateTask } from '@/services/resources/learningTaskService';
import { modernCourseService } from '@/services/resources/modernCourseService';
import { modernLearningTaskService } from '@/services/resources/modernLearningTaskService';
import { ICourse } from '@/types/course';
import { ILearningTask } from '@/types/Task';

// Hauptkomponente
const InstructorCourseDetailPage: React.FC = () => {
  // State for task creation modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State for task details modal
  const [selectedTask, setSelectedTask] = useState<ILearningTask | null>(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState<boolean>(false);

  // State for course edit modal
  const [isCourseEditModalOpen, setIsCourseEditModalOpen] = useState<boolean>(false);

  // State for task edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<ILearningTask | null>(null);

  // State for task deletion
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<ILearningTask | null>(null);
  const [taskProgressCounts, setTaskProgressCounts] = useState<
    Record<string, { inProgress: number; completed: number }>
  >({});

  const notify = useNotification();
  const queryClient = useQueryClient();
  // const navigate = useNavigate(); // Removed unused variable

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handler for task creation that refetches tasks after successful creation
  const handleTaskCreate = async (taskData: Partial<ILearningTask>) => {
    // Ensure course ID is included in task data
    const taskWithCourse = {
      ...taskData,
      course: Number(courseId),
      title: taskData.title || '',
      description: taskData.description || '',
    };

    // Create the task using the service
    await modernLearningTaskService.createTask(taskWithCourse);
    // Refetch tasks to update the UI
    const tasksResponse = await modernLearningTaskService.getAllTasksByCourseId(courseId!);
    setTasks(tasksResponse.sort((a, b) => a.order - b.order));
  };

  // Handle opening task details modal
  const handleOpenTaskDetails = (task: ILearningTask) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  // Handle closing task details modal
  const handleCloseTaskDetails = () => {
    setIsTaskDetailsModalOpen(false);
    setSelectedTask(null);
  };

  // Handle opening edit task modal
  const handleOpenEditModal = (task: ILearningTask) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
    // Close the details modal if it's open
    setIsTaskDetailsModalOpen(false);
  };

  // Handle closing edit task modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTaskToEdit(null);
  };

  // Handle saving edited task
  const handleSaveTask = async (updatedTask: Partial<ILearningTask>) => {
    try {
      if (!updatedTask.id) {
        notify('Task ID is missing', 'error');
        return;
      }

      const savedTask = await updateTask(String(updatedTask.id), updatedTask);

      // Update the tasks list with the saved task
      setTasks(tasks.map(task => (task.id === savedTask.id ? savedTask : task)));

      // Invalidate related queries so other views stay in sync
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['courseTasks', courseId] });
        queryClient.invalidateQueries({ queryKey: ['learningTasks', courseId] });
      }

      notify('Task updated successfully', 'success');
      handleCloseEditModal();
    } catch (err) {
      console.error('Failed to update task:', err);
      notify(err instanceof Error ? err.message : 'Failed to update task', 'error');
    }
  };

  // Update course handler
  const handleOpenCourseEdit = () => {
    setIsCourseEditModalOpen(true);
  };

  const handleCloseCourseEdit = () => {
    setIsCourseEditModalOpen(false);
  };

  const handleSaveCourse = async (courseData: Partial<ICourse>) => {
    try {
      if (!courseId) return;

      const updatedCourse = await modernCourseService.updateCourse(courseId, courseData);
      // Update local state
      setCourse(updatedCourse);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });

      notify('Course updated successfully', 'success');
      handleCloseCourseEdit();
    } catch (err) {
      console.error('Failed to update course:', err);
      notify(err instanceof Error ? err.message : 'Failed to update course', 'error');
    }
  };

  // Handle task deletion confirmation
  const handleOpenDeleteConfirm = (task: ILearningTask) => {
    setTaskToDelete(task);
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await modernLearningTaskService.deleteTask(String(taskToDelete.id));

      // Remove the task from the local state
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));

      // Invalidate related queries
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['courseTasks', courseId] });
        queryClient.invalidateQueries({ queryKey: ['learningTasks', courseId] });
      }

      notify('Task deleted successfully', 'success');
      handleCloseDeleteConfirm();
    } catch (err) {
      console.error('Failed to delete task:', err);
      notify(err instanceof Error ? err.message : 'Failed to delete task', 'error');
    }
  };

  // Check if task can be deleted (no student progress)
  const canDeleteTask = (task: ILearningTask): boolean => {
    const progressCount = taskProgressCounts[String(task.id)];
    if (!progressCount) return true; // No progress data means no students started
    return progressCount.inProgress === 0 && progressCount.completed === 0;
  };

  // Get tooltip text for non-deletable tasks
  const getDeletionTooltip = (task: ILearningTask): string => {
    const progressCount = taskProgressCounts[String(task.id)];
    if (!progressCount) return '';

    const { inProgress, completed } = progressCount;
    const total = inProgress + completed;
    if (total === 0) return '';

    const parts = [];
    if (inProgress > 0) parts.push(`${inProgress} in progress`);
    if (completed > 0) parts.push(`${completed} completed`);

    return `Cannot delete: ${parts.join(', ')} (${total} student${total === 1 ? '' : 's'})`;
  };

  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [tasks, setTasks] = useState<ILearningTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extract fetchCourseDetails so it can be used for refetching after task creation
  const fetchCourseDetails = async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      const courseResult = await modernCourseService.getCourseDetails(Number(courseId));
      setCourse(courseResult);

      const tasksResponse = await modernLearningTaskService.getAllTasksByCourseId(courseId);
      const sortedTasks = tasksResponse.sort((a, b) => a.order - b.order);
      setTasks(sortedTasks);

      // Fetch progress counts for all tasks
      // Note: getTaskProgressCounts not available in modern service, keeping empty for now
      const progressCounts = {};
      setTaskProgressCounts(progressCounts);

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch course details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {error || 'Course not found'}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: 3, mt: 3, mb: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {course.title}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCourseEdit}
              data-testid="edit-course-button"
            >
              Edit Course
            </Button>
          </Box>

          {/* Course Description */}
          {course.description_html ? (
            <Box sx={{ my: 2 }}>
              <MarkdownRenderer
                data-testid="markdown-renderer"
                content={course.description || ''}
              />
            </Box>
          ) : (
            <Typography variant="body1" paragraph>
              {course.description}
            </Typography>
          )}
        </Box>

        {/* Course Info Section */}
        {course && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard title="Created By">{course.instructor_name || 'Unknown'}</InfoCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard title="Status">{course.status || 'Not specified'}</InfoCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard title="Prerequisites">
                {Array.isArray(course.prerequisites)
                  ? course.prerequisites.join(', ')
                  : course.prerequisites || 'None'}
              </InfoCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard title="Learning Objectives">
                {Array.isArray(course.learning_objectives)
                  ? course.learning_objectives.join(', ')
                  : course.learning_objectives || 'No learning objectives specified'}
              </InfoCard>
            </Grid>
          </Grid>
        )}

        {/* Tasks Section */}
        <Box sx={{ mt: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h5" component="h2">
              Course Tasks
            </Typography>
            <Button
              data-testid="button-create-task"
              variant="contained"
              color="primary"
              onClick={handleOpenModal}
              size="small"
            >
              Create Task
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {tasks.length > 0 ? (
            <List disablePadding>
              {tasks.map(task => (
                <ListItem
                  key={task.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleOpenTaskDetails(task)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {task.description && task.description.length > 100
                            ? `${task.description.substring(0, 100)}...`
                            : task.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={`Order: ${task.order}`}
                            color="default"
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={task.is_published ? 'Published' : 'Draft'}
                            color={task.is_published ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                      </>
                    }
                  />

                  {/* Task Action Buttons */}
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {canDeleteTask(task) ? (
                      <Tooltip title="Delete task">
                        <IconButton
                          color="error"
                          onClick={e => {
                            e.stopPropagation(); // Prevent opening task details
                            handleOpenDeleteConfirm(task);
                          }}
                          size="small"
                          data-testid={`delete-task-${task.id}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={getDeletionTooltip(task)}>
                        <IconButton
                          disabled
                          size="small"
                          data-testid={`delete-task-disabled-${task.id}`}
                        >
                          <InfoIcon color="disabled" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No tasks available for this course.
              </Typography>
              <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 2 }}>
                Create Your First Task
              </Button>
            </Paper>
          )}
        </Box>
      </Paper>

      {/* Course Edit Modal */}
      <CourseCreation
        open={isCourseEditModalOpen}
        course={course || undefined}
        isEditing={true}
        onClose={handleCloseCourseEdit}
        onSave={handleSaveCourse}
      />

      {/* TaskCreation modal for creating new tasks */}
      <TaskCreation
        open={isModalOpen}
        onClose={handleCloseModal}
        courseId={courseId}
        onSave={handleTaskCreate}
      />

      {/* TaskCreation modal for editing existing tasks */}
      <TaskCreation
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        courseId={courseId}
        task={taskToEdit || {}}
        isEditing={true}
        onSave={handleSaveTask}
      />

      {/* Task Details Modal */}
      <Dialog
        open={isTaskDetailsModalOpen}
        onClose={handleCloseTaskDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedTask?.title || 'Task Details'}</DialogTitle>
        <DialogContent dividers>
          {selectedTask && (
            <Box>
              {/* Task Description */}
              {selectedTask.description_html ? (
                <Box sx={{ my: 2 }}>
                  <MarkdownRenderer
                    data-testid="markdown-renderer"
                    content={selectedTask.description || ''}
                  />
                </Box>
              ) : (
                <Typography variant="body1" paragraph>
                  {selectedTask.description}
                </Typography>
              )}

              {/* Task Metadata */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Order:</strong> {selectedTask.order}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Published:</strong> {selectedTask.is_published ? 'Yes' : 'No'}
                </Typography>
                {selectedTask.created_at && (
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>Created At:</strong>{' '}
                    {new Date(selectedTask.created_at).toLocaleString()}
                  </Typography>
                )}
                {selectedTask.updated_at && (
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>Updated At:</strong>{' '}
                    {new Date(selectedTask.updated_at).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDetails}>Close</Button>
          {selectedTask && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenEditModal(selectedTask)}
            >
              Edit Task
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Task Deletion Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Task Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to delete the task &quot;{taskToDelete?.title}&quot;?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The task will be permanently removed from the course.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">
            Cancel
          </Button>
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

export default InstructorCourseDetailPage;
