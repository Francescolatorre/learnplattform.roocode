"""
Tests for tasks app models.
"""
import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError
from tasks.models import LearningTask, AssessmentTask, QuizTask
from core.tests.factories import QuizTaskFactory

@pytest.mark.django_db
class TestBaseTaskBehavior:
    """Test the behavior inherited from BaseTask."""

    def test_learning_task_creation(self):
        """Test creating a learning task with base fields."""
        task = LearningTask.objects.create(
            title="Learn Python Basics",
            description="Introduction to Python programming",
            difficulty_level="Beginner"
        )
        assert task.title == "Learn Python Basics"
        assert task.description == "Introduction to Python programming"
        assert task.created_at is not None
        assert task.updated_at is not None

    def test_assessment_task_creation(self):
        """Test creating an assessment task with base fields."""
        task = AssessmentTask.objects.create(
            title="Python Assessment",
            description="Test your Python knowledge",
            max_score=Decimal('100.00'),
            passing_score=Decimal('60.00')
        )
        assert task.title == "Python Assessment"
        assert task.description == "Test your Python knowledge"
        assert task.created_at is not None
        assert task.updated_at is not None

    def test_title_max_length(self):
        """Test title field max length validation."""
        with pytest.raises(ValidationError):
            task = LearningTask(title="a" * 201)  # Exceeds max_length of 200
            task.full_clean()

@pytest.mark.django_db
class TestLearningTask:
    """Test suite for the LearningTask model."""

    def test_difficulty_level_optional(self):
        """Test that difficulty_level is optional."""
        task = LearningTask.objects.create(
            title="Optional Difficulty Task"
        )
        task.full_clean()  # Should not raise ValidationError
        assert task.difficulty_level == ""

    def test_string_representation(self):
        """Test string representation of learning task."""
        task = LearningTask.objects.create(
            title="Test Task"
        )
        assert str(task) == "Test Task"

@pytest.mark.django_db
class TestAssessmentTask:
    """Test suite for the AssessmentTask model."""

    def test_score_fields_optional(self):
        """Test that score fields are optional."""
        task = AssessmentTask.objects.create(
            title="Optional Scores Task"
        )
        task.full_clean()  # Should not raise ValidationError
        assert task.max_score is None
        assert task.passing_score is None

    def test_score_decimal_constraints(self):
        """Test decimal constraints on score fields."""
        task = AssessmentTask.objects.create(
            title="Score Constraints Test",
            max_score=Decimal('999.99'),  # Maximum valid value
            passing_score=Decimal('0.01')  # Minimum valid value
        )
        task.full_clean()  # Should not raise ValidationError

        with pytest.raises(ValidationError):
            task.max_score = Decimal('1000.00')  # Exceeds max_digits
            task.full_clean()

@pytest.mark.django_db
class TestQuizTask:
    """Test suite for the QuizTask model."""

    def test_quiz_task_creation(self):
        """Test creating a quiz task with all fields."""
        task = QuizTaskFactory()
        assert isinstance(task, QuizTask)
        assert task.title is not None
        assert isinstance(task.time_limit, int) or task.time_limit is None
        assert isinstance(task.is_randomized, bool)

    def test_inheritance_from_assessment_task(self):
        """Test that QuizTask inherits properly from AssessmentTask."""
        task = QuizTaskFactory(
            max_score=Decimal('100.00'),
            passing_score=Decimal('70.00')
        )
        assert isinstance(task, AssessmentTask)
        assert task.max_score == Decimal('100.00')
        assert task.passing_score == Decimal('70.00')

    def test_time_limit_optional(self):
        """Test that time_limit is optional."""
        task = QuizTask.objects.create(
            title="No Time Limit Quiz"
        )
        task.full_clean()  # Should not raise ValidationError
        assert task.time_limit is None

    def test_is_randomized_default(self):
        """Test is_randomized default value."""
        task = QuizTask.objects.create(
            title="Default Randomization Quiz"
        )
        assert task.is_randomized is False  # Default value

    def test_string_representation(self):
        """Test string representation of quiz task."""
        task = QuizTaskFactory(title="Test Quiz")
        assert str(task) == "Test Quiz"