"""
Test suite for the User model.

This module contains comprehensive tests for the User model functionality,
covering authentication, role-based permissions, and helper methods.
"""

import pytest
from typing import Any
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.test import APIClient
from core.models import Course, CourseEnrollment

User = get_user_model()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def test_user() -> Any:
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
        role="student",
    )


@pytest.fixture
def test_instructor() -> Any:
    return User.objects.create_user(
        username="instructor",
        email="instructor@example.com",
        password="instructor123",
        role="instructor",
    )


@pytest.fixture
def test_admin() -> Any:
    return User.objects.create_superuser(
        username="admin", email="admin@example.com", password="admin123"
    )


@pytest.mark.django_db
class TestUserModel:
    """Test cases for User model"""

    def test_create_user(self) -> None:
        """Test creating a regular user"""
        user = User.objects.create_user(
            username="newuser",
            email="newuser@example.com",
            password="newpass123",
            role="student",
        )
        assert user.username == "newuser"
        assert user.email == "newuser@example.com"
        assert user.role == "student"  # type: ignore
        assert not user.is_staff
        assert not user.is_superuser

    def test_create_superuser(self) -> None:
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            username="superadmin", email="admin@example.com", password="admin123"
        )
        assert admin.is_staff
        assert admin.is_superuser
        assert admin.role == "admin"  # type: ignore

    def test_user_str_method(self) -> None:
        """Test the string representation of User model"""
        user = User.objects.create_user(
            username="testuser", email="test@example.com", password="test123"
        )
        assert str(user) == "testuser"

    def test_email_unique(self) -> None:
        """Test that email addresses must be unique"""
        User.objects.create_user(
            username="user1", email="duplicate@example.com", password="pass123"
        )
        with pytest.raises(IntegrityError):
            User.objects.create_user(
                username="user2", email="duplicate@example.com", password="pass123"
            )

    def test_instructor_or_admin_check(
        self, test_user: Any, test_instructor: Any, test_admin: Any
    ) -> None:
        """Test is_instructor_or_admin method"""
        assert not test_user.is_instructor_or_admin()
        assert test_instructor.is_instructor_or_admin()
        assert test_admin.is_instructor_or_admin()

    def test_get_enrolled_courses(self, test_user: Any, test_instructor: Any) -> None:
        """Test retrieving enrolled courses"""
        # Create test courses and enrollments
        course1 = Course.objects.create(
            title="Test Course 1",
            description="Test Description 1",
            creator=test_instructor,
        )
        course2 = Course.objects.create(
            title="Test Course 2",
            description="Test Description 2",
            creator=test_instructor,
        )

        CourseEnrollment.objects.create(user=test_user, course=course1, status="active")
        CourseEnrollment.objects.create(
            user=test_user,
            course=course2,
            status="dropped",  # This one shouldn't show up in active enrollments
        )

        enrolled_courses = test_user.get_enrolled_courses()
        assert enrolled_courses.count() == 1
        assert enrolled_courses.first().course.title == "Test Course 1"

    def test_get_managed_courses(self, test_instructor: Any) -> None:
        """Test retrieving managed courses for instructor"""
        Course.objects.create(
            title="Managed Course 1",
            description="Test Description 1",
            creator=test_instructor,
        )
        Course.objects.create(
            title="Managed Course 2",
            description="Test Description 2",
            creator=test_instructor,
        )

        managed_courses = test_instructor.get_managed_courses()
        assert managed_courses.count() == 2
        assert set(managed_courses.values_list("title", flat=True)) == {
            "Managed Course 1",
            "Managed Course 2",
        }
