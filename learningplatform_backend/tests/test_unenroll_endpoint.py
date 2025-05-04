import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from core.models import User, Course, CourseEnrollment


class TestUnenrollEndpoint(APITestCase):
    """
    Test cases for the course unenroll endpoint.

    Tests vertical integration between the backend API and database models,
    ensuring proper status updates when a user unenrolls from a course.
    """

    @pytest.mark.django_db
    def setUp(self):
        """Set up test data for unenrollment tests"""
        # Create test users with different roles
        self.student_user = User.objects.create_user(
            username="teststudent",
            email="student@test.com",
            password="securepassword123",
            role="student",
        )
        self.instructor_user = User.objects.create_user(
            username="testinstructor",
            email="instructor@test.com",
            password="securepassword123",
            role="instructor",
        )

        # Create a test course
        self.test_course = Course.objects.create(
            title="Test Course for Unenrollment",
            creator=self.instructor_user,
            description="A test course to verify unenrollment functionality",
            status="published",
            visibility="public",
        )

        # Create an active enrollment for the student
        self.enrollment = CourseEnrollment.objects.create(
            user=self.student_user, course=self.test_course, status="active"
        )

        # Set up API client
        self.client = APIClient()

    @pytest.mark.django_db
    def test_unenroll_authenticated_user(self):
        """Test that authenticated enrolled users can unenroll from a course"""
        # Authenticate as student
        self.client.force_authenticate(user=self.student_user)

        # Get the endpoint URL
        url = reverse("course-unenroll", args=[self.test_course.id])

        # Send unenroll request
        response = self.client.post(url, {})

        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["status"], "unenrolled")

        # Verify enrollment status in database
        updated_enrollment = CourseEnrollment.objects.get(
            user=self.student_user, course=self.test_course
        )
        self.assertEqual(updated_enrollment.status, "dropped")

    @pytest.mark.django_db
    def test_unenroll_unauthenticated_user(self):
        """Test that unauthenticated users cannot unenroll"""
        # Use client without authentication
        self.client.force_authenticate(user=None)

        # Get the endpoint URL
        url = reverse("course-unenroll", args=[self.test_course.id])

        # Send unenroll request
        response = self.client.post(url, {})

        # Check response - should be unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Verify enrollment status unchanged in database
        unchanged_enrollment = CourseEnrollment.objects.get(
            user=self.student_user, course=self.test_course
        )
        self.assertEqual(unchanged_enrollment.status, "active")

    @pytest.mark.django_db
    def test_unenroll_wrong_user(self):
        """Test that users cannot unenroll from courses they're not enrolled in"""
        # Create another student
        other_student = User.objects.create_user(
            username="otherstudent",
            email="other@test.com",
            password="securepassword123",
            role="student",
        )

        # Authenticate as the other student (who isn't enrolled)
        self.client.force_authenticate(user=other_student)

        # Get the endpoint URL
        url = reverse("course-unenroll", args=[self.test_course.id])

        # Send unenroll request
        response = self.client.post(url, {})

        # Check response - should be bad request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["success"], False)

        # Verify original student's enrollment status unchanged
        unchanged_enrollment = CourseEnrollment.objects.get(
            user=self.student_user, course=self.test_course
        )
        self.assertEqual(unchanged_enrollment.status, "active")

    @pytest.mark.django_db
    def test_unenroll_dropped_course(self):
        """Test attempting to unenroll from an already dropped course"""
        # First drop the course
        self.enrollment.status = "dropped"
        self.enrollment.save()

        # Authenticate as student
        self.client.force_authenticate(user=self.student_user)

        # Get the endpoint URL
        url = reverse("course-unenroll", args=[self.test_course.id])

        # Send unenroll request again
        response = self.client.post(url, {})

        # Check response - should still succeed
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)

        # Verify enrollment status remains dropped
        enrollment = CourseEnrollment.objects.get(
            user=self.student_user, course=self.test_course
        )
        self.assertEqual(enrollment.status, "dropped")

    @pytest.mark.django_db
    def test_unenroll_nonexistent_course(self):
        """Test attempting to unenroll from a course that doesn't exist"""
        # Authenticate as student
        self.client.force_authenticate(user=self.student_user)

        # Use a non-existent course ID
        nonexistent_course_id = 9999

        # Get the endpoint URL
        url = reverse("course-unenroll", args=[nonexistent_course_id])

        # Send unenroll request
        response = self.client.post(url, {})

        # Check response - should be not found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
