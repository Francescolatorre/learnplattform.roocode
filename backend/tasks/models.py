from django.db import models
from backend.courses.models import Course # Corrected import
from backend.users.models import User # Corrected import
import uuid

class LearningTask(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Task Title")
    description = models.TextField(verbose_name="Task Description", blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tasks', verbose_name="Course")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT', verbose_name="Task Status")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks', verbose_name="Created By")
    max_submissions = models.PositiveIntegerField(verbose_name="Maximum Submissions", blank=True, null=True)
    deadline = models.DateTimeField(verbose_name="Task Deadline", blank=True, null=True)
    difficulty_level = models.CharField(max_length=50, verbose_name="Difficulty Level", blank=True)

    class Meta:
        verbose_name = "Learning Task"
        verbose_name_plural = "Learning Tasks"
        indexes = [
            models.Index(fields=['course', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['deadline']),
        ]

    def __str__(self):
        return self.title


class AssessmentTask(LearningTask):
    """
    Abstract base class for assessment tasks.
    """
    class Meta:
        abstract = True

    max_score = models.DecimalField(
        verbose_name="Maximum Score",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    passing_score = models.DecimalField(
        verbose_name="Passing Score",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )


class QuizTask(AssessmentTask):
    """
    Model representing a quiz task, which is a type of assessment task.
    """
    time_limit = models.IntegerField(
        verbose_name="Time Limit (minutes)",
        blank=True,
        null=True
    )
    is_randomized = models.BooleanField(
        verbose_name="Randomize Question Order",
        default=False
    )

    def __str__(self):
        return self.title
