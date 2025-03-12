import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCourseDetails } from '../../services/courseService';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

// Task type interface
interface Task {
  id: number;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Create or Edit Task dialog props
interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task: Partial<Task>;
  isEditing: boolean;
}

// Task Dialog Component
const TaskDialog: React.FC<TaskDialogProps> = ({ open, onClose, onSave, task, isEditing }) => {
  const [formData, setFormData] = useState<Partial<Task>>(task);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === 'true' // Convert string to boolean
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
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
const CourseTasksPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
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
        const courseResult = await fetchCourseDetails(courseId);
        if ('error' in courseResult) {
          setError(`Failed to load course: ${courseResult.error.message}`);
          return;
        }

        setCourseName(courseResult.title);

        // Fetch tasks for this course
        const token = localStorage.getItem('access_token');
        console.log('Fetching tasks for course ID:', courseId);
        const tasksResponse = await axios.get(`${API_URL}/learning-tasks/`, {
          params: { course: courseId },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('API response:', tasksResponse.data);

        // Handle different API response formats
        let taskData = [];
        if (Array.isArray(tasksResponse.data)) {
          taskData = tasksResponse.data;
        } else if (tasksResponse.data.results && Array.isArray(tasksResponse.data.results)) {
          taskData = tasksResponse.data.results;
        } else {
          console.warn('Unexpected API response format:', tasksResponse.data);
          taskData = [];
        }

        // Sort tasks by order
        const sortedTasks = [...taskData].sort((a: Task, b: Task) => a.order - b.order);
        setTasks(sortedTasks);

      } catch (err: any) {
        console.error('Failed to load course tasks:', err);
        setError(err.response?.data?.detail || 'Failed to load course tasks');
      } finally {
        setLoading(false);
      }
    };

    loadCourseAndTasks();
  }, [courseId]);

  // Handle create new task
  const handleCreateTask = () => {
    setCurrentTask({
      title: '',
      description: '',
      is_published: false,
      order: tasks.length + 1
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
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
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/learning-tasks/${taskToDelete}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove task from state
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      setSuccess('Task deleted successfully');

    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.detail || 'Failed to delete task');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // Save task (create or update)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      const token = localStorage.getItem('access_token');

      if (isEditing && taskData.id) {
        // Update existing task
        const response = await axios.put(
          `${API_URL}/learning-tasks/${taskData.id}/`,
          { ...taskData, course: parseInt(courseId!, 10) },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Update task in state
        setTasks(tasks.map(task =>
          task.id === taskData.id ? response.data : task
        ));

        setSuccess('Task updated successfully');
      } else {
        // Create new task
        const taskPayload = { ...taskData, course: parseInt(courseId!, 10) };
        console.log('Creating new task:', taskPayload);

        const response = await axios.post(
          `${API_URL}/learning-tasks/`,
          taskPayload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Create task response:', response.data);

        // Add new task to state
        setTasks([...tasks, response.data]);
        setSuccess('Task created successfully');
      }

    } catch (err: any) {
      console.error('Failed to save task:', err);
      setError(err.response?.data?.detail || 'Failed to save task');
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
            sx={{ mb: 2 }}
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
         sx={{ display: ['admin', 'instructor'].includes(localStorage.getItem('user_role') || '') ? 'block' : 'none' }}
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
              sx={{ mt: 2 }}
            >
              Create Your First Task
            </Button>
          </Box>
        ) : (
          <List>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 2 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="h6">{task.title}</Typography>
                        {!task.is_published && (
                          <Typography variant="caption" color="warning.main" sx={{ ml: 1, p: 0.5, bgcolor: 'warning.light', borderRadius: 1 }}>
                            Draft
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 1, mt: 1 }}>
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last updated: {new Date(task.updated_at).toLocaleDateString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    {['admin', 'instructor'].includes(localStorage.getItem('user_role') || '') && (
                      <React.Fragment>
                        <IconButton edge="end" onClick={() => handleEditTask(task)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeletePrompt(task.id)} sx={{ ml: 1 }}>
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

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseTasksPage;
