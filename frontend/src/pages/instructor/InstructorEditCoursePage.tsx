import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';
import {useParams, useNavigate} from 'react-router-dom';

import {useAuth} from '@context/auth/AuthContext';
import {useCourse} from '@utils/useApiResource';
import {courseService} from 'src/services/resources/courseService';

import {useNotification} from '../../components/ErrorNotifier/useErrorNotifier';


// Define the form data type
interface ICourseFormData {
  title: string;
  description: string;
}

const InstructorEditCoursePage: React.FC = () => {
  const {courseId} = useParams<{courseId: string}>();
  const navigate = useNavigate();
  // Removed unused variable 'refetch'
  const {data: course, isLoading, error} = useCourse(courseId);
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<ICourseFormData>();
  const {user} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotification();

  // Reset form values when course data is loaded
  useEffect(() => {
    if (user?.role !== 'instructor' && user?.role !== 'admin') {
      navigate('/dashboard'); // Redirect if not authorized
    }
  }, [user, navigate]);

  // Reset form values when course data is loaded
  useEffect(() => {
    if (course) {
      reset({
        title: course.title || '',
        description: course.description || '',
      });
    }
  }, [course, reset]);

  // Fixed conditional React Hook usage
  useEffect(() => {
    if (error) {
      notify(typeof error === 'string' ? error : 'An error occurred while loading the course.', 'error');
    }
    // Only notify when error changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Handle form submission
  const onSubmit: SubmitHandler<ICourseFormData> = async data => {
    setIsSubmitting(true);
    // No local submit error state; errors are handled via notify

    try {
      await courseService.updateCourse(String(courseId), data);
      navigate(`/courses/${courseId}`);
    } catch (err: unknown) {
      const errorMessage = (err as {message: string})?.message || 'Failed to update course. Please try again.';
      notify(errorMessage, 'error');
      console.error('Failed to update course:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Container maxWidth="sm">
      <Paper sx={{p: 3}}>
        <Typography variant="h5" gutterBottom>
          Edit Course
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('title', {required: 'Title is required'})}
            label="Title"
            fullWidth
            margin="normal"
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            {...register('description', {
              maxLength: {value: 500, message: 'Description is too long'},
            })}
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              Save
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default InstructorEditCoursePage;
