import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {useParams, useNavigate} from 'react-router-dom';
import {CircularProgress, Typography, List, ListItem, ListItemText, Button} from '@mui/material';

import {fetchCourseDetails} from '@services/resources/progressService';
import {CourseDetails} from 'src/types/common/entities';
import {fetchTasksByCourse} from '@services/resources/taskService';

const CourseDetailsPage: React.FC = () => {
  const {courseId} = useParams<{courseId: string}>(); // Extract courseId from route params
  console.log('Course ID:', courseId); // Debug log for courseId
  const navigate = useNavigate();

  // Fetch course details
  const {
    data: courseDetails,
    isLoading: isCourseLoading,
    error: courseError,
  } = useQuery<CourseDetails>({
    queryKey: ['courseDetails', courseId],
    queryFn: () => fetchCourseDetails(courseId!),
    enabled: !!courseId,
  });

  // Fetch learning tasks using CourseService
  const {
    data: learningTasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['learningTasks', courseId],
    queryFn: () => fetchTasksByCourse(courseId!),
    enabled: !!courseId,
  });

  if (isCourseLoading || isTasksLoading) {
    return <CircularProgress />;
  }

  if (courseError || tasksError) {
    return (
      <Typography variant="h6" color="error">
        Failed to load course details or learning tasks. Please try again later.
      </Typography>
    );
  }

  if (!courseDetails) {
    return <Typography variant="h6">Course not found.</Typography>;
  }

  console.log('Fetched Course Details:', courseDetails); // Log course details
  console.log('Fetched Learning Tasks:', learningTasks); // Log learning tasks

  return (
    <div>
      <Typography variant="h3" gutterBottom>
        {courseDetails?.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {courseDetails?.description}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Associated Learning Tasks
      </Typography>
      {learningTasks && learningTasks.results && learningTasks.results.length > 0 ? (
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
    </div>
  );
};

export default CourseDetailsPage;
