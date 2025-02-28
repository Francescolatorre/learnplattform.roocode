"""
Tests for tasks app models.
"""

from decimal import Decimal
import pytest

from django.core.exceptions import ValidationError
from tasks.models import LearningTask, AssessmentTask, QuizTask
from core.tests.factories import QuizTaskFactory
from courses.models import Course
from users.models import User


@pytest.mark.transactional
class TestBaseTaskBehavior:
    """Test the behavior inherited from BaseTask."""

    def test_learning_task_creation(self, transactional_db):
        """Test creating a learning task with base fields."""
        # Create necessary related objects
        course = Course.objects.create(title="Test Course", description="Test description")
        user = User.objects.create_user(username="testuser", password="testpassword")

        task = LearningTask.objects.create(
            title="Learn Python Basics",
            description="Introduction to Python programming",
            course=course,
            status="Draft",
            created_by=user,
            max_submissions=5,
            deadline="2025-03-15T12:00:00Z",
        )
        assert task.title == "Learn Python Basics"
        assert task.description == "Introduction to Python programming"
        assert task.created_at is not None
        assert task.updated_at is not None
        assert task.course == course
        assert task.status == "Draft"
        assert task.created_by == user
        assert task.max_submissions == 5
        assert task.deadline.year == 2025
        assert task.deadline.month == 3
        assert task.deadline.day == 15

    def test_assessment_task_creation(self, transactional_db):
        """Test creating an assessment task with base fields."""
        task = AssessmentTask.objects.create(
            title="Python Assessment",
            description="Test your Python knowledge",
            max_score=Decimal("100.00"),
            passing_score=Decimal("60.00"),
        )
        assert task.title == "Python Assessment"
        assert task.description == "Test your Python knowledge"
        assert task.created_at is not None
        assert task.updated_at is not None

    def test_title_max_length(self, transactional_db):
        """Test title field max length validation."""
        with pytest.raises(ValidationError):
            task = LearningTask(title="a" * 256)  # Exceeds max_length of 255
            task.full_clean()


@pytest.mark.transactional
class TestLearningTask:
    """Test suite for the LearningTask model."""

    def test_difficulty_level_optional(self, transactional_db):
        """Test that difficulty_level is optional."""
        # Create necessary related objects
        course = Course.objects.create(title="Test Course", description="Test description")
        user = User.objects.create_user(username="testuser", password="testpassword")
        task = LearningTask.objects.create(
            title="Optional Difficulty Task",
            course=course,
            status="Draft",
            created_by=user,
            max_submissions=1,
            deadline="2025-03-15T12:00:00Z",
        )
        task.full_clean()  # Should not raise ValidationError
        assert task.difficulty_level == ""

    def test_string_representation(self, transactional_db):
        """Test string representation of learning task."""
        # Create necessary related objects
        course = Course.objects.create(title="Test Course", description="Test description")
        user = User.objects.create_user(username="testuser", password="testpassword")
        task = LearningTask.objects.create(
            title="Test Task",
            course=course,
            status="Draft",
            created_by=user,
            max_submissions=1,
            deadline="2025-03-15T12:00:00Z",
        )
        assert str(task) == "Test Task"

    def test_status_choices(self, transactional_db):
        """Test status choices validation."""
        # Create necessary related objects
        course = Course.objects.create(title="Test Course", description="Test description")
        user = User.objects.create_user(username="testuser", password="testpassword")
        with pytest.raises(ValidationError):
            LearningTask.objects.create(
                title="Invalid Status Task",
                description="Test description",
                course=course,
                status="Invalid Status", # Invalid status
                created_by=user,
                max_submissions=1,
                deadline="2025-03-15T12:00:00Z",
            )

    def test_required_fields(self, transactional_db):
        """Test required fields validation."""
        with pytest.raises(ValidationError):
            LearningTask.objects.create(title="Missing Fields Task") # Missing required fields
            LearningTask(title="Missing Fields Task").full_clean()


@pytest.mark.transactional
class TestAssessmentTask:
    """Test suite for the AssessmentTask model."""

    def test_score_fields_optional(self, transactional_db):
        """Test that score fields are optional."""
        task = AssessmentTask.objects.create(title="Optional Scores Task")
        task.full_clean()  # Should not raise ValidationError
        assert task.max_score is None
        assert task.passing_score is None

    def test_score_decimal_constraints(self, transactional_db):
        """Test decimal constraints on score fields."""
        task = AssessmentTask.objects.create(
            title="Score Constraints Test",
            max_score=Decimal("999.99"),  # Maximum valid value
            passing_score=Decimal("0.01"),  # Minimum valid value
        )
        task.full_clean()  # Should not raise ValidationError

        with pytest.raises(ValidationError):
            task.max_score = Decimal("1000.00")  # Exceeds max_digits
            task.full_clean()


@pytest.mark.transactional
class TestQuizTask:
    """Test suite for the QuizTask model."""

    def test_quiz_task_creation(self, transactional_db):
        """Test creating a quiz task with all fields."""
        task = QuizTaskFactory()
        assert isinstance(task, QuizTask)
        assert task.title is not None
        assert isinstance(task.time_limit, int) or task.time_limit is None
        assert isinstance(task.is_randomized, bool)

    def test_inheritance_from_assessment_task(self, transactional_db):
        """Test that QuizTask inherits properly from AssessmentTask."""
        task = QuizTaskFactory(
            max_score=Decimal("100.00"), passing_score=Decimal("70.00")
        )
        assert isinstance(task, AssessmentTask)
        assert task.max_score == Decimal("100.00")
        assert task.passing_score == Decimal("70.00")

    def test_time_limit_optional(self, transactional_db):
        """Test that time_limit is optional."""
        task = QuizTask.objects.create(title="No Time Limit Quiz")
        task.full_clean()  # Should not raise ValidationError
        assert task.time_limit is None

    def test_is_randomized_default(self, transactional_db):
        """Test is_randomized default value."""
        task = QuizTask.objects.create(title="Default Randomization Quiz")
        assert task.is_randomized is False  # Default value

    def test_string_representation(self, transactional_db):
        """Test string representation of quiz task."""
        task = QuizTaskFactory(title="Test Quiz")
        assert str(task) == "Test Quiz"
