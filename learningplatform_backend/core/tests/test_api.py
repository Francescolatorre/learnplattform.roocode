from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from core.models import Course, CourseEnrollment

User = get_user_model()


class APITests(APITestCase):
    def setUp(self):
        # Create test users
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="adminpass",
            role="admin",
        )
        self.instructor_user = User.objects.create_user(
            username="instructor",
            email="instructor@example.com",
            password="instructorpass",
            role="instructor",
        )
        self.student_user = User.objects.create_user(
            username="student",
            email="student@example.com",
            password="studentpass",
            role="student",
        )

        # Create a test course
        self.course = Course.objects.create(
            title="Test Course", description="A test course."
        )

        # Enroll the student in the course
        self.enrollment = CourseEnrollment.objects.create(
            user=self.student_user, course=self.course, status="active"
        )

        # Set up API client
        self.client = APIClient()

    def test_health_check(self):
        # Test the health check endpoint
        response = self.client.get("/api/v1/health-check/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "healthy")

    def test_student_access_own_progress(self):
        # Authenticate as the student
        self.client.force_authenticate(user=self.student_user)

        # Test the student progress endpoint
        response = self.client.get(
            f"/api/v1/courses/{self.course.id}/student-progress/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("progress_summary", response.data)

    def test_instructor_access_course_progress(self):
        # Authenticate as the instructor
        self.client.force_authenticate(user=self.instructor_user)

        # Test the course progress endpoint
        response = self.client.get(
            f"/api/v1/courses/{self.course.id}/student-progress/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_unauthenticated_access(self):
        # Test access without authentication
        response = self.client.get(
            f"/api/v1/courses/{self.course.id}/student-progress/"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_access_all_courses(self):
        # Authenticate as the admin
        self.client.force_authenticate(user=self.admin_user)

        # Test the course list endpoint
        response = self.client.get("/api/v1/courses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
