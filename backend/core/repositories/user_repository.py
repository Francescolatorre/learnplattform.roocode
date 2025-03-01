"""
Repository for user-related database operations.
"""
from typing import List, Optional

from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction

User = get_user_model()

class UserRepository:
    """
    Handles database operations for users.
    """

    def get_users(self):
        """
        Retrieves all users.

        Returns:
            QuerySet[User]: A queryset of all users.
        """
        return User.objects.all()

    def get_user_by_id(self, user_id: int) -> User:
        """
        Retrieves a specific user by ID.

        Args:
            user_id (int): The ID of the user.

        Returns:
            User: The requested user.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
        """
        return User.objects.get(id=user_id)

    def get_user_by_username(self, username: str) -> User:
        """
        Retrieves a user by username.

        Args:
            username (str): The username to search for.

        Returns:
            User: The requested user.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
        """
        return User.objects.get(username=username)

    def get_user_by_email(self, email: str) -> User:
        """
        Retrieves a user by email.

        Args:
            email (str): The email to search for.

        Returns:
            User: The requested user.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
        """
        return User.objects.get(email=email)

    def create_user(self, **user_data) -> User:
        """
        Creates a new user.

        Args:
            **user_data: User fields including username, email,
                        display_name, and role.

        Returns:
            User: The created user.
        """
        return User.objects.create_user(**user_data)

    def update_user(self, user_id: int, **updates) -> User:
        """
        Updates a user.

        Args:
            user_id (int): The ID of the user to update.
            **updates: Fields to update.

        Returns:
            User: The updated user.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
        """
        user = self.get_user_by_id(user_id)
        for field, value in updates.items():
            setattr(user, field, value)
        user.save()
        return user

    def delete_user(self, user_id: int) -> None:
        """
        Deletes a user.

        Args:
            user_id (int): The ID of the user to delete.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
        """
        user = self.get_user_by_id(user_id)
        user.delete()

    def get_users_by_role(self, role: str):
        """
        Retrieves users by role.

        Args:
            role (str): The role to filter by ('admin' or 'user').

        Returns:
            QuerySet[User]: Users with the specified role.
        """
        return User.objects.filter(role=role)

    def change_user_role(self, user_id: int, new_role: str) -> User:
        """
        Changes a user's role.

        Args:
            user_id (int): The ID of the user.
            new_role (str): The new role ('admin' or 'user').

        Returns:
            User: The updated user.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
            ValueError: If the role is invalid.
        """
        if new_role not in ['admin', 'user']:
            raise ValueError("Invalid role. Must be 'admin' or 'user'.")
        
        return self.update_user(user_id, role=new_role)

    @transaction.atomic
    def bulk_create_users(self, user_data_list: List[dict]) -> List[User]:
        """
        Creates multiple users in a single transaction.

        Args:
            user_data_list (List[dict]): List of user data dictionaries.

        Returns:
            List[User]: List of created user instances.
        """
        created_users = []
        for user_data in user_data_list:
            user = self.create_user(**user_data)
            created_users.append(user)
        return created_users

    def get_users_by_criteria(self, **filters):
        """
        Retrieves users based on multiple criteria.

        Args:
            **filters: Filter criteria to apply.

        Returns:
            QuerySet[User]: Users matching the criteria.
        """
        return User.objects.filter(**filters)

    def get_active_users(self):
        """
        Retrieves all active users.

        Returns:
            QuerySet[User]: Active users.
        """
        return User.objects.filter(is_active=True)

    def deactivate_user(self, user_id: int) -> User:
        """
        Deactivates a user account.

        Args:
            user_id (int): The ID of the user to deactivate.

        Returns:
            User: The deactivated user.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
        """
        return self.update_user(user_id, is_active=False)

    def activate_user(self, user_id: int) -> User:
        """
        Activates a user account.

        Args:
            user_id (int): The ID of the user to activate.

        Returns:
            User: The activated user.

        Raises:
            ObjectDoesNotExist: If the user doesn't exist.
        """
        return self.update_user(user_id, is_active=True)