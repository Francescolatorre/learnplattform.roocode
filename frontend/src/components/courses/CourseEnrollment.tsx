import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import {ICourse} from '@/types/course';
import {TCompletionStatus} from '@/types/entities';
import {useAuth} from '@context/auth/AuthContext';
import {courseService} from '@services/resources/courseService';
import enrollmentService from '@services/resources/enrollmentService';

interface ICourseEnrollmentProps {
  courseId: string;
}

interface EnrollmentResponse {
  status: TCompletionStatus;
}

const CourseEnrollment: React.FC<ICourseEnrollmentProps> = ({courseId}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {user} = useAuth();

  // Fetch course data
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseDetails(courseId),
    enabled: Boolean(courseId),
  });

  // Fetch enrollment status
  const {data: enrollment, isLoading: enrollmentLoading} = useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn: async (): Promise<EnrollmentResponse | null> => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }
      const enrollments = await enrollmentService.fetchUserEnrollments();
      const enrollment = enrollments.find(e => e.course === Number(courseId));
      return enrollment ? {status: enrollment.status} : null;
    },
    enabled: Boolean(courseId) && Boolean(user?.id),
  });

  // Handle enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: () =>
      enrollmentService.create({
        course: Number(courseId),
        user: user ? Number(user.id) : undefined,
        status: 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['enrollment', courseId]});
    },
    onError: error => {
      console.error('Enrollment failed:', error);
      // Todo: Add error handling logic here
    },
  });

  if (courseLoading || enrollmentLoading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200}}><CircularProgress /></Box>;
  }

  if (courseError) {
    return <Alert severity="error">{String(courseError)}</Alert>;
  }

  if (!course) {
    return <Alert severity="info">Course information not available.</Alert>;
  }

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  const handleViewTasks = () => {
    navigate(`/courses/${courseId}/tasks`);
  };

  return (
    <Box sx={{mb: 4}}>
      {enrollMutation.isSuccess && (
        <Alert severity="success" sx={{mb: 3}}>
          You have successfully enrolled in this course!
        </Alert>
      )}

      <Card>
        <CardContent>
          <CourseHeader course={course} />
          <CourseDescription description={course.description} />
          <CourseStatusTags course={course} />

          <EnrollmentActions
            enrollmentStatus={enrollment?.status}
            isPublished={course.status === 'published'}
            onEnroll={handleEnroll}
            onViewTasks={handleViewTasks}
            isEnrolling={enrollMutation.isPending}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

// Sub-components for better organization
const CourseHeader: React.FC<{course: ICourse}> = ({course}) => (
  <Typography variant="h5" gutterBottom>
    {course.title}
  </Typography>
);

// Adding support for Markdown rendering in course descriptions
const CourseDescription: React.FC<{description?: string}> = ({description}) => (
  <Paper sx={{p: 3, mb: 4}}>
    <Typography variant="h6" gutterBottom>
      Course Description
    </Typography>
    {description ? (
      <Box>
        <MarkdownRenderer content={description} />
      </Box>
    ) : (
      <Typography variant="body1">
        No description available
      </Typography>
    )}
  </Paper>
);

const CourseStatusTags: React.FC<{course: ICourse}> = ({course}) => (
  <Box sx={{display: 'flex', gap: 1, mb: 2}}>
    <Chip label={course.status} color="primary" size="small" variant="outlined" />
    <Chip label={course.visibility} color="primary" size="small" variant="outlined" />
  </Box>
);

interface IEnrollmentActionsProps {
  enrollmentStatus: TCompletionStatus | undefined;
  isPublished: boolean;
  onEnroll: () => void;
  onViewTasks: () => void;
  isEnrolling: boolean;
}

const EnrollmentActions: React.FC<IEnrollmentActionsProps> = ({
  enrollmentStatus,
  isPublished,
  onEnroll,
  onViewTasks,
  isEnrolling,
}) => {
  if (enrollmentStatus) {
    return (
      <Box sx={{mt: 2}}>
        <EnrollmentStatusAlert status={enrollmentStatus} />
        <Button variant="contained" color="primary" sx={{mt: 2}} onClick={onViewTasks}>
          View Course Tasks
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        disabled={isEnrolling || !isPublished}
        onClick={onEnroll}
        sx={{mt: 2}}
      >
        {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
      </Button>

      {!isPublished && (
        <Alert severity="warning" sx={{mt: 2}}>
          This course is not currently published for enrollment.
        </Alert>
      )}
    </>
  );
};

const EnrollmentStatusAlert: React.FC<{status: TCompletionStatus}> = ({status}) => (
  <Alert severity="info">
    You are already enrolled in this course.
    {status === 'active' && ' Your enrollment is active.'}
    {status === 'completed' && ' You have completed this course.'}
    {status === 'dropped' && ' You have dropped this course.'}
  </Alert>
);

export default CourseEnrollment;
