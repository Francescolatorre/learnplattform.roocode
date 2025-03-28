import React, {useEffect, useState} from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {Link} from 'react-router-dom';
import {fetchUserEnrollments} from '../../services/resources/courseService';
import LearningTaskService from '@features/learningTasks/services/learningTaskService';

interface IEnrollment {
  course: {
    id: string;
    title: string;
  };
  progress_percentage: number;
}

interface ITask {
  id: string;
  title: string;
  due_date: string;
}

const StudentDashboard: React.FC = () => {
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch enrolled courses with progress
        const enrollmentData = await fetchUserEnrollments();
        setEnrollments(enrollmentData.results); // Use updated enrollments with course details

        // Fetch upcoming tasks
        const taskData = {results: []};
        setUpcomingTasks(taskData.results.slice(0, 5)); // Show only the top 5 tasks
      } catch (err: any) {
        console.error('Failed to load student dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{p: 3}}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>

      {/* Enrolled Courses with Progress */}
      <Card sx={{mb: 4}}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            My Courses
          </Typography>
          <List>
            {enrollments.map(enrollment => (
              <ListItem
                key={enrollment.course.id}
                component={Link}
                to={`/courses/${enrollment.course.id}/details`}
                button
              >
                <ListItemText
                  primary={enrollment.course.title}
                  secondary={`Progress: ${enrollment.progress_percentage}%`}
                />
                <LinearProgress
                  variant="determinate"
                  value={enrollment.progress_percentage}
                  sx={{width: '30%', ml: 2}}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card sx={{mb: 4}}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upcoming Learning Tasks
          </Typography>
          <List>
            {upcomingTasks.map(task => (
              <React.Fragment key={task.id}>
                <ListItem component={Link} to={`/learning-tasks/${task.id}`} button>
                  <ListItemText
                    primary={task.title}
                    secondary={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Performance Summary
          </Typography>
          <Typography variant="body1">
            Completed Tasks:{' '}
            {enrollments.reduce((sum, e) => sum + (e.progress_percentage === 100 ? 1 : 0), 0)}
          </Typography>
          <Typography variant="body1">Total Courses: {enrollments.length}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentDashboard;
