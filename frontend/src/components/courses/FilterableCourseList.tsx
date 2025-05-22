import {Box, Typography, TextField, CircularProgress, MenuItem, Select, FormControl, InputLabel, Grid, SelectChangeEvent, Pagination} from '@mui/material';
import React, {useState, useCallback, useEffect} from 'react';
import {ICourse, TCourseStatus} from '@/types/course';
import {useDebounce} from '@utils/useDebounce';
import {courseService, CourseFilterOptions} from '@services/resources/courseService';
import {IPaginatedResponse} from '@/types/paginatedResponse';
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
  initialCourses,
  title = 'Courses',
  clientSideFiltering = false,
  filterPredicate = (course, searchTerm) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()),
  emptyMessage = 'No courses available.',
  noResultsMessage = 'No courses match your search criteria.',
  showStatusFilter = false,
  showCreatorFilter = false,
  onCoursesLoaded,
  pageSize = 20,
  onPageChange,
  customFetchFunction,
  showInstructorActions = false,
}) => {
  const [courses, setCourses] = useState<ICourse[]>(initialCourses || []);
  const [loading, setLoading] = useState<boolean>(!initialCourses);
  const [error, setError] = useState<{message: string; details?: string} | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<TCourseStatus | ''>('');
  const [creator] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterOptions: CourseFilterOptions = {
        page,
        page_size: pageSize,
      };

      if (debouncedSearchTerm) filterOptions.search = debouncedSearchTerm;
      if (status) filterOptions.status = status as TCourseStatus;
      if (creator) filterOptions.creator = creator;

      const response = await (customFetchFunction ? customFetchFunction(filterOptions) : courseService.fetchCourses(filterOptions));

      if (!response || typeof response.count !== 'number' || !Array.isArray(response.results)) {
        throw new Error('Invalid response format from the server');
      }

      const {count, results} = response;
      setTotalCount(count);
      setCourses(results);
      onCoursesLoaded?.(results);
    } catch (err) {
      const error = err as Error;
      setError({
        message: 'Failed to load courses',
        details: error.message
      });
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, [customFetchFunction, debouncedSearchTerm, status, creator, page, pageSize, onCoursesLoaded]);

  useEffect(() => {
    if (!clientSideFiltering) {
      loadCourses();
    }
  }, [clientSideFiltering, loadCourses]);

  return (
    <Box data-testid="course-list-container" sx={{width: '100%'}}>
      {title && (
        <Typography variant="h6" gutterBottom data-testid="course-list-title">
          {title}
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={showStatusFilter ? 9 : 12}>
          <TextField
            fullWidth
            size="medium"
            variant="outlined"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputProps={{
              'data-testid': 'course-search-input'
            }}
            sx={{mb: 2}}
          />
        </Grid>
        {showStatusFilter && (
          <Grid item xs={12} md={3}>
            <FormControl variant="outlined" fullWidth sx={{mb: 2}}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={status}
                label="Status"
                onChange={(event: SelectChangeEvent<string>) => setStatus(event.target.value as TCourseStatus | '')}
                inputProps={{
                  'data-testid': 'course-status-filter-input'
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {loading ? (
        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}} data-testid="course-list-loading">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" data-testid="course-list-error">
          {error.message}
          {error.details && (
            <Typography variant="body2" color="error">
              {error.details}
            </Typography>
          )}
        </Typography>
      ) : courses.length === 0 ? (
        <Typography data-testid="course-list-empty">
          {searchTerm ? noResultsMessage : emptyMessage}
        </Typography>
      ) : (
        <>
          <CourseList
            courses={courses}
            showInstructorActions={showInstructorActions}
          />
          {totalCount > pageSize && (
            <Box sx={{mt: 2, display: 'flex', justifyContent: 'center'}}>
              <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={page}
                onChange={(_, value) => {
                  setPage(value);
                  onPageChange?.(value);
                }}
                data-testid="course-list-pagination"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default FilterableCourseList;
