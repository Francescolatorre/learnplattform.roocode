import {ErrorAlert} from '@components/common/ErrorAlert';
import {LoadingOverlay} from '@components/common/LoadingOverlay';
import {StatusChip} from '@components/common/StatusChip';
import {useAuth} from '@features/auth/context/AuthContext';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {useQuery, useMutation, useQueryClient, UseQueryResult} from '@tanstack/react-query';
import React from 'react';
import {useParams, useNavigate} from 'react-router-dom';

import {courseService} from '@services/resources/courseService';
import {EnrollmentService} from '@services/resources/enrollmentService';
import {Course, CompletionStatus} from 'src/types/common/entities';


interface ICourseEnrollmentProps {
  courseId: string;
}

interface EnrollmentResponse {
  status: CompletionStatus;
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
      return EnrollmentService.getUserEnrollment(courseId, user.id);
    },
    enabled: Boolean(courseId) && Boolean(user?.id),
  });

  // Handle enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: () =>
      EnrollmentService.create({
        course: Number(courseId),
        user: user?.id,
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
    return <LoadingOverlay />;
  }

  if (courseError) {
    return <ErrorAlert error={courseError} />;
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
            isEnrolling={enrollMutation.isLoading}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

// Sub-components for better organization
const CourseHeader: React.FC<{course: Course}> = ({course}) => (
  <Typography variant="h5" gutterBottom>
    {course.title}
  </Typography>
);

const CourseDescription: React.FC<{description: string}> = ({description}) => (
  <Typography variant="body1" color="textSecondary" paragraph>
    {description}
  </Typography>
);

const CourseStatusTags: React.FC<{course: Course}> = ({course}) => (
  <Box sx={{display: 'flex', gap: 1, mb: 2}}>
    <StatusChip status={course.status} />
    <Chip label={course.visibility} color="primary" size="small" variant="outlined" />
  </Box>
);

interface IEnrollmentActionsProps {
  enrollmentStatus: EnrollmentStatus | undefined;
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

const EnrollmentStatusAlert: React.FC<{status: CompletionStatus}> = ({status}) => (
  <Alert severity="info">
    You are already enrolled in this course.
    {status === 'active' && ' Your enrollment is active.'}
    {status === 'completed' && ' You have completed this course.'}
    {status === 'dropped' && ' You have dropped this course.'}
  </Alert>
);

export default CourseEnrollment;
