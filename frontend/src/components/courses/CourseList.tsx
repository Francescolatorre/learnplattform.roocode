import Button from '@mui/material/Button'; // Import the Button component
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import TaskCreation from '../taskCreation/TaskCreation'; // Import the TaskCreation component
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Box,
  Divider,
  Tooltip,
  Paper,
  CircularProgress
} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import {useQuery} from '@tanstack/react-query';
import enrollmentService from '@/services/resources/enrollmentService';

// Importiere den Typ direkt aus der Typdatei, um Casing-Probleme zu vermeiden
import {ICourse} from '@/types/course';
import {formatDateRelative} from '@/utils/dateUtils';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import {useAuth} from '@/context/auth/AuthContext';
import EnrollmentStatusIndicator from './EnrollmentStatusIndicator';

// Custom type extension for course with student count
interface ICourseWithEnrollment extends ICourse {
  student_count?: number;
}

export interface ICourseListProps {
  courses: ICourseWithEnrollment[] | ICourse[];
  title?: string;
  showInstructorActions?: boolean;
  onError?: (error: Error) => void; // Hinzugefügt für FilterableCourseList
}

/**
 * Displays a list of courses with optional instructor actions
 *
 * @param courses - Array of courses to display
 * @param title - Optional title for the list section
 * @param showInstructorActions - Whether to show instructor-specific actions (edit, delete)
 */
const CourseList: React.FC<ICourseListProps> = ({
  courses,
  title,
  showInstructorActions = false
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const {user, isAuthenticated} = useAuth();
  const navigate = useNavigate();

  // Check if user has instructor or admin privileges
  const canManageTasks = user?.role === 'instructor' || user?.role === 'admin';

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCourseClick = (courseId: number, event: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((event.target as Element).closest('.MuiListItemSecondaryAction-root')) {
      return;
    }
    // Navigate based on user role/view mode
    const path = showInstructorActions
      ? `/instructor/courses/${courseId}`
      : `/courses/${courseId}`;
    navigate(path);
  };

  // Get status color based on course status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  // Get a description preview
  const getDescriptionPreview = (course: ICourse) => {
    if (!course.description) {
      return "No description provided.";
    }
    return course.description.length > 150
      ? `${course.description.substring(0, 150)}...`
      : course.description;
  };

  const renderEnrollmentStatus = (courseId: string | number) => {
    const {data: enrollment, isLoading} = useQuery({
      queryKey: ['enrollment', courseId],
      queryFn: () => enrollmentService.getEnrollmentStatus(courseId),
      enabled: Boolean(courseId) && isAuthenticated,
      retry: 2,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true
    });

    if (isLoading) {
      return <CircularProgress size={20} />;
    }

    if (enrollment?.enrolled) {
      return (
        <Chip
          label="Enrolled"
          color="primary"
          size="small"
          data-testid="enrolled-badge"
          sx={{mr: 1}}
        />
      );
    }

    return null;
  };

  if (!courses.length) {
    return (
      <Paper elevation={0} sx={{p: 2, textAlign: 'center'}}>
        <Typography color="text.secondary">No courses found</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
        {title && (
          <Typography variant="h6" component="h2" data-test-id="course-list-element">
            {title}
          </Typography>
        )}

        {/* Only show Add Task button for instructors and admins */}
        {canManageTasks && showInstructorActions && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            size="small"
          >
            Add Task
          </Button>
        )}
      </Box>

      {/* Task creation dialog - only rendered if user has the right permissions */}
      {canManageTasks && showInstructorActions && (
        <TaskCreation open={isModalOpen} onClose={handleCloseModal} />
      )}

      <List sx={{width: '100%', bgcolor: 'background.paper'}}>
        {courses.map((course, index) => (
          <React.Fragment key={course.id}>
            <ListItem
              alignItems="flex-start"
              onClick={(e) => handleCourseClick(course.id, e)}
              sx={{
                py: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateX(8px)',
                  '& .MuiListItemSecondaryAction-root': {
                    opacity: 1,
                    transform: 'translateX(0)',
                  }
                }
              }}
              data-testid={`course-list-item-${course.id}`}
            >
              <ListItemAvatar>
                <Avatar
                  alt={course.title}
                  src={course.image_url || undefined}
                  sx={{bgcolor: theme => course.image_url ? 'transparent' : theme.palette.primary.main}}
                >
                  {!course.image_url && <SchoolIcon />}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1}}>
                    <Typography
                      variant="subtitle1"
                      component="span"
                      data-testid={`course-title-${course.id}`}
                      className="course-title"
                    >
                      {course.title}
                    </Typography>
                    {renderEnrollmentStatus(course.id)}
                    {showInstructorActions ? (
                      // Show published/draft status for instructors
                      <Chip
                        size="small"
                        label={course.status}
                        color={getStatusColor(course.status) as any}
                      />
                    ) : (
                      // Show enrollment status for students
                      <EnrollmentStatusIndicator
                        isEnrolled={!!course.isEnrolled}
                        compact={true}
                        isCompleted={!!course.isCompleted}
                      />
                    )}

                    {/* Only show student count if property exists */}
                    {'student_count' in course && typeof course.student_count === 'number' && (
                      <Tooltip title="Enrolled students">
                        <Box sx={{display: 'flex', alignItems: 'center', ml: 'auto', mr: 2}}>
                          <PeopleIcon fontSize="small" sx={{mr: 0.5}} />
                          <Typography variant="body2">
                            {course.student_count}
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    {/* Use Markdown renderer for course descriptions if HTML version is available */}
                    {course.description_html ? (
                      <Box sx={{
                        maxHeight: '150px',
                        overflow: 'hidden',
                        '& img': {display: 'none'},
                        '& h1,h2,h3': {fontSize: '1rem'}
                      }}>
                        <MarkdownRenderer
                          content={getDescriptionPreview(course)}
                          isPreview={true}
                          component="span" // Use span instead of div to avoid DOM nesting issues
                        />
                      </Box>
                    ) : (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{display: 'inline', mr: 1}}
                      >
                        {getDescriptionPreview(course)}
                      </Typography>
                    )}

                    <Box sx={{mt: 1, display: 'flex', gap: 2}}>
                      {course.created_at && (
                        <Typography variant="caption" color="text.secondary" display="block" component="span">
                          Created {formatDateRelative(course.created_at)}
                        </Typography>
                      )}

                      {course.updated_at && (
                        <Typography variant="caption" color="text.secondary" display="block" component="span">
                          Updated {formatDateRelative(course.updated_at)}
                        </Typography>
                      )}
                    </Box>
                  </React.Fragment>
                }
              />

              {showInstructorActions && (
                <ListItemSecondaryAction sx={{
                  transition: 'all 0.2s ease',
                  opacity: 0.4,
                  transform: 'translateX(-10px)',
                  '& .MuiIconButton-root': {
                    zIndex: 1
                  }
                }}>
                  <Tooltip title="View details">
                    <IconButton
                      component={RouterLink}
                      to={`/instructor/courses/${course.id}`}
                      edge="end"
                      aria-label="view"
                      sx={{mr: 1}}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit course">
                    <IconButton
                      component={RouterLink}
                      to={`/instructor/courses/${course.id}/edit`}
                      edge="end"
                      aria-label="edit"
                      sx={{mr: 1}}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete course">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add deletion handling
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              )}
            </ListItem>

            {index < courses.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default CourseList;
