import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {Box, Typography, TextField, Button} from '@mui/material';
import React from 'react';

interface TaskDetailsHeaderProps {
    searchTerm: string;
    filterType: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFilterChange: (type: string) => void;
}

const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({
    searchTerm,
    filterType,
    onSearchChange,
    onFilterChange,
}) => {
    return (
        <Box sx={{mb: 3}}>
            <Typography variant="h5" gutterBottom>
                Task Details
            </Typography>
            <Typography variant="body1" paragraph>
                View detailed information about your tasks, including status, scores, and due dates.
            </Typography>
            <Box sx={{display: 'flex', gap: 1}}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{mr: 1, color: 'text.secondary'}} />,
                    }}
                    size="small"
                />
                <Button
                    variant={filterType === 'all' ? 'contained' : 'outlined'}
                    onClick={() => onFilterChange('all')}
                    size="small"
                    startIcon={<FilterListIcon />}
                >
                    All
                </Button>
                <Button
                    variant={filterType === 'not_started' ? 'contained' : 'outlined'}
                    onClick={() => onFilterChange('not_started')}
                    size="small"
                    color="info"
                >
                    Not Started
                </Button>
                <Button
                    variant={filterType === 'in_progress' ? 'contained' : 'outlined'}
                    onClick={() => onFilterChange('in_progress')}
                    size="small"
                    color="warning"
                >
                    In Progress
                </Button>
                <Button
                    variant={filterType === 'completed' ? 'contained' : 'outlined'}
                    onClick={() => onFilterChange('completed')}
                    size="small"
                    color="success"
                >
                    Completed
                </Button>
            </Box>
        </Box>
    );
};

export default TaskDetailsHeader;
