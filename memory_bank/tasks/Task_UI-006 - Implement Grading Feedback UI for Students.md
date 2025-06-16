# TASK-UI-006: Implement Grading Feedback UI for Students

## Task Metadata

- **Task-ID:** TASK-UI-006
- **Status:** TODO
- **Priority:** Medium
- **Dependencies:** TASK-GRADING-001, TASK-UI-004
- **Assigned To:** Architect
- **Started At:** 2025-02-26 21:30:05
- **Estimated Completion:** 2025-05-30
- **Story Points:** 5

## Task Metadata

- **Task-ID:** TASK-UI-006
- **Status:** TODO
- **Priority:** Medium
- **Dependencies:** TASK-GRADING-001, TASK-UI-004
- **Assigned To:** Architect
- **Started At:** 2025-02-26 21:30:05
- **Estimated Completion:** 2025-05-30
- **Story Points:** 5

## Description

Implement a comprehensive user interface for displaying grading feedback to students. This interface will provide students with detailed insights into their performance, including scores, comments, rubric evaluations, and suggestions for improvement. The UI will support various feedback formats and visualization methods to enhance student understanding and learning outcomes.

## Business Context

Effective feedback is a critical component of the learning process. It helps students understand their strengths and weaknesses, provides guidance for improvement, and reinforces learning objectives. A well-designed feedback interface can significantly enhance student engagement with assessment results, leading to better learning outcomes and academic performance. This feature directly supports the educational mission by closing the feedback loop between instructors and students.

## Technical Context

- **System Architecture:** React frontend with TypeScript
- **Related Components:**
  - Grading system (from TASK-GRADING-001)
  - Task submission interface (from TASK-UI-004)
  - Notification system (from TASK-NOTIFICATION-001)
  - User authentication system
- **Technical Constraints:**
  - Must integrate with existing grading data models
  - Must be responsive for mobile and desktop use
  - Must meet WCAG 2.1 AA accessibility standards
  - Must support rich media feedback (text, images, audio)

## Requirements

### Inputs

- Grading data (scores, comments, rubric evaluations)
- Submission data and history
- Instructor feedback (text, annotations, media)
- Rubric criteria and performance levels
- Course learning objectives

### Outputs

- Visual representation of grades and feedback
- Interactive feedback elements
- Comparative performance metrics
- Improvement suggestions
- Learning resource recommendations

### Functional Requirements

1. Feedback Overview
   - Overall score and grade visualization
   - Summary of strengths and areas for improvement
   - Comparison to class average (if enabled)
   - Timeline of submission and grading events
   - Quick navigation to detailed feedback sections

2. Detailed Feedback Views
   - Rubric-based evaluation display
   - Inline comments and annotations
   - Question-by-question feedback for quizzes
   - File-specific feedback for uploads
   - Audio/video feedback playback

3. Interactive Elements
   - Expandable feedback sections
   - Tooltips for rubric criteria explanations
   - Highlight annotations in text submissions
   - Side-by-side comparison of submission and feedback
   - Feedback acknowledgment and response options

4. Learning Support
   - Links to relevant learning resources
   - Suggested improvement strategies
   - Option to request clarification from instructor
   - Related learning objectives
   - Next steps recommendations

### Technical Requirements

- Implement responsive React components using TypeScript
- Create reusable feedback visualization components
- Support various feedback formats (text, annotations, media)
- Implement accessibility features for all feedback types
- Ensure performance with large feedback datasets
- Support offline viewing of previously loaded feedback

## Implementation Details

### Required Libraries and Versions

- React 18.0+
- TypeScript 4.9+
- React Router 6.8+
- Redux Toolkit 1.9+ or React Query 4.0+ for state management
- Material UI 5.11+ or Chakra UI 2.4+ for UI components
- react-pdf 6.0+ for PDF annotation display
- react-player 2.11+ for audio/video feedback
- react-markdown 8.0+ for formatted text

### Code Examples

#### Feedback Overview Component

