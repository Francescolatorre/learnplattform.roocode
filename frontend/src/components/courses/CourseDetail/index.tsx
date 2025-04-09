import { AccessTime, Visibility, Person, DateRange } from '@mui/icons-material';
import { Box, Typography, Chip, Paper, Container, Grid } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Course } from 'src/types/common/entities';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // TODO: Replace with actual API call using React Query
  const course: Course = {
    id: 1,
    title: 'Loading...',
    description: '',
    learningObjectives: '',
    prerequisites: '',
    creator: { displayName: '' },
    status: '',
    visibility: '',
    createdAt: '',
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>
          {course.title}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <Chip icon={<Person />} label={course.creator.displayName} />
          <Chip icon={<Visibility />} label={course.visibility} />
          <Chip icon={<DateRange />} label={new Date(course.createdAt).toLocaleDateString()} />
        </Box>

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography paragraph>{course.description}</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Learning Objectives
            </Typography>
            <Typography paragraph>{course.learningObjectives}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Prerequisites
            </Typography>
            <Typography paragraph>{course.prerequisites}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CourseDetail;
