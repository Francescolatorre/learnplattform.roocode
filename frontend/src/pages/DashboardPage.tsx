import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Alert,
  Card,
  CardContent,
  Divider,
  Button
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {Link as RouterLink} from 'react-router-dom';

import {IUserProgress} from '@/types';
import {IProgressResponse} from '@/types/progress';
import {useAuth} from '@context/auth/AuthContext';
import ProgressIndicator from '@/components/shared/ProgressIndicator';
import progressService from '@services/resources/progressService';
import {enrollmentService} from '@services/resources/enrollmentService';
import {ICourseEnrollment} from '@/types';
import {IPaginatedResponse} from '@/types/paginatedResponse';

/**
 * Student Dashboard Page
 *
 * Displays student progress information, overall statistics, and enrolled courses
 */
const Dashboard: React.FC = () => {
  const {user} = useAuth();

  useEffect(() => {
    console.info('Dashboard component mounted');
    console.info('User:', user);
    return () => {
      console.info('Dashboard component unmounted');
    };
  }, [user]);

  /**
   * Fetches user progress data using the progressService
   * @returns Complete progress response including user info, stats and course progress
   */
  const fetchUserProgress = async (): Promise<IProgressResponse> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    try {
      console.info('Fetching user progress for user ID:', user.id);

      // Use progressService instead of directly calling apiService
      const response = await progressService.fetchStudentProgressByUser(user.id);
      console.info('User progress response:', response);

      // Handle the well-structured response that includes user_info, overall_stats, and courses
      if (response && typeof response === 'object' && 'courses' in response) {
        // This is already the expected structure
        return response as IProgressResponse;
      }

      // If we get an array of progress items, adapt it to our expected format
      if (Array.isArray(response)) {
        console.warn('Received array response format, adapting to expected structure');
        return {
          user_info: {
            id: user.id,
            username: user.username,
            display_name: user.display_name || user.username,
          },
          overall_stats: {
            courses_enrolled: response.length,
            completion_percentage: calculateAverageCompletion(response),
          },
          courses: response,
        };
      }

      // If we received something neither in the expected structure nor an array
      console.error('Error: Unexpected response format', response);

      // Return a fallback structure
      return {
        user_info: {
          id: user.id,
          username: user.username,
          display_name: user.display_name || user.username,
        },
        overall_stats: {
          courses_enrolled: 0,
          completion_percentage: 0,
        },
        courses: [],
      };
    } catch (error: any) {
      console.error('Error fetching user progress:', error.message);
      throw new Error('Failed to load progress data.');
    }
  };

  /**
   * Calculate average completion percentage across courses
   */
  const calculateAverageCompletion = (courses: IUserProgress[]): number => {
    if (!courses.length) return 0;
    const sum = courses.reduce((acc, course) => acc + (course.percentage || 0), 0);
    return Math.round(sum / courses.length);
  };

  // Fetch enrollments to get course details
  const {
    data: enrollmentsResponse,
    isLoading: isLoadingEnrollments
  } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => enrollmentService.fetchUserEnrollments(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // User progress data query using React Query
  const {
    data: progressResponse,
    isLoading: isLoadingProgress,
    error,
  } = useQuery<IProgressResponse>({
    queryKey: ['userProgress', user?.id],
    queryFn: fetchUserProgress,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Extract enrollments array from the response
  const extractEnrollments = (response: any): ICourseEnrollment[] => {
    // If response is an array, return it directly
    if (Array.isArray(response)) {
      return response;
    }

    // If response is a paginated response object
    if (response && typeof response === 'object') {
      // Check for results field (common in paginated responses)
      if ('results' in response && Array.isArray(response.results)) {
        return response.results;
      }

      // Check for data field (another common pattern)
      if ('data' in response && Array.isArray(response.data)) {
        return response.data;
      }

      // Check for items field (another common pattern)
      if ('items' in response && Array.isArray(response.items)) {
        return response.items;
      }

      // Check if response itself is an enrollment object (single enrollment)
      if ('course' in response) {
        return [response];
      }
    }

    console.warn('Could not extract enrollments from response:', response);
    return [];
  };

  // Get enrollments array from response
  const enrollments = enrollmentsResponse ? extractEnrollments(enrollmentsResponse) : [];

  // Create a map of course IDs to course titles from enrollments
  const courseTitleMap = React.useMemo(() => {
    console.debug('Building course title map from enrollments:', enrollments);

    const titleMap: Record<string | number, string> = {};

    if (Array.isArray(enrollments)) {
      enrollments.forEach(enrollment => {
        if (enrollment && enrollment.course && enrollment.course_details?.title) {
          titleMap[enrollment.course] = enrollment.course_details.title;
        }
      });
    }

    return titleMap;
  }, [enrollments]);

  // Loading state
  const isLoading = isLoadingProgress || isLoadingEnrollments;
  if (isLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{textAlign: 'center', mt: 4}}>
        <Alert severity="error" sx={{maxWidth: 600, mx: 'auto', mb: 3}}>
          {error instanceof Error ? error.message : 'An error occurred while loading data'}
        </Alert>
        <Typography variant="body1">
          Please try refreshing the page or contact support if the problem persists.
        </Typography>
      </Box>
    );
  }

  // Destructure the progress response data
  const {overall_stats: stats, courses: progressData = []} = progressResponse || {};

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.display_name || user?.username}!
      </Typography>

      {/* Overall Statistics Card */}
      <Paper elevation={2} sx={{p: 3, mt: 3}}>
        <Typography variant="h5" gutterBottom>
          Learning Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Enrolled Courses
                </Typography>
                <Typography variant="h4">{stats?.courses_enrolled || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Completed Courses
                </Typography>
                <Typography variant="h4">{stats?.courses_completed || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Overall Completion
                </Typography>
                <Typography variant="h4">{stats?.completion_percentage || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{height: '100%'}}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Completed Tasks
                </Typography>
                <Typography variant="h4">
                  {stats?.completed_tasks || 0}/{stats?.total_tasks || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Course Progress Section */}
      <Box sx={{mt: 4}}>
        <Typography variant="h5" gutterBottom>
          Course Progress
        </Typography>

        {!progressData || progressData.length === 0 ? (
          <Paper elevation={2} sx={{p: 3, textAlign: 'center'}}>
            <Typography variant="h6" gutterBottom>
              No Course Progress Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You have not started any courses yet. Enroll in courses to track your progress.
            </Typography>
            <Button
              component={RouterLink}
              to="/courses"
              variant="contained"
              color="primary"
              sx={{mt: 2}}
            >
              Browse Courses
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {progressData.map((progress, idx) => {
              // Get course title from enrollment data or fallback to progress data
              const courseId = progress.course_id || progress.id;
              const courseTitle =
                courseTitleMap[courseId] ||
                progress.label ||
                progress.course_name ||
                `Course ${idx + 1}`;

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={progress.id !== undefined ? progress.id : `progress-${idx}`}
                >
                  <Paper
                    elevation={2}
                    sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}
                  >
                    <Typography variant="h6" gutterBottom align="center">
                      {courseTitle}
                    </Typography>

                    <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}>
                      <ProgressIndicator
                        value={progress.percentage || 0}
                        label={`${progress.percentage || 0}% Complete`}
                        size={120}
                      />
                    </Box>

                    <Divider sx={{my: 1}} />

                    <Box sx={{pt: 1}}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Tasks Completed:</strong> {progress.completed_tasks || 0}/{progress.total_tasks || 0}
                      </Typography>
                      {progress.last_activity && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Last Activity:</strong> {new Date(progress.last_activity).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{mt: 'auto', pt: 2, display: 'flex', justifyContent: 'center'}}>
                      <Button
                        component={RouterLink}
                        to={`/courses/${courseId}`}
                        variant="outlined"
                        size="small"
                      >
                        Continue Learning
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Quick Links Section */}
      <Box sx={{mt: 4}}>
        <Paper elevation={2} sx={{p: 3}}>
          <Typography variant="h5" gutterBottom>
            Quick Links
          </Typography>
          <Typography variant="body1" paragraph>
            Continue your learning journey by exploring the available courses and tasks.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Alert severity="info">
                Visit the <strong>Courses</strong> section to see your enrolled courses.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="info">
                Check the <strong>Tasks</strong> section for your pending learning tasks.
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
