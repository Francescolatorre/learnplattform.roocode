from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Course(models.Model):
    """
    Represents a learning course in the platform
    """
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        PUBLISHED = 'PUBLISHED', _('Published')
        ARCHIVED = 'ARCHIVED', _('Archived')

    class Visibility(models.TextChoices):
        PRIVATE = 'PRIVATE', _('Private')
        PUBLIC = 'PUBLIC', _('Public')
        RESTRICTED = 'RESTRICTED', _('Restricted')

    title = models.CharField(
        _('Course Title'), 
        max_length=255
    )
    description = models.TextField(
        _('Course Description'), 
        blank=True
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='courses_instructed'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.DRAFT
    )
    visibility = models.CharField(
        max_length=20, 
        choices=Visibility.choices, 
        default=Visibility.PRIVATE
    )
    
    learning_objectives = models.TextField(
        _('Learning Objectives'), 
        blank=True
    )
    prerequisites = models.TextField(
        _('Prerequisites'), 
        blank=True
    )
    
    duration = models.DurationField(
        _('Course Duration'), 
        null=True, 
        blank=True
    )
    difficulty_level = models.CharField(
        max_length=50, 
        choices=[
            ('BEGINNER', _('Beginner')),
            ('INTERMEDIATE', _('Intermediate')),
            ('ADVANCED', _('Advanced'))
        ],
        default='BEGINNER'
    )
    
    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['difficulty_level']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_total_tasks(self):
        """
        Get the total number of tasks in the course
        """
        return self.learning_tasks.count()
    
    def is_accessible_by(self, user):
        """
        Check if the course is accessible by a given user
        """
        if self.visibility == self.Visibility.PUBLIC:
            return True
        
        if user.is_authenticated:
            if self.instructor == user:
                return True
            
            if self.visibility == self.Visibility.RESTRICTED:
                # Add logic for checking user's enrollment or permissions
                return False
        
        return False
