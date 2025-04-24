import React, {useState} from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import {useQuery} from '@tanstack/react-query';

import {useAuth} from '@/context/auth/AuthContext';
import {courseService} from '@/services/resources/courseService';
import {ICourse, IPaginatedResponse} from '@/types';
import CourseCard from '@/components/courses/CourseCard';
import CourseList from '@/components/courses/CourseList';
import {useNotification} from '@/components/ErrorNotifier/useErrorNotifier';

/**
 * Page for instructors to manage their courses
 * Displays courses the instructor has created with options to view, edit, and create courses
 */
const InstructorCoursesPage: React.FC = () => {
    const {user} = useAuth();
    const notify = useNotification();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Fetch courses taught by this instructor
    const {
        data: coursesData,
        isLoading,
        error
    } = useQuery<IPaginatedResponse<ICourse>>({
        queryKey: ['instructorCourses', user?.id],
        queryFn: () => courseService.fetchInstructorCourses(),
        enabled: !!user?.id && (user?.role === 'instructor' || user?.role === 'admin'),
    });

    // Handle API errors when they occur
    React.useEffect(() => {
        if (error) {
            console.error('Failed to fetch instructor courses', error);
            notify({
                message: 'Failed to load your courses. Please try again later.',
                title: 'Course Management: Course Load Error',
                severity: 'error',
                duration: 6000,
            }, 'error');
        }
    }, [error, notify]);

    // Extract courses from the paginated response
    const courses = coursesData?.results || [];

    // Handle view mode change
    const handleViewModeChange = (_event: React.SyntheticEvent, newValue: 'grid' | 'list') => {
        setViewMode(newValue);
    };

    // Render grid view of courses
    const renderGridView = () => (
        <Grid container spacing={3}>
            {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <CourseCard
                        course={course}
                        isInstructorView={true}
                    />
                </Grid>
            ))}
        </Grid>
    );

    // Render list view using the CourseList component
    const renderListView = () => (
        <CourseList
            courses={courses}
            showInstructorActions={true}
        />
    );

    return (
        <Box sx={{p: 3}}>
            {/* Page Header with Title and Create Button */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h4" component="h1" sx={{fontWeight: 500}}>
                    Manage Courses
                </Typography>

                <Button
                    component={RouterLink}
                    to="/instructor/courses/new"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    size="medium"
                >
                    Create New Course
                </Button>
            </Box>

            {/* View Mode Selector */}
            <Paper sx={{mb: 3}}>
                <Tabs
                    value={viewMode}
                    onChange={handleViewModeChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{borderBottom: 1, borderColor: 'divider'}}
                >
                    <Tab
                        value="grid"
                        label="Grid View"
                        icon={<GridViewIcon />}
                        iconPosition="start"
                    />
                    <Tab
                        value="list"
                        label="List View"
                        icon={<ViewListIcon />}
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            {/* Loading State */}
            {isLoading && (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <Alert
                    severity="error"
                    sx={{mb: 3}}
                >
                    {error instanceof Error
                        ? error.message
                        : 'An error occurred while fetching your courses. Please try again.'}
                </Alert>
            )}

            {/* No Courses State */}
            {!isLoading && !error && courses.length === 0 && (
                <Paper elevation={2} sx={{p: 4, textAlign: 'center'}}>
                    <Typography variant="h6" gutterBottom>
                        You haven't created any courses yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Start by creating your first course. You'll be able to add learning tasks and manage student enrollments.
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/instructor/courses/new"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{mt: 2}}
                    >
                        Create Your First Course
                    </Button>
                </Paper>
            )}

            {/* Course List - conditionally render based on viewMode */}
            {!isLoading && !error && courses.length > 0 && (
                <Paper elevation={2} sx={{p: 3}}>
                    {viewMode === 'grid' ? renderGridView() : renderListView()}

                    {/* Pagination would go here */}
                    {coursesData?.next && (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                            <Button variant="outlined">
                                Load More Courses
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}

            {/* Stats Summary - Optional */}
            {!isLoading && !error && courses.length > 0 && (
                <Paper elevation={2} sx={{p: 3, mt: 3}}>
                    <Typography variant="h6" gutterBottom>
                        Summary
                    </Typography>
                    <Divider sx={{mb: 2}} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Courses
                            </Typography>
                            <Typography variant="h5">
                                {coursesData?.count || courses.length}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Published Courses
                            </Typography>
                            <Typography variant="h5">
                                {courses.filter(c => c.status === 'published').length}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Students
                            </Typography>
                            <Typography variant="h5">
                                {courses.reduce((total, course) => total + (course.student_count || 0), 0)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );
};

export default InstructorCoursesPage;
