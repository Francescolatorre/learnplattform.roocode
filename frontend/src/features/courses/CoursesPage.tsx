import React, { useEffect, useState } from 'react';
import { fetchCourses } from '@services/courseService';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await fetchCourses();
        setCourses(response.results);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

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

  if (courses.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No courses available.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      <List>
        {courses.map((course: any) => (
          <ListItem key={course.id}>
            <ListItemText primary={course.title} secondary={course.description} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CoursesPage;
