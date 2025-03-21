import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Collapse,
    Tabs,
    Tab,
    useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { format, parseISO } from 'date-fns';
import { TaskProgress } from '../../../types/progressTypes';

interface TaskDetailsViewProps {
    taskProgress: TaskProgress[];
}

const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({
    taskProgress
}) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<number>(0);

    // Handle tab change
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Handle search term change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Handle filter type change
    const handleFilterChange = (type: string) => {
        setFilterType(type);
    };

    // Toggle task details expansion
    const toggleTaskExpansion = (taskId: string) => {
        setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    // Filter tasks based on search term and filter type
    const filteredTasks = taskProgress.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || task.status === filterType;
        return matchesSearch && matchesFilter;
    });

    // Sort tasks based on active tab
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (activeTab) {
            case 0: // Due Date
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
            case 1: // Status
                return a.status.localeCompare(b.status);
            case 2: // Score
                const aScore = a.score !== null ? a.score : -1;
                const bScore = b.score !== null ? b.score : -1;
                return bScore - aScore;
            default:
                return 0;
        }
    });

    // Get status chip color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'graded':
                return theme.palette.success.main;
            case 'in_progress':
                return theme.palette.warning.main;
            case 'not_started':
                return theme.palette.info.main;
            case 'pending':
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    // Format status text
    const formatStatus = (status: string) => {
        switch (status) {
            case 'not_started':
                return 'Not Started';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'graded':
                return 'Graded';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    // Format time spent
    const formatTimeSpent = (seconds: number | null) => {
        if (seconds === null) return 'N/A';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Task Details
            </Typography>
            <Typography variant="body1" paragraph>
                View detailed information about your tasks, including status, scores, and due dates.
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant={filterType === 'all' ? 'contained' : 'outlined'}
                                onClick={() => handleFilterChange('all')}
                                size="small"
                                startIcon={<FilterListIcon />}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterType === 'not_started' ? 'contained' : 'outlined'}
                                onClick={() => handleFilterChange('not_started')}
                                size="small"
                                color="info"
                            >
                                Not Started
                            </Button>
                            <Button
                                variant={filterType === 'in_progress' ? 'contained' : 'outlined'}
                                onClick={() => handleFilterChange('in_progress')}
                                size="small"
                                color="warning"
                            >
                                In Progress
                            </Button>
                            <Button
                                variant={filterType === 'completed' ? 'contained' : 'outlined'}
                                onClick={() => handleFilterChange('completed')}
                                size="small"
                                color="success"
                            >
                                Completed
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Sort by Due Date" />
                <Tab label="Sort by Status" />
                <Tab label="Sort by Score" />
            </Tabs>

            {sortedTasks.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>No tasks match your search criteria.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedTasks.map(task => (
                                <React.Fragment key={task.taskId}>
                                    <TableRow
                                        hover
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                            borderLeft: `4px solid ${getStatusColor(task.status)}`
                                        }}
                                    >
                                        <TableCell>{task.title}</TableCell>
                                        <TableCell>{task.taskType.replace('_', ' ')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatStatus(task.status)}
                                                sx={{
                                                    bgcolor: getStatusColor(task.status),
                                                    color: 'white'
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {task.score !== null
                                                ? `${task.score} / ${task.maxScore}`
                                                : 'Not graded'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {task.dueDate
                                                ? format(parseISO(task.dueDate), 'MMM d, yyyy')
                                                : 'No due date'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => toggleTaskExpansion(task.taskId)}
                                                aria-label="show more"
                                            >
                                                {expandedTaskId === task.taskId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={expandedTaskId === task.taskId} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 2 }}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Task Details
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="textSecondary" gutterBottom>
                                                                        Attempts
                                                                    </Typography>
                                                                    <Typography variant="h5" component="div">
                                                                        {task.attempts} / {task.maxAttempts}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="textSecondary" gutterBottom>
                                                                        Time Spent
                                                                    </Typography>
                                                                    <Typography variant="h5" component="div">
                                                                        {formatTimeSpent(task.timeSpent)}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="textSecondary" gutterBottom>
                                                                        Submission Date
                                                                    </Typography>
                                                                    <Typography variant="h5" component="div">
                                                                        {task.submissionDate
                                                                            ? format(parseISO(task.submissionDate), 'MMM d, yyyy')
                                                                            : 'Not submitted'
                                                                        }
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Card variant="outlined">
                                                                <CardContent>
                                                                    <Typography color="textSecondary" gutterBottom>
                                                                        Module
                                                                    </Typography>
                                                                    <Typography variant="h5" component="div">
                                                                        {task.moduleId}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    </Grid>
                                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            disabled={task.status === 'completed' || task.status === 'graded'}
                                                        >
                                                            {task.status === 'not_started' ? 'Start Task' :
                                                             task.status === 'in_progress' ? 'Continue Task' :
                                                             'View Details'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default TaskDetailsView;
