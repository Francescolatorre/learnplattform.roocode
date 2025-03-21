from django.test import TestCase
from django.utils import timezone
import datetime
from django.contrib.auth import get_user_model
from core.models import (
    Course, LearningTask, QuizTask, QuizQuestion, QuizOption,
    CourseEnrollment, TaskProgress, QuizAttempt, QuizResponse
)

User = get_user_model()


class CourseEnrollmentModelTest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            role="student"
        )

        # Create test course
        self.course = Course.objects.create(
            title="Test Course",
            description="Test Description",
            status="published",
            visibility="public",
            creator=self.user
        )

        # Create test tasks
        self.task1 = LearningTask.objects.create(
            course=self.course,
            title="Task 1",
            description="Task 1 Description",
            order=1,
            is_published=True
        )

        self.task2 = LearningTask.objects.create(
            course=self.course,
            title="Task 2",
            description="Task 2 Description",
            order=2,
            is_published=True
        )

        # Create enrollment
        self.enrollment = CourseEnrollment.objects.create(
            user=self.user,
            course=self.course,
            status="active"
        )

        # Create task progress
        self.progress1 = TaskProgress.objects.create(
            user=self.user,
            task=self.task1,
            status="completed",
            completion_date=timezone.now()
        )

        self.progress2 = TaskProgress.objects.create(
            user=self.user,
            task=self.task2,
            status="in_progress"
        )

    def test_enrollment_creation(self):
        """Test that enrollment is created correctly"""
        self.assertEqual(self.enrollment.user, self.user)
        self.assertEqual(self.enrollment.course, self.course)
        self.assertEqual(self.enrollment.status, "active")
        self.assertIsNotNone(self.enrollment.enrollment_date)

    def test_calculate_course_progress(self):
        """Test the calculate_course_progress method"""
        # 1 of 2 tasks completed = 50%
        self.assertEqual(self.enrollment.calculate_course_progress(), 50.0)

        # Complete the second task
        self.progress2.status = "completed"
        self.progress2.completion_date = timezone.now()
        self.progress2.save()

        # 2 of 2 tasks completed = 100%
        self.assertEqual(self.enrollment.calculate_course_progress(), 100.0)

    def test_is_course_completed(self):
        """Test the is_course_completed method"""
        # Not all tasks are completed
        self.assertFalse(self.enrollment.is_course_completed())

        # Complete the second task
        self.progress2.status = "completed"
        self.progress2.completion_date = timezone.now()
        self.progress2.save()

        # All tasks are completed
        self.assertTrue(self.enrollment.is_course_completed())


class TaskProgressModelTest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            role="student"
        )

        # Create test course
        self.course = Course.objects.create(
            title="Test Course",
            description="Test Description",
            status="published",
            visibility="public",
            creator=self.user
        )

        # Create test task
        self.task = LearningTask.objects.create(
            course=self.course,
            title="Test Task",
            description="Test Task Description",
            order=1,
            is_published=True
        )

        # Create task progress
        self.progress = TaskProgress.objects.create(
            user=self.user,
            task=self.task,
            status="in_progress",
            time_spent=datetime.timedelta(minutes=30)
        )

    def test_task_progress_creation(self):
        """Test that task progress is created correctly"""
        self.assertEqual(self.progress.user, self.user)
        self.assertEqual(self.progress.task, self.task)
        self.assertEqual(self.progress.status, "in_progress")
        self.assertEqual(self.progress.time_spent, datetime.timedelta(minutes=30))
        self.assertIsNone(self.progress.completion_date)

    def test_task_progress_completion(self):
        """Test task progress completion"""
        # Mark as completed
        self.progress.status = "completed"
        self.progress.completion_date = timezone.now()
        self.progress.save()

        # Verify changes
        self.assertEqual(self.progress.status, "completed")
        self.assertIsNotNone(self.progress.completion_date)


class QuizAttemptModelTest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            role="student"
        )

        # Create test course
        self.course = Course.objects.create(
            title="Test Course",
            description="Test Description",
            status="published",
            visibility="public",
            creator=self.user
        )

        # Create quiz task
        self.quiz = QuizTask.objects.create(
            course=self.course,
            title="Test Quiz",
            description="Test Quiz Description",
            order=1,
            is_published=True,
            time_limit_minutes=30,
            pass_threshold=70
        )

        # Create quiz questions
        self.question1 = QuizQuestion.objects.create(
            quiz=self.quiz,
            text="Question 1",
            points=10,
            order=1
        )

        self.question2 = QuizQuestion.objects.create(
            quiz=self.quiz,
            text="Question 2",
            points=10,
            order=2
        )

        # Create options for questions
        self.option1_1 = QuizOption.objects.create(
            question=self.question1,
            text="Option 1",
            is_correct=True,
            order=1
        )

        self.option1_2 = QuizOption.objects.create(
            question=self.question1,
            text="Option 2",
            is_correct=False,
            order=2
        )

        self.option2_1 = QuizOption.objects.create(
            question=self.question2,
            text="Option 1",
            is_correct=False,
            order=1
        )

        self.option2_2 = QuizOption.objects.create(
            question=self.question2,
            text="Option 2",
            is_correct=True,
            order=2
        )

        # Create quiz attempt
        self.attempt = QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz,
            score=80,
            time_taken=datetime.timedelta(minutes=20),
            completion_status="completed"
        )

        # Create quiz responses
        self.response1 = QuizResponse.objects.create(
            attempt=self.attempt,
            question=self.question1,
            selected_option=self.option1_1,
            is_correct=True,
            time_spent=datetime.timedelta(minutes=5)
        )

        self.response2 = QuizResponse.objects.create(
            attempt=self.attempt,
            question=self.question2,
            selected_option=self.option2_1,
            is_correct=False,
            time_spent=datetime.timedelta(minutes=5)
        )

    def test_quiz_attempt_creation(self):
        """Test that quiz attempt is created correctly"""
        self.assertEqual(self.attempt.user, self.user)
        self.assertEqual(self.attempt.quiz, self.quiz)
        self.assertEqual(self.attempt.score, 80)
        self.assertEqual(self.attempt.time_taken, datetime.timedelta(minutes=20))
        self.assertEqual(self.attempt.completion_status, "completed")
        self.assertIsNotNone(self.attempt.attempt_date)

    def test_get_latest_attempt(self):
        """Test the get_latest_attempt method"""
        # Create a new attempt
        new_attempt = QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz,
            score=90,
            time_taken=datetime.timedelta(minutes=15),
            completion_status="completed"
        )

        # The new attempt should be the latest
        latest_attempt = new_attempt.get_latest_attempt()
        self.assertEqual(latest_attempt, new_attempt)


