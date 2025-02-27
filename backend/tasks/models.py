from django.db import models
from django.conf import settings
from courses.models import Course

class LearningTask(models.Model):
    """
    Specialized Learning Task model with comprehensive attributes
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived')
    ]

    DIFFICULTY_LEVELS = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced')
    ]

    title = models.CharField(max_length=255, verbose_name="Task Title")
    description = models.TextField(verbose_name="Task Description", blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='learning_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='BEGINNER')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    
    max_submissions = models.PositiveIntegerField(verbose_name="Maximum Submissions", blank=True, null=True)
    deadline = models.DateTimeField(verbose_name="Task Deadline", blank=True, null=True)
    
    class Meta:
        verbose_name = "Learning Task"
        verbose_name_plural = "Learning Tasks"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['deadline']),
        ]

    def __str__(self):
        return str(self.title)

class AssessmentTask(LearningTask):
    """
    Abstract base class for assessment tasks
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
    Model representing a quiz task
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
        return str(self.title)
