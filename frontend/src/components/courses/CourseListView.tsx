import React from 'react';
import { Grid } from '@mui/material';
import CourseCard from '@/components/courses/CourseCard';
import CourseList from '@/components/courses/CourseList';
import { ICourse } from '@/types';

interface CourseListViewProps {
  courses: ICourse[];
  viewMode: 'grid' | 'list';
}

const CourseListView: React.FC<CourseListViewProps> = ({ courses, viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <Grid container spacing={3}>
        {courses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard course={course} isInstructorView={true} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return <CourseList courses={courses} showInstructorActions={true} />;
};

export default CourseListView;
