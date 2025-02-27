from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    """
    Extended User model with additional fields and methods
    """
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    def __str__(self):
        return self.username

class Course(models.Model):
    """
    Consolidated Course model with comprehensive attributes
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
        ('DEPRECATED', 'Deprecated')
    ]

    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='PRIVATE')
    learning_objectives = models.TextField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title

class Task(models.Model):
    """
    Generalized Task model supporting multiple task types
    """
    TASK_TYPES = [
        ('LEARNING', 'Learning Task'),
        ('QUIZ', 'Quiz'),
        ('ASSESSMENT', 'Assessment'),
        ('SUBMISSION', 'Submission')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tasks')
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateTimeField(null=True, blank=True)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    passing_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name_plural = 'Tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course', 'task_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title

class Submission(models.Model):
    """
    Submission model for tracking task submissions
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    content = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_graded = models.BooleanField(default=False)

    class Meta:
        unique_together = ['task', 'user']
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['task', 'user']),
            models.Index(fields=['submitted_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.task.title}"
