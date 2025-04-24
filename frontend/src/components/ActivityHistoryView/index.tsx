
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GradeIcon from '@mui/icons-material/Grade';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {format, parseISO} from 'date-fns';
import React from 'react';

import {IActivityEntry} from '@/types/progress';

interface ActivityHistoryViewProps {
  recentActivity: IActivityEntry[];
}

const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({recentActivity}) => {
  const theme = useTheme();

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...recentActivity].sort((a, b) => {
    return parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime();
  });

  // Group activities by date
  const groupedActivities: Record<string, IActivityEntry[]> = {};

  sortedActivities.forEach(activity => {
    const date = format(parseISO(activity.timestamp), 'yyyy-MM-dd');
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  // Get icon based on activity type
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'submission':
        return <AssignmentTurnedInIcon />;
      case 'grade_received':
        return <GradeIcon />;
      case 'task_started':
        return <PlayCircleOutlineIcon />;
      case 'achievement_earned':
        return <EmojiEventsIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  // Get color based on activity type
  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'submission':
        return theme.palette.info.main;
      case 'grade_received':
        return theme.palette.success.main;
      case 'task_started':
        return theme.palette.warning.main;
      case 'achievement_earned':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Format activity text
  const getActivityText = (activity: IActivityEntry) => {
    switch (activity.activityType) {
      case 'submission':
        return `Submitted "${activity.taskTitle}"`;
      case 'grade_received':
        return `Received grade for "${activity.taskTitle}": ${activity.score}%`;
      case 'task_started':
        return `Started working on "${activity.taskTitle}"`;
      case 'achievement_earned':
        return `Earned achievement: ${activity.achievementTitle}`;
      default:
        return `Activity: ${activity.activityType}`;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Activity History
      </Typography>
      <Typography variant="body1" paragraph>
        Track your recent activities and progress in the course.
      </Typography>

      {Object.keys(groupedActivities).length === 0 ? (
        <Paper sx={{p: 3, textAlign: 'center'}}>
          <Typography>No activity data available.</Typography>
        </Paper>
      ) : (
        <Box>
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <Box key={date} sx={{mb: 4}}>
              <Paper sx={{p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText'}}>
                <Typography variant="h6">{format(parseISO(date), 'MMMM d, yyyy')}</Typography>
                <Typography variant="body2">
                  {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </Typography>
              </Paper>

              <List>
                {activities.map(activity => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{bgcolor: getActivityColor(activity.activityType)}}>
                          {getActivityIcon(activity.activityType)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="body1">{getActivityText(activity)}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {format(parseISO(activity.timestamp), 'h:mm a')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            {activity.achievementDescription && (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                component="span"
                                display="block"
                              >
                                {activity.achievementDescription}
                              </Typography>
                            )}
                            {activity.activityType === 'grade_received' &&
                              activity.score !== undefined && (
                                <Chip
                                  label={`${activity.score}%`}
                                  color={
                                    activity.score >= 70
                                      ? 'success'
                                      : activity.score >= 50
                                        ? 'warning'
                                        : 'error'
                                  }
                                  size="small"
                                  sx={{mt: 1}}
                                />
                              )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ActivityHistoryView;
