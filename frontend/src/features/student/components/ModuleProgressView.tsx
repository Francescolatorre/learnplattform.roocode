import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Paper
} from '@mui/material';
import { ModuleProgress, TaskProgress } from '../../../types/progressTypes';

interface ModuleProgressViewProps {
    moduleProgress: ModuleProgress;
}

const ModuleProgressView: React.FC<ModuleProgressViewProps> = ({ moduleProgress }) => {
    const calculateTaskCompletion = (task: TaskProgress) => {
        if (task.status === 'completed' || task.status === 'graded') return 100;
        if (task.status === 'in_progress') return 50;
        return 0;
    };

    const getTaskStatusColor = (task: TaskProgress) => {
        switch (task.status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'warning';
            case 'not_started':
                return 'default';
            case 'graded':
                return 'primary';
            default:
                return 'default';
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {moduleProgress.moduleTitle}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {moduleProgress.completionPercentage}% Complete
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={moduleProgress.completionPercentage}
                    sx={{ mb: 2 }}
                />
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Progress</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {moduleProgress.taskProgress.map(task => (
                                <TableRow key={task.taskId}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{task.taskType}</TableCell>
                                    <TableCell>
                                        <LinearProgress
                                            variant="determinate"
                                            value={calculateTaskCompletion(task)}
                                            sx={{ width: 100 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {task.score !== null ? `${task.score}/${task.maxScore}` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={task.status}
                                            size="small"
                                            color={getTaskStatusColor(task)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default ModuleProgressView;
