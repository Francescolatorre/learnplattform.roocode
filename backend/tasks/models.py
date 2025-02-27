import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from typing import Optional, Union

class BaseTask(models.Model):
    """
    Abstract base class for all task types in the system.
    """
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    title = models.CharField(
        _('Task Title'), 
        max_length=255
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
    Task specific to learning activities with comprehensive metadata.
    """
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        PUBLISHED = 'PUBLISHED', _('Published')
        ARCHIVED = 'ARCHIVED', _('Archived')

    course = models.ForeignKey(
        'courses.Course', 
        on_delete=models.CASCADE, 
        related_name='tasks',
        verbose_name=_('Course')
    )
    status = models.CharField(
        _('Task Status'),
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    max_submissions = models.PositiveIntegerField(
        _('Maximum Submissions'),
        null=True,
        blank=True
    )
    deadline = models.DateTimeField(
        _('Task Deadline'),
        null=True,
        blank=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tasks',
        verbose_name=_('Created By')
    )
    difficulty_level = models.CharField(
        _('Difficulty Level'), 
        max_length=50, 
        blank=True
    )

    objects: models.Manager = models.Manager()

    class Meta:
        verbose_name = _('Learning Task')
        verbose_name_plural = _('Learning Tasks')
        indexes = [
            models.Index(fields=['course', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['deadline'])
        ]

# Existing models remain unchanged
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
