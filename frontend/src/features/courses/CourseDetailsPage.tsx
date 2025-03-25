import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { fetchCourseDetails } from '@services/courseService';

const CourseDetailsPage: React.FC = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourseDetails = async () => {
            try {
                setLoading(true);
                const { courseData } = await fetchCourseDetails(courseId!);
                setCourse(courseData);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching course details:', err);
                setError(err.message || 'Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadCourseDetails();
        }
    }, [courseId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                {error}
            </Alert>
        );
    }

    if (!course) {
        return (
            <Alert severity="info" sx={{ mb: 3 }}>
                Course details not available.
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {course.title}
            </Typography>
            <Typography variant="body1" paragraph>
                {course.description}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Learning Objectives:
            </Typography>
            <Typography variant="body2" paragraph>
                {course.learning_objectives || 'No learning objectives provided.'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Prerequisites:
            </Typography>
            <Typography variant="body2" paragraph>
                {course.prerequisites || 'No prerequisites provided.'}
            </Typography>
        </Box>
    );
};

export default CourseDetailsPage;
