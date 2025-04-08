import React from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useParams, useNavigate} from 'react-router-dom';
import {
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import {useAuth} from '@features/auth/context/AuthContext';
import {courseService} from '@services/resources/courseService';
import {Course} from 'src/types/common/entities';

const CourseDetailsPage: React.FC = () => {
  const {courseId} = useParams<{courseId: string}>();
  const navigate = useNavigate();
  const {user, isAuthenticated} = useAuth();
  const queryClient = useQueryClient();
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {from: `/courses/${courseId}`},
        replace: true
      });
    }
  }, [isAuthenticated, navigate, courseId]);

  const {
    data: courseDetails,
    isLoading: isCourseLoading,
    error: courseError,
  } = useQuery<Course>({
    queryKey: ['courseDetails', courseId],
    queryFn: () => courseService.getCourseDetails(courseId!),
    enabled: !!courseId,
    retry: false,
  });

  const {
    data: learningTasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['learningTasks', courseId],
    queryFn: () => courseService.getCourseTasks(courseId!), // Updated to use courseService
    enabled: !!courseId && isAuthenticated && courseDetails?.isEnrolled,
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseService.enrollInCourse(courseId!),
    onSuccess: () => {
      queryClient.invalidateQueries(['courseDetails', courseId]);
      setShowSuccessMessage(true);
    },
  });

  const canViewTasks = isAuthenticated && courseDetails?.isEnrolled;

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {from: `/courses/${courseId}`},
        replace: true
      });
      return;
    }
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
          {enrollMutation.isError && (
            <Typography color="error" sx={{mt: 1}}>
              Failed to enroll. Please try again later.
            </Typography>
          )}
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
              {learningTasks.results.map((task: {id: string; title: string}) => (
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

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccessMessage(false)}>
          Successfully enrolled in course!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CourseDetailsPage;
