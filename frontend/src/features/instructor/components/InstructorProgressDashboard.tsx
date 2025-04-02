import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Chip,
  Button,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { ChartData } from 'chart.js';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { Bar, Doughnut } from 'react-chartjs-2';

import {
  fetchAllStudentsProgress,
  getContentEffectivenessData,
} from '../../../services/resources/progressService';
import { CourseProgress } from '../../../types/common/progressTypes';

interface InstructorProgressDashboardProps {
  courseId: string;
}

const InstructorProgressDashboard: React.FC<InstructorProgressDashboardProps> = ({ courseId }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch all students' progress
  const {
    data: studentsProgress,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery<CourseProgress[]>(
    ['allStudentsProgress', courseId],
    () => fetchAllStudentsProgress(courseId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    }
  );

  // Fetch content effectiveness data
  const {
    data: contentEffectiveness,
    isLoading: effectivenessLoading,
    error: effectivenessError,
  } = useQuery(['contentEffectiveness', courseId], () => getContentEffectivenessData(courseId), {
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle search term change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle student selection
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId === selectedStudentId ? null : studentId);
  };

  // Filter students based on search term
  const filteredStudents = studentsProgress
    ? studentsProgress.filter(student =>
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Calculate class average completion
  const calculateClassAverage = () => {
    if (!studentsProgress || studentsProgress.length === 0) return 0;

    const totalCompletion = studentsProgress.reduce((sum, student) => {
      const completedTasks = student.taskProgress.filter(
        task => task.status === 'completed' || task.status === 'graded'
      ).length;
      const completionPercentage = (completedTasks / student.taskProgress.length) * 100;
      return sum + completionPercentage;
    }, 0);

    return Math.round(totalCompletion / studentsProgress.length);
  };

  // Calculate class average score
  const calculateClassAverageScore = () => {
    if (!studentsProgress || studentsProgress.length === 0) return 0;

    const totalScore = studentsProgress.reduce((sum, student) => sum + student.averageScore, 0);
    return Math.round((totalScore / studentsProgress.length) * 10) / 10;
  };

  // Identify at-risk students (less than 30% completion or average score below 60%)
  const identifyAtRiskStudents = () => {
    if (!studentsProgress) return [];

    return studentsProgress.filter(student => {
      const completedTasks = student.taskProgress.filter(
        task => task.status === 'completed' || task.status === 'graded'
      ).length;
      const completionPercentage = (completedTasks / student.taskProgress.length) * 100;

      return completionPercentage < 30 || student.averageScore < 60;
    });
  };

  const prepareModuleCompletionData = (): ChartData<'bar'> | null => {
    if (!studentsProgress || studentsProgress.length === 0) return null;

    // Get all unique module IDs
    const moduleIds = new Set<string>();
    studentsProgress.forEach(student => {
      student.moduleProgress.forEach(module => {
        moduleIds.add(module.moduleId);
      });
    });

    // Calculate average completion for each module
    const moduleCompletionData = Array.from(moduleIds).map(moduleId => {
      const modulesWithId = studentsProgress.flatMap(student =>
        student.moduleProgress.filter(module => module.moduleId === moduleId)
      );

      const totalCompletion = modulesWithId.reduce(
        (sum, module) => sum + module.completionPercentage,
        0
      );
      const averageCompletion =
        modulesWithId.length > 0 ? totalCompletion / modulesWithId.length : 0;

      // Get module title from the first student that has this module
      const moduleTitle = modulesWithId.length > 0 ? modulesWithId[0].moduleTitle : moduleId;

      return {
        moduleId,
        moduleTitle,
        averageCompletion,
      };
    });

    // Sort by module ID
    moduleCompletionData.sort((a, b) => a.moduleId.localeCompare(b.moduleId));

    return {
      labels: moduleCompletionData.map(module => module.moduleTitle),
      datasets: [
        {
          label: 'Average Completion %',
          data: moduleCompletionData.map(module => module.averageCompletion),
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for task type performance chart
  const prepareTaskTypePerformanceData = (): ChartData<'doughnut'> | null => {
    if (!studentsProgress || studentsProgress.length === 0) return null;

    // Get all unique task types
    const taskTypes = new Set<string>();
    studentsProgress.forEach(student => {
      student.taskProgress.forEach(task => {
        if (task.score !== null) {
          taskTypes.add(task.taskType);
        }
      });
    });

    // Calculate average score for each task type
    const taskTypeScores = Array.from(taskTypes).map(taskType => {
      const tasksWithType = studentsProgress.flatMap(student =>
        student.taskProgress.filter(task => task.taskType === taskType && task.score !== null)
      );

      const totalScore = tasksWithType.reduce((sum, task) => sum + (task.score || 0), 0);
      const totalMaxScore = tasksWithType.reduce((sum, task) => sum + task.maxScore, 0);

      const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

      return {
        taskType,
        averagePercentage,
      };
    });

    return {
      labels: taskTypeScores.map(type => type.taskType.replace('_', ' ')),
      datasets: [
        {
          label: 'Average Score %',
          data: taskTypeScores.map(type => type.averagePercentage),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
          ],
          borderColor: theme.palette.background.paper,
          borderWidth: 1,
        },
      ],
    };
  };

  // Get status chip color based on completion percentage
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 70) return theme.palette.success.main;
    if (percentage >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get status chip color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Calculate completion percentage for a student
  const calculateStudentCompletion = (student: CourseProgress) => {
    const completedTasks = student.taskProgress.filter(
      task => task.status === 'completed' || task.status === 'graded'
    ).length;
    return Math.round((completedTasks / student.taskProgress.length) * 100);
  };

  const classAverage = calculateClassAverage();
  const classAverageScore = calculateClassAverageScore();
  const atRiskStudents = identifyAtRiskStudents();
  const moduleCompletionData = prepareModuleCompletionData();
  const taskTypePerformanceData = prepareTaskTypePerformanceData();

  if (progressLoading || effectivenessLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (progressError || effectivenessError) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Error loading data: {((progressError || effectivenessError) as Error).message}
        </Typography>
      </Box>
    );
  }

  if (!studentsProgress || studentsProgress.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No student progress data available.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Class Overview" />
        <Tab label="Student Details" />
        <Tab label="Content Effectiveness" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Class Average Completion
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={classAverage}
                        size={80}
                        thickness={5}
                        sx={{ color: getCompletionColor(classAverage) }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" component="div">
                          {classAverage}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Based on {studentsProgress.length} students
                      </Typography>
                      {classAverage < 50 && (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Below target
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Class Average Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{ mr: 2, color: getScoreColor(classAverageScore) }}
                    >
                      {classAverageScore}%
                    </Typography>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Across all graded tasks
                      </Typography>
                      {classAverageScore >= 70 ? (
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Above target
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color="warning.main"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Needs improvement
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    At-Risk Students
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      color:
                        atRiskStudents.length > 0
                          ? theme.palette.error.main
                          : theme.palette.success.main,
                    }}
                  >
                    {atRiskStudents.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {atRiskStudents.length === 0
                      ? 'No students at risk'
                      : `${Math.round((atRiskStudents.length / studentsProgress.length) * 100)}% of class needs attention`}
                  </Typography>
                  {atRiskStudents.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => setActiveTab(1)}
                    >
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Module Completion
                  </Typography>
                  {moduleCompletionData && (
                    <Box sx={{ height: 300 }}>
                      <Bar
                        data={moduleCompletionData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              ticks: {
                                callback: value => `${value}%`,
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Task Type Performance
                  </Typography>
                  {taskTypePerformanceData && (
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                      <Doughnut
                        data={taskTypePerformanceData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search students..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Completion</TableCell>
                  <TableCell>Average Score</TableCell>
                  <TableCell>Tasks Completed</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map(student => {
                  const completionPercentage = calculateStudentCompletion(student);
                  const isAtRisk = completionPercentage < 30 || student.averageScore < 60;
                  const lastActivity =
                    student.recentActivity.length > 0
                      ? new Date(student.recentActivity[0].timestamp)
                      : null;

                  return (
                    <TableRow
                      key={student.studentId}
                      hover
                      onClick={() => handleStudentSelect(student.studentId)}
                      selected={selectedStudentId === student.studentId}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isAtRisk ? 'rgba(239, 83, 80, 0.08)' : 'inherit',
                      }}
                    >
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={completionPercentage}
                            sx={{
                              width: 100,
                              mr: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(0, 0, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getCompletionColor(completionPercentage),
                              },
                            }}
                          />
                          <Typography variant="body2">{completionPercentage}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${student.averageScore.toFixed(1)}%`}
                          sx={{
                            bgcolor: getScoreColor(student.averageScore),
                            color: 'white',
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {student.completedTasks} / {student.totalTasks}
                      </TableCell>
                      <TableCell>
                        {lastActivity ? lastActivity.toLocaleDateString() : 'No activity'}
                      </TableCell>
                      <TableCell>
                        {isAtRisk ? (
                          <Chip label="At Risk" color="error" size="small" icon={<WarningIcon />} />
                        ) : (
                          <Chip label="On Track" color="success" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedStudentId && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Student Details: {selectedStudentId}
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                View Full Profile
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Content Effectiveness Analysis
          </Typography>
          <Typography variant="body1" paragraph>
            This analysis helps identify which content is most effective and which may need
            improvement.
          </Typography>

          {contentEffectiveness ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Challenging Quiz Questions
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Question</TableCell>
                          <TableCell>Module</TableCell>
                          <TableCell>Success Rate</TableCell>
                          <TableCell>Avg. Attempts</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contentEffectiveness.challengingQuestions.map((question, index) => (
                          <TableRow key={index}>
                            <TableCell>{question.text}</TableCell>
                            <TableCell>{question.moduleTitle}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${question.successRate}%`}
                                sx={{
                                  bgcolor: getScoreColor(question.successRate),
                                  color: 'white',
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{question.averageAttempts.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Time Spent on Learning Tasks
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Task</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Module</TableCell>
                          <TableCell>Avg. Time Spent</TableCell>
                          <TableCell>Expected Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contentEffectiveness.timeSpentAnalysis.map((task, index) => (
                          <TableRow key={index}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.type}</TableCell>
                            <TableCell>{task.moduleTitle}</TableCell>
                            <TableCell>{Math.round(task.averageTimeSpent / 60)} min</TableCell>
                            <TableCell>{task.expectedTime} min</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Content Revision Recommendations
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Content</TableCell>
                          <TableCell>Issue</TableCell>
                          <TableCell>Recommendation</TableCell>
                          <TableCell>Priority</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contentEffectiveness.revisionRecommendations.map((rec, index) => (
                          <TableRow key={index}>
                            <TableCell>{rec.contentTitle}</TableCell>
                            <TableCell>{rec.issue}</TableCell>
                            <TableCell>{rec.recommendation}</TableCell>
                            <TableCell>
                              <Chip
                                label={rec.priority}
                                color={
                                  rec.priority === 'High'
                                    ? 'error'
                                    : rec.priority === 'Medium'
                                      ? 'warning'
                                      : 'info'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No content effectiveness data available.</Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default InstructorProgressDashboard;
