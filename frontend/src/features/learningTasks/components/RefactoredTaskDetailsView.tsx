import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Tabs,
  Tab,
  useTheme,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Import our new shared components
import { TaskProgress } from '../types/progressTypes';

import DataTable, { Column } from './common/DataTable'; // Adjusted path to match the correct location
import StatusChip from './common/StatusChip';
import ProgressIndicator from './common/ProgressIndicator';


interface TaskDetailsViewProps {
  taskProgress: TaskProgress[];
}

const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({ taskProgress }) => {
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
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
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

  // Define columns for the DataTable
  const columns: Column<TaskProgress>[] = [
    {
      id: 'title',
      label: 'Task',
      minWidth: 180,
    },
    {
      id: 'moduleId',
      label: 'Module',
      minWidth: 100,
    },
    {
      id: 'taskType',
      label: 'Type',
      minWidth: 100,
      format: value => value.replace('_', ' '),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: value => <StatusChip status={value} />,
    },
    {
      id: 'score',
      label: 'Score',
      minWidth: 100,
      format: (value, row) => (value !== null ? `${value} / ${row.maxScore}` : 'Not graded'),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: 120,
      format: value => (value ? new Date(value).toLocaleDateString() : 'No due date'),
    },
    {
      id: 'taskId',
      label: 'Actions',
      minWidth: 80,
      align: 'center',
      format: (_, row) => (
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation();
            toggleTaskExpansion(row.taskId);
          }}
          aria-label="show more"
        >
          {expandedTaskId === row.taskId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      ),
    },
  ];

  // Define a row render function for the expanded state
  const renderExpandedRow = (task: TaskProgress) => (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
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
                  ? new Date(task.submissionDate).toLocaleDateString()
                  : 'Not submitted'}
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
          {task.status === 'not_started'
            ? 'Start Task'
            : task.status === 'in_progress'
              ? 'Continue Task'
              : 'View Details'}
        </Button>
      </Box>
    </Box>
  );

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

      {/* Use our reusable DataTable component */}
      <Box sx={{ mb: 3 }}>
        <DataTable<TaskProgress>
          columns={columns}
          data={sortedTasks}
          emptyMessage="No tasks match your search criteria"
          keyExtractor={task => task.taskId}
          onRowClick={task => toggleTaskExpansion(task.taskId)}
          rowSx={task => ({
            borderLeft: `4px solid ${
              task.status === 'completed' || task.status === 'graded'
                ? theme.palette.success.main
                : task.status === 'in_progress'
                  ? theme.palette.warning.main
                  : task.status === 'pending'
                    ? theme.palette.error.main
                    : theme.palette.info.main
            }`,
          })}
        />
      </Box>

      {/* Render expanded task details */}
      {expandedTaskId && (
        <Paper sx={{ mb: 3 }}>
          {sortedTasks
            .filter(task => task.taskId === expandedTaskId)
            .map(task => renderExpandedRow(task))}
        </Paper>
      )}
    </Box>
  );
};

export default TaskDetailsView;
