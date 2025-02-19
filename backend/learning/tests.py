from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Course
from tasks.models import LearningTask

User = get_user_model()


class CourseModelTests(TestCase):
    def setUp(self):
        """
        Set up test data for course model.
        """
        self.user = User.objects.create_user(
            username="instructor",
            email="instructor@example.com",
            password="testpass123",
        )

        # Create some learning tasks
        self.task1 = LearningTask.objects.create(
            title="Python Basics",
            description="Introduction to Python programming",
            difficulty_level="Beginner",
        )
        self.task2 = LearningTask.objects.create(
            title="Advanced Python",
            description="Advanced Python programming concepts",
            difficulty_level="Advanced",
        )

    def test_course_creation(self):
        """
        Test creating a course with an instructor.
        """
        course = Course.objects.create(
            title="Python Programming Course",
            description="Comprehensive Python programming course",
            instructor=self.user,
        )

        self.assertEqual(course.title, "Python Programming Course")
        self.assertEqual(course.instructor, self.user)
        self.assertIsNotNone(course.created_at)
        self.assertIsNotNone(course.updated_at)

    def test_course_task_management(self):
        """
        Test adding and managing tasks in a course.
        """
        course = Course.objects.create(
            title="Python Programming Course", instructor=self.user
        )

        # Add tasks to the course
        course.tasks.add(self.task1, self.task2)

        # Check task count and retrieval
        self.assertEqual(course.get_total_tasks(), 2)

        # Check task retrieval method
        course_tasks = course.get_learning_tasks()
        self.assertEqual(list(course_tasks), [self.task1, self.task2])

    def test_course_string_representation(self):
        """
        Test the string representation of a course.
        """
        course = Course.objects.create(title="Test Course", instructor=self.user)

        self.assertEqual(str(course), "Test Course")

    def test_course_task_relationship(self):
        """
        Test the many-to-many relationship between courses and tasks.
        """
        course1 = Course.objects.create(title="Beginner Python", instructor=self.user)
        course2 = Course.objects.create(title="Advanced Python", instructor=self.user)

        # Add tasks to different courses
        course1.tasks.add(self.task1)
        course2.tasks.add(self.task2)

        # Verify tasks are associated with correct courses
        self.assertIn(self.task1, course1.tasks.all())
        self.assertNotIn(self.task1, course2.tasks.all())
        self.assertIn(self.task2, course2.tasks.all())
        self.assertNotIn(self.task2, course1.tasks.all())
