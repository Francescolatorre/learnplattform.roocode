import React, { useState } from 'react';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Alert,
  AlertTitle
} from '@mui/material';
import { useCourseData } from '../../hooks/useCourseData';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ProgressIndicator from '../../components/common/ProgressIndicator';
import { Course } from '../../types/courseTypes';

// Extend Course with additional enrollment-specific properties
interface EnrollableCourse extends Course {
  instructor?: string;
  difficulty?: string;
  enrollmentStatus?: 'open' | 'closed' | 'in_progress';
  progress?: number;
}

const CourseEnrollmentPage: React.FC = () => {
  const {
    courses,

    isLoadingCourses,
    coursesError,
    enrollInCourse,
    unenrollFromCourse,
    isEnrolling,
    isUnenrolling
  } = useCourseData();

  // Fetch student progress for debugging
  const fetchStudentProgress = async (courseId: number) => {
    try {
      console.log(`Attempting to fetch student progress for course ${courseId}`);
      const response = await axios.get(`/api/v1/courses/${courseId}/student-progress/`);
      console.log('Student Progress Response:', response.data);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };

  useEffect(() => {
    console.log('CourseEnrollmentPage: Component Mounted');
    console.log('Courses:', courses);
    console.log('Loading Courses:', isLoadingCourses);
    console.log('Courses Error:', coursesError);

    // Attempt to fetch student progress for the first course
    if (courses.length > 0) {
      fetchStudentProgress(courses[0].id);
    }

    return () => console.log('CourseEnrollmentPage: Component Unmounted');
  }, [courses, isLoadingCourses, coursesError]);


  const [selectedCourse, setSelectedCourse] = useState<EnrollableCourse | null>(null);

  // Course enrollment columns
  const courseColumns = [
    {
      id: 'title',
      label: 'Course Title',
      minWidth: 170,
      format: (value: string, row: EnrollableCourse) => (
        <Box>
          <Typography variant="subtitle1">{value}</Typography>
          <Typography variant="body2" color="textSecondary">
            {console.log('Course Row:', row)}
            {row.instructor || 'Unknown Instructor'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {row.instructor || 'Unknown Instructor'}
          </Typography>
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Status',
      format: (value: string) => (
        <StatusChip
          status={value}
          colorMapping={{
            'draft': 'default',
            'published': 'success',
            'archived': 'secondary'
          }}
        />
      )
    },
    {
      id: 'visibility',
      label: 'Visibility',
      format: (value: string) => (
        <StatusChip
          status={value}
          colorMapping={{
            'public': 'success',
            'private': 'error',
            'restricted': 'warning'
          }}
        />
      )
    }
  ];

  const handleEnroll = async (course: EnrollableCourse) => {
    try {
      await enrollInCourse(course.id);

      // Attempt to fetch student progress after enrollment
      if (course.id) {
        fetchStudentProgress(course.id);
      }

      setSelectedCourse(null);
    } catch (error) {
      console.error('Enrollment failed', error);
    }
  };

  const handleUnenroll = async (course: EnrollableCourse) => {
    try {
      await unenrollFromCourse(course.id);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Unenrollment failed', error);
    }
  };

  // Transform courses to EnrollableCourse type
  const enrollableCourses: EnrollableCourse[] = courses.map(course => ({
    ...course,
    instructor: 'Unknown', // This would typically come from backend or creator details
    difficulty: 'beginner', // Default value, replace with actual data
    enrollmentStatus: course.status === 'published' ? 'open' : 'closed',
    progress: undefined // Optional progress
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Course Enrollment
      </Typography>

      {coursesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error Loading Courses</AlertTitle>
          {coursesError.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <DataTable
            columns={courseColumns}
            data={enrollableCourses}
            loading={isLoadingCourses}
            keyExtractor={(course) => course.id}
            onRowClick={setSelectedCourse}
            pagination
          />
        </Grid>

        <Grid item xs={12} md={4}>
          {selectedCourse ? (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedCourse.title}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {selectedCourse.description}
                </Typography>

                {selectedCourse.learning_objectives && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Learning Objectives</Typography>
                    <ul>
                      {selectedCourse.learning_objectives.map((obj, index) => (
                        <li key={index}>{obj}</li>
                      ))}
                    </ul>
                  </Box>
                )}

                {selectedCourse.progress !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Course Progress</Typography>
                    <ProgressIndicator
                      value={selectedCourse.progress}
                      variant="linear"
                    />
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleEnroll(selectedCourse)}
                  disabled={isEnrolling || selectedCourse.status !== 'published'}
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleUnenroll(selectedCourse)}
                  disabled={isUnenrolling}
                >
                  {isUnenrolling ? 'Unenrolling...' : 'Unenroll'}
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Alert severity="info">
              <AlertTitle>Select a Course</AlertTitle>
              Click on a course in the table to view details and enroll
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

const CourseEnrollmentPageWithQueryClient: React.FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <CourseEnrollmentPage />
    </QueryClientProvider>
  );
};

export default CourseEnrollmentPageWithQueryClient;