class QuizResponseModelTest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            role="student"
        )

        # Create test course
        self.course = Course.objects.create(
            title="Test Course",
            description="Test Description",
            status="published",
            visibility="public",
            creator=self.user
        )

        # Create quiz task
        self.quiz = QuizTask.objects.create(
            course=self.course,
            title="Test Quiz",
            description="Test Quiz Description",
            order=1,
            is_published=True,
            time_limit_minutes=30,
            pass_threshold=70
        )

        # Create quiz question
        self.question = QuizQuestion.objects.create(
            quiz=self.quiz,
            text="Test Question",
            points=10,
            order=1
        )

        # Create options for question
        self.option1 = QuizOption.objects.create(
            question=self.question,
            text="Option 1",
            is_correct=True,
            order=1
        )

        self.option2 = QuizOption.objects.create(
            question=self.question,
            text="Option 2",
            is_correct=False,
            order=2
        )

        # Create quiz attempt
        self.attempt = QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz,
            score=100,
            time_taken=datetime.timedelta(minutes=10),
            completion_status="completed"
        )

        # Create quiz response
        self.response = QuizResponse.objects.create(
            attempt=self.attempt,
            question=self.question,
            selected_option=self.option1,
            is_correct=True,
            time_spent=datetime.timedelta(minutes=2)
        )

    def test_quiz_response_creation(self):
        """Test that quiz response is created correctly"""
        self.assertEqual(self.response.attempt, self.attempt)
        self.assertEqual(self.response.question, self.question)
        self.assertEqual(self.response.selected_option, self.option1)
        self.assertTrue(self.response.is_correct)
        self.assertEqual(self.response.time_spent, datetime.timedelta(minutes=2))


class UserProgressMethodsTest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            role="student"
        )

        # Create test course
        self.course = Course.objects.create(
            title="Test Course",
            description="Test Description",
            status="published",
            visibility="public",
            creator=self.user
        )

        # Create test tasks
        self.task1 = LearningTask.objects.create(
            course=self.course,
            title="Task 1",
            description="Task 1 Description",
            order=1,
            is_published=True
        )

        self.task2 = LearningTask.objects.create(
            course=self.course,
            title="Task 2",
            description="Task 2 Description",
            order=2,
            is_published=True
        )

        # Create quiz task
        self.quiz = QuizTask.objects.create(
            course=self.course,
            title="Test Quiz",
            description="Test Quiz Description",
            order=3,
            is_published=True,
            time_limit_minutes=30,
            pass_threshold=70
        )

        # Create task progress
        self.progress1 = TaskProgress.objects.create(
            user=self.user,
            task=self.task1,
            status="completed",
            completion_date=timezone.now()
        )

        self.progress2 = TaskProgress.objects.create(
            user=self.user,
            task=self.task2,
            status="in_progress"
        )

        # Create quiz attempt
        self.attempt1 = QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz,
            score=80,
            time_taken=datetime.timedelta(minutes=20),
            completion_status="completed",
            attempt_date=timezone.now() - datetime.timedelta(days=1)
        )

        self.attempt2 = QuizAttempt.objects.create(
            user=self.user,
            quiz=self.quiz,
            score=90,
            time_taken=datetime.timedelta(minutes=15),
            completion_status="completed",
            attempt_date=timezone.now()
        )

    def test_calculate_progress_percentage(self):
        """Test the calculate_progress_percentage method"""
        # 1 of 2 tasks completed = 50.0%
        progress_percentage = self.user.calculate_progress_percentage()
        self.assertAlmostEqual(progress_percentage, 50.0, delta=0.01)

        # Complete the second task
        self.progress2.status = "completed"
        self.progress2.completion_date = timezone.now()
        self.progress2.save()

        # 2 of 2 tasks completed = 100.0%
        progress_percentage = self.user.calculate_progress_percentage()
        self.assertAlmostEqual(progress_percentage, 100.0, delta=0.01)

    def test_get_latest_quiz_attempt(self):
        """Test the get_latest_quiz_attempt method"""
        # The second attempt should be the latest
        latest_attempt = self.user.get_latest_quiz_attempt()
        self.assertEqual(latest_attempt, self.attempt2)

        # Test with specific quiz
        latest_attempt = self.user.get_latest_quiz_attempt(quiz=self.quiz)
        self.assertEqual(latest_attempt, self.attempt2)
