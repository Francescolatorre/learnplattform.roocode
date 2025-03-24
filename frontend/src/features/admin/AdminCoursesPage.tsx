import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Alert, Grid, Card, CardContent, Button } from '@mui/material';
import { fetchCourses } from '../../services/courseService';

const AdminCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourses = async () => {
            setIsLoading(true);
            try {
                const data = await fetchCourses('admin'); // Fetch courses for admin
                setCourses(Array.isArray(data) ? data : []); // Ensure data is an array
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch courses:', err);
                setError('Failed to load courses.');
            } finally {
                setIsLoading(false);
            }
        };

        loadCourses();
    }, []);

    if (isLoading) {
        return (
            <Container>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Admin Courses
            </Typography>
            {courses.length === 0 ? (
                <Typography>No courses available.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{course.title}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {course.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        href={`/admin/courses/${course.id}/edit`}
                                        sx={{ mt: 2 }}
                                    >
                                        Edit
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default AdminCoursesPage;
