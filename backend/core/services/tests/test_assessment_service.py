"""
Tests for the AssessmentService implementation.
"""
import pytest
from decimal import Decimal
from unittest.mock import Mock, call

from core.services.assessment_service import AssessmentService
from core.services.exceptions import (
    NotAuthorizedError,
    SubmissionNotFoundError,
    QuizNotFoundError,
    TaskNotFoundError,
    DuplicateTaskError,
    ProgressNotFoundError,
    TaskNotInQuizError
)

@pytest.mark.unit
class TestAssessmentService:
    """
    Unit tests for AssessmentService.
    """
    
    @pytest.fixture
    def service(self, mock_repository):
        """
        Creates an AssessmentService instance with a mock repository.
        """
        return AssessmentService(repository=mock_repository)

    def test_get_user_submissions_basic(self, service, mock_repository, mock_user):
        """
        Test getting user submissions without task details.
        """
        # Arrange
        expected_submissions = []
        mock_repository.get_user_submissions.return_value = expected_submissions
        
        # Act
        result = service.get_user_submissions(mock_user.id)
        
        # Assert
        assert result == expected_submissions
        mock_repository.get_user_submissions.assert_called_once_with(
            mock_user.id,
            include_task_details=False
        )

    def test_get_user_submissions_with_task_details(self, service, mock_repository, mock_user):
        """
        Test getting user submissions with task details.
        """
        # Arrange
        expected_submissions = []
        mock_repository.get_user_submissions.return_value = expected_submissions
        
        # Act
        result = service.get_user_submissions(mock_user.id, include_task_details=True)
        
        # Assert
        assert result == expected_submissions
        mock_repository.get_user_submissions.assert_called_once_with(
            mock_user.id,
            include_task_details=True
        )

    def test_grade_submission_success(
        self,
        service,
        mock_repository,
        mock_staff_user,
        mock_submission
    ):
        """
        Test grading a submission successfully.
        """
        # Arrange
        grade = Decimal('85.5')
        mock_repository.get_submission.return_value = mock_submission
        mock_submission.is_graded = False
        
        # Act
        result = service.grade_submission(
            mock_submission.id,
            grade,
            mock_staff_user.id
        )
        
        # Assert
        assert result.grade == grade
        assert result.graded_by == mock_staff_user.id
        assert result.is_graded is True

    def test_grade_submission_not_authorized(
        self,
        service,
        mock_repository,
        mock_user,
        mock_submission
    ):
        """
        Test grading a submission without authorization fails.
        """
        # Arrange
        grade = Decimal('85.5')
        mock_repository.get_submission.return_value = mock_submission
        
        # Act/Assert
        with pytest.raises(NotAuthorizedError):
            service.grade_submission(
                mock_submission.id,
                grade,
                mock_user.id
            )

    def test_add_task_to_quiz_success(
        self,
        service,
        mock_repository,
        mock_quiz,
        mock_task
    ):
        """
        Test adding a task to a quiz successfully.
        """
        # Arrange
        mock_repository.get_quiz_with_tasks.return_value = mock_quiz
        mock_repository.get_task.return_value = mock_task
        mock_quiz.tasks.filter.return_value.exists.return_value = False
        
        # Act
        result = service.add_task_to_quiz(mock_quiz.id, mock_task.id)
        
        # Assert
        assert result == mock_quiz
        mock_quiz.tasks.add.assert_called_once_with(mock_task)

    def test_add_task_to_quiz_duplicate(
        self,
        service,
        mock_repository,
        mock_quiz,
        mock_task
    ):
        """
        Test adding a duplicate task to a quiz fails.
        """
        # Arrange
        mock_repository.get_quiz_with_tasks.return_value = mock_quiz
        mock_repository.get_task.return_value = mock_task
        mock_quiz.tasks.filter.return_value.exists.return_value = True
        
        # Act/Assert
        with pytest.raises(DuplicateTaskError):
            service.add_task_to_quiz(mock_quiz.id, mock_task.id)

    def test_mark_task_completed_success(
        self,
        service,
        mock_repository,
        mock_progress,
        mock_task,
        mock_user
    ):
        """
        Test marking a task as completed successfully.
        """
        # Arrange
        mock_repository.get_progress_with_related.return_value = mock_progress
        mock_repository.get_task.return_value = mock_task
        mock_progress.quiz.tasks.filter.return_value.exists.return_value = True
        mock_progress.completed_tasks.filter.return_value.exists.return_value = False
        
        # Act
        result = service.mark_task_completed(
            mock_progress.id,
            mock_task.id,
            mock_user.id
        )
        
        # Assert
        assert result == mock_progress
        mock_progress.completed_tasks.add.assert_called_once_with(mock_task)

    def test_mark_task_completed_task_not_in_quiz(
        self,
        service,
        mock_repository,
        mock_progress,
        mock_task,
        mock_user
    ):
        """
        Test marking a task as completed fails when task is not in quiz.
        """
        # Arrange
        mock_repository.get_progress_with_related.return_value = mock_progress
        mock_repository.get_task.return_value = mock_task
        mock_progress.quiz.tasks.filter.return_value.exists.return_value = False
        
        # Act/Assert
        with pytest.raises(TaskNotInQuizError):
            service.mark_task_completed(
                mock_progress.id,
                mock_task.id,
                mock_user.id
            )

    def test_mark_task_completed_already_completed(
        self,
        service,
        mock_repository,
        mock_progress,
        mock_task,
        mock_user
    ):
        """
        Test marking an already completed task.
        """
        # Arrange
        mock_repository.get_progress_with_related.return_value = mock_progress
        mock_repository.get_task.return_value = mock_task
        mock_progress.quiz.tasks.filter.return_value.exists.return_value = True
        mock_progress.completed_tasks.filter.return_value.exists.return_value = True
        
        # Act
        result = service.mark_task_completed(
            mock_progress.id,
            mock_task.id,
            mock_user.id
        )
        
        # Assert
        assert result == mock_progress
        mock_progress.completed_tasks.add.assert_not_called()