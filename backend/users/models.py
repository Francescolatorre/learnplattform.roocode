from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom User model with additional fields and configurations
    """
    email = models.EmailField(
        _('Email Address'), 
        unique=True
    )
    
    # Optional profile fields
    bio = models.TextField(
        _('Bio'), 
        blank=True
    )
    
    # User roles and permissions
    is_instructor = models.BooleanField(
        _('Instructor Status'), 
        default=False
    )
    is_student = models.BooleanField(
        _('Student Status'), 
        default=True
    )
    
    # Profile picture (requires Pillow)
    profile_picture = models.ImageField(
        _('Profile Picture'), 
        upload_to='profile_pictures/', 
        null=True, 
        blank=True
    )
    
    # Additional user tracking
    date_joined = models.DateTimeField(
        _('Date Joined'), 
        auto_now_add=True
    )
    last_activity = models.DateTimeField(
        _('Last Activity'), 
        null=True, 
        blank=True
    )
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['is_instructor', 'is_student']),
        ]
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = f'{self.first_name} {self.last_name}'.strip()
        return full_name or self.username
    
    def get_short_name(self):
        """
        Return the short name for the user.
        """
        return self.first_name or self.username
    
    def get_courses_created(self):
        """
        Get courses created by the user
        """
        return self.courses_instructed.all()
    
    def get_tasks_created(self):
        """
        Get tasks created by the user
        """
        return self.created_tasks.all()
    
    def get_submissions(self):
        """
        Get user's submissions
        """
        return self.assessment_submissions.all()
