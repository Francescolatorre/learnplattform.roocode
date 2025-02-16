"""
Test settings for the learning platform.
"""
import sys
import tempfile
from .settings import *  # noqa

print("Loading test settings...", file=sys.stderr)

# Test-specific settings
TESTING = True
DEBUG = False

# Use custom user model
AUTH_USER_MODEL = 'users.User'

# Use file-based SQLite for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'test_db.sqlite3',
        'TEST': {
            'NAME': 'test_db.sqlite3',
            'ENGINE': 'django.db.backends.sqlite3',
            'SERIALIZE': True,
            'MIRROR': None,
            'DEPENDENCIES': [],
            'CHARSET': 'utf8',
            'COLLATION': None,
            'CREATE_DB': True,
            'CREATE_USER': False,
            'TEMPLATE': None
        },
    }
}

print(f"Database engine: {DATABASES['default']['ENGINE']}", file=sys.stderr)
print(f"AUTH_USER_MODEL: {AUTH_USER_MODEL}", file=sys.stderr)

# Use console email backend for tests
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Disable password hashers for faster tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Media files configuration for tests
MEDIA_ROOT = tempfile.mkdtemp()

# Cache configuration for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Ensure all required apps are in INSTALLED_APPS with explicit configs
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Core apps with explicit configs
    'core.apps.CoreConfig',
    'users.apps.UsersConfig',
    
    # Domain apps with explicit configs
    'tasks.apps.TasksConfig',
    'learning.apps.LearningConfig',
    'assessment.apps.AssessmentConfig',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
]

# Database configuration for tests
DATABASES['default']['ATOMIC_REQUESTS'] = True

print(f"INSTALLED_APPS: {INSTALLED_APPS}", file=sys.stderr)