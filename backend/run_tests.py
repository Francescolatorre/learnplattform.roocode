import os
import sys
import pytest
from django.conf import settings

def print_path():
    print("Current PYTHONPATH:")
    for path in sys.path:
        print(f"  {path}")
    print()

print("Current directory:", os.getcwd())
print_path()

# Change working directory to project root
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
print("Changed current directory:", os.getcwd())


# Set default settings module if not already set
if not settings.configured:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings_integration_test')
    settings.configure()

# Run pytest with importlib mode
pytest.main(["-v", "--import-mode=importlib"])
