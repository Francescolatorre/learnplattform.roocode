
import {Navigate} from 'react-router-dom';
import {useAuth} from '@context/auth/authValidation';
import CourseService from '@services/resources/courseService';
import LearningTaskService, {
  deleteTask as deleteLearningTask,
  updateTask as updateLearningTask,
  createTask as createLearningTask,
} from '@services/resources/learningTaskService';
import {LearningTask, TaskCreationData} from 'src/types/common/entities';
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
  Snackbar,
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useNotification} from '../../components/ErrorNotifier/useErrorNotifier';
import {useNavigate, useParams} from 'react-router-dom';

// Create or Edit Task dialog props
interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Partial<LearningTask>) => void;
  task: Partial<LearningTask>;
  isEditing: boolean;
}

// Task Dialog Component
const TaskDialog: React.FC<TaskDialogProps> = ({open, onClose, onSave, task, isEditing}) => {
  const [formData, setFormData] = useState<Partial<LearningTask>>(task);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData((prev: Partial<LearningTask>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const {name, value} = e.target;
    setFormData((prev: Partial<LearningTask>) => ({
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
  const {isAuthenticated} = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [courseName, setCourseName] = useState('');
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<LearningTask>>({});
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
        const courseResult = await CourseService.fetchCourseById(parseInt(courseId, 10));
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
        setTasks(tasksResponse.sort((a: LearningTask, b: LearningTask) => a.order - b.order));
      } catch (err: any) {
        console.error('Failed to load course tasks:', err);
        notify(err.message || 'Failed to load course tasks', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCourseAndTasks();
  }, [courseId]);

  // Handle create new task
  const handleCreateTask = () => {
    setCurrentTask({
      title: '' as string & {maxLength: 200},
      description: '' as string & {maxLength: 500},
      is_published: false,
      order: tasks.length + 1,
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  // Handle edit task
  const handleEditTask = (task: LearningTask) => {
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
      await deleteLearningTask(taskToDelete);
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      notify('Task deleted successfully', 'success');
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      notify(err.message || 'Failed to delete task', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // Save task (create or update)
  const handleSaveTask = async (taskData: Partial<LearningTask>) => {
    try {
      if (isEditing && taskData.id) {
        // Update existing task
        const updatedTask = await updateLearningTask(taskData.id, {
          ...taskData,
          course: parseInt(courseId!, 10),
        });
        setTasks(tasks.map(task => (task.id === taskData.id ? updatedTask : task)));
        notify('Task updated successfully', 'success');
      } else {
        // Create new task
        const newTask = await createLearningTask({...taskData, course: parseInt(courseId!, 10)});
        setTasks([...tasks, newTask]);
        notify('Task created successfully', 'success');
      }
    } catch (err: any) {
      console.error('Failed to save task:', err);
      notify(err.message || 'Failed to save task', 'error');
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
          onClick={() => navigate(`/courses/${courseId}/edit`)}
          sx={{
            display: ['admin', 'instructor'].includes(useAuth().user?.role ?? '')
              ? 'block'
              : 'none',
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
                        <Typography variant="body2" color="text.primary" sx={{mb: 1, mt: 1}}>
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last updated: {new Date(task.updated_at).toLocaleDateString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    {['admin', 'instructor'].includes(useAuth().user?.role ?? '') && (
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


      {/* Error Snackbar */}
    </Box>
  );
};

export default CourseLearningTasksPage;
