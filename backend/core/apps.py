"""
Core application configuration for the Learning Platform.

This module configures the core Django application that handles the primary
functionality of the learning platform, including:
- User management and authentication
- Course and content management
- Progress tracking and assessment
- API endpoints and permissions

The core app serves as the central component of the platform, managing
database models, business logic, and API interfaces.
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """
    Configuration class for the core Learning Platform application.

    This class handles the application's configuration, including:
    - Model registration
    - Signal registration
    - Application initialization
    - Database configuration
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        """
        Performs initialization tasks when the application is ready.

        This method:
        - Registers signal handlers
        - Initializes custom model fields
        - Sets up logging configuration
        """
        # Import signals here to avoid import cycle
        import core.signals  # noqa
