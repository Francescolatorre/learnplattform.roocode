// GridView.tsx
import { Grid } from '@mui/material';
import React from 'react';

import CourseCard from '@/components/courses/CourseCard';
import { ICourse } from '@/types';

interface GridViewProps {
  courses: ICourse[];
  isInstructorView?: boolean;
}

const CourseGridView: React.FC<GridViewProps> = ({ courses, isInstructorView }) => {
  return (
    <Grid container spacing={3}>
      {courses.map(course => (
        <Grid item xs={12} sm={6} md={4} key={course.id}>
          <CourseCard course={course} isInstructorView={isInstructorView} />
        </Grid>
      ))}
    </Grid>
  );
};

export default CourseGridView;
