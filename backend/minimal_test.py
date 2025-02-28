import os
import sys
import django

def setup_django():
    """
    Manually set up Django environment for testing
    """
    # Ensure the backend directory is in the Python path
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, backend_dir)

    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningplatform.settings')
    
    try:
        django.setup()
        print("Django setup successful")
    except Exception as e:
        print(f"Django setup failed: {e}")
        return False
    
    return True

def run_minimal_test():
    """
    Minimal test to verify basic Django and model functionality
    """
    if not setup_django():
        return
    
    try:
        # Import models to verify they can be imported
        from django.contrib.auth import get_user_model
        from courses.models import Course
        from tasks.models import LearningTask, TaskStatus, TaskDifficulty
        
        print("Model imports successful")
        
        # Attempt to create a test user
        User = get_user_model()
        try:
            user = User.objects.create_user(
                username='testuser', 
                email='test@example.com', 
                password='testpass123'
            )
            print("Test user created successfully")
        except Exception as e:
            print(f"User creation failed: {e}")
        
    except ImportError as e:
        print(f"Import error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == '__main__':
    run_minimal_test()
