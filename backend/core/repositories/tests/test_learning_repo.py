"""
Tests for the LearningRepository implementation.
"""
import pytest
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from learning.models import Course
from tasks.models import LearningTask
from core.tests.factories import (
    UserFactory, CourseFactory, LearningTaskFactory
)
from core.repositories.learning_repository import LearningRepository

pytestmark = pytest.mark.django_db

class TestLearningRepository:
    """
    Database tests for LearningRepository.
    """

    @pytest.fixture
    def repository(self):
        """
        Creates a LearningRepository instance.
        """
        return LearningRepository()

    def test_get_courses_empty(self, repository):
        """
        Test getting courses when none exist.
        """
        # Act
        courses = repository.get_courses()
        
        # Assert
        assert len(courses) == 0

    def test_get_courses_with_data(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting courses with existing data.
        """
        # Arrange
        courses = [CourseFactory() for _ in range(3)]
        
        # Act
        result = repository.get_courses()
        
        # Assert
        assert len(result) == 3
        assert set(c.id for c in result) == set(c.id for c in courses)

    def test_get_course_by_id(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting a specific course by ID.
        """
        # Arrange
        course = CourseFactory(title="Python Programming")
        
        # Act
        result = repository.get_course_by_id(course.id)
        
        # Assert
        assert result.id == course.id
        assert result.title == "Python Programming"

    def test_get_course_by_id_not_found(self, repository):
        """
        Test getting a course that doesn't exist.
        """
        # Act/Assert
        with pytest.raises(ObjectDoesNotExist):
            repository.get_course_by_id(999)

    def test_create_course(
        self,
        repository,
        test_user,
        test_transaction
    ):
        """
        Test creating a new course.
        """
        # Arrange
        course_data = {
            'title': 'New Course',
            'description': 'Course Description',
            'instructor': test_user
        }
        
        # Act
        with transaction.atomic():
            course = repository.create_course(**course_data)
        
        # Assert
        assert course.id is not None
        assert course.title == course_data['title']
        assert course.instructor == test_user

    def test_update_course(
        self,
        repository,
        test_user,
        test_transaction
    ):
        """
        Test updating a course.
        """
        # Arrange
        course = CourseFactory()
        updates = {
            'title': 'Updated Course',
            'instructor': test_user
        }
        
        # Act
        with transaction.atomic():
            updated_course = repository.update_course(course.id, **updates)
        
        # Assert
        assert updated_course.title == updates['title']
        assert updated_course.instructor == test_user

    def test_delete_course(
        self,
        repository,
        test_transaction
    ):
        """
        Test deleting a course.
        """
        # Arrange
        course = CourseFactory()
        
        # Act
        with transaction.atomic():
            repository.delete_course(course.id)
        
        # Assert
        with pytest.raises(ObjectDoesNotExist):
            Course.objects.get(id=course.id)

    def test_add_task_to_course(
        self,
        repository,
        test_transaction
    ):
        """
        Test adding a task to a course.
        """
        # Arrange
        course = CourseFactory()
        task = LearningTaskFactory()
        
        # Act
        with transaction.atomic():
            repository.add_task_to_course(course.id, task.id)
        
        # Assert
        updated_course = repository.get_course_by_id(course.id)
        assert task in updated_course.tasks.all()

    def test_remove_task_from_course(
        self,
        repository,
        test_transaction
    ):
        """
        Test removing a task from a course.
        """
        # Arrange
        task = LearningTaskFactory()
        course = CourseFactory()
        course.tasks.add(task)
        
        # Act
        with transaction.atomic():
            repository.remove_task_from_course(course.id, task.id)
        
        # Assert
        updated_course = repository.get_course_by_id(course.id)
        assert task not in updated_course.tasks.all()

    def test_get_instructor_courses(
        self,
        repository,
        test_user,
        transactional_db_setup
    ):
        """
        Test getting courses for a specific instructor.
        """
        # Arrange
        instructor_courses = [
            CourseFactory(instructor=test_user) for _ in range(2)
        ]
        other_courses = [CourseFactory() for _ in range(2)]
        
        # Act
        result = repository.get_instructor_courses(test_user.id)
        
        # Assert
        assert len(result) == 2
        assert all(c.instructor == test_user for c in result)

    def test_get_course_tasks(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting all tasks for a course.
        """
        # Arrange
        tasks = [LearningTaskFactory() for _ in range(3)]
        course = CourseFactory()
        course.tasks.add(*tasks)
        
        # Act
        result = repository.get_course_tasks(course.id)
        
        # Assert
        assert len(result) == 3
        assert set(t.id for t in result) == set(t.id for t in tasks)

    def test_atomic_course_creation_with_tasks(
        self,
        repository,
        test_user,
        test_transaction
    ):
        """
        Test atomic course creation with tasks.
        """
        # Arrange
        tasks = [LearningTaskFactory() for _ in range(2)]
        course_data = {
            'title': 'New Course with Tasks',
            'instructor': test_user
        }
        
        # Act
        with transaction.atomic():
            course = repository.create_course(**course_data)
            for task in tasks:
                repository.add_task_to_course(course.id, task.id)
        
        # Assert
        saved_course = repository.get_course_by_id(course.id)
        assert saved_course.tasks.count() == 2
        assert set(t.id for t in saved_course.tasks.all()) == set(t.id for t in tasks)

    def test_concurrent_course_update(
        self,
        repository,
        test_user,
        nested_transaction
    ):
        """
        Test concurrent course update with transaction isolation.
        """
        # Arrange
        course = CourseFactory(title="Original Title")
        
        # Act
        with transaction.atomic():
            # First update
            course.title = "First Update"
            course.save()
            
            # Simulate concurrent update
            with transaction.atomic():
                concurrent_course = Course.objects.get(id=course.id)
                concurrent_course.title = "Second Update"
                concurrent_course.save()
        
        # Assert
        final_course = repository.get_course_by_id(course.id)
        assert final_course.title == "Second Update"