import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

type Task = {
  title: string;
  status: string;
  createdDate: string;
  creator: string;
  description: string;
  actions: string;
  courseId: string; // Add courseId to Task type
};

type TaskListProps = {
  tasks: Task[]; // Add tasks prop
  onSelectTask: (task: Task) => void;
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onSelectTask }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task, index) => (
            <TableRow key={index} onClick={() => onSelectTask(task)}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.createdDate}</TableCell>
              <TableCell>{task.actions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskList;
