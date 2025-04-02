import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  LinearProgress,
  Button,
  Chip,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
} from '@mui/material';

import {
  CourseProgress,
  ModuleProgress,
  TaskProgress,
  QuizHistory,
} from '../../../types/common/progressTypes';
import ModuleProgressView from '../../student/components/ModuleProgressView';
import QuizHistoryDetail from '../../student/components/QuizHistoryDetail';

interface StudentDetailViewProps {
  studentProgress: CourseProgress;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ studentProgress }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModule, setSelectedModule] = useState<ModuleProgress | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizHistory | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const calculateModuleCompletion = (module: ModuleProgress) => {
    const completedTasks = module.taskProgress.filter(
      task => task.status === 'completed' || task.status === 'graded'
    ).length;
    return Math.round((completedTasks / module.taskProgress.length) * 100);
  };

  const getTaskStatusColor = (task: TaskProgress) => {
    switch (task.status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'not_started':
        return 'default';
      case 'graded':
        return 'primary';
      default:
        return 'default';
    }
  };

  const calculateStudentCompletion = () => {
    const completedTasks = studentProgress.taskProgress.filter(
      task => task.status === 'completed' || task.status === 'graded'
    ).length;
    return Math.round((completedTasks / studentProgress.taskProgress.length) * 100);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {studentProgress.studentId.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">Student: {studentProgress.studentId}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Overall Progress: {calculateStudentCompletion()}%
                </Typography>
                <Chip
                  label={`Average Score: ${studentProgress.averageScore.toFixed(1)}%`}
                  color={
                    studentProgress.averageScore >= 70
                      ? 'success'
                      : studentProgress.averageScore >= 50
                        ? 'warning'
                        : 'error'
                  }
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Modules" />
        <Tab label="Tasks" />
        <Tab label="Quiz History" />
        <Tab label="Recent Activity" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {studentProgress.moduleProgress.map(module => (
            <Grid item xs={12} md={6} key={module.moduleId}>
              <Card
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
                onClick={() => setSelectedModule(module)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {module.moduleTitle}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {calculateModuleCompletion(module)}% Complete
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={calculateModuleCompletion(module)} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Time Spent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentProgress.taskProgress.map(task => (
                <TableRow key={task.taskId}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {
                      studentProgress.moduleProgress.find(m => m.moduleId === task.moduleId)
                        ?.moduleTitle
                    }
                  </TableCell>
                  <TableCell>{task.taskType}</TableCell>
                  <TableCell>
                    <Chip label={task.status} color={getTaskStatusColor(task)} size="small" />
                  </TableCell>
                  <TableCell>
                    {task.score !== null ? `${task.score}/${task.maxScore}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {task.timeSpent !== null ? `${Math.round(task.timeSpent / 60)} min` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quiz</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Attempts</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Placeholder for quiz history - would be fetched from API */}
              {studentProgress.taskProgress
                .filter(task => task.taskType === 'quiz')
                .map(quiz => (
                  <TableRow key={quiz.taskId}>
                    <TableCell>{quiz.title}</TableCell>
                    <TableCell>
                      {quiz.score !== null ? `${quiz.score}/${quiz.maxScore}` : 'N/A'}
                    </TableCell>
                    <TableCell>{quiz.attempts}</TableCell>
                    <TableCell>
                      {quiz.submissionDate
                        ? new Date(quiz.submissionDate).toLocaleString()
                        : 'Not submitted'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                          // TODO: Implement actual quiz details fetch
                          // This is a placeholder
                          setSelectedQuiz({
                            quizId: quiz.taskId,
                            moduleId: quiz.moduleId,
                            quizTitle: quiz.title,
                            score: quiz.score || 0,
                            maxScore: quiz.maxScore,
                            attempts: quiz.attempts,
                            maxAttempts: quiz.maxAttempts,
                            date: quiz.submissionDate || new Date().toISOString(),
                            answers: [],
                            timeSpent: quiz.timeSpent || 0,
                          });
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Activity</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Task</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentProgress.recentActivity.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {activity.activityType === 'achievement_earned'
                      ? activity.achievementTitle
                      : activity.activityType}
                  </TableCell>
                  <TableCell>{activity.activityType}</TableCell>
                  <TableCell>
                    {
                      studentProgress.moduleProgress.find(m => m.moduleId === activity.moduleId)
                        ?.moduleTitle
                    }
                  </TableCell>
                  <TableCell>{activity.taskTitle || 'N/A'}</TableCell>
                  <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedModule && (
        <Box sx={{ mt: 4 }}>
          <ModuleProgressView moduleProgress={selectedModule} />
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setSelectedModule(null)}
          >
            Close Module Details
          </Button>
        </Box>
      )}

      {selectedQuiz && (
        <Box sx={{ mt: 4 }}>
          <QuizHistoryDetail quizHistory={selectedQuiz} />
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setSelectedQuiz(null)}
          >
            Close Quiz Details
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default StudentDetailView;
