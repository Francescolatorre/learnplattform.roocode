# Learning Task Types Implementation Guide

This document provides comprehensive implementation guidelines for the various task types supported by the learning platform. It serves as a reference for developers implementing the TASK-TYPE-001 to TASK-TYPE-018 tasks.

## Task Type Overview

The learning platform supports the following categories of task types:

1. **Submission-Based Tasks**
   - Text submission
   - File upload
   - Project submission
   - Code submission

2. **Quiz-Based Tasks**
   - Multiple choice questions
   - True/false questions
   - Matching questions
   - Fill-in-the-blank questions
   - Numerical answer questions

3. **Interactive Tasks**
   - Coding challenges
   - Interactive simulations
   - Drag-and-drop activities
   - Hotspot identification

4. **Peer & Group Tasks**
   - Group submissions
   - Peer reviews
   - Discussion-based tasks
   - Collaborative projects

5. **Reflective Tasks**
   - Learning journals
   - Self-evaluations
   - Goal tracking
   - Reflection essays

## Common Implementation Patterns

All task types share the following implementation patterns:

### Database Structure

All task types extend the base `LearningTask` model using Django's model inheritance or through the `settings` JSONField:

```python
class LearningTask(models.Model):
    # Base fields as defined in TASK-MODEL-001
    # ...
    task_type = models.CharField(max_length=50)
    settings = models.JSONField(default=dict, blank=True)
```

### Task Type Registration

Each task type must be registered in the task type registry:

```python
class TaskTypeRegistry:
    _registry = {}
    
    @classmethod
    def register(cls, task_type_id, task_type_class):
        cls._registry[task_type_id] = task_type_class
        
    @classmethod
    def get_task_type(cls, task_type_id):
        return cls._registry.get(task_type_id)
```

### Task Type Interface

Each task type must implement the following interface:

```python
class BaseTaskType:
    def validate_settings(self, settings):
        """Validate task type specific settings"""
        raise NotImplementedError
        
    def get_submission_form(self, task):
        """Return the form for submitting this task type"""
        raise NotImplementedError
        
    def process_submission(self, task, submission_data):
        """Process a submission for this task type"""
        raise NotImplementedError
        
    def get_grading_form(self, task, submission):
        """Return the form for grading this task type"""
        raise NotImplementedError
        
    def get_student_view(self, task, submission=None):
        """Return the view for students to see this task"""
        raise NotImplementedError
```

## Submission-Based Tasks

### 1. Text Submission (TASK-TYPE-001)

#### Settings Schema
```json
{
  "wordLimit": 500,
  "minWords": 100,
  "allowFormatting": true,
  "allowAttachments": false,
  "submissionInstructions": "Write a 500-word essay..."
}
```

#### Implementation Notes
- Use a rich text editor component (e.g., TinyMCE, CKEditor)
- Implement word count validation
- Support markdown or HTML formatting if `allowFormatting` is true
- Store submissions in a text field in the database

#### Frontend Components
- Text editor component with word count
- Formatting toolbar (if allowed)
- Draft saving functionality
- Submission preview

### 2. File Upload (TASK-TYPE-002)

#### Settings Schema
```json
{
  "allowedFileTypes": [".pdf", ".docx", ".jpg", ".png"],
  "maxFileSize": 10485760,  // 10MB in bytes
  "maxFiles": 3,
  "requireDescription": true
}
```

#### Implementation Notes
- Use Django's FileField for storage
- Implement file type validation
- Enforce file size limits
- Consider using cloud storage for scalability
- Implement virus scanning for uploaded files

#### Frontend Components
- Drag-and-drop upload area
- File type and size validation
- Upload progress indicator
- File preview functionality

## Quiz-Based Tasks

### 3. Multiple Choice Quiz (TASK-TYPE-003)

#### Settings Schema
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "What is the capital of France?",
      "options": [
        {"id": "a", "text": "London"},
        {"id": "b", "text": "Paris"},
        {"id": "c", "text": "Berlin"},
        {"id": "d", "text": "Madrid"}
      ],
      "correctAnswer": "b",
      "points": 1
    }
  ],
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showCorrectAnswers": false,
  "allowMultipleAttempts": false,
  "timeLimit": 30  // minutes
}
```

#### Implementation Notes
- Store questions and options in the task settings
- Implement question and option shuffling
- Support for single and multiple correct answers
- Automatic grading based on correct answers
- Time tracking for timed quizzes

#### Frontend Components
- Question display with options
- Timer for timed quizzes
- Progress indicator
- Immediate feedback (if enabled)
- Results summary

### 4. True/False Questions (TASK-TYPE-004)

#### Settings Schema
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Paris is the capital of France.",
      "correctAnswer": true,
      "points": 1
    }
  ],
  "shuffleQuestions": true,
  "showCorrectAnswers": false
}
```

#### Implementation Notes
- Similar to multiple choice but with fixed true/false options
- Automatic grading
- Support for explanation text for each question

## Interactive Tasks

### 5. Coding Challenge (TASK-TYPE-005)

#### Settings Schema
```json
{
  "instructions": "Write a function that...",
  "startingCode": "def solution(input):\n    # Your code here\n    pass",
  "language": "python",
  "testCases": [
    {
      "input": "5",
      "expectedOutput": "25",
      "isHidden": false
    },
    {
      "input": "0",
      "expectedOutput": "0",
      "isHidden": true
    }
  ],
  "timeLimit": 5,  // seconds per test case
  "memoryLimit": 128  // MB
}
```

