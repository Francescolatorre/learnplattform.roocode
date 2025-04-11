
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
import React, {useState, useMemo, useEffect} from 'react';

import {useDebounce} from '@utils/useDebounce';
import {Course, CourseStatus} from 'src/types/common/entities';

import {courseService, CourseFilterOptions} from '../../services/resources/courseService';
import CourseList from '../courses/CourseList';


interface FilterableCourseListProps {
  initialCourses?: Course[];
  title?: string;
  clientSideFiltering?: boolean;
  filterPredicate?: (course: Course, searchTerm: string) => boolean;
  emptyMessage?: string;
  noResultsMessage?: string;
  showStatusFilter?: boolean;
  showCreatorFilter?: boolean;
  onCoursesLoaded?: (courses: Course[]) => void;
  pageSize?: number;
  onPageChange?: (page: number) => void;
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
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [loading, setLoading] = useState<boolean>(!initialCourses);
  const [error, setError] = useState<{message: string; details?: string} | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<CourseStatus | ''>('');
  const [creator, setCreator] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!clientSideFiltering && (!initialCourses || initialCourses.length === 0)) {
      loadCourses();
    }
  }, [clientSideFiltering, initialCourses, debouncedSearchTerm, status, creator, page]);

  useEffect(() => {
    if (initialCourses) {
      setCourses(initialCourses);
    }
  }, [initialCourses]);

  useEffect(() => {
    if (onCoursesLoaded && courses.length > 0) {
      onCoursesLoaded(courses);
    }
  }, [courses, onCoursesLoaded]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterOptions: CourseFilterOptions = {
        page,
        page_size: pageSize,
      };

      if (debouncedSearchTerm) filterOptions.search = debouncedSearchTerm;
      if (status) filterOptions.status = status;
      if (creator) filterOptions.creator = creator;

      console.info('Fetching courses with options:', filterOptions);

      const response = await courseService.fetchCourses(filterOptions);

      // Log the complete response structure
      console.info('API Response structure:', {
        fullResponse: response,
        hasData: Boolean(response),
        dataKeys: response ? Object.keys(response) : [],
      });

      // Extract the paginated data from response.data
      const paginatedData = response;

      // Log the raw response first
      console.info('Paginated data:', paginatedData);

      // Validate the paginated response structure
      if (
        !paginatedData ||
        typeof paginatedData.count !== 'number' ||
        !Array.isArray(paginatedData.results)
      ) {
        throw new Error('Invalid paginated response format');
      }

      const {count, results} = paginatedData;

      // Log the extracted data for debugging
      console.info('Extracted course data:', {
        count,
        resultsLength: results.length,
        firstResult: results[0],
        paginatedStructure: {
          hasCount: 'count' in paginatedData,
          hasResults: 'results' in paginatedData,
          resultsIsArray: Array.isArray(results),
        },
      });

      setCourses(results);
      setTotalCount(count || 0);

      // Log state updates
      console.info('State updated with:', {
        courseCount: results.length,
        totalCount: count,
      });
    } catch (err) {
      console.error('Error loading courses:', err);
      setError({
        message: 'Failed to load courses',
        details: err instanceof Error ? err.message : 'Unknown error occurred',
      });
      setCourses([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value as CourseStatus);
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onPageChange?.(value);
  };

  const statusOptions = [
    {value: '', label: 'All'},
    {value: 'published', label: 'Published'},
    {value: 'draft', label: 'Draft'},
    {value: 'private', label: 'Private'},
  ];

  const filteredCourses = useMemo(() => {
    console.info('Filtering courses:', {
      clientSideFiltering,
      coursesLength: courses.length,
      searchTerm,
    });

    if (!clientSideFiltering) return courses;
    return courses.filter(course => filterPredicate(course, searchTerm));
  }, [clientSideFiltering, courses, searchTerm, filterPredicate]);

  const renderCourseList = () => {
    if (filteredCourses.length === 0) {
      return (
        <Typography color="textSecondary">
          {courses.length === 0 ? emptyMessage : noResultsMessage}
        </Typography>
      );
    }

    return (
      <>
        <CourseList
          courses={filteredCourses}
          onError={error => {
            console.error('CourseList error:', error);
            setError({
              message: 'Error displaying courses',
              details: error.message,
            });
          }}
        />
        {totalCount > pageSize && (
          <Box sx={{mt: 2, display: 'flex', justifyContent: 'center'}}>
            <Pagination
              count={Math.ceil(totalCount / pageSize)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Grid container spacing={2} sx={{mb: 3}}>
        <Grid item xs={12} md={showStatusFilter || showCreatorFilter ? 6 : 12}>
          <TextField
            fullWidth
            label="Search courses"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Grid>

        {showStatusFilter && (
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={handleStatusChange} label="Status">
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {loading ? (
        <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{color: 'error.main', my: 2}}>
          <Typography variant="h6">{error.message}</Typography>
          {error.details && <Typography variant="body2">{error.details}</Typography>}
        </Box>
      ) : (
        renderCourseList()
      )}
    </Box>
  );
};

export default FilterableCourseList;
