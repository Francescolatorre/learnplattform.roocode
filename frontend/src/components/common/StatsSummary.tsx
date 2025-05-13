import React from 'react';
import {Paper, Typography, Divider, Grid} from '@mui/material';
import {ICourse} from '@/types';

interface StatsSummaryProps {
    courses: ICourse[];
    totalCourses: number;
    totalStudents: number;
    publishedCourses: number;
    tasksNeedingAttention: number;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({courses, totalCourses}) => (
    <Paper elevation={2} sx={{p: 3, mt: 3}}>
        <Typography variant="h6" gutterBottom>
            Summary
        </Typography>
        <Divider sx={{mb: 2}} />
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                    Total Courses
                </Typography>
                <Typography variant="h5">
                    {totalCourses}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                    Published Courses
                </Typography>
                <Typography variant="h5">
                    {courses.filter(c => c.status === 'published').length}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                    Total Students
                </Typography>
                <Typography variant="h5">
                    {courses.reduce((total, course) => total + (course.student_count || 0), 0)}
                </Typography>
            </Grid>
        </Grid>
    </Paper>
);

export default StatsSummary;
