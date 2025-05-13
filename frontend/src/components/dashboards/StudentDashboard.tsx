import React, {useEffect, useState} from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';

import {IProgressResponse} from '@/types/progress';
import {useApiService} from '@/services/api/apiClientContext';

interface StudentDashboardProps {
  userId: string;
}

/**
 * Displays the student dashboard with progress information
 */
const StudentDashboard: React.FC<StudentDashboardProps> = ({userId}) => {
  const [progressData, setProgressData] = useState<IProgressResponse | null>(null);
  const apiService = useApiService<IProgressResponse>();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiService.get(`/api/v1/students/${userId}/dashboard/`);
        setProgressData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [userId, apiService]);

  if (!progressData) {
    return <Typography>Loading...</Typography>;
  }

  const {user_info, overall_stats, courses} = progressData;

  const courseProgress = courses.map(course => ({
    completedTasks: course.completedTasks,
    totalTasks: course.totalTasks,
    averageScore: course.averageScore,
  }));

  return (
    <Grid container spacing={3}>
      {/* Overview Section */}
      <Grid item xs={12}>
        <Paper sx={{p: 3, mb: 2}}>
          <Typography variant="h5" gutterBottom>
            Welcome, {user_info?.display_name || user_info?.username || 'Student'}
          </Typography>
          <Typography variant="body1">
            Your overall progress: {overall_stats?.completion_percentage || 0}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overall_stats?.completion_percentage || 0}
            sx={{mt: 1, mb: 3, height: 10, borderRadius: 5}}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StatCard title="Courses Enrolled" value={overall_stats?.courses_enrolled || 0} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard title="Completed Courses" value={overall_stats?.courses_completed || 0} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard title="Tasks Completed" value={overall_stats?.tasks_completed || 0} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Course List */}
      <Grid item xs={12} md={8}>
        <Paper sx={{p: 3}}>
          <Typography variant="h6" gutterBottom>
            Your Courses
          </Typography>
          <List>
            {courses?.length > 0 ? (
              courses.map((course, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`Completed Tasks: ${course.completedTasks}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Total Tasks: {course.totalTasks}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={course.averageScore || 0}
                            sx={{mt: 1, height: 6, borderRadius: 3}}
                          />
                        </>
                      }
                    />
                  </ListItem>
                  {index < courses.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No courses enrolled yet." />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>

      {/* Activities and Recommendations */}
      <Grid item xs={12} md={4}>
        <Paper sx={{p: 3, mb: 3}}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List dense>
            {progressData.courses.slice(0, 5).map((course, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Course: ${course.studentId}`}
                  secondary={`Completed Tasks: ${course.completedTasks}`}
                />
              </ListItem>
            )) || (
                <ListItem>
                  <ListItemText primary="No recent activity." />
                </ListItem>
              )}
          </List>
        </Paper>

        <Paper sx={{p: 3}}>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <List dense>
            {progressData.courses.slice(0, 3).map((course, index) => (
              <ListItem key={index}>
                <ListItemText primary={`Course: ${course.studentId}`} secondary={`Average Score: ${course.averageScore}`} />
              </ListItem>
            )) || (
                <ListItem>
                  <ListItemText primary="No recommendations available." />
                </ListItem>
              )}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Helper component for statistic cards
const StatCard: React.FC<{title: string; value: number | string}> = ({title, value}) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default StudentDashboard;
