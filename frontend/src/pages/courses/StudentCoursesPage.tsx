import {Box} from '@mui/material';
import React from 'react';

import FilterableCourseList from 'src/components/FilterableCourseList';

const StudentCoursesPage: React.FC = () => {
  return (
    <Box sx={{p: 3}}>
      {/* Beispiel 1: Server-seitige Filterung (Standard) */}
      <FilterableCourseList
        title="Available Courses (students)"
        showStatusFilter={true}
        onCoursesLoaded={courses => console.info('Loaded courses:', courses.length)}
      />

      {/* Alternative: Client-seitige Filterung mit initialCourses */}
      {/*
      <FilterableCourseList
        initialCourses={preloadedCourses}
        title="My Courses"
        clientSideFiltering={true}
        filterPredicate={(course, term) =>
          course.title.toLowerCase().includes(term.toLowerCase()) ||
          course.description.toLowerCase().includes(term.toLowerCase())
        }
      />
      */}
    </Box>
  );
};

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
