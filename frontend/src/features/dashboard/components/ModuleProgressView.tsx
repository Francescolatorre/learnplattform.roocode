import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ModuleProgress } from '../../../types/progressTypes';
import { CourseStructure } from '../../../types/courseTypes';

interface ModuleProgressViewProps {
  moduleProgress: ModuleProgress[];
  courseStructure: CourseStructure;
}

const ModuleProgressView: React.FC<ModuleProgressViewProps> = ({
  moduleProgress,
  courseStructure,
}) => {
  const theme = useTheme();
  const [expandedModule, setExpandedModule] = useState<string | false>(false);

  const handleModuleChange =
    (moduleId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedModule(isExpanded ? moduleId : false);
    };

  // Get module structure by ID
  const getModuleStructure = (moduleId: string) => {
    return courseStructure.modules.find(module => module.id === moduleId);
  };

  // Get status chip color based on completion percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return theme.palette.success.main;
    if (percentage >= 50) return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  // Get status text based on completion percentage
  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Completed';
    if (percentage > 0) return 'In Progress';
    return 'Not Started';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Module Progress
      </Typography>
      <Typography variant="body1" paragraph>
        Track your progress through each module of the course. Expand a module to see detailed
        information about its sections and tasks.
      </Typography>

      {moduleProgress.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No module progress data available.</Typography>
        </Paper>
      ) : (
        moduleProgress.map(module => {
          const moduleStructure = getModuleStructure(module.moduleId);

          return (
            <Accordion
              key={module.moduleId}
              expanded={expandedModule === module.moduleId}
              onChange={handleModuleChange(module.moduleId)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderLeft: `4px solid ${getStatusColor(module.completionPercentage)}`,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">{module.moduleTitle}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress
                        variant="determinate"
                        value={module.completionPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          flexGrow: 1,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">{module.completionPercentage}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip
                      label={getStatusText(module.completionPercentage)}
                      sx={{
                        bgcolor: getStatusColor(module.completionPercentage),
                        color: 'white',
                      }}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <CheckCircleIcon
                          sx={{
                            fontSize: 40,
                            color: theme.palette.success.main,
                            mb: 1,
                          }}
                        />
                        <Typography variant="h6">
                          {module.completedTasks} / {module.totalTasks}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Tasks Completed
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <AccessTimeIcon
                          sx={{
                            fontSize: 40,
                            color: theme.palette.info.main,
                            mb: 1,
                          }}
                        />
                        <Typography variant="h6">{moduleStructure?.duration || 0} min</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Estimated Duration
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <AssignmentIcon
                          sx={{
                            fontSize: 40,
                            color: theme.palette.warning.main,
                            mb: 1,
                          }}
                        />
                        <Typography variant="h6">
                          {module.averageScore !== null
                            ? `${module.averageScore.toFixed(1)}%`
                            : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Average Score
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {moduleStructure &&
                  moduleStructure.sections.map(section => (
                    <Paper key={section.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {section.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {section.description}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <List dense>
                        {section.taskIds.map((taskId, index) => (
                          <ListItem key={taskId}>
                            <ListItemIcon>
                              <CheckCircleIcon color="disabled" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Task ${index + 1}`}
                              secondary="Click to view details"
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  ))}
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
};

export default ModuleProgressView;
