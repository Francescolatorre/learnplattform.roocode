import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    LinearProgress,
    Card,
    CardContent,
    Tabs,
    Tab,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { fetchStudentProgress, fetchCourseStructure } from "@/services/progressService";
import { CourseProgress, ModuleProgress, TaskProgress } from '../types/progressTypes';
import UpcomingTasksList from './UpcomingTasksList';
import RecentActivityList from './RecentActivityList';
import ProgressSummaryCard from './ProgressSummaryCard';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

interface ProgressTrackingUIProps {
    courseId: string;
    studentId?: string; // Optional: If viewing as instructor
}

const ProgressTrackingUI: React.FC<ProgressTrackingUIProps> = ({
    courseId,
    studentId
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeTab, setActiveTab] = useState<number>(0);

    // Fetch progress data
    const {
        data: progressData,
        isLoading: progressLoading,
        error: progressError
    } = useQuery<CourseProgress>(
        ['progress', courseId, studentId],
        () => fetchStudentProgress(courseId, studentId),
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
        }
    );

    // Fetch course structure
    const {
        data: courseStructure,
        isLoading: structureLoading
    } = useQuery(
        ['courseStructure', courseId],
        () => fetchCourseStructure(courseId),
        {
            staleTime: 60 * 60 * 1000 // 1 hour
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
            const moduleProgress = progressData.moduleProgress.find(
                mp => mp.moduleId === module.id
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
            .filter(task =>
                task.status === 'pending' &&
                task.dueDate &&
                isAfter(parseISO(task.dueDate), now) &&
                isBefore(parseISO(task.dueDate), twoWeeksFromNow)
            )
            .sort((a, b) => {
                if (!a.dueDate || !b.dueDate) return 0;
                return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
            });
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
            {/* Progress Summary */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {studentId ? 'Student Progress' : 'My Progress'}
                </Typography>

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
            </Paper>

            {/* Tabs for different views */}
            <Box sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Overview" />
                    <Tab label="Modules" />
                    <Tab label="Performance" />
                    <Tab label="Activity" />
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
                                                data={moduleCompletionData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            max: 100,
                                                            ticks: {
                                                                callback: (value) => `${value}%`
                                                            }
                                                        }
                                                    }
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
                                                data={taskTypePerformanceData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom'
                                                        }
                                                    }
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
                        moduleProgress={progressData.moduleProgress}
                        courseStructure={courseStructure}
                    />
                )}

                {activeTab === 2 && (
                    // Performance tab content
                    <PerformanceAnalysisView
                        taskProgress={progressData.taskProgress}
                    />
                )}

                {activeTab === 3 && (
                    // Activity tab content
                    <ActivityHistoryView
                        recentActivity={progressData.recentActivity}
                    />
                )}
            </Box>
        </Box>
    );
};

// Additional components would be implemented separately
const ModuleProgressView = ({ moduleProgress, courseStructure }) => {
    // Implementation details...
    return <div>Module Progress View</div>;
};

const PerformanceAnalysisView = ({ taskProgress }) => {
    // Implementation details...
    return <div>Performance Analysis View</div>;
};

const ActivityHistoryView = ({ recentActivity }) => {
    // Implementation details...
    return <div>Activity History View</div>;
};

export default ProgressTrackingUI;

/*
    In the above code, we have implemented a new  ProgressTrackingUI  component that displays progress tracking data for a student or instructor.
    The component fetches progress data using React Query and displays various charts and lists based on the data.
    The component is divided into different tabs for Overview, Modules, Performance, and Activity. Each tab displays different types of data based on the progress data fetched from the server.
    The  ModuleProgressView ,  PerformanceAnalysisView , and  ActivityHistoryView  components are placeholders for additional components that would be implemented separately.
    Step 4: Add a Route for the Dashboard Page
    Now that we have implemented the  ProgressTrackingUI  component, we need to add a route for the dashboard page in the frontend application.
    Open the  App.tsx  file in the  frontend/src  directory and add a new route for the dashboard page.
*/
