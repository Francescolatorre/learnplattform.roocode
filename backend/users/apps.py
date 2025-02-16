"""
Users app configuration.
"""
from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Configuration for the users app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'Users'

    def ready(self):
        """
        Perform initialization when the app is ready.
        Import signals here to avoid circular imports.
        """
        try:
            import users.signals  # noqa
        except ImportError:
            pass
