# tests/conftest.py
import sys
from django.apps import apps

def pytest_configure(config):
    """Print import paths and app configurations at startup."""
    print("PYTHONPATH:", sys.path)
    print("Loaded Apps:", [app.name for app in apps.get_app_configs()])