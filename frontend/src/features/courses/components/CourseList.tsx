import React, {useEffect, useState} from 'react';

import CourseService from '@features/courses/services/courseService';

// Ensure courses have a proper type
interface ICourse {
  id: number;
  title: string;
  // ...other properties...
}

export interface CourseListProps {
  courses: ICourse[];
}

import {Grid, Card, CardContent, Typography} from '@mui/material';

const CourseList: React.FC<CourseListProps> = ({courses}) => {
  return (
    <Grid container spacing={2}>
      {courses.map(course => (
        <Grid item xs={12} sm={6} md={4} key={course.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {/* Add course description here */}
                Course description goes here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CourseList;
