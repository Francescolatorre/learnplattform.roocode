"""
Base ViewSet classes for the Learning Platform.

This module provides base ViewSet classes that implement common functionality
used across the platform's API endpoints. It includes features like:
- Standard CRUD operations
- Consistent error handling
- Logging integration
- Permission enforcement
- Query optimization
"""

import logging

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.response import Response

from .exception_handler import custom_exception_handler

logger = logging.getLogger(__name__)


class BaseViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet class providing common functionality for all platform ViewSets.

    Features:
    - Automatic logging of all operations
    - Transaction management
    - Standard error handling
    - Query optimization support

    All ViewSets in the platform should inherit from this base class to ensure
    consistent behavior and proper logging.
    """

    def _is_admin_or_instructor(self, user):
        """Safely check if user is admin or instructor."""
        user_role = getattr(user, "role", "")
        is_staff = getattr(user, "is_staff", False)
        return user_role in ["admin", "instructor"] or is_staff

    def get_queryset(self):
        """
        Get the base queryset for the ViewSet.

        Override this method to:
        - Add select_related/prefetch_related optimizations
        - Apply user-specific filters
        - Handle custom ordering

        Returns:
            QuerySet: The base queryset for the ViewSet
        """
        # Handle schema generation for Swagger
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()

        # Handle AnonymousUser
        if isinstance(self.request.user, AnonymousUser):
            return self.queryset.none()

        # Admins and instructors can see all data
        if self._is_admin_or_instructor(self.request.user):
            return self.queryset

        # Regular users can only see their own data
        return self.queryset.filter(user=self.request.user)

    def filter_queryset_by_params(self, queryset, params):
        """
        Filter the queryset based on provided query parameters.
        """
        for key, value in params.items():
            if value:
                queryset = queryset.filter(**{key: value})
        return queryset

    def perform_create(self, serializer):
        """
        Perform creation of a model instance.

        Wraps creation in a transaction and adds logging.

        Args:
            serializer: The serializer instance containing validated data
        """
        try:
            with transaction.atomic():
                instance = serializer.save()
                logger.info(
                    "Created %s instance with ID %s",
                    self.serializer_class.Meta.model.__name__,
                    instance.id,
                )
        except Exception as e:
            logger.error(
                "Error creating %s: %s",
                self.serializer_class.Meta.model.__name__,
                str(e),
            )
            raise

    def perform_update(self, serializer):
        """
        Perform update of a model instance.

        Wraps update in a transaction and adds logging.

        Args:
            serializer: The serializer instance containing validated data
        """
        try:
            with transaction.atomic():
                instance = serializer.save()
                logger.info(
                    "Updated %s instance with ID %s",
                    self.serializer_class.Meta.model.__name__,
                    instance.id,
                )
        except Exception as e:
            logger.error(
                "Error updating %s: %s",
                self.serializer_class.Meta.model.__name__,
                str(e),
            )
            raise

    def perform_destroy(self, instance):
        """
        Perform deletion of a model instance.

        Wraps deletion in a transaction and adds logging.

        Args:
            instance: The model instance to delete
        """
        try:
            with transaction.atomic():
                instance_id = instance.id
                instance.delete()
                logger.info(
                    "Deleted %s instance with ID %s",
                    self.__class__.serializer_class.Meta.model.__name__,
                    instance_id,
                )
        except Exception as e:
            logger.error(
                "Error deleting %s: %s",
                self.__class__.serializer_class.Meta.model.__name__,
                str(e),
            )
            raise

    def handle_exception(self, exc):
        """
        Handle exceptions that occur during ViewSet operations.

        Provides consistent error handling across all ViewSets.

        Args:
            exc: The exception that occurred

        Returns:
            Response: An appropriate error response
        """
        if isinstance(exc, ValidationError):
            logger.warning(
                "Validation error in %s: %s", self.__class__.__name__, str(exc)
            )
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        logger.error("Unexpected error in %s: %s", self.__class__.__name__, str(exc))
        return custom_exception_handler(exc)


class ReadOnlyBaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Base ViewSet for read-only endpoints.

    Provides the same logging and error handling as BaseViewSet,
    but only allows read operations (list and retrieve).

    Use this class for ViewSets that should not allow modification
    of their models.
    """

    def get_queryset(self):
        """
        Get the base queryset for the ViewSet.

        Override this method to:
        - Add select_related/prefetch_related optimizations
        - Apply user-specific filters
        - Handle custom ordering

        Returns:
            QuerySet: The base queryset for the ViewSet
        """
        queryset = super().get_queryset()

        logger.debug(
            "Executing read-only queryset for %s: %s",
            self.__class__.__name__,
            str(queryset.query),
        )

        return queryset

    def handle_exception(self, exc):
        """
        Handle exceptions that occur during ViewSet operations.

        Provides consistent error handling across all ViewSets.

        Args:
            exc: The exception that occurred

        Returns:
            Response: An appropriate error response
        """
        logger.error(
            "Error in read-only viewset %s: %s", self.__class__.__name__, str(exc)
        )
        return custom_exception_handler(exc)
