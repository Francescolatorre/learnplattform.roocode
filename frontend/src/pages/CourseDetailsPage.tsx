import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../hooks/useCourse';
import TaskManagementUI from '../components/TaskManagementUI';
import { useAuth } from '../features/auth/AuthContext';
import { CourseProgress } from '../types/progressTypes';
import { LinearProgress, Typography, Box, Paper, Container } from '@mui/material';
import { courseService } from '@services/apiService';

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId) return <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>Course ID not provided</Box>;

  const { course, loading, error } = useCourse(courseId);
  const [taskDescription, setTaskDescription] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const { user } = useAuth();
  const userRole = user?.role || localStorage.getItem('user_role') || 'student';

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await courseService.get(`/courses/${courseId}/tasks/`);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    loadTasks();
  }, [courseId]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!courseId) return;

      try {
        const progress = await courseService.get(`/courses/${courseId}/student-progress/${user?.id}/`, {
          includeDetails: false,
        });
        if (progress.message) {
          setCourseProgress(null);
          setTaskDescription(progress.message);
        } else {
          setCourseProgress(progress);
        }
      } catch (error) {
        console.error('Failed to fetch course progress:', error.message);
      }
    };

    if (course) {
      loadProgress();
    }
  }, [course, courseId, user?.id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>Loading course details...</Box>;
  if (error) return <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>Error: {error.message}</Box>;

  if (!course || Object.keys(course).length === 0) {
    return (
      <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>
        <Typography variant="body1" color="textSecondary">
          Course details not available.
        </Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h1">{course.title}</Typography>
        <Typography variant="body1">{course.description}</Typography>
      </Paper>

      {taskDescription && !courseProgress && (
        <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>
          <Typography variant="body1" color="textSecondary">
            {taskDescription}
          </Typography>
        </Box>
      )}

      {courseProgress && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Course Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={courseProgress.completionPercentage} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {`${Math.round(courseProgress.completionPercentage)}%`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">
              Completed Tasks: {courseProgress.completedTasks} / {courseProgress.totalTasks}
            </Typography>
            <Typography variant="body2">
              Average Score: {courseProgress.averageScore.toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', mb: 3 }}>
        <Paper>
          <Typography variant="h6">Instructor</Typography>
          <Typography variant="body1">
            {course.creator_details?.display_name || course.creator_details?.username || 'Not assigned'}
          </Typography>
        </Paper>
        <Paper>
          <Typography variant="h6">Status</Typography>
          <Typography variant="body1">{course.status || 'Not specified'}</Typography>
        </Paper>
        <Paper>
          <Typography variant="h6">Prerequisites</Typography>
          <Typography variant="body1">
            {Array.isArray(course.prerequisites) ? course.prerequisites.join(', ') : course.prerequisites || 'None'}
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h2">Course Tasks</Typography>
        <TaskManagementUI
          courseId={courseId}
          taskDescription={taskDescription}
          setTaskDescription={setTaskDescription}
          tasks={tasks}
          setTasks={setTasks}
          userRole={userRole}
        />
      </Paper>
    </Container>
  );
};

export default CourseDetailsPage;
