import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const CourseTasksList = ({ courseId }: { courseId: string }) => {
    // Placeholder tasks for demonstration
    const tasks = [
        { id: '1', title: 'Task 1', description: 'Description for Task 1' },
        { id: '2', title: 'Task 2', description: 'Description for Task 2' },
        { id: '3', title: 'Task 3', description: 'Description for Task 3' },
    ];

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Tasks for Course ID: {courseId}
            </Typography>
            <List>
                {tasks.map((task) => (
                    <ListItem key={task.id}>
                        <ListItemText
                            primary={task.title}
                            secondary={task.description}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default CourseTasksList;
