import { Box, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import { ILearningTask } from '@/types';

interface TasksListProps {
  tasks: ILearningTask[];
}

const TasksList: React.FC<TasksListProps> = ({ tasks }) => {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map(task => (
        <li
          key={task.id}
          style={{
            marginBottom: '16px',
            padding: '12px',
            border: '1px solid #eee',
            borderRadius: '4px',
          }}
        >
          <Link
            to={`/instructor/courses/${task.course}/tasks/${task.id}`}
            style={{ textDecoration: 'none' }}
          >
            <Typography variant="h6" gutterBottom>
              {task.title}
            </Typography>
          </Link>

          {/* Use Markdown renderer for task descriptions */}
          {task.description_html ? (
            <Box sx={{ my: 1 }}>
              <MarkdownRenderer content={task.description} />
            </Box>
          ) : (
            <Typography variant="body2">{task.description}</Typography>
          )}

          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Order: {task.order}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Status: {task.is_published ? 'Published' : 'Draft'}
            </Typography>
          </Box>
        </li>
      ))}
    </ul>
  );
};

export default TasksList;
