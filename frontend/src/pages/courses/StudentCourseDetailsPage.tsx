import {
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
} from '@mui/material';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {useParams, useNavigate} from 'react-router-dom';

import {useNotification} from '@/components/ErrorNotifier/useErrorNotifier';
import {ICourse} from '@/types/course'
import {useAuth} from '@context/auth/AuthContext';
import {courseService} from '@services/resources/courseService';
import {enrollmentService} from '@services/resources/enrollmentService';

/**
 * StudentCourseDetailsPage displays detailed information about a specific course.
 *
 * Features:
 * - Displays course title and description
 * - Shows enrollment status and enrollment button for non-enrolled users
 * - Lists associated learning tasks for enrolled users
 * - Provides navigation to individual learning tasks
 *
 * @returns {React.ReactElement} The CourseDetailsPage component
 */
const StudentCourseDetailsPage: React.FC = () => {
  const {courseId} = useParams<{courseId: string}>();
  const queryClient = useQueryClient();
  const {isAuthenticated} = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();

  /**
   * Query to fetch course details by courseId
   */
  const {
    data: courseDetails,
    isLoading: isCourseLoading,
    error: courseError,
  } = useQuery<ICourse>({
    queryKey: ['courseDetails', courseId],
    queryFn: () => courseService.getCourseDetails(courseId!),
    enabled: !!courseId,
    retry: false,
  });

  /**
   * Query to fetch learning tasks associated with the course
   * Only enabled when course exists and user is enrolled
   */
  const {
    data: learningTasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['learningTasks', courseId],
    queryFn: () => courseService.getCourseTasks(courseId!), // Updated to use courseService
    enabled: !!courseId && courseDetails?.isEnrolled,
    retry: false,
  });

  /**
   * Mutation to handle course enrollment using enrollmentService
   * On success, invalidates the courseDetails query and shows success message
   */
  const enrollMutation = useMutation({
    mutationFn: () => enrollmentService.enrollInCourse(courseId!),
    onSuccess: () => {
      // Update to use the new invalidateQueries syntax with filters
      queryClient.invalidateQueries({
        queryKey: ['courseDetails', courseId],
      });

      notify({
        message: 'Successfully enrolled in course!',
        severity: 'success',
        title: 'Enrollment Success',
        duration: 6000,
      });
    },
    onError: () => {
      notify({
        message: 'Failed to enroll in course. Please try again later.',
        severity: 'error',
        title: 'Enrollment Error',
      });
    },
  });

  const canViewTasks = isAuthenticated && courseDetails?.isEnrolled;

  /**
   * Handles the enrollment button click
   * If user is not authenticated, redirects to login page
   * Otherwise, triggers the enrollment mutation
   */
  const handleEnrollClick = () => {
    enrollMutation.mutate();
  };

  if (isCourseLoading) {
    return <CircularProgress />;
  }

  if (courseError) {
    return (
      <Typography variant="h6" color="error">
        Failed to load course details. Please try again later.
      </Typography>
    );
  }

  if (!courseDetails) {
    return <Typography variant="h6">Course not found.</Typography>;
  }

  return (
    <div>
      <Typography variant="h3" gutterBottom>
        {courseDetails.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {courseDetails.description}
      </Typography>

      {!canViewTasks && (
        <Box sx={{mt: 2, mb: 2}}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEnrollClick}
            disabled={enrollMutation.isPending}
          >
            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Course'}
          </Button>
          {/* Error handling moved to the onError callback in the mutation */}
        </Box>
      )}

      {canViewTasks ? (
        <>
          <Typography variant="h5" gutterBottom>
            Associated Learning Tasks
          </Typography>
          {isTasksLoading ? (
            <CircularProgress />
          ) : tasksError ? (
            <Typography variant="body1" color="error">
              Failed to load learning tasks. Please try again later.
            </Typography>
          ) : learningTasks?.results?.length > 0 ? (
            <List>
              {learningTasks!.results.map((task: {id: number; title: string}) => (
                <ListItem key={task.id} divider>
                  <ListItemText primary={task.title} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    View Task
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1">No learning tasks available for this course.</Typography>
          )}
        </>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Enroll in this course to access learning tasks.
        </Typography>
      )}
    </div>
  );
};

export default StudentCourseDetailsPage;
