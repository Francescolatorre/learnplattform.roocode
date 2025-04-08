import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Grid, Card, CardContent, Typography, CardActionArea, Chip, Box, Alert} from '@mui/material';
import {Course} from 'src/types/common/entities';

export interface ICourseListProps {
  courses: Course[] | null | undefined;
  onError?: (error: Error) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'success';
    case 'draft':
      return 'warning';
    case 'private':
      return 'error';
    default:
      return 'default';
  }
};

const CourseList: React.FC<ICourseListProps> = ({courses, onError}) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("CourseList mounted");
    return () => {
      console.log("CourseList unmounted");
    };
  }, []);

  // Add more detailed logging
  console.log('CourseList render - courses prop:', courses);

  if (!courses) {
    return <Alert severity="info">No courses available.</Alert>;
  }


  if (!Array.isArray(courses)) {
    const error = new Error('Invalid courses data provided');
    onError?.(error);
    return <Alert severity="error">Unable to display courses.</Alert>;
  }

  if (courses.length === 0) {
    return <Alert severity="info">No courses found.</Alert>;
  }

  return (
    <Grid container spacing={2}>
      {courses.map(course => {
        if (!course || typeof course !== 'object') {
          console.error('Invalid course data:', course);
          return null;
        }

        const creatorName = course.creator_details?.display_name || 'Unknown Instructor';

        return (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardActionArea
                onClick={() => navigate(`/courses/${course.id}`)}
                aria-label={`View course: ${course.title}`}
              >
                <CardContent>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography variant="h6" component="div">
                      {course.title}
                    </Typography>
                    <Chip
                      label={course.status}
                      color={getStatusColor(course.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                  <Typography variant="caption" sx={{mt: 1, display: 'block'}}>
                    Created by {creatorName}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CourseList;