#### Implementation Notes
- Integrate with code execution environment (e.g., Docker containers)
- Implement secure code execution
- Support multiple programming languages
- Automatic testing against test cases
- Performance monitoring for time and memory limits

#### Frontend Components
- Code editor with syntax highlighting
- Language selection
- Test case results display
- Console output view
- Performance metrics

### 6. Interactive Simulation (TASK-TYPE-006)

#### Settings Schema
```json
{
  "simulationType": "circuit_builder",
  "instructions": "Build a circuit that...",
  "initialState": {...},
  "successCriteria": {...},
  "availableComponents": [...]
}
```

#### Implementation Notes
- Integrate with simulation frameworks
- Define clear success criteria
- Support saving and loading simulation state
- Implement automatic validation of solutions

## Peer & Group Tasks

### 7. Peer Review (TASK-TYPE-007)

#### Settings Schema
```json
{
  "originalTaskId": "task-123",
  "reviewsRequired": 3,
  "anonymousReviews": true,
  "rubric": [
    {
      "criterion": "Content",
      "description": "Addresses all aspects of the prompt",
      "maxPoints": 10
    }
  ],
  "reviewDeadline": "2025-04-15T23:59:59Z"
}
```

#### Implementation Notes
- Link to original task submissions
- Implement fair distribution of reviews
- Support rubric-based assessment
- Calculate final grade based on peer reviews
- Handle cases where insufficient reviews are submitted

## Reflective Tasks

### 8. Learning Journal (TASK-TYPE-008)

#### Settings Schema
```json
{
  "promptQuestions": [
    "What did you learn today?",
    "How will you apply this knowledge?"
  ],
  "entryFrequency": "daily",
  "privateToStudent": true,
  "wordLimit": 300
}
```

#### Implementation Notes
- Support recurring entries
- Implement privacy controls
- Allow instructor feedback on entries
- Support for media embedding

## Implementation Strategy

### Phase 1: Core Task Types
Implement the most commonly used task types first:
1. Text submission (TASK-TYPE-001)
2. File upload (TASK-TYPE-002)
3. Multiple choice quiz (TASK-TYPE-003)

### Phase 2: Enhanced Task Types
Implement more complex task types:
4. True/False questions (TASK-TYPE-004)
5. Coding challenge (TASK-TYPE-005)
6. Matching questions (TASK-TYPE-009)

### Phase 3: Advanced Task Types
Implement specialized task types:
7. Peer review (TASK-TYPE-007)
8. Learning journal (TASK-TYPE-008)
9. Interactive simulation (TASK-TYPE-006)

## Frontend Architecture

### Component Hierarchy
```
TaskView
├── TaskHeader
├── TaskInstructions
├── TaskSubmissionForm
│   ├── TextSubmissionForm
│   ├── FileUploadForm
│   ├── QuizForm
│   └── ...
├── TaskSubmissionHistory
└── TaskFeedback
```

### State Management
- Use React Context or Redux for task state management
- Implement optimistic updates for submission status
- Cache task data for offline capability
- Implement autosave for long-form submissions

## Backend Architecture

### Service Layer
```python
class TaskTypeService:
    def get_task_type_handler(self, task):
        task_type_id = task.task_type
        return TaskTypeRegistry.get_task_type(task_type_id)
    
    def validate_task_settings(self, task):
        handler = self.get_task_type_handler(task)
        return handler.validate_settings(task.settings)
    
    def process_submission(self, task, submission_data):
        handler = self.get_task_type_handler(task)
        return handler.process_submission(task, submission_data)
```

### API Endpoints
```
GET /api/tasks/{task_id}/
POST /api/tasks/{task_id}/submit/
GET /api/tasks/{task_id}/submissions/
POST /api/tasks/{task_id}/grade/{submission_id}/
```

## Testing Strategy

### Unit Tests
- Test each task type implementation separately
- Validate settings schema for each task type
- Test submission processing logic
- Test grading algorithms

### Integration Tests
- Test task creation through API
- Test submission workflow
- Test grading workflow
- Test task type switching

### End-to-End Tests
- Complete submission workflows
- Student and instructor views
- Performance testing with many tasks

## Performance Considerations

### Database Optimization
- Index frequently queried fields
- Consider denormalization for complex task types
- Use database-specific JSON querying for settings

### Caching Strategy
- Cache task settings and structure
- Cache submission status
- Implement ETags for API responses

## Security Considerations

### Input Validation
- Validate all task settings against schema
- Sanitize user-submitted content
- Implement rate limiting for submissions

### Permissions
- Enforce role-based access control
- Validate student enrollment before submission
- Ensure instructors can only grade assigned courses

## Accessibility Considerations

### WCAG Compliance
- Ensure all task types meet WCAG 2.1 AA standards
- Provide keyboard navigation for interactive tasks
- Support screen readers for all task types
- Provide alternative formats for media content

## Internationalization

### Content Translation
- Support multiple languages for task instructions
- Implement locale-specific formatting for dates and numbers
- Support right-to-left languages in text submissions

## Documentation Requirements

### Developer Documentation
- Document each task type implementation
- Provide examples for extending task types
- Document API endpoints and parameters

### User Documentation
- Create instructor guides for each task type
- Provide student tutorials for complex task types
- Document best practices for task creation

## Expert Contacts

- **Quiz Implementation**: Jane Smith (jane.smith@example.com)
- **Interactive Tasks**: Michael Johnson (michael.johnson@example.com)
- **Peer Review System**: Sarah Williams (sarah.williams@example.com)
- **Accessibility**: David Brown (david.brown@example.com)
