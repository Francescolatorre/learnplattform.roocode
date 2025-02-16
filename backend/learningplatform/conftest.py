"""
Pytest configuration for Django tests.
"""
import pytest
from django.conf import settings

def pytest_configure():
    """Configure Django for tests."""
    settings.DEBUG = False
    settings.TESTING = True
    
    # Use in-memory SQLite for tests
    settings.DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    
    # Use MD5 hasher for faster password hashing in tests
    settings.PASSWORD_HASHERS = [
        'django.contrib.auth.hashers.MD5PasswordHasher',
    ]

@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """
    Enable database access for all tests.
    This avoids having to mark each test with @pytest.mark.django_db.
    """
    pass