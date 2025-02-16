"""
Pytest configuration and fixtures for the test suite.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.core.management import call_command
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import connection

User = get_user_model()

def pytest_configure(config):
    """Configure pytest for Django."""
    try:
        from django.conf import settings
        # Disable debugging for tests
        settings.DEBUG = False
        # Use in-memory email backend for tests
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
        # Configure test database
        settings.DATABASES['default']['TEST'] = {
            'NAME': ':memory:',
            'ENGINE': 'django.db.backends.sqlite3',
            'SERIALIZE': False,
            'MIRROR': None,
            'DEPENDENCIES': [],
        }
    except ImportError:
        pass

@pytest.fixture(scope='session')
def django_db_setup(django_db_blocker):
    """Configure test database and run migrations."""
    with django_db_blocker.unblock():
        # Run migrations
        call_command('migrate')
        yield

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
def test_user(db):
    """Create and return a test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def authenticated_client(api_client, user_factory):
    """Return an authenticated API client."""
    user = user_factory()
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client, user

@pytest.fixture
def admin_user(db):
    """Create and return a superuser."""
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123',
        is_staff=True,
        is_superuser=True
    )

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