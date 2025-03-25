import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import DashboardLayout from './DashboardLayout';

const AdminDashboard: React.FC<{ data: any }> = ({ data }) => {
    return (
        <DashboardLayout title="Admin Dashboard">
            <Grid container spacing={3}>
                {/* Total Tasks */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Tasks
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {data.totalTasks}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Completed Tasks */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Completed Tasks
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {data.completedTasks}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Average Score */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Average Score
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {data.averageScore}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default AdminDashboard;
