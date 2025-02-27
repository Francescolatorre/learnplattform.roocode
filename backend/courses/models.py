from django.db import models
from django.conf import settings

class Course(models.Model):
    class Status:
        DRAFT = 'DRAFT'
        PUBLISHED = 'PUBLISHED'
        ARCHIVED = 'ARCHIVED'
        DEPRECATED = 'DEPRECATED'
        
    class Visibility:
        PUBLIC = 'PUBLIC'
        PRIVATE = 'PRIVATE'
        
    STATUS_CHOICES = [
        (Status.DRAFT, 'Draft'),
        (Status.PUBLISHED, 'Published'),
        (Status.ARCHIVED, 'Archived'),
        (Status.DEPRECATED, 'Deprecated'),
    ]
    
    VISIBILITY_CHOICES = [
        (Visibility.PUBLIC, 'Public'),
        (Visibility.PRIVATE, 'Private'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=Status.DRAFT)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default=Visibility.PRIVATE)
    learning_objectives = models.TextField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)
    duration = models.DurationField(null=True, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced')
    ], default='BEGINNER')

    class Meta:
        app_label = 'courses'
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['difficulty_level']),
        ]

    def __str__(self) -> str:
        return str(self.title)

    def is_accessible_by(self, user):
        """
        Check if the course is accessible by a given user
        """
        if self.visibility == self.Visibility.PUBLIC:
            return True
        return self.instructor == user
