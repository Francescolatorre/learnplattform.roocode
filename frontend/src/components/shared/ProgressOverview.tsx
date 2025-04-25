import {Box, Typography, Grid} from '@mui/material';
import React from 'react';

export interface ProgressOverviewProps {
    totalCourses: number;
    completedCourses: number;
    averageScore: number;
    overallCompletion: number;
}

/**
 * A component for displaying an overview of learning progress metrics
 * in a standardized grid layout.
 */
const ProgressOverview: React.FC<ProgressOverviewProps> = ({
    totalCourses,
    completedCourses,
    averageScore,
    overallCompletion,
}) => {
    return (
        <Box>
            <Typography variant='h6'>Overall Progress</Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Typography>Total Courses: {totalCourses}</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography>Completed Courses: {completedCourses}</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography>Average Score: {averageScore}%</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>Overall Completion: {overallCompletion}%</Typography>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProgressOverview;
