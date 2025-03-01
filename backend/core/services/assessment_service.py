"""
Service layer implementation for assessment-related business logic.
"""
from decimal import Decimal
from typing import List, Optional

from django.core.exceptions import PermissionDenied
from django.db import transaction

from .exceptions import (DuplicateTaskError, NotAuthorizedError,
                         ProgressNotFoundError, QuizNotFoundError,
                         SubmissionNotFoundError, TaskNotFoundError,
                         TaskNotInQuizError)


class AssessmentService:
    """
    Service for handling assessment-related business logic.
    """
    def __init__(self, repository) -> None:
        self.repository = repository

    def get_user_submissions(
        self,
        user_id: int,
        include_task_details: bool = False
    ) -> List['Submission']:
        """
        Get all submissions for a user with optimized queries.

        Args:
            user_id: The ID of the user
            include_task_details: Whether to include task details

        Returns:
            List of submissions with optimized queries
        """
        return self.repository.get_user_submissions(
            user_id=user_id,
            include_task_details=include_task_details
        )

    @transaction.atomic
    def grade_submission(
        self,
        submission_id: int,
        grade: Decimal,
        grader_id: int
    ) -> 'Submission':
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
        # Get submission
        submission = self.repository.get_submission(submission_id)
        if not submission:
            raise SubmissionNotFoundError(f"Submission {submission_id} not found")

        # Check authorization
        grader = self.repository.get_user(grader_id)
        if not grader or not grader.is_staff:
            raise NotAuthorizedError("Only staff members can grade submissions")

        # Update submission
        submission.grade = grade
        submission.graded_by = grader_id
        submission.is_graded = True

        return self.repository.save_submission(submission)

    @transaction.atomic
    def add_task_to_quiz(
        self,
        quiz_id: int,
        task_id: int
    ) -> 'Quiz':
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
        # Get quiz and task
        quiz = self.repository.get_quiz_with_tasks(quiz_id)
        if not quiz:
            raise QuizNotFoundError(f"Quiz {quiz_id} not found")

        task = self.repository.get_task(task_id)
        if not task:
            raise TaskNotFoundError(f"Task {task_id} not found")

        # Check for duplicate
        if quiz.tasks.filter(id=task_id).exists():
            raise DuplicateTaskError(f"Task {task_id} already in quiz {quiz_id}")

        # Add task
        quiz.tasks.add(task)
        return quiz

    @transaction.atomic
    def mark_task_completed(
        self,
        progress_id: int,
        task_id: int,
        user_id: int
    ) -> 'UserProgress':
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
        # Get progress and task
        progress = self.repository.get_progress_with_related(progress_id, user_id)
        if not progress:
            raise ProgressNotFoundError(f"Progress {progress_id} not found")

        task = self.repository.get_task(task_id)
        if not task:
            raise TaskNotFoundError(f"Task {task_id} not found")

        # Verify task is in quiz
        if not progress.quiz.tasks.filter(id=task_id).exists():
            raise TaskNotInQuizError(f"Task {task_id} not in quiz")

        # Skip if already completed
        if progress.completed_tasks.filter(id=task_id).exists():
            return progress

        # Mark completed
        progress.completed_tasks.add(task)

        # Update progress
        progress.total_score += task.max_score
        if progress.total_score >= progress.quiz.max_score:
            progress.is_completed = True

        return self.repository.save_progress(progress)