```tsx
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Alert,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { fetchFeedback, acknowledgeFeedback } from '../services/gradingService';
import { GradingFeedback } from '../types/gradingTypes';
import RubricFeedback from './feedback/RubricFeedback';
import TextFeedback from './feedback/TextFeedback';
import FileFeedback from './feedback/FileFeedback';
import QuizFeedback from './feedback/QuizFeedback';
import AudioVideoFeedback from './feedback/AudioVideoFeedback';
import FeedbackTimeline from './feedback/FeedbackTimeline';
import ResourceRecommendations from './feedback/ResourceRecommendations';

interface FeedbackOverviewProps {
  submissionId: string;
  taskId: string;
}

const FeedbackOverview: React.FC<FeedbackOverviewProps> = ({
  submissionId,
  taskId
}) => {
  const theme = useTheme();
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  // Fetch feedback data
  const {
    data: feedback,
    isLoading,
    error,
    refetch
  } = useQuery<GradingFeedback>(
    ['feedback', submissionId],
    () => fetchFeedback(submissionId),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Handle feedback acknowledgment
  const handleAcknowledge = async () => {
    try {
      await acknowledgeFeedback(submissionId);
      setAcknowledged(true);
      refetch(); // Refresh data to update acknowledgment status
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
    }
  };

  // Calculate grade color based on score
  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 70) return theme.palette.primary.main;
    if (percentage >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading feedback: {(error as Error).message}
      </Alert>
    );
  }

  if (!feedback) {
    return (
      <Alert severity="info">
        No feedback available for this submission yet.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Feedback header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Feedback: {feedback.taskTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Submitted: {format(new Date(feedback.submissionDate), 'MMMM d, yyyy h:mm a')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Graded: {format(new Date(feedback.gradedDate), 'MMMM d, yyyy h:mm a')}
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: 1
          }}>
            <Typography variant="h3" sx={{
              color: getGradeColor(feedback.score, feedback.maxScore),
              fontWeight: 'bold'
            }}>
              {feedback.score}/{feedback.maxScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feedback.letterGrade && `Grade: ${feedback.letterGrade}`}
            </Typography>
            {feedback.classAverage && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Class Average: {feedback.classAverage}/{feedback.maxScore}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Status chips */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={feedback.isLate ? 'Late Submission' : 'On Time'}
            color={feedback.isLate ? 'warning' : 'success'}
            size="small"
          />
          {feedback.attemptsUsed && feedback.maxAttempts && (
            <Chip
              label={`Attempt ${feedback.attemptsUsed} of ${feedback.maxAttempts}`}
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
          {feedback.acknowledged ? (
            <Chip
              label="Acknowledged"
              color="success"
              size="small"
              variant="outlined"
            />
          ) : (
            <Chip
              label="New Feedback"
              color="info"
              size="small"
            />
          )}
        </Box>
      </Paper>

      {/* Overall feedback summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Overall Feedback
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {feedback.overallFeedback ? (
          <Typography variant="body1">
            {feedback.overallFeedback}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No overall feedback provided.
          </Typography>
        )}

        {/* Strengths and areas for improvement */}
        {(feedback.strengths?.length > 0 || feedback.areasForImprovement?.length > 0) && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {feedback.strengths && feedback.strengths.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Strengths
                    </Typography>
                    <ul>
                      {feedback.strengths.map((strength, index) => (
                        <li key={index}>
                          <Typography variant="body2">{strength}</Typography>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      Areas for Improvement
                    </Typography>
                    <ul>
                      {feedback.areasForImprovement.map((area, index) => (
                        <li key={index}>
                          <Typography variant="body2">{area}</Typography>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Rubric feedback */}
      {feedback.rubricFeedback && feedback.rubricFeedback.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Rubric Evaluation
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <RubricFeedback rubricItems={feedback.rubricFeedback} />
        </Paper>
      )}

      {/* Type-specific feedback */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Detailed Feedback
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {feedback.taskType === 'text_submission' && feedback.textFeedback && (
          <TextFeedback feedback={feedback.textFeedback} />
        )}

        {feedback.taskType === 'file_upload' && feedback.fileFeedback && (
          <FileFeedback feedback={feedback.fileFeedback} />
        )}

        {feedback.taskType === 'multiple_choice_quiz' && feedback.quizFeedback && (
          <QuizFeedback feedback={feedback.quizFeedback} />
        )}

        {/* Audio/video feedback */}
        {feedback.mediaFeedback && feedback.mediaFeedback.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Audio/Video Feedback
            </Typography>
            <AudioVideoFeedback mediaItems={feedback.mediaFeedback} />
          </Box>
        )}
      </Paper>

      {/* Learning resources */}
      {feedback.resourceRecommendations && feedback.resourceRecommendations.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recommended Resources
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <ResourceRecommendations resources={feedback.resourceRecommendations} />
        </Paper>
      )}

      {/* Feedback timeline */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Submission Timeline
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FeedbackTimeline events={feedback.timelineEvents} />
      </Paper>

      {/* Acknowledgment and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.history.back()}
        >
          Back to Task
        </Button>

        {!feedback.acknowledged && !acknowledged && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAcknowledge}
          >
            Acknowledge Feedback
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FeedbackOverview;
```

