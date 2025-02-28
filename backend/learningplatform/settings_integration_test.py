"""
Integration test settings - In-memory database with transactions
"""
from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Enable all apps for integration testing with dotted paths
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core.apps.CoreConfig',
    'assessment.apps.AssessmentConfig',
    'learning.apps.LearningConfig',
    'tasks.apps.TasksConfig',
    'users.apps.UsersConfig',
]

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Transaction settings
ATOMIC_REQUESTS = True
DATABASE_SUPPORTS_TRANSACTIONS = True

# Test runner settings
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Disable logging during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
}

# Cache settings - use local memory for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Email settings - use console backend for tests
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# File storage - use temporary directory for tests
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
MEDIA_ROOT = 'test_media'
MEDIA_URL = ''
