import React, {useState} from 'react';
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
} from '@mui/material';

import {
    CourseProgress,
    ModuleProgress,
    TaskProgress,
    QuizHistory,
} from '@types/common/progressTypes';

import ModuleProgressView from './ModuleProgressView';

interface CourseDetailViewProps {
    courseProgress: CourseProgress;
    onQuizSelect?: (quiz: QuizHistory) => void;
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({courseProgress, onQuizSelect}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedModule, setSelectedModule] = useState<ModuleProgress | null>(null);

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

    const handleQuizSelect = (quiz: TaskProgress) => {
        if (onQuizSelect) {
            // Convert TaskProgress to QuizHistory format
            const quizHistory: QuizHistory = {
                quizId: quiz.taskId,
                moduleId: quiz.moduleId,
                quizTitle: quiz.title,
                score: quiz.score || 0,
                maxScore: quiz.maxScore,
                attempts: quiz.attempts,
                maxAttempts: quiz.maxAttempts,
                date: quiz.submissionDate || new Date().toISOString(),
                answers: [], // This would ideally be fetched from an API
                timeSpent: quiz.timeSpent || 0,
            };
            onQuizSelect(quizHistory);
        }
    };

    return (
        <Box>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{mb: 3}}>
                <Tab label="Modules" />
                <Tab label="Tasks" />
                <Tab label="Achievements" />
            </Tabs>

            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {courseProgress.moduleProgress.map(module => (
                        <Grid item xs={12} md={6} key={module.moduleId}>
                            <Card
                                variant="outlined"
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {transform: 'scale(1.02)'},
                                }}
                                onClick={() => setSelectedModule(module)}
                            >
                                <CardContent>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <Typography variant="h6" sx={{flexGrow: 1}}>
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
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courseProgress.taskProgress.map(task => (
                                <TableRow key={task.taskId}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>
                                        {
                                            courseProgress.moduleProgress.find(m => m.moduleId === task.moduleId)
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
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            disabled={task.status === 'not_started' || task.taskType !== 'quiz'}
                                            onClick={() => handleQuizSelect(task)}
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

            {activeTab === 2 && (
                <Grid container spacing={3}>
                    {courseProgress.recentActivity
                        .filter(activity => activity.activityType === 'achievement_earned')
                        .map(achievement => (
                            <Grid item xs={12} md={4} key={achievement.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">{achievement.achievementTitle}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {achievement.achievementDescription}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="textSecondary"
                                            sx={{mt: 1, display: 'block'}}
                                        >
                                            Earned on: {new Date(achievement.timestamp).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                </Grid>
            )}

            {selectedModule && (
                <Box sx={{mt: 4}}>
                    <ModuleProgressView moduleProgress={selectedModule} />
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{mt: 2}}
                        onClick={() => setSelectedModule(null)}
                    >
                        Close Module Details
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default CourseDetailView;
