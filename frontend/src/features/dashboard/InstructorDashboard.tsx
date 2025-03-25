import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import DashboardLayout from './DashboardLayout';

const InstructorDashboard: React.FC<{ data: any }> = ({ data }) => {
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
                                {data.courses_created}
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
                                {data.students_enrolled}
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
                                    {data.recent_activity.map((activity: any, index: number) => (
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
