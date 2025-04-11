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
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';

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
import {parseISO, isAfter, isBefore, addDays} from 'date-fns';
import React, {useState} from 'react';
import {Doughnut} from 'react-chartjs-2';

import {
  fetchCourseStructure,
  fetchStudentProgressByCourse,
} from 'src/services/resources/progressService';

import TaskDetailsView from 'src/components/TaskDetailsView';
import UpcomingTasksList from 'src/components/UpcomingTasksList/index.tsx';
import InstructorProgressDashboard from 'src/components/dashboards/InstructorProgressDashboard.tsx';
import ActivityHistoryView from 'src/components/ActivityHistoryView/index';

import PerformanceAnalysisView from './PerformanceAnalysisView';
import ProgressSummaryCard from './ProgressSummaryCard';


interface ProgressTrackingUIProps {
  courseId: string;
  studentId?: string;
  isInstructor?: boolean;
}

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Example fix for a common issue: Ensure the argument is valid
const renderProgress = (progress: number) => {
  if (progress < 0 || progress > 100) {
    throw new Error('Progress must be between 0 and 100');
  }
  return <div>{progress}%</div>;
};

const ProgressTrackingUI: React.FC<ProgressTrackingUIProps> = ({
  courseId,
  studentId,
  isInstructor = false,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const theme = useTheme();
  const [showInstructorView, setShowInstructorView] = useState<boolean>(false);

  // Fetch progress data
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery({
    queryKey: ['progress', courseId, studentId],
    queryFn: () => {
      if (!courseId) {
        console.error('courseId is undefined. Cannot fetch progress.');
        return null; // Return null to handle undefined courseId
      }
      if (!studentId) {
        console.warn('studentId is not provided, fetching progress for the current user.');
      }
      return fetchStudentProgressByCourse(courseId, studentId || 'defaultStudentId'); // Provide a fallback
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const {data: courseStructure, isLoading: structureLoading} = useQuery({
    queryKey: ['courseStructure', courseId],
    queryFn: () => fetchCourseStructure(courseId),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Prepare chart data for completion by module
  const prepareModuleCompletionData = () => {
    if (!progressData || !courseStructure) return null;

    const labels = courseStructure?.modules?.map((module: {title: string}) => module.title) ?? [];
    const completionData = courseStructure?.modules?.map((module: {tasks: {status: string}[]}) => {
      const completedTasks = module.tasks.filter(
        (task: {status: string}) => task.status === 'completed' || task.status === 'graded'
      ).length;
      return Math.round((completedTasks / module.tasks.length) * 100);
    }) ?? [];
    return {labels, datasets: [{label: 'Completion %', data: completionData, backgroundColor: theme.palette.primary.main, borderColor: theme.palette.primary.dark, borderWidth: 1}]};
  };

  // Prepare chart data for task type performance
  const prepareTaskTypePerformanceData = () => {
    if (!progressData) return null;

    // Group tasks by type and calculate average score
    const taskTypeGroups: Record<string, {total: number; count: number}> = {};

    progressData?.taskProgress?.forEach((task: {score: number | null; taskType: string}) => {
      if (task.score !== null && task.score !== undefined) {
        if (!taskTypeGroups[task.taskType]) {
          taskTypeGroups[task.taskType] = {total: 0, count: 0};
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

    return progressData?.taskProgress
      ?.filter((task: {status: string; dueDate: string}) => task.status === 'pending' && task.dueDate && isAfter(parseISO(task.dueDate), now) && isBefore(parseISO(task.dueDate), twoWeeksFromNow))
      ?.filter((task: {dueDate: string | null}) => task.dueDate !== null)
      ?.sort((a: {dueDate: string}, b: {dueDate: string}) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      ?.map((task: {title: string; dueDate: string}) => ({title: task.title, dueDate: task.dueDate})) ?? [];
  };

  // Calculate overall completion percentage
  const calculateOverallCompletion = () => {
    if (!progressData) return 0;

    const completedTasks = progressData?.taskProgress?.filter(
      (task: {status: string}) => task.status === 'completed' || task.status === 'graded'
    )?.length ?? 0;
    return Math.round((completedTasks / (progressData?.taskProgress?.length ?? 1)) * 100);
  };

  if (progressLoading || structureLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (progressError) {
    return (
      <Box sx={{p: 2}}>
        <Typography color="error">
          Error loading progress data: {(progressError).message}
        </Typography>
      </Box>
    );
  }

  if (!progressData) {
    return (
      <Box sx={{p: 2}}>
        <Typography>No progress data available.</Typography>
      </Box>
    );
  }

  interface EnrollmentStats {
    total: number;
    active: number;
    completed: number;
    dropped: number;
    completion_percentage: number;
  }

  interface AverageScores {
    quizzes: number;
  }

  interface ChallengingContent {
    questions: any[];
  }

  const overallCompletion = calculateOverallCompletion();
  const taskTypePerformanceData = prepareTaskTypePerformanceData();
  const upcomingTasks = prepareUpcomingTasks();

  return (
    <Box sx={{maxWidth: 1200, mx: 'auto', p: 2}}>
      <Paper sx={{p: 3, mb: 3}}>
        <Typography variant="h4" component="h1" gutterBottom>
          {showInstructorView
            ? 'Instructor Dashboard'
            : studentId
              ? 'Student Progress'
              : 'My Progress'}
        </Typography>

        {/* Instructor View Toggle */}
        {isInstructor && (
          <Box sx={{mb: 3, display: 'flex', justifyContent: 'flex-end'}}>
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
            <Box sx={{mb: 4}}>
              <Typography variant="h6" gutterBottom>
                Overall Completion: {overallCompletion}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={overallCompletion}
                sx={{height: 10, borderRadius: 5}}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ProgressSummaryCard
                  title="Tasks Completed"
                  title="Tasks Completed"
                  value={`${progressData?.completedTasks ?? 0}/${progressData?.totalTasks ?? 0}`}
                  icon="CheckCircle"
                  color={theme.palette.success.main}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ProgressSummaryCard
                  title="Average Score"
                  value={`${progressData?.averageScore?.toFixed(1) ?? '0.0'}%`}
                  icon="Grade"
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ProgressSummaryCard
                  title="Learning Objectives"
                  value={`${progressData?.achievedObjectives ?? 0}/${progressData?.totalObjectives ?? 0}`}
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
          <Box sx={{mb: 3}}>
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
                        Performance by Task Type
                      </Typography>
                      {taskTypePerformanceData && (
                        <Box sx={{height: 300, display: 'flex', justifyContent: 'center'}}>
                          <Doughnut
                            data={taskTypePerformanceData}
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


            {activeTab === 2 && (
              // Performance tab content
              <PerformanceAnalysisView taskProgress={progressData?.taskProgress ?? []} />
            )}

            {activeTab === 3 && (
              // Activity tab content
              <ActivityHistoryView recentActivity={progressData?.recentActivity ?? []} />
            )}

            {activeTab === 4 && (
              // Task Details tab content
              <TaskDetailsView taskProgress={progressData?.taskProgress ?? []} />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProgressTrackingUI;

