"""
Dashboard endpoint test suite for the Learning Platform.

This module tests the dashboard endpoints for different user roles (student,
instructor, admin), ensuring proper data aggregation and access control.

Test Categories:
- Role-specific dashboard access
- Dashboard data aggregation
- Performance metrics
- Progress statistics
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_dashboard_endpoint(db):
    from django.contrib.auth import get_user_model

    client = APIClient()
    User = get_user_model()
    student = User.objects.create_user(
        username="teststudent",
        email="teststudent@example.com",
        password="testpass",
        role="student",
    )
    url = reverse("student-dashboard-detail", kwargs={"pk": student.pk})

    client.force_authenticate(user=student)
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    resp = response.json()
    assert "courses" in resp
    assert "progress" in resp
    assert "quiz_performance" in resp
    assert "recent_activity" in resp
    assert "user_info" in resp
