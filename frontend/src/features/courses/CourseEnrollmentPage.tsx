import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { useCourseData } from '@hooks/useCourseData';
import DataTable from '@components/common/DataTable';
import StatusChip from '@components/common/StatusChip';
import ProgressIndicator from '@components/common/ProgressIndicator';
import { Course } from '../../types/courseTypes';
import { fetchCourses, enrollInCourse } from '@services/courseService';
import { useAuth } from '@features/auth/AuthContext';

// Extend Course with additional enrollment-specific properties
interface EnrollableCourse extends Course {
  instructor?: string;
  difficulty?: string;
  enrollmentStatus?: 'open' | 'closed' | 'in_progress';
  progress?: number;
}

const CourseEnrollmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      setError(null);
      await enrollInCourse(courseId);
      setSuccessMessage('Successfully enrolled in the course!');
      // Refetch courses to update enrollment status
      const response = await fetchCourses();
      setCourses(response.results);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in the course. Please try again later.');
    } finally {
      setEnrollingCourseId(null);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Enrollment
      </Typography>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      <Grid container spacing={3}>
        {courses.map((course: any) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{course.title}</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {course.description}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/courses/${course.id}/details`)}
                  sx={{ mt: 1, mr: 1 }}
                >
                  View Details
                </Button>
                {course.enrolled ? (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    You are already enrolled in this course.
                  </Typography>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollingCourseId === course.id}
                    sx={{ mt: 1 }}
                  >
                    {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const CourseEnrollmentPageWithQueryClient: React.FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <CourseEnrollmentPage />
    </QueryClientProvider>
  );
};

export default CourseEnrollmentPageWithQueryClient;
