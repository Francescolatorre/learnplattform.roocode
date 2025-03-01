from django.conf import settings
from django.db import models

from courses.models import Course


class LearningModule(models.Model):
    """
    Represents a learning module within a course
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Learning Modules'

    def __str__(self):
        return str(self.title)

class LearningResource(models.Model):
    """
    Represents learning resources like documents, videos, etc.
    """
    RESOURCE_TYPES = [
        ('VIDEO', 'Video'),
        ('DOCUMENT', 'Document'),
        ('LINK', 'External Link'),
        ('QUIZ', 'Quiz'),
        ('ASSIGNMENT', 'Assignment')
    ]

    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    content_url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to='learning_resources/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Learning Resources'

    def __str__(self):
        return str(self.title)
