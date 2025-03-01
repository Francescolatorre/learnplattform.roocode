"""
Tests for assessment app models.
"""
from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from assessment.models import Quiz, Submission, UserProgress
from core.tests.factories import (QuizFactory, QuizTaskFactory,
                                  SubmissionFactory, UserFactory,
                                  UserProgressFactory)


@pytest.mark.django_db
class TestSubmissionModel:
    """Test suite for the Submission model."""

    def test_submission_creation(self):
        """Test basic submission creation."""
        submission = SubmissionFactory()
        assert isinstance(submission, Submission)
        assert submission.user is not None
        assert submission.task is not None

    def test_unique_user_task_constraint(self):
        """Test that a user cannot submit twice for the same task."""
        submission = SubmissionFactory()
        with pytest.raises(IntegrityError):
            SubmissionFactory(user=submission.user, task=submission.task)

    def test_grade_constraints(self):
        """Test grade field constraints."""
        submission = SubmissionFactory()
        # Test valid grade
        submission.grade = Decimal('8.50')
        submission.full_clean()
        # Test invalid grade format
        with pytest.raises(ValidationError):
            submission.grade = Decimal('100000.00')  # Exceeds max_digits
            submission.full_clean()

    def test_string_representation(self):
        """Test string representation of submission."""
        submission = SubmissionFactory()
        expected = f"{submission.get_username()} - {submission.get_task_title()}"
        assert str(submission) == expected

@pytest.mark.django_db
class TestQuizModel:
    """Test suite for the Quiz model."""

    def test_quiz_creation(self):
        """Test basic quiz creation."""
        quiz = QuizFactory()
        assert isinstance(quiz, Quiz)
        assert quiz.title is not None
        assert quiz.created_at is not None
        assert quiz.updated_at is not None

    def test_quiz_tasks_relationship(self):
        """Test quiz-tasks many-to-many relationship."""
        quiz = QuizFactory()
        tasks = [QuizTaskFactory() for _ in range(3)]
        quiz.tasks.set(tasks)
        assert quiz.get_total_tasks() == 3
        
        # Test adding tasks
        new_task = QuizTaskFactory()
        quiz.tasks.add(new_task)
        assert quiz.get_total_tasks() == 4

        # Test removing tasks
        quiz.tasks.remove(new_task)
        assert quiz.get_total_tasks() == 3

    def test_string_representation(self):
        """Test string representation of quiz."""
        quiz = QuizFactory()
        assert str(quiz) == quiz.title

@pytest.mark.django_db
class TestUserProgressModel:
    """Test suite for the UserProgress model."""

    def test_progress_creation(self):
        """Test basic user progress creation."""
        progress = UserProgressFactory()
        assert isinstance(progress, UserProgress)
        assert progress.user is not None
        assert progress.quiz is not None
        assert progress.total_score == Decimal('0.0')
        assert not progress.is_completed

    def test_unique_user_quiz_constraint(self):
        """Test that a user cannot have multiple progress records for the same quiz."""
        progress = UserProgressFactory()
        with pytest.raises(IntegrityError):
            UserProgressFactory(user=progress.user, quiz=progress.quiz)

    def test_completed_tasks_relationship(self):
        """Test completed tasks many-to-many relationship."""
        progress = UserProgressFactory()
        tasks = [QuizTaskFactory() for _ in range(3)]
        progress.completed_tasks.set(tasks)
        assert progress.completed_tasks.count() == 3

        # Test adding completed task
        new_task = QuizTaskFactory()
        progress.completed_tasks.add(new_task)
        assert progress.completed_tasks.count() == 4

        # Test removing completed task
        progress.completed_tasks.remove(new_task)
        assert progress.completed_tasks.count() == 3

    def test_string_representation(self):
        """Test string representation of user progress."""
        progress = UserProgressFactory()
        expected = f"{progress.get_username()} - {progress.get_quiz_title()}"
        assert str(progress) == expected