#### Rubric Feedback Component

```tsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { RubricItem } from '../../types/gradingTypes';

interface RubricFeedbackProps {
  rubricItems: RubricItem[];
}

const RubricFeedback: React.FC<RubricFeedbackProps> = ({ rubricItems }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Toggle expanded state for a rubric item
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Calculate color based on score percentage
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 70) return theme.palette.primary.main;
    if (percentage >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Mobile view for rubric
  if (isMobile) {
    return (
      <Box>
        {rubricItems.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            variant="outlined"
            sx={{ mb: 2, overflow: 'hidden' }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => toggleExpanded(item.id)}
            >
              <Box>
                <Typography variant="subtitle1">
                  {item.criterion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: <span style={{
                    color: getScoreColor(item.score, item.maxScore),
                    fontWeight: 'bold'
                  }}>
                    {item.score}/{item.maxScore}
                  </span>
                </Typography>
              </Box>

              <IconButton size="small">
                {expandedItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedItems[item.id]}>
              <Box sx={{ p: 2, pt: 0, bgcolor: 'action.hover' }}>
                {item.description && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Description:
                    </Typography>
                    <Typography variant="body2">
                      {item.description}
                    </Typography>
                  </Box>
                )}

                {item.feedback && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Feedback:
                    </Typography>
                    <Typography variant="body2">
                      {item.feedback}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Box>
    );
  }

  // Desktop view for rubric
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Criterion</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell>Feedback</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rubricItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell component="th" scope="row">
                <Typography variant="subtitle2">
                  {item.criterion}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.description}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: getScoreColor(item.score, item.maxScore)
                  }}
                >
                  {item.score}/{item.maxScore}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.feedback || 'No specific feedback provided.'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RubricFeedback;
```

## Edge Cases and Challenges

### Edge Cases

1. **No Feedback Provided**: Handle cases where instructor provides score but no detailed feedback
2. **Partial Rubric Completion**: Display rubric items that have been evaluated while indicating those that haven't
3. **Multiple Feedback Versions**: Support viewing history of feedback if instructor updates it
4. **Media Feedback Playback**: Handle various media formats and playback issues
5. **Large Annotation Sets**: Efficiently display and navigate numerous annotations on submissions

### Challenges

1. **Feedback Clarity**: Ensuring feedback is presented in a clear, actionable manner
2. **Mobile Responsiveness**: Adapting complex feedback visualizations for small screens
3. **Accessibility of Feedback**: Making all feedback formats accessible to all users
4. **Performance with Rich Media**: Efficiently loading and displaying media feedback
5. **Offline Access**: Providing access to feedback when offline

## Performance Considerations

- Implement lazy loading for media feedback
- Optimize PDF rendering for annotated documents
- Use pagination for large feedback sets
- Implement efficient state management for complex feedback data
- Consider caching strategies for frequently accessed feedback

## Security Considerations

- Implement proper authentication and authorization checks
- Ensure students can only view their own feedback
- Secure media feedback storage and delivery
- Validate all data on the server side
- Log access to feedback data

## Testing Requirements

