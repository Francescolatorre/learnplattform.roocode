"""
Tests to verify unit test settings are working correctly.
"""
import pytest
from django.conf import settings
from django.db import connection

pytestmark = pytest.mark.unit

def test_database_access_disabled():
    """Verify that database access is properly disabled."""
    assert settings.DATABASES['default'] is None

def test_minimal_installed_apps():
    """Verify only minimal apps are installed."""
    expected_apps = {
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'core',
        'assessment',
        'learning',
        'tasks',
        'users',
    }
    assert set(settings.INSTALLED_APPS) == expected_apps

def test_fast_password_hasher():
    """Verify fast password hasher is configured."""
    assert settings.PASSWORD_HASHERS == ['django.contrib.auth.hashers.MD5PasswordHasher']

def test_logging_disabled():
    """Verify logging is disabled."""
    assert settings.LOGGING['disable_existing_loggers'] is True