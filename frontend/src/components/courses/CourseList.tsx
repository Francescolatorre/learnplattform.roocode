import React from 'react';
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
  Paper
} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';

// Importiere den Typ direkt aus der Typdatei, um Casing-Probleme zu vermeiden
import {ICourse} from '@/types/course';
import {formatDateRelative} from '@/utils/dateUtils';

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
  // Get status color based on course status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
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
      {title && (
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
      )}

      <List sx={{width: '100%', bgcolor: 'background.paper'}}>
        {courses.map((course, index) => (
          <React.Fragment key={course.id}>
            <ListItem
              alignItems="flex-start"
              sx={{py: 2}}
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
                    <Typography variant="subtitle1" component="span">
                      {course.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={course.status}
                      color={getStatusColor(course.status) as any}
                    />

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
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{display: 'inline', mr: 1}}
                    >
                      {/* Sicherstellen dass description definiert ist */}
                      {course.description ?
                        (course.description.length > 150
                          ? `${course.description.substring(0, 150)}...`
                          : course.description)
                        : 'No description provided.'}
                    </Typography>

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
                <ListItemSecondaryAction>
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
                      onClick={() => {/* Add deletion handling */}}
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
