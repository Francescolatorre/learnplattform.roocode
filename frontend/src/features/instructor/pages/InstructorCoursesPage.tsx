import React, {useEffect} from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';

import {useAppStore} from '@store/appStore';
import CourseService from '@features/courses/services/courseService';

// Define Course type for InstructorCoursesPage, matching apiTypes.Course
//interface Course extends ApiCourse { }

const InstructorCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const {courses, setCourses} = useAppStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await CourseService.fetchCourses('instructor');
        // Access response.results to get the array of courses
        const coursesData = response.results || [];
        setCourses(coursesData);
        console.log('response from fetchCourses:', response);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load courses. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [setCourses]);
  if (loading) {
    return (
      <Box
        sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{p: 3}}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{p: 3}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
        <Typography variant="h4" gutterBottom>
          Instructor Courses
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/courses/add')}>
          Add Course
        </Button>
      </Box>
      <Grid container spacing={3}>
        {courses.map(course => {
          console.log('courses before map:', courses);
          console.log('course:', course);
          return (
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
                    sx={{mt: 2}}
                    onClick={() => navigate(`/courses/${course.id}/edit`)}
                  >
                    Manage Course
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default InstructorCoursesPage;
