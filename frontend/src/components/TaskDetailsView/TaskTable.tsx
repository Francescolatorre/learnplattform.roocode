import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Box,
  Paper,
  Chip,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {format, parseISO} from 'date-fns'; // Importing format and parseISO
import React from 'react';

import {ITaskProgress} from '@/types/task';

interface TaskTableProps {
  tasks: ITaskProgress[];
  expandedTaskId: string | null | number; // Allowing expandedTaskId to be number
  onToggleTaskExpansion: (taskId: string | number) => void; // Adjusting type to accept number
  formatStatus: (status: string) => string;
  getStatusColor: (status: string) => string;
  formatTimeSpent: (seconds: number | null) => string;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  expandedTaskId,
  onToggleTaskExpansion,
  formatStatus,
  getStatusColor,
  formatTimeSpent,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Task</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map(task => (
            <React.Fragment key={task.taskId}>
              <TableRow
                hover
                sx={{
                  '&:hover': {bgcolor: 'rgba(0, 0, 0, 0.04)'},
                  borderLeft: `4px solid ${getStatusColor(task.status)}`,
                }}
              >
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.taskType?.replace('_', ' ') || 'Task'}</TableCell>
                <TableCell>
                  <Chip
                    label={formatStatus(task.status)}
                    sx={{
                      bgcolor: getStatusColor(task.status),
                      color: 'white',
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {task.score !== null ? `${task.score} / ${task.maxScore}` : 'Not graded'}
                </TableCell>

                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onToggleTaskExpansion(task.taskId || '')}
                    aria-label="show more"
                  >
                    {expandedTaskId === task.taskId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                  <Collapse in={expandedTaskId === task.taskId} timeout="auto" unmountOnExit>
                    <Box sx={{margin: 2}}>
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
                                {formatTimeSpent(
                                  task.timeSpent !== null ? Number(task.timeSpent) : null
                                )}
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
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
