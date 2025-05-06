import {
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

import {useNotification} from '@/components/ErrorNotifier/useErrorNotifier';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import {ICourse} from '@/types/course';
import {ILearningTask} from '@/types/task';
import {IPaginatedResponse} from '@/types/paginatedResponse';
import {useAuth} from '@context/auth/AuthContext';
import {courseService} from '@services/resources/courseService';
import {enrollmentService} from '@services/resources/enrollmentService';
import EnrollmentStatusIndicator from '@/components/courses/EnrollmentStatusIndicator';

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
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);

  /**
   * Query to fetch course details by courseId
   * Added staleTime to prevent excessive refetching
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
    staleTime: 60000, // 1 minute stale time to prevent excessive refetching
  });

  // Memoize the canViewTasks value to prevent unnecessary re-renders
  const canViewTasks = useMemo(() =>
    isAuthenticated && !!courseDetails?.isEnrolled,
    [isAuthenticated, courseDetails?.isEnrolled]
  );

  /**
   * Query to fetch learning tasks associated with the course
   * Only enabled when course exists and user is enrolled
   */
  const {
    data: learningTasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery<IPaginatedResponse<ILearningTask>>({
    queryKey: ['learningTasks', courseId],
    queryFn: () => courseService.getCourseTasks(courseId!),
    enabled: !!courseId && canViewTasks, // Use the memoized value
    retry: false,
    staleTime: 60000, // 1 minute stale time to prevent excessive refetching
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
      queryClient.invalidateQueries({queryKey: ['enrollments']});
      queryClient.invalidateQueries({queryKey: ['courses', courseId]});

      notify({
        message: 'Successfully enrolled in course!',
        severity: 'success',
        title: 'Enrollment Success',
        duration: 6000,
      });
    },
    onError: (error) => {
      notify({
        message: `Failed to enroll in course: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        title: 'Enrollment Error',
      });
    },
  });

  /**
   * Mutation to handle course unenrollment using enrollmentService
   * On success, invalidates the courseDetails query and shows success message
   */
  const unenrollMutation = useMutation({
    mutationFn: () => enrollmentService.unenrollFromCourseById(courseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courseDetails', courseId],
      });
      queryClient.invalidateQueries({queryKey: ['enrollments']});
      queryClient.invalidateQueries({queryKey: ['courses', courseId]});

      notify({
        message: 'Successfully unenrolled from course!',
        severity: 'success',
        title: 'Unenrollment Success',
        duration: 6000,
      });
    },
    onError: (error) => {
      notify({
        message: `Failed to unenroll from course: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        title: 'Unenrollment Error',
      });
    },
  });

  /**
   * Handles the enrollment button click
   * If user is not authenticated, redirects to login page
   * Otherwise, triggers the enrollment mutation
   */
  const handleEnrollClick = () => {
    enrollMutation.mutate();
  };

  /**
   * Handles the unenrollment button click
   * Opens the confirmation dialog
   */
  const handleUnenrollClick = () => {
    setUnenrollDialogOpen(true);
  };

  /**
   * Confirms the unenrollment action
   * Triggers the unenrollment mutation
   */
  const confirmUnenroll = () => {
    unenrollMutation.mutate();
    setUnenrollDialogOpen(false);
  };

  /**
   * Cancels the unenrollment action
   * Closes the confirmation dialog
   */
  const cancelUnenroll = () => {
    setUnenrollDialogOpen(false);
  };

  // Modified render method to include status indicator
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

  // Get the description content in the correct format for the MarkdownRenderer
  const descriptionContent = courseDetails.description_html || courseDetails.description || "";

  return (
    <Box sx={{maxWidth: 1200, mx: 'auto', p: 2}}>
      <Paper sx={{p: 3, mb: 3}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
          <Typography variant="h3" gutterBottom data-testid="course-title">
            {courseDetails.title}
          </Typography>
          <EnrollmentStatusIndicator
            isEnrolled={!!courseDetails.isEnrolled}
            isCompleted={!!courseDetails.isCompleted}
            data-testid="enrollment-status"
          />
        </Box>

        <Divider sx={{my: 2}} />

        {/* Use the MarkdownRenderer component for the description with proper content */}
        <Box sx={{my: 2}} data-testid="course-description">
          {descriptionContent ? (
            <MarkdownRenderer content={descriptionContent} />
          ) : (
            <Typography variant="body1" paragraph>
              No description available.
            </Typography>
          )}
        </Box>

        {!canViewTasks && (
          <Box sx={{mt: 2, mb: 2}}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEnrollClick}
              disabled={enrollMutation.isPending}
              size="large"
              sx={{px: 4}}
              data-testid="enroll-button"
            >
              {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Course'}
            </Button>
          </Box>
        )}

        {canViewTasks && (
          <Box sx={{mt: 2, mb: 2, display: 'flex', gap: 2}}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleUnenrollClick}
              disabled={unenrollMutation.isPending}
              size="large"
              sx={{px: 4}}
              data-testid="unenroll-button"
            >
              {unenrollMutation.isPending ? 'Unenrolling...' : 'Unenroll from Course'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Learning tasks section with proper type checking */}
      {canViewTasks ? (
        <Paper sx={{p: 3}}>
          <Typography variant="h5" gutterBottom>
            Associated Learning Tasks
          </Typography>
          {isTasksLoading ? (
            <CircularProgress />
          ) : tasksError ? (
            <Typography variant="body1" color="error">
              Failed to load learning tasks. Please try again later.
            </Typography>
          ) : learningTasks?.results && learningTasks.results.length > 0 ? (
            <List>
              {learningTasks.results.map((task) => (
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
        </Paper>
      ) : (
        <Paper sx={{p: 3, backgroundColor: 'action.hover'}}>
          <Typography variant="body2" color="textSecondary">
            Enroll in this course to access learning tasks.
          </Typography>
        </Paper>
      )}

      {/* Unenrollment confirmation dialog with proper data-testid attributes */}
      <Dialog
        open={unenrollDialogOpen}
        onClose={cancelUnenroll}
        aria-labelledby="unenroll-dialog-title"
        aria-describedby="unenroll-dialog-description"
        data-testid="unenroll-confirmation-dialog"
      >
        <DialogTitle id="unenroll-dialog-title">Unenroll from Course</DialogTitle>
        <DialogContent>
          <DialogContentText id="unenroll-dialog-description">
            Are you sure you want to unenroll from this course? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelUnenroll} color="primary" data-testid="cancel-unenroll-button">
            Cancel
          </Button>
          <Button onClick={confirmUnenroll} color="secondary" data-testid="confirm-unenroll-button" autoFocus>
            Unenroll
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCourseDetailsPage;
