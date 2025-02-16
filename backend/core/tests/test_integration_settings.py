"""
Tests to verify integration test settings are working correctly.
"""
import os
import pytest
from django.db import connection, transaction
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TransactionTestCase

pytestmark = [pytest.mark.integration, pytest.mark.django_db(transaction=True)]

def test_database_in_memory():
    """Verify that in-memory SQLite database is configured."""
    assert settings.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3'
    assert settings.DATABASES['default']['NAME'] == ':memory:'
    assert os.environ.get('DJANGO_SETTINGS_MODULE') == 'learningplatform.settings_integration_test'

def test_transaction_support():
    """Verify that database transactions work properly."""
    User = get_user_model()
    
    # Start a transaction
    with transaction.atomic():
        user = User.objects.create_user(
            username='test_user',
            email='test@example.com',
            password='testpass123'
        )
        assert User.objects.filter(username='test_user').exists()
        
        # Rollback the transaction
        transaction.set_rollback(True)
    
    # User should not exist after rollback
    assert not User.objects.filter(username='test_user').exists()

def test_installed_apps():
    """Verify that all required apps are installed."""
    required_apps = {
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'core',
        'assessment',
        'learning',
        'tasks',
        'users',
    }
    assert all(app in settings.INSTALLED_APPS for app in required_apps)

def test_password_hasher():
    """Verify that fast password hasher is configured."""
    assert settings.PASSWORD_HASHERS == ['django.contrib.auth.hashers.MD5PasswordHasher']

def test_atomic_requests():
    """Verify that atomic requests are enabled."""
    assert settings.ATOMIC_REQUESTS is True
    assert settings.DATABASE_SUPPORTS_TRANSACTIONS is True

class TestTransactionIsolation(TransactionTestCase):
    """Test transaction isolation between tests."""
    
    def setUp(self):
        self.User = get_user_model()
    
    def test_first_transaction(self):
        """Create a user in first transaction."""
        user = self.User.objects.create_user(
            username='isolation_test',
            email='isolation@example.com',
            password='testpass123'
        )
        assert self.User.objects.filter(username='isolation_test').exists()
    
    def test_second_transaction(self):
        """Verify user doesn't exist in second transaction."""
        assert not self.User.objects.filter(username='isolation_test').exists()

def test_cache_backend():
    """Verify that local memory cache is configured."""
    assert settings.CACHES['default']['BACKEND'] == 'django.core.cache.backends.locmem.LocMemCache'
    
    # Test cache operations
    cache.set('test_key', 'test_value')
    assert cache.get('test_key') == 'test_value'

def test_email_backend():
    """Verify that console email backend is configured."""
    assert settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend'

def test_file_storage():
    """Verify that file system storage is configured for tests."""
    assert settings.DEFAULT_FILE_STORAGE == 'django.core.files.storage.FileSystemStorage'
    assert settings.MEDIA_ROOT == 'test_media'
    assert settings.MEDIA_URL == ''