import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Box, Typography, CircularProgress, Container} from '@mui/material';
import {fetchStudentProgressByCourse, getQuizHistory} from '@services/progressService';

import {CourseProgress, QuizHistory} from '../../../types/common/progressTypes';

import CourseDetailView from './CourseDetailView';
import QuizHistoryDetail from './QuizHistoryDetail';

import {useAuth} from '@features/auth/context/AuthContext';

interface StudentProgressDashboardProps {
  courseId: string;
}

const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({courseId}) => {
  const {user} = useAuth();

  // Fetch student progress
  const {
    data: studentProgress,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery<CourseProgress>(
    ['studentProgress', courseId, user?.id],
    () => {
      if (!courseId) {
        throw new Error('Missing required parameter: courseId');
      }
      if (!user?.id) {
        throw new Error('Missing required parameter: userId');
      }
      return fetchStudentProgressByCourse(courseId, user.id); // Ensure both parameters are defined
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    }
  );

  // Fetch quiz history
  const {
    data: quizHistory,
    isLoading: quizLoading,
    error: quizError,
  } = useQuery<QuizHistory[]>(['quizHistory', courseId], () => getQuizHistory(courseId), {
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const [selectedQuiz, setSelectedQuiz] = useState<QuizHistory | null>(null);

  if (progressLoading || quizLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (progressError || quizError) {
    return (
      <Box sx={{p: 2}}>
        <Typography color="error">
          Error loading data: {((progressError || quizError) as Error).message}
        </Typography>
      </Box>
    );
  }

  if (!studentProgress) {
    return (
      <Box sx={{p: 2}}>
        <Typography>No student progress data available.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{py: 4}}>
      {selectedQuiz ? (
        <Box>
          <QuizHistoryDetail quizHistory={selectedQuiz} />
          <Box sx={{mt: 2, textAlign: 'right'}}>
            <Typography
              variant="body2"
              color="primary"
              onClick={() => setSelectedQuiz(null)}
              sx={{
                cursor: 'pointer',
                display: 'inline-block',
                '&:hover': {textDecoration: 'underline'},
              }}
            >
              Back to Course Progress
            </Typography>
          </Box>
        </Box>
      ) : (
        <CourseDetailView
          courseProgress={studentProgress}
          onQuizSelect={quiz => setSelectedQuiz(quiz)}
        />
      )}
    </Container>
  );
};

export default StudentProgressDashboard;
