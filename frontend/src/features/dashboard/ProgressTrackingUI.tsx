import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import {
  fetchStudentProgress,
  fetchCourseStructure,
  fetchStudentProgressByCourse,
} from '../../services/resources/progressService';
import { CourseProgress, ModuleProgress, TaskProgress } from '../../types/progressTypes';
import ModuleProgressView from './components/ModuleProgressView';
import PerformanceAnalysisView from './components/PerformanceAnalysisView';
import ActivityHistoryView from './components/ActivityHistoryView';
import TaskDetailsView from './components/TaskDetailsView';
import InstructorProgressDashboard from '../instructor/components/InstructorProgressDashboard';
import UpcomingTasksList from '../../features/dashboard/UpcomingTasksList';
import ProgressSummaryCard from '../../features/dashboard/ProgressSummaryCard';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ProgressTrackingUIProps {
  courseId: string;
  studentId?: string; // Optional: If viewing as instructor
  isInstructor?: boolean; // Optional: To show instructor view
}

const ProgressTrackingUI: React.FC<ProgressTrackingUIProps> = ({
  courseId,
  studentId,
  isInstructor = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showInstructorView, setShowInstructorView] = useState<boolean>(false);

  // Fetch progress data
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery<CourseProgress>(
    ['progress', courseId, studentId],
    () => {
      if (!courseId) {
        console.error('courseId is undefined. Cannot fetch progress.');
        return;
      }
      if (!studentId) {
        console.warn('studentId is not provided, fetching progress for the current user.');
      }
      return fetchStudentProgressByCourse(courseId, studentId || 'defaultStudentId'); // Provide a fallback
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    }
  );

  // Fetch course structure
  const { data: courseStructure, isLoading: structureLoading } = useQuery(
    ['courseStructure', courseId],
    () => fetchCourseStructure(courseId),
    {
      staleTime: 60 * 60 * 1000, // 1 hour
    }
  );

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Prepare chart data for completion by module
  const prepareModuleCompletionData = () => {
    if (!progressData || !courseStructure) return null;

    const labels = courseStructure.modules.map(module => module.title);
    const completionData = courseStructure.modules.map(module => {
      const moduleProgress = progressData?.moduleProgress.find(
        (mp: ModuleProgress) => mp.moduleId === module.id
      );
      return moduleProgress ? moduleProgress.completionPercentage : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Completion %',
          data: completionData,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for task type performance
  const prepareTaskTypePerformanceData = () => {
    if (!progressData) return null;

    // Group tasks by type and calculate average score
    const taskTypeGroups: Record<string, { total: number; count: number }> = {};

    progressData.taskProgress.forEach(task => {
      if (task.score !== null && task.score !== undefined) {
        if (!taskTypeGroups[task.taskType]) {
          taskTypeGroups[task.taskType] = { total: 0, count: 0 };
        }
        taskTypeGroups[task.taskType].total += task.score;
        taskTypeGroups[task.taskType].count += 1;
      }
    });

    const taskTypes = Object.keys(taskTypeGroups);
    const averageScores = taskTypes.map(
      type => taskTypeGroups[type].total / taskTypeGroups[type].count
    );

    return {
      labels: taskTypes.map(type => type.replace('_', ' ')),
      datasets: [
        {
          label: 'Average Score',
          data: averageScores,
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
          ],
          borderColor: theme.palette.background.paper,
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare upcoming tasks
  const prepareUpcomingTasks = () => {
    if (!progressData) return [];

    const now = new Date();
    const twoWeeksFromNow = addDays(now, 14);

    return progressData.taskProgress
      .filter(task => {
        const dueDate = task.dueDate || ''; // Default to empty string if null
        return (
          task.status === 'pending' &&
          dueDate &&
          isAfter(parseISO(dueDate), now) &&
          isBefore(parseISO(dueDate), twoWeeksFromNow)
        );
      })
      .filter(task => task.dueDate !== null) // Filter out tasks with null dueDate
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0;
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
      })
      .map(task => ({
        title: task.title,
        dueDate: task.dueDate as string, // Ensure dueDate is a string
      }));
  };

  // Calculate overall completion percentage
  const calculateOverallCompletion = () => {
    if (!progressData) return 0;

    const completedTasks = progressData.taskProgress.filter(
      task => task.status === 'completed' || task.status === 'graded'
    ).length;

    return Math.round((completedTasks / progressData.taskProgress.length) * 100);
  };

  if (progressLoading || structureLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (progressError) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Error loading progress data: {(progressError as Error).message}
        </Typography>
      </Box>
    );
  }

  if (!progressData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No progress data available.</Typography>
      </Box>
    );
  }

  const overallCompletion = calculateOverallCompletion();
  const moduleCompletionData = prepareModuleCompletionData();
  const taskTypePerformanceData = prepareTaskTypePerformanceData();
  const upcomingTasks = prepareUpcomingTasks();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {showInstructorView
            ? 'Instructor Dashboard'
            : studentId
              ? 'Student Progress'
              : 'My Progress'}
        </Typography>

        {/* Instructor View Toggle */}
        {isInstructor && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color={showInstructorView ? 'secondary' : 'primary'}
              onClick={() => setShowInstructorView(!showInstructorView)}
            >
              {showInstructorView ? 'Switch to Student View' : 'Switch to Instructor View'}
            </Button>
          </Box>
        )}

        {/* Show Instructor Dashboard if in instructor view */}
        {showInstructorView && isInstructor ? (
          <InstructorProgressDashboard courseId={courseId} />
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Overall Completion: {overallCompletion}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={overallCompletion}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ProgressSummaryCard
                  title="Tasks Completed"
                  value={`${progressData.completedTasks}/${progressData.totalTasks}`}
                  icon="CheckCircle"
                  color={theme.palette.success.main}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ProgressSummaryCard
                  title="Average Score"
                  value={`${progressData.averageScore.toFixed(1)}%`}
                  icon="Grade"
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ProgressSummaryCard
                  title="Learning Objectives"
                  value={`${progressData.achievedObjectives}/${progressData.totalObjectives}`}
                  icon="EmojiEvents"
                  color={theme.palette.warning.main}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Only show tabs and content if not in instructor view */}
      {!showInstructorView && (
        <>
          {/* Tabs for different views */}
          <Box sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Modules" />
              <Tab label="Performance" />
              <Tab label="Activity" />
              <Tab label="Task Details" />
            </Tabs>
            <Divider />
          </Box>

          {/* Tab content */}
          <Box>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                {/* Overview tab */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Completion by Module
                      </Typography>
                      {moduleCompletionData && (
                        <Box sx={{ height: 300 }}>
                          <Bar
                            data={moduleCompletionData as any}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 100,
                                  ticks: {
                                    callback: value => `${value}%`,
                                  },
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance by Task Type
                      </Typography>
                      {taskTypePerformanceData && (
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                          <Doughnut
                            data={taskTypePerformanceData as any}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Upcoming Tasks
                      </Typography>
                      <UpcomingTasksList tasks={upcomingTasks} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              // Modules tab content
              <ModuleProgressView
                moduleProgress={progressData?.moduleProgress || []}
                courseStructure={
                  courseStructure || {
                    courseId: '',
                    courseTitle: '',
                    modules: [],
                    learningObjectives: [],
                  }
                }
              />
            )}

            {activeTab === 2 && (
              // Performance tab content
              <PerformanceAnalysisView taskProgress={progressData?.taskProgress || []} />
            )}

            {activeTab === 3 && (
              // Activity tab content
              <ActivityHistoryView recentActivity={progressData?.recentActivity || []} />
            )}

            {activeTab === 4 && (
              // Task Details tab content
              <TaskDetailsView taskProgress={progressData?.taskProgress || []} />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProgressTrackingUI;
