"""
Service layer test configuration and fixtures.
"""
import pytest
from unittest.mock import Mock, MagicMock
from decimal import Decimal
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def mock_repository():
    """
    Provides a mock repository with common methods pre-configured.
    """
    repository = Mock()
    
    # Configure common repository method returns
    repository.get_user_submissions.return_value = []
    repository.get_quiz_with_tasks.return_value = None
    repository.get_progress_with_related.return_value = None
    
    return repository

@pytest.fixture
def mock_user():
    """
    Creates a mock user for testing.
    """
    return MagicMock(
        id=1,
        username='testuser',
        is_staff=False,
        is_superuser=False
    )

@pytest.fixture
def mock_staff_user():
    """
    Creates a mock staff user for testing.
    """
    return MagicMock(
        id=2,
        username='staffuser',
        is_staff=True,
        is_superuser=False
    )

@pytest.fixture
def mock_submission():
    """
    Creates a mock submission for testing.
    """
    return MagicMock(
        id=1,
        user_id=1,
        task_id=1,
        grade=Decimal('0.0'),
        graded_by=None,
        is_graded=False
    )

@pytest.fixture
def mock_quiz():
    """
    Creates a mock quiz for testing.
    """
    return MagicMock(
        id=1,
        title='Test Quiz',
        tasks=MagicMock(all=lambda: []),
        max_score=Decimal('100.0')
    )

@pytest.fixture
def mock_task():
    """
    Creates a mock task for testing.
    """
    return MagicMock(
        id=1,
        title='Test Task',
        max_score=Decimal('10.0')
    )

@pytest.fixture
def mock_progress():
    """
    Creates a mock user progress for testing.
    """
    return MagicMock(
        id=1,
        user_id=1,
        quiz_id=1,
        completed_tasks=MagicMock(all=lambda: []),
        total_score=Decimal('0.0'),
        is_completed=False
    )