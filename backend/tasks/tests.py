import os
import sys
import django
from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.models import Course
from tasks.models import LearningTask, TaskStatus, TaskDifficulty

# Debugging: Print Python path and Django setup
print("Python Path:", sys.path)
print("Current Working Directory:", os.getcwd())

# Ensure Django is set up correctly
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings')
django.setup()

User = get_user_model()

class TaskModelTestCase(TestCase):
    def setUp(self):
        """
        Set up test data for task models.
        """
        print("Running setUp method")
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpass123'
        )
        
        # Create a test course
        self.course = Course.objects.create(
            title='Test Course',
            description='A test course',
            instructor=self.user,
            difficulty_level='BEGINNER'
        )

    def test_learning_task_creation(self):
        """
        Test creating a learning task with all required fields.
        """
        print("Running test_learning_task_creation")
        task = LearningTask.objects.create(
            title='Test Task',
            description='Test Description',
            course=self.course,
            created_by=self.user,
            difficulty_level=TaskDifficulty.BEGINNER,
            task_type='test_type'
        )
        
        # Verify task creation
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.description, 'Test Description')
        self.assertEqual(task.course, self.course)
        self.assertEqual(task.created_by, self.user)
        self.assertEqual(task.status, TaskStatus.DRAFT)
        self.assertEqual(task.difficulty_level, TaskDifficulty.BEGINNER)
        self.assertEqual(task.task_type, 'test_type')
        self.assertTrue(task.is_active)
        print("test_learning_task_creation completed")

    def test_task_status_choices(self):
        """
        Test the available task status choices.
        """
        print("Running test_task_status_choices")
        valid_statuses = [status[0] for status in TaskStatus.choices]
        expected_statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED']
        self.assertEqual(set(valid_statuses), set(expected_statuses))
        print("test_task_status_choices completed")

    def test_task_difficulty_choices(self):
        """
        Test the available task difficulty choices.
        """
        print("Running test_task_difficulty_choices")
        valid_difficulties = [diff[0] for diff in TaskDifficulty.choices]
        expected_difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
        self.assertEqual(set(valid_difficulties), set(expected_difficulties))
        print("test_task_difficulty_choices completed")

# Debugging: Ensure tests are discoverable
if __name__ == '__main__':
    import unittest
    unittest.main(verbosity=2)
