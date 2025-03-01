"""
Tests to verify the test infrastructure is working correctly.
"""
import pytest
from django.urls import reverse
from rest_framework import status

from users.models import User  # Direct import from users app

from .factories import AdminFactory, UserFactory
from .utils import APITestMixin, ModelTestMixin

pytestmark = pytest.mark.django_db

class TestUserFactory:
    """Test the UserFactory."""

    def test_create_user(self):
        """Test creating a regular user."""
        # Verify User model is properly configured
        assert User._meta.app_label == 'users'
        assert User._meta.model_name == 'user'
        
        user = UserFactory()
        assert isinstance(user, User)
        assert user.username.startswith('user')
        assert user.email.endswith('@example.com')
        assert user.display_name.startswith('Display user')
        assert user.role == 'user'
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser
        assert user.check_password('testpass123')

    def test_create_admin(self):
        """Test creating an admin user."""
        admin = AdminFactory()
        assert isinstance(admin, User)
        assert admin.username.startswith('admin')
        assert admin.email.endswith('@example.com')
        assert admin.display_name.startswith('Admin admin')
        assert admin.role == 'admin'
        assert admin.is_active
        assert admin.is_staff
        assert admin.is_superuser
        assert admin.check_password('testpass123')

class TestAPITestMixin(APITestMixin):
    """Test the APITestMixin."""

    def test_get_api_url(self):
        """Test the get_api_url method."""
        url = self.get_api_url('admin:index')
        assert url == reverse('admin:index')

    def test_assert_response_data(self):
        """Test the assert_response_data method."""
        response_data = {
            'id': 1,
            'username': 'testuser',
            'email': 'test@example.com',
            'display_name': 'Test User',
            'role': 'user',
            'extra': 'value'
        }
        expected_data = {
            'id': 1,
            'username': 'testuser',
            'email': 'test@example.com',
            'display_name': 'Test User',
            'role': 'user'
        }
        # Should not raise assertion error
        self.assert_response_data(
            response_data,
            expected_data,
            exclude_fields=['extra']
        )

class TestModelTestMixin(ModelTestMixin):
    """Test the ModelTestMixin."""

    def test_assert_model_fields(self):
        """Test the assert_model_fields method."""
        # Should not raise assertion error
        self.assert_model_fields(
            User,
            ['username', 'email', 'password', 'display_name', 'role']
        )

    def test_assert_model_relations(self):
        """Test the assert_model_relations method."""
        # Should not raise assertion error
        self.assert_model_relations(
            User,
            {
                'groups': {
                    'many_to_many': True,
                },
                'user_permissions': {
                    'many_to_many': True,
                }
            }
        )