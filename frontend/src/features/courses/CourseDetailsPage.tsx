import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCourseDetails, CourseService } from '../../services/courseService';
import { Typography, CircularProgress, Card, CardContent, List, ListItem, ListItemText, Divider, Box } from '@mui/material';

interface ICourseDetails {
    id: string;
    title: string;
    description: string;
    // Add other course fields as needed
}

interface ITask {
    id: string;
    title: string;
    description: string;
}

const CourseDetailsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [courseDetails, setCourseDetails] = useState<ICourseDetails | null>(null);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourseDetails = async () => {
            console.log(`Loading course details for courseId: ${courseId}`);
            try {
                if (!courseId) {
                    throw new Error('Course ID is missing.');
                }

                const details = await fetchCourseDetails(courseId, true);
                if (!details.title) {
                    throw new Error('Course title is missing.');
                }
                console.log('Course details loaded successfully:', details);
                setCourseDetails(details);

                const courseTasks = await CourseService.getTasks(courseId);
                console.log(`Tasks for courseId ${courseId} loaded successfully:`, courseTasks);
                setTasks(courseTasks);
            } catch (err: any) {
                console.error(`Error loading course details or tasks for courseId: ${courseId}`, err);
                setError(err.message || 'Failed to load course details.');
            } finally {
                setLoading(false);
                console.log(`Finished loading course details for courseId: ${courseId}`);
            }
        };

        loadCourseDetails();
    }, [courseId]);

    if (loading) {
        console.log('Loading state active...');
        return <CircularProgress />;
    }

    if (error) {
        console.error('Error state:', error);
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ padding: 4 }}>
            <Card sx={{ marginBottom: 4 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {courseDetails?.title}
                    </Typography>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Tasks
                    </Typography>
                    {tasks.length > 0 ? (
                        <List>
                            {tasks.map((task) => (
                                <React.Fragment key={task.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={task.description}
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body1" color="textSecondary">
                            No tasks available for this course.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default CourseDetailsPage;
