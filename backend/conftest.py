"""
Root conftest.py for test configuration.
"""
import os
import sys
from pathlib import Path

# Import Django and initialize EARLY
import django
from django.conf import settings

# Explicitly define INSTALLED_APPS in conftest.py
if not settings.configured:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings_integration_test')
    settings.configure(
        INSTALLED_APPS=[
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
    )
django.setup()


# Add project root directory to Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Add backend directory to Python path explicitly
BACKEND_DIR = PROJECT_ROOT / 'backend'
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
