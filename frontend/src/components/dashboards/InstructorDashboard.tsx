import React, {useEffect} from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Alert,
    Button,
    List,
    ListItem,
    ListItemText,
    Chip
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {Link as RouterLink} from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';

import {useAuth} from '@context/auth/AuthContext';
import {IInstructorDashboardData} from '@/types/analyticsTypes';
import ProgressIndicator from '@components/ProgressIndicator';
import progressService from '@/services/resources/progressService';
import {courseService} from '@services/resources/courseService';
import {ICourse, IPaginatedResponse} from '@/types';

/**
 * Dashboard for instructors showing course statistics, student progress,
 * tasks requiring attention, and performance analytics.
 *
 * @returns InstructorDashboard component
 */
const InstructorDashboard: React.FC = () => {
    const {user} = useAuth();

    // Log component lifecycle
    useEffect(() => {
        console.info('InstructorDashboard component mounted');
        console.info('User:', user);
        return () => {
            console.info('InstructorDashboard component unmounted');
        };
    }, [user]);

    // Fetch instructor dashboard data
    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        error: dashboardError
    } = useQuery<IInstructorDashboardData>({
        queryKey: ['instructorDashboard', user?.id],
        queryFn: () => progressService.fetchInstructorDashboardData(),
        enabled: !!user?.id && (user?.role === 'instructor' || user?.role === 'admin'),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch courses taught by this instructor
    const {
        data: coursesData,
        isLoading: isCoursesLoading,
        error: coursesError
    } = useQuery<IPaginatedResponse<ICourse>>({
        queryKey: ['instructorCourses', user?.id],
        queryFn: () => courseService.fetchInstructorCourses(),
        enabled: !!user?.id && (user?.role === 'instructor' || user?.role === 'admin'),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const isLoading = isDashboardLoading || isCoursesLoading;
    const error = dashboardError || coursesError;

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{textAlign: 'center', mt: 4}}>
                <Alert severity="error" sx={{maxWidth: 600, mx: 'auto', mb: 3}}>
                    {error instanceof Error ? error.message : 'An error occurred while loading data'}
                </Alert>
                <Typography variant="body1">
                    Please try refreshing the page or contact support if the problem persists.
                </Typography>
            </Box>
        );
    }

    // Extract courses from paginated response
    const courses = coursesData?.results || [];

    return (
        <Box sx={{p: 3}}>
            <Typography variant="h4" gutterBottom>
                Instructor Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Welcome, {user?.display_name || user?.username}!
            </Typography>

            {/* Stats Overview Section */}
            <Paper elevation={2} sx={{p: 3, mt: 3}}>
                <Typography variant="h5" gutterBottom>
                    Teaching Overview
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{height: '100%'}}>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <SchoolIcon color="primary" sx={{mr: 1}} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Active Courses
                                    </Typography>
                                </Box>
                                <Typography variant="h4">{dashboardData?.active_courses || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{height: '100%'}}>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <PeopleIcon color="primary" sx={{mr: 1}} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Total Students
                                    </Typography>
                                </Box>
                                <Typography variant="h4">{dashboardData?.total_students || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{height: '100%'}}>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <BarChartIcon color="primary" sx={{mr: 1}} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Average Completion
                                    </Typography>
                                </Box>
                                <Typography variant="h4">{dashboardData?.average_course_completion || 0}%</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{height: '100%'}}>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <AssignmentIcon color="primary" sx={{mr: 1}} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Tasks Needing Attention
                                    </Typography>
                                </Box>
                                <Typography variant="h4">{dashboardData?.tasks_requiring_attention?.length || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {/* Course Activity Section */}
            <Box sx={{mt: 4}}>
                <Typography variant="h5" gutterBottom>
                    Course Activity
                </Typography>

                {!courses || courses.length === 0 ? (
                    <Paper elevation={2} sx={{p: 3, textAlign: 'center'}}>
                        <Typography variant="h6" gutterBottom>
                            No Courses Created Yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            You haven't created any courses yet. Create your first course to get started.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/instructor/courses/new"
                            variant="contained"
                            color="primary"
                            sx={{mt: 2}}
                        >
                            Create New Course
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {courses.map((course) => (
                            <Grid item xs={12} md={6} key={course.id}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        {course.title}
                                    </Typography>

                                    <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                                        <Chip
                                            size="small"
                                            label={course.status}
                                            color={course.status === 'published' ? 'success' : 'default'}
                                        />
                                        <Chip
                                            size="small"
                                            label={course.visibility}
                                            color={course.visibility === 'public' ? 'primary' : 'default'}
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        {course.description && course.description.length > 100
                                            ? `${course.description.substring(0, 100)}...`
                                            : course.description}
                                    </Typography>

                                    {/* Course activity summary from dashboard data if available */}
                                    {dashboardData?.course_activity_summary?.find(activity => activity.course_id === course.id) && (
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto'}}>
                                            <Box>
                                                <Typography variant="body2">
                                                    <strong>Students:</strong> {dashboardData.course_activity_summary.find(
                                                        activity => activity.course_id === course.id
                                                    )?.student_count || 0}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Average Progress:</strong> {dashboardData.course_activity_summary.find(
                                                        activity => activity.course_id === course.id
                                                    )?.average_progress || 0}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', justifyContent: 'center', minWidth: 80}}>
                                                <ProgressIndicator
                                                    value={dashboardData.course_activity_summary.find(
                                                        activity => activity.course_id === course.id
                                                    )?.average_progress || 0}
                                                    size={60}
                                                />
                                            </Box>
                                        </Box>
                                    )}

                                    <Box sx={{mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between'}}>
                                        <Button
                                            component={RouterLink}
                                            to={`/courses/${course.id}`}
                                            variant="outlined"
                                            size="small"
                                        >
                                            View Course
                                        </Button>
                                        <Button
                                            component={RouterLink}
                                            to={`/instructor/courses/${course.id}/edit`}
                                            variant="outlined"
                                            size="small"
                                        >
                                            Edit
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Tasks Requiring Attention Section */}
            {dashboardData?.tasks_requiring_attention && dashboardData.tasks_requiring_attention.length > 0 && (
                <Paper elevation={2} sx={{p: 3, mt: 4}}>
                    <Typography variant="h5" gutterBottom>
                        Tasks Requiring Attention
                    </Typography>
                    <List>
                        {dashboardData.tasks_requiring_attention.map((task) => (
                            <ListItem
                                key={`${task.course_id}-${task.task_id}`}
                                divider
                                component={RouterLink}
                                to={`/courses/${task.course_id}/tasks/${task.task_id}`}
                                sx={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={task.task_title}
                                    secondary={`Course: ${task.course_title} • ${task.students_pending} students waiting`}
                                />
                                <Chip
                                    label={`${task.students_pending} pending`}
                                    color="warning"
                                    size="small"
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Performance Analytics Section */}
            {dashboardData?.performance_analytics && (
                <Paper elevation={2} sx={{p: 3, mt: 4}}>
                    <Typography variant="h5" gutterBottom>
                        Performance Analytics
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{mb: 2}}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Best Performing Course
                                    </Typography>
                                    <Typography variant="body1">
                                        {dashboardData.performance_analytics.best_performing_course.course_title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Average Score: {dashboardData.performance_analytics.best_performing_course.average_score.toFixed(1)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{mb: 2}}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Most Engaged Course
                                    </Typography>
                                    <Typography variant="body1">
                                        {dashboardData.performance_analytics.most_engaged_course.course_title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Engagement Score: {dashboardData.performance_analytics.most_engaged_course.engagement_score.toFixed(1)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Quick Links Section */}
            <Paper elevation={2} sx={{p: 3, mt: 4}}>
                <Typography variant="h5" gutterBottom>
                    Quick Links
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            component={RouterLink}
                            to="/instructor/courses/new"
                            variant="contained"
                            fullWidth
                            sx={{p: 2}}
                        >
                            New Course
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            component={RouterLink}
                            to="/instructor/courses"
                            variant="outlined"
                            fullWidth
                            sx={{p: 2}}
                        >
                            Manage Courses
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            component={RouterLink}
                            to="/instructor/students"
                            variant="outlined"
                            fullWidth
                            sx={{p: 2}}
                        >
                            Student Progress
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            component={RouterLink}
                            to="/instructor/reports"
                            variant="outlined"
                            fullWidth
                            sx={{p: 2}}
                        >
                            Analytics
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default InstructorDashboard;
