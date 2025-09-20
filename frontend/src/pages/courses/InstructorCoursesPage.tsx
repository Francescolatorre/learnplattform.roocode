import { Box, Typography, Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import StatsSummary from '@/components/common/StatsSummary';
import FilterableCourseList from '@/components/courses/FilterableCourseList';
import { modernCourseService, type CourseFilterOptions } from '@/services/resources/modernCourseService';
import type { ICourse } from '@/types';

/**
 * Page for instructors to manage their courses
 * Displays courses the instructor has created with options to view, edit, and create courses
 */
const InstructorCoursesPage: React.FC = () => {
  // Default stats - these would normally come from an API call
  const stats = {
    courses: [] as ICourse[],
    totalCourses: 0,
    totalStudents: 0,
    publishedCourses: 0,
    tasksNeedingAttention: 0,
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box component="header" data-testid="course-management-header">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4">My Courses</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage and track your courses
            </Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/instructor/courses/new"
            data-testid="create-course-button"
          >
            Create Course
          </Button>
        </Box>
      </Box>
      <StatsSummary {...stats} />
      <FilterableCourseList
        data-testid="instructor-course-list"
        showStatusFilter={true}
        showCreatorFilter={false}
        clientSideFiltering={false}
        title=""
        emptyMessage="You haven't created any courses yet."
        noResultsMessage="No courses match your search criteria."
        customFetchFunction={(options: CourseFilterOptions) => modernCourseService.getInstructorCourses(options)}
        showInstructorActions={true}
      />
    </Box>
  );
};

export default InstructorCoursesPage;
