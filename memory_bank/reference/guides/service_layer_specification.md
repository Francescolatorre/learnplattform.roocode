# Service Layer Specification

## Assessment Service

### Interface Definition

```python
class AssessmentService:
    """
    Service for handling assessment-related business logic.
    """
    def __init__(self, repository):
        self.repository = repository

    def get_user_submissions(
        self, 
        user_id: int, 
        include_task_details: bool = False
    ) -> List[Submission]:
        """
        Get all submissions for a user with optimized queries.
        
        Args:
            user_id: The ID of the user
            include_task_details: Whether to include task details
            
        Returns:
            List of submissions with optimized queries
        """
        pass

    def grade_submission(
        self, 
        submission_id: int, 
        grade: Decimal, 
        grader_id: int
    ) -> Submission:
        """
        Grade a submission with proper authorization and transaction handling.
        
        Args:
            submission_id: The ID of the submission
            grade: The grade to assign
            grader_id: ID of the user doing the grading
            
        Returns:
            Updated submission
            
        Raises:
            NotAuthorizedError: If grader is not authorized
            SubmissionNotFoundError: If submission doesn't exist
        """
        pass

    def add_task_to_quiz(
        self, 
        quiz_id: int, 
        task_id: int
    ) -> Quiz:
        """
        Add a task to a quiz with validation.
        
        Args:
            quiz_id: The ID of the quiz
            task_id: The ID of the task to add
            
        Returns:
            Updated quiz
            
        Raises:
            QuizNotFoundError: If quiz doesn't exist
            TaskNotFoundError: If task doesn't exist
            DuplicateTaskError: If task already in quiz
        """
        pass

    def mark_task_completed(
        self, 
        progress_id: int,
        task_id: int, 
        user_id: int
    ) -> UserProgress:
        """
        Mark a task as completed with score calculation.
        
        Args:
            progress_id: The ID of the progress record
            task_id: The ID of the completed task
            user_id: The ID of the user
            
        Returns:
            Updated progress record
            
        Raises:
            ProgressNotFoundError: If progress record not found
            TaskNotFoundError: If task doesn't exist
            TaskNotInQuizError: If task not part of quiz
        """
        pass
```

### Repository Interface

```python
class AssessmentRepository:
    """
    Repository for assessment-related database operations.
    """
    def get_user_submissions(
        self, 
        user_id: int,
        include_task_details: bool = False
    ) -> QuerySet:
        """
        Get submissions with optimized queries.
        
        Args:
            user_id: The ID of the user
            include_task_details: Whether to include task details
            
        Returns:
            QuerySet with optimized joins
        """
        query = Submission.objects.filter(user_id=user_id)
        
        if include_task_details:
            query = query.select_related('task')
            
        return query

    def get_quiz_with_tasks(self, quiz_id: int) -> Quiz:
        """
        Get quiz with prefetched tasks.
        
        Args:
            quiz_id: The ID of the quiz
            
        Returns:
            Quiz with prefetched tasks
        """
        return Quiz.objects.prefetch_related('tasks').get(id=quiz_id)

    def get_progress_with_related(
        self, 
        progress_id: int, 
        user_id: int
    ) -> UserProgress:
        """
        Get progress with all related data.
        
        Args:
            progress_id: The ID of the progress record
            user_id: The ID of the user
            
        Returns:
            Progress with related data
        """
        return UserProgress.objects\
            .select_related('quiz')\
            .prefetch_related('completed_tasks', 'quiz__tasks')\
            .get(id=progress_id, user_id=user_id)
```

### Implementation Notes

1. Transaction Management
   - Use Django's transaction.atomic for operations affecting multiple models
   - Implement proper rollback on errors
   - Handle deadlock scenarios

2. Query Optimization
   - Use select_related for foreign key relationships
   - Use prefetch_related for reverse relationships and many-to-many
   - Implement caching where appropriate

3. Error Handling
   - Define custom exceptions for business logic errors
   - Implement proper error messages
   - Handle edge cases gracefully

4. Authorization
   - Implement permission checks in service layer
   - Handle staff/instructor permissions
   - Validate user access to resources

5. Testing Strategy
   ```python
   class TestAssessmentService:
       def setup_method(self):
           self.repository = AssessmentRepository()
           self.service = AssessmentService(self.repository)
           
           # Setup test data using Factory Boy
           self.user = UserFactory()
           self.quiz = QuizFactory()
           self.task = QuizTaskFactory()
           
       def test_mark_task_completed(self):
           # Arrange
           progress = UserProgressFactory(
               user=self.user,
               quiz=self.quiz
           )
           
           # Act
           result = self.service.mark_task_completed(
               progress.id,
               self.task.id,
               self.user.id
           )
           
           # Assert
           assert result.is_completed == False
           assert self.task in result.completed_tasks.all()
           assert result.total_score == self.task.max_score
   ```

## View Integration Example

```python
class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.assessment_service = AssessmentService(
            AssessmentRepository()
        )
    
    def get_queryset(self):
        return self.assessment_service.get_user_submissions(
            self.request.user.id,
            include_task_details=True
        )
    
    @action(detail=False, methods=['POST'])
    def grade_submission(self, request):
        try:
            submission = self.assessment_service.grade_submission(
                submission_id=request.data['submission_id'],
                grade=request.data['grade'],
                grader_id=request.user.id
            )
            return Response(
                self.get_serializer(submission).data
            )
        except NotAuthorizedError:
            return Response(
                {'error': 'Not authorized to grade submissions'},
                status=status.HTTP_403_FORBIDDEN
            )
```

## Migration Strategy

1. Initial Setup
   - Create core service and repository interfaces
   - Implement base classes and utilities
   - Set up testing infrastructure

2. Gradual Migration
   - Move one view's logic to service layer at a time
   - Run old and new code in parallel
   - Validate results match

3. Testing Requirements
   - Unit tests for service methods
   - Integration tests for view-service interaction
   - Performance tests for query optimization

4. Rollback Plan
   - Keep old code paths initially
   - Feature flags for new implementation
   - Monitor performance and errors