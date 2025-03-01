import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)

class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"
    label = "platform_core"  # Changed to unique label
    verbose_name = "Core"

    def ready(self):
        """
        Initialize app and register models.
        """
        try:
            import core.models  # noqa
            import core.repositories  # noqa
            import core.services  # noqa
        except ImportError as e:
            logger.error(f"ImportError in CoreConfig.ready: {e}")
