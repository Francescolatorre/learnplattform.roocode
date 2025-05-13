import React, {useState, useEffect, useCallback} from 'react';
import {useDebug} from '@/utils/debug';
import {Box, TextField, InputAdornment, Button} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/context/auth/AuthContext';
import {courseService} from '@/services/resources/courseService';
import {ICourse, IPaginatedResponse} from '@/types';
import {useNotification} from '@/components/ErrorNotifier/useErrorNotifier';
import PageHeader from '@/components/common/PageHeader';
import ViewModeSelector from '@/components/common/ViewModeSelector';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import ErrorAlert from '@/components/common/ErrorAlert';
import NoCoursesMessage from '@/components/common/NoCoursesMessage';
import CoursesGridView from '@/components/courses/CoursesGridView';
import CourseList from '@/components/courses/CourseList';
import PaginationControls from '@/components/common/PaginationControls';
import StatsSummary from '@/components/common/StatsSummary';

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
    const [searchQuery, setSearchQuery] = useState<string>(''); // Add search state
    const [debouncedSearch, setDebouncedSearch] = useState<string>(''); // Add debounced search state

    // Component lifecycle logging
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            useDebug('InstructorCoursesPage: Component mounted'); // Log for debugging
            console.info('InstructorCoursesPage: User context:', user);
        }

        return () => {
            if (process.env.NODE_ENV === 'development') {
                console.info('InstructorCoursesPage: Component unmounted');
            }
        };
    }, [user]);

    // Add debounce effect for search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch courses taught by this instructor
    const {
        data: coursesData,
        isLoading,
        error,
        isError
    } = useQuery<IPaginatedResponse<ICourse>>({
        queryKey: ['instructorCourses', user?.id, currentPage, pageSize, debouncedSearch], // Add search to query key
        queryFn: async (): Promise<IPaginatedResponse<ICourse>> => {
            if (process.env.NODE_ENV === 'development') {
                console.info('InstructorCoursesPage: Fetching instructor courses for user ID:', user?.id, 'page:', currentPage);
            }
            try {
                const response = await courseService.fetchInstructorCourses({
                    page: currentPage,
                    page_size: pageSize,
                    search: debouncedSearch // Add search parameter
                });
                if (process.env.NODE_ENV === 'development') {
                    console.info('InstructorCoursesPage: Courses fetched successfully', {
                        courseCount: response?.results?.length || 0,
                        totalCount: response?.count || 0,
                        hasNextPage: !!response?.next
                    });
                }
                if (!response) {
                    throw new Error('Failed to fetch courses');
                }
                if (!response) {
                    throw new Error('Failed to fetch courses');
                }
                return response as IPaginatedResponse<ICourse>;
            } catch (error) {
                useDebug('InstructorCoursesPage: Failed to fetch courses', error); // Log for debugging

                if (!navigator.onLine) {
                    notify({
                        message: 'Network error: Please check your internet connection.',
                        severity: 'error',
                        duration: 6000,
                    }, 'error');
                    throw new Error('Network error: Please check your internet connection.');
                }
                // If we get a 404 (not found) for a page, it means we requested a page that doesn't exist
                if ((error as any)?.response?.status === 404 && currentPage > 1) {
                    console.info('InstructorCoursesPage: Invalid page requested, resetting to page 1');
                    setTimeout(() => setCurrentPage(1), 0);
                }
                throw error;
            }
        },
        enabled: !!user?.id && (user?.role === 'instructor' || user?.role === 'admin'),
        // Handle errors at the component level
    });

    // Calculate total pages when data is loaded
    useEffect(() => {
        if (coursesData && 'count' in coursesData) {
            const calculatedTotalPages = Math.ceil(coursesData.count / pageSize);
            setTotalPages(calculatedTotalPages);
            if (process.env.NODE_ENV === 'development') {
                console.info('InstructorCoursesPage: Total pages calculated:', calculatedTotalPages);
            }
        }
    }, [coursesData, pageSize]);

    // Handle API errors when they occur
    useEffect(() => {
        if (error) {
            useDebug('InstructorCoursesPage: Failed to fetch instructor courses', error); // Log for debugging

            if (!navigator.onLine) {
                notify({
                    message: 'Network error: Please check your internet connection.',
                    severity: 'error',
                    duration: 6000,
                }, 'error');
                return;
            }

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
                return;
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
            if (process.env.NODE_ENV === 'development') {
                console.info('InstructorCoursesPage: Courses data updated', {
                    courseCount: coursesData.results?.length || 0,
                    totalCount: coursesData.count || 0,
                    hasNextPage: !!coursesData.next,
                    hasPreviousPage: !!coursesData.previous
                });
            }
        }
    }, [coursesData]);

    // Handle pagination change
    const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
        useDebug('InstructorCoursesPage: Changing to page', page); // Log for debugging
        setCurrentPage(page);
        // Scroll to top when changing pages
        window.scrollTo(0, 0);
    }, []);

    // Handle view mode change
    const handleViewModeChange = (_event: React.SyntheticEvent, newValue: 'grid' | 'list') => {
        console.info(`InstructorCoursesPage: View mode changed from ${viewMode} to ${newValue}`);
        setViewMode(newValue);
    };

    // Add search handler
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        useDebug('InstructorCoursesPage: Search query updated:', event.target.value);
    };

    // Get the current page courses
    const courses = coursesData && 'results' in coursesData ? coursesData.results : [];
    const totalCourses = coursesData && 'count' in coursesData ? coursesData.count : courses.length;
    const publishedCourses = courses.filter((course: ICourse) => course.status === 'published').length;
    const totalStudents = courses.reduce((total: number, course: ICourse) => total + (course.student_count || 0), 0);
    const tasksNeedingAttention = 0; // Hardcoded to zero as the feature is not yet implemented

    return (
        <Box sx={{p: 3}}>
            <PageHeader />

            {/* Updated Search and View Mode Layout */}
            <Box sx={{
                mb: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                {/* Top row with view toggle */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}>
                    <ViewModeSelector
                        viewMode={viewMode}
                        onChange={handleViewModeChange}
                        data-testid="view-mode-selector"
                    />
                </Box>

                {/* Search row */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 1 // Add gap between search field and reset button
                }}>
                    <TextField
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        variant="outlined"
                        size="small"
                        sx={{width: '300px'}}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        data-testid="course-search-field"
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={!searchQuery}
                        onClick={() => {
                            setSearchQuery('');
                            useDebug('InstructorCoursesPage: Search reset');
                        }}
                        startIcon={<ClearIcon />}
                        data-testid="reset-search-button"
                    >
                        Reset
                    </Button>
                </Box>
            </Box>

            {isLoading && <LoadingIndicator />}

            {error && !isLoading && <ErrorAlert error={error} />}

            {!isLoading && !error && courses.length === 0 && <NoCoursesMessage />}

            {!isLoading && !error && courses.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        <CoursesGridView courses={courses} isInstructorView={true} />
                    ) : (
                        <CourseList
                            courses={courses}
                            showInstructorActions={true}
                            title="Your Courses"
                        />
                    )}
                    <PaginationControls
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        data-testid="pagination-controls"
                    />
                    <StatsSummary
                        courses={courses}
                        totalCourses={totalCourses}
                        totalStudents={totalStudents}
                        publishedCourses={publishedCourses}
                        tasksNeedingAttention={tasksNeedingAttention}
                    />
                </>
            )}
        </Box>
    );
};

export default InstructorCoursesPage;
