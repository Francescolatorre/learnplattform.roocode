from django.apps import AppConfig


class TasksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "tasks"
    label = "tasks"
    verbose_name = "Tasks"

    def ready(self):
        """
        Initialize app and register models.
        """
        try:
            import tasks.models  # noqa
        except ImportError:
            pass
