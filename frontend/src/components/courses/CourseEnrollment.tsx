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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import { enrollmentService } from '@/services/resources/enrollmentService';
import { ICourse } from '@/types/course';
import { TCompletionStatus } from '@/types/entities';
import { useAuth } from '@context/auth/AuthContext';
import { courseService } from '@services/resources/courseService';

interface ICourseEnrollmentProps {
  courseId: string;
}

interface IEnrollmentStatusResponse {
  status: TCompletionStatus;
  enrollmentId?: number;
}

const CourseEnrollment: React.FC<ICourseEnrollmentProps> = ({ courseId }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);

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
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn: async (): Promise<IEnrollmentStatusResponse | null> => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }
      // Find enrollments for this course
      const enrollments = await enrollmentService.findByFilter({ course: Number(courseId) });
      const enrollment = enrollments.find(e => e.course === Number(courseId));
      return enrollment
        ? {
            status: enrollment.status,
            enrollmentId: enrollment.id,
          }
        : null;
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
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
    },
    onError: error => {
      console.error('Enrollment failed:', error);
      // Todo: Add error handling logic here
    },
  });

  // Handle unenrollment mutation
  const unenrollMutation = useMutation({
    mutationFn: () => enrollmentService.unenrollFromCourseById(Number(courseId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
      setUnenrollDialogOpen(false);
    },
    onError: error => {
      console.error('Unenrollment failed:', error);
      // Add error handling logic here
    },
  });

  if (courseLoading || enrollmentLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
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

  const handleUnenroll = () => {
    setUnenrollDialogOpen(true);
  };

  const confirmUnenroll = () => {
    unenrollMutation.mutate();
  };

  const cancelUnenroll = () => {
    setUnenrollDialogOpen(false);
  };

  const handleViewTasks = () => {
    navigate(`/courses/${courseId}/tasks`);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {enrollMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          You have successfully enrolled in this course!
        </Alert>
      )}

      {unenrollMutation.isSuccess && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have successfully unenrolled from this course.
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
            onUnenroll={handleUnenroll}
            onViewTasks={handleViewTasks}
            isEnrolling={enrollMutation.isPending}
            isUnenrolling={unenrollMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Unenroll Confirmation Dialog */}
      <Dialog
        open={unenrollDialogOpen}
        onClose={cancelUnenroll}
        aria-labelledby="unenroll-dialog-title"
        aria-describedby="unenroll-dialog-description"
        data-testid="unenroll-confirmation-dialog"
      >
        <DialogTitle id="unenroll-dialog-title" data-testid="unenroll-dialog-title">
          Confirm Unenrollment
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="unenroll-dialog-description"
            data-testid="unenroll-dialog-description"
          >
            Are you sure you want to unenroll from &quot;{course.title}&quot;? This action will remove you
            from the course. Your progress may be preserved if you re-enroll later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelUnenroll} color="primary" data-testid="cancel-unenroll">
            Cancel
          </Button>
          <Button
            onClick={confirmUnenroll}
            color="error"
            variant="contained"
            disabled={unenrollMutation.isPending}
            data-testid="confirm-unenroll"
          >
            {unenrollMutation.isPending ? 'Processing...' : 'Unenroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Sub-components for better organization
const CourseHeader: React.FC<{ course: ICourse }> = ({ course }) => (
  <Typography variant="h5" gutterBottom>
    {course.title}
  </Typography>
);

// Adding support for Markdown rendering in course descriptions
const CourseDescription: React.FC<{ description?: string }> = ({ description }) => (
  <Paper sx={{ p: 3, mb: 4 }}>
    <Typography variant="h6" gutterBottom>
      Course Description
    </Typography>
    {description ? (
      <Box>
        <MarkdownRenderer content={description} />
      </Box>
    ) : (
      <Typography variant="body1">No description available</Typography>
    )}
  </Paper>
);

const CourseStatusTags: React.FC<{ course: ICourse }> = ({ course }) => (
  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
    <Chip label={course.status} color="primary" size="small" variant="outlined" />
    <Chip label={course.visibility} color="primary" size="small" variant="outlined" />
  </Box>
);

interface IEnrollmentActionsProps {
  enrollmentStatus: TCompletionStatus | undefined;
  isPublished: boolean;
  onEnroll: () => void;
  onUnenroll: () => void;
  onViewTasks: () => void;
  isEnrolling: boolean;
  isUnenrolling: boolean;
}

const EnrollmentActions: React.FC<IEnrollmentActionsProps> = ({
  enrollmentStatus,
  isPublished,
  onEnroll,
  onUnenroll,
  onViewTasks,
  isEnrolling,
  isUnenrolling,
}) => {
  if (enrollmentStatus) {
    return (
      <Box sx={{ mt: 2 }}>
        <EnrollmentStatusAlert status={enrollmentStatus} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onViewTasks}
            data-testid="view-tasks-button"
          >
            View Course Tasks
          </Button>
          {enrollmentStatus === 'active' && (
            <Button
              variant="outlined"
              color="error"
              onClick={onUnenroll}
              disabled={isUnenrolling}
              data-testid="unenroll-button"
            >
              {isUnenrolling ? 'Unenrolling...' : 'Unenroll'}
            </Button>
          )}
        </Box>
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
        sx={{ mt: 2 }}
        data-testid="enroll-button"
      >
        {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
      </Button>

      {!isPublished && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          This course is not currently published for enrollment.
        </Alert>
      )}
    </>
  );
};

const EnrollmentStatusAlert: React.FC<{ status: TCompletionStatus }> = ({ status }) => (
  <Alert severity={status === 'dropped' ? 'warning' : 'info'} data-testid="enrollment-status">
    {status === 'active' && 'You are currently enrolled in this course.'}
    {status === 'completed' && 'You have completed this course.'}
    {status === 'dropped' && 'You were previously enrolled in this course but have dropped it.'}
  </Alert>
);

export default CourseEnrollment;
