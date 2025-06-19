import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import React from 'react';

import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

interface ILearningTaskCardProps {
  title: string;
  description: string;
  descriptionHtml?: boolean;
  dueDate: string;
  onViewTask: () => void;
}

const LearningTaskCard: React.FC<ILearningTaskCardProps> = ({
  title,
  description,
  descriptionHtml,
  dueDate,
  onViewTask,
}) => {
  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>

        {descriptionHtml ? (
          <Box
            sx={{
              mt: 1,
              maxHeight: '100px',
              overflow: 'hidden',
              '& img': { display: 'none' },
              '& h1,h2,h3': { fontSize: '1rem' },
            }}
          >
            <MarkdownRenderer content={description} />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
          Due Date: {dueDate}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onViewTask}>
          View Task
        </Button>
      </CardActions>
    </Card>
  );
};

export default LearningTaskCard;
