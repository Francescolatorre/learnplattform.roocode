import React, {useState, useEffect} from 'react';
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
  Alert
} from '@mui/material';
import {useParams, useNavigate} from 'react-router-dom';

import {ICourse} from '@/types/course';
import {ILearningTask} from '@/types/task';
import {courseService} from '@/services/resources/courseService';
import learningTaskService, {updateTask} from '@/services/resources/learningTaskService';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import InfoCard from '@/components/shared/InfoCard';
import TaskCreation from '@/components/taskCreation/TaskCreation';
import CourseCreation from '@/components/courses/CourseCreation';
import {useNotification} from '@/components/Notifications/useNotification';
import {useQueryClient} from '@tanstack/react-query';

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

  const notify = useNotification();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      setTasks(tasks.map(task => task.id === savedTask.id ? savedTask : task));

      // Invalidate related queries so other views stay in sync
      if (courseId) {
        queryClient.invalidateQueries({queryKey: ['courseTasks', courseId]});
        queryClient.invalidateQueries({queryKey: ['learningTasks', courseId]});
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

      const updatedCourse = await courseService.updateCourse(courseId, courseData);
      // Update local state
      setCourse(updatedCourse);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({queryKey: ['courses']});
      queryClient.invalidateQueries({queryKey: ['course', courseId]});

      notify('Course updated successfully', 'success');
      handleCloseCourseEdit();
    } catch (err) {
      console.error('Failed to update course:', err);
      notify(err instanceof Error ? err.message : 'Failed to update course', 'error');
    }
  };

  const {courseId} = useParams<{courseId: string}>();
  const [course, setCourse] = useState<ICourse | null>(null);
  const [tasks, setTasks] = useState<ILearningTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const courseResult = await courseService.getCourseDetails(courseId);
        setCourse(courseResult);

        const tasksResponse = await learningTaskService.getAllTasksByCourseId(courseId);
        setTasks(tasksResponse.sort((a, b) => a.order - b.order));

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);


  if (isLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Alert severity="error" sx={{mt: 2}}>
        Error: {error || 'Course not found'}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{p: 3, mt: 3, mb: 3}}>
        {/* Header Section */}
        <Box sx={{mb: 3}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
            <Typography variant="h4" component="h1" sx={{fontWeight: 'bold'}}>
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
            <Box sx={{my: 2}}>
              <MarkdownRenderer content={course.description || ''} />
            </Box>
          ) : (
            <Typography variant="body1" paragraph>
              {course.description}
            </Typography>
          )}
        </Box>

        {/* Course Info Section */}
        {course && (
          <Grid container spacing={2} sx={{mb: 4}}>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard title="Created By">
                {course.instructor_name || 'Unknown'}
              </InfoCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard title="Status">
                {course.status || 'Not specified'}
              </InfoCard>
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
        <Box sx={{mt: 4}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
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
          <Divider sx={{mb: 2}} />

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
                      bgcolor: 'action.hover'
                    }
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
                        <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                          {task.description && task.description.length > 100
                            ? `${task.description.substring(0, 100)}...`
                            : task.description}
                        </Typography>
                        <Box sx={{mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap'}}>
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
                </ListItem>
              ))}
            </List>
          ) : (
            <Paper elevation={0} variant="outlined" sx={{p: 3, textAlign: 'center'}}>
              <Typography variant="body1" color="text.secondary">
                No tasks available for this course.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
                sx={{mt: 2}}
              >
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
        <DialogTitle>
          {selectedTask?.title || 'Task Details'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedTask && (
            <Box>
              {/* Task Description */}
              {selectedTask.description_html ? (
                <Box sx={{my: 2}}>
                  <MarkdownRenderer content={selectedTask.description || ''} />
                </Box>
              ) : (
                <Typography variant="body1" paragraph>
                  {selectedTask.description}
                </Typography>
              )}

              {/* Task Metadata */}
              <Box sx={{mt: 4}}>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Order:</strong> {selectedTask.order}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Published:</strong> {selectedTask.is_published ? 'Yes' : 'No'}
                </Typography>
                {selectedTask.created_at && (
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>Created At:</strong> {new Date(selectedTask.created_at).toLocaleString()}
                  </Typography>
                )}
                {selectedTask.updated_at && (
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>Updated At:</strong> {new Date(selectedTask.updated_at).toLocaleString()}
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
    </Container>
  );
};

export default InstructorCourseDetailPage;
