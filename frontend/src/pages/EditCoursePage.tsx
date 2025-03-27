import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Container, TextField, Button, Typography, Paper } from '@mui/material';
import { useCourseData } from '@hooks/useCourseData';
import { useApiResource } from '@hooks/useApiResource';

const EditCoursePage: React.FC = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { data: course, isLoading, error } = useCourseData(courseId!);
    const { updateResource } = useApiResource('courses');
    const { register, handleSubmit, reset } = useForm({ defaultValues: course });

    React.useEffect(() => {
        if (course) reset(course);
    }, [course, reset]);

    const onSubmit = async (data: any) => {
        try {
            await updateResource(courseId!, data);
            navigate(`/courses/${courseId}`);
        } catch (err) {
            console.error('Failed to update course:', err);
        }
    };

    if (isLoading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>Error: {error.message}</Typography>;

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Edit Course</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField {...register('title')} label="Title" fullWidth margin="normal" />
                    <TextField {...register('description')} label="Description" fullWidth margin="normal" />
                    <Button type="submit" variant="contained" color="primary">Save</Button>
                </form>
            </Paper>
        </Container>
    );
};

export default EditCoursePage;
