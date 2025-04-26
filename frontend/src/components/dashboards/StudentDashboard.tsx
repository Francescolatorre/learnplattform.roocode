import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';

import {ICourseEnrollment} from '@/types/course';
import {IProgressResponse} from '@/types/progress';
import progressService from '@/services/resources/progressService';

interface StudentDashboardProps {
  progressData: IProgressResponse;
  userId: string;
}

/**
 * Displays the student dashboard with progress information
 */
const StudentDashboard: React.FC<StudentDashboardProps> = ({progressData, userId}) => {
  // Verwenden Sie die übergebenen progressData anstatt fetch
  const {user_info, overall_stats, courses} = progressData;

  return (
    <Grid container spacing={3}>
      {/* Übersichtsbereich */}
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
              <StatCard
                title="Courses Enrolled"
                value={overall_stats?.courses_enrolled || 0}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Completed Courses"
                value={overall_stats?.courses_completed || 0}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Tasks Completed"
                value={overall_stats?.tasks_completed || 0}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Kursliste */}
      <Grid item xs={12} md={8}>
        <Paper sx={{p: 3}}>
          <Typography variant="h6" gutterBottom>
            Your Courses
          </Typography>
          <List>
            {courses?.length > 0 ? (
              courses.map((course, index) => (
                <React.Fragment key={course.id || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={course.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Progress: {course.percentage || 0}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={course.percentage || 0}
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

      {/* Aktivitäten und Empfehlungen */}
      <Grid item xs={12} md={4}>
        <Paper sx={{p: 3, mb: 3}}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List dense>
            {progressData.recent_activities?.slice(0, 5).map((activity, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={activity.description}
                  secondary={new Date(activity.timestamp).toLocaleDateString()}
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
            {progressData.recommendations?.slice(0, 3).map((rec, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={rec.title}
                  secondary={rec.reason}
                />
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

// Hilfskom ponente für Statistik-Karten
const StatCard: React.FC<{title: string, value: number | string}> = ({title, value}) => (
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
