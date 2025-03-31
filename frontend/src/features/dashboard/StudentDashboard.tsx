import React from 'react';
import {
  Box, Typography, List, ListItem, ListItemText,
  LinearProgress, Card, CardContent, Divider
} from '@mui/material';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';

import EnrollmentService from '@features/enrollments/services/enrollmentService';
import {IEnrollment as IEnrollmentType} from '@features/enrollments/types/enrollmentTypes';

import LearningTaskService from '@features/learningTasks/services/learningTaskService';
import {ILearningTask} from '@features/learningTasks/types/learningTaskTypes';

const StudentDashboard: React.FC = () => {
  // Fetch enrollments with React Query
  const {
    data: enrollmentData,
    isLoading: enrollmentsLoading,
    error: enrollmentsError
  } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => EnrollmentService.fetchUserEnrollments()
  });

  // Fetch tasks with React Query (Ersetzt durch tatsächlichen Service-Aufruf)
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['upcomingTasks'],
    queryFn: () => LearningTaskService.fetchLearningTasks()
  });

  const isLoading = enrollmentsLoading || tasksLoading;
  const error = enrollmentsError || tasksError;

  const enrollments = enrollmentData?.results ?? [];
  const upcomingTasks = tasksData?.results?.slice(0, 5) ?? [];
  const renderTasks = () => {
    if (upcomingTasks.length === 0) {
      return <Typography>No upcoming tasks.</Typography>;
    }
    return (
      <List>
        {upcomingTasks.map((task: ILearningTask) => (
          <ListItem key={task.id}>
            <ListItemText
              primary={task.title}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">
      {(error as Error).message || 'Failed to load dashboard data.'}
    </Typography>;
  }

  // JSX to render the dashboard
  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>

      <Card sx={{mb: 3}}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enrolled Courses
          </Typography>
          <Divider sx={{mb: 2}} />
          {enrollments.length === 0 ? (
            <Typography>No enrolled courses yet.</Typography>
          ) : (
            <List>
              {enrollments.map((enrollment: IEnrollmentType) => (
                <ListItem key={enrollment.id} component={Link} to={`/courses/${enrollment.course}`}>
                  <ListItemText
                    primary={enrollment.course_details.title}
                    secondary={enrollment.course_details.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upcoming Tasks (Next 5)
          </Typography>
          <Divider sx={{mb: 2}} />
          {renderTasks()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentDashboard;
