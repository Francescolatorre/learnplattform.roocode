from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LearningTask, QuizTask

@receiver(post_save, sender=LearningTask)
def learning_task_created(sender, instance, created, **kwargs):
    """
    Signal handler for when a learning task is created
    """
    if created:
        # Perform any initialization or logging when a learning task is created
        print(f"New Learning Task created: {instance.title}")

@receiver(post_save, sender=QuizTask)
def quiz_task_created(sender, instance, created, **kwargs):
    """
    Signal handler for when a quiz task is created
    """
    if created:
        # Perform any initialization or logging when a quiz task is created
        print(f"New Quiz Task created: {instance.title}")
