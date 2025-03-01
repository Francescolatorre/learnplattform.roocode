import pytest
from django.contrib.auth import get_user_model

from courses.models import Course
from tasks.models import LearningTask, TaskDifficulty, TaskStatus

User = get_user_model()

@pytest.mark.django_db
class TestTaskModels:
    def test_learning_task_creation(self, django_user_model):
        """
        Test creating a learning task with all required fields.
        """
        # Create a test user
        user = django_user_model.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpass123'
        )
        
        # Create a test course
        course = Course.objects.create(
            title='Test Course',
            description='A test course',
            instructor=user,
            difficulty_level='BEGINNER'
        )

        # Create a learning task
        task = LearningTask.objects.create(
            title='Test Task',
            description='Test Description',
            course=course,
            created_by=user,
            difficulty_level=TaskDifficulty.BEGINNER,
            task_type='test_type'
        )
        
        # Verify task creation
        assert task.title == 'Test Task'
        assert task.description == 'Test Description'
        assert task.course == course
        assert task.created_by == user
        assert task.status == TaskStatus.DRAFT
        assert task.difficulty_level == TaskDifficulty.BEGINNER
        assert task.task_type == 'test_type'
        assert task.is_active is True

    def test_task_status_choices(self):
        """
        Test the available task status choices.
        """
        valid_statuses = [status[0] for status in TaskStatus.choices]
        expected_statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED']
        assert set(valid_statuses) == set(expected_statuses)

    def test_task_difficulty_choices(self):
        """
        Test the available task difficulty choices.
        """
        valid_difficulties = [diff[0] for diff in TaskDifficulty.choices]
        expected_difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
        assert set(valid_difficulties) == set(expected_difficulties)
