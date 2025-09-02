import { Box } from '@mui/material';
import React from 'react';

import FilterableCourseList from '@/components/courses/FilterableCourseList';

/**
 * Page for students to view available courses and their enrolled courses
 * Provides both grid and list views with filtering and pagination
 */
const StudentCoursesPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <FilterableCourseList
        title="Available Courses"
        showStatusFilter={false}
        pageSize={9}
        emptyMessage="No courses are available for enrollment at the moment."
        noResultsMessage="No courses match your search criteria."
        filterPredicate={(course, searchTerm) => {
          // Search in title, description, and instructor name
          const searchLower = searchTerm.toLowerCase();
          return (
            course.title.toLowerCase().includes(searchLower) ||
            (course.description || '').toLowerCase().includes(searchLower) ||
            (course.instructor_name || '').toLowerCase().includes(searchLower)
          );
        }}
      />
    </Box>
  );
};

export default StudentCoursesPage;
