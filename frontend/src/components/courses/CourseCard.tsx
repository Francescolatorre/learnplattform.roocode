import React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {useNavigate, Link as RouterLink} from 'react-router-dom';

import {ICourse} from '@/types/course';
import EnrollmentStatusIndicator from './EnrollmentStatusIndicator';

/**
 * Interface for CourseCard component props
 */
interface ICourseCardProps {
  /**
   * Course data to display in the card
   */
  course: ICourse;

  /**
   * Whether the card is in a loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether the card is in instructor view
   * @default false
   */
  isInstructorView?: boolean;
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
const CourseCard: React.FC<ICourseCardProps> = ({course, isLoading = false, isInstructorView = false}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <Skeleton variant="rectangular" height={140} />
        <CardContent sx={{flexGrow: 1}}>
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={20} width="40%" />
          <Skeleton variant="text" height={20} width="100%" />
          <Skeleton variant="text" height={20} width="90%" />
        </CardContent>
        <CardActions>
          <Skeleton variant="rectangular" height={36} width={120} />
        </CardActions>
      </Card>
    );
  }

  const handleViewCourse = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      {course.image_url ? (
        <CardMedia
          component="img"
          height="140"
          image={course.image_url}
          alt={course.title}
        />
      ) : (
        <Box
          sx={{
            height: 140,
            backgroundColor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No image available
          </Typography>
        </Box>
      )}

      <CardContent sx={{flexGrow: 1}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1}}>
          <Typography gutterBottom variant="h6" component="h2" sx={{mb: 0}}>
            {course.title}
          </Typography>
          <EnrollmentStatusIndicator
            isEnrolled={!!course.isEnrolled}
            compact={true}
            isCompleted={!!course.isCompleted}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
          {course.instructor_name && `Instructor: ${course.instructor_name}`}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {course.description?.length > 120
            ? `${course.description.substring(0, 120)}...`
            : course.description}
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" color="primary" onClick={handleViewCourse}>
          {course.isEnrolled ? 'Continue Learning' : 'View Course'}
        </Button>
      </CardActions>

      {isInstructorView && (
        <CardActions>
          <Button
            component={RouterLink}
            to={`/instructor/courses/${course.id}/edit`}
            size="small"
            color="primary"
          >
            Edit
          </Button>
          {/* Other instructor actions */}
        </CardActions>
      )}
    </Card>
  );
};

export default CourseCard;
