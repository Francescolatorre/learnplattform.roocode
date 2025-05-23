import React from 'react';
import {Link} from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/context/auth/AuthContext';
import enrollmentService from '@/services/resources/enrollmentService';
import {ICourse} from '@/types';

/**
 * Interface for CourseCard component props
 */
interface ICourseCardProps {
  course: ICourse;
  isInstructorView: boolean;
}

/**
 * CourseCard displays a course in a card format
 *
 * Features:
 * - Displays course title, description, and image
 * - Shows enrollment status
 * - Provides a link to view course details
 *
 * @returns A card component displaying course information
 */
const CourseCard: React.FC<ICourseCardProps> = ({course, isInstructorView}) => {
  const {isAuthenticated} = useAuth();

  // Enhanced query configuration for more reliable data fetching
  const {data: enrollment, isLoading: enrollmentLoading} = useQuery({
    queryKey: ['enrollment', course.id],
    queryFn: () => enrollmentService.getEnrollmentStatus(course.id),
    enabled: Boolean(course.id) && Boolean(isAuthenticated),
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000, // Consider data fresh for 1 second
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  return (
    <Card sx={{display: 'flex', flexDirection: 'column', height: '100%'}} data-testid={`course-card-${course.id}`}>
      <CardContent sx={{flexGrow: 1}}>
        <Typography variant="h6" component="h2" gutterBottom>
          {course.title}
        </Typography>

        {/* Status indicators */}
        <Box sx={{mb: 2, minHeight: 32, display: 'flex', alignItems: 'center', gap: 1}}>
          <Chip
            label={course.status}
            color={
              course.status === 'published' ? 'success' :
                course.status === 'draft' ? 'warning' :
                  course.status === 'archived' ? 'default' : 'primary'
            }
            size="small"
            data-testid="course-status-indicator"
          />
          {enrollmentLoading ? (
            <CircularProgress size={20} />
          ) : enrollment?.enrolled ? (
            <Chip
              label="Enrolled"
              color="primary"
              size="small"
              data-testid="enrolled-badge"
              sx={{mr: 1}}
            />
          ) : null}
          <Chip
            label={course.visibility}
            color="default"
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {course.description}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          component={Link}
          to={`/courses/${course.id}`}
          size="small"
          color="primary"

        >
          {enrollment?.enrolled ? 'Continue Learning' : 'View Details'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
