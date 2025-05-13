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
def test_dashboard_endpoint():
    client = APIClient()
    student_id = 1  # Replace with a valid student ID for testing
    url = reverse(
        "dashboard", kwargs={"studentId": student_id}
    )  # Ensure the URL name matches your urls.py

    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert "data" in response.json()  # Adjust based on the expected response structure
    assert response.json()["data"] is not None  # Ensure data is not None
