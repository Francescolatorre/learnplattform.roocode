import { Grid, Card, CardContent, Typography } from '@mui/material';
import React from 'react';

import DashboardLayout from './DashboardLayout';

interface Activity {
  task__title: string;
  status: string;
  updated_at: string;
}

interface InstructorDashboardData {
  courses_created: number;
  students_enrolled: number;
  recent_activity: Activity[];
}

const InstructorDashboard: React.FC<{ data: InstructorDashboardData }> = ({ data }) => {
  return (
    <DashboardLayout title="Instructor Dashboard">
      <Grid container spacing={3}>
        {/* Courses Created */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Courses Created
              </Typography>
              <Typography variant="h4" color="primary">
                {data?.courses_created || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Students Enrolled */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Students Enrolled
              </Typography>
              <Typography variant="h4" color="primary">
                {data?.students_enrolled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {data?.recent_activity?.length > 0 ? (
                <div>
                  {data.recent_activity.map((activity: Activity, index: number) => (
                    <div key={index}>
                      <Typography variant="body1">
                        Task: <strong>{activity.task__title}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Status: {activity.status}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Updated At: {activity.updated_at}
                      </Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No recent activity.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
