import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  SelectChangeEvent,
  Pagination,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { ICourse, TCourseStatus } from '@/types/course';
import { IPaginatedResponse } from '@/types/paginatedResponse';
import { courseService, CourseFilterOptions } from '@services/resources/courseService';
import { useDebounce } from '@utils/useDebounce';

import CourseList from './CourseList';

interface FilterableCourseListProps {
  initialCourses?: ICourse[];
  title?: string;
  clientSideFiltering?: boolean;
  filterPredicate?: (course: ICourse, searchTerm: string) => boolean;
  emptyMessage?: string;
  noResultsMessage?: string;
  showStatusFilter?: boolean;
  showCreatorFilter?: boolean;
  onCoursesLoaded?: (courses: ICourse[]) => void;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  customFetchFunction?: (options: CourseFilterOptions) => Promise<IPaginatedResponse<ICourse>>;
  showInstructorActions?: boolean;
}

const FilterableCourseList: React.FC<FilterableCourseListProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialCourses,
  title = 'Courses',
  clientSideFiltering = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filterPredicate = (course, searchTerm) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()),
  emptyMessage = 'No courses available.',
  noResultsMessage = 'No courses match your search criteria.',
  showStatusFilter = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showCreatorFilter = false,
  onCoursesLoaded,
  pageSize = 20,
  onPageChange,
  customFetchFunction,
  showInstructorActions = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<TCourseStatus | ''>('');
  const [creator] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use React Query for data fetching with proper caching configuration
  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery<IPaginatedResponse<ICourse>, Error>({
    queryKey: [
      'courses',
      {
        page,
        pageSize,
        search: debouncedSearchTerm,
        status,
        creator,
      },
    ],
    queryFn: async () => {
      const filterOptions: CourseFilterOptions = {
        page,
        page_size: pageSize,
      };

      if (debouncedSearchTerm) filterOptions.search = debouncedSearchTerm;
      if (status) filterOptions.status = status;
      if (creator) filterOptions.creator = creator;

      // Use customFetchFunction if provided, otherwise use default courseService
      return customFetchFunction
        ? customFetchFunction(filterOptions)
        : courseService.fetchCourses(filterOptions);
    },
    // Prevent refetching too often
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    // Reduce unnecessary refetches
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !clientSideFiltering, // Only fetch if using server-side filtering
  });

  // Call onCoursesLoaded when data changes
  React.useEffect(() => {
    if (coursesData?.results && onCoursesLoaded) {
      onCoursesLoaded(coursesData.results);
    }
  }, [coursesData?.results, onCoursesLoaded]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (clientSideFiltering) {
      setPage(1); // Reset to first page on new search
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value as TCourseStatus);
    setPage(1); // Reset to first page on status change
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    if (onPageChange) {
      onPageChange(value);
    }
  };

  // Show loading state
  if (isLoading && !clientSideFiltering) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress data-testid="course-list-loading-spinner" />
      </Box>
    );
  }

  // Show error state
  if (error && !clientSideFiltering) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" data-testid="error-message">
          {error instanceof Error ? error.message : 'Failed to load courses'}
        </Typography>
      </Box>
    );
  }

  // Handle no courses
  if (!coursesData?.results?.length && !clientSideFiltering) {
    return (
      <Box sx={{ p: 3 }} data-testid="no-courses-message">
        <Typography>{searchTerm ? noResultsMessage : emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              data-testid="course-search-input"
              fullWidth
              label="Search courses"
              value={searchTerm}
              onChange={handleSearchChange}
              // data-testid="course-search"
            />
          </Grid>

          {showStatusFilter && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="course-status-filter"
                  value={status}
                  onChange={handleStatusChange}
                  label="Status"
                  data-testid="course-status-filter"
                  data-value={status}
                >
                  <MenuItem value="" data-value="">
                    All
                  </MenuItem>
                  <MenuItem value="draft" data-value="draft">
                    Draft
                  </MenuItem>
                  <MenuItem value="published" data-value="published">
                    Published
                  </MenuItem>
                  <MenuItem value="archived" data-value="archived">
                    Archived
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Course List */}
      <CourseList
        courses={coursesData?.results || []}
        showInstructorActions={showInstructorActions}
      />

      {/* Pagination */}
      {coursesData?.count && Math.ceil(coursesData.count / pageSize) > 1 && (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
          data-testid="pagination-controls"
        >
          <Pagination
            count={Math.ceil(coursesData.count / pageSize)}
            page={page}
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default FilterableCourseList;
