from core.models import Course, LearningTask
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class TasksByCoursePaginatedTest(TestCase):
    def setUp(self):
        """Set up test database"""
        User = get_user_model()

        # Create test users
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpass"
        )
        self.instructor = User.objects.create_user(
            username="instructor",
            email="instructor@example.com",
            password="instructpass",
            role="instructor",
        )
        self.student = User.objects.create_user(
            username="student",
            email="student@example.com",
            password="studentpass",
            role="student",
        )

        # Create API client
        self.client = APIClient()


class CourseCreationTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.instructor = User.objects.create_user(
            username="instructor2",
            email="instructor2@example.com",
            password="instructpass2",
            role="instructor",
        )
        self.student = User.objects.create_user(
            username="student2",
            email="student2@example.com",
            password="studentpass2",
            role="student",
        )
        self.admin = User.objects.create_superuser(
            username="admin2", email="admin2@example.com", password="adminpass2"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.instructor)

    def test_course_creation_sets_creator(self):
        payload = {
            "title": "Backend Test Course",
            "description": "A course created by test.",
            "version": 1,
            "status": "published",
            "visibility": "public",
            "learning_objectives": "",
            "prerequisites": "",
        }
        response = self.client.post("/api/v1/courses/", payload, format="json")
        self.assertEqual(response.status_code, 201, response.content)
        course = Course.objects.get(title="Backend Test Course")
        self.assertEqual(course.creator, self.instructor)

    def test_tasks_by_course_visibility(self):
        """Test that task visibility is correctly filtered based on user role:
        - Students can only see published tasks
        - Instructors can see all tasks in their courses
        - Admins can see all tasks
        """
        # Create a test course and tasks
        course = Course.objects.create(title="Test Course", creator=self.instructor)
        published_task = LearningTask.objects.create(
            course=course,
            title="Published Task",
            description="This is a published task.",
            is_published=True,
        )
        unpublished_task = LearningTask.objects.create(
            course=course,
            title="Unpublished Task",
            description="This is an unpublished task.",
            is_published=False,
        )

        # Test as student
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f"/api/v1/learning-tasks/course/{course.id}/")
        self.assertEqual(response.status_code, 200)
        tasks = response.json()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], published_task.id)

        # Test as instructor
        self.client.force_authenticate(user=self.instructor)
        response = self.client.get(f"/api/v1/learning-tasks/course/{course.id}/")
        self.assertEqual(response.status_code, 200)
        tasks = response.json()
        self.assertEqual(len(tasks), 2)
        task_ids = {task["id"] for task in tasks}
        self.assertIn(published_task.id, task_ids)
        self.assertIn(unpublished_task.id, task_ids)

        # Test as admin
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/v1/learning-tasks/course/{course.id}/")
        self.assertEqual(response.status_code, 200)
        tasks = response.json()
        self.assertEqual(len(tasks), 2)
        task_ids = {task["id"] for task in tasks}
        self.assertIn(published_task.id, task_ids)
        self.assertIn(unpublished_task.id, task_ids)
