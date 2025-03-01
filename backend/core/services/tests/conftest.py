"""
Service layer test configuration and fixtures.
"""
from decimal import Decimal
from unittest.mock import MagicMock, Mock, PropertyMock

import pytest
from django.contrib.auth import get_user_model
from django.db import transaction
from django.test import TransactionTestCase

from ...repositories.assessment_repository import AssessmentRepository
from ..assessment_service import AssessmentService

User = get_user_model()

@pytest.fixture
def mock_repository():
    """
    Provides a mock repository with common methods pre-configured.
    Includes proper error handling and relationship management.
    """
    repository = Mock()

    # Configure common repository method returns
    repository.get_user_submissions.return_value = []
    repository.get_quiz_with_tasks.return_value = None
    repository.get_progress_with_related.return_value = None

    # Configure error handling
    def get_submission(id):
        return mock_submission() if id == 1 else None
    repository.get_submission.side_effect = get_submission

    def get_quiz(id):
        return mock_quiz() if id == 1 else None
    repository.get_quiz.side_effect = get_quiz

    def get_task(id):
        return mock_task() if id == 1 else None
    repository.get_task.side_effect = get_task

    return repository

@pytest.fixture
def mock_user():
    """
    Creates a mock user for testing.
    Includes proper permission handling.
    """
    user = MagicMock(
        id=1,
        username='testuser',
        is_staff=False,
        is_superuser=False
    )

    # Configure permissions
    type(user).has_perm = PropertyMock(return_value=False)
    user.has_module_perms.return_value = False

    return user

@pytest.fixture
def mock_staff_user():
    """
    Creates a mock staff user for testing.
    Includes elevated permissions.
    """
    user = MagicMock(
        id=2,
        username='staffuser',
        is_staff=True,
        is_superuser=False
    )

    # Configure permissions
    type(user).has_perm = PropertyMock(return_value=True)
    user.has_module_perms.return_value = True

    return user

@pytest.fixture
def mock_submission():
    """
    Creates a mock submission for testing.
    Includes proper relationship handling.
    """
    submission = MagicMock(
        id=1,
        user_id=1,
        task_id=1,
        grade=Decimal('0.0'),
        graded_by=None,
        is_graded=False
    )

    # Configure relationships
    submission.task = mock_task()
    submission.user = mock_user()

    return submission

@pytest.fixture
def mock_quiz():
    """
    Creates a mock quiz for testing.
    Includes proper task management.
    """
    quiz = MagicMock(
        id=1,
        title='Test Quiz',
        max_score=Decimal('100.0')
    )

    # Configure task management
    tasks = []
    quiz.tasks = MagicMock()
    quiz.tasks.all.return_value = tasks
    quiz.tasks.filter.return_value.exists.return_value = False

    def add_task(task):
        tasks.append(task)
    quiz.tasks.add.side_effect = add_task

    return quiz

@pytest.fixture
def mock_task():
    """
    Creates a mock task for testing.
    Includes score handling.
    """
    task = MagicMock(
        id=1,
        title='Test Task',
        max_score=Decimal('10.0')
    )

    # Configure score validation
    type(task).max_score = PropertyMock(return_value=Decimal('10.0'))

    return task

@pytest.fixture
def mock_progress():
    """
    Creates a mock user progress for testing.
    Includes completion tracking.
    """
    progress = MagicMock(
        id=1,
        user_id=1,
        quiz_id=1,
        total_score=Decimal('0.0'),
        is_completed=False
    )

    # Configure task completion tracking
    completed_tasks = []
    progress.completed_tasks = MagicMock()
    progress.completed_tasks.all.return_value = completed_tasks
    progress.completed_tasks.filter.return_value.exists.return_value = False

    def add_completed_task(task):
        completed_tasks.append(task)
    progress.completed_tasks.add.side_effect = add_completed_task

    # Configure quiz relationship
    progress.quiz = mock_quiz()

    return progress

@pytest.fixture
def integration_repository(transactional_db):
    """
    Provides a real repository instance for integration testing.
    Wrapped in transaction for isolation.
    """
    return AssessmentRepository()

@pytest.fixture
def integration_service(integration_repository):
    """
    Provides a service instance with real repository for integration testing.
    """
    return AssessmentService(repository=integration_repository)

@pytest.fixture
def assert_called_with_transaction():
    """
    Utility to verify a method was called within a transaction.
    """
    def _assert_transaction(mock_method, *args, **kwargs):
        calls = mock_method.mock_calls
        assert len(calls) > 0, "Method was not called"

        # Verify transaction handling
        transaction_start = False
        transaction_end = False
        for call in calls:
            if 'transaction.atomic' in str(call):
                transaction_start = True
            if 'commit' in str(call) or 'rollback' in str(call):
                transaction_end = True

        assert transaction_start and transaction_end, "Method not called in transaction"

        # Verify arguments
        mock_method.assert_called_with(*args, **kwargs)

    return _assert_transaction

@pytest.fixture
def assert_permission_checked():
    """
    Utility to verify proper permission checking.
    """
    def _assert_permissions(mock_user, permission_name):
        mock_user.has_perm.assert_called_with(permission_name)

    return _assert_permissions