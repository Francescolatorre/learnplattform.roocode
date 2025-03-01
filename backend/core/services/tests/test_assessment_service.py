"""
Tests for the assessment service layer.
"""
from decimal import Decimal
from unittest.mock import Mock, call

import pytest
from django.db import transaction

from ..assessment_service import AssessmentService
from ..exceptions import (DuplicateTaskError, NotAuthorizedError,
                          ProgressNotFoundError, QuizNotFoundError,
                          SubmissionNotFoundError, TaskNotFoundError,
                          TaskNotInQuizError)


@pytest.mark.unit
def test_get_user_submissions(mock_repository):
    """
    Test retrieving user submissions with proper repository interaction.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    expected_submissions = [Mock(id=1), Mock(id=2)]
    mock_repository.get_user_submissions.return_value = expected_submissions

    # Act
    result = service.get_user_submissions(user_id=1, include_task_details=True)

    # Assert
    assert result == expected_submissions
    mock_repository.get_user_submissions.assert_called_once_with(
        user_id=1,
        include_task_details=True
    )

@pytest.mark.unit
def test_grade_submission_success(mock_repository, mock_staff_user, mock_submission):
    """
    Test successful submission grading with proper authorization.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_submission.return_value = mock_submission
    mock_repository.get_user.return_value = mock_staff_user
    grade = Decimal('8.5')

    # Act
    result = service.grade_submission(
        submission_id=1,
        grade=grade,
        grader_id=2
    )

    # Assert
    assert result.grade == grade
    assert result.graded_by == 2
    assert result.is_graded is True
    mock_repository.save_submission.assert_called_once_with(mock_submission)

@pytest.mark.unit
def test_grade_submission_not_found(mock_repository, mock_staff_user):
    """
    Test submission grading with non-existent submission.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_submission.return_value = None
    mock_repository.get_user.return_value = mock_staff_user

    # Act & Assert
    with pytest.raises(SubmissionNotFoundError):
        service.grade_submission(
            submission_id=999,
            grade=Decimal('8.5'),
            grader_id=2
        )

@pytest.mark.unit
def test_grade_submission_unauthorized(mock_repository, mock_user, mock_submission):
    """
    Test submission grading with unauthorized user.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_submission.return_value = mock_submission
    mock_repository.get_user.return_value = mock_user

    # Act & Assert
    with pytest.raises(NotAuthorizedError):
        service.grade_submission(
            submission_id=1,
            grade=Decimal('8.5'),
            grader_id=1
        )

@pytest.mark.unit
def test_add_task_to_quiz_success(mock_repository, mock_quiz, mock_task):
    """
    Test successfully adding a task to a quiz.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_quiz_with_tasks.return_value = mock_quiz
    mock_repository.get_task.return_value = mock_task
    mock_quiz.tasks.filter.return_value.exists.return_value = False

    # Act
    result = service.add_task_to_quiz(quiz_id=1, task_id=1)

    # Assert
    assert result == mock_quiz
    mock_quiz.tasks.add.assert_called_once_with(mock_task)

@pytest.mark.unit
def test_add_task_to_quiz_duplicate(mock_repository, mock_quiz, mock_task):
    """
    Test adding a duplicate task to a quiz.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_quiz_with_tasks.return_value = mock_quiz
    mock_repository.get_task.return_value = mock_task
    mock_quiz.tasks.filter.return_value.exists.return_value = True

    # Act & Assert
    with pytest.raises(DuplicateTaskError):
        service.add_task_to_quiz(quiz_id=1, task_id=1)

@pytest.mark.unit
def test_add_task_to_quiz_quiz_not_found(mock_repository, mock_task):
    """
    Test adding a task to a non-existent quiz.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_quiz_with_tasks.return_value = None
    mock_repository.get_task.return_value = mock_task

    # Act & Assert
    with pytest.raises(QuizNotFoundError):
        service.add_task_to_quiz(quiz_id=999, task_id=1)

@pytest.mark.unit
def test_add_task_to_quiz_task_not_found(mock_repository, mock_quiz):
    """
    Test adding a non-existent task to a quiz.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_quiz_with_tasks.return_value = mock_quiz
    mock_repository.get_task.return_value = None

    # Act & Assert
    with pytest.raises(TaskNotFoundError):
        service.add_task_to_quiz(quiz_id=1, task_id=999)

