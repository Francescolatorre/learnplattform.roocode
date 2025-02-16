from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import BaseTask, LearningTask, AssessmentTask, QuizTask

User = get_user_model()

class TaskModelTests(TestCase):
    def setUp(self):
        """
        Set up test data for task models.
        """
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpass123'
        )

    def test_learning_task_creation(self):
        """
        Test creating a learning task.
        """
        learning_task = LearningTask.objects.create(
            title='Python Basics',
            description='Learn fundamental Python programming concepts',
            difficulty_level='Beginner',
            due_date=timezone.now() + timezone.timedelta(days=30)
        )

        self.assertEqual(learning_task.title, 'Python Basics')
        self.assertEqual(learning_task.difficulty_level, 'Beginner')
        self.assertIsNotNone(learning_task.created_at)
        self.assertIsNotNone(learning_task.updated_at)

    def test_assessment_task_creation(self):
        """
        Test creating an assessment task.
        """
        assessment_task = AssessmentTask.objects.create(
            title='Python Quiz',
            description='Assessment of Python programming skills',
            max_score=100.00,
            passing_score=60.00,
            due_date=timezone.now() + timezone.timedelta(days=14)
        )

        self.assertEqual(assessment_task.title, 'Python Quiz')
        self.assertEqual(assessment_task.max_score, 100.00)
        self.assertEqual(assessment_task.passing_score, 60.00)

    def test_quiz_task_creation(self):
        """
        Test creating a quiz task.
        """
        quiz_task = QuizTask.objects.create(
            title='Advanced Python Concepts',
            description='Quiz on advanced Python programming',
            max_score=100.00,
            passing_score=70.00,
            time_limit=60,
            is_randomized=True
        )

        self.assertEqual(quiz_task.title, 'Advanced Python Concepts')
        self.assertEqual(quiz_task.time_limit, 60)
        self.assertTrue(quiz_task.is_randomized)

    def test_task_string_representation(self):
        """
        Test the string representation of tasks.
        """
        learning_task = LearningTask.objects.create(title='Test Task')
        self.assertEqual(str(learning_task), 'Test Task')

    def test_task_date_fields(self):
        """
        Test that created_at and updated_at are set correctly.
        """
        learning_task = LearningTask.objects.create(
            title='Datetime Test Task'
        )

        self.assertIsNotNone(learning_task.created_at)
        self.assertIsNotNone(learning_task.updated_at)
        self.assertLessEqual(learning_task.created_at, timezone.now())
        self.assertLessEqual(learning_task.updated_at, timezone.now())
