"""Signal handlers for the core app."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models import User, Course


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """Handle post-save signal for User model."""
    if created:
        # Add any user post-creation logic here if needed
        pass


@receiver(post_save, sender=Course)
def course_post_save(sender, instance, created, **kwargs):
    """Handle post-save signal for Course model."""
    if created:
        # Add any course post-creation logic here if needed
        pass
