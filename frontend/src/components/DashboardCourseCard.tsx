import React from 'react';
import { Box, Typography, Paper, Divider, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProgressIndicator from '@/components/shared/ProgressIndicator';

interface DashboardCourseCardProps {
  courseTitle: string;
  progress: {
    percentage: number;
    completed_tasks: number;
    total_tasks: number;
    last_activity?: string;
  };
  courseId: string;
}

const DashboardCourseCard: React.FC<DashboardCourseCardProps> = ({
  courseTitle,
  progress,
  courseId,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 6 },
      }}
      data-testid="dashboard-course-card"
      className="course-card"
    >
      <Link
        component={RouterLink}
        to={`/courses/${courseId}`}
        color="inherit"
        underline="none"
        sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
      >
        <Typography
          variant="h4"
          component="h3"
          className="course-title"
          gutterBottom
          align="center"
        >
          {courseTitle}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 2 }}>
          <ProgressIndicator
            value={progress.percentage}
            label={`${progress.completed_tasks} / ${progress.total_tasks} tasks completed`}
            showPercentage
          />
        </Box>

        {progress.last_activity && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Last activity: {progress.last_activity}
          </Typography>
        )}
      </Link>
    </Paper>
  );
};

export default DashboardCourseCard;
