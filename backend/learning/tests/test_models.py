"""
Tests for learning app models.
"""
import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from learning.models import Course
from core.tests.factories import (
    CourseFactory, UserFactory, LearningTaskFactory
)

@pytest.mark.django_db
class TestCourseModel:
    """Test suite for the Course model."""

    def test_course_creation(self):
        """Test basic course creation."""
        course = CourseFactory()
        assert isinstance(course, Course)
        assert course.title is not None
        assert course.created_at is not None
        assert course.updated_at is not None

    def test_unique_title_constraint(self):
        """Test that course titles must be unique."""
        course = CourseFactory(title="Python 101")
        with pytest.raises(IntegrityError):
            CourseFactory(title="Python 101")

    def test_instructor_relationship(self):
        """Test instructor relationship behavior."""
        instructor = UserFactory()
        course = CourseFactory(instructor=instructor)
        assert course.instructor == instructor
        
        # Test SET_NULL behavior
        instructor.delete()
        course.refresh_from_db()
        assert course.instructor is None

    def test_tasks_relationship(self):
        """Test tasks many-to-many relationship."""
        course = CourseFactory()
        tasks = [LearningTaskFactory() for _ in range(3)]
        
        # Test adding tasks
        course.tasks.set(tasks)
        assert course.get_total_tasks() == 3
        
        # Test adding more tasks
        new_task = LearningTaskFactory()
        course.tasks.add(new_task)
        assert course.get_total_tasks() == 4
        
        # Test removing tasks
        course.tasks.remove(new_task)
        assert course.get_total_tasks() == 3

    def test_get_learning_tasks(self):
        """Test get_learning_tasks method."""
        course = CourseFactory()
        tasks = [LearningTaskFactory() for _ in range(3)]
        course.tasks.set(tasks)
        
        retrieved_tasks = course.get_learning_tasks()
        assert len(retrieved_tasks) == 3
        for task in tasks:
            assert task in retrieved_tasks

    def test_string_representation(self):
        """Test string representation of course."""
        course = CourseFactory(title="Python Programming")
        assert str(course) == "Python Programming"

    def test_optional_description(self):
        """Test that description is optional."""
        course = CourseFactory(description="")
        course.full_clean()  # Should not raise ValidationError

    def test_title_max_length(self):
        """Test title field max length validation."""
        with pytest.raises(ValidationError):
            course = CourseFactory(title="a" * 201)  # Exceeds max_length of 200
            course.full_clean()