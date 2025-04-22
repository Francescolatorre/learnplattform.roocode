import {Box, CircularProgress, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';


import FilterableCourseList from '@components/FilterableCourseList';
import courseService from '@services/resources/courseService';
import {ICourse, IPaginatedResponse} from 'src/types/';


const StudentCourseEnrollmentPage: React.FC = () => {
  const {
    data: enrollmentsResponse,
    isLoading,
    error,
  } = useQuery<IPaginatedResponse<ICourse>, Error>({
    queryKey: ['courses'],
    queryFn: () => courseService.fetchCourses(),
  });

  if (isLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{textAlign: 'center', mt: 4}}>
        <Typography variant="h6" color="error">
          Failed to load enrollments. Please try again later.
        </Typography>
      </Box>
    );
  }

  const courses = enrollmentsResponse?.results || [];

  return (
    <Box sx={{p: 3}}>
      <FilterableCourseList
        courses={courses}
        title="Available Courses"
        // Optional: Benutzerdefinierte Filter-Funktion
        filterPredicate={(course, searchTerm) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
        }
      />
    </Box>
  );
};

export default StudentCourseEnrollmentPage;
