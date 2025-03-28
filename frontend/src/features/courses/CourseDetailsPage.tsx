import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, Card, CardContent, Divider, CircularProgress } from '@mui/material';
import { fetchCourseDetails, fetchLearningTasks } from '../../services/courseService';

interface ICourseDetails {
    id: string;
    title: string;
    description: string;
}

interface ITask {
    id: string;
    title: string;
    description: string;
    order: number;
}

const CourseDetailsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [courseDetails, setCourseDetails] = useState<ICourseDetails | null>(null);
    const [learningTasks, setLearningTasks] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourseDetails = async () => {
            try {
                if (!courseId) {
                    throw new Error('Course ID is missing.');
                }

                const details = await fetchCourseDetails(courseId);
                setCourseDetails(details);

                const tasks = await fetchLearningTasks(courseId);
                console.log('Fetched Learning Tasks:', tasks); // Debug log
                setLearningTasks(tasks);
            } catch (err: any) {
                console.error(`Error loading course details or learning tasks for courseId: ${courseId}`, err);
                setError(err.message || 'Failed to load course details or learning tasks.');
            } finally {
                setLoading(false);
            }
        };

        loadCourseDetails();
    }, [courseId]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                {courseDetails?.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {courseDetails?.description}
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                Learning Tasks
            </Typography>
            {Array.isArray(learningTasks) && learningTasks.length > 0 ? (
                <List>
                    {learningTasks
                        .sort((a, b) => a.order - b.order) // Sort tasks by order
                        .map((task) => (
                            <ListItem key={task.id} disablePadding sx={{ mb: 2 }}>
                                <Card variant="outlined" sx={{ width: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6">{task.title}</Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2" color="textSecondary">
                                            {task.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </ListItem>
                        ))}
                </List>
            ) : (
                <Typography variant="body2" color="textSecondary">
                    No learning tasks available for this course.
                </Typography>
            )}
        </Box>
    );
};

export default CourseDetailsPage;
