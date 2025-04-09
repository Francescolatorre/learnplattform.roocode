import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
} from '@mui/material';
import { ChartData } from 'chart.js';
import { format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import { Bar, Radar } from 'react-chartjs-2';

import { TaskProgress } from '../../../types/common/progressTypes';

interface PerformanceAnalysisViewProps {
  taskProgress: TaskProgress[];
}

const PerformanceAnalysisView: React.FC<PerformanceAnalysisViewProps> = ({ taskProgress }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Filter tasks with scores
  const tasksWithScores = taskProgress.filter(
    task => task.score !== null && task.status === 'graded'
  );

  // Group tasks by type
  const tasksByType = tasksWithScores.reduce(
    (acc, task) => {
      if (!acc[task.taskType]) {
        acc[task.taskType] = [];
      }
      acc[task.taskType].push(task);
      return acc;
    },
    {} as Record<string, TaskProgress[]>
  );

  // Calculate average scores by task type
  const averageScoresByType = Object.entries(tasksByType).map(([type, tasks]) => {
    const totalScore = tasks.reduce((sum, task) => sum + (task.score || 0), 0);
    return {
      type,
      averageScore: totalScore / tasks.length,
      count: tasks.length,
    };
  });

  // Prepare data for score distribution chart
  const prepareScoreDistributionData = () => {
    const scoreRanges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    const distribution = [0, 0, 0, 0, 0];

    tasksWithScores.forEach(task => {
      const score = task.score || 0;
      const percentage = (score / task.maxScore) * 100;

      if (percentage <= 20) distribution[0]++;
      else if (percentage <= 40) distribution[1]++;
      else if (percentage <= 60) distribution[2]++;
      else if (percentage <= 80) distribution[3]++;
      else distribution[4]++;
    });

    return {
      labels: scoreRanges,
      datasets: [
        {
          label: 'Number of Tasks',
          data: distribution,
          backgroundColor: [
            theme.palette.error.main,
            theme.palette.warning.main,
            theme.palette.info.main,
            theme.palette.success.light,
            theme.palette.success.main,
          ],
          borderColor: theme.palette.background.paper,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for skill proficiency radar chart
  const prepareSkillProficiencyData = () => {
    // This is a simplified example - in a real app, you would map tasks to skills
    // and calculate proficiency based on scores in those skill areas
    const skills = [
      'Problem Solving',
      'Critical Thinking',
      'Communication',
      'Technical Knowledge',
      'Creativity',
    ];
    const proficiencyScores = [85, 70, 90, 65, 75]; // Example scores

    return {
      labels: skills,
      datasets: [
        {
          label: 'Skill Proficiency',
          data: proficiencyScores,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
          pointBackgroundColor: theme.palette.primary.main,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: theme.palette.primary.main,
        },
      ],
    };
  };

  // Prepare data for performance over time chart
  const preparePerformanceOverTimeData = () => {
    // Sort tasks by submission date
    const sortedTasks = [...tasksWithScores]
      .filter(task => task.submissionDate)
      .sort((a, b) => {
        if (!a.submissionDate || !b.submissionDate) return 0;
        return parseISO(a.submissionDate).getTime() - parseISO(b.submissionDate).getTime();
      });

    // Get last 10 tasks or all if less than 10
    const recentTasks = sortedTasks.slice(-10);

    return {
      labels: recentTasks.map(task =>
        task.submissionDate ? format(parseISO(task.submissionDate), 'MMM d') : ''
      ),
      datasets: [
        {
          label: 'Score (%)',
          data: recentTasks.map(task =>
            task.score !== null ? (task.score / task.maxScore) * 100 : 0
          ),
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 1,
        },
      ],
    };
  };

  // Get status chip color
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 60) return theme.palette.success.light;
    if (percentage >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const scoreDistributionData: ChartData<'bar'> = prepareScoreDistributionData();
  const skillProficiencyData: ChartData<'radar'> = prepareSkillProficiencyData();
  const performanceOverTimeData = preparePerformanceOverTimeData();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Performance Analysis
      </Typography>
      <Typography variant="body1" paragraph>
        Analyze your performance across different types of tasks and track your progress over time.
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="By Task Type" />
        <Tab label="Detailed Scores" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Score Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={scoreDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Tasks',
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Score Range',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skill Proficiency
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Radar
                    data={skillProficiencyData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            stepSize: 20,
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Over Time
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={performanceOverTimeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Score (%)',
                          },
                          ticks: {
                            callback: value => `${value}%`,
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Submission Date',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {averageScoresByType.map(({ type, averageScore, count }) => (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {type.replace('_', ' ')}
                </Typography>
                <Typography variant="h3" color="primary" sx={{ my: 2 }}>
                  {averageScore.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Based on {count} {count === 1 ? 'task' : 'tasks'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Attempts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasksWithScores.map(task => (
                <TableRow key={task.taskId}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.taskType.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${task.score} / ${task.maxScore}`}
                      sx={{
                        bgcolor: getScoreColor(task.score || 0, task.maxScore),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {task.submissionDate
                      ? format(parseISO(task.submissionDate), 'MMM d, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {task.attempts} / {task.maxAttempts}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PerformanceAnalysisView;
