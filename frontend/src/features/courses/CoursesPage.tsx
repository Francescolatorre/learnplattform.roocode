import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress
} from '@mui/material';
import { fetchCourses, fetchCourseDetails } from '../../services/courseService';
import { Course, CourseError } from '../../types/courseTypes';
import { fetchTasksByCourse } from '../../services/taskService';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<CourseError | null>(null);
  const [tasks, setTasks] = useState<{ title: string }[]>([]);
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const result = await fetchCourses();

        if (result.error) {
          setError(result.error);
          setCourses([]);
        } else {
          setCourses(result.courses);
          setError(null);
        }
      } catch {
        setError({
          message: 'An unexpected error occurred while fetching courses',
          code: 0
        });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const result = await fetchCourseDetails(courseId);

        if ('error' in result) {
          setError(result.error);
        } else {
          const courseIndex = courses.findIndex(c => c.id.toString() === courseId);
          if (courseIndex >= 0) {
            const updatedCourses = [...courses];
            updatedCourses[courseIndex] = result;
            setCourses(updatedCourses);
          }
          setSelectedCourse(result);

          const taskData = await fetchTasksByCourse(courseId);
          setTasks(taskData);
        }
      } catch {
        setError({
          message: 'An unexpected error occurred while fetching course details',
          code: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      if (!loading) {
        loadCourseDetails();
      }
    } else {
      setSelectedCourse(null);
    }
  }, [courseId]);

  if (loading && courses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && courses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" flexDirection="column">
        <Typography color="error" variant="h6" gutterBottom>
          Error: {error.message}
        </Typography>
        {error.code && (
          <Typography variant="body2" color="textSecondary">
            Error Code: {error.code}
          </Typography>
        )}
      </Box>
    );
  }

  // Display course details if a course is selected
  if (selectedCourse) {
    return (
      <Box p={3}>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
        <Button variant="outlined" onClick={() => navigate('/courses')}>
          Back to All Courses
        </Button>

        <Box mt={3}>
          <Typography variant="h4" gutterBottom>
            {selectedCourse.title}
          </Typography>

          <Typography variant="body1" paragraph>
            {selectedCourse.description}
          </Typography>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Course Details</Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedCourse.status || 'Draft'}
                </Typography>
                <Typography variant="body2">
                  <strong>Version:</strong> {selectedCourse.version || '1.0'}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {selectedCourse.updated_at ? new Date(selectedCourse.updated_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Learning Objectives</Typography>
              <Typography variant="body2">
                {selectedCourse.learningObjectives || 'No learning objectives specified.'}
              </Typography>
            </Grid>
          </Grid>

          <Box mt={4}>
            {['admin', 'instructor'].includes(localStorage.getItem('user_role') || '') && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/courses/${selectedCourse.id}/edit`)}
              >
                Edit Course
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              sx={{ ml: 2 }}
              onClick={() => navigate(`/courses/${selectedCourse.id}/tasks`)}
            >
              View Tasks
            </Button>
          </Box>

          {/* Task List */}
          <Box mt={3}>
            <Typography variant="h5" gutterBottom>Tasks</Typography>
            {tasks.length > 0 ? (
              <ul>
                {tasks.map((task, index) => (
                  <li key={index}>
                    <Typography variant="body1">{task.title}</Typography>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2">No tasks available for this course.</Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // Display list of courses
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Courses</Typography>

      {courses.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No courses found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea
                  onClick={() => navigate(`/courses/${course.id}`)} // Navigate to course detail view
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
                      {course.description}
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Status: {course.status || 'Draft'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Version: {course.version || '1.0'}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CoursesPage;
