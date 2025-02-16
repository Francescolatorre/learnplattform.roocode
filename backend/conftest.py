"""
Pytest configuration and fixtures for the test suite.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def pytest_configure(config):
    """Configure pytest for Django."""
    try:
        from django.conf import settings
        # Disable debugging for tests
        settings.DEBUG = False
        # Use in-memory email backend for tests
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
    except ImportError:
        pass

@pytest.fixture
def api_client():
    """Return an authenticated API client."""
    return APIClient()

@pytest.fixture
def user_factory(db):
    """Create a user factory."""
    def create_user(**kwargs):
        defaults = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)
    return create_user

@pytest.fixture
def authenticated_client(api_client, user_factory):
    """Return an authenticated API client."""
    user = user_factory()
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client, user

@pytest.fixture
def admin_user(db, user_factory):
    """Create and return a superuser."""
    admin = user_factory(
        username='admin',
        email='admin@example.com',
        is_staff=True,
        is_superuser=True
    )
    return admin

@pytest.fixture
def admin_client(api_client, admin_user):
    """Return an API client authenticated as admin."""
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client, admin_user

class TestUtils:
    """Utility functions for tests."""
    
    @staticmethod
    def create_test_data(model_class, count=1, **kwargs):
        """Create test instances of a model."""
        instances = []
        for _ in range(count):
            instance = model_class.objects.create(**kwargs)
            instances.append(instance)
        return instances[0] if count == 1 else instances
    
    @staticmethod
    def assert_object_matches_data(obj, data, exclude=None):
        """Assert that an object's fields match the provided data."""
        exclude = exclude or []
        for key, value in data.items():
            if key not in exclude:
                assert getattr(obj, key) == value, f"{key} does not match"

@pytest.fixture
def test_utils():
    """Return test utility functions."""
    return TestUtils