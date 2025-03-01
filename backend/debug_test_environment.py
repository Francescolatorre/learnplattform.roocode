import os
import sys

import django
from django.conf import settings


def print_debug_info():
    print("Python Version:", sys.version)
    print("Current Working Directory:", os.getcwd())
    print("Python Path:", sys.path)
    
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings')
    django.setup()
    
    # Print Django-specific information
    print("\nDjango Debug Information:")
    print("Installed Apps:", settings.INSTALLED_APPS)
    print("Database Engine:", settings.DATABASES['default']['ENGINE'])
    print("Database Name:", settings.DATABASES['default']['NAME'])
    
    # Check model imports
    try:
        from django.contrib.auth import get_user_model

        from courses.models import Course
        from tasks.models import LearningTask, TaskDifficulty, TaskStatus
        
        print("\nModel Import Check:")
        print("User Model:", get_user_model())
        print("Course Model:", Course)
        print("LearningTask Model:", LearningTask)
        print("TaskStatus:", TaskStatus)
        print("TaskDifficulty:", TaskDifficulty)
    except Exception as e:
        print("\nError importing models:", e)

if __name__ == '__main__':
    print_debug_info()
