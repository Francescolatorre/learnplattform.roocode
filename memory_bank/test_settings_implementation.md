# Test Settings Implementation Plan

## Overview
This document provides detailed implementation instructions for setting up isolated test settings for different test types.

## File Structure
Create the following files in `backend/learningplatform/`:

1. `settings_unit_test.py`
2. `settings_integration_test.py`
3. `settings_performance_test.py`
4. `settings_db_test.py`

## File Contents

### settings_unit_test.py
```python
"""
Unit test settings - No database access allowed
"""
from .settings import *

class DisableMigrations:
    def __contains__(self, item):
        return True
    def __getitem__(self, item):
        return None

DATABASES = {
    'default': None  # Prevent any DB access
}

MIGRATION_MODULES = DisableMigrations()

# Minimal installed apps
INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'core',
    'assessment',
    'learning',
    'tasks',
    'users',
]

# Faster password hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
}
```

### settings_integration_test.py
```python
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

# Enable all apps for integration testing
INSTALLED_APPS = [
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
]

# Faster password hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
```

### settings_performance_test.py
```python
"""
Performance test settings - Real database for accurate measurements
"""
from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'test_performance',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Full app setup for realistic performance
INSTALLED_APPS = [
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
]

# Real password hashing for accurate performance
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
]
```

### settings_db_test.py
```python
"""
Database test settings - In-memory database with migrations
"""
from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Enable migrations for DB tests
MIGRATION_MODULES = None

# Full app setup
INSTALLED_APPS = [
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
]

# Faster password hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
```

## Conftest.py Updates

Update `backend/conftest.py` to include:

```python
def pytest_runtest_setup(item):
    """Configure test settings based on markers"""
    markers = [marker.name for marker in item.iter_markers()]
    
    if 'unit' in markers:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'learningplatform.settings_unit_test'
    elif 'integration' in markers:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'learningplatform.settings_integration_test'
    elif 'performance' in markers:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'learningplatform.settings_performance_test'
    elif 'db' in markers:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'learningplatform.settings_db_test'
    else:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'learningplatform.settings_unit_test'  # Default

    django.setup()
```

## Implementation Steps

1. Create all settings files with the provided content
2. Update conftest.py with the marker-based settings selection
3. Test each configuration:
   ```bash
   # Test unit settings
   pytest -v -m unit path/to/test.py
   
   # Test integration settings
   pytest -v -m integration path/to/test.py
   
   # Test DB settings
   pytest -v -m db path/to/test.py
   
   # Test performance settings
   pytest -v -m performance path/to/test.py
   ```

4. Verify database access is properly controlled:
   - Unit tests should fail when trying to access DB
   - Integration/DB tests should work with DB
   - Performance tests should use PostgreSQL

## Next Steps

1. Update existing tests with appropriate markers
2. Create test running scripts
3. Update CI pipeline configuration
4. Document test organization guidelines

## Notes

- The unit test settings intentionally disable database access to enforce proper unit testing practices
- Integration and DB tests use in-memory SQLite for speed
- Performance tests use PostgreSQL for realistic measurements
- Each settings file inherits from base settings but overrides specific settings
- Consider environment variables for database credentials in performance tests