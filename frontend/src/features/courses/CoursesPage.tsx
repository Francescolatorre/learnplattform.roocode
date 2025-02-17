import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import course service for API calls
import { fetchCourses } from '../../services/courseService';

// Define Course interface
interface Course {
  id: number;
  title: string;
  description: string;
  status: string;
  visibility: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const fetchedCourses = await fetchCourses();
        setCourses(fetchedCourses);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCourseDetails = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return <Typography>Loading courses...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        My Courses
      </Typography>
      {courses.length === 0 ? (
        <Typography>No courses available.</Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{course.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {course.description}
                  </Typography>
                  <Typography variant="caption">
                    Status: {course.status} | Visibility: {course.visibility}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => handleCourseDetails(course.id)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CoursesPage;