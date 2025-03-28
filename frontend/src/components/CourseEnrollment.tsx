import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { fetchCourseDetails, enrollInCourse } from '@services/courseService';
import { useAuth } from '@features/auth/AuthContext';

const CourseEnrollment = ({ courseId }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const { courseData, enrollmentData } = await fetchCourseDetails(courseId, user.id);
        setCourse(courseData);

        const userEnrollment = enrollmentData.find(
          enrollment =>
            enrollment.user === user.id && enrollment.course.toString() === courseId.toString()
        );
        if (userEnrollment) {
          setEnrollmentStatus(userEnrollment.status);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user.id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setError(null);
      await enrollInCourse(courseId);
      setEnrollmentStatus('active');
      setSuccessMessage('You have successfully enrolled in this course!');
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in the course. Please try again later.');
    } finally {
      setEnrolling(false);
    }
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

  if (!course) {
    return <Alert severity="info">Course information not available.</Alert>;
  }

  return (
    <Box sx={{ mb: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {course.title}
          </Typography>

          <Typography variant="body1" color="textSecondary" paragraph>
            {course.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={course.status}
              color={course.status === 'published' ? 'success' : 'default'}
              size="small"
            />
            <Chip label={course.visibility} color="primary" size="small" variant="outlined" />
          </Box>

          {enrollmentStatus ? (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                You are already enrolled in this course.
                {enrollmentStatus === 'active' && ' Your enrollment is active.'}
                {enrollmentStatus === 'completed' && ' You have completed this course.'}
                {enrollmentStatus === 'dropped' && ' You have dropped this course.'}
              </Alert>

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                href={`/courses/${courseId}/tasks`}
              >
                View Course Tasks
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              disabled={enrolling || course.status !== 'published'}
              onClick={handleEnroll}
              sx={{ mt: 2 }}
            >
              {enrolling ? 'Enrolling...' : 'Enroll in Course'}
            </Button>
          )}

          {course.status !== 'published' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This course is not currently published for enrollment.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseEnrollment;
