import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Chip,
    Alert,
    CircularProgress,
    Paper,
    Divider,
    LinearProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../features/auth/AuthContext';

const TaskView = ({ courseId, taskId }) => {
    const [task, setTask] = useState(null);
    const [taskProgress, setTaskProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [answer, setAnswer] = useState('');
    const [timeSpent, setTimeSpent] = useState(0); // in seconds
    const { user } = useAuth();

    // Timer for tracking time spent on task
    useEffect(() => {
        let timer;
        if (task && taskProgress?.status === 'in_progress') {
            timer = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
            // When component unmounts, update time spent if task was in progress
            if (task && taskProgress?.status === 'in_progress') {
                updateTimeSpent();
            }
        };
    }, [task, taskProgress]);

    useEffect(() => {
        // Fetch task details and progress
        const fetchTaskDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access_token');

                // Fetch task details
                const taskResponse = await axios.get(`/api/v1/learning-tasks/${taskId}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTask(taskResponse.data);

                // Fetch task progress
                const progressResponse = await axios.get(`/api/v1/task-progress/`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { task: taskId, user: user.id }
                });

                // If there's existing progress for this task
                if (progressResponse.data.length > 0) {
                    setTaskProgress(progressResponse.data[0]);

                    // If the task is in progress, set the existing time spent
                    if (progressResponse.data[0].status === 'in_progress') {
                        const existingTime = progressResponse.data[0].time_spent || 0;
                        // Time spent is returned as a string like "HH:MM:SS", convert to seconds
                        if (typeof existingTime === 'string') {
                            const [hours, minutes, seconds] = existingTime.split(':').map(Number);
                            setTimeSpent((hours * 3600) + (minutes * 60) + seconds);
                        } else {
                            setTimeSpent(existingTime);
                        }
                    }
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching task details:', err);
                setError('Failed to load task details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (taskId) {
            fetchTaskDetails();
        }
    }, [taskId, user.id]);

    // Start the task
    const handleStartTask = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('access_token');

            // Create or update task progress to "in_progress"
            if (taskProgress) {
                // Update existing progress
                await axios.patch(`/api/v1/task-progress/${taskProgress.id}/`,
                    { status: 'in_progress' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Create new progress
                const response = await axios.post('/api/v1/task-progress/',
                    {
                        task: taskId,
                        status: 'in_progress',
                        time_spent: 0
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTaskProgress(response.data);
            }

            setError(null);
            setSuccessMessage('Task started!');
        } catch (err) {
            console.error('Error starting task:', err);
            setError('Failed to start the task. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Submit the task as completed
    const handleSubmitTask = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('access_token');

            // Update time spent first
            await updateTimeSpent();

            // Update task progress to "completed"
            await axios.patch(`/api/v1/task-progress/${taskProgress.id}/`,
                {
                    status: 'completed',
                    // For quiz tasks, we might include answers or score here
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setTaskProgress(prev => ({
                ...prev,
                status: 'completed'
            }));

            setError(null);
            setSuccessMessage('Task completed successfully!');
        } catch (err) {
            console.error('Error completing task:', err);
            setError('Failed to submit the task. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Update time spent on the task
    const updateTimeSpent = async () => {
        try {
            if (!taskProgress) return;

            const token = localStorage.getItem('access_token');

            // Convert seconds to a format the API expects (might be ISO duration or seconds)
            await axios.patch(`/api/v1/task-progress/${taskProgress.id}/`,
                { time_spent: timeSpent },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Time spent updated:', timeSpent);
        } catch (err) {
            console.error('Error updating time spent:', err);
        }
    };

    // Format time for display (converts seconds to mm:ss format)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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

    if (!task) {
        return (
            <Alert severity="info">
                Task information not available.
            </Alert>
        );
    }

    return (
        <Box sx={{ mb: 4 }}>
            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            {task.title}
                        </Typography>

                        {taskProgress?.status && (
                            <Chip
                                label={taskProgress.status.replace('_', ' ')}
                                color={
                                    taskProgress.status === 'completed' ? 'success' :
                                        taskProgress.status === 'in_progress' ? 'warning' : 'default'
                                }
                            />
                        )}
                    </Box>

                    {taskProgress?.status === 'in_progress' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                                Time spent: {formatTime(timeSpent)}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(timeSpent / 600) * 100} // Assuming 10 minutes as 100%
                                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body1" paragraph>
                        {task.description}
                    </Typography>

                    {/* Task content would go here - could be quiz, assignment, etc. */}
                    <Paper elevation={1} sx={{ p: 3, my: 3, bgcolor: 'background.default' }}>
                        <Typography variant="body1">
                            Complete this task by following the instructions and submitting your work.
                        </Typography>

                        {/* For demonstration, using a simple text field for answers */}
                        <TextField
                            label="Your Answer"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={taskProgress?.status === 'completed'}
                        />
                    </Paper>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {!taskProgress || taskProgress.status === 'not_started' ? (
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={submitting}
                                onClick={handleStartTask}
                            >
                                {submitting ? 'Starting...' : 'Start Task'}
                            </Button>
                        ) : taskProgress.status === 'in_progress' ? (
                            <Button
                                variant="contained"
                                color="success"
                                disabled={submitting || !answer.trim()}
                                onClick={handleSubmitTask}
                            >
                                {submitting ? 'Submitting...' : 'Complete Task'}
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                color="primary"
                                href={`/courses/${courseId}`}
                            >
                                Back to Course
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TaskView;
