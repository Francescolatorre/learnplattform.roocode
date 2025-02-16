"""
Tests for the TaskRepository implementation.
"""
import pytest
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from tasks.models import LearningTask, AssessmentTask, QuizTask
from core.tests.factories import (
    UserFactory, QuizTaskFactory, LearningTaskFactory,
    AssessmentTaskFactory
)
from core.repositories.task_repository import TaskRepository

pytestmark = pytest.mark.django_db

class TestTaskRepository:
    """
    Database tests for TaskRepository.
    """
    
    @pytest.fixture
    def repository(self):
        """
        Creates a TaskRepository instance.
        """
        return TaskRepository()

    def test_get_learning_tasks_empty(self, repository):
        """
        Test getting learning tasks when none exist.
        """
        # Act
        tasks = repository.get_learning_tasks()
        
        # Assert
        assert len(tasks) == 0

    def test_get_learning_tasks_with_data(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting learning tasks with existing data.
        """
        # Arrange
        tasks = [LearningTaskFactory() for _ in range(3)]
        
        # Act
        result = repository.get_learning_tasks()
        
        # Assert
        assert len(result) == 3
        assert set(t.id for t in result) == set(t.id for t in tasks)

    def test_get_assessment_tasks_with_data(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting assessment tasks with existing data.
        """
        # Arrange
        tasks = [AssessmentTaskFactory() for _ in range(2)]
        
        # Act
        result = repository.get_assessment_tasks()
        
        # Assert
        assert len(result) == 2
        assert set(t.id for t in result) == set(t.id for t in tasks)

    def test_get_quiz_task_exists(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting a specific quiz task that exists.
        """
        # Arrange
        task = QuizTaskFactory(
            time_limit=30,
            is_randomized=True,
            max_score=Decimal('100.0')
        )
        
        # Act
        result = repository.get_quiz_task(task.id)
        
        # Assert
        assert result.id == task.id
        assert result.time_limit == 30
        assert result.is_randomized is True
        assert result.max_score == Decimal('100.0')

    def test_get_quiz_task_not_found(self, repository):
        """
        Test getting a quiz task that doesn't exist.
        """
        # Act/Assert
        with pytest.raises(ObjectDoesNotExist):
            repository.get_quiz_task(999)

    def test_create_learning_task(
        self,
        repository,
        test_transaction
    ):
        """
        Test creating a new learning task.
        """
        # Arrange
        task_data = {
            'title': 'New Learning Task',
            'description': 'Task Description',
            'difficulty_level': 'Intermediate'
        }
        
        # Act
        with transaction.atomic():
            task = repository.create_learning_task(**task_data)
        
        # Assert
        assert task.id is not None
        assert task.title == task_data['title']
        assert task.difficulty_level == task_data['difficulty_level']

    def test_update_assessment_task(
        self,
        repository,
        test_transaction
    ):
        """
        Test updating an assessment task.
        """
        # Arrange
        task = AssessmentTaskFactory(max_score=Decimal('50.0'))
        updates = {
            'title': 'Updated Title',
            'max_score': Decimal('75.0')
        }
        
        # Act
        with transaction.atomic():
            updated_task = repository.update_assessment_task(task.id, **updates)
        
        # Assert
        assert updated_task.title == updates['title']
        assert updated_task.max_score == updates['max_score']

    def test_delete_task(
        self,
        repository,
        test_transaction
    ):
        """
        Test deleting a task.
        """
        # Arrange
        task = LearningTaskFactory()
        
        # Act
        with transaction.atomic():
            repository.delete_task(task.id)
        
        # Assert
        with pytest.raises(ObjectDoesNotExist):
            LearningTask.objects.get(id=task.id)

    def test_atomic_task_creation(
        self,
        repository,
        test_transaction
    ):
        """
        Test atomic task creation with validation.
        """
        # Arrange
        task_data = {
            'title': 'Complex Task',
            'max_score': Decimal('100.0'),
            'time_limit': 45,
            'is_randomized': True
        }
        
        # Act
        with transaction.atomic():
            quiz_task = repository.create_quiz_task(**task_data)
        
        # Assert
        saved_task = repository.get_quiz_task(quiz_task.id)
        assert saved_task.title == task_data['title']
        assert saved_task.max_score == task_data['max_score']
        assert saved_task.time_limit == task_data['time_limit']

    def test_concurrent_task_update(
        self,
        repository,
        nested_transaction
    ):
        """
        Test concurrent task update with transaction isolation.
        """
        # Arrange
        task = QuizTaskFactory(time_limit=30)
        
        # Act
        with transaction.atomic():
            # First update
            task.time_limit = 45
            task.save()
            
            # Simulate concurrent update
            with transaction.atomic():
                concurrent_task = QuizTask.objects.get(id=task.id)
                concurrent_task.time_limit = 60
                concurrent_task.save()
        
        # Assert
        final_task = repository.get_quiz_task(task.id)
        assert final_task.time_limit == 60