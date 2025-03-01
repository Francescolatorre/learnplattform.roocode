import os
import sys

import django
from django.conf import settings

# Add the project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings')
django.setup()
