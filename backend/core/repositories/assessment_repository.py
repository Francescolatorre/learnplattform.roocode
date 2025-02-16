"""
Repository for assessment-related database operations.
"""
from typing import List, Optional
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from assessment.models import Submission, Quiz, UserProgress
from tasks.models import QuizTask

class AssessmentRepository:
    """
    Repository class for handling assessment-related database operations.
    """

    def get_user_submissions(
        self,
        user_id: int,
        include_task_details: bool = False
    ) -> List[Submission]:
        """
        Get all submissions for a user.
        
        Args:
            user_id: ID of the user
            include_task_details: Whether to include related task details
            
        Returns:
            List of submissions
        """
        queryset = Submission.objects.filter(user_id=user_id)
        if include_task_details:
            queryset = queryset.select_related('task')
        return list(queryset)

    def get_submission(self, submission_id: int) -> Submission:
        """
        Get a specific submission by ID.
        
        Args:
            submission_id: ID of the submission
            
        Returns:
            Submission object
            
        Raises:
            ObjectDoesNotExist: If submission not found
        """
        return Submission.objects.get(id=submission_id)

    def get_quiz_with_tasks(self, quiz_id: int) -> Quiz:
        """
        Get a quiz with its associated tasks.
        
        Args:
            quiz_id: ID of the quiz
            
        Returns:
            Quiz object with prefetched tasks
            
        Raises:
            ObjectDoesNotExist: If quiz not found
        """
        return Quiz.objects.prefetch_related('tasks').get(id=quiz_id)

    def get_progress_with_related(self, progress_id: int) -> UserProgress:
        """
        Get user progress with related data.
        
        Args:
            progress_id: ID of the progress record
            
        Returns:
            UserProgress object with related data
            
        Raises:
            ObjectDoesNotExist: If progress not found
        """
        return UserProgress.objects.select_related(
            'user',
            'quiz'
        ).prefetch_related(
            'completed_tasks'
        ).get(id=progress_id)

    @transaction.atomic
    def create_quiz_with_tasks(
        self,
        title: str,
        description: str,
        tasks: List[QuizTask]
    ) -> Quiz:
        """
        Create a new quiz with associated tasks atomically.
        
        Args:
            title: Quiz title
            description: Quiz description
            tasks: List of QuizTask objects
            
        Returns:
            Created Quiz object
        """
        quiz = Quiz.objects.create(
            title=title,
            description=description
        )
        quiz.tasks.add(*tasks)
        return quiz

    @transaction.atomic
    def update_submission_grade(
        self,
        submission_id: int,
        grade: float,
        graded_by: Optional[int] = None
    ) -> Submission:
        """
        Update a submission's grade atomically.
        
        Args:
            submission_id: ID of the submission
            grade: New grade value
            graded_by: ID of the user who graded (optional)
            
        Returns:
            Updated Submission object
            
        Raises:
            ObjectDoesNotExist: If submission not found
        """
        submission = Submission.objects.select_for_update().get(id=submission_id)
        submission.grade = grade
        if graded_by is not None:
            submission.graded_by = graded_by
        submission.save()
        return submission