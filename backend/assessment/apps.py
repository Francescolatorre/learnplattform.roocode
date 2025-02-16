from django.apps import AppConfig


class AssessmentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "assessment"
    label = "assessment"
    verbose_name = "Assessment"

    def ready(self):
        """
        Initialize app and register models.
        """
        try:
            import assessment.models  # noqa
        except ImportError:
            pass
