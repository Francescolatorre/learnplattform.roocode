"""
Custom exception handling for the Learning Platform.

This module provides centralized exception handling functionality for the entire
platform, ensuring consistent error responses across all API endpoints. It includes:
- Custom exception classes for domain-specific errors
- Standardized error response formatting
- Detailed logging of errors
- HTTP status code mapping
"""

import logging

from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class LearningPlatformException(APIException):
    """
    Base exception class for Learning Platform specific errors.

    All custom exceptions in the platform should inherit from this class
    to ensure consistent error handling and response formatting.

    Attributes:
        status_code: HTTP status code to return
        default_detail: Default error message
        default_code: Default error code for API responses
    """

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "An unexpected error occurred."
    default_code = "error"


class EnrollmentException(LearningPlatformException):
    """
    Exception for course enrollment related errors.

    Used when enrollment operations fail due to business rules
    or validation issues.

    Examples:
        - Student already enrolled
        - Course full
        - Prerequisites not met
    """

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Course enrollment failed."
    default_code = "enrollment_error"


class QuizSubmissionException(LearningPlatformException):
    """
    Exception for quiz submission related errors.

    Used when quiz submissions fail validation or violate
    quiz attempt rules.

    Examples:
        - Time limit exceeded
        - Maximum attempts reached
        - Invalid answer format
    """

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Quiz submission failed."
    default_code = "quiz_error"


def custom_exception_handler(exc, context=None):
    """
    Custom exception handler for consistent API error responses.

    Handles both DRF exceptions and custom platform exceptions,
    ensuring consistent error response format and logging.

    Args:
        exc: The caught exception
        context: Additional context about the error

    Returns:
        Response: A consistent error response object

    Example response format:
        {
            "error": {
                "code": "enrollment_error",
                "message": "Student is already enrolled in this course",
                "details": {...}  # Optional additional error details
            }
        }
    """
    # Get the standard DRF exception response first
    response = exception_handler(exc, context)

    if response is None:
        # Handle Django's ValidationError
        if isinstance(exc, ValidationError):
            data = {
                "error": {
                    "code": "validation_error",
                    "message": str(exc),
                    "details": (
                        exc.message_dict if hasattr(exc, "message_dict") else None
                    ),
                }
            }
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        # Handle database integrity errors
        if isinstance(exc, IntegrityError):
            data = {
                "error": {
                    "code": "database_error",
                    "message": "Database integrity error occurred.",
                    "details": str(exc),
                }
            }
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        # Handle any other unexpected exceptions
        logger.error("Unhandled exception occurred: %s", str(exc), exc_info=True)
        data = {
            "error": {
                "code": "server_error",
                "message": "An unexpected error occurred.",
                "details": str(exc) if not isinstance(exc, Exception) else None,
            }
        }
        return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Standardize the error response format
    if hasattr(exc, "get_full_details"):
        details = exc.get_full_details()
    else:
        details = {"detail": str(exc)}

    response.data = {
        "error": {
            "code": getattr(exc, "default_code", "error"),
            "message": str(exc),
            "details": details,
        }
    }

    # Log the error with appropriate severity
    if response.status_code >= 500:
        logger.error("Server error occurred: %s", str(exc), exc_info=True)
    else:
        logger.warning("Client error occurred: %s", str(exc))

    return response
