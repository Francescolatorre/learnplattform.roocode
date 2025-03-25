import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import TaskView from '@components/TaskView';
import { useAuth } from '@features/auth/AuthContext';

const TaskViewPage = () => {
    const { courseId, taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user?.role !== 'student') {
        return (
            <Container maxWidth="md">
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h5" gutterBottom>Access Denied</Typography>
                    <Typography variant="body1" paragraph>
                        You do not have permission to view this page.
                    </Typography>
                    <Button variant="contained" color="primary" href="/dashboard">
                        Go to Dashboard
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!courseId || !taskId) {
        return (
            <Container maxWidth="md">
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h5" gutterBottom>Task Not Found</Typography>
                    <Typography variant="body1" paragraph>
                        The task you are looking for could not be found.
                    </Typography>
                    <Button variant="contained" color="primary" href={`/courses/${courseId}/tasks`}>
                        Back to Tasks
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`/courses/${courseId}/tasks`)}
                    >
                        Back to Tasks
                    </Button>
                </Box>

                <TaskView courseId={courseId} taskId={taskId} />
            </Box>
        </Container>
    );
};

export default TaskViewPage;
