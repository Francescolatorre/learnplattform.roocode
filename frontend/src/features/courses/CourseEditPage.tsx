import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert
} from '@mui/material';
import { fetchCourseDetails } from '../../services/courseService';
import { Course, CourseError } from '../../types/courseTypes';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

const CourseEditPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: string;
    visibility: string;
    learning_objectives: string;
    prerequisites: string;
  }>({
    title: '',
    description: '',
    status: 'DRAFT',
    visibility: 'PRIVATE',
    learning_objectives: '',
    prerequisites: ''
  });

  // Fetch course data on component mount
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const result = await fetchCourseDetails(courseId);

        if ('error' in result) {
          setError(result.error.message);
        } else {
          // Update form data with course details
          setFormData({
            title: result.title || '',
            description: result.description || '',
            status: (result.status || 'draft').toUpperCase(), // Convert to uppercase
            visibility: (result.visibility || 'private').toUpperCase(), // Convert to uppercase
            learning_objectives: result.learning_objectives || '',
            prerequisites: result.prerequisites || ''
          });
        }
      } catch (err) {
        setError('Failed to load course details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
    console.log(`Fetching course details for ID: ${courseId}`);
  }, [courseId]);

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
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');

      // Convert status and visibility back to lowercase for the API
      const apiFormData = {
        ...formData,
        status: formData.status.toLowerCase(),
        visibility: formData.visibility.toLowerCase()
      };

      const response = await axios.put(
        `${API_URL}/courses/${courseId}/`,
        apiFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(true);
      // Wait for the success message to show before navigating
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1500);

    } catch (err: any) {
      console.error('Failed to update course:', err);
      setError(err.response?.data?.detail || 'Failed to update course');
    } finally {
      setSaving(false);
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
      <Typography variant="h4" gutterBottom>Edit Course</Typography>

      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
                <FormHelperText>
                  Published courses are visible to enrolled students
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Visibility</InputLabel>
                <Select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleSelectChange}
                  label="Visibility"
                >
                  <MenuItem value="PRIVATE">Private</MenuItem>
                  <MenuItem value="PUBLIC">Public</MenuItem>
                  <MenuItem value="RESTRICTED">Restricted</MenuItem>
                </Select>
                <FormHelperText>
                  Controls who can discover and enroll in the course
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Learning Objectives"
                name="learning_objectives"
                value={formData.learning_objectives}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                placeholder="What students will learn from this course..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
                placeholder="Knowledge required before taking this course..."
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Success message */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Course updated successfully!
        </Alert>
      </Snackbar>

      {/* Error message */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseEditPage;
