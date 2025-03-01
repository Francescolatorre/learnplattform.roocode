"""
Tests for transactional behavior in repositories.
"""
import pytest
from django.db import transaction

from core.repositories.task_repository import TaskRepository
from tasks.models import LearningTask


@pytest.mark.django_db
def test_repository_transaction_isolation(django_user_model):
    """
    Demonstrate transaction isolation in repository operations.
    
    This test showcases:
    1. Creating tasks within a transaction
    2. Verifying that changes are rolled back automatically
    3. Ensuring no persistent database modifications
    """
    # Create a test user
    test_user = django_user_model.objects.create_user(
        username='transactional_test_user', 
        password='testpass123'
    )
    
    # Initialize repository
    task_repository = TaskRepository()
    
    # Start a transaction block
    with transaction.atomic():
        # Create multiple tasks
        task1 = task_repository.create_learning_task(
            title='Transactional Test Task 1',
            description='This task should be rolled back',
            difficulty_level='Easy'
        )
        task2 = task_repository.create_learning_task(
            title='Transactional Test Task 2',
            description='Another task to be rolled back',
            difficulty_level='Medium'
        )
        
        # Verify tasks were created within the transaction
        assert LearningTask.objects.filter(title__startswith='Transactional Test Task').count() == 2
        
        # Simulate a condition that would trigger a rollback
        raise Exception("Simulating transaction rollback")
    
    # After the transaction block, verify no tasks persist
    assert LearningTask.objects.filter(title__startswith='Transactional Test Task').count() == 0

@pytest.mark.django_db
def test_repository_concurrent_transaction_safety(django_user_model):
    """
    Demonstrate transaction isolation between concurrent operations.
    
    This test showcases:
    1. Creating tasks in separate transactions
    2. Ensuring no interference between transactions
    """
    # Create a test user
    test_user = django_user_model.objects.create_user(
        username='concurrent_test_user', 
        password='testpass123'
    )
    
    # Initialize repository
    task_repository = TaskRepository()
    
    # First transaction
    with transaction.atomic():
        task1 = task_repository.create_learning_task(
            title='Concurrent Test Task 1',
            description='First transaction task',
            difficulty_level='Easy'
        )
        assert LearningTask.objects.filter(title__startswith='Concurrent Test Task').count() == 1
    
    # Second transaction
    with transaction.atomic():
        task2 = task_repository.create_learning_task(
            title='Concurrent Test Task 2',
            description='Second transaction task',
            difficulty_level='Medium'
        )
        assert LearningTask.objects.filter(title__startswith='Concurrent Test Task').count() == 2
    
    # Verify final state
    assert LearningTask.objects.filter(title__startswith='Concurrent Test Task').count() == 2
