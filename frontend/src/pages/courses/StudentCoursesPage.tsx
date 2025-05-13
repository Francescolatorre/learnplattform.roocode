import React, {useState, useEffect, useCallback} from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Pagination
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import {useQuery} from '@tanstack/react-query';

import {useAuth} from '@/context/auth/AuthContext';
import {courseService} from '@/services/resources/courseService';
import {ICourse, IPaginatedResponse} from '@/types';
import CourseCard from '@/components/courses/CourseCard';
import CourseList from '@/components/courses/CourseList';
import {useNotification} from '@/components/ErrorNotifier/useErrorNotifier';
import FilterableCourseList from '@/components/courses/FilterableCourseList';

/**
 * Page for students to view available courses and their enrolled courses
 * Provides both grid and list views with filtering and pagination
 */
const StudentCoursesPage: React.FC = () => {
  const {user} = useAuth();
  const notify = useNotification();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(9); // Fixed page size
  const [totalPages, setTotalPages] = useState<number>(1);

  // Component lifecycle logging
  useEffect(() => {
    console.info('StudentCoursesPage: Component mounted');
    console.info('StudentCoursesPage: User context:', user);

    return () => {
      console.info('StudentCoursesPage: Component unmounted');
    };
  }, [user]);

  // Fetch available courses for student
  const {
    data: coursesData,
    isLoading,
    error,
    isError
  } = useQuery<IPaginatedResponse<ICourse>>({
    queryKey: ['studentAvailableCourses', user?.id, currentPage, pageSize],
    queryFn: async () => {
      console.info('StudentCoursesPage: Fetching available courses for user ID:', user?.id, 'page:', currentPage);
      try {
        // Use the existing fetchCourses method with options for available courses
        const response = await courseService.fetchCourses({
          page: currentPage,
          page_size: pageSize,
          status: 'published' // Only show published courses to students
        });
        console.info('StudentCoursesPage: Courses fetched successfully', {
          courseCount: response?.results?.length || 0,
          totalCount: response?.count || 0,
          hasNextPage: !!response?.next
        });
        return response;
      } catch (error) {
        console.error('StudentCoursesPage: Failed to fetch courses', error);
        // If we get a 404 (not found) for a page, it means we requested a page that doesn't exist
        if (error?.response?.status === 404 && currentPage > 1) {
          console.info('StudentCoursesPage: Invalid page requested, resetting to page 1');
          setTimeout(() => setCurrentPage(1), 0);
        }
        throw error;
      }
    },
    enabled: !!user?.id,
    // Handle errors at the component level
    retryOnError: false,
  });

  // Calculate total pages when data is loaded
  useEffect(() => {
    if (coursesData?.count) {
      const calculatedTotalPages = Math.ceil(coursesData.count / pageSize);
      setTotalPages(calculatedTotalPages);
      console.info('StudentCoursesPage: Total pages calculated:', calculatedTotalPages);
    }
  }, [coursesData?.count, pageSize]);

  // Handle API errors when they occur
  React.useEffect(() => {
    if (error) {
      console.error('StudentCoursesPage: Failed to fetch available courses', error);

      // If it's a 404 error (page not found) and we're not on page 1, reset to page 1
      const statusCode = (error as any)?.response?.status;

      if (statusCode === 404 && currentPage > 1) {
        console.info('StudentCoursesPage: Invalid page detected, resetting to page 1');
        setCurrentPage(1);
        notify({
          message: 'The requested page does not exist. Showing the first page instead.',
          severity: 'info',
          duration: 4000,
        }, 'info');
      } else {
        notify({
          message: 'Failed to load available courses. Please try again later.',
          title: 'Course Listing Error',
          severity: 'error',
          duration: 6000,
        }, 'error');
      }
    }
  }, [error, notify, currentPage, setCurrentPage]);

  // Log when courses data changes
  useEffect(() => {
    if (coursesData) {
      console.info('StudentCoursesPage: Courses data updated', {
        courseCount: coursesData.results?.length || 0,
        totalCount: coursesData.count || 0,
        hasNextPage: !!coursesData.next,
        hasPreviousPage: !!coursesData.previous
      });
    }
  }, [coursesData]);

  // Handle pagination change
  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
    console.info('StudentCoursesPage: Changing to page', page);
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  }, []);

  // Handle view mode change
  const handleViewModeChange = (_event: React.SyntheticEvent, newValue: 'grid' | 'list') => {
    console.info(`StudentCoursesPage: View mode changed from ${viewMode} to ${newValue}`);
    setViewMode(newValue);
  };

  // Get the current page courses
  const courses = coursesData?.results || [];

  // Render grid view of courses
  const renderGridView = () => {
    console.debug('StudentCoursesPage: Rendering grid view with', courses.length, 'courses');
    return (
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard
              course={course}
              isInstructorView={false}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render list view using the CourseList component
  const renderListView = () => {
    console.debug('StudentCoursesPage: Rendering list view with', courses.length, 'courses');
    return (
      <CourseList
        courses={courses}
        showInstructorActions={false}
      />
    );
  };

  console.debug('StudentCoursesPage: Render state', {
    isLoading,
    hasError: !!error,
    courseCount: courses.length,
    viewMode,
    currentPage,
    totalPages
  });

  return (
    <Box sx={{p: 3}}>
      {/* Page Header with Title */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h1" sx={{fontWeight: 500}}>
          Available Courses
        </Typography>
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
            : 'An error occurred while fetching courses. Please try again.'}
        </Alert>
      )}

      {/* No Courses State */}
      {!isLoading && !error && courses.length === 0 && (
        <Paper elevation={2} sx={{p: 4, textAlign: 'center'}}>
          <Typography variant="h6" gutterBottom>
            No courses available
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            There are no courses available for enrollment at the moment.
          </Typography>
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
    </Box>
  );
};

// Keep the existing InstructorCoursesPage and AdminCoursesPage exports
const InstructorCoursesPage: React.FC = () => {
  return (
    <Box sx={{p: 3}}>
      <FilterableCourseList
        title="My Teaching Courses"
        showStatusFilter={true}
      // Zusätzliche Parameter für Dozenten-spezifische Ansicht
      />
    </Box>
  );
};

const AdminCoursesPage: React.FC = () => {
  return (
    <Box sx={{p: 3}}>
      <FilterableCourseList
        title="All Courses (Admin View)"
        showStatusFilter={true}
        showCreatorFilter={true}
        emptyMessage="No courses have been created in the system yet."
      />
    </Box>
  );
};

export {StudentCoursesPage, InstructorCoursesPage, AdminCoursesPage};
