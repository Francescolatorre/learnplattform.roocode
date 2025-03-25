import React from 'react';
import { Box, Typography } from '@mui/material';

const TaskView = ({ courseId, taskId }: { courseId: string; taskId: string }) => {
    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Task Details
            </Typography>
            <Typography variant="body1">
                Course ID: {courseId}
            </Typography>
            <Typography variant="body1">
                Task ID: {taskId}
            </Typography>
        </Box>
    );
};

export default TaskView;
