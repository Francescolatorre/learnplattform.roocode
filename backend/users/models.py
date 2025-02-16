"""
Custom user model for the learning platform.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """Custom user model extending Django's AbstractUser."""
    
    ROLE_CHOICES = [
        ('admin', _('Admin')),
        ('instructor', _('Instructor')),
        ('student', _('Student')),
        ('user', _('User')),
    ]

    email = models.EmailField(
        _('Email Address'),
        unique=True,
        error_messages={
            'unique': _('A user with that email already exists.'),
        }
    )
    display_name = models.CharField(
        _('Display Name'),
        max_length=100,
        blank=True
    )
    role = models.CharField(
        _('User Role'),
        max_length=20,
        choices=ROLE_CHOICES,
        default='user'
    )
    is_active = models.BooleanField(
        _('Active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')

    def __str__(self):
        """Return string representation of the user."""
        return self.display_name or self.username or self.email

    def get_full_name(self):
        """Return the user's full name."""
        return self.display_name or super().get_full_name() or self.username

    def get_short_name(self):
        """Return the user's short name."""
        return self.display_name or self.username
