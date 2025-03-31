import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useForm, SubmitHandler} from 'react-hook-form';
import {Container, TextField, Button, Typography, Paper, Box, CircularProgress, Alert} from '@mui/material';

import CourseService from '../services/courseService';

import {useCourses} from '@hooks/useApiResource';
import {useAuth} from '@features/auth';

// Define the form data type
interface ICourseFormData {
    title: string;
    description: string;
}

const InstructorEditCoursePage: React.FC = () => {
    const {courseId} = useParams<{courseId: string}>();
    const navigate = useNavigate();
    const {data: course, loading: isLoading, error, refetch} = useCourses.useResource(courseId!);
    const {register, handleSubmit, reset, formState: {errors}} = useForm<ICourseFormData>();
    const {user} = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

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

    // Handle form submission
    const onSubmit: SubmitHandler<ICourseFormData> = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await CourseService.updateCourse(Number(courseId)!, data);
            navigate(`/courses/${courseId}`);
        } catch (err) {
            setSubmitError((err as any)?.message || 'Failed to update course. Please try again.');
            console.error('Failed to update course:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error: {error}</Alert>;

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
                        {...register('description', {maxLength: {value: 500, message: 'Description is too long'}})}
                        label="Description"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                    />
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                        <Button type="submit" variant="contained" color="primary"
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
