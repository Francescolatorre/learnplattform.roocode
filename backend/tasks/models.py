from django.db import models
from django.utils.translation import gettext_lazy as _
from typing import Optional, Union

class BaseTask(models.Model):
    """
    Abstract base class for all task types in the system.
    """
    title = models.CharField(
        _('Task Title'), 
        max_length=200
    )
    description = models.TextField(
        _('Task Description'), 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True
        app_label = 'tasks'

    def __str__(self) -> str:
        return str(self.title) if self.title else ''

class LearningTask(BaseTask):
    """
    Task specific to learning activities.
    """
    difficulty_level = models.CharField(
        _('Difficulty Level'), 
        max_length=50, 
        blank=True
    )

    objects: models.Manager = models.Manager()

class AssessmentTask(BaseTask):
    """
    Task used for assessment and grading.
    """
    max_score = models.DecimalField(
        _('Maximum Score'), 
        max_digits=5, 
        decimal_places=2, 
        null=True,
        blank=True
    )
    passing_score = models.DecimalField(
        _('Passing Score'), 
        max_digits=5, 
        decimal_places=2, 
        null=True,
        blank=True
    )

    objects: models.Manager = models.Manager()

class QuizTask(AssessmentTask):
    """
    Specialized task for quiz-based assessments.
    """
    time_limit = models.IntegerField(
        _('Time Limit (minutes)'), 
        null=True,
        blank=True
    )
    is_randomized = models.BooleanField(
        _('Randomize Question Order'), 
        default=False
    )

    objects: models.Manager = models.Manager()
