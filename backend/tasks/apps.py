from django.apps import AppConfig


class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasks'
    verbose_name = 'Learning Tasks'

    def ready(self):
        # Conditionally import signals to avoid circular imports
        try:
            import tasks.signals  # Optional: create this file if you need signals
        except ImportError:
            pass
