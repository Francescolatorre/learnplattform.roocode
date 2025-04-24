import React from 'react';
import {Grid, Typography, Box} from '@mui/material';

import {ICourse} from '@/types/course';
import CourseCard from './CourseCard';

/**
 * Interface for CourseList component props
 */
interface ICourseListProps {
  /**
   * Array of courses to display
   */
  courses: ICourse[];

  /**
   * Whether the list is in a loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Title to display above the course list
   * @optional
   */
  title?: string;

  /**
   * Error message to display if there was an error loading courses
   * @optional
   */
  error?: string;
}

/**
 * CourseList displays a grid of CourseCards
 *
 * Features:
 * - Responsive grid layout for courses
 * - Optional title and error message display
 * - Loading state handling
 *
 * @returns A grid of course cards
 */
const CourseList: React.FC<ICourseListProps> = ({
  courses,
  isLoading = false,
  title,
  error,
}) => {
  React.useEffect(() => {
    console.log('CourseList mounted');
    return () => {
      console.log('CourseList unmounted');
    };
  }, []);

  // Show loading skeleton cards
  if (isLoading) {
    return (
      <Box>
        {title && (
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        <Grid container spacing={4}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item key={item} xs={12} sm={6} md={4}>
              <CourseCard course={{} as ICourse} isLoading={true} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Box>
        {title && (
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Show empty state
  if (!courses || courses.length === 0) {
    return (
      <Box>
        {title && (
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        <Typography>No courses available.</Typography>
      </Box>
    );
  }

  console.log('CourseList render - courses prop:', courses);

  // Show courses
  return (
    <Box>
      {title && (
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid item key={course.id} xs={12} sm={6} md={4}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CourseList;
