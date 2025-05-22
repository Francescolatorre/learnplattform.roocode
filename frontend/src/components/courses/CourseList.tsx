import React, {useState, ReactElement} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Button,
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/Add';
import AddIcon from '@mui/icons-material/Add';
import {useQueryClient} from '@tanstack/react-query';
import {useNotification} from '@components/ErrorNotifier/useErrorNotifier';
import {ICourse} from '@/types/course';
import {formatDateRelative} from '@/utils/dateUtils';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import {useAuth} from '@/context/auth/AuthContext';
import EnrollmentStatusIndicator from './EnrollmentStatusIndicator';
import {courseService} from '@/services/resources/courseService';
import CourseCreation from './CourseCreation';

// Custom type extension for course with student count and enrollment status
interface ICourseWithEnrollment extends ICourse {
  student_count?: number;
  isEnrolled?: boolean;
  isCompleted?: boolean;
  description_html?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ICourseListProps {
  courses: ICourseWithEnrollment[] | ICourse[];
  title?: string;
  showInstructorActions?: boolean;
  onError?: (error: Error) => void;
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
  showInstructorActions = false,
  onError
}): ReactElement => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const notify = useNotification();
  const {user} = useAuth();
  const navigate = useNavigate();

  // Check if user has instructor or admin privileges
  const canManageTasks = user?.role === 'instructor' || user?.role === 'admin';

  // Close all modals
  const handleCloseModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setSelectedCourse(null);
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
  // Delete course handler
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    setIsDeleting(true);
    try {
      await courseService.deleteCourse(String(selectedCourse.id));
      await queryClient.invalidateQueries({queryKey: ['courses']});
      notify('Course deleted successfully', 'success');
      // Navigate back to course list if we're on the deleted course's detail page
      if (window.location.pathname.includes(`/courses/${selectedCourse.id}`)) {
        navigate('/instructor/courses');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      notify(errorMessage, 'error');
      if (onError) onError(err as Error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  };
  const handleSaveCourse = async (courseData: Partial<ICourse>) => {
    try {
      let savedCourse: ICourse;

      // If editing existing course
      if (selectedCourse?.id) {
        // Optimistically update the UI
        queryClient.setQueryData(['courses'], (old: ICourse[] | undefined) => {
          return (old || []).map(course =>
            course.id === selectedCourse.id
              ? {...course, ...courseData}
              : course
          );
        });

        savedCourse = await courseService.updateCourse(String(selectedCourse.id), courseData);
        notify('Course updated successfully', 'success');
      } else {
        // For new courses, we'll wait for the response since we need the ID
        savedCourse = await courseService.createCourse(courseData);
        notify('Course created successfully', 'success');
      }

      // Update cache with actual server response
      queryClient.setQueryData(['courses'], (old: ICourse[] | undefined) => {
        if (!old) return [savedCourse];
        if (selectedCourse?.id) {
          return old.map(course => course.id === savedCourse.id ? savedCourse : course);
        }
        return [...old, savedCourse];
      });

      // Also update the individual course query if it exists
      if (savedCourse.id) {
        queryClient.setQueryData(['course', String(savedCourse.id)], savedCourse);
      }

      handleCloseModals();
    } catch (err) {
      console.error('Error saving course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save course';
      notify(errorMessage, 'error');
      if (onError) onError(err as Error);

      // On error, rollback the optimistic update
      queryClient.setQueryData(['courses'], (old: ICourse[] | undefined) => {
        return selectedCourse?.id
          ? (old || []).map(course => course.id === selectedCourse.id ? selectedCourse : course)
          : old;
      });
    }
  };
  // Don't show anything if courses is still loading
  if (courses === undefined) {
    return <></>;
  }

  // If courses array is empty, show a message
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
        )}        {/* Show Add Course button for instructors and admins */}
        {canManageTasks && showInstructorActions && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            size="small"
          >
            Add Course
          </Button>
        )}
      </Box>      {/* We've removed the TaskCreation modal as tasks should be managed within course context */}

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
              />              {showInstructorActions && (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course.id, e);
                      }}
                      edge="end"
                      aria-label="view"
                      sx={{mr: 1}}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit course">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(course);
                        setEditModalOpen(true);
                      }}
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
                        setSelectedCourse(course);
                        setDeleteDialogOpen(true);
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

      {/* Course Create/Edit Modals */}
      <CourseCreation
        open={createModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveCourse}
      />

      <CourseCreation
        open={editModalOpen}
        course={selectedCourse || undefined}
        isEditing={true}
        onClose={handleCloseModals}
        onSave={handleSaveCourse}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >        <DialogTitle id="delete-dialog-title">
          Confirm Course Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the course "{selectedCourse?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCourse}
            disabled={isDeleting}
            color="error"
            variant="contained"
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseList;
