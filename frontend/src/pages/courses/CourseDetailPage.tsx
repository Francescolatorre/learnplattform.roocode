import { Visibility, Person, DateRange } from '@mui/icons-material';
import { Box, Typography, Chip, Paper, Container, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';

import { modernCourseService } from '@/services/resources/modernCourseService';
import { ICourse } from '@/types/course';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams() as { id: string | undefined };

  const {
    data: course,
    isLoading,
    error,
  } = useQuery<ICourse>({
    queryKey: ['course', id],
    queryFn: () => modernCourseService.getCourseDetails(Number(id!)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading course details: {(error as Error).message}</div>;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>
          {course.title}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <Chip icon={<Person />} label={course.instructor_name || 'Unknown Instructor'} />
          <Chip icon={<Visibility />} label={course.visibility} />
          <Chip
            icon={<DateRange />}
            label={course.created_at ? new Date(course.created_at).toLocaleDateString() : ''}
          />
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
            <Typography paragraph>{course.learning_objectives}</Typography>
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

export default CourseDetailPage;
