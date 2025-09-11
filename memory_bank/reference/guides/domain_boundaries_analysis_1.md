# Domain Boundaries Analysis

## Current Structure and Dependencies

### Core Apps
1. courses
   - Contains Course and Task models
   - Core domain models that other apps depend on
   - Currently no problematic imports from other apps

2. learningunits
   - Empty models.py
   - Appears to be an incomplete or unused app
   - Potential domain concept that could be better utilized

3. assessment
   - Has dependencies on courses.models (Course, Task)
   - Manages submissions and user progress
   - Tightly coupled with courses app

4. quizzes
   - Empty models.py
   - Could be part of assessment domain
   - Currently unused

## Identified Issues

1. **Unclear Domain Boundaries**
   - Learning units concept exists but isn't implemented
   - Quizzes are separate from assessments despite similar domain
   - Course and Task models are referenced across multiple apps

2. **Cross-App Dependencies**
   - Assessment app depends directly on courses.models
   - This creates tight coupling between apps
   - Makes testing and maintenance more difficult

## Proposed Domain Restructuring

### 1. Core Learning Domain
- Merge courses and learningunits into a single "learning" app
- Move Task model into its own "tasks" app since it's used across domains
```
learning/
  - Course
tasks/
  - Task (base class)
  - LearningTask
  - AssessmentTask
  - QuizTask
```

### 2. Assessment Domain
- Combine assessment and quizzes into unified assessment domain
- Create clear boundaries between submission tracking and learning content
```
assessment/
  - Submission
  - UserProgress
  - Quiz
  - QuizSubmission
```

### Benefits
1. Clearer domain boundaries
2. Reduced cross-app dependencies
3. More flexible and maintainable architecture
4. Better separation of concerns
5. Easier testing and development

### Implementation Strategy
1. Create new app structure
2. Gradually migrate models and logic
3. Update foreign key relationships
4. Adjust import statements
5. Update tests to reflect new structure

## Next Steps
1. Review proposed restructuring
2. Create detailed migration plan
3. Implement changes incrementally
4. Update documentation
5. Adjust tests for new structure