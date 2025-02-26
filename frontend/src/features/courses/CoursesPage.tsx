import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress, 
  SelectChangeEvent 
} from '@mui/material';
import { fetchCourses } from '../../services/courseService';
import { Course, CourseError } from '../../types/courseTypes';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<CourseError | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Course['category'] | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const result = await fetchCourses(selectedCategory || undefined);
        
        if (result.error) {
          setError(result.error);
          setCourses([]);
        } else {
          setCourses(result.courses);
          setError(null);
        }
      } catch {
        setError({ 
          message: 'An unexpected error occurred while fetching courses', 
          code: 0 
        });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [selectedCategory]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value as Course['category'] || null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" flexDirection="column">
        <Typography color="error" variant="h6" gutterBottom>
          Error: {error.message}
        </Typography>
        {error.code && (
          <Typography variant="body2" color="textSecondary">
            Error Code: {error.code}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Courses</Typography>
      
      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory || ''}
          onChange={handleCategoryChange}
          label="Category"
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="Web Development">Web Development</MenuItem>
          <MenuItem value="Data Science">Data Science</MenuItem>
          <MenuItem value="Cybersecurity">Cybersecurity</MenuItem>
        </Select>
      </FormControl>

      {courses.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No courses found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Box 
                border={1} 
                borderColor="grey.300" 
                borderRadius={2} 
                p={2} 
                height="100%"
                display="flex"
                flexDirection="column"
              >
                <Typography variant="h6" gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
                  {course.description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Category: {course.category}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CoursesPage;
