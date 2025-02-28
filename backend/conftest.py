import os
import sys
import django
from django.conf import settings

# Ensure the backend directory is in the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings')
django.setup()

def pytest_configure():
    """
    Allows plugins and fixtures to be used with pytest
    """
    # Additional configuration if needed
    print("Django configuration loaded")
    print("Installed Apps:", settings.INSTALLED_APPS)
    print("Database Engine:", settings.DATABASES['default']['ENGINE'])
