from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Submission, Quiz, UserProgress
from tasks.models import QuizTask, AssessmentTask

User = get_user_model()

class AssessmentModelTests(TestCase):
    def setUp(self):
        """
        Set up test data for assessment models.
        """
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpass123'
        )

        # Create a quiz task
        self.quiz_task = QuizTask.objects.create(
            title='Python Basics Quiz',
            description='Quiz on fundamental Python concepts',
            max_score=100.00,
            passing_score=60.00,
            time_limit=60,
            is_randomized=True
        )

        # Create a quiz
        self.quiz = Quiz.objects.create(
            title='Python Fundamentals Quiz',
            description='A comprehensive quiz on Python basics'
        )
        self.quiz.tasks.add(self.quiz_task)

    def test_submission_creation(self):
        """
        Test creating a submission for an assessment task.
        """
        assessment_task = AssessmentTask.objects.create(
            title='Python Assignment',
            description='Coding assignment on Python fundamentals',
            max_score=100.00,
            passing_score=70.00
        )

        submission = Submission.objects.create(
            user=self.user,
            task=assessment_task,
            content='Solution to the Python assignment',
            grade=85.50
        )

        self.assertEqual(submission.user, self.user)
        self.assertEqual(submission.task, assessment_task)
        self.assertEqual(submission.grade, 85.50)
        self.assertIsNotNone(submission.submitted_at)

    def test_quiz_creation_and_task_management(self):
        """
        Test quiz creation and task management.
        """
        # Verify quiz creation
        self.assertEqual(self.quiz.title, 'Python Fundamentals Quiz')
        self.assertEqual(self.quiz.get_total_tasks(), 1)
        self.assertIn(self.quiz_task, self.quiz.tasks.all())

    def test_user_progress_creation(self):
        """
        Test creating and managing user progress for a quiz.
        """
        user_progress = UserProgress.objects.create(
            user=self.user,
            quiz=self.quiz
        )

        # Add a completed task
        user_progress.completed_tasks.add(self.quiz_task)

        self.assertEqual(user_progress.user, self.user)
        self.assertEqual(user_progress.quiz, self.quiz)
        self.assertIn(self.quiz_task, user_progress.completed_tasks.all())
        self.assertEqual(user_progress.total_score, 0)  # Default value
        self.assertFalse(user_progress.is_completed)

    def test_user_progress_completion(self):
        """
        Test user progress completion logic.
        """
        user_progress = UserProgress.objects.create(
            user=self.user,
            quiz=self.quiz
        )

        # Add all tasks to completed tasks
        user_progress.completed_tasks.add(self.quiz_task)
        user_progress.total_score = self.quiz_task.max_score or 0
        user_progress.is_completed = (
            user_progress.completed_tasks.count() == self.quiz.tasks.count()
        )
        user_progress.save()

        self.assertTrue(user_progress.is_completed)
        self.assertEqual(user_progress.total_score, 100.00)

    def test_submission_string_representation(self):
        """
        Test the string representation of a submission.
        """
        assessment_task = AssessmentTask.objects.create(
            title='Test Task',
            max_score=100.00
        )

        submission = Submission.objects.create(
            user=self.user,
            task=assessment_task
        )

        self.assertEqual(str(submission), f'{self.user.username} - Test Task')

    def test_quiz_string_representation(self):
        """
        Test the string representation of a quiz.
        """
        self.assertEqual(str(self.quiz), 'Python Fundamentals Quiz')
