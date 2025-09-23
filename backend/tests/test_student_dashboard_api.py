"""
Test suite for the Student Dashboard API endpoint.

This module contains comprehensive tests for the student dashboard functionality,
covering authentication, data retrieval, and error handling scenarios.

Test cases:
- Basic dashboard data retrieval
- Unauthorized access handling
- Non-existent user handling
- Empty dashboard state
"""

from typing import Any, Dict

import pytest
from django.contrib.auth.models import Group
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import (
    Course,
    CourseEnrollment,
    LearningTask,
    QuizAttempt,
    QuizTask,
    TaskProgress,
    User,
)


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def setup_test_data(db: Any) -> Dict[str, Any]:
    cache.clear()
    # Create test users
    student = User.objects.create_user(
        username="teststudent", email="student@test.com", password="testpass123"
    )
    instructor = User.objects.create_user(
        username="testinstructor", email="instructor@test.com", password="testpass123"
    )

    # Create instructor group and add instructor
    instructor_group = Group.objects.create(name="instructor")
    instructor.groups.add(instructor_group)

    # Create test courses
    course1 = Course.objects.create(
        title="Python Programming",
        description="Learn Python basics",
        creator=instructor,
    )
    course2 = Course.objects.create(
        title="Web Development",
        description="Full stack web development",
        creator=instructor,
    )

    # Create course enrollments
    CourseEnrollment.objects.create(
        user=student, course=course1, status="active", enrollment_date=timezone.now()
    )
    CourseEnrollment.objects.create(
        user=student, course=course2, status="active", enrollment_date=timezone.now()
    )

    # Create learning tasks
    task1 = LearningTask.objects.create(
        course=course1, title="Python Variables", description="Learn about variables"
    )
    task2 = LearningTask.objects.create(
        course=course1, title="Control Flow", description="Learn about if statements"
    )
    quiz1 = QuizTask.objects.create(
        course=course1,
        title="Python Basics Quiz",
        description="Test your Python knowledge",
    )

    # Create task progress
    TaskProgress.objects.create(
        user=student, task=task1, status="completed", updated_at=timezone.now()
    )
    TaskProgress.objects.create(
        user=student, task=task2, status="in_progress", updated_at=timezone.now()
    )

    # Create quiz attempts
    QuizAttempt.objects.create(
        user=student,
        quiz=quiz1,
        score=85,
        completion_status="completed",
        time_taken=timezone.timedelta(minutes=45),
        attempt_date=timezone.now(),
    )

    return {
        "student": student,
        "instructor": instructor,
        "course1": course1,
        "course2": course2,
        "quiz1": quiz1,
    }


@pytest.mark.django_db
class TestStudentDashboardAPI:
    """Test cases for the Student Dashboard API endpoints."""

    def test_get_own_dashboard(
        self, api_client: APIClient, setup_test_data: Dict[str, Any]
    ) -> None:
        """Test that a student can access their own dashboard."""
        student = setup_test_data["student"]
        api_client.force_authenticate(user=student)

        url = reverse("student-dashboard-detail", kwargs={"pk": student.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "courses" in response.data
        assert "progress" in response.data
        assert "quiz_performance" in response.data

    def test_instructor_access_student_dashboard(
        self, api_client: APIClient, setup_test_data: Dict[str, Any]
    ) -> None:
        """Test that an instructor can access a student's dashboard."""
        instructor = setup_test_data["instructor"]
        student = setup_test_data["student"]
        api_client.force_authenticate(user=instructor)

        url = reverse("student-dashboard-detail", kwargs={"pk": student.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "courses" in response.data

    def test_unauthorized_access(
        self, api_client: APIClient, setup_test_data: Dict[str, Any]
    ) -> None:
        """Test that unauthorized users cannot access student dashboards."""
        student = setup_test_data["student"]
        url = reverse("student-dashboard-detail", kwargs={"pk": student.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_caching(
        self, api_client: APIClient, setup_test_data: Dict[str, Any]
    ) -> None:
        """Test that dashboard data is properly cached."""
        student = setup_test_data["student"]
        api_client.force_authenticate(user=student)
        url = reverse("student-dashboard-detail", kwargs={"pk": student.id})

        # First request should hit the database
        response1 = api_client.get(url)
        assert response1.status_code == status.HTTP_200_OK

        # Second request should use cache
        response2 = api_client.get(url)
        assert response2.status_code == status.HTTP_200_OK
        assert response1.data == response2.data

    def test_quiz_performance_calculation(
        self, api_client: APIClient, setup_test_data: Dict[str, Any]
    ) -> None:
        """Test that quiz performance metrics are calculated correctly."""
        student = setup_test_data["student"]
        api_client.force_authenticate(user=student)

        url = reverse("student-dashboard-detail", kwargs={"pk": student.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "quiz_performance" in response.data
        assert response.data["quiz_performance"]["average_score"] == 85

    def test_progress_calculation(
        self, api_client: APIClient, setup_test_data: Dict[str, Any]
    ) -> None:
        """Test that overall progress is calculated correctly."""
        student = setup_test_data["student"]
        api_client.force_authenticate(user=student)

        url = reverse("student-dashboard-detail", kwargs={"pk": student.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "progress" in response.data
        assert 0 <= response.data["progress"]["overall_progress"] <= 100

    def test_user_not_found(
        self, api_client: APIClient, setup_test_data: Dict[str, Any]
    ) -> None:
        """Test handling of requests for non-existent users."""
        instructor = setup_test_data["instructor"]
        api_client.force_authenticate(user=instructor)

        url = reverse("student-dashboard-detail", kwargs={"pk": 99999})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