- Unit tests for feedback rendering components
- Integration tests for feedback loading and display
- Accessibility testing for all feedback formats
- Performance testing with large and complex feedback
- Cross-browser compatibility testing
- Media playback testing across devices

## Validation Criteria

- [x] Feedback is displayed clearly and comprehensively
- [x] All feedback formats (text, rubric, annotations, media) are supported
- [x] Interface is responsive and works on mobile devices
- [x] Accessibility requirements are met
- [x] Performance is optimized for various feedback types

## Acceptance Criteria

1. Students can view overall grades and summary feedback
2. Students can access detailed rubric-based evaluations
3. Students can view annotations and comments on their submissions
4. Students can play audio/video feedback if provided
5. Students can acknowledge receipt of feedback
6. Students can access recommended learning resources
7. All feedback is accessible on mobile devices

## Learning Resources

- [Accessible Feedback Design](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [React PDF Rendering](https://react-pdf.org/)
- [Media Playback in React](https://cookpete.github.io/react-player/)
- [Educational Feedback Best Practices](https://www.facultyfocus.com/articles/educational-assessment/feedback-that-fosters-growth/)

## Expert Contacts

- **Educational Feedback**: Dr. Sarah Johnson (<sarah.johnson@example.com>)
- **Accessibility**: Miguel Rodriguez (<miguel.rodriguez@example.com>)
- **Media Integration**: Priya Patel (<priya.patel@example.com>)

## Related Design Patterns

- **Strategy Pattern**: For handling different feedback types
- **Decorator Pattern**: For adding features to base feedback components
- **Composite Pattern**: For organizing hierarchical feedback structures
- **Observer Pattern**: For notification of new feedback

## Sample Data Structures

### Feedback Data Interface

```typescript
interface GradingFeedback {
  id: string;
  taskId: string;
  taskTitle: string;
  submissionId: string;
  submissionDate: string;
  gradedDate: string;
  gradedBy: string;
  score: number;
  maxScore: number;
  letterGrade?: string;
  classAverage?: number;
  isLate: boolean;
  attemptsUsed?: number;
  maxAttempts?: number;
  acknowledged: boolean;
  taskType: string;
  overallFeedback?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  rubricFeedback?: RubricItem[];
  textFeedback?: TextFeedbackItem;
  fileFeedback?: FileFeedbackItem[];
  quizFeedback?: QuizFeedbackItem;
  mediaFeedback?: MediaFeedbackItem[];
  resourceRecommendations?: ResourceItem[];
  timelineEvents: TimelineEvent[];
}

interface RubricItem {
  id: string;
  criterion: string;
  description?: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

interface TextFeedbackItem {
  originalText: string;
  annotations: TextAnnotation[];
}

interface TextAnnotation {
  id: string;
  startIndex: number;
  endIndex: number;
  comment: string;
  type: 'highlight' | 'comment' | 'suggestion' | 'correction';
}

interface FileFeedbackItem {
  fileId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  annotations: FileAnnotation[];
}

interface FileAnnotation {
  id: string;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  comment: string;
}

interface QuizFeedbackItem {
  questions: QuizQuestionFeedback[];
  overallScore: number;
  maxScore: number;
}

interface QuizQuestionFeedback {
  questionId: string;
  questionText: string;
  correctAnswer: any;
  studentAnswer: any;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  explanation?: string;
}

interface MediaFeedbackItem {
  id: string;
  title: string;
  type: 'audio' | 'video';
  url: string;
  duration: number;
  transcript?: string;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'exercise' | 'book' | 'website';
  url: string;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType: 'submission_created' | 'submission_updated' | 'grading_started' | 'grading_completed' | 'feedback_viewed' | 'feedback_acknowledged';
  description: string;
}
```

## Estimated Effort

- Feedback Overview Implementation: 2 story points
- Rubric Feedback Component: 1 story point
- Type-specific Feedback Components: 1 story point
- Media Feedback Components: 1 story point
- Total: 5 story points

## Potential Risks

- Complexity of handling various feedback formats
- Performance issues with rich media feedback
- Accessibility challenges with complex visualizations
- Browser compatibility issues with media playback
- Mobile responsiveness for complex feedback displays
