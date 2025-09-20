import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
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
  Pagination,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback } from 'react';

import CourseCard from '@/components/courses/CourseCard';
import CourseList from '@/components/courses/CourseList';
import useNotification from '@/components/Notifications/useNotification';
import { useAuthStore } from '@/store/modernAuthStore';
import { ICourse, IPaginatedResponse } from '@/types';
import { modernCourseService } from '@/services/resources/modernCourseService';

/**
 * Page for students to browse and enroll in courses
 * Displays available courses with options to view details and enroll
 */
const StudentCourseEnrollmentPage: React.FC = () => {
  const { user } = useAuthStore();
  const notify = useNotification();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(9); // Fixed page size
  const [totalPages, setTotalPages] = useState<number>(1);

  // Component lifecycle logging
  useEffect(() => {
    console.info('StudentCourseEnrollmentPage: Component mounted');
    console.info('StudentCourseEnrollmentPage: User context:', user);

    return () => {
      console.info('StudentCourseEnrollmentPage: Component unmounted');
    };
  }, [user]);

  // Fetch available courses for students with proper retry and caching config
  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery<IPaginatedResponse<ICourse>>({
    queryKey: ['availableCourses', currentPage, pageSize],
    queryFn: async () => {
      console.info('StudentCourseEnrollmentPage: Fetching available courses, page:', currentPage);
      try {
        const response = await modernCourseService.getCourses({
          page: currentPage,
          page_size: pageSize,
        });
        console.info('StudentCourseEnrollmentPage: Courses fetched successfully', {
          courseCount: response?.results?.length || 0,
          totalCount: response?.count || 0,
          hasNextPage: !!response?.next,
        });
        return response;
      } catch (err) {
        console.error('StudentCourseEnrollmentPage: Failed to fetch courses', err);
        // If we get a 404 (not found) for a page, it means we requested a page that doesn't exist
        const apiError = err as { response?: { status?: number } };
        if (apiError?.response?.status === 404 && currentPage > 1) {
          console.info('StudentCourseEnrollmentPage: Invalid page requested, resetting to page 1');
          setTimeout(() => setCurrentPage(1), 0);
        }
        throw err;
      }
    },
    retry: 1,
    staleTime: 0, // Always validate on mount
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Calculate total pages when data is loaded
  useEffect(() => {
    if (coursesData && 'count' in coursesData) {
      const calculatedTotalPages = Math.ceil((coursesData.count as number) / pageSize);
      setTotalPages(calculatedTotalPages);
      console.info('StudentCourseEnrollmentPage: Total pages calculated:', calculatedTotalPages);
    }
  }, [coursesData, pageSize]);

  // Handle API errors when they occur
  React.useEffect(() => {
    if (error) {
      console.error('StudentCourseEnrollmentPage: Failed to fetch courses', error);

      // If it's a 404 error (page not found) and we're not on page 1, reset to page 1
      const apiError = error as { response?: { status?: number } };
      const statusCode = apiError?.response?.status;

      if (statusCode === 404 && currentPage > 1) {
        console.info('StudentCourseEnrollmentPage: Invalid page detected, resetting to page 1');
        setCurrentPage(1);
        notify(
          {
            message: 'The requested page does not exist. Showing the first page instead.',
            severity: 'info',
            duration: 4000,
          },
          'info'
        );
      } else {
        notify(
          {
            message: 'Failed to load courses. Please try again later.',
            title: 'Course Enrollment: Course Load Error',
            severity: 'error',
            duration: 6000,
          },
          'error'
        );
      }
    }
  }, [error, notify, currentPage, setCurrentPage]);

  // Handle pagination change
  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
    console.info('StudentCourseEnrollmentPage: Changing to page', page);
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  }, []);

  // Handle view mode change
  const handleViewModeChange = (_event: React.SyntheticEvent, newValue: 'grid' | 'list') => {
    console.info(`StudentCourseEnrollmentPage: View mode changed from ${viewMode} to ${newValue}`);
    setViewMode(newValue);
  };

  // Get the current page courses
  const courses = coursesData && 'results' in coursesData ? (coursesData.results as ICourse[]) : [];

  // Render grid view of courses
  const renderGridView = () => {
    console.debug(
      'StudentCourseEnrollmentPage: Rendering grid view with',
      (courses as ICourse[]).length,
      'courses'
    );
    return (
      <Grid container spacing={3}>
        {courses.map((course: ICourse) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard course={course} isInstructorView={false} />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render list view using the CourseList component
  const renderListView = () => {
    console.debug(
      'StudentCourseEnrollmentPage: Rendering list view with',
      courses.length,
      'courses'
    );
    return <CourseList courses={courses} showInstructorActions={false} />;
  };

  console.debug('StudentCourseEnrollmentPage: Render state', {
    isLoading,
    hasError: !!error,
    courseCount: courses.length,
    viewMode,
    currentPage,
    totalPages,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header with Title */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Available Courses
        </Typography>
      </Box>

      {/* View Mode Selector */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="grid" label="Grid View" icon={<GridViewIcon />} iconPosition="start" />
          <Tab value="list" label="List View" icon={<ViewListIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error
            ? error.message
            : 'An error occurred while fetching courses. Please try again.'}
        </Alert>
      )}

      {/* No Courses State */}
      {!isLoading && !error && courses.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No courses available for enrollment
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            There are currently no courses available for enrollment. Please check back later.
          </Typography>
        </Paper>
      )}

      {/* Course List - conditionally render based on viewMode */}
      {!isLoading && !error && courses.length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          {viewMode === 'grid' ? renderGridView() : renderListView()}

          {/* Pagination Component */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, py: 2 }}>
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

      {/* My Courses Summary - Only visible if user has enrolled courses */}
      {!isLoading && !error && courses.some((course: ICourse) => course.isEnrolled) && (
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Learning Status
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Enrolled Courses
              </Typography>
              <Typography variant="h5">
                {courses.filter((c: ICourse) => c.isEnrolled).length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Completed Courses
              </Typography>
              <Typography variant="h5">
                {courses.filter((c: ICourse) => c.isCompleted).length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">
                In Progress
              </Typography>
              <Typography variant="h5">
                {courses.filter((c: ICourse) => c.isEnrolled && !c.isCompleted).length}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default StudentCourseEnrollmentPage;
