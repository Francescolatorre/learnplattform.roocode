import React, {useState, useEffect, useCallback} from 'react';
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
    Divider,
    Pagination
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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(9); // Fixed page size
    const [totalPages, setTotalPages] = useState<number>(1);

    // Component lifecycle logging
    useEffect(() => {
        console.info('InstructorCoursesPage: Component mounted');
        console.info('InstructorCoursesPage: User context:', user);

        return () => {
            console.info('InstructorCoursesPage: Component unmounted');
        };
    }, [user]);

    // Fetch courses taught by this instructor
    const {
        data: coursesData,
        isLoading,
        error,
        isError
    } = useQuery<IPaginatedResponse<ICourse>>({
        queryKey: ['instructorCourses', user?.id, currentPage, pageSize],
        queryFn: async () => {
            console.info('InstructorCoursesPage: Fetching instructor courses for user ID:', user?.id, 'page:', currentPage);
            try {
                const response = await courseService.fetchInstructorCourses({
                    page: currentPage,
                    page_size: pageSize
                });
                console.info('InstructorCoursesPage: Courses fetched successfully', {
                    courseCount: response?.results?.length || 0,
                    totalCount: response?.count || 0,
                    hasNextPage: !!response?.next
                });
                return response;
            } catch (error) {
                console.error('InstructorCoursesPage: Failed to fetch courses', error);
                // If we get a 404 (not found) for a page, it means we requested a page that doesn't exist
                if (error?.response?.status === 404 && currentPage > 1) {
                    console.info('InstructorCoursesPage: Invalid page requested, resetting to page 1');
                    setTimeout(() => setCurrentPage(1), 0);
                }
                throw error;
            }
        },
        enabled: !!user?.id && (user?.role === 'instructor' || user?.role === 'admin'),
        // Handle errors at the component level
        retryOnError: false,
    });

    // Calculate total pages when data is loaded
    useEffect(() => {
        if (coursesData?.count) {
            const calculatedTotalPages = Math.ceil(coursesData.count / pageSize);
            setTotalPages(calculatedTotalPages);
            console.info('InstructorCoursesPage: Total pages calculated:', calculatedTotalPages);
        }
    }, [coursesData?.count, pageSize]);

    // Handle API errors when they occur
    React.useEffect(() => {
        if (error) {
            console.error('InstructorCoursesPage: Failed to fetch instructor courses', error);

            // If it's a 404 error (page not found) and we're not on page 1, reset to page 1
            const statusCode = (error as any)?.response?.status;

            if (statusCode === 404 && currentPage > 1) {
                console.info('InstructorCoursesPage: Invalid page detected, resetting to page 1');
                setCurrentPage(1);
                notify({
                    message: 'The requested page does not exist. Showing the first page instead.',
                    severity: 'info',
                    duration: 4000,
                }, 'info');
            } else {
                notify({
                    message: 'Failed to load your courses. Please try again later.',
                    title: 'Course Management: Course Load Error',
                    severity: 'error',
                    duration: 6000,
                }, 'error');
            }
        }
    }, [error, notify, currentPage, setCurrentPage]);

    // Log when courses data changes
    useEffect(() => {
        if (coursesData) {
            console.info('InstructorCoursesPage: Courses data updated', {
                courseCount: coursesData.results?.length || 0,
                totalCount: coursesData.count || 0,
                hasNextPage: !!coursesData.next,
                hasPreviousPage: !!coursesData.previous
            });
        }
    }, [coursesData]);

    // Handle pagination change
    const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
        console.info('InstructorCoursesPage: Changing to page', page);
        setCurrentPage(page);
        // Scroll to top when changing pages
        window.scrollTo(0, 0);
    }, []);

    // Handle view mode change
    const handleViewModeChange = (_event: React.SyntheticEvent, newValue: 'grid' | 'list') => {
        console.info(`InstructorCoursesPage: View mode changed from ${viewMode} to ${newValue}`);
        setViewMode(newValue);
    };

    // Get the current page courses
    const courses = coursesData?.results || [];

    // Render grid view of courses
    const renderGridView = () => {
        console.debug('InstructorCoursesPage: Rendering grid view with', courses.length, 'courses');
        return (
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
    };

    // Render list view using the CourseList component
    const renderListView = () => {
        console.debug('InstructorCoursesPage: Rendering list view with', courses.length, 'courses');
        return (
            <CourseList
                courses={courses}
                showInstructorActions={true}
            />
        );
    };

    console.debug('InstructorCoursesPage: Render state', {
        isLoading,
        hasError: !!error,
        courseCount: courses.length,
        viewMode,
        currentPage,
        totalPages
    });

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
                    data-testid="create-course-button"
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
                        data-testid="create-first-course-button"
                    >
                        Create Your First Course
                    </Button>
                </Paper>
            )}

            {/* Course List - conditionally render based on viewMode */}
            {!isLoading && !error && courses.length > 0 && (
                <Paper elevation={2} sx={{p: 3}}>
                    {viewMode === 'grid' ? renderGridView() : renderListView()}

                    {/* Pagination Component */}
                    {totalPages > 1 && (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 3, py: 2}}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                                size="large"
                                data-testid="course-pagination"
                            />
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
