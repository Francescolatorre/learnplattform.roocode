import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
} from '@mui/material';
import ProgressIndicator from '@/components/shared/ProgressIndicator';

interface DashboardCourseCardProps {
    courseTitle: string;
    progress: {
        percentage: number;
        completed_tasks: number;
        total_tasks: number;
        last_activity?: string;
    };
    courseId: string;
}

const DashboardCourseCard: React.FC<DashboardCourseCardProps> = ({courseTitle, progress, courseId}) => {
    return (
        <Paper elevation={2} sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}} data-testid="dashboard-course-card">
            <Typography variant="h6" gutterBottom align="center">
                {courseTitle}
            </Typography>

            <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}>
                <ProgressIndicator
                    value={progress.percentage || 0}
                    label={`${progress.percentage || 0}% Complete`}
                    size={120}
                />
            </Box>

            <Divider sx={{my: 1}} />

            <Box sx={{pt: 1}}>
                <Typography variant="body2" color="text.secondary">
                    <strong>Tasks Completed:</strong> {progress.completed_tasks || 0}/{progress.total_tasks || 0}
                </Typography>
                {progress.last_activity && (
                    <Typography variant="body2" color="text.secondary">
                        <strong>Last Activity:</strong> {new Date(progress.last_activity).toLocaleDateString()}
                    </Typography>
                )}
            </Box>

            <Box sx={{mt: 'auto', pt: 2, display: 'flex', justifyContent: 'center'}}>
                <Button
                    component={RouterLink}
                    to={`/courses/${courseId}`}
                    variant="outlined"
                    size="small"
                >
                    Continue Learning
                </Button>
            </Box>
        </Paper>
    );
};

export default DashboardCourseCard;

import {Link as RouterLink} from 'react-router-dom';
