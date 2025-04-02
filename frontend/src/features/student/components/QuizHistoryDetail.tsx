import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material';

import { QuizHistory, QuizAnswer } from '../../../types/common/progressTypes';

interface QuizHistoryDetailProps {
  quizHistory: QuizHistory;
}

const QuizHistoryDetail: React.FC<QuizHistoryDetailProps> = ({ quizHistory }) => {
  const getAnswerColor = (answer: QuizAnswer) => {
    if (answer.isCorrect) return 'success';
    return 'error';
  };

  const calculateTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {quizHistory.quizTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ mr: 2 }}>
                {quizHistory.score}%
              </Typography>
              <Chip
                label={`${quizHistory.attempts}/${quizHistory.maxAttempts} Attempts`}
                color={quizHistory.attempts >= quizHistory.maxAttempts ? 'warning' : 'primary'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
                Time Spent: {calculateTimeSpent(quizHistory.timeSpent)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Date: {new Date(quizHistory.date).toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(quizHistory.score / 100) * 100}
              color={
                quizHistory.score >= 70 ? 'success' : quizHistory.score >= 50 ? 'warning' : 'error'
              }
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Performance Breakdown
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Total Questions: {quizHistory.answers.length}</Typography>
              <Typography variant="body2">
                Correct Answers: {quizHistory.answers.filter(a => a.isCorrect).length}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Your Answer</TableCell>
                <TableCell>Correct Answer</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizHistory.answers.map((answer, index) => (
                <TableRow key={index}>
                  <TableCell>{answer.questionText}</TableCell>
                  <TableCell>{answer.userAnswer}</TableCell>
                  <TableCell>{answer.correctAnswer}</TableCell>
                  <TableCell>
                    <Chip
                      label={answer.isCorrect ? 'Correct' : 'Incorrect'}
                      color={getAnswerColor(answer)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {answer.points}/{answer.maxPoints}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryDetail;
