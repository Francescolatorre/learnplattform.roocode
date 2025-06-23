import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {useNavigate, useParams} from 'react-router-dom';

import useNotification from '@/components/Notifications/useNotification';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import {ILearningTask} from '@/types/task';
import {useAuth} from '@context/auth/AuthContext';
import {courseService} from '@services/resources/courseService';
import LearningTaskService, {
  deleteTask as deleteLearningTask,
  updateTask as updateLearningTask,
  createTask as createLearningTask,
} from '@services/resources/learningTaskService';

// Create or Edit Task dialog props
interface ITaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Partial<ILearningTask>) => void;
  task: Partial<ILearningTask>;
  isEditing: boolean;
}

// Task Dialog Component
const TaskDialog: React.FC<ITaskDialogProps> = ({open, onClose, onSave, task, isEditing}) => {
  const [formData, setFormData] = useState<Partial<ILearningTask>>(task);
  useEffect(() => {
    setFormData(task);
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData((prev: Partial<ILearningTask>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const {name, value} = e.target;
    setFormData((prev: Partial<ILearningTask>) => ({
      ...prev,
      [name]: value === 'true', // Convert string to boolean
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Learning Task'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{mt: 2}}>
          <TextField
            fullWidth
            required
            label="Title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            margin="normal"
            inputProps={{maxLength: 200}}
            helperText="Title of the task (max 200 characters)"
          />

          <TextField
            fullWidth
            required
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            inputProps={{maxLength: 1500}}
            helperText="Description of the task. Supports Markdown formatting (max 1500 characters)"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="published-label">Published</InputLabel>
            <Select
              labelId="published-label"
              name="is_published"
              value={formData.is_published?.toString() || 'false'}
              onChange={handleSelectChange}
              label="Published"
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Order"
            name="order"
            type="number"
            value={formData.order || 0}
            onChange={handleChange}
            margin="normal"
            helperText="Order in which this task appears in the course"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const CourseLearningTasksPage: React.FC = () => {
  const {courseId} = useParams<{courseId: string}>();
  const navigate = useNavigate();
  const {user, isAuthenticated} = useAuth();
  const canEdit = ['admin', 'instructor'].includes(user?.role ?? '');

  const [courseName, setCourseName] = useState('');
  const [tasks, setTasks] = useState<ILearningTask[]>([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<ILearningTask>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Fetch course and tasks
  useEffect(() => {
    const loadCourseAndTasks = async () => {
      if (!courseId) return;

      try {
        setLoading(true);

        // Fetch course details
        const courseResult = await courseService.getCourseDetails(courseId);
        if (
          'error' in courseResult &&
          courseResult.error &&
          typeof courseResult.error === 'object' &&
          'message' in courseResult.error
        ) {
          notify(`Failed to load course: ${courseResult.error.message}`, 'error');
          return;
        }

        setCourseName(courseResult.title);

        // Fetch tasks for this course
        const tasksResponse = await LearningTaskService.getAll({courseId: courseId});
        setTasks(tasksResponse.sort((a: ILearningTask, b: ILearningTask) => a.order - b.order));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to load course tasks:', errorMessage);
        notify(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCourseAndTasks();
  }, [courseId, notify]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle create new task
  const handleCreateTask = () => {
    setCurrentTask({
      title: '',
      description: '',
      is_published: false,
      order: tasks.length + 1,
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  // Handle edit task
  const handleEditTask = (task: ILearningTask) => {
    setCurrentTask(task);
    setIsEditing(true);
    setDialogOpen(true);
  };

  // Handle delete task
  const handleDeletePrompt = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  // Confirm task deletion
  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteLearningTask(String(taskToDelete));
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      notify('Task deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete task:', errorMessage);
      notify(errorMessage, 'error');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // Save task (create or update)
  const handleSaveTask = async (taskData: Partial<ILearningTask>) => {
    try {
      if (isEditing && taskData.id) {
        // Update existing task
        const updatedTask = await updateLearningTask(String(taskData.id), {
          ...taskData,
          course: parseInt(courseId!, 10),
        });
        setTasks(tasks.map(task => (task.id === taskData.id ? updatedTask : task)));
        notify('Task updated successfully', 'success');
      } else {
        // Create new task
        const {id, ...taskDataWithoutId} = taskData;
        const newTask = await createLearningTask({
          ...taskDataWithoutId,
          course: Number(courseId!),
        });
        setTasks([...tasks, newTask]);
        notify('Task created successfully', 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to save task:', errorMessage);
      notify(errorMessage, 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/courses/${courseId}`)}
            sx={{mb: 2}}
          >
            Back to Course
          </Button>
          <Typography variant="h4">Tasks for: {courseName}</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateTask}
          sx={{
            display: canEdit ? 'block' : 'none',
          }}
        >
          Add Task
        </Button>
      </Box>

      <Paper elevation={2}>
        {tasks.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              No tasks have been created for this course yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
              sx={{mt: 2}}
            >
              Create Your First Task
            </Button>
          </Box>
        ) : (
          <List>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{py: 2}}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="h6">{task.title}</Typography>
                        {!task.is_published && (
                          <Typography
                            variant="caption"
                            color="warning.main"
                            sx={{ml: 1, p: 0.5, bgcolor: 'warning.light', borderRadius: 1}}
                          >
                            Draft
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        {task.description_html ? (
                          <Box sx={{my: 1}}>
                            <MarkdownRenderer content={task.description} />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.primary" sx={{mb: 1, mt: 1}}>
                            {task.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Last updated: {new Date(task.updated_at).toLocaleDateString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    {isAuthenticated && (
                      <React.Fragment>
                        <IconButton edge="end" onClick={() => handleEditTask(task)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeletePrompt(task.id)}
                          sx={{ml: 1}}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </React.Fragment>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveTask}
        task={currentTask}
        isEditing={isEditing}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseLearningTasksPage;
