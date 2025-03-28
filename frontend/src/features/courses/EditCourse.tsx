import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Typography, Box, TextField, MenuItem, CircularProgress, Alert } from '@mui/material';
import { fetchCourseDetails, updateCourseDetails } from '../../services/courseService';
import { useAuth } from '@features/auth/AuthContext'; // Use useAuth for authentication

const EditCourse: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const userRole = localStorage.getItem('user_role');

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        status: '',
        visibility: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            try {
                const data = await fetchCourseDetails(courseId!);
                setCourseData({
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    visibility: data.visibility,
                });
                setError(null);
            } catch (err: any) {
                if (err.message === 'Unauthorized') {
                    try {
                        await refreshToken(); // Refresh token if unauthorized
                        const data = await fetchCourseDetails(courseId!); // Retry fetching course details
                        setCourseData({
                            title: data.title,
                            description: data.description,
                            status: data.status,
                            visibility: data.visibility,
                        });
                        setError(null);
                    } catch (refreshError) {
                        console.error('Failed to refresh token:', refreshError);
                        setError('Failed to load course details. Please log in again.');
                    }
                } else {
                    console.error('Failed to fetch course details:', err);
                    setError('Failed to load course details.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCourseData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateCourseDetails(courseId!, courseData);
            navigate(userRole === 'admin' ? '/admin/courses' : '/instructor/courses');
        } catch (err: any) {
            console.error('Failed to save course details:', err);
            setError('Failed to save course details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(userRole === 'admin' ? '/admin/courses' : '/instructor/courses');
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                {userRole === 'admin' ? 'Edit Course (Admin)' : 'Edit Course (Instructor)'}
            </Typography>
            <Box component="form" sx={{ mt: 3 }}>
                <TextField
                    label="Title"
                    name="title"
                    value={courseData.title}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Description"
                    name="description"
                    value={courseData.description}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                />
                <TextField
                    label="Status"
                    name="status"
                    value={courseData.status}
                    onChange={handleInputChange}
                    select
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                </TextField>
                <TextField
                    label="Visibility"
                    name="visibility"
                    value={courseData.visibility}
                    onChange={handleInputChange}
                    select
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="public">Public</MenuItem>
                </TextField>
                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default EditCourse;
