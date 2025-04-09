import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import React from 'react';

interface ICourseCardProps {
  title: string;
  description: string;
  instructor?: string;
  onViewDetails: () => void;
  onEnroll?: () => void;
}

const CourseCard: React.FC<ICourseCardProps> = ({
  title,
  description,
  instructor,
  onViewDetails,
  onEnroll,
}) => {
  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Instructor: {instructor}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onViewDetails}>
          View Details
        </Button>
        {onEnroll && (
          <Button size="small" onClick={onEnroll}>
            Enroll
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default CourseCard;
