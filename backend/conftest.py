"""
Root conftest.py for test configuration.
"""
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import Django and initialize
import django
django.setup()

# Set default settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings')
