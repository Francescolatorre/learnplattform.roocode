import React, {useEffect} from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import {useForm, Controller, SubmitHandler} from 'react-hook-form';
import {useNavigate, useParams} from 'react-router-dom';
import {useMutation, useQueryClient, useQuery} from '@tanstack/react-query';

import {useAuth} from '@context/auth/AuthContext';
import {courseService} from '@services/resources/courseService';
import {useNotification} from '@components/ErrorNotifier/useErrorNotifier';
import {ICourse} from '@/types/course';

interface IEditCourseProps {
  isNew?: boolean;
}

interface ICourseFormData {
  title: string;
  description: string;
  is_published?: boolean;
  image_url?: string;
  category?: string;
  difficulty_level?: string;
}

/**
 * EditCourse component for creating or editing courses
 * Supports both new course creation and existing course editing
 */
const EditCoursePage: React.FC<IEditCourseProps> = ({isNew = false}) => {
  const {courseId} = useParams<{courseId: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const notify = useNotification();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: {errors, isValid}
  } = useForm<ICourseFormData>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      is_published: false,
      image_url: '',
      category: '',
      difficulty_level: 'beginner'
    }
  });

  // Role-based access control
  useEffect(() => {
    if (user?.role !== 'instructor' && user?.role !== 'admin') {
      notify('You do not have permission to edit courses', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate, notify]);

  // Fetch course data if editing an existing course
  const {data: courseData, isLoading: isLoadingCourse} = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseDetails(courseId as string),
    enabled: !isNew && !!courseId,
    onError: (error: any) => {
      notify(error.message || 'Failed to load course data', 'error');
    }
  });

  // Reset form when course data is loaded
  useEffect(() => {
    if (courseData && !isNew) {
      reset({
        title: courseData.title || '',
        description: courseData.description || '',
        is_published: courseData.is_published || false,
        image_url: courseData.image_url || '',
        category: courseData.category || '',
        difficulty_level: courseData.difficulty_level || 'beginner'
      });
    }
  }, [courseData, reset, isNew]);

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

      // Show success notification
      notify(
        isNew ? 'Course created successfully!' : 'Course updated successfully!',
        'success'
      );

      // Navigate to appropriate page
      if (isNew) {
        navigate(`/instructor/courses/${data.id}`);
      } else {
        navigate(`/instructor/courses/${courseId}`);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail ||
        error.message ||
        'Failed to save course';
      notify(errorMessage, 'error');
    }
  });

  // Form submission handler
  const onSubmit: SubmitHandler<ICourseFormData> = (data) => {
    mutation.mutate(data);
  };

  if (isLoadingCourse && !isNew) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{p: 4, mt: 3}}>
        <Typography variant="h5" gutterBottom>
          {isNew ? 'Create New Course' : 'Edit Course'}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('title', {
              required: 'Title is required',
              minLength: {value: 5, message: 'Title must be at least 5 characters'}
            })}
            label="Course Title"
            fullWidth
            margin="normal"
            error={!!errors.title}
            helperText={errors.title?.message}
            disabled={mutation.isPending}
          />

          <TextField
            {...register('description', {
              required: 'Description is required',
              minLength: {value: 10, message: 'Description must be at least 10 characters'},
              maxLength: {value: 1000, message: 'Description cannot exceed 1000 characters'}
            })}
            label="Course Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            error={!!errors.description}
            helperText={errors.description?.message}
            disabled={mutation.isPending}
          />

          <TextField
            {...register('image_url')}
            label="Course Image URL"
            fullWidth
            margin="normal"
            error={!!errors.image_url}
            helperText={errors.image_url?.message}
            disabled={mutation.isPending}
          />

          <Box sx={{display: 'flex', gap: 2, mt: 2}}>
            <TextField
              {...register('category')}
              label="Category"
              fullWidth
              margin="normal"
              error={!!errors.category}
              helperText={errors.category?.message}
              disabled={mutation.isPending}
            />

            <TextField
              {...register('difficulty_level')}
              label="Difficulty Level"
              fullWidth
              margin="normal"
              select
              SelectProps={{native: true}}
              disabled={mutation.isPending}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </TextField>
          </Box>

          <Controller
            name="is_published"
            control={control}
            render={({field}) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={mutation.isPending}
                  />
                }
                label="Publish Course"
              />
            )}
          />

          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3}}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={mutation.isPending || !isValid}
              startIcon={mutation.isPending ? <CircularProgress size={20} /> : null}
            >
              {isNew ? 'Create Course' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditCoursePage;