@pytest.mark.unit
def test_mark_task_completed_task_not_in_quiz(mock_repository, mock_progress, mock_task):
    """
    Test marking a task that's not part of the quiz.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_progress_with_related.return_value = mock_progress
    mock_repository.get_task.return_value = mock_task
    mock_progress.quiz.tasks.filter.return_value.exists.return_value = False

    # Act & Assert
    with pytest.raises(TaskNotInQuizError):
        service.mark_task_completed(progress_id=1, task_id=1, user_id=1)

@pytest.mark.unit
def test_mark_task_completed_success(mock_repository, mock_progress, mock_task):
    """
    Test successfully marking a task as completed.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_progress_with_related.return_value = mock_progress
    mock_repository.get_task.return_value = mock_task
    mock_progress.quiz.tasks.filter.return_value.exists.return_value = True
    mock_progress.completed_tasks.filter.return_value.exists.return_value = False
    mock_task.max_score = 10
    mock_progress.quiz.max_score = 20
    mock_progress.total_score = 5

    # Act
    result = service.mark_task_completed(
        progress_id=1,
        task_id=1,
        user_id=1
    )

    # Assert
    assert result == mock_progress
    assert result.total_score == 15
    assert not result.is_completed
    mock_progress.completed_tasks.add.assert_called_once_with(mock_task)

@pytest.mark.unit
def test_mark_task_completed_quiz_completion(mock_repository, mock_progress, mock_task):
    """
    Test marking a task that completes the quiz.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_progress_with_related.return_value = mock_progress
    mock_repository.get_task.return_value = mock_task
    mock_progress.quiz.tasks.filter.return_value.exists.return_value = True
    mock_progress.completed_tasks.filter.return_value.exists.return_value = False
    mock_task.max_score = 10
    mock_progress.quiz.max_score = 15
    mock_progress.total_score = 10

    # Act
    result = service.mark_task_completed(
        progress_id=1,
        task_id=1,
        user_id=1
    )

    # Assert
    assert result == mock_progress
    assert result.total_score == 20
    assert result.is_completed

@pytest.mark.unit
def test_mark_task_completed_already_done(mock_repository, mock_progress, mock_task):
    """
    Test marking an already completed task.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_progress_with_related.return_value = mock_progress
    mock_repository.get_task.return_value = mock_task
    mock_progress.quiz.tasks.filter.return_value.exists.return_value = True
    mock_progress.completed_tasks.filter.return_value.exists.return_value = True
    initial_score = mock_progress.total_score = 10

    # Act
    result = service.mark_task_completed(
        progress_id=1,
        task_id=1,
        user_id=1
    )

    # Assert
    assert result == mock_progress
    assert result.total_score == initial_score
    mock_progress.completed_tasks.add.assert_not_called()

@pytest.mark.unit
def test_mark_task_completed_progress_not_found(mock_repository, mock_task):
    """
    Test marking a task with non-existent progress.
    """
    # Arrange
    service = AssessmentService(repository=mock_repository)
    mock_repository.get_progress_with_related.return_value = None
    mock_repository.get_task.return_value = mock_task

    # Act & Assert
    with pytest.raises(ProgressNotFoundError):
        service.mark_task_completed(
            progress_id=999,
            task_id=1,
            user_id=1
        )

@pytest.mark.integration
def test_grade_submission_integration(integration_service, test_submission, test_staff_user):
    """
    Integration test for submission grading with database interaction.
    """
    # Arrange
    grade = Decimal('9.5')

    # Act
    result = integration_service.grade_submission(
        submission_id=test_submission.id,
        grade=grade,
        grader_id=test_staff_user.id
    )

    # Assert
    assert result.grade == grade
    assert result.graded_by == test_staff_user.id
    assert result.is_graded is True

@pytest.mark.integration
def test_transaction_rollback(integration_service, test_submission, test_staff_user, monkeypatch):
    """
    Test transaction rollback on error.
    """
    def mock_save(*args, **kwargs):
        raise ValueError("Simulated error")

    monkeypatch.setattr(integration_service.repository, 'save_submission', mock_save)

    with pytest.raises(ValueError):
        integration_service.grade_submission(
            submission_id=test_submission.id,
            grade=Decimal('9.5'),
            grader_id=test_staff_user.id
        )

    # Verify submission wasn't updated due to transaction rollback
    fresh_submission = integration_service.repository.get_submission(test_submission.id)
    assert fresh_submission.grade != Decimal('9.5')
    assert fresh_submission.is_graded is False
    assert fresh_submission.graded_by is None