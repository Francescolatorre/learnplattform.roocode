import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import DashboardLayout from './DashboardLayout';

const AdminDashboard: React.FC<{ data: any }> = ({ data }) => {
    if (!data) {
        return <div>Loading...</div>; // Add a loading state
    }
    // Add a default value or null check for data
    const totalTasks = data?.totalTasks ?? 0; // Default to 0 if data or totalTasks is null
    const completedTasks = data?.completedTasks ?? 0; // Default to 0 if data or completedTasks is null
    const averageScore = data?.averageScore ?? 0; // Default to 0 if data or averageScore is null

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
                                {totalTasks}
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
                                {completedTasks}
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
                                {averageScore}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default AdminDashboard;
