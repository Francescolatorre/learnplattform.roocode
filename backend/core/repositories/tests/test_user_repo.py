"""
Tests for the UserRepository implementation.
"""
import pytest
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model

from core.tests.factories import UserFactory, AdminFactory
from core.repositories.user_repository import UserRepository

User = get_user_model()
pytestmark = pytest.mark.django_db

class TestUserRepository:
    """
    Database tests for UserRepository.
    """
    
    @pytest.fixture
    def repository(self):
        """
        Creates a UserRepository instance.
        """
        return UserRepository()

    def test_get_users_empty(self, repository):
        """
        Test getting users when none exist.
        """
        # Act
        users = repository.get_users()
        
        # Assert
        assert len(users) == 0

    def test_get_users_with_data(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting users with existing data.
        """
        # Arrange
        users = [UserFactory() for _ in range(3)]
        
        # Act
        result = repository.get_users()
        
        # Assert
        assert len(result) == 3
        assert set(u.id for u in result) == set(u.id for u in users)

    def test_get_user_by_id(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting a specific user by ID.
        """
        # Arrange
        user = UserFactory(username="testuser")
        
        # Act
        result = repository.get_user_by_id(user.id)
        
        # Assert
        assert result.id == user.id
        assert result.username == "testuser"

    def test_get_user_by_id_not_found(self, repository):
        """
        Test getting a user that doesn't exist.
        """
        # Act/Assert
        with pytest.raises(ObjectDoesNotExist):
            repository.get_user_by_id(999)

    def test_create_user(
        self,
        repository,
        test_transaction
    ):
        """
        Test creating a new user.
        """
        # Arrange
        user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'display_name': 'New User',
            'role': 'user'
        }
        
        # Act
        with transaction.atomic():
            user = repository.create_user(**user_data)
        
        # Assert
        assert user.id is not None
        assert user.username == user_data['username']
        assert user.display_name == user_data['display_name']
        assert user.role == 'user'

    def test_create_admin_user(
        self,
        repository,
        test_transaction
    ):
        """
        Test creating a new admin user.
        """
        # Arrange
        admin_data = {
            'username': 'newadmin',
            'email': 'admin@example.com',
            'display_name': 'Admin User',
            'role': 'admin'
        }
        
        # Act
        with transaction.atomic():
            admin = repository.create_user(**admin_data)
        
        # Assert
        assert admin.id is not None
        assert admin.role == 'admin'

    def test_update_user(
        self,
        repository,
        test_transaction
    ):
        """
        Test updating a user.
        """
        # Arrange
        user = UserFactory()
        updates = {
            'display_name': 'Updated Name',
            'email': 'updated@example.com'
        }
        
        # Act
        with transaction.atomic():
            updated_user = repository.update_user(user.id, **updates)
        
        # Assert
        assert updated_user.display_name == updates['display_name']
        assert updated_user.email == updates['email']

    def test_delete_user(
        self,
        repository,
        test_transaction
    ):
        """
        Test deleting a user.
        """
        # Arrange
        user = UserFactory()
        
        # Act
        with transaction.atomic():
            repository.delete_user(user.id)
        
        # Assert
        with pytest.raises(ObjectDoesNotExist):
            User.objects.get(id=user.id)

    def test_get_users_by_role(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting users by role.
        """
        # Arrange
        admin_users = [AdminFactory() for _ in range(2)]
        regular_users = [UserFactory() for _ in range(3)]
        
        # Act
        admin_result = repository.get_users_by_role('admin')
        user_result = repository.get_users_by_role('user')
        
        # Assert
        assert len(admin_result) == 2
        assert len(user_result) == 3
        assert all(u.role == 'admin' for u in admin_result)
        assert all(u.role == 'user' for u in user_result)

    def test_change_user_role(
        self,
        repository,
        test_transaction
    ):
        """
        Test changing a user's role.
        """
        # Arrange
        user = UserFactory(role='user')
        
        # Act
        with transaction.atomic():
            updated_user = repository.change_user_role(user.id, 'admin')
        
        # Assert
        assert updated_user.role == 'admin'

    def test_get_user_by_username(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting a user by username.
        """
        # Arrange
        user = UserFactory(username='specific_user')
        
        # Act
        result = repository.get_user_by_username('specific_user')
        
        # Assert
        assert result.id == user.id
        assert result.username == 'specific_user'

    def test_get_user_by_email(
        self,
        repository,
        transactional_db_setup
    ):
        """
        Test getting a user by email.
        """
        # Arrange
        user = UserFactory(email='test@example.com')
        
        # Act
        result = repository.get_user_by_email('test@example.com')
        
        # Assert
        assert result.id == user.id
        assert result.email == 'test@example.com'

    def test_atomic_user_creation_with_profile(
        self,
        repository,
        test_transaction
    ):
        """
        Test atomic user creation with profile data.
        """
        # Arrange
        user_data = {
            'username': 'complete_user',
            'email': 'complete@example.com',
            'display_name': 'Complete User',
            'role': 'user'
        }
        
        # Act
        with transaction.atomic():
            user = repository.create_user(**user_data)
        
        # Assert
        saved_user = repository.get_user_by_id(user.id)
        assert saved_user.username == user_data['username']
        assert saved_user.display_name == user_data['display_name']
        assert saved_user.role == user_data['role']

    def test_concurrent_user_update(
        self,
        repository,
        nested_transaction
    ):
        """
        Test concurrent user update with transaction isolation.
        """
        # Arrange
        user = UserFactory(display_name="Original Name")
        
        # Act
        with transaction.atomic():
            # First update
            user.display_name = "First Update"
            user.save()
            
            # Simulate concurrent update
            with transaction.atomic():
                concurrent_user = User.objects.get(id=user.id)
                concurrent_user.display_name = "Second Update"
                concurrent_user.save()
        
        # Assert
        final_user = repository.get_user_by_id(user.id)
        assert final_user.display_name == "Second Update"