import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import { Course } from '../../../types/courseTypes';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea onClick={handleClick} sx={{ height: '100%' }}>
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {course.title}
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
            {course.description}
          </Typography>

          <Box mt={2}>
            <Typography variant="caption" color="textSecondary" display="block">
              Status: {course.status || 'Draft'}
            </Typography>

            <Typography variant="caption" color="textSecondary" display="block">
              Version: {course.version || '1.0'}
            </Typography>

            {course.creator_details && (
              <Typography variant="caption" color="textSecondary" display="block">
                Created by: {course.creator_details.username || 'Unknown'}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CourseCard;
