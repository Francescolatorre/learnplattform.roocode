import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_create_user():
    """Test creating a new user"""
    user = User.objects.create_user(
        username='testuser', 
        email='test@example.com', 
        password='testpass123',
        display_name='Test User',
        role='user'
    )
    
    assert user.username == 'testuser', "Username not set correctly"
    assert user.email == 'test@example.com', "Email not set correctly"
    assert user.display_name == 'Test User', "Display name not set correctly"
    assert user.role == 'user', "Role not set correctly"
    assert user.is_active is True, "User should be active by default"
    assert user.is_staff is False, "Regular user should not be staff"

@pytest.mark.django_db
def test_create_superuser():
    """Test creating a new superuser"""
    user = User.objects.create_superuser(
        username='admin', 
        email='admin@example.com', 
        password='adminpass123'
    )
    
    assert user.username == 'admin', "Superuser username not set correctly"
    assert user.email == 'admin@example.com', "Superuser email not set correctly"
    assert user.is_active is True, "Superuser should be active"
    assert user.is_staff is True, "Superuser should be staff"
    assert user.is_superuser is True, "Superuser flag not set"

@pytest.mark.django_db
def test_user_str_method():
    """Test the string representation of a user"""
    user = User.objects.create_user(
        username='testuser', 
        email='test@example.com', 
        password='testpass123'
    )
    
    assert str(user) == 'testuser', "User string representation incorrect"
