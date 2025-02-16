"""
Test settings for the learning platform.
"""
import sys
print("Loading test settings...", file=sys.stderr)

from .settings import *  # noqa

# Test-specific settings
TESTING = True
DEBUG = False

# Use custom user model
AUTH_USER_MODEL = 'users.User'

# Use in-memory SQLite for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
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

# Disable migrations for tests
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Media files configuration for tests
import tempfile
MEDIA_ROOT = tempfile.mkdtemp()

# Cache configuration for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Ensure users app is in INSTALLED_APPS
if 'users' not in INSTALLED_APPS:
    INSTALLED_APPS = list(INSTALLED_APPS)
    INSTALLED_APPS.append('users')
    INSTALLED_APPS = tuple(INSTALLED_APPS)

print(f"INSTALLED_APPS: {INSTALLED_APPS}", file=sys.stderr)