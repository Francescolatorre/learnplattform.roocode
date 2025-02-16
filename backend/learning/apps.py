from django.apps import AppConfig


class LearningConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "learning"
    label = "learning"
    verbose_name = "Learning"

    def ready(self):
        """
        Initialize app and register models.
        """
        try:
            import learning.models  # noqa
        except ImportError:
            pass
