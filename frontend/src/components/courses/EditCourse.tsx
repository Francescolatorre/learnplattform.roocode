import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

import {courseService} from '@/services/resources/courseService';
import {ICourse} from '@/types';
import {useApiErrors} from '@/hooks/useApiErrors';

interface IEditCourseProps {
  isNew?: boolean;
}

/**
 * Component for creating a new course or editing an existing course
 * Used by instructors to manage their courses
 *
 * @param isNew - Whether this is a new course (true) or editing an existing course (false)
 */
const EditCourse: React.FC<IEditCourseProps> = ({isNew = false}) => {
  const {courseId} = useParams<{courseId: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {handleApiError} = useApiErrors();

  const [formData, setFormData] = useState<Partial<ICourse>>({
    title: '',
    description: '',
    learning_objectives: '',
    prerequisites: '',
    status: 'draft',
    visibility: 'private',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch course data if editing an existing course
  const {
    data: courseData,
    isLoading: isLoadingCourse,
    error: courseError
  } = useQuery<ICourse>({
    queryKey: ['course', courseId],
    queryFn: () => courseService.fetchCourseById(courseId as string),
    enabled: !isNew && !!courseId,
    onSuccess: (data) => {
      setFormData({
        title: data.title,
        description: data.description,
        learning_objectives: data.learning_objectives,
        prerequisites: data.prerequisites,
        status: data.status,
        visibility: data.visibility,
      });
    },
    onError: (error) => {
      handleApiError(error, 'Failed to load course data');
    }
  });

  // Create or update course mutation
  const mutation = useMutation({
    mutationFn: (data: Partial<ICourse>) => {
      if (isNew) {
        return courseService.createCourse(data);
      } else {
        return courseService.updateCourse(courseId as string, data);
      }
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch course data
      queryClient.invalidateQueries({queryKey: ['courses']});
      queryClient.invalidateQueries({queryKey: ['course', courseId]});

      // Navigate to appropriate page
      if (isNew) {
        navigate(`/instructor/courses/${data.id}`);
      } else {
        navigate(`/instructor/courses/${courseId}`);
      }
    },
    onError: (error: any) => {
      if (error.response?.data) {
        // Extract validation errors from API response
        setFormErrors(error.response.data);
      }
      handleApiError(error, 'Failed to save course');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({...formErrors, [name]: ''});
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<{name?: string; value: unknown}>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormData({...formData, [name]: value});
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({...formErrors, [name]: ''});
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title) {
      errors.title = 'Title is required';
    }

    if (!formData.description) {
      errors.description = 'Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      mutation.mutate(formData);
    }
  };

  if (!isNew && isLoadingCourse) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isNew && courseError) {
    return (
      <Alert severity="error" sx={{m: 2}}>
        Failed to load course data. Please try again.
      </Alert>
    );
  }

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        {isNew ? 'Create New Course' : 'Edit Course'}
      </Typography>

      <Paper elevation={2} sx={{p: 3}}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                multiline
                rows={4}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Learning Objectives"
                name="learning_objectives"
                value={formData.learning_objectives || ''}
                onChange={handleInputChange}
                multiline
                rows={3}
                error={!!formErrors.learning_objectives}
                helperText={formErrors.learning_objectives}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prerequisites"
                name="prerequisites"
                value={formData.prerequisites || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
                error={!!formErrors.prerequisites}
                helperText={formErrors.prerequisites}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || 'draft'}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
                {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.visibility}>
                <InputLabel>Visibility</InputLabel>
                <Select
                  name="visibility"
                  value={formData.visibility || 'private'}
                  onChange={handleSelectChange}
                  label="Visibility"
                >
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="restricted">Restricted</MenuItem>
                </Select>
                {formErrors.visibility && <FormHelperText>{formErrors.visibility}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/instructor/courses')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <CircularProgress size={24} sx={{mr: 1}} />
                      Saving...
                    </>
                  ) : (
                    isNew ? 'Create Course' : 'Update Course'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditCourse;
