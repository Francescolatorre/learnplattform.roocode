import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, LinearProgress } from '@mui/material';
import { fetchCourseDetails } from '@services/courseService';
import { fetchStudentProgressByCourse } from '@services/progressService';
import { useAuth } from '@features/auth/AuthContext';

interface Course {
    title: string;
    description: string;
    learning_objectives?: string;
    prerequisites?: string;
}

interface Progress {
    completionPercentage: number;
    completedTasks: number;
    totalTasks: number;
    averageScore: number;
}

const CourseDetailsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [progress, setProgress] = useState<Progress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourseData = async () => {
            if (!courseId) {
                setError('Course ID is missing.');
                setLoading(false);
                return;
            }

            try {
                if (user?.id) {
                    const progressData = await fetchStudentProgressByCourse(courseId, String(user.id));
                    if (progressData) {
                        setProgress(progressData);
                    } else {
                        const courseData = await fetchCourseDetails(courseId);
                        setCourse(courseData);
                    }
                    setError(null);
                } else {
                    const courseData = await fetchCourseDetails(courseId);
                    setCourse(courseData);
                    setError(null);
                }
            } catch (err: any) {
                console.error('Error fetching course or progress data:', err);
                setError(err.message || 'Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };

        loadCourseData();
    }, [courseId, user?.id]);

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
                Course details not available. <br/>Dude, where's my course?
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

            {progress ? (
                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Your Progress
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Box width="100%" mr={1}>
                            <LinearProgress variant="determinate" value={progress.completionPercentage} />
                        </Box>
                        <Box minWidth={35}>
                            <Typography variant="body2" color="textSecondary">
                                {`${Math.round(progress.completionPercentage)}%`}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2">
                        Completed Tasks: {progress.completedTasks} / {progress.totalTasks}
                    </Typography>
                    <Typography variant="body2">
                        Average Score: {progress.averageScore.toFixed(2)}
                    </Typography>
                </Box>
            ) : (
                <Alert severity="info" sx={{ mt: 3 }}>
                    You are not enrolled in this course. Enroll to track your progress.
                </Alert>
            )}
        </Box>
    );
};

export default CourseDetailsPage